// Controller/cedulaController.js
const db = require('../db/dbconnect');
const axios = require('axios');
const nodemailer = require('nodemailer');

// ====== ENV CORE (SMS + EMAIL) ======
const {
  IPROG_API_TOKEN,
  SMS_ENABLED = 'true',
  EMAIL_ENABLED = 'true',
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

// tiny db->promise helper for SMS/email lookups/flag checks
function q(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );
}

// SMS feature flag from DB (fallback to .env)
async function getSmsEnabledFlag() {
  try {
    const rows = await q('SELECT v FROM system_settings WHERE k="sms_enabled" LIMIT 1');
    if (rows && rows[0]) return rows[0].v === 'true';
  } catch (_) {}
  return String(SMS_ENABLED).toLowerCase() === 'true';
}

// EMAIL feature flag
function getEmailEnabledFlag() {
  return String(EMAIL_ENABLED || 'true').toLowerCase() === 'true';
}

// normalize to 639xxxxxxxxx
function normPhone(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/\D/g, '');
  if (s.startsWith('09')) s = '63' + s.slice(1);
  else if (s.startsWith('9') && s.length === 10) s = '63' + s;
  else if (s.startsWith('0') && s.length === 11) s = '63' + s.slice(1);
  else if (s.startsWith('+63')) s = s.replace('+', '');
  return s;
}

/* ===================================================================
   SMS HELPERS (unchanged behaviour)
=================================================================== */

async function iprogSend({ phone, message }) {
  const url = 'https://sms.iprogtech.com/api/v1/sms_messages';
  const params = {
    api_token: IPROG_API_TOKEN,
    phone_number: normPhone(phone),
    message: String(message || '').slice(0, 306),
  };

  console.log('[SMS] SEND →', { url, params });
  const res = await axios.post(url, null, {
    params,
    timeout: 15000,
    validateStatus: () => true,
  });
  console.log('[SMS] SEND ←', res.status, res.data);

  if (res.status >= 200 && res.status < 300) return res.data;
  const err = new Error('IPROG send failed');
  err.response = res;
  throw err;
}

async function getCedulaUserPhone(cedulaId) {
  // 1) get user_id from cedula  2) get phone_number from tbl_user_info
  const rows = await q('SELECT user_id FROM tbl_cedula WHERE id=? LIMIT 1', [cedulaId]);
  const userId = rows?.[0]?.user_id || null;
  if (!userId) return null;
  const pr = await q('SELECT phone_number FROM tbl_user_info WHERE user_id=? LIMIT 1', [userId]);
  return pr?.[0]?.phone_number || null;
}

// NEW: get email from tb_logins via cedula.user_id
async function getCedulaUserEmail(cedulaId) {
  const rows = await q('SELECT user_id FROM tbl_cedula WHERE id=? LIMIT 1', [cedulaId]);
  const userId = rows?.[0]?.user_id || null;
  if (!userId) return null;
  const er = await q('SELECT email FROM tb_logins WHERE user_id=? LIMIT 1', [userId]);
  return er?.[0]?.email || null;
}

// shared status note for SMS + EMAIL
function cedulaStatusNote(status, schedule) {
  switch (status) {
    case 'in-review':
      return 'Your cedula application is under review. Please monitor your requirements in the portal.';
    case 'in-progress':
      return 'Requirements are pending. Upload the needed files to continue.';
    case 'requirements-completed':
      return 'All requirements received. Await final approval.';
    case 'approved':
      return 'Approved. Watch your portal for pickup instructions.';
    case 'ready-for-pickup':
      return schedule
        ? `Ready for pickup on ${schedule}. Bring a valid ID.`
        : 'Ready for pickup. Bring a valid ID.';
    case 'rejected':
      return 'Not approved. See details in your portal.';
    default:
      return 'See your account for details.';
  }
}

function buildCedulaMessage({ status, schedule }) {
  const office = 'Business Permit & Licensing Office';
  const statusNote = cedulaStatusNote(status, schedule);

  const lines = [
    office,
    'Cedula Application',
    `Status: ${status}`,
    statusNote,
  ].filter(Boolean);

  return lines.join('\n').slice(0, 306);
}

