// Controller/permitstrackingController.js
const db = require('../db/dbconnect');

/** Small helper to ensure we have a logged in user */
function getUserIdFromSession(req) {
  if (!req.session?.user?.user_id) return null;
  return req.session.user.user_id;
}

/** Normalize cross-model statuses so your UI steps render consistently */
function normalizeStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();

  // Map occasional variants to your UI's expected set
  if (s === 'in-review' || s === 'in review') return 'in-review';
  if (s === 'in-progress' || s === 'in progress') return 'in-progress';
  if (s === 'requirements-completed' || s === 'requirements completed') return 'requirements-completed';
  if (s === 'ready-for-pickup' || s === 'ready for pickup') return 'ready-for-pickup';
  if (s === 'completed') return 'approved'; // building table sometimes uses "completed"
  if (['pending','approved','rejected'].includes(s)) return s;
  return 'pending';
}

/** ---- Plumbing ----
 *  Table: tbl_plumbing_permits (id, application_no, pp_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getPlumbingPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT 
        id,
        application_no,
        pp_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_plumbing_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get plumbing permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve plumbing permits", error: err.message });
      }

      // normalize statuses
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

/** ---- Electronics ----
 *  Table: tbl_electronics_permits (id, application_no, ep_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getElectronicsPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT
        id,
        application_no,
        ep_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_electronics_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get electronics permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve electronics permits", error: err.message });
      }
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

/** ---- Building ----
 *  Table: tbl_building_permits (id, application_no, bp_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getBuildingPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT
        id,
        application_no,
        bp_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_building_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get building permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve building permits", error: err.message });
      }
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

/** ---- Fencing ----
 *  Table: tbl_fencing_permits (id, application_no, fp_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getFencingPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT
        id,
        application_no,
        fp_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_fencing_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get fencing permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve fencing permits", error: err.message });
      }
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};
