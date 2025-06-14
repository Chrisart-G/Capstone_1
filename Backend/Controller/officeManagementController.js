const db = require('../db/dbconnect');
// Assign employees to office
exports.assignEmployeesToOffice = (req, res) => {
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
    db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId], (err, existingOffice) => {
      if (err) {
        console.error('Error checking office:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to assign employees to office',
          error: err.message
        });
      }
      
      if (existingOffice.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Office not found'
        });
      }
      
      // Start transaction
      db.query('START TRANSACTION', (err) => {
        if (err) {
          console.error('Error starting transaction:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to assign employees to office',
            error: err.message
          });
        }
        
        let processedCount = 0;
        let hasError = false;
        
        // Process each assignment
        const processAssignment = (index) => {
          if (index >= employee_assignments.length) {
            // All assignments processed successfully
            db.query('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Failed to assign employees to office',
                  error: err.message
                });
              }
              
              return res.status(200).json({
                success: true,
                message: 'Employees assigned to office successfully'
              });
            });
            return;
          }
          
          if (hasError) return;
          
          const assignment = employee_assignments[index];
          
          if (!assignment.employee_id) {
            hasError = true;
            db.query('ROLLBACK');
            return res.status(400).json({
              success: false,
              message: 'Employee ID is required for each assignment'
            });
          }
          
          // Check if employee exists
          db.query(
            'SELECT * FROM tbl_employeeinformation WHERE employee_id = ?',
            [assignment.employee_id],
            (err, existingEmployee) => {
              if (err || hasError) {
                if (!hasError) {
                  hasError = true;
                  db.query('ROLLBACK');
                  console.error('Error checking employee:', err);
                  return res.status(500).json({
                    success: false,
                    message: 'Failed to assign employees to office',
                    error: err.message
                  });
                }
                return;
              }
              
              if (existingEmployee.length === 0) {
                hasError = true;
                db.query('ROLLBACK');
                return res.status(404).json({
                  success: false,
                  message: `Employee with ID ${assignment.employee_id} not found`
                });
              }
              
              // Check if assignment already exists
              db.query(
                'SELECT * FROM tbl_employee_offices WHERE employee_id = ? AND office_id = ?',
                [assignment.employee_id, officeId],
                (err, existingAssignment) => {
                  if (err || hasError) {
                    if (!hasError) {
                      hasError = true;
                      db.query('ROLLBACK');
                      console.error('Error checking existing assignment:', err);
                      return res.status(500).json({
                        success: false,
                        message: 'Failed to assign employees to office',
                        error: err.message
                      });
                    }
                    return;
                  }
                  
                  if (existingAssignment.length > 0) {
                    // Update existing assignment
                    db.query(
                      'UPDATE tbl_employee_offices SET assignment_date = ?, is_primary = ?, status = ? WHERE employee_id = ? AND office_id = ?',
                      [
                        assignment.assignment_date || new Date().toISOString().split('T')[0],
                        assignment.is_primary ? 1 : 0,
                        assignment.status || 'active',
                        assignment.employee_id,
                        officeId
                      ],
                      (err) => {
                        if (err || hasError) {
                          if (!hasError) {
                            hasError = true;
                            db.query('ROLLBACK');
                            console.error('Error updating assignment:', err);
                            return res.status(500).json({
                              success: false,
                              message: 'Failed to assign employees to office',
                              error: err.message
                            });
                          }
                          return;
                        }
                        
                        // Handle primary office logic
                        handlePrimaryOffice(assignment, index);
                      }
                    );
                  } else {
                    // Create new assignment
                    db.query(
                      'INSERT INTO tbl_employee_offices (employee_id, office_id, assignment_date, is_primary, status) VALUES (?, ?, ?, ?, ?)',
                      [
                        assignment.employee_id,
                        officeId,
                        assignment.assignment_date || new Date().toISOString().split('T')[0],
                        assignment.is_primary ? 1 : 0,
                        assignment.status || 'active'
                      ],
                      (err) => {
                        if (err || hasError) {
                          if (!hasError) {
                            hasError = true;
                            db.query('ROLLBACK');
                            console.error('Error creating assignment:', err);
                            return res.status(500).json({
                              success: false,
                              message: 'Failed to assign employees to office',
                              error: err.message
                            });
                          }
                          return;
                        }
                        
                        // Handle primary office logic
                        handlePrimaryOffice(assignment, index);
                      }
                    );
                  }
                }
              );
            }
          );
        };
        
        // Helper function to handle primary office logic
        const handlePrimaryOffice = (assignment, index) => {
          if (hasError) return;
          
          if (assignment.is_primary) {
            // Update any other primary offices for this employee
            db.query(
              'UPDATE tbl_employee_offices SET is_primary = 0 WHERE employee_id = ? AND office_id != ?',
              [assignment.employee_id, officeId],
              (err) => {
                if (err || hasError) {
                  if (!hasError) {
                    hasError = true;
                    db.query('ROLLBACK');
                    console.error('Error updating primary offices:', err);
                    return res.status(500).json({
                      success: false,
                      message: 'Failed to assign employees to office',
                      error: err.message
                    });
                  }
                  return;
                }
                
                // Process next assignment
                processAssignment(index + 1);
              }
            );
          } else {
            // Process next assignment
            processAssignment(index + 1);
          }
        };
        
        // Start processing assignments
        processAssignment(0);
      });
    });
  } catch (error) {
    console.error('Error assigning employees to office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employees to office',
      error: error.message
    });
  }
};
// Get all offices