async function sendCedulaStatusSms(cedulaId, status, schedule = null) {
  try {
    const smsOn = await getSmsEnabledFlag();
    if (!smsOn) {
      console.log('[SMS] Skipped (disabled)');
      return;
    }
    const phone = await getCedulaUserPhone(cedulaId);
    if (!phone) {
      console.log('[SMS] No phone found for cedula id', cedulaId);
      return;
    }
    const message = buildCedulaMessage({ status, schedule });
    console.log('[SMS] Will send →', { cedulaId, status, phone: normPhone(phone) });
    await iprogSend({ phone, message });
  } catch (e) {
    console.error('[SMS] sendCedulaStatusSms error:', e?.response?.status, e?.response?.data || e);
  }
}

/* ===================================================================
   EMAIL CORE (Cedula)
=================================================================== */

let emailTransporter = null;

function getEmailTransporter() {
  if (!getEmailEnabledFlag()) return null;
  if (emailTransporter) return emailTransporter;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[EMAIL] Missing SMTP config, emails disabled.');
    return null;
  }

  emailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return emailTransporter;
}

async function sendEmail(options = {}) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log('[EMAIL] Skipped (no transporter / disabled)');
    return;
  }

  const { to, subject, text, html } = options;

  if (!to || !subject || (!text && !html)) {
    console.warn('[EMAIL] Missing required fields', { to, subject });
    return;
  }

  const mailOptions = {
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
    html: html || undefined,
  };

  console.log('[EMAIL] SEND →', { to, subject });
  const info = await transporter.sendMail(mailOptions);
  console.log('[EMAIL] SENT ←', info.messageId);
}

function buildEmailSubject({ applicationTypeLabel, applicationNo, newStatus }) {
  if (applicationNo) {
    return `${applicationTypeLabel || 'Application'} #${applicationNo} - ${newStatus}`;
  }
  return `${applicationTypeLabel || 'Application'} - ${newStatus}`;
}

function buildEmailBodyText({
  officeName,
  applicationTypeLabel,
  applicationNo,
  newStatus,
  extraNote,
}) {
  const lines = [
    officeName || 'Municipal Office',
    '',
    `${applicationTypeLabel || 'Application'} ${applicationNo ? `#${applicationNo}` : ''}`.trim(),
    `Status: ${newStatus}`,
    '',
    extraNote ||
      'Please login to your account to view the full details of your application.',
    '',
    'This is an automated notification from the Municipal Permits System.',
  ].filter(Boolean);

  return lines.join('\n');
}

