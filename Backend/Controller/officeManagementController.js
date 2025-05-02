const db = require('../db/dbconnect');

// Get all offices
exports.getAllOffices = async (req, res) => {
  try {
    // Query to get all offices
    const result = await db.query(
      'SELECT office_id, office_name, office_code, office_description as description, office_location as location, phone_number as phone, email, status as is_active FROM tbl_offices ORDER BY office_name'
    );
    
    // Safely extract the results
    let offices = [];
    if (Array.isArray(result)) {
      if (result.length > 0 && Array.isArray(result[0])) {
        offices = result[0]; // For [rows, fields] format
      } else {
        offices = result; // For direct rows result
      }
    } else if (result && typeof result === 'object') {
      if (result.length > 0) {
        offices = result; // For array-like object
      } else if (result.rows) {
        offices = result.rows; // For MySQL2 format
      }
    }
    
    // Map boolean values for is_active
    offices = offices.map(office => ({
      ...office,
      is_active: office.is_active === 'active' || office.is_active === 1
    }));
    
    return res.status(200).json(offices);
  } catch (error) {
    console.error('Error getting offices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get offices',
      error: error.message
    });
  }
};

// Get single office by ID
exports.getOfficeById = async (req, res) => {
  try {
    const officeId = req.params.id;
    const [office] = await db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId]);
    
    if (office.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    // Get employees assigned to this office
    const [employees] = await db.query(`
      SELECT e.employee_id, e.first_name, e.last_name, e.position, e.department, eo.assignment_date, eo.status
      FROM tbl_employee_offices eo
      JOIN tbl_employeeinformation e ON eo.employee_id = e.employee_id
      WHERE eo.office_id = ?
    `, [officeId]);
    
    res.status(200).json({
      success: true,
      data: {
        office: office[0],
        employees: employees
      }
    });
  } catch (error) {
    console.error('Error getting office details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve office details',
      error: error.message
    });
  }
};

