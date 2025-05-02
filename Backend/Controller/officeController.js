const db = require('../db/dbconnect');

// Get all offices with employee count
exports.getAllOffices = async (req, res) => {
  try {
    const [offices] = await db.query(`
      SELECT o.*, COUNT(ea.employee_id) as employee_count
      FROM tbl_offices o
      LEFT JOIN tbl_employee_office_assignments ea ON o.office_id = ea.office_id
      GROUP BY o.office_id
      ORDER BY o.office_name ASC
    `);

    res.status(200).json({ success: true, data: offices });
  } catch (error) {
    console.error('Error getting offices:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve offices', error: error.message });
  }
};

// Get office by ID
exports.getOfficeById = async (req, res) => {
  try {
    const officeId = req.params.id;
    const [office] = await db.query('SELECT * FROM tbl_offices WHERE office_id = ?', [officeId]);

    if (!office || office.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    const [assignments] = await db.query(`
      SELECT a.*, e.first_name, e.last_name, e.position
      FROM tbl_employee_office_assignments a
      JOIN tbl_employeeinformation e ON a.employee_id = e.employee_id
      WHERE a.office_id = ?
      ORDER BY a.is_primary DESC, a.assignment_date DESC
    `, [officeId]);

    res.status(200).json({ success: true, data: { ...office[0], employee_assignments: assignments } });
  } catch (error) {
    console.error('Error getting office details:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve office details', error: error.message });
  }
};

// Create a new office
exports.createOffice = async (req, res) => {
  try {
    const {
      office_name,
      office_code,
      office_location,
      office_description,
      phone_number,
      email,
      status,
      employee_assignments
    } = req.body;

    const [officeResult] = await db.query(
      `INSERT INTO tbl_offices 
      (office_name, office_code, location, description, phone, email, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        office_name,
        office_code,
        office_location,
        office_description,
        phone_number,
        email,
        status === 'active' ? 1 : 0
      ]
    );

    const officeId = officeResult.insertId;

    if (employee_assignments && employee_assignments.length > 0) {
      for (const assignment of employee_assignments) {
        await db.query(
          `INSERT INTO tbl_employee_office_assignments 
          (employee_id, office_id, assignment_date, is_primary, position_in_office) 
          VALUES (?, ?, ?, ?, ?)`,
          [
            assignment.employee_id,
            officeId,
            assignment.assignment_date,
            assignment.is_primary ? 1 : 0,
            assignment.positionInOffice || null
          ]
        );
      }
    }

    res.status(201).json({ success: true, message: 'Office created successfully', data: { office_id: officeId } });
  } catch (error) {
    console.error('Error creating office:', error);
    res.status(500).json({ success: false, message: 'Failed to create office', error: error.message });
  }
};

// Update an office
exports.updateOffice = async (req, res) => {
  try {
    const officeId = req.params.id;
    const {
      office_name,
      office_code,
      office_location,
      office_description,
      phone_number,
      email,
      status,
      employee_assignments
    } = req.body;

    const [officeCheck] = await db.query(
      'SELECT office_id FROM tbl_offices WHERE office_id = ?',
      [officeId]
    );

    if (!officeCheck || officeCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    await db.query(
      `UPDATE tbl_offices SET
        office_name = ?,
        office_code = ?,
        location = ?,
        description = ?,
        phone = ?,
        email = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE office_id = ?`,
      [
        office_name,
        office_code,
        office_location,
        office_description,
        phone_number,
        email,
        status === 'active' ? 1 : 0,
        officeId
      ]
    );

    if (employee_assignments && employee_assignments.length > 0) {
      await db.query('DELETE FROM tbl_employee_office_assignments WHERE office_id = ?', [officeId]);

      for (const assignment of employee_assignments) {
        await db.query(
          `INSERT INTO tbl_employee_office_assignments 
          (employee_id, office_id, assignment_date, is_primary, position_in_office) 
          VALUES (?, ?, ?, ?, ?)`,
          [
            assignment.employee_id,
            officeId,
            assignment.assignment_date,
            assignment.is_primary ? 1 : 0,
            assignment.positionInOffice || null
          ]
        );
      }
    }

    res.status(200).json({ success: true, message: 'Office updated successfully' });
  } catch (error) {
    console.error('Error updating office:', error);
    res.status(500).json({ success: false, message: 'Failed to update office', error: error.message });
  }
};

// Delete an office
exports.deleteOffice = async (req, res) => {
  try {
    const officeId = req.params.id;
    const [officeCheck] = await db.query('SELECT office_id FROM tbl_offices WHERE office_id = ?', [officeId]);

    if (!officeCheck || officeCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    await db.query('DELETE FROM tbl_offices WHERE office_id = ?', [officeId]);

    res.status(200).json({ success: true, message: 'Office deleted successfully' });
  } catch (error) {
    console.error('Error deleting office:', error);
    res.status(500).json({ success: false, message: 'Failed to delete office', error: error.message });
  }
};

// Get employees for assignment
exports.getEmployeesForAssignment = async (req, res) => {
  try {
    const [employees] = await db.query(`
      SELECT 
        e.employee_id, 
        e.first_name, 
        e.last_name, 
        e.position,
        e.department,
        (SELECT COUNT(*) FROM tbl_employee_office_assignments 
         WHERE employee_id = e.employee_id) as assignment_count
      FROM tbl_employeeinformation e
      ORDER BY e.last_name, e.first_name
    `);

    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve employees', error: error.message });
  }
};

// Toggle office active status
exports.toggleOfficeStatus = async (req, res) => {
  try {
    const officeId = req.params.id;

    const [office] = await db.query(
      'SELECT is_active FROM tbl_offices WHERE office_id = ?',
      [officeId]
    );

    if (!office || office.length === 0) {
      return res.status(404).json({ success: false, message: 'Office not found' });
    }

    const newStatus = office[0].is_active === 1 ? 0 : 1;

    await db.query(
      'UPDATE tbl_offices SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE office_id = ?',
      [newStatus, officeId]
    );

    res.status(200).json({
      success: true,
      message: `Office status ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: newStatus }
    });
  } catch (error) {
    console.error('Error toggling office status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle office status', error: error.message });
  }
};