exports.getAllOffices = (req, res) => {
  try {
    // Query to get all offices using callback style to match your db connect
    db.query(
      'SELECT office_id, office_name, office_code, office_description as description, office_location as location, phone_number as phone, email, status as is_active FROM tbl_offices ORDER BY office_name',
      (err, results) => {
        if (err) {
          console.error('Error getting offices:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to get offices',
            error: err.message
          });
        }
        
        // Map boolean values for is_active
        const offices = results.map(office => ({
          ...office,
          is_active: office.is_active === 'active' || office.is_active === 1
        }));
        
        // Return the array of offices directly, which is what your frontend expects
        return res.status(200).json(offices);
      }
    );
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
exports.getOfficeById = (req, res) => {
  try {
    const officeId = req.params.id;
    
    // Get office details
    db.query(
      'SELECT * FROM tbl_offices WHERE office_id = ?', 
      [officeId],
      (err, office) => {
        if (err) {
          console.error('Error getting office details:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to retrieve office details',
            error: err.message
          });
        }
        
        if (office.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Office not found'
          });
        }
        
        // Get employees assigned to this office
        db.query(`
          SELECT e.employee_id, e.first_name, e.last_name, e.position, e.department, eo.assignment_date, eo.status
          FROM tbl_employee_offices eo
          JOIN tbl_employeeinformation e ON eo.employee_id = e.employee_id
          WHERE eo.office_id = ?
        `, 
        [officeId],
        (err, employees) => {
          if (err) {
            console.error('Error getting office employees:', err);
            return res.status(500).json({
              success: false,
              message: 'Failed to retrieve employee details',
              error: err.message
            });
          }
          
          res.status(200).json({
            success: true,
            data: {
              office: office[0],
              employees: employees
            }
          });
        });
      }
    );
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
// Create new office - FIXED VERSION (compatible with existing db connection)
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
    
    // Check if office code already exists
    db.query(
      'SELECT office_id FROM tbl_offices WHERE office_code = ?', 
      [office_code],
      (err, existingOffices) => {
        if (err) {
          console.error('Error checking existing offices:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create office',
            error: err.message
          });
        }
        
        if (existingOffices.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Office code already exists'
          });
        }
        
        // Insert the new office - using callbacks for the single connection
        db.query(
          `INSERT INTO tbl_offices 
          (office_name, office_code, office_description, office_location, phone_number, email, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            office_name, 
            office_code, 
            office_description || null, 
            office_location || null, 
            phone_number || null, 
            email || null, 
            status || 'active'
          ],
          (err, officeResult) => {
            if (err) {
              console.error('Error inserting office:', err);
              return res.status(500).json({
                success: false,
                message: 'Failed to create office',
                error: err.message
              });
            }
            
            const officeId = officeResult.insertId;
            console.log('Office inserted successfully with ID:', officeId);
            
            // Process employee assignments if provided
            if (employee_assignments && Array.isArray(employee_assignments) && employee_assignments.length > 0) {
              console.log(`Processing ${employee_assignments.length} employee assignments`);
              
              let completedAssignments = 0;
              let assignmentErrors = false;
              
              // Process each assignment
              employee_assignments.forEach(assignment => {
                db.query(
                  `INSERT INTO tbl_employee_offices 
                  (employee_id, office_id, assignment_date, is_primary) 
                  VALUES (?, ?, ?, ?)`,
                  [
                    assignment.employee_id,
                    officeId,
                    assignment.assignment_date || new Date().toISOString().split('T')[0],
                    assignment.is_primary ? 1 : 0
                  ],
                  (err) => {
                    completedAssignments++;
                    
                    if (err) {
                      console.error('Error processing employee assignment:', err);
                      assignmentErrors = true;
                    }
                    
                    // Check if all assignments are processed
                    if (completedAssignments === employee_assignments.length) {
                      if (assignmentErrors) {
                        return res.status(207).json({
                          success: true,
                          message: 'Office created but some employee assignments failed',
                          data: {
                            office_id: officeId,
                            office_name,
                            office_code
                          }
                        });
                      } else {
                        console.log('All employee assignments processed successfully');
                        return res.status(201).json({
                          success: true,
                          message: 'Office created successfully',
                          data: {
                            office_id: officeId,
                            office_name,
                            office_code
                          }
                        });
                      }
                    }
                  }
                );
              });
            } else {
              // If no employee assignments, return success right away
              return res.status(201).json({
                success: true,
                message: 'Office created successfully',
                data: {
                  office_id: officeId,
                  office_name,
                  office_code
                }
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error creating office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create office',
      error: error.message
    });
  }
};
// Update office
exports.updateOffice = (req, res) => {
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
    db.query(
      'SELECT * FROM tbl_offices WHERE office_id = ?', 
      [officeId],
      (err, existingOffice) => {
        if (err) {
          console.error('Error checking existing office:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to update office',
            error: err.message
          });
        }
        
        if (existingOffice.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Office not found'
          });
        }
        
        // Check if office code already exists (excluding the current office)
        db.query(
          'SELECT * FROM tbl_offices WHERE office_code = ? AND office_id != ?', 
          [office_code, officeId],
          (err, duplicateCode) => {
            if (err) {
              console.error('Error checking duplicate code:', err);
              return res.status(500).json({
                success: false,
                message: 'Failed to update office',
                error: err.message
              });
            }
            
            if (duplicateCode.length > 0) {
              return res.status(400).json({
                success: false,
                message: 'Office code already exists'
              });
            }
            
            // Update office
            db.query(
              `UPDATE tbl_offices 
               SET office_name = ?, office_code = ?, office_description = ?, 
                   office_location = ?, phone_number = ?, email = ?, status = ?
               WHERE office_id = ?`,
              [office_name, office_code, office_description, office_location, phone_number, email, status || 'active', officeId],
              (err, result) => {
                if (err) {
                  console.error('Error updating office:', err);
                  return res.status(500).json({
                    success: false,
                    message: 'Failed to update office',
                    error: err.message
                  });
                }
                
                res.status(200).json({
                  success: true,
                  message: 'Office updated successfully'
                });
              }
            );
          }
        );
      }
    );
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
exports.deleteOffice = (req, res) => {
  try {
    const officeId = req.params.id;
    
    // Check if office exists
    db.query(
      'SELECT * FROM tbl_offices WHERE office_id = ?', 
      [officeId],
      (err, existingOffice) => {
        if (err) {
          console.error('Error checking existing office:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to delete office',
            error: err.message
          });
        }
        
        if (existingOffice.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Office not found'
          });
        }
        
        // Handle transaction manually with callbacks
        db.query('START TRANSACTION', (err) => {
          if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({
              success: false,
              message: 'Failed to delete office',
              error: err.message
            });
          }
          
          // Check if office has employee assignments
          db.query(
            'SELECT * FROM tbl_employee_offices WHERE office_id = ?', 
            [officeId],
            (err, assignments) => {
              if (err) {
                db.query('ROLLBACK');
                console.error('Error checking employee assignments:', err);
                return res.status(500).json({
                  success: false,
                  message: 'Failed to delete office',
                  error: err.message
                });
              }
              
              // If assignments exist, delete them first
              if (assignments.length > 0) {
                db.query(
                  'DELETE FROM tbl_employee_offices WHERE office_id = ?', 
                  [officeId],
                  (err) => {
                    if (err) {
                      db.query('ROLLBACK');
                      console.error('Error deleting employee assignments:', err);
                      return res.status(500).json({
                        success: false,
                        message: 'Failed to delete office',
                        error: err.message
                      });
                    }
                    
                    deleteTheOffice();
                  }
                );
              } else {
                deleteTheOffice();
              }
              
              // Helper function to delete the office
              function deleteTheOffice() {
                db.query(
                  'DELETE FROM tbl_offices WHERE office_id = ?', 
                  [officeId],
                  (err) => {
                    if (err) {
                      db.query('ROLLBACK');
                      console.error('Error deleting office:', err);
                      return res.status(500).json({
                        success: false,
                        message: 'Failed to delete office',
                        error: err.message
                      });
                    }
                    
                    // Commit transaction
                    db.query('COMMIT', (err) => {
                      if (err) {
                        db.query('ROLLBACK');
                        console.error('Error committing transaction:', err);
                        return res.status(500).json({
                          success: false,
                          message: 'Failed to delete office',
                          error: err.message
                        });
                      }
                      
                      res.status(200).json({
                        success: true,
                        message: 'Office deleted successfully'
                      });
                    });
                  }
                );
              }
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Error deleting office:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete office',
      error: error.message
    });
  }
};


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



exports.getAllEmployees = (req, res) => {
  try {
    db.query(`
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.position,
        e.department,
        e.phone,
        l.email
      FROM tbl_employeeinformation e
      JOIN tb_logins l ON e.user_id = l.user_id
      ORDER BY e.first_name, e.last_name
    `, 
    (err, employees) => {
      if (err) {
        console.error('Error getting employees:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve employees',
          error: err.message
        });
      }
      
      return res.status(200).json(employees);
    });
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees',
      error: error.message
    });
  }
};

exports.getOfficeEmployees = (req, res) => {
  try {
    const officeId = req.params.id;
    
    db.query(`
      SELECT 
        e.employee_id, 
        CONCAT(e.first_name, ' ', e.last_name) AS full_name,
        e.position,
        l.email,
        eo.assignment_date,
        eo.is_primary,
        eo.status
      FROM tbl_employee_offices eo
      JOIN tbl_employeeinformation e ON eo.employee_id = e.employee_id
      JOIN tb_logins l ON e.user_id = l.user_id
      WHERE eo.office_id = ?
      ORDER BY e.first_name, e.last_name
    `, 
    [officeId],
    (err, employees) => {
      if (err) {
        console.error('Error getting office employees:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve employees',
          error: err.message
        });
      }
      
      // Return the array of employees directly
      return res.status(200).json(employees);
    });
  } catch (error) {
    console.error('Error getting office employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees',
      error: error.message
    });
  }
};
exports.removeEmployeeFromOffice = (req, res) => {
  const { officeId, employeeId } = req.params;

  db.query(
    'DELETE FROM tbl_employee_offices WHERE office_id = ? AND employee_id = ?',
    [officeId, employeeId],
    (err, result) => {
      if (err) {
        console.error('Error removing employee from office:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove employee' });
      }
      return res.status(200).json({ success: true, message: 'Employee removed from office' });
    }
  );
};