// Create new office
// Create new office - FIXED VERSION
exports.createOffice = async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    const { 
      office_name, 
      office_code, 
      office_description, 
      office_location, 
      phone_number, 
      email,
      status,
      employee_assignments
    } = req.body;
    
    // Validate required fields
    if (!office_name || !office_code) {
      return res.status(400).json({
        success: false,
        message: 'Office name and code are required'
      });
    }
    
    try {
      // Check if office code already exists - using direct boolean check
      const existingOfficeQuery = 'SELECT 1 FROM tbl_offices WHERE office_code = ? LIMIT 1';
      const existingOfficeParams = [office_code];
      const existingOfficeResult = await db.query(existingOfficeQuery, existingOfficeParams);
      
      // Check if any result was returned
      const officeExists = existingOfficeResult && 
                         ((Array.isArray(existingOfficeResult) && existingOfficeResult.length > 0 && existingOfficeResult[0].length > 0) ||
                         (!Array.isArray(existingOfficeResult) && existingOfficeResult.length > 0));
      
      if (officeExists) {
        return res.status(400).json({
          success: false,
          message: 'Office code already exists'
        });
      }
      
      // Insert the new office directly without transaction for now
      // (we'll add transaction back once we understand the driver behavior)
      const insertQuery = `
        INSERT INTO tbl_offices 
        (office_name, office_code, office_description, office_location, phone_number, email, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const insertParams = [
        office_name, 
        office_code, 
        office_description || null, 
        office_location || null, 
        phone_number || null, 
        email || null, 
        status || 'active'
      ];
      
      // Perform the insert
      await db.query(insertQuery, insertParams);
      console.log('Office inserted successfully');
      
      // Since we're having trouble getting the insert ID, let's query for the office we just inserted
      // We'll order by office_id DESC to get the most recently added office with this code
      const getOfficeQuery = 'SELECT office_id FROM tbl_offices WHERE office_code = ? ORDER BY office_id DESC LIMIT 1';
      const getOfficeParams = [office_code];
      const getOfficeResult = await db.query(getOfficeQuery, getOfficeParams);
      
      console.log('Get office result:', getOfficeResult);
      
      // Try to extract the office ID from different possible result formats
      let officeId = null;
      
      // Log detailed structure to diagnose
      console.log('Get office result type:', typeof getOfficeResult);
      console.log('Get office result is array:', Array.isArray(getOfficeResult));
      
      if (Array.isArray(getOfficeResult)) {
        console.log('Array length:', getOfficeResult.length);
        if (getOfficeResult.length > 0) {
          console.log('First element:', getOfficeResult[0]);
          // Handle case where result is [rows, fields]
          if (Array.isArray(getOfficeResult[0]) && getOfficeResult[0].length > 0) {
            console.log('Found in format [rows, fields]. First row:', getOfficeResult[0][0]);
            officeId = getOfficeResult[0][0].office_id;
          } 
          // Handle case where result is [rowsObject]
          else if (getOfficeResult[0] && typeof getOfficeResult[0] === 'object') {
            console.log('Found in format [rowsObject]');
            if (getOfficeResult[0].office_id) {
              officeId = getOfficeResult[0].office_id;
            } else if (getOfficeResult[0][0] && getOfficeResult[0][0].office_id) {
              officeId = getOfficeResult[0][0].office_id;
            }
          }
        }
      } 
      // Handle case where result is directly the rows
      else if (getOfficeResult && typeof getOfficeResult === 'object') {
        console.log('Object properties:', Object.keys(getOfficeResult));
        
        // Direct row object
        if (getOfficeResult.office_id) {
          console.log('Found in direct object');
          officeId = getOfficeResult.office_id;
        }
        // Array-like object with length property
        else if (getOfficeResult.length && getOfficeResult.length > 0) {
          console.log('Found in array-like object');
          if (getOfficeResult[0] && getOfficeResult[0].office_id) {
            officeId = getOfficeResult[0].office_id;
          }
        }
        // MySQL2 format with nested rows
        else if (getOfficeResult.rows && getOfficeResult.rows.length > 0) {
          console.log('Found in MySQL2 format');
          officeId = getOfficeResult.rows[0].office_id;
        }
      }
      
      console.log('Final extracted office_id:', officeId);
      
      // If we still can't get the office ID, use a raw low-level query as last resort
      if (officeId === null || officeId === undefined) {
        console.log('Trying one last method with raw query');
        // This is a very direct way that should work with most drivers
        const rawQuery = await db.query(`SELECT LAST_INSERT_ID() as id`);
        console.log('Raw query result:', rawQuery);
        
        if (Array.isArray(rawQuery) && rawQuery.length > 0) {
          if (Array.isArray(rawQuery[0]) && rawQuery[0].length > 0) {
            officeId = rawQuery[0][0].id;
          } else if (rawQuery[0] && rawQuery[0].id) {
            officeId = rawQuery[0].id;
          }
        } else if (rawQuery && typeof rawQuery === 'object') {
          if (rawQuery.id) {
            officeId = rawQuery.id;
          } else if (rawQuery.rows && rawQuery.rows[0] && rawQuery.rows[0].id) {
            officeId = rawQuery.rows[0].id;
          }
        }
        
        console.log('Last resort office_id:', officeId);
      }
      
      // If still no office ID, provide a fallback solution
      if (officeId === null || officeId === undefined) {
        console.log('WARNING: Could not determine office ID. Using fallback approach.');
        // In this fallback scenario, we'll proceed without the office ID
        // This isn't ideal but allows the system to continue functioning
        
        res.status(201).json({
          success: true,
          message: 'Office created successfully, but could not retrieve the office ID',
          data: {
            office_name,
            office_code,
            warning: 'Office ID could not be determined. Employee assignments may not have been processed.'
          }
        });
        return;
      }
      
      // Process employee assignments if provided
      if (employee_assignments && Array.isArray(employee_assignments) && employee_assignments.length > 0) {
        console.log(`Processing ${employee_assignments.length} employee assignments`);
        
        for (const assignment of employee_assignments) {
          const assignmentQuery = `
            INSERT INTO tbl_employee_offices 
            (employee_id, office_id, assignment_date, is_primary) 
            VALUES (?, ?, ?, ?)
          `;
          const assignmentParams = [
            assignment.employee_id,
            officeId,
            assignment.assignment_date || new Date().toISOString().split('T')[0],
            assignment.is_primary ? 1 : 0
          ];
          
          await db.query(assignmentQuery, assignmentParams);
        }
        
        console.log('All employee assignments processed successfully');
      }
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Office created successfully',
        data: {
          office_id: officeId,
          office_name,
          office_code
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating office:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create office',
      error: error.message
    });
  }
};
// Update office
exports.updateOffice = async (req, res) => {
  try {
    const officeId = req.params.id;
    const { 
      office_name, 
      office_code, 
      office_description, 
      office_location, 
      phone_number, 
      email,
      status 
    } = req.body;
    
    // Validate required fields
    if (!office_name || !office_code) {
      return res.status(400).json({
        success: false,
        message: 'Office name and code are required'
      });
    }
    
    // Check if office exists
    const [existingOffice] = await db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId]);
    if (existingOffice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    // Check if office code already exists (excluding the current office)
    const [duplicateCode] = await db.query(
      'SELECT * FROM tbl_offices WHERE office_code = ? AND office_id != ?', 
      [office_code, officeId]
    );
    
    if (duplicateCode.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Office code already exists'
      });
    }
    
    // Update office
    await db.query(
      `UPDATE tbl_offices 
       SET office_name = ?, office_code = ?, office_description = ?, 
           office_location = ?, phone_number = ?, email = ?, status = ?
       WHERE office_id = ?`,
      [office_name, office_code, office_description, office_location, phone_number, email, status || 'active', officeId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Office updated successfully'
    });
  } catch (error) {
    console.error('Error updating office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update office',
      error: error.message
    });
  }
};

// Delete office
exports.deleteOffice = async (req, res) => {
  try {
    const officeId = req.params.id;
    
    // Check if office exists
    const [existingOffice] = await db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId]);
    if (existingOffice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    try {
      // Check if office has employee assignments
      const [assignments] = await db.query('SELECT * FROM tbl_employee_offices WHERE office_id = ?', [officeId]);
      
      // If assignments exist, delete them first
      if (assignments.length > 0) {
        await db.query('DELETE FROM tbl_employee_offices WHERE office_id = ?', [officeId]);
      }
      
      // Then delete the office
      await db.query('DELETE FROM tbl_offices WHERE office_id = ?', [officeId]);
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.status(200).json({
        success: true,
        message: 'Office deleted successfully'
      });
    } catch (error) {
      // Rollback transaction in case of error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete office',
      error: error.message
    });
  }
};

// Get office statistics
exports.getOfficeStats = async (req, res) => {
  try {
    // Get count of offices by status
    const [statusStats] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM tbl_offices 
      GROUP BY status
    `);
    
    // Get office with most employees
    const [officeWithMostEmployees] = await db.query(`
      SELECT o.office_id, o.office_name, COUNT(eo.employee_id) as employee_count
      FROM tbl_offices o
      LEFT JOIN tbl_employee_offices eo ON o.office_id = eo.office_id
      GROUP BY o.office_id, o.office_name
      ORDER BY employee_count DESC
      LIMIT 1
    `);
    
    // Get total number of offices
    const [totalOffices] = await db.query('SELECT COUNT(*) as total FROM tbl_offices');
    
    res.status(200).json({
      success: true,
      data: {
        totalOffices: totalOffices[0].total,
        statusBreakdown: statusStats,
        officeWithMostEmployees: officeWithMostEmployees[0] || null
      }
    });
  } catch (error) {
    console.error('Error getting office statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve office statistics',
      error: error.message
    });
  }
};

