// controllers/officeController.js
const db = require('../db/dbconnect');

// Helper to run queries as Promise
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

// GET /api/offices
exports.getOffices = async (req, res) => {
  try {
    const rows = await query(
      'SELECT office_id, office_name, office_code, office_description, office_location, phone_number, email, status, created_at, updated_at FROM tbl_offices ORDER BY office_name'
    );

    const offices = rows.map((r) => ({
      ...r,
      // convenience flag for frontend
      is_active: r.status === 'active',
      location: r.office_location,
      phone: r.phone_number,
    }));

    return res.status(200).json(offices);
  } catch (err) {
    console.error('getOffices error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to load offices', error: err.message });
  }
};

// POST /api/offices
// Body: office fields + optional employee_assignments + optional positions[]
exports.createOffice = async (req, res) => {
  const {
    office_name,
    office_code,
    office_location,
    office_description,
    phone_number,
    email,
    status = 'active',
    employee_assignments = [],
    positions = [],
  } = req.body;

  if (!office_name || !office_code) {
    return res
      .status(400)
      .json({ message: 'office_name and office_code are required.' });
  }

  db.beginTransaction(async (err) => {
    if (err) {
      console.error('Transaction error (createOffice):', err);
      return res
        .status(500)
        .json({ message: 'Transaction error', error: err.message });
    }

    try {
      // 1) Insert office
      const insertOfficeSql = `
        INSERT INTO tbl_offices
        (office_name, office_code, office_description, office_location, phone_number, email, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      const officeResult = await query(insertOfficeSql, [
        office_name,
        office_code,
        office_description || null,
        office_location || null,
        phone_number || null,
        email || null,
        status || 'active',
      ]);

      const officeId = officeResult.insertId;

      // 2) Insert optional positions (with access_level + can_approve)
      if (Array.isArray(positions) && positions.length > 0) {
        const values = positions
          .map((p) => {
            // support both string and object payloads
            if (typeof p === 'string') {
              const name = p.trim();
              if (!name) return null;
              return [officeId, name, 'normal', 0];
            }

            const name =
              (p.position_name || p.name || '').trim();
            if (!name) return null;

            let level = (p.access_level || 'normal').toLowerCase();
            if (!['normal', 'mid', 'max'].includes(level)) {
              level = 'normal';
            }

            let canApprove;
            if (typeof p.can_approve !== 'undefined') {
              canApprove = p.can_approve ? 1 : 0;
            } else {
              // simple rule: "max" positions can approve by default
              canApprove = level === 'max' ? 1 : 0;
            }

            return [officeId, name, level, canApprove];
          })
          .filter(Boolean);

        if (values.length > 0) {
          const insertPosSql = `
            INSERT INTO tbl_office_positions (office_id, position_name, access_level, can_approve)
            VALUES ?
          `;
          await query(insertPosSql, [values]);
        }
      }

      // 3) Insert optional employee assignments
      if (
        Array.isArray(employee_assignments) &&
        employee_assignments.length > 0
      ) {
        const cleanAssignments = employee_assignments
          .filter((a) => a.employee_id)
          .map((a) => [
            a.employee_id,
            officeId,
            a.assignment_date || new Date().toISOString().split('T')[0],
            a.is_primary ? 1 : 0,
            a.status || 'active',
          ]);

        if (cleanAssignments.length > 0) {
          const assignSql = `
            INSERT INTO tbl_employee_offices
              (employee_id, office_id, assignment_date, is_primary, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
              assignment_date = VALUES(assignment_date),
              is_primary = VALUES(is_primary),
              status = VALUES(status)
          `;
          await query(assignSql, [cleanAssignments]);
        }
      }

      db.commit((commitErr) => {
        if (commitErr) {
          return db.rollback(() => {
            console.error('Commit error (createOffice):', commitErr);
            res.status(500).json({
              message: 'Failed to commit transaction',
              error: commitErr.message,
            });
          });
        }

        return res
          .status(201)
          .json({ message: 'Office created successfully', office_id: officeId });
      });
    } catch (error) {
      console.error('createOffice error:', error);
      db.rollback(() => {
        res
          .status(500)
          .json({ message: 'Failed to create office', error: error.message });
      });
    }
  });
};

// PUT /api/offices/:id
exports.updateOffice = async (req, res) => {
  const { id } = req.params;
  const {
    office_name,
    office_code,
    office_location,
    description,
    phone,
    email,
    is_active,
  } = req.body;

  const status = is_active ? 'active' : 'inactive';

  try {
    const sql = `
      UPDATE tbl_offices
      SET
        office_name = ?,
        office_code = ?,
        office_description = ?,
        office_location = ?,
        phone_number = ?,
        email = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE office_id = ?
    `;

    await query(sql, [
      office_name,
      office_code,
      description || null,
      office_location || null,
      phone || null,
      email || null,
      status,
      id,
    ]);

    return res.status(200).json({ message: 'Office updated successfully' });
  } catch (err) {
    console.error('updateOffice error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to update office', error: err.message });
  }
};

// DELETE /api/offices/:id
exports.deleteOffice = async (req, res) => {
  const { id } = req.params;

  db.beginTransaction(async (err) => {
    if (err) {
      console.error('Transaction error (deleteOffice):', err);
      return res
        .status(500)
        .json({ message: 'Transaction error', error: err.message });
    }

    try {
      // Remove employee assignments
      await query('DELETE FROM tbl_employee_offices WHERE office_id = ?', [id]);

      // Remove positions
      await query('DELETE FROM tbl_office_positions WHERE office_id = ?', [id]);

      // Remove office
      await query('DELETE FROM tbl_offices WHERE office_id = ?', [id]);

      db.commit((commitErr) => {
        if (commitErr) {
          return db.rollback(() => {
            console.error('Commit error (deleteOffice):', commitErr);
            res.status(500).json({
              message: 'Failed to commit transaction',
              error: commitErr.message,
            });
          });
        }

        return res.status(200).json({ message: 'Office deleted successfully' });
      });
    } catch (error) {
      console.error('deleteOffice error:', error);
      db.rollback(() => {
        res
          .status(500)
          .json({ message: 'Failed to delete office', error: error.message });
      });
    }
  });
};

// GET /api/offices/:id/employees
exports.getOfficeEmployees = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS full_name,
        e.position,
        e.department,
        eo.assignment_date,
        eo.is_primary,
        eo.status,
        l.email
      FROM tbl_employee_offices eo
      JOIN tbl_employeeinformation e ON eo.employee_id = e.employee_id
      JOIN tb_logins l ON e.user_id = l.user_id
      WHERE eo.office_id = ?
      ORDER BY eo.is_primary DESC, e.last_name, e.first_name
    `;

    const rows = await query(sql, [id]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('getOfficeEmployees error:', err);
    return res.status(500).json({
      message: 'Failed to load office employees',
      error: err.message,
    });
  }
};

// POST /api/offices/:id/assign-employees
exports.assignEmployeesToOffice = async (req, res) => {
  const { id } = req.params;
  const { employee_assignments } = req.body;

  if (!Array.isArray(employee_assignments) || employee_assignments.length === 0) {
    return res
      .status(400)
      .json({ message: 'employee_assignments array is required.' });
  }

  try {
    const values = employee_assignments
      .filter((a) => a.employee_id)
      .map((a) => [
        a.employee_id,
        id,
        a.assignment_date || new Date().toISOString().split('T')[0],
        a.is_primary ? 1 : 0,
        a.status || 'active',
      ]);

    if (values.length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid employee assignments provided.' });
    }

    const sql = `
      INSERT INTO tbl_employee_offices
        (employee_id, office_id, assignment_date, is_primary, status)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        assignment_date = VALUES(assignment_date),
        is_primary = VALUES(is_primary),
        status = VALUES(status)
    `;

    await query(sql, [values]);

    return res
      .status(200)
      .json({ message: 'Employees assigned to office successfully.' });
  } catch (err) {
    console.error('assignEmployeesToOffice error:', err);
    return res.status(500).json({
      message: 'Failed to assign employees',
      error: err.message,
    });
  }
};

// DELETE /api/offices/:id/employees/:employeeId
exports.removeEmployeeFromOffice = async (req, res) => {
  const { id, employeeId } = req.params;

  try {
    await query(
      'DELETE FROM tbl_employee_offices WHERE office_id = ? AND employee_id = ?',
      [id, employeeId]
    );
    return res
      .status(200)
      .json({ message: 'Employee removed from office successfully.' });
  } catch (err) {
    console.error('removeEmployeeFromOffice error:', err);
    return res.status(500).json({
      message: 'Failed to remove employee from office',
      error: err.message,
    });
  }
};

/* ──────────────────────────────────────────────
   Office Positions (with access_level)
   ────────────────────────────────────────────── */

// GET /api/offices/:id/positions
exports.getOfficePositions = async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await query(
      `
      SELECT position_id, office_id, position_name, access_level, can_approve, created_at, updated_at
      FROM tbl_office_positions
      WHERE office_id = ?
      ORDER BY position_name
    `,
      [id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('getOfficePositions error:', err);
    return res.status(500).json({
      message: 'Failed to load office positions',
      error: err.message,
    });
  }
};

// POST /api/offices/:id/positions
exports.createOfficePosition = async (req, res) => {
  const { id } = req.params;
  let { position_name, can_approve = 0, access_level = 'normal' } = req.body;

  if (!position_name || !position_name.trim()) {
    return res.status(400).json({ message: 'position_name is required.' });
  }

  position_name = position_name.trim();
  access_level = (access_level || 'normal').toLowerCase();
  if (!['normal', 'mid', 'max'].includes(access_level)) {
    access_level = 'normal';
  }
  const canApproveFlag = can_approve ? 1 : 0;

  try {
    const sql = `
      INSERT INTO tbl_office_positions (office_id, position_name, access_level, can_approve)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [
      id,
      position_name,
      access_level,
      canApproveFlag,
    ]);

    const row = {
      position_id: result.insertId,
      office_id: Number(id),
      position_name,
      access_level,
      can_approve: canApproveFlag,
    };

    return res.status(201).json({ message: 'Position created', position: row });
  } catch (err) {
    console.error('createOfficePosition error:', err);
    return res.status(500).json({
      message: 'Failed to create position',
      error: err.message,
    });
  }
};

// PUT /api/offices/:id/positions/:positionId
exports.updateOfficePosition = async (req, res) => {
  const { id, positionId } = req.params;
  let { position_name, can_approve, access_level } = req.body;

  if (!position_name || !position_name.trim()) {
    return res.status(400).json({ message: 'position_name is required.' });
  }

  position_name = position_name.trim();
  access_level = (access_level || 'normal').toLowerCase();
  if (!['normal', 'mid', 'max'].includes(access_level)) {
    access_level = 'normal';
  }
  const canApproveFlag = can_approve ? 1 : 0;

  try {
    const sql = `
      UPDATE tbl_office_positions
      SET position_name = ?, access_level = ?, can_approve = ?
      WHERE position_id = ? AND office_id = ?
    `;
    await query(sql, [
      position_name,
      access_level,
      canApproveFlag,
      positionId,
      id,
    ]);

    return res.status(200).json({ message: 'Position updated' });
  } catch (err) {
    console.error('updateOfficePosition error:', err);
    return res.status(500).json({
      message: 'Failed to update position',
      error: err.message,
    });
  }
};

// DELETE /api/offices/:id/positions/:positionId
exports.deleteOfficePosition = async (req, res) => {
  const { id, positionId } = req.params;

  try {
    await query(
      'DELETE FROM tbl_office_positions WHERE position_id = ? AND office_id = ?',
      [positionId, id]
    );
    return res.status(200).json({ message: 'Position deleted' });
  } catch (err) {
    console.error('deleteOfficePosition error:', err);
    return res.status(500).json({
      message: 'Failed to delete position',
      error: err.message,
    });
  }
};