function buildEmailBodyHtml({
  officeName,
  applicationTypeLabel,
  applicationNo,
  newStatus,
  extraNote,
}) {
  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827;">
      <h2 style="margin: 0 0 8px 0; color: #1f2937;">${officeName || 'Municipal Office'}</h2>
      <p style="margin: 0 0 12px 0;">
        <strong>${applicationTypeLabel || 'Application'}${applicationNo ? ` #${applicationNo}` : ''}</strong><br/>
        Status: <strong>${newStatus}</strong>
      </p>
      <p style="margin: 0 0 12px 0;">${
        extraNote ||
        'Please login to your account to view the full details of your application.'
      }</p>
      <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
        This is an automated notification from the Municipal Permits System.
      </p>
    </div>
  `;
}

async function sendCedulaStatusEmail(cedulaId, status, schedule = null) {
  try {
    if (!getEmailEnabledFlag()) {
      console.log('[EMAIL] Skipped (disabled)');
      return;
    }

    const email = await getCedulaUserEmail(cedulaId);
    if (!email) {
      console.log('[EMAIL] No email found for cedula id', cedulaId);
      return;
    }

    const office = 'Business Permit & Licensing Office';
    const label = 'Cedula Application';
    const extraNote = cedulaStatusNote(status, schedule);

    const subject = buildEmailSubject({
      applicationTypeLabel: label,
      applicationNo: cedulaId, // optional
      newStatus: status,
    });

    const text = buildEmailBodyText({
      officeName: office,
      applicationTypeLabel: label,
      applicationNo: cedulaId,
      newStatus: status,
      extraNote,
    });

    const html = buildEmailBodyHtml({
      officeName: office,
      applicationTypeLabel: label,
      applicationNo: cedulaId,
      newStatus: status,
      extraNote,
    });

    await sendEmail({ to: email, subject, text, html });

    console.log('[EMAIL] sent for cedula', { cedulaId, status, email });
  } catch (e) {
    console.error('[EMAIL] sendCedulaStatusEmail error:', e);
  }
}

/* ===================================================================
   Existing handlers (logic kept intact, now with SMS + EMAIL calls)
=================================================================== */

// Create/Submit Cedula (no SMS/EMAIL here; employees trigger status changes)
exports.submitCedula = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;
    const {
      name,
      address,
      placeOfBirth,
      dateOfBirth,
      profession,
      yearlyIncome,
      purpose,
      sex,
      status,
      tin
    } = req.body;

    if (!name || !address || !placeOfBirth || !dateOfBirth || !profession ||
        !yearlyIncome || !purpose || !sex || !status || !tin) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!['male', 'female'].includes(sex)) {
      return res.status(400).json({ message: "Invalid sex value" });
    }
    if (!['single', 'married', 'widowed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    if (isNaN(yearlyIncome) || parseFloat(yearlyIncome) < 0) {
      return res.status(400).json({ message: "Invalid yearly income" });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        return res.status(500).json({
          message: "Database transaction error",
          error: err.message
        });
      }

      const sql = `INSERT INTO tbl_cedula (
        name, address, place_of_birth, date_of_birth, profession, 
        yearly_income, purpose, sex, status, tin, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        name,
        address,
        placeOfBirth,
        dateOfBirth,
        profession,
        parseFloat(yearlyIncome),
        purpose,
        sex,
        status,
        tin,
        userId
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Cedula insert failed:", err);
          return db.rollback(() => {
            res.status(500).json({
              message: "Failed to submit cedula application",
              error: err.message
            });
          });
        }

        const cedulaId = result.insertId;

        const updateFormAccessSql = `UPDATE tbl_payment_receipts 
          SET form_access_used = 1, 
              form_access_used_at = CURRENT_TIMESTAMP,
              form_submitted = 1,
              form_submitted_at = CURRENT_TIMESTAMP,
              related_application_id = ?
          WHERE user_id = ? 
          AND application_type = 'cedula' 
          AND payment_status = 'approved' 
          AND form_access_granted = 1 
          AND form_access_used = 0
          ORDER BY created_at DESC 
          LIMIT 1`;

        db.query(updateFormAccessSql, [cedulaId, userId], (formAccessErr) => {
          if (formAccessErr) {
            console.error("Form access update failed:", formAccessErr);
            console.warn("Cedula submitted successfully but form access update failed");
          }

          db.commit((commitErr) => {
            if (commitErr) {
              console.error("Commit failed:", commitErr);
              return db.rollback(() => {
                res.status(500).json({
                  message: "Commit failed",
                  error: commitErr.message
                });
              });
            }

            res.status(201).json({
              success: true,
              message: "Cedula application submitted successfully",
              cedulaId: cedulaId,
              formAccessUpdated: !formAccessErr
            });
          });
        });
      });
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
};

// Employee list (unchanged)
exports.getAllCedulaForEmployee = (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const sql = `
    SELECT c.*, l.email
    FROM tbl_cedula c
    LEFT JOIN tb_logins l ON c.user_id = l.user_id
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching cedula applications:", err);
      return res.status(500).json({ success: false, message: "Error retrieving cedula applications" });
    }

    const transformedResults = results.map(app => ({
      id: app.id,
      type: 'Cedula',
      name: app.name,
      status: app.application_status || 'pending',
      application_status: app.application_status || 'pending',
      submitted: app.created_at,
      email: app.email,
      user_id: app.user_id,
      ...app
    }));

    res.json({ success: true, applications: transformedResults });
  });
};

// Get single Cedula by ID (unchanged)
exports.getCedulaById = (req, res) => {
  const cedulaId = req.params.id;
  console.log("📥 Cedula ID received:", cedulaId);

  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const sql = `
    SELECT c.*, l.email
    FROM tbl_cedula c
    LEFT JOIN tb_logins l ON c.user_id = l.user_id
    WHERE c.id = ?
  `;

  db.query(sql, [cedulaId], (err, results) => {
    if (err) {
      console.error("❌ SQL Error fetching cedula details:", err);
      return res.status(500).json({ success: false, message: "Server error retrieving cedula details" });
    }

    if (!results || results.length === 0) {
      console.warn("⚠️ No Cedula record found for ID:", cedulaId);
      return res.status(404).json({ success: false, message: "Cedula application not found" });
    }

    const cedula = results[0];

    const transformedCedula = {
      id: cedula.id,
      type: 'Cedula',
      name: cedula.name,
      address: cedula.address,
      place_of_birth: cedula.place_of_birth,
      date_of_birth: cedula.date_of_birth,
      profession: cedula.profession,
      yearly_income: cedula.yearly_income,
      purpose: cedula.purpose,
      sex: cedula.sex,
      civil_status: cedula.status,
      tin: cedula.tin,
      created_at: cedula.created_at,
      updated_at: cedula.updated_at,
      email: cedula.email,
      user_id: cedula.user_id,
      status: cedula.application_status || 'pending'
    };

    console.log("✅ Cedula details sent:", transformedCedula);

    return res.json({ success: true, application: transformedCedula });
  });
};

// Tracking (unchanged)
exports.getCedulasForTracking = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;

    const sql = `
      SELECT 
        id, name, address, place_of_birth, date_of_birth, profession,
        yearly_income, purpose, sex, status, tin, application_status,
        created_at, updated_at
      FROM tbl_cedula 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get cedulas for tracking failed:", err);
        return res.status(500).json({
          message: "Failed to retrieve cedula records",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        cedulas: results
      });
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
};

