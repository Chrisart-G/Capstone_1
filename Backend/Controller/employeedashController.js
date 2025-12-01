// Controller/employeedashController.js
const db = require('../db/dbconnect');
const axios = require("axios");
const path = require("path");         // ✅ ADD THIS
const fs = require("fs");       
const { PDFDocument, StandardFonts } = require("pdf-lib");
const { IPROG_API_TOKEN, SMS_ENABLED = "true" } = process.env;
const PICKUP_UPLOAD_BASE = path.join(
  __dirname,
  "..",
  "uploads",
  "pickup_docs"
);
/* ---------------- Auth ---------------- */
function requireAuth(req, res) {
  if (!req.session || !req.session.user || !req.session.user.user_id) {
    res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    return false;
  }
  return true;
}

/* ---------------- DB helper ---------------- */
function q(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );
}

/* ---------------- Feature flag ---------------- */
async function getSmsEnabledFlag() {
  try {
    const rows = await q('SELECT v FROM system_settings WHERE k="sms_enabled" LIMIT 1');
    if (rows && rows[0]) return rows[0].v === "true";
  } catch (_) {}
  return String(SMS_ENABLED).toLowerCase() === "true";
}

/* ---------------- Phone normalizer ---------------- */
function normPhone(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/\D/g, "");
  if (s.startsWith("09")) s = "63" + s.slice(1);
  else if (s.startsWith("9") && s.length === 10) s = "63" + s;
  else if (s.startsWith("0") && s.length === 11) s = "63" + s.slice(1);
  else if (s.startsWith("+63")) s = s.replace("+", "");
  return s;
}

/* ---------------- IPROG SMS ---------------- */
async function iprogSend({ phone, message }) {
  const url = "https://sms.iprogtech.com/api/v1/sms_messages";
  const params = {
    api_token: IPROG_API_TOKEN,
    phone_number: normPhone(phone),
    message: String(message || "").slice(0, 306),
  };

  console.log("[SMS] SEND →", { url, params });
  const res = await axios.post(url, null, {
    params,
    timeout: 15000,
    validateStatus: () => true,
  });
  console.log("[SMS] SEND ←", res.status, res.data);

  if (res.status >= 200 && res.status < 300) return res.data;
  const err = new Error("IPROG send failed");
  err.response = res;
  throw err;
}

async function iprogCredits() {
  const url = "https://sms.iprogtech.com/api/v1/account/sms_credits";
  const res = await axios.get(url, {
    params: { api_token: IPROG_API_TOKEN },
    timeout: 10000,
    validateStatus: () => true,
  });
  console.log("[SMS] CREDITS ←", res.status, res.data);
  return res.data;
}

/* ---------------- Type mapping for SMS ---------------- */
const TABLE_TO_TYPE = {
  "tbl_plumbing_permits": "plumbing",
  "tbl_electronics_permits": "electronics",
  "tbl_building_permits": "building",
  "tbl_fencing_permits": "fencing",
  "tbl_electrical_permits": "electrical",
  "tbl_cedula": "cedula",
  "business_permits": "business", // NEW
};

const OFFICE_BY_TYPE = {
  plumbing: "Office of the Municipal Engineer",
  electronics: "Office of the Municipal Engineer",
  building: "Office of the Building Official",
  fencing: "Office of the Municipal Engineer",
  electrical: "Office of the Municipal Engineer",
  cedula: "Municipal Treasurer’s Office",
  business: "Business Permits & Licensing Office", // NEW
};
// this is for schedule pickup


function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Save the uploaded pickup document.
 * Allowed extensions: .pdf, .jpg, .jpeg, .png
 * Returns relative path like /uploads/pickup_docs/business/12345_file.pdf
 */
function savePickupFile(file, subfolder) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null); // file is optional

    const allowedExt = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.name || "").toLowerCase();

    if (!allowedExt.includes(ext)) {
      return reject(
        new Error("Invalid file type. Allowed: PDF, JPG, JPEG, PNG.")
      );
    }

    const safeName = String(file.name || "pickup")
      .replace(/[^a-z0-9.\-_]/gi, "_");
    const finalName = `${Date.now()}_${safeName}`;

    ensureDirExists(PICKUP_UPLOAD_BASE);
    const destFolder = path.join(PICKUP_UPLOAD_BASE, subfolder);
    ensureDirExists(destFolder);

    const absPath = path.join(destFolder, finalName);
    const relPath = `/uploads/pickup_docs/${subfolder}/${finalName}`;

    file.mv(absPath, (err) => {
      if (err) return reject(err);
      return resolve(relPath);
    });
  });
}

function setPickupWithFile(req, res, {
  table,
  pkCol,
  idFieldName,
  statusField,   // "status" or "application_status"
  appType,       // for folder name and SMS mapping
}) {
  if (!requireAuth(req, res)) return;

  const rawId =
    req.body?.[idFieldName] ??
    req.body?.applicationId ??
    req.body?.id;

  const applicationId = Number(rawId);
  const schedule = req.body?.schedule || null;

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid application ID is required.",
    });
  }

  if (!schedule) {
    return res.status(400).json({
      success: false,
      message: "Pickup schedule is required.",
    });
  }

  const file = req.files?.pickup_file || null;

  savePickupFile(file, appType)
    .then((pickupFilePath) => {
      const hasFile = !!pickupFilePath;

      const sql = hasFile
        ? `UPDATE ${table}
           SET ${statusField} = 'ready-for-pickup',
               pickup_schedule = ?,
               pickup_file_path = ?,
               updated_at = NOW()
           WHERE ${pkCol} = ?`
        : `UPDATE ${table}
           SET ${statusField} = 'ready-for-pickup',
               pickup_schedule = ?,
               updated_at = NOW()
           WHERE ${pkCol} = ?`;

      const params = hasFile
        ? [schedule, pickupFilePath, applicationId]
        : [schedule, applicationId];

      db.query(sql, params, (err, result) => {
        if (err) {
          console.error("[PICKUP] Failed to update", table, err);
          return res.status(500).json({
            success: false,
            message: "Failed to schedule pickup.",
          });
        }

        if (!result.affectedRows) {
          console.warn("[PICKUP] No rows affected", { table, applicationId });
          return res.status(404).json({
            success: false,
            message: "Application not found.",
          });
        }

        res.json({
          success: true,
          message: "Pickup scheduled and moved to ready-for-pickup.",
          pickup_schedule: schedule,
          pickup_file_path: pickupFilePath || null,
        });

        // SMS with schedule (uses same helper as other status updates)
        fireSmsFor(table, applicationId, "ready-for-pickup", schedule)
          .then(() =>
            console.log("[SMS] done for pickup", { table, applicationId })
          )
          .catch((e) =>
            console.error(
              "[SMS] pickup background error:",
              e?.response?.data || e
            )
          );
      });
    })
    .catch((err) => {
      console.error("[PICKUP] file save error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid pickup document file.",
      });
    });
}

/* ---------------- Lookups ---------------- */
async function getUserPhoneByUserId(userId) {
  const rows = await q("SELECT phone_number FROM tbl_user_info WHERE user_id=? LIMIT 1", [userId]);
  return rows?.[0]?.phone_number || null;
}
async function getUserIdFromTableRow(table, id) {
  let key = "id";
  if (table === "business_permits") {
    key = "BusinessP_id"; // PK for business_permits
  }
  // tbl_cedula and tbl_*_permits all use "id"
  const rows = await q(
    `SELECT user_id FROM ${table} WHERE ${key}=? LIMIT 1`,
    [id]
  );
  return rows?.[0]?.user_id || null;
}

