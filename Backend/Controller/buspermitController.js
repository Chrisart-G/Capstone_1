// Controller/buspermitController.js
const path = require('path');
const fs = require('fs');
const db = require('../db/dbconnect');
const axios = require('axios');

/* ===================================================================
   SMS CORE (mirrors employeedashController)
=================================================================== */
const { IPROG_API_TOKEN, SMS_ENABLED = "true" } = process.env;

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

/* ---------------- Business-specific lookups ---------------- */
async function getBusinessUserId(permitId) {
  const rows = await q(
    'SELECT user_id FROM business_permits WHERE BusinessP_id=? LIMIT 1',
    [permitId]
  );
  return rows?.[0]?.user_id || null;
}

async function getUserPhoneByUserId(userId) {
  const rows = await q('SELECT phone_number FROM tbl_user_info WHERE user_id=? LIMIT 1', [userId]);
  return rows?.[0]?.phone_number || null;
}

async function getBusinessName(permitId) {
  const rows = await q(
    'SELECT business_name FROM business_permits WHERE BusinessP_id=? LIMIT 1',
    [permitId]
  );
  return rows?.[0]?.business_name || 'Business';
}

/* ---------------- Message composition (same style) ---------------- */
function buildStatusMessage({ officeName, applicationTypeLabel, applicationNo, newStatus, extraNote }) {
  const lines = [
    officeName || "Municipality",
    `${applicationTypeLabel || "Application"} ${applicationNo ? `#${applicationNo}` : ""}`.trim(),
    `Status: ${newStatus}`,
    extraNote || "Login to your account for details.",
  ].filter(Boolean);
  return lines.join("\n").slice(0, 306);
}

function noteForStatus(status, schedule) {
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
}

/* ---------------- Fire SMS for BUSINESS ONLY ---------------- */
async function fireSmsForBusiness(permitId, status, schedule) {
  try {
    const smsOn = await getSmsEnabledFlag();
    if (!smsOn) {
      console.log("[SMS] Skipped (disabled)");
      return;
    }

    const userId = await getBusinessUserId(permitId);
    if (!userId) {
      console.log("[SMS] No user_id for business_permits", permitId);
      return;
    }

    const phone = await getUserPhoneByUserId(userId);
    if (!phone) {
      console.log("[SMS] No phone for user", userId);
      return;
    }

    const businessName = await getBusinessName(permitId);
    const office_name = "Business Permit & Licensing Office";
    const label = "Business Permit"; // fixed label for this controller
    const extra_note = noteForStatus(status, schedule);

    // business_permits has no application_no → pass null
    const message = buildStatusMessage({
      officeName: office_name,
      applicationTypeLabel: `${label} – ${businessName}`,
      applicationNo: null,
      newStatus: status,
      extraNote: extra_note,
    });

    console.log("[SMS] Will send →", {
      application_type: "business",
      id: permitId,
      userId,
      phone: normPhone(phone),
      status,
      schedule: schedule || null,
    });

    await iprogSend({ phone, message });
  } catch (e) {
    console.error("[SMS] fireSmsForBusiness error:", e?.response?.status, e?.response?.data || e);
  }
}

/* ===================================================================
   EXISTING CONTROLLER LOGIC (kept intact)
=================================================================== */

const saveFile = (file) => {
  if (!file) return null;
  const uploadPath = path.join(__dirname, '../uploads/business_docs');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const filename = `${Date.now()}_${file.name}`;
  const filePath = path.join(uploadPath, filename);
  file.mv(filePath);
  return `/uploads/business_docs/${filename}`;
};