// Not used (unchanged)
exports.getUserCedulas = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;
    const sql = `SELECT * FROM tbl_cedula WHERE user_id = ? ORDER BY created_at DESC`;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get cedulas failed:", err);
        return res.status(500).json({
          message: "Failed to retrieve cedula records",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        cedulas: results
      });
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
};

// Not used (unchanged)
exports.updateCedula = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;
    const cedulaId = req.params.id;
    const {
      name,
      address,
      placeOfBirth,
      dateOfBirth,
      profession,
      yearlyIncome,
      purpose,
      sex,
      status,
      tin
    } = req.body;

    if (!name || !address || !placeOfBirth || !dateOfBirth || !profession ||
        !yearlyIncome || !purpose || !sex || !status || !tin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `UPDATE tbl_cedula SET 
      name = ?, address = ?, place_of_birth = ?, date_of_birth = ?, 
      profession = ?, yearly_income = ?, purpose = ?, sex = ?, status = ?, tin = ?
      WHERE id = ? AND user_id = ?`;

    const values = [
      name, address, placeOfBirth, dateOfBirth, profession,
      parseFloat(yearlyIncome), purpose, sex, status, tin, cedulaId, userId
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Cedula update failed:", err);
        return res.status(500).json({
          message: "Failed to update cedula application",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cedula record not found" });
      }

      res.status(200).json({
        success: true,
        message: "Cedula application updated successfully"
      });
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
};

// Not used (unchanged)
exports.deleteCedula = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;
    const cedulaId = req.params.id;

    const sql = `DELETE FROM tbl_cedula WHERE id = ? AND user_id = ?`;

    db.query(sql, [cedulaId, userId], (err, result) => {
      if (err) {
        console.error("Cedula delete failed:", err);
        return res.status(500).json({
          message: "Failed to delete cedula application",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cedula record not found" });
      }

      res.status(200).json({
        success: true,
        message: "Cedula application deleted successfully"
      });
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
};

// ================== EMPLOYEE ACTIONS w/ SMS + EMAIL ==================

// Generic status update (e.g. from modal)
exports.updateCedulaStatus = (req, res) => {
  const cedulaId = req.params.id;
  const { status } = req.body;

  console.log("🔥 Body received from frontend:", req.body);

  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  if (!status) {
    console.warn("⚠️ Missing status in request body.");
    return res.status(400).json({ success: false, message: "Status is required." });
  }

  const sql = `UPDATE tbl_cedula SET application_status = ?, updated_at = NOW() WHERE id = ?`;

  db.query(sql, [status, cedulaId], async (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ success: false, message: "Error updating cedula status" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula application not found" });
    }

    res.json({ success: true, message: "Cedula application status updated successfully" });

    const s = String(status).toLowerCase();
    await sendCedulaStatusSms(cedulaId, s);
    await sendCedulaStatusEmail(cedulaId, s);
  });
};

exports.moveCedulaToInProgress = (req, res) => {
  console.log("📨 Received body:", req.body);
  const { id } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!id) {
    return res.status(400).json({ success: false, message: "Cedula ID is required." });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'in-progress', updated_at = NOW() 
    WHERE id = ?
  `;

  db.query(sql, [id], async (err, result) => {
    if (err) {
      console.error("Error updating to in-progress:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula not found." });
    }

    res.json({ success: true, message: "Cedula moved to in-progress." });

    await sendCedulaStatusSms(id, 'in-progress');
    await sendCedulaStatusEmail(id, 'in-progress');
  });
};

exports.moveCedulaToRequirementsCompleted = (req, res) => {
  const { id } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!id) {
    return res.status(400).json({ success: false, message: "Cedula ID is required." });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'requirements-completed', updated_at = NOW() 
    WHERE id = ?
  `;

  db.query(sql, [id], async (err, result) => {
    if (err) {
      console.error("Error updating to requirements-completed:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula not found." });
    }

    res.json({ success: true, message: "Cedula moved to requirements-completed." });

    await sendCedulaStatusSms(id, 'requirements-completed');
    await sendCedulaStatusEmail(id, 'requirements-completed');
  });
};

exports.moveCedulaToApproved = (req, res) => {
  const { id } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!id) {
    return res.status(400).json({ success: false, message: "Cedula ID is required." });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'approved', updated_at = NOW() 
    WHERE id = ?
  `;

  db.query(sql, [id], async (err, result) => {
    if (err) {
      console.error("Error updating to approved:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula not found." });
    }

    res.json({ success: true, message: "Cedula approved successfully." });

    await sendCedulaStatusSms(id, 'approved');
    await sendCedulaStatusEmail(id, 'approved');
  });
};

exports.moveCedulaToReadyForPickup = (req, res) => {
  const { cedulaId, schedule } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!cedulaId) {
    return res.status(400).json({ success: false, message: "Cedula ID is required." });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'ready-for-pickup', pickup_schedule = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [schedule || null, cedulaId], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cedula not found' });

    res.json({ success: true, message: 'Cedula set to ready for pickup' });

    await sendCedulaStatusSms(cedulaId, 'ready-for-pickup', schedule || null);
    await sendCedulaStatusEmail(cedulaId, 'ready-for-pickup', schedule || null);
  });
};

// ======================= CEDULA DRAFTS (NEW) =======================
exports.saveCedulaDraft = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;
    const payload = req.body || {};

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: "Invalid draft payload." });
    }

    const selectSql = `SELECT id FROM tbl_cedula_drafts WHERE user_id = ? LIMIT 1`;

    db.query(selectSql, [userId], (selectErr, rows) => {
      if (selectErr) {
        console.error("Cedula draft select failed:", selectErr);
        return res.status(500).json({
          success: false,
          message: "Failed to save cedula draft (select error).",
          error: selectErr.message,
        });
      }

      const jsonData = JSON.stringify(payload);

      if (rows && rows.length > 0) {
        const draftId = rows[0].id;
        const updateSql = `
          UPDATE tbl_cedula_drafts
          SET data = ?, updated_at = NOW()
          WHERE id = ?
        `;

        db.query(updateSql, [jsonData, draftId], (updateErr) => {
          if (updateErr) {
            console.error("Cedula draft update failed:", updateErr);
            return res.status(500).json({
              success: false,
              message: "Failed to update cedula draft.",
              error: updateErr.message,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Cedula draft updated successfully.",
            draftId,
          });
        });
      } else {
        const insertSql = `
          INSERT INTO tbl_cedula_drafts (user_id, data)
          VALUES (?, ?)
        `;

        db.query(insertSql, [userId, jsonData], (insertErr, result) => {
          if (insertErr) {
            console.error("Cedula draft insert failed:", insertErr);
            return res.status(500).json({
              success: false,
              message: "Failed to save cedula draft.",
              error: insertErr.message,
            });
          }

          return res.status(201).json({
            success: true,
            message: "Cedula draft saved successfully.",
            draftId: result.insertId,
          });
        });
      }
    });
  } catch (err) {
    console.error("Unexpected error saving cedula draft:", err);
    res.status(500).json({
      success: false,
      message: "Unexpected server error while saving cedula draft.",
      error: err.message,
    });
  }
};

// ======================= GET CEDULA DRAFT (NEW) =======================
exports.getCedulaDraft = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;

    const sql = `
      SELECT id, data, updated_at
      FROM tbl_cedula_drafts
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    db.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error("Cedula draft fetch failed:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to load cedula draft.",
          error: err.message,
        });
      }

      if (!rows || rows.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No draft found.",
        });
      }

      const row = rows[0];
      let draftPayload = null;

      try {
        draftPayload = JSON.parse(row.data);
      } catch (parseErr) {
        console.error("Failed to parse cedula draft JSON:", parseErr);
        return res.status(500).json({
          success: false,
          message: "Draft data is corrupted.",
        });
      }

      return res.status(200).json({
        success: true,
        draft: draftPayload,
        draftId: row.id,
        updatedAt: row.updated_at,
      });
    });
  } catch (err) {
    console.error("Unexpected error loading cedula draft:", err);
    res.status(500).json({
      success: false,
      message: "Unexpected server error while loading cedula draft.",
      error: err.message,
    });
  }
};