async function getApplicationNo(table, id) {
  // cedula and business_permits don’t have application_no
  if (table === "tbl_cedula" || table === "business_permits") {
    return null;
  }
  const rows = await q(
    `SELECT application_no FROM ${table} WHERE id=? LIMIT 1`,
    [id]
  ).catch(() => []);
  return rows?.[0]?.application_no || null;
}


function buildStatusMessage({ officeName, applicationTypeLabel, applicationNo, newStatus, extraNote }) {
  const lines = [
    officeName || "Municipality",
    `${applicationTypeLabel || "Application"} ${applicationNo ? `#${applicationNo}` : ""}`.trim(),
    `Status: ${newStatus}`,
    extraNote || "Login to your account for details.",
  ].filter(Boolean);
  return lines.join("\n").slice(0, 306);
}

/* ---------------- Fire SMS after status change ---------------- */
async function fireSmsFor(table, id, status, schedule) {
  try {
    const smsOn = await getSmsEnabledFlag();
    if (!smsOn) {
      console.log("[SMS] Skipped (disabled)");
      return;
    }

    const application_type = TABLE_TO_TYPE[table];
    if (!application_type) return;

    const userId = await getUserIdFromTableRow(table, id);
    if (!userId) {
      console.log("[SMS] No user_id for", table, id);
      return;
    }
    const phone = await getUserPhoneByUserId(userId);
    if (!phone) {
      console.log("[SMS] No phone for user", userId);
      return;
    }

    const application_no = await getApplicationNo(table, id);
    const office_name = OFFICE_BY_TYPE[application_type] || "Municipal Office";
    const extra_note = (function noteForStatus(status, schedule) {
      switch (status) {
        case "in-review":
          return "Your application is under review. Please monitor your requirements in the portal.";
        case "in-progress":
          return "Requirements are pending. Upload the needed files to continue.";
        case "requirements-completed":
          return "All requirements received. Await final approval.";
        case "approved":
          return "Approved. Watch your portal for pickup instructions.";
        case "ready-for-pickup":
          return schedule ? `Ready for pickup on ${schedule}. Bring a valid ID.` : "Ready for pickup. Bring a valid ID.";
        case "rejected":
          return "Not approved. See details in your portal.";
        default:
          return "See your account for details.";
      }
    })(status, schedule);

    const label = application_type.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const message = buildStatusMessage({
      officeName: office_name,
      applicationTypeLabel: label,
      applicationNo: application_no,
      newStatus: status,
      extraNote: extra_note,
    });

    console.log("[SMS] Will send →", { application_type, id, userId, phone: normPhone(phone), status });
    await iprogSend({ phone, message });
  } catch (e) {
    console.error("[SMS] fireSmsFor error:", e?.response?.status, e?.response?.data || e);
  }
}

/* ---------------- Public debug endpoints ---------------- */
exports.smsCredits = async (req, res) => {
  try {
    const data = await iprogCredits();
    res.json({ success: true, data });
  } catch (e) {
    console.error("[SMS] credits error:", e?.response?.status, e?.response?.data || e);
    res.status(500).json({ success: false, message: "Credits check failed" });
  }
};
exports.smsTest = async (req, res) => {
  try {
    const { phone, message } = req.body || {};
    if (!phone || !message) return res.status(400).json({ success: false, message: "phone and message required" });
    await iprogSend({ phone, message });
    res.json({ success: true, phone: normPhone(phone) });
  } catch (e) {
    console.error("[SMS] test error:", e?.response?.status, e?.response?.data || e);
    res.status(500).json({ success: false, message: "SMS send failed" });
  }
};

/* ===================================================================
   SHARED HELPERS FOR STATUS UPDATES
=================================================================== */

// For tables that use `status` (plumbing/electronics/building/fencing/electrical)
function updateStatus(res, table, id, status, schedule) {
  console.log("[STATUS] updateStatus →", { table, id, status, schedule });

  const hasSchedule = typeof schedule !== "undefined" && schedule !== null;
  const sql = hasSchedule
    ? `UPDATE ${table} SET status = ?, pickup_schedule = ?, updated_at = NOW() WHERE id = ?`
    : `UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id = ?`;
  const params = hasSchedule ? [status, schedule, id] : [status, id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(`[STATUS] Failed to update ${table}:`, err);
      return res.status(500).json({ success: false, message: "Failed to update" });
    }
    if (result.affectedRows === 0) {
      console.warn("[STATUS] No rows affected →", { table, id });
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    res.json({ success: true, message: `Moved to ${status}` });

    fireSmsFor(table, id, status, schedule)
      .then(() => console.log("[SMS] done for", { table, id, status }))
      .catch((e) => console.error("[SMS] background error:", e?.response?.data || e));
  });
}

// For Cedula which uses `application_status`
function updateCedulaStatusGeneric(res, id, status, schedule) {
  console.log("[STATUS] updateCedulaStatusGeneric →", { id, status, schedule });

  const hasSchedule = typeof schedule !== "undefined" && schedule !== null;
  const sql = hasSchedule
    ? `UPDATE tbl_cedula SET application_status = ?, pickup_schedule = ?, updated_at = NOW() WHERE id = ?`
    : `UPDATE tbl_cedula SET application_status = ?, updated_at = NOW() WHERE id = ?`;
  const params = hasSchedule ? [status, schedule, id] : [status, id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(`[STATUS] Failed to update tbl_cedula:`, err);
      return res.status(500).json({ success: false, message: "Failed to update" });
    }
    if (result.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → tbl_cedula", { id });
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    res.json({ success: true, message: `Moved to ${status}` });

    fireSmsFor('tbl_cedula', id, status, schedule)
      .then(() => console.log("[SMS] done for", { table: 'tbl_cedula', id, status }))
      .catch((e) => console.error("[SMS] background error:", e?.response?.data || e));
  });
}

/* ===================================================================
   LISTS (Employee dashboard)
=================================================================== */

exports.getAllPlumbingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;
  const sql = `
    SELECT p.*, l.email
    FROM tbl_plumbing_permits p
    LEFT JOIN tb_logins l ON p.user_id = l.user_id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving plumbing permits' });
    const applications = rows.map(r => ({
      id: r.id, type: 'Plumbing Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending', submitted: r.created_at, email: r.email, user_id: r.user_id, ...r
    }));
    res.json({ success: true, applications });
  });
};

exports.getAllElectronicsPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;
  const sql = `
    SELECT e.*, l.email
    FROM tbl_electronics_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    ORDER BY e.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving electronics permits' });
    const applications = rows.map(r => ({
      id: r.id, type: 'Electronics Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending', submitted: r.created_at, email: r.email, user_id: r.user_id, ...r
    }));
    res.json({ success: true, applications });
  });
};

exports.getAllBuildingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;
  const sql = `
    SELECT b.*, l.email
    FROM tbl_building_permits b
    LEFT JOIN tb_logins l ON b.user_id = l.user_id
    ORDER BY b.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving building permits' });
    const applications = rows.map(r => ({
      id: r.id, type: 'Building Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending', submitted: r.created_at, email: r.email, user_id: r.user_id, ...r
    }));
    res.json({ success: true, applications });
  });
};

exports.getAllFencingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;
  const sql = `
    SELECT f.*, l.email
    FROM tbl_fencing_permits f
    LEFT JOIN tb_logins l ON f.user_id = l.user_id
    ORDER BY f.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving fencing permits' });
    const applications = rows.map(r => ({
      id: r.id, type: 'Fencing Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending', submitted: r.created_at, email: r.email, user_id: r.user_id, ...r
    }));
    res.json({ success: true, applications });
  });
};