exports.SubmitBusinessPermit = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;

    if (!req.body.data) {
      return res.status(400).json({ message: "Missing form data" });
    }

    let data;
    try {
      data = JSON.parse(req.body.data);
    } catch (jsonErr) {
      return res.status(400).json({ message: "Invalid JSON format", error: jsonErr.message });
    }

    const files = req.files || {};
    const filled_up_form = saveFile(files.filled_up_form);
    const sec_dti_cda_cert = saveFile(files.sec_dti_cda_cert);
    const local_sketch = saveFile(files.local_sketch);
    const sworn_capital = saveFile(files.sworn_capital);
    const tax_clearance = saveFile(files.tax_clearance);
    const brgy_clearance = saveFile(files.brgy_clearance);
    const cedula = saveFile(files.cedula);

    db.beginTransaction((err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });

      const sql = `INSERT INTO business_permits (
          application_type, payment_mode, application_date, tin_no, registration_no, registration_date,
          business_type, amendment_from, amendment_to, tax_incentive, tax_incentive_entity,
          last_name, first_name, middle_name, business_name, trade_name,
          business_address, business_postal_code, business_email, business_telephone, business_mobile,
          owner_address, owner_postal_code, owner_email, owner_telephone, owner_mobile,
          emergency_contact, emergency_phone, emergency_email,
          business_area, male_employees, female_employees, local_employees,
          lessor_name, lessor_address, lessor_phone, lessor_email, monthly_rental,
          filled_up_forms, sec_dti_cda_certificate, local_sketch, sworn_statement_capital, tax_clearance, 
          brgy_clearance_business, cedula,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
      const values = [
        data.applicationType, data.paymentMode, data.applicationDate, data.tinNo, data.registrationNo, data.registrationDate,
        data.businessType, data.amendmentFrom, data.amendmentTo, data.taxIncentive, data.taxIncentiveEntity,
        data.lastName, data.firstName, data.middleName, data.businessName, data.tradeName,
        data.businessAddress, data.businessPostalCode, data.businessEmail, data.businessTelephone, data.businessMobile,
        data.ownerAddress, data.ownerPostalCode, data.ownerEmail, data.ownerTelephone, data.ownerMobile,
        data.emergencyContact, data.emergencyPhone, data.emergencyEmail,
        data.businessArea, data.maleEmployees, data.femaleEmployees, data.localEmployees,
        data.lessorName, data.lessorAddress, data.lessorPhone, data.lessorEmail, data.monthlyRental,
        filled_up_form, sec_dti_cda_cert, local_sketch, sworn_capital, tax_clearance, brgy_clearance, cedula,
        userId
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Permit insert failed:", err);
          return db.rollback(() => res.status(500).json({ message: "Insert failed", error: err.message }));
        }

        const permitId = result.insertId;
        const activityValues = (data.businessActivities || []).map((act) => [
          permitId,
          act.line,
          act.units,
          act.capitalization,
          act.grossEssential,
          act.grossNonEssential,
        ]);

        const afterActivities = () => {
          const updateFormAccessSql = `UPDATE tbl_payment_receipts 
            SET form_access_used = 1, 
                form_access_used_at = CURRENT_TIMESTAMP,
                form_submitted = 1,
                form_submitted_at = CURRENT_TIMESTAMP,
                related_application_id = ?
            WHERE user_id = ? 
            AND application_type = 'business' 
            AND payment_status = 'approved' 
            AND form_access_granted = 1 
            AND form_access_used = 0
            ORDER BY created_at DESC 
            LIMIT 1`;

          db.query(updateFormAccessSql, [permitId, userId], (err3) => {
            if (err3) {
              console.error("Form access update failed:", err3);
              console.warn("Business permit submitted successfully but form access update failed");
            }

            db.commit((err4) => {
              if (err4) {
                console.error("Commit failed:", err4);
                return db.rollback(() => res.status(500).json({ message: "Commit failed", error: err4.message }));
              }

              res.status(201).json({ 
                success: true, 
                message: "Business permit submitted successfully", 
                permitId,
                formAccessUpdated: !err3
              });
            });
          });
        };

        if (activityValues.length === 0) return afterActivities();

        const actSql = `INSERT INTO business_activities (
          permit_id, line_of_business, units, capitalization, gross_essential, gross_non_essential
        ) VALUES ?`;

        db.query(actSql, [activityValues], (err2) => {
          if (err2) {
            console.error("Activity insert failed:", err2);
            return db.rollback(() => res.status(500).json({ message: "Activity insert failed", error: err2.message }));
          }
          afterActivities();
        });
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

// this coode to get the data from tbl_business_permits and get the email from tb_logins display
exports.getAllPermits = (req, res) => {
  console.log("Session in BusinessPermit:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  
  const userId = req.session.user.user_id;
  console.log("Using user_id for business permit:", userId);

  const sql = `
    SELECT bp.BusinessP_id, bp.status, bp.business_name, bp.application_type, 
           bp.application_date, bp.created_at, l.email
    FROM business_permits bp
    LEFT JOIN tb_logins l ON bp.user_id = l.user_id
    WHERE bp.user_id = ?
    ORDER BY bp.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching permits:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error retrieving permit applications", 
        error: err.message 
      });
    }

    res.json({ success: true, permits: results });
  });
};

