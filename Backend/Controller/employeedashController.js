// Controller/employeedashController.js
const db = require('../db/dbconnect');

/**
 * Helper: check auth
 */
function requireAuth(req, res) {
  if (!req.session || !req.session.user || !req.session.user.user_id) {
    res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    return false;
  }
  return true;
}

/**
 * ---- GET LISTS (Employee View) ----
 * Each query LEFT JOINs tb_logins to expose email to the dashboard.
 * Uses consistent shape: { id, type, name, status, submitted, email, user_id, ...raw }
 */

// PLUMBING
exports.getAllPlumbingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT p.*, l.email
    FROM tbl_plumbing_permits p
    LEFT JOIN tb_logins l ON p.user_id = l.user_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching plumbing permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving plumbing permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Plumbing Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

// ELECTRONICS
exports.getAllElectronicsPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT e.*, l.email
    FROM tbl_electronics_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    ORDER BY e.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching electronics permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving electronics permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Electronics Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

// BUILDING
exports.getAllBuildingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT b.*, l.email
    FROM tbl_building_permits b
    LEFT JOIN tb_logins l ON b.user_id = l.user_id
    ORDER BY b.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching building permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving building permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Building Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

// FENCING
exports.getAllFencingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT f.*, l.email
    FROM tbl_fencing_permits f
    LEFT JOIN tb_logins l ON f.user_id = l.user_id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching fencing permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving fencing permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Fencing Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

/**
 * ---- GET BY ID (for “View Info” modal) ----
 */

exports.getPlumbingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT p.*, l.email
    FROM tbl_plumbing_permits p
    LEFT JOIN tb_logins l ON p.user_id = l.user_id
    WHERE p.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving plumbing permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Plumbing permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

exports.getElectronicsById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT e.*, l.email
    FROM tbl_electronics_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    WHERE e.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving electronics permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Electronics permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

exports.getBuildingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT b.*, l.email
    FROM tbl_building_permits b
    LEFT JOIN tb_logins l ON b.user_id = l.user_id
    WHERE b.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving building permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Building permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

exports.getFencingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT f.*, l.email
    FROM tbl_fencing_permits f
    LEFT JOIN tb_logins l ON f.user_id = l.user_id
    WHERE f.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving fencing permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Fencing permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

/**
 * ---- STATUS TRANSITIONS ----
 * All: accept -> set in-review
 * move-to-inprogress
 * move-to-requirements-completed
 * move-to-approved
 * set-pickup -> ready-for-pickup (+ schedule)
 */

// generic helper to update status on a table by id
function updateStatus(res, table, id, status, schedule) {
  const hasSchedule = typeof schedule !== 'undefined' && schedule !== null;
  const sql = hasSchedule
    ? `UPDATE ${table} SET status = ?, pickup_schedule = ?, updated_at = NOW() WHERE id = ?`
    : `UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id = ?`;

  const params = hasSchedule ? [status, schedule, id] : [status, id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(`Failed to update ${table}:`, err);
      return res.status(500).json({ success: false, message: 'Failed to update' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: `Moved to ${status}` });
  });
}

// ---- Accept -> in-review
exports.acceptPlumbing = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_plumbing_permits', id, 'in-review');
};

exports.acceptElectronics = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_electronics_permits', id, 'in-review');
};

exports.acceptBuilding = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_building_permits', id, 'in-review');
};

exports.acceptFencing = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_fencing_permits', id, 'in-review');
};

// ---- Move to in-progress
exports.plumbingToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_plumbing_permits', req.body.applicationId || req.body.id, 'in-progress');
};

exports.electronicsToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'in-progress');
};

exports.buildingToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_building_permits', req.body.applicationId || req.body.id, 'in-progress');
};

exports.fencingToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_fencing_permits', req.body.applicationId || req.body.id, 'in-progress');
};

// ---- Move to requirements-completed
exports.plumbingToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_plumbing_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

exports.electronicsToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

exports.buildingToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_building_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

exports.fencingToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_fencing_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

// ---- Move to approved
exports.plumbingToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_plumbing_permits', req.body.applicationId || req.body.id, 'approved');
};

exports.electronicsToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'approved');
};

exports.buildingToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_building_permits', req.body.applicationId || req.body.id, 'approved');
};

exports.fencingToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_fencing_permits', req.body.applicationId || req.body.id, 'approved');
};

// ---- Set pickup (ready-for-pickup)
exports.plumbingSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_plumbing_permits', applicationId, 'ready-for-pickup', schedule);
};

exports.electronicsSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_electronics_permits', applicationId, 'ready-for-pickup', schedule);
};

exports.buildingSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_building_permits', applicationId, 'ready-for-pickup', schedule);
};

exports.fencingSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_fencing_permits', applicationId, 'ready-for-pickup', schedule);
};