/* ---- ELECTRICAL lists ---- */
exports.getAllElectricalPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;
  const sql = `
    SELECT e.*, l.email
    FROM tbl_electrical_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    ORDER BY e.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving electrical permits' });
    const applications = rows.map(r => ({
      id: r.id, type: 'Electrical Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending', submitted: r.created_at, email: r.email, user_id: r.user_id, ...r
    }));
    res.json({ success: true, applications });
  });
};

/* ---- CEDULA lists ---- */
exports.getAllCedulaForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;
  const sql = `
    SELECT c.*, l.email
    FROM tbl_cedula c
    LEFT JOIN tb_logins l ON c.user_id = l.user_id
    ORDER BY c.created_at DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving cedula applications' });
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Cedula',
      name: r.name,
      status: r.application_status || 'pending',
      application_status: r.application_status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

/* ===================================================================
   GET BY ID
=================================================================== */

exports.getPlumbingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  const sql = `
    SELECT p.*, l.email
    FROM tbl_plumbing_permits p
    LEFT JOIN tb_logins l ON p.user_id = l.user_id
    WHERE p.id = ? LIMIT 1
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
    WHERE e.id = ? LIMIT 1
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
    WHERE b.id = ? LIMIT 1
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
    WHERE f.id = ? LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving fencing permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Fencing permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

/* ---- ELECTRICAL by id ---- */
exports.getElectricalPermitById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  const sql = `
    SELECT e.*, l.email
    FROM tbl_electrical_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    WHERE e.id = ? LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving electrical permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Electrical permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

/* ---- CEDULA by id ---- */
exports.getCedulaById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  const sql = `
    SELECT c.*, l.email
    FROM tbl_cedula c
    LEFT JOIN tb_logins l ON c.user_id = l.user_id
    WHERE c.id = ? LIMIT 1
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving cedula' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Cedula not found' });
    res.json({ success: true, application: rows[0] });
  });
};

/* ===================================================================
   ACCEPT → IN-REVIEW
   (match frontend paths)
=================================================================== */

// Existing 4 permits
exports.acceptPlumbing   = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_plumbing_permits',   req.params.id, 'in-review'); };
exports.acceptElectronics= (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_electronics_permits', req.params.id, 'in-review'); };
exports.acceptBuilding   = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_building_permits',    req.params.id, 'in-review'); };
exports.acceptFencing    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_fencing_permits',     req.params.id, 'in-review'); };

// ELECTRICAL: /api/electrical-applications/:id/accept  (frontend sends {status:'in-review'})
exports.updateElectricalPermitStatus = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  // regardless of body status, we align to 'in-review' to keep UI predictable
  updateStatus(res, 'tbl_electrical_permits', id, 'in-review');
};

// CEDULA: /api/cedula-applications/:id/accept  (frontend sends {status:'in-review'})
exports.updateCedulaStatus = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  const status = (req.body?.status || 'in-review').toLowerCase();
  updateCedulaStatusGeneric(res, id, status);
};

/* ===================================================================
   MOVE: IN-REVIEW → IN-PROGRESS
=================================================================== */

exports.plumbingToInProgress    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_plumbing_permits',    req.body.applicationId || req.body.id, 'in-progress'); };
exports.electronicsToInProgress = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'in-progress'); };
exports.buildingToInProgress    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_building_permits',    req.body.applicationId || req.body.id, 'in-progress'); };
exports.fencingToInProgress     = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_fencing_permits',     req.body.applicationId || req.body.id, 'in-progress'); };

// ELECTRICAL: /api/electrical-applications/move-to-inprogress
exports.electricalToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electrical_permits', req.body.applicationId || req.body.id, 'in-progress');
};

// CEDULA: /api/cedula/move-to-inprogress (accept id or cedulaId)
// CEDULA: /api/cedula/move-to-inprogress (accept id or cedulaId)
exports.moveCedulaToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  
  // Try to get ID from params first (for /:id route), then from body, then from query
  let id = req.params?.id ? Number(req.params.id) : null;
  
  if (!id) {
    id = resolveCedulaId(req);
  }
  
  // Additional fallback for query parameter
  if (!id) {
    const fallbackId = Number(String(req.query?.id ?? "").trim());
    id = Number.isFinite(fallbackId) && fallbackId > 0 ? fallbackId : null;
  }

  if (!id) {
    console.error("[CEDULA] moveCedulaToInProgress - No valid ID found:", {
      params: req.params,
      body: req.body,
      query: req.query
    });
    return res.status(400).json({
      success: false,
      message: "Cedula ID is required. Please provide id in request body, params, or query."
    });
  }
  
  console.log("[CEDULA] moveCedulaToInProgress - Processing ID:", id);
  updateCedulaStatusGeneric(res, id, "in-progress");
};



/* ===================================================================
   MOVE: IN-PROGRESS → REQUIREMENTS-COMPLETED
=================================================================== */

exports.plumbingToRequirementsCompleted    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_plumbing_permits',    req.body.applicationId || req.body.id, 'requirements-completed'); };
exports.electronicsToRequirementsCompleted = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'requirements-completed'); };
exports.buildingToRequirementsCompleted    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_building_permits',    req.body.applicationId || req.body.id, 'requirements-completed'); };
exports.fencingToRequirementsCompleted     = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_fencing_permits',     req.body.applicationId || req.body.id, 'requirements-completed'); };

// ELECTRICAL
exports.electricalToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electrical_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

// CEDULA
exports.moveCedulaToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;

  const id = resolveCedulaId(req);
  if (!id) {
    return res.status(400).json({ success: false, message: "Cedula ID is required (id | cedulaId | applicationId)." });
  }

  updateCedulaStatusGeneric(res, id, "requirements-completed");
};


/* ===================================================================
   MOVE: REQUIREMENTS-COMPLETED → APPROVED
=================================================================== */

exports.plumbingToApproved    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_plumbing_permits',    req.body.applicationId || req.body.id, 'approved'); };
exports.electronicsToApproved = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'approved'); };
exports.buildingToApproved    = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_building_permits',    req.body.applicationId || req.body.id, 'approved'); };
exports.fencingToApproved     = (req, res) => { if (!requireAuth(req, res)) return; updateStatus(res, 'tbl_fencing_permits',     req.body.applicationId || req.body.id, 'approved'); };

// ELECTRICAL
exports.electricalToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electrical_permits', req.body.applicationId || req.body.id, 'approved');
};

// CEDULA
exports.moveCedulaToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;

  const id = resolveCedulaId(req);
  if (!id) {
    return res.status(400).json({ success: false, message: "Cedula ID is required (id | cedulaId | applicationId)." });
  }

  updateCedulaStatusGeneric(res, id, "approved");
};


/* ===================================================================
   READY FOR PICKUP (schedule)
=================================================================== */
/* ===================================================================
   READY FOR PICKUP (schedule + optional document upload)
   =================================================================== */

// BUSINESS PERMIT (business_permits)
exports.businessSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "business_permits",
    pkCol: "BusinessP_id",
    idFieldName: "applicationId",
    statusField: "status",
    appType: "business",
  });

// PLUMBING
exports.plumbingSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "tbl_plumbing_permits",
    pkCol: "id",
    idFieldName: "applicationId",
    statusField: "status",
    appType: "plumbing",
  });

// ELECTRONICS
exports.electronicsSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "tbl_electronics_permits",
    pkCol: "id",
    idFieldName: "applicationId",
    statusField: "status",
    appType: "electronics",
  });

// BUILDING
exports.buildingSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "tbl_building_permits",
    pkCol: "id",
    idFieldName: "applicationId",
    statusField: "status",
    appType: "building",
  });

// FENCING
exports.fencingSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "tbl_fencing_permits",
    pkCol: "id",
    idFieldName: "applicationId",
    statusField: "status",
    appType: "fencing",
  });

// ELECTRICAL
exports.electricalSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "tbl_electrical_permits",
    pkCol: "id",
    idFieldName: "applicationId",
    statusField: "status",
    appType: "electrical",
  });

// CEDULA
exports.cedulaSetPickup = (req, res) =>
  setPickupWithFile(req, res, {
    table: "tbl_cedula",
    pkCol: "id",
    idFieldName: "cedulaId",
    statusField: "application_status",
    appType: "cedula",
  });

// ELECTRICAL


// CEDULA
exports.moveCedulaToReadyForPickup = (req, res) => {
  if (!requireAuth(req, res)) return;

  const id = resolveCedulaId(req);
  const schedule = req.body?.schedule || null;

  if (!id) {
    return res.status(400).json({ success: false, message: "Cedula ID is required (id | cedulaId | applicationId)." });
  }

  updateCedulaStatusGeneric(res, id, "ready-for-pickup", schedule);
};


/* ===================================================================
   REJECT (electrical only — matches old route)
=================================================================== */
exports.electricalToRejected = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electrical_permits', req.body.applicationId || req.body.id, 'rejected');
};

/* ===================================================================
   REQUIREMENTS LIBRARY / COMMENTS (unchanged placeholders)
=================================================================== */

exports.listRequirementLibrary = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    const rows = await q("SELECT id, name, description, file_path FROM requirements_library ORDER BY name ASC");
    res.json({ success: true, items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to list library" });
  }
};

exports.attachRequirementFromLibrary = async (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationType, applicationId, requirementId } = req.body || {};
  if (!applicationType || !applicationId || !requirementId) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }
  try {
    await q(
      "INSERT INTO tbl_application_requirements (application_type, application_id, requirement_id, created_at) VALUES (?,?,?,NOW())",
      [applicationType, applicationId, requirementId]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Attach failed" });
  }
};






exports.getApplicationComments = async (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationType, applicationId } = req.query || {};
  try {
    const rows = await q(
      "SELECT * FROM application_comments WHERE application_type=? AND application_id=? ORDER BY created_at DESC",
      [applicationType, applicationId]
    );
    res.json({ success: true, comments: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to load comments" });
  }
};

exports.addApplicationComment = async (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationType, applicationId, comment } = req.body || {};
  if (!comment) return res.status(400).json({ success: false, message: "Comment required" });
  try {
    await q(
      "INSERT INTO application_comments (application_type, application_id, comment, employee_user_id, created_at) VALUES (?,?,?,?,NOW())",
      [applicationType, applicationId, comment, req.session.user.user_id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};


// this section is for comment
// GET /application-comments?application_type=&application_id=
// GET /application-comments?application_type=&application_id=
exports.getApplicationComments = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type = "", application_id = "" } = req.query;

  if (!application_type || !application_id) {
    return res.status(400).json({
      success: false,
      message: "application_type and application_id are required."
    });
  }

  const sql = `
    SELECT
      id,
      app_uid,
      application_type,
      application_id,
      comment,
      author_user_id,
      author_role,
      created_at,
      status_at_post
    FROM application_comments
    WHERE application_type = ? AND application_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [application_type, application_id], (err, rows) => {
    if (err) {
      console.error("getApplicationComments error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load comments" });
    }

    const items = rows.map((r) => ({
      id: r.id,
      app_uid: r.app_uid,
      application_type: r.application_type,
      application_id: r.application_id,
      comment: r.comment,
      author_user_id: r.author_user_id,
      author_role: r.author_role,
      created_at: r.created_at,
      status_at_post: r.status_at_post || null,
    }));

    res.json({ success: true, items });
  });
};
// Normalize a status into a stable key, e.g. "In Review" → "in-review"
function normalizeStatusKey(s) {
  if (!s) return null;
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");      // spaces/underscores → hyphen
}

