// Controller/EmployeeArchiveController.js
const db = require("../db/dbconnect");

/* Simple promise wrapper */
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* Ensure archive table exists */
async function ensureArchiveTable() {
  await q(`
    CREATE TABLE IF NOT EXISTS application_archives (
      id INT AUTO_INCREMENT PRIMARY KEY,
      application_type VARCHAR(64) NOT NULL,
      application_id   INT NOT NULL,
      document_type    VARCHAR(128) NOT NULL,
      applicant_name   VARCHAR(255) DEFAULT NULL,
      notes            VARCHAR(255) DEFAULT NULL,
      archived_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      archived_by      INT DEFAULT NULL,
      UNIQUE KEY uniq_app (application_type, application_id),
      KEY idx_archived_at (archived_at),
      KEY idx_application_type (application_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/**
 * POST /api/employee/archive/mark-picked-up
 * Body: { applicationType, applicationId, documentType, applicantName, notes? }
 */
exports.markPickedUp = async (req, res) => {
  try {
    await ensureArchiveTable();

    const {
      applicationType,
      applicationId,
      documentType,
      applicantName,
      notes,
    } = req.body || {};

    const type = String(applicationType || "").trim().toLowerCase();
    const appId = Number(applicationId);

    if (!type || !appId) {
      return res.status(400).json({
        success: false,
        message: "applicationType and applicationId are required.",
      });
    }

    const docType =
      documentType && String(documentType).trim().length > 0
        ? String(documentType).trim()
        : "Document";

    const applicant =
      applicantName && String(applicantName).trim().length > 0
        ? String(applicantName).trim()
        : null;

    // If your session stores employee info, capture it
    const archivedBy =
      (req.session &&
        req.session.user &&
        (req.session.user.employee_id || req.session.user.id)) ||
      null;

    await q(
      `
      INSERT INTO application_archives (
        application_type,
        application_id,
        document_type,
        applicant_name,
        notes,
        archived_at,
        archived_by
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
        document_type  = VALUES(document_type),
        applicant_name = VALUES(applicant_name),
        notes          = VALUES(notes),
        archived_at    = VALUES(archived_at),
        archived_by    = VALUES(archived_by)
    `,
      [type, appId, docType, applicant, notes || null, archivedBy]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("markPickedUp error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to move application to archive.",
    });
  }
};

/**
 * GET /api/employee/archive-list
 */
exports.getArchiveList = async (req, res) => {
  try {
    await ensureArchiveTable();

    const rows = await q(
      `SELECT
         id,
         application_type,
         application_id,
         document_type,
         applicant_name,
         notes,
         archived_at
       FROM application_archives
       ORDER BY archived_at DESC, id DESC`
    );

    return res.json({
      success: true,
      items: rows,
    });
  } catch (err) {
    console.error("getArchiveList error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load archives.",
      items: [],
    });
  }
};

/**
 * GET /api/employee/archive-stats
 */
exports.getArchiveStats = async (req, res) => {
  try {
    await ensureArchiveTable();

    const [totalRow] = await q(
      `SELECT COUNT(*) AS totalArchived FROM application_archives`
    );
    const [businessRow] = await q(
      `SELECT COUNT(*) AS businessCount
         FROM application_archives
        WHERE application_type = 'business'`
    );
    const [last30Row] = await q(
      `SELECT COUNT(*) AS last30Days
         FROM application_archives
        WHERE archived_at >= (NOW() - INTERVAL 30 DAY)`
    );
    const [todayRow] = await q(
      `SELECT COUNT(*) AS todayCount
         FROM application_archives
        WHERE DATE(archived_at) = CURDATE()`
    );

    return res.json({
      success: true,
      stats: {
        totalArchived: totalRow?.totalArchived || 0,
        business: businessRow?.businessCount || 0,
        last30Days: last30Row?.last30Days || 0,
        today: todayRow?.todayCount || 0,
      },
    });
  } catch (err) {
    console.error("getArchiveStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load archive statistics.",
    });
  }
};