exports.GetAllApplications = (req, res) => {
  if (!req.session.user || !req.session.user.user_id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const query = `
    SELECT 
      a.BusinessP_id as id, 
      CONCAT(a.first_name, ' ', a.last_name) as name, 
      a.application_type as type, 
      a.application_date as submitted, 
      a.status,
      COUNT(b.id) as documentCount
    FROM 
      business_permits a
    LEFT JOIN 
      business_activities b ON a.BusinessP_id = b.permit_id
    GROUP BY 
      a.BusinessP_id
    ORDER BY 
      a.application_date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while fetching applications' 
      });
    }
    
    return res.json({ success: true, applications: results });
  });
};

// Get application by ID
exports.GetApplicationById = (req, res) => {
  if (!req.session.user || !req.session.user.user_id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const applicationId = req.params.id;
  const query = `SELECT * FROM business_permits WHERE BusinessP_id = ?`;

  db.query(query, [applicationId], (err, results) => {
    if (err) {
      console.error('Error fetching full application details:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while fetching application details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const activitiesQuery = `
      SELECT id, line_of_business, units, capitalization, created_at
      FROM business_activities
      WHERE permit_id = ?
    `;

    db.query(activitiesQuery, [applicationId], (actErr, activities) => {
      if (actErr) {
        console.error('Error fetching business activities:', actErr);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching business activities' });
      }

      const applicationData = results[0];
      applicationData.activities = activities;

      return res.json({ success: true, application: applicationData });
    });
  });
};

/* ===================================================================
   STATUS UPDATES (with same debug + SMS)
=================================================================== */

// Generic admin update
exports.UpdateApplicationStatus = (req, res) => {
  if (!req.session?.user?.user_id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const { applicationId, newStatus } = req.body;

  console.log("[STATUS] UpdateApplicationStatus →", { applicationId, newStatus });

  const updateQuery = `
    UPDATE business_permits
    SET status = ?, updated_at = NOW()
    WHERE BusinessP_id = ?
  `;
  
  db.query(updateQuery, [newStatus, applicationId], (err, results) => {
    if (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({ success: false, message: 'An error occurred while updating application status' });
    }
    if (results.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → business_permits", { applicationId });
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Application status updated successfully' });

    // Fire SMS (non-blocking)
    fireSmsForBusiness(applicationId, String(newStatus).toLowerCase()).catch(e =>
      console.error("[SMS] background error:", e?.response?.data || e)
    );
  });
};

exports.moveBusinessToInProgress = (req, res) => {
  const { applicationId } = req.body;
  console.log("[STATUS] moveBusinessToInProgress →", { applicationId });

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const sql = `UPDATE business_permits SET status = 'in-progress', updated_at = NOW() WHERE BusinessP_id = ?`;
  db.query(sql, [applicationId], (err, results) => {
    if (err) {
      console.error('Error updating application:', err);
      return res.status(500).json({ success: false });
    }

    if (results.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → business_permits", { applicationId });
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Moved to in-progress' });

    fireSmsForBusiness(applicationId, 'in-progress').catch(e =>
      console.error("[SMS] background error:", e?.response?.data || e)
    );
  });
};

exports.moveBusinessToRequirementsCompleted = (req, res) => {
  const { applicationId } = req.body;
  console.log("[STATUS] moveBusinessToRequirementsCompleted →", { applicationId });

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const sql = `UPDATE business_permits SET status = 'requirements-completed', updated_at = NOW() WHERE BusinessP_id = ?`;

  db.query(sql, [applicationId], (err, results) => {
    if (err) {
      console.error('Error updating application:', err);
      return res.status(500).json({ success: false });
    }

    if (results.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → business_permits", { applicationId });
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Moved to requirements-completed' });

    fireSmsForBusiness(applicationId, 'requirements-completed').catch(e =>
      console.error("[SMS] background error:", e?.response?.data || e)
    );
  });
};

exports.moveBusinessToApproved = (req, res) => {
  const { applicationId } = req.body;
  console.log("[STATUS] moveBusinessToApproved →", { applicationId });

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    UPDATE business_permits 
    SET status = 'approved', updated_at = NOW()
    WHERE BusinessP_id = ?
  `;

  db.query(sql, [applicationId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to approve" });
    if (result.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → business_permits", { applicationId });
      return res.status(404).json({ success: false, message: "Permit not found" });
    }
    
    res.json({ success: true, message: "Business permit approved" });

    fireSmsForBusiness(applicationId, 'approved').catch(e =>
      console.error("[SMS] background error:", e?.response?.data || e)
    );
  });
};

exports.moveBusinessToReadyForPickup = (req, res) => {
  const { applicationId, schedule } = req.body;
  console.log("[STATUS] moveBusinessToReadyForPickup →", { applicationId, schedule });

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const sql = `
    UPDATE business_permits 
    SET status = 'ready-for-pickup', pickup_schedule = ?, updated_at = NOW() 
    WHERE BusinessP_id = ?
  `;

  db.query(sql, [schedule || null, applicationId], (err, result) => {
    if (err) {
      console.error("[STATUS] Failed to update business_permits:", err);
      return res.status(500).json({ success: false, message: "Failed to update", error: err.message });
    }
    if (result.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → business_permits", { applicationId });
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Pickup scheduled" });

    // include schedule text
    fireSmsForBusiness(applicationId, 'ready-for-pickup', schedule || null).catch(e =>
      console.error("[SMS] background error:", e?.response?.data || e)
    );
  });
};
// Accept (pending -> in-review) for BUSINESS
exports.acceptBusiness = (req, res) => {
  if (!req.session?.user?.user_id) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  // supports both /:id and body.applicationId
  const applicationId = Number(req.params.id || req.body?.applicationId);
  console.log("[STATUS] acceptBusiness →", { applicationId });

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return res.status(400).json({ success: false, message: 'Valid applicationId required' });
  }

  const sql = `
    UPDATE business_permits
    SET status = 'in-review', updated_at = NOW()
    WHERE BusinessP_id = ?
  `;

  db.query(sql, [applicationId], (err, result) => {
    if (err) {
      console.error("[STATUS] Failed to set in-review (business_permits):", err);
      return res.status(500).json({ success: false, message: 'Failed to update' });
    }
    if (result.affectedRows === 0) {
      console.warn("[STATUS] No rows affected → business_permits", { applicationId });
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Moved to in-review' });

    // 🔔 SMS (same pattern/logs as other moves)
    fireSmsForBusiness(applicationId, 'in-review')
      .then(() => console.log("[SMS] done for", { table: 'business_permits', id: applicationId, status: 'in-review' }))
      .catch((e) => console.error("[SMS] background error:", e?.response?.data || e));
  });
};
// Draft storage directory
const DRAFT_DIR = path.join(__dirname, '../uploads/business_drafts');

function ensureDraftDir() {
  if (!fs.existsSync(DRAFT_DIR)) {
    fs.mkdirSync(DRAFT_DIR, { recursive: true });
  }
}

// ==================== BUSINESS PERMIT DRAFTS ====================

// Save draft for current user (no DB write)
exports.saveBusinessDraft = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const userId = req.session.user.user_id;
    let draft = req.body?.data;

    if (!draft) {
      return res.status(400).json({ success: false, message: 'Missing draft data.' });
    }

    // If serialized as string, parse
    if (typeof draft === 'string') {
      try {
        draft = JSON.parse(draft);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON draft format.' });
      }
    }

    ensureDraftDir();
    const filePath = path.join(DRAFT_DIR, `${userId}.json`);
    const payload = {
      formData: draft,
      savedAt: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');

    return res.json({
      success: true,
      message: 'Draft saved successfully.',
      savedAt: payload.savedAt,
    });
  } catch (err) {
    console.error('Error saving business draft:', err);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error while saving draft.',
    });
  }
};

// Get draft for current user
exports.getBusinessDraft = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const userId = req.session.user.user_id;
    ensureDraftDir();
    const filePath = path.join(DRAFT_DIR, `${userId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.json({ success: false, message: 'No draft found.' });
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.warn('Invalid draft JSON, deleting:', filePath, e);
      fs.unlinkSync(filePath);
      return res.json({ success: false, message: 'No draft found.' });
    }

    return res.json({
      success: true,
      draft: payload.formData || {},
      savedAt: payload.savedAt || null,
    });
  } catch (err) {
    console.error('Error loading business draft:', err);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error while loading draft.',
    });
  }
};