// Look up the current status from the right table if frontend didn't send it
function fetchCurrentStatus(appType, appId, cb) {
  const map = {
    business:         { table: "business_permits",        idCol: "BusinessP_id", statusCol: "status" },
    renewal_business: { table: "business_permits",        idCol: "BusinessP_id", statusCol: "status" },
    special_sales:    { table: "business_permits",        idCol: "BusinessP_id", statusCol: "status" },
    electrical:       { table: "tbl_electrical_permits",  idCol: "id",          statusCol: "status" },
    plumbing:         { table: "tbl_plumbing_permits",    idCol: "id",          statusCol: "status" },
    electronics:      { table: "tbl_electronics_permits", idCol: "id",          statusCol: "status" },
    building:         { table: "tbl_building_permits",    idCol: "id",          statusCol: "status" },
    fencing:          { table: "tbl_fencing_permits",     idCol: "id",          statusCol: "status" },
    // cedula uses "application_status" instead of "status"
    cedula:           { table: "tbl_cedula",              idCol: "id",          statusCol: "application_status" },
    // zoning / mayors can be added later if needed
  };

  const cfg = map[appType];
  if (!cfg) return cb(null, null);

  const sql = `SELECT ${cfg.statusCol} AS s FROM ${cfg.table} WHERE ${cfg.idCol} = ? LIMIT 1`;
  db.query(sql, [appId], (err, rows) => {
    if (err) return cb(err);
    if (!rows || !rows.length) return cb(null, null);
    cb(null, rows[0].s || null);
  });
}

// POST /application-comments  body: { application_type, application_id, comment }
exports.addApplicationComment = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type, application_id, comment, status_at_post } = req.body || {};

  if (!application_type || !application_id || !comment) {
    return res.status(400).json({
      success: false,
      message: "application_type, application_id and comment are required.",
    });
  }

  const appType = String(application_type).toLowerCase();
  const appId   = Number(application_id);

  const idxSql = `
    SELECT app_uid
    FROM application_index
    WHERE application_type = ? AND application_id = ?
    LIMIT 1
  `;

  db.query(idxSql, [appType, appId], (idxErr, idxRows) => {
    if (idxErr) {
      console.error("addApplicationComment index lookup error:", idxErr);
      return res
        .status(500)
        .json({ success: false, message: "Index lookup failed" });
    }

    const app_uid = idxRows?.[0]?.app_uid || null;
    const userId  = req.session.user.user_id;

    // Try to use status from body first
    const bodyStatusKey = normalizeStatusKey(status_at_post);

    // helper to actually insert the row
    const insertComment = (finalStatusKey) => {
      const ins = `
        INSERT INTO application_comments
          (app_uid, application_type, application_id, status_at_post, comment, author_user_id, author_role, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'employee', NOW())
      `;

      db.query(
        ins,
        [app_uid, appType, appId, finalStatusKey, comment, userId],
        (insErr) => {
          if (insErr) {
            console.error("addApplicationComment insert error:", insErr);
            return res
              .status(500)
              .json({ success: false, message: "Failed to save comment" });
          }
          res.json({ success: true });
        }
      );
    };

    if (bodyStatusKey) {
      // Frontend sent a status → just normalize and use it
      return insertComment(bodyStatusKey);
    }

    // Fallback: look up current status from DB (fixes Cedula / any missing cases)
    fetchCurrentStatus(appType, appId, (stErr, currentStatus) => {
      if (stErr) {
        console.error("addApplicationComment status lookup error:", stErr);
      }
      const finalStatusKey = normalizeStatusKey(currentStatus);
      insertComment(finalStatusKey);
    });
  });
};


