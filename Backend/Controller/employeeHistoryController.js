// Backend/Controller/employeeHistoryController.js
const db = require("../db/dbconnect");

/* ---------- basic DB helper ---------- */
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* ---------- get session user_id ---------- */
function getSessionUserId(req) {
  return (
    req.session?.user?.user_id ||
    req.session?.user_id ||
    req.session?.userId ||
    req.session?.user?.id ||
    null
  );
}

/* ---------- ensure this user is an employee ---------- */
async function getUserAndEmployee(req) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return { userId: null, employee: null };
  }

  const rows = await q(
    "SELECT * FROM tbl_employeeinformation WHERE user_id = ? LIMIT 1",
    [userId]
  );

  return { userId, employee: rows[0] || null };
}

/* ========================================================================== */
/*                        A. HISTORY STATS ENDPOINT                            */
/* ========================================================================== */

exports.getHistoryStats = async (req, res) => {
  try {
    const { userId, employee } = await getUserAndEmployee(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not logged in." });
    }

    if (!employee) {
      return res
        .status(403)
        .json({ success: false, message: "Employee record not found." });
    }

    // IMPORTANT: approved_by stores tb_logins.user_id, so we filter by userId
    const rows = await q(
      `
      SELECT
        COUNT(*) AS totalProcessed,
        SUM(payment_status = 'approved') AS approved,
        SUM(payment_status = 'rejected') AS rejected,
        AVG(
          CASE 
            WHEN payment_status = 'approved' 
            THEN TIMESTAMPDIFF(DAY, created_at, approved_at) 
          END
        ) AS avgProcessingDays
      FROM tbl_payment_receipts
      WHERE approved_by = ?
        AND payment_status IN ('approved', 'rejected')
      `,
      [userId]
    );

    const row = rows[0] || {};
    const avgDays =
      row.avgProcessingDays != null ? Number(row.avgProcessingDays) : null;

    const stats = {
      totalProcessed: row.totalProcessed || 0,
      approved: row.approved || 0,
      rejected: row.rejected || 0,
      avgTime: avgDays !== null ? `${avgDays.toFixed(1)} days` : "0 days",
    };

    return res.json({ success: true, stats });
  } catch (err) {
    console.error("getHistoryStats error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ========================================================================== */
/*                        B. HISTORY LIST ENDPOINT                             */
/* ========================================================================== */

exports.getHistoryList = async (req, res) => {
  try {
    const { userId, employee } = await getUserAndEmployee(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not logged in." });
    }

    if (!employee) {
      return res
        .status(403)
        .json({ success: false, message: "Employee record not found." });
    }

    // Again: approved_by = tb_logins.user_id
    const sql = `
      SELECT * FROM (
        /* Business Permits */
        SELECT
          r.receipt_id,
          'business' AS application_type,
          'Business Permit' AS document_type,
          CONCAT(bp.first_name, ' ', bp.last_name) AS applicant_name,
          r.payment_status AS status,
          'high' AS priority,
          bp.application_date AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, bp.application_date, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN business_permits bp
          ON bp.BusinessP_id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'business'
          AND r.payment_status IN ('approved', 'rejected')

        UNION ALL

        /* Electrical Permits */
        SELECT
          r.receipt_id,
          'electrical' AS application_type,
          'Electrical Permit' AS document_type,
          CONCAT(ep.first_name, ' ', ep.last_name) AS applicant_name,
          r.payment_status AS status,
          'high' AS priority,
          ep.created_at AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, ep.created_at, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN tbl_electrical_permits ep
          ON ep.id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'electrical'
          AND r.payment_status IN ('approved', 'rejected')

        UNION ALL

        /* Plumbing Permits */
        SELECT
          r.receipt_id,
          'plumbing' AS application_type,
          'Plumbing Permit' AS document_type,
          CONCAT(pp.first_name, ' ', pp.last_name) AS applicant_name,
          r.payment_status AS status,
          'medium' AS priority,
          pp.created_at AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, pp.created_at, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN tbl_plumbing_permits pp
          ON pp.id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'plumbing'
          AND r.payment_status IN ('approved', 'rejected')

        UNION ALL

        /* Electronics Permits */
        SELECT
          r.receipt_id,
          'electronics' AS application_type,
          'Electronics Permit' AS document_type,
          CONCAT(ep2.first_name, ' ', ep2.last_name) AS applicant_name,
          r.payment_status AS status,
          'medium' AS priority,
          ep2.created_at AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, ep2.created_at, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN tbl_electronics_permits ep2
          ON ep2.id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'electronics'
          AND r.payment_status IN ('approved', 'rejected')

        UNION ALL

        /* Building Permits */
        SELECT
          r.receipt_id,
          'building' AS application_type,
          'Building Permit' AS document_type,
          CONCAT(bp2.first_name, ' ', bp2.last_name) AS applicant_name,
          r.payment_status AS status,
          'high' AS priority,
          bp2.created_at AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, bp2.created_at, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN tbl_building_permits bp2
          ON bp2.id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'building'
          AND r.payment_status IN ('approved', 'rejected')

        UNION ALL

        /* Fencing Permits */
        SELECT
          r.receipt_id,
          'fencing' AS application_type,
          'Fencing Permit' AS document_type,
          CONCAT(fp.first_name, ' ', fp.last_name) AS applicant_name,
          r.payment_status AS status,
          'medium' AS priority,
          fp.created_at AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, fp.created_at, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN tbl_fencing_permits fp
          ON fp.id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'fencing'
          AND r.payment_status IN ('approved', 'rejected')

        UNION ALL

        /* Cedula */
        SELECT
          r.receipt_id,
          'cedula' AS application_type,
          'Community Tax Certificate' AS document_type,
          c.name AS applicant_name,
          r.payment_status AS status,
          'low' AS priority,
          c.created_at AS submitted_at,
          r.approved_at AS processed_at,
          TIMESTAMPDIFF(DAY, c.created_at, r.approved_at) AS processing_days,
          r.admin_notes AS notes
        FROM tbl_payment_receipts r
        JOIN tbl_cedula c
          ON c.id = r.related_application_id
        WHERE r.approved_by = ?
          AND r.application_type = 'cedula'
          AND r.payment_status IN ('approved', 'rejected')
      ) AS history
      ORDER BY processed_at DESC, submitted_at DESC
    `;

    // one userId per UNION SELECT
    const params = [userId, userId, userId, userId, userId, userId, userId];

    const items = await q(sql, params);

    return res.json({
      success: true,
      items,
    });
  } catch (err) {
    console.error("getHistoryList error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