// Search offices
exports.searchOffices = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const searchTerm = `%${query}%`;
    
    const [results] = await db.query(`
      SELECT * FROM tbl_offices 
      WHERE office_name LIKE ? 
      OR office_code LIKE ? 
      OR office_description LIKE ?
      OR office_location LIKE ?
      ORDER BY office_name ASC
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching offices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search offices',
      error: error.message
    });
  }
};

// Update office status
exports.updateOfficeStatus = async (req, res) => {
  try {
    const officeId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, or suspended)'
      });
    }
    
    // Check if office exists
    const [existingOffice] = await db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId]);
    if (existingOffice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    // Update office status
    await db.query('UPDATE tbl_offices SET status = ? WHERE office_id = ?', [status, officeId]);
    
    res.status(200).json({
      success: true,
      message: `Office status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating office status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update office status',
      error: error.message
    });
  }
};

// Assign employees to office
exports.assignEmployeesToOffice = async (req, res) => {
  try {
    const officeId = req.params.id;
    const { employee_assignments } = req.body;
    
    if (!employee_assignments || !Array.isArray(employee_assignments) || employee_assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee assignments are required'
      });
    }
    
    // Check if office exists
    const [existingOffice] = await db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId]);
    if (existingOffice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    try {
      // Process each assignment
      for (const assignment of employee_assignments) {
        if (!assignment.employee_id) {
          throw new Error('Employee ID is required for each assignment');
        }
        
        // Check if employee exists
        const [existingEmployee] = await db.query(
          'SELECT * FROM tbl_employeeinformation WHERE employee_id = ?', 
          [assignment.employee_id]
        );
        
        if (existingEmployee.length === 0) {
          throw new Error(`Employee with ID ${assignment.employee_id} not found`);
        }
        
        // Check if assignment already exists
        const [existingAssignment] = await db.query(
          'SELECT * FROM tbl_employee_offices WHERE employee_id = ? AND office_id = ?',
          [assignment.employee_id, officeId]
        );
        
        if (existingAssignment.length > 0) {
          // Update existing assignment
          await db.query(
            'UPDATE tbl_employee_offices SET assignment_date = ?, is_primary = ?, status = ? WHERE employee_id = ? AND office_id = ?',
            [
              assignment.assignment_date || new Date().toISOString().split('T')[0],
              assignment.is_primary ? 1 : 0,
              assignment.status || 'active',
              assignment.employee_id,
              officeId
            ]
          );
        } else {
          // Create new assignment
          await db.query(
            'INSERT INTO tbl_employee_offices (employee_id, office_id, assignment_date, is_primary, status) VALUES (?, ?, ?, ?, ?)',
            [
              assignment.employee_id,
              officeId,
              assignment.assignment_date || new Date().toISOString().split('T')[0],
              assignment.is_primary ? 1 : 0,
              assignment.status || 'active'
            ]
          );
        }
        
        // If this is primary office, update any other primary offices for this employee
        if (assignment.is_primary) {
          await db.query(
            'UPDATE tbl_employee_offices SET is_primary = 0 WHERE employee_id = ? AND office_id != ?',
            [assignment.employee_id, officeId]
          );
        }
      }
      
      // Commit transaction
      await db.query('COMMIT');
      
      res.status(200).json({
        success: true,
        message: 'Employees assigned to office successfully'
      });
    } catch (error) {
      // Rollback transaction in case of error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error assigning employees to office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employees to office',
      error: error.message
    });
  }
};

// Remove employee from office
exports.removeEmployeeFromOffice = async (req, res) => {
  try {
    const officeId = req.params.officeId;
    const employeeId = req.params.employeeId;
    
    // Check if assignment exists
    const [existingAssignment] = await db.query(
      'SELECT * FROM tbl_employee_offices WHERE employee_id = ? AND office_id = ?',
      [employeeId, officeId]
    );
    
    if (existingAssignment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee is not assigned to this office'
      });
    }
    
    // Remove assignment
    await db.query(
      'DELETE FROM tbl_employee_offices WHERE employee_id = ? AND office_id = ?',
      [employeeId, officeId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Employee removed from office successfully'
    });
  } catch (error) {
    console.error('Error removing employee from office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove employee from office',
      error: error.message
    });
  }
};
exports.getUnassignedEmployees = async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT e.* 
      FROM tbl_employeeinformation e
      LEFT JOIN tbl_employee_offices eo ON e.employee_id = eo.employee_id
      WHERE eo.employee_id IS NULL
    `);
    
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error getting unassigned employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve unassigned employees',
      error: error.message
    });
  }
};