// GET /user/comments?application_type=&application_id=
exports.getUserComments = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type = "", application_id = "" } = req.query || {};
  const appType = String(application_type || "").toLowerCase();
  const appId = Number(application_id);

  if (!appType || !Number.isFinite(appId) || appId <= 0) {
    return res.status(400).json({
      success: false,
      message: "application_type and application_id are required.",
    });
  }

  const sql = `
    SELECT 
      id,
      comment,
      author_role,
      created_at,
      status_at_post        -- ✅ THIS WAS MISSING
    FROM application_comments
    WHERE application_type = ? AND application_id = ?
    ORDER BY created_at ASC
  `;

  db.query(sql, [appType, appId], (err, rows) => {
    if (err) {
      console.error("getUserComments error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load comments",
      });
    }

    // Return full rows including status_at_post
    const items = rows.map((r) => ({
      id: r.id,
      comment: r.comment,
      author_role: r.author_role || "employee",
      created_at: r.created_at,
      status_at_post: r.status_at_post || null,  // ✅ ADDED
    }));

    res.json({ success: true, items });
  });
};

// ========================= REQUIREMENTS LIBRARY (EMPLOYEE) =========================

// GET /requirements-library?permit_type=&office_id=&category_id=&q=
exports.listRequirementLibrary = (req, res) => {
  if (!requireAuth(req, res)) return;

  // support both names
  const incomingType = req.query.permit_type || req.query.application_type || "";
  const { office_id = "", category_id = "", q = "" } = req.query;

  let where = "WHERE dr.is_active = 1";
  const params = [];

  if (incomingType) {
    where += " AND dr.permit_type = ?";
    params.push(incomingType);
  }
  if (office_id) {
    where += " AND dr.office_id = ?";
    params.push(office_id);
  }
  if (category_id) {
    where += " AND dr.category_id = ?";
    params.push(category_id);
  }
  if (q) {
    const like = `%${q}%`;
    where += " AND (dr.name LIKE ? OR o.office_name LIKE ? OR IFNULL(c.category_name,'') LIKE ?)";
    params.push(like, like, like);
  }

  const sql = `
    SELECT
      dr.requirement_id,
      dr.name,
      dr.permit_type,
      dr.template_path,
      dr.allowed_extensions,
      dr.is_required,
      dr.instructions,
      dr.office_id,
      dr.category_id,
      o.office_name,
      c.category_name
    FROM tbl_document_requirements dr
    JOIN tbl_offices o ON o.office_id = dr.office_id
    LEFT JOIN tbl_requirement_categories c ON c.category_id = dr.category_id
    ${where}
    ORDER BY o.office_name, c.category_name, dr.name
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("listRequirementLibrary error:", err);
      return res.status(500).json({ success: false, message: "Failed to load requirements library." });
    }
    const base = `${req.protocol}://${req.get("host")}`;
    const items = rows.map(r => ({
      ...r,
      file_url: r.template_path ? `${base}${r.template_path}` : null
    }));
    res.json({ success: true, items });
  });
};

// POST /attach-requirement
// Body: { application_type, application_id, doc_requirement_id }
// --- AUTO-HEAL: ensure the (application_type, application_id) exists in application_index
function ensureAppIndexed(appType, appId, cb) {
  const map = {
    business:         { sql: 'SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1' },
    renewal_business: { sql: 'SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1' },
    special_sales:    { sql: 'SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1' },
    electrical:       { sql: 'SELECT user_id FROM tbl_electrical_permits WHERE id = ? LIMIT 1' },
    building:         { sql: 'SELECT user_id FROM tbl_building_permits WHERE id = ? LIMIT 1' },
    plumbing:         { sql: 'SELECT user_id FROM tbl_plumbing_permits WHERE id = ? LIMIT 1' },
    fencing:          { sql: 'SELECT user_id FROM tbl_fencing_permits WHERE id = ? LIMIT 1' },
    electronics:      { sql: 'SELECT user_id FROM tbl_electronics_permits WHERE id = ? LIMIT 1' },
    cedula:           { sql: 'SELECT user_id FROM tbl_cedula WHERE id = ? LIMIT 1' },
    zoning:           { sql: null },
    mayors:           { sql: null }
  };

  const entry = map[appType];
  if (!entry || !entry.sql) return cb(new Error(`Unsupported or un-indexable type: ${appType}`));

  db.query(entry.sql, [appId], (e, rows) => {
    if (e) return cb(e);
    if (!rows.length || !rows[0].user_id) return cb(new Error('Application not found to index.'));
    const userId = rows[0].user_id;

    const ins = `
      INSERT IGNORE INTO application_index (application_type, application_id, user_id, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(ins, [appType, appId, userId], (insErr) => {
      if (insErr) return cb(insErr);
      cb(null, { user_id: userId }); // app_uid will be fetched on re-query
    });
  });
}

exports.attachRequirementFromLibrary = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type, application_id, doc_requirement_id } = req.body || {};

  // ---- validation ----
  if (!application_type) {
    return res.status(400).json({ success: false, message: "application_type is required." });
  }
  if (application_id === undefined || application_id === null || application_id === "") {
    return res.status(400).json({ success: false, message: "application_id is required." });
  }
  if (!doc_requirement_id) {
    return res.status(400).json({ success: false, message: "doc_requirement_id is required." });
  }

  const appType = String(application_type).toLowerCase();
  const appId   = Number(application_id);
  const docId   = Number(doc_requirement_id);

  const ALLOWED = new Set([
    'business','renewal_business','special_sales',
    'cedula','building','electrical','plumbing',
    'fencing','electronics','zoning','mayors'
  ]);
  if (!ALLOWED.has(appType)) {
    return res.status(400).json({ success: false, message: `Unsupported application_type: ${application_type}` });
  }
  if (!Number.isFinite(appId) || appId <= 0) {
    return res.status(400).json({ success: false, message: "application_id must be a positive number." });
  }
  if (!Number.isFinite(docId) || docId <= 0) {
    return res.status(400).json({ success: false, message: "doc_requirement_id must be a positive number." });
  }

  // helper to continue after we have a valid index row
  const proceed = ({ app_uid, user_id: applicantUserId }) => {
    // ---- 2) get requirement template ----
    const getDocSql = `
      SELECT requirement_id, name, template_path
      FROM tbl_document_requirements
      WHERE requirement_id = ?
      LIMIT 1
    `;
    db.query(getDocSql, [docId], (docErr, docRows) => {
      if (docErr) {
        console.error("attachRequirementFromLibrary doc lookup error:", docErr);
        return res.status(500).json({ success: false, message: "Server error (doc lookup)." });
      }
      if (!docRows.length) {
        return res.status(404).json({ success: false, message: "Document requirement not found." });
      }
      const reqRow = docRows[0];
      if (!reqRow.template_path) {
        return res.status(400).json({ success: false, message: "This requirement has no stored PDF/template." });
      }

      // ---- 3) prevent duplicates on same app/file name ----
      const dupeSql = `
        SELECT 1
        FROM tbl_application_requirements
        WHERE application_type = ? AND application_id = ? AND file_path = ?
        LIMIT 1
      `;
      db.query(dupeSql, [appType, appId, reqRow.name], (dupeErr, dupeRows) => {
        if (dupeErr) {
          console.error("duplicate check error:", dupeErr);
          return res.status(500).json({ success: false, message: "Server error (duplicate check)." });
        }
        if (dupeRows.length) {
          return res.status(409).json({ success: false, message: "This requirement is already attached to the application." });
        }

        // ---- 4) insert, tying to app_uid and applicantUserId ----
        const ins = `
          INSERT INTO tbl_application_requirements
            (app_uid, user_id, file_path, application_type, application_id, pdf_path, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        db.query(
          ins,
          [app_uid, applicantUserId, reqRow.name, appType, appId, reqRow.template_path],
          (insErr, result) => {
            if (insErr) {
              console.error("attachRequirementFromLibrary insert error:", insErr);
              return res.status(500).json({ success: false, message: "Failed to attach requirement." });
            }
            const base = `${req.protocol}://${req.get("host")}`;
            res.json({
              success: true,
              message: "Requirement attached from library.",
              attached_id: result.insertId,
              app_uid,
              user_id: applicantUserId,
              name: reqRow.name,
              pdf_path: reqRow.template_path,
              file_url: `${base}${reqRow.template_path}`
            });
          }
        );
      });
    });
  };

  // ---- 1) resolve app_uid + applicant's user_id from application_index (with auto-heal) ----
  const getAppUid = `
    SELECT app_uid, user_id
    FROM application_index
    WHERE application_type = ? AND application_id = ?
    LIMIT 1
  `;
  db.query(getAppUid, [appType, appId], (idxErr, idxRows) => {
    if (idxErr) {
      console.error("attachRequirementFromLibrary index lookup error:", idxErr);
      return res.status(500).json({ success: false, message: "Server error (application index lookup)." });
    }

    if (!idxRows.length) {
      // auto-create the missing index row, then re-query
      return ensureAppIndexed(appType, appId, (healErr) => {
        if (healErr) {
          console.error("ensureAppIndexed error:", healErr);
          return res.status(404).json({ success:false, message:"Application not indexed." });
        }
        db.query(getAppUid, [appType, appId], (reErr, reRows) => {
          if (reErr) {
            console.error("re-query index error:", reErr);
            return res.status(500).json({ success:false, message:"Server error (re-lookup index)." });
          }
          if (!reRows.length) {
            return res.status(404).json({ success:false, message:"Application not indexed." });
          }
          proceed(reRows[0]);
        });
      });
    }

    proceed(idxRows[0]);
  });
};

// GET /attached-requirements?application_type=&application_id=
// GET /attached-requirements?application_type=&application_id=
exports.getAttachedRequirements = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type = "", application_id = "" } = req.query;
  if (!application_type || !application_id) {
    return res.status(400).json({
      success: false,
      message: "Missing application_type or application_id.",
    });
  }

  const sql = `
    SELECT
      requirement_id,
      user_id,
      file_path,
      application_type,
      application_id,
      pdf_path,
      user_upload_path,
      uploaded_at,
      user_uploaded_at
    FROM tbl_application_requirements
    WHERE application_type = ? AND application_id = ?
    ORDER BY uploaded_at DESC
  `;

  db.query(sql, [application_type, application_id], (err, rows) => {
    if (err) {
      console.error("getAttachedRequirements error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load attached requirements." });
    }

    const base = `${req.protocol}://${req.get("host")}`;
    const items = rows.map((r) => ({
      ...r,
      // system template
      file_url: r.pdf_path ? `${base}${r.pdf_path}` : null,
      // user-uploaded filled requirement
      user_file_url: r.user_upload_path ? `${base}${r.user_upload_path}` : null,
    }));

    console.log(
      "[ATTACHED-REQ] type=%s id=%s rows=%d",
      application_type,
      application_id,
      items.length
    );

    res.json({ success: true, items });
  });
};

exports.removeAttachedRequirement = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { requirement_id } = req.body || {};
  const rid = Number(requirement_id);

  if (!Number.isFinite(rid) || rid <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid requirement_id is required.",
    });
  }

  const sql = `
    DELETE FROM tbl_application_requirements
    WHERE requirement_id = ?
    LIMIT 1
  `;

  db.query(sql, [rid], (err, result) => {
    if (err) {
      console.error("removeAttachedRequirement error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to remove attached requirement." });
    }

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Attached requirement not found." });
    }

    return res.json({
      success: true,
      message: "Attached requirement removed.",
      requirement_id: rid,
    });
  });
};
// auto pdf__________________________________________________________________________________________________________
function normalizeCheck(val) {
  const v = String(val || "").toLowerCase();
  if (v === "yes" || v === "no" || v === "not_needed") return v;
  if (v === "not needed" || v === "not-needed") return "not_needed";
  return "not_needed";
}

/**
 * Insert or update LGU verification (page 2) for a business permit.
 * checks = {
 *   occupancy_permit, zoning_clearance, barangay_clearance,
 *   sanitary_clearance, environment_certificate, market_clearance,
 *   fire_safety_certificate, river_floating_fish
 * }
 */
function upsertBusinessPermitVerification(businessId, checks = {}) {
  return new Promise((resolve, reject) => {
    const values = {
      occupancy_permit:        normalizeCheck(checks.occupancy_permit),
      zoning_clearance:        normalizeCheck(checks.zoning_clearance),
      barangay_clearance:      normalizeCheck(checks.barangay_clearance),
      sanitary_clearance:      normalizeCheck(checks.sanitary_clearance),
      environment_certificate: normalizeCheck(checks.environment_certificate),
      market_clearance:        normalizeCheck(checks.market_clearance),
      fire_safety_certificate: normalizeCheck(checks.fire_safety_certificate),
      river_floating_fish:     normalizeCheck(checks.river_floating_fish),
    };

    const sel = `
      SELECT id
      FROM business_permit_doc_verification
      WHERE BusinessP_id = ?
      LIMIT 1
    `;
    db.query(sel, [businessId], (err, rows) => {
      if (err) return reject(err);

      const params = [
        values.occupancy_permit,
        values.zoning_clearance,
        values.barangay_clearance,
        values.sanitary_clearance,
        values.environment_certificate,
        values.market_clearance,
        values.fire_safety_certificate,
        values.river_floating_fish,
      ];

      if (rows.length) {
        const upd = `
          UPDATE business_permit_doc_verification
          SET occupancy_permit = ?,
              zoning_clearance = ?,
              barangay_clearance = ?,
              sanitary_clearance = ?,
              environment_certificate = ?,
              market_clearance = ?,
              fire_safety_certificate = ?,
              river_floating_fish = ?
          WHERE BusinessP_id = ?
        `;
        db.query(upd, [...params, businessId], (uErr) => {
          if (uErr) return reject(uErr);
          resolve();
        });
      } else {
        const ins = `
          INSERT INTO business_permit_doc_verification (
            BusinessP_id,
            occupancy_permit,
            zoning_clearance,
            barangay_clearance,
            sanitary_clearance,
            environment_certificate,
            market_clearance,
            fire_safety_certificate,
            river_floating_fish
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(ins, [businessId, ...params], (iErr) => {
          if (iErr) return reject(iErr);
          resolve();
        });
      }
    });
  });
}

/**
 * Create 2-page PDF (page 1: applicant info, page 2: LGU verification)
 * from the scanned template. Returns the **DB path** (e.g. "/uploads/requirements/....pdf").
 */
async function createBusinessPermitFilledPdf(businessRow, checks = {}) {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "business_permit_full_template.pdf" // overwrite old template with the good one
  );

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 9;

  const { height } = page1.getSize();

  const draw1 = (text, x, y) => {
    if (text === undefined || text === null || text === "") return;
    page1.drawText(String(text), {
      x,
      y,
      size: fontSize,
      font,
    });
  };

  const draw2 = (text, x, y) => {
    if (text === undefined || text === null || text === "") return;
    page2.drawText(String(text), {
      x,
      y,
      size: fontSize,
      font,
    });
  };

  // ---------- PAGE 1 Y-COORDS (based on real template scan) ----------
  // (values are already converted to pdf-lib coordinates, origin bottom-left)

  const Y_NEW_RENEWAL = 703;         // "NEW / RENEWAL  Mode of Payment"
  const Y_DATE_APP     = 689;        // "Date of Application / TIN No."
  const Y_DTI_REG      = 675;        // "DTI/SEC/CDA Registration / Date of Registration"
  const Y_TYPE_BUS     = 661;        // "Type of Business"
  const Y_AMEND        = 647;        // "Amendment: From / To"
  const Y_TAX_INCENT   = 633;        // "Are enjoying tax incentive..."
  const Y_NAME_LINE    = 571;        // "Last Name / First Name / Middle Name"
  const Y_BUS_NAME     = 553;        // "Business Name"
  const Y_TRADE_NAME   = 539;        // "Trade Name / Franchise"
  const Y_BUS_ADDR     = 485;        // "Business Address"
  const Y_BUS_POSTAL   = 473;        // "Postal Code / Email Address"
  const Y_BUS_TEL      = 459;        // "Telephone No. / Mobile No."
  const Y_OWNER_ADDR   = 441;        // "Owner's Address"
  const Y_OWNER_POSTAL = 427;        // "Postal Code / Email Address" (owner)
  const Y_OWNER_TEL    = 413;        // "Telephone No. / Mobile No." (owner)
  const Y_EMERG_NAME   = 395;        // "In case of emergency..."
  const Y_EMERG_CONTACT= 381;        // "Telephone / Mobile / Email" (emergency)
  const Y_BUS_AREA     = 369;        // "Business Area (in sq.m.) / Total No. of Employees..."

  // some X helpers
  const X_COL1  = 150; // left field in a line
  const X_COL2  = 390; // right field in a line
  const X_NAME1 = 115; // Last Name
  const X_NAME2 = 280; // First Name
  const X_NAME3 = 445; // Middle Name

  // ---------- PAGE 1: top (NEW / RENEWAL + payment) ----------
  // We don’t try to hit the tiny checkboxes; just place text near them.

  if (businessRow.application_type) {
    draw1(
      String(businessRow.application_type).toUpperCase(),
      80,
      Y_NEW_RENEWAL
    );
  }

  if (businessRow.payment_mode) {
    draw1(
      String(businessRow.payment_mode).toLowerCase(), // e.g., "annually", "semi-annually"
      260,
      Y_NEW_RENEWAL
    );
  }

  // Date of Application / TIN
  if (businessRow.application_date) {
    draw1(
      new Date(businessRow.application_date).toLocaleDateString(),
      X_COL1,
      Y_DATE_APP
    );
  }
  draw1(businessRow.tin_no || "", X_COL2, Y_DATE_APP);

  // DTI/SEC/CDA Registration / Date of Registration
  draw1(businessRow.registration_no || "", X_COL1, Y_DTI_REG);
  if (businessRow.registration_date) {
    draw1(
      new Date(businessRow.registration_date).toLocaleDateString(),
      X_COL2,
      Y_DTI_REG
    );
  }

  // Type of Business (simple text – user can still manually tick the checkboxes)
  draw1(businessRow.type_of_business || "", X_COL1, Y_TYPE_BUS);

  // Amendment (optional)
  draw1(businessRow.amendment_from || "", X_COL1, Y_AMEND);
  draw1(businessRow.amendment_to || "", X_COL2, Y_AMEND);

  // Tax incentive
  if (businessRow.tax_incentive) {
    const label =
      String(businessRow.tax_incentive).toLowerCase() === "yes" ? "Yes" : "No";
    draw1(label, 470, Y_TAX_INCENT);
  }

  // ---------- PAGE 1: taxpayer name ----------
  draw1(businessRow.last_name || "",  X_NAME1, Y_NAME_LINE);
  draw1(businessRow.first_name || "", X_NAME2, Y_NAME_LINE);
  draw1(businessRow.middle_name || "", X_NAME3, Y_NAME_LINE);

  // ---------- PAGE 1: business names ----------
  draw1(businessRow.business_name || "", X_COL1, Y_BUS_NAME);
  draw1(businessRow.trade_name || "",   X_COL1, Y_TRADE_NAME);

  // ---------- PAGE 1: business contact info ----------
  draw1(businessRow.business_address || "", X_COL1, Y_BUS_ADDR);
  draw1(businessRow.postal_code || "",      X_COL1, Y_BUS_POSTAL);
  draw1(businessRow.business_email || "",   X_COL2, Y_BUS_POSTAL);
  draw1(businessRow.business_telephone || "", X_COL1, Y_BUS_TEL);
  // If you have a business mobile field, you can place it here:
  // draw1(businessRow.business_mobile || "", X_COL2, Y_BUS_TEL);

  // ---------- PAGE 1: owner info ----------
  draw1(businessRow.owner_address || "",      X_COL1, Y_OWNER_ADDR);
  draw1(businessRow.owner_postal || "",       X_COL1, Y_OWNER_POSTAL);
  draw1(businessRow.owner_email || "",        X_COL2, Y_OWNER_POSTAL);
  draw1(businessRow.owner_telephone || "",    X_COL1, Y_OWNER_TEL);
  draw1(businessRow.owner_mobile || "",       X_COL2, Y_OWNER_TEL);

  // ---------- PAGE 1: emergency contact ----------
  draw1(businessRow.emergency_contact || "", X_COL1, Y_EMERG_NAME);
  draw1(businessRow.emergency_phone || "",   X_COL1, Y_EMERG_CONTACT);
  draw1(businessRow.emergency_email || "",   X_COL2, Y_EMERG_CONTACT);

  // ---------- PAGE 1: business area & employees ----------
  draw1(String(businessRow.business_area || ""),           X_COL1, Y_BUS_AREA);
  draw1(String(businessRow.total_employees_male || ""),    300,    Y_BUS_AREA);
  draw1(String(businessRow.total_employees_female || ""),  385,    Y_BUS_AREA);
  draw1(String(businessRow.employees_within_lgu || ""),    500,    Y_BUS_AREA);

  // ---------- PAGE 2: LGU verification (checkbox-like X marks) ----------
  const norm = (val) => {
    const v = String(val || "").toLowerCase();
    if (v === "yes" || v === "no" || v === "not_needed") return v;
    if (v === "not needed" || v === "not-needed") return "not_needed";
    return "not_needed";
  };

  const normalizedChecks = {
    occupancy_permit:        norm(checks.occupancy_permit),
    zoning_clearance:        norm(checks.zoning_clearance),
    barangay_clearance:      norm(checks.barangay_clearance),
    sanitary_clearance:      norm(checks.sanitary_clearance),
    environment_certificate: norm(checks.environment_certificate),
    market_clearance:        norm(checks.market_clearance),
    fire_safety_certificate: norm(checks.fire_safety_certificate),
    river_floating_fish:     norm(checks.river_floating_fish),
  };

  // approximate centers of Yes / No / Not Needed boxes
  const YES_X = 470;
  const NO_X  = 500;
  const NN_X  = 530;

  function markCheck(rowY, status) {
    let x;
    if (status === "yes") x = YES_X;
    else if (status === "no") x = NO_X;
    else x = NN_X;

    page2.drawText("X", {
      x,
      y: rowY,
      size: 10,
      font,
    });
  }

  // real row Y’s based on template scan
  const rowYs = [
    707, // Occupancy Permit (For New)
    689, // Zoning (New and Renewal)
    671, // Barangay Clearance (For Renewal)
    653, // Sanitary / Health
    635, // Municipal Environmental Certificate
    617, // Market Clearance
    599, // Valid Fire Safety Inspection Certificate
    581, // Registration / Floating Fish Cage
  ];

  markCheck(rowYs[0], normalizedChecks.occupancy_permit);
  markCheck(rowYs[1], normalizedChecks.zoning_clearance);
  markCheck(rowYs[2], normalizedChecks.barangay_clearance);
  markCheck(rowYs[3], normalizedChecks.sanitary_clearance);
  markCheck(rowYs[4], normalizedChecks.environment_certificate);
  markCheck(rowYs[5], normalizedChecks.market_clearance);
  markCheck(rowYs[6], normalizedChecks.fire_safety_certificate);
  markCheck(rowYs[7], normalizedChecks.river_floating_fish);

  // ---------- Save combined PDF ----------
  const pdfBytes = await pdfDoc.save();

  const outDir = path.join(__dirname, "..", "uploads", "requirements");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const fileName = `business_permit_${businessRow.BusinessP_id}_lgu_form.pdf`;
  const absPath = path.join(outDir, fileName);
  fs.writeFileSync(absPath, pdfBytes);

  // path stored in DB (served via express.static('/uploads'))
  const dbPath = `/uploads/requirements/${fileName}`;
  return dbPath;
}

exports.generateBusinessPermitForm = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type, application_id, checks = {} } = req.body || {};

  if (!application_type) {
    return res
      .status(400)
      .json({ success: false, message: "application_type is required." });
  }
  if (!application_id) {
    return res
      .status(400)
      .json({ success: false, message: "application_id is required." });
  }

  const appType = String(application_type).toLowerCase();
  const appId = Number(application_id);

  const SUPPORTED = new Set(["business", "renewal_business", "special_sales"]);
  if (!SUPPORTED.has(appType)) {
    return res.status(400).json({
      success: false,
      message: `generateBusinessPermitForm only supports business/renewal_business/special_sales (got: ${application_type})`,
    });
  }
  if (!Number.isFinite(appId) || appId <= 0) {
    return res.status(400).json({
      success: false,
      message: "application_id must be a positive number.",
    });
  }

  // 1) load business_permits row
  const sql = `
    SELECT *
    FROM business_permits
    WHERE BusinessP_id = ?
    LIMIT 1
  `;

  db.query(sql, [appId], async (err, rows) => {
    if (err) {
      console.error("generateBusinessPermitForm: load business err:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error loading application." });
    }
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Business permit not found." });
    }

    const businessRow = rows[0];

    try {
      // 2) save LGU verification selections
      await upsertBusinessPermitVerification(appId, checks);

      // 3) build PDF and get dbPath (e.g. /uploads/requirements/...)
      const pdfDbPath = await createBusinessPermitFilledPdf(
        businessRow,
        checks
      );

      // 4) update original business_permits.filled_up_forms (so it shows under "Uploaded Requirements")
      const upd = `
        UPDATE business_permits
        SET filled_up_forms = ?
        WHERE BusinessP_id = ?
      `;
      await new Promise((resolve, reject) => {
        db.query(upd, [pdfDbPath, appId], (uErr) =>
          uErr ? reject(uErr) : resolve()
        );
      });

      // 5) ensure application_index entry exists (reuse ensureAppIndexed)
      const getAppUid = `
        SELECT app_uid, user_id
        FROM application_index
        WHERE application_type = ? AND application_id = ?
        LIMIT 1
      `;

      const { app_uid, user_id: applicantUserId } =
        await new Promise((resolve, reject) => {
          db.query(getAppUid, [appType, appId], (idxErr, idxRows) => {
            if (idxErr) return reject(idxErr);
            if (!idxRows.length) {
              // auto-create
              return ensureAppIndexed(appType, appId, (healErr) => {
                if (healErr) return reject(healErr);
                db.query(getAppUid, [appType, appId], (reErr, reRows) => {
                  if (reErr) return reject(reErr);
                  if (!reRows.length)
                    return reject(
                      new Error("Application not indexed after auto-heal.")
                    );
                  resolve(reRows[0]);
                });
              });
            }
            resolve(idxRows[0]);
          });
        });

      // 6) attach into tbl_application_requirements (avoid duplicate by file_path)
      const FILE_LABEL = "Business Permit LGU Form";

      const dupeSql = `
        SELECT requirement_id
        FROM tbl_application_requirements
        WHERE application_type = ? AND application_id = ? AND file_path = ?
        LIMIT 1
      `;

      const existing = await new Promise((resolve, reject) => {
        db.query(
          dupeSql,
          [appType, appId, FILE_LABEL],
          (dErr, dRows) => (dErr ? reject(dErr) : resolve(dRows[0]))
        );
      });

      if (existing) {
        const updReq = `
          UPDATE tbl_application_requirements
          SET pdf_path = ?, uploaded_at = NOW()
          WHERE requirement_id = ?
        `;
        await new Promise((resolve, reject) => {
          db.query(
            updReq,
            [pdfDbPath, existing.requirement_id],
            (uErr) => (uErr ? reject(uErr) : resolve())
          );
        });
      } else {
        const insReq = `
          INSERT INTO tbl_application_requirements
            (app_uid, user_id, file_path, application_type, application_id, pdf_path, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        await new Promise((resolve, reject) => {
          db.query(
            insReq,
            [
              app_uid,
              applicantUserId,
              FILE_LABEL,
              appType,
              appId,
              pdfDbPath,
            ],
            (iErr) => (iErr ? reject(iErr) : resolve())
          );
        });
      }

      const base = `${req.protocol}://${req.get("host")}`;

      return res.json({
        success: true,
        message: "Business permit LGU form generated and attached.",
        pdf_path: pdfDbPath,
        file_url: `${base}${pdfDbPath}`,
      });
    } catch (e) {
      console.error("generateBusinessPermitForm error:", e);
      return res.status(500).json({
        success: false,
        message: "Failed to generate LGU form.",
      });
    }
  });
};

