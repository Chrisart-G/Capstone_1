// Controller/userprofileController.js
const db = require("../db/dbconnect");

/* -------------------------- helpers -------------------------- */
function toFullUrl(req, maybePath) {
  if (!maybePath) return null;
  const s = String(maybePath).trim();
  if (/^https?:\/\//i.test(s)) return s; // already absolute
  const clean = s.startsWith("/") ? s : `/${s}`; // ensure leading slash
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}${clean}`;
}

/**
 * Gets the newest attachment from tbl_application_requirements for an app.
 * Returns the column `pdf_path` (which is the stored /uploads/... for the file).
 */
function getLatestAttachment(appType, appId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT pdf_path
      FROM tbl_application_requirements
      WHERE application_type = ? AND application_id = ?
            AND pdf_path IS NOT NULL AND pdf_path <> ''
      ORDER BY uploaded_at DESC, requirement_id DESC
      LIMIT 1
    `;
    db.query(sql, [appType, appId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]?.pdf_path || null);
    });
  });
}

/**
 * For each permit row, compute a working pickup_file_url using:
 *   1) row.pickup_file_path if present; else
 *   2) newest attachment in tbl_application_requirements (by appType/appId)
 */
async function enrichPermitRow(req, row) {
  const primary =
    row.pickup_file_path && String(row.pickup_file_path).trim() !== ""
      ? row.pickup_file_path
      : null;

  let fallback = null;
  if (!primary) {
    // map your selected permit_category to the application_type used in the attachments table
    const appType = String(row.permit_category || "").toLowerCase();
    const appId = row.referenceNo;
    try {
      fallback = await getLatestAttachment(appType, appId);
    } catch (e) {
      console.error("Attachment lookup failed:", {
        appType,
        appId,
        e: e.message,
      });
    }
  }

  const chosen = primary || fallback || null;

  return {
    ...row,
    pickup_file_url: chosen ? toFullUrl(req, chosen) : null,
    // you can keep original path for debugging if needed:
    // pickup_file_path_original: row.pickup_file_path || null,
  };
}

/* ------------------------ main controller ------------------------ */

exports.MunicipalUserProfile = (req, res) => {
  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;

  // ----- 1) BASIC USER INFO -----
  const userInfoQuery = `
    SELECT 
      CONCAT(firstname, ' ', IFNULL(middlename, ''), ' ', lastname) AS full_name,
      firstname,
      middlename,
      lastname,
      phone_number, 
      address
    FROM tbl_user_info
    WHERE user_id = ?
  `;

  db.query(userInfoQuery, [userId], (err1, userInfoResult) => {
    if (err1) {
      console.error("Error fetching user info:", err1);
      return res
        .status(500)
        .json({ message: "Error retrieving user info", error: err1.message });
    }

    // ----- 2) MEMBER SINCE -----
    const memberSinceQuery = `
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS member_since
      FROM tb_logins
      WHERE user_id = ?
    `;

    db.query(memberSinceQuery, [userId], (err2, memberResult) => {
      if (err2) {
        console.error("Error fetching member date:", err2);
        return res.status(500).json({
          message: "Error retrieving member date",
          error: err2.message,
        });
      }

      // ===== NEW: 2.5) BUSINESS PROFILE FROM tbl_user_business_info =====
      const businessInfoQuery = `
        SELECT
          business_name,
          trade_name,
          business_type,
          tin_no,
          registration_no,
          business_address,
          business_postal_code,
          business_email,
          business_telephone,
          business_mobile,
          lessor_full_name,
          lessor_address,
          lessor_phone,
          lessor_email,
          monthly_rental
        FROM tbl_user_business_info
        WHERE user_id = ?
        LIMIT 1
      `;

      db.query(businessInfoQuery, [userId], (bizErr, businessResult) => {
        if (bizErr) {
          console.error("Error fetching business info:", bizErr);
          // IMPORTANT: we do NOT fail the request here – just continue without business info
        }

        // ----- 3) ALL PERMITS (INCLUDING ELECTRONICS) -----

        // Business
        const businessPermitsQuery = `
          SELECT 
            'Business Permit' AS permitType,
            DATE_FORMAT(application_date, '%Y-%m-%d') AS application_date,
            status,
            BusinessP_id AS referenceNo,
            business_name,
            'business' AS permit_category,
            pickup_file_path
          FROM business_permits
          WHERE user_id = ?
        `;

        // Building
        const buildingPermitsQuery = `
          SELECT 
            'Building Permit' AS permitType,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS application_date,
            status,
            id AS referenceNo,
            CONCAT(first_name, ' ', last_name) AS business_name,
            'building' AS permit_category,
            pickup_file_path
          FROM tbl_building_permits
          WHERE user_id = ?
        `;

        // Electronics
        const electronicsPermitsQuery = `
          SELECT 
            'Electronics Permit' AS permitType,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS application_date,
            IFNULL(status, 'pending') AS status,
            id AS referenceNo,
            CONCAT(first_name, ' ', last_name) AS business_name,
            'electronics' AS permit_category,
            pickup_file_path
          FROM tbl_electronics_permits
          WHERE user_id = ?
        `;

        // Electrical
        const electricalPermitsQuery = `
          SELECT 
            'Electrical Permit' AS permitType,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS application_date,
            IFNULL(status, 'pending') AS status,
            id AS referenceNo,
            CONCAT(first_name, ' ', last_name) AS business_name,
            'electrical' AS permit_category,
            pickup_file_path
          FROM tbl_electrical_permits
          WHERE user_id = ?
        `;

        // Plumbing
        const plumbingPermitsQuery = `
          SELECT 
            'Plumbing Permit' AS permitType,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS application_date,
            status,
            id AS referenceNo,
            CONCAT(first_name, ' ', last_name) AS business_name,
            'plumbing' AS permit_category,
            pickup_file_path
          FROM tbl_plumbing_permits
          WHERE user_id = ?
        `;

        // Fencing
        const fencingPermitsQuery = `
          SELECT 
            'Fencing Permit' AS permitType,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS application_date,
            status,
            id AS referenceNo,
            CONCAT(first_name, ' ', last_name) AS business_name,
            'fencing' AS permit_category,
            pickup_file_path
          FROM tbl_fencing_permits
          WHERE user_id = ?
        `;

        // Cedula
        const cedulaQuery = `
          SELECT 
            'Cedula' AS permitType,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS application_date,
            application_status AS status,
            id AS referenceNo,
            name AS business_name,
            'cedula' AS permit_category,
            pickup_file_path
          FROM tbl_cedula
          WHERE user_id = ?
        `;

        // UNION of everything (7 queries → 7 placeholders)
        const allPermitsQuery = `
          ${businessPermitsQuery}
          UNION ALL
          ${buildingPermitsQuery}
          UNION ALL
          ${electronicsPermitsQuery}
          UNION ALL
          ${electricalPermitsQuery}
          UNION ALL
          ${plumbingPermitsQuery}
          UNION ALL
          ${fencingPermitsQuery}
          UNION ALL
          ${cedulaQuery}
          ORDER BY application_date DESC
        `;

        const permitParams = [
          userId, // business
          userId, // building
          userId, // electronics
          userId, // electrical
          userId, // plumbing
          userId, // fencing
          userId, // cedula
        ];

        db.query(allPermitsQuery, permitParams, async (err3, permitsResult) => {
          if (err3) {
            console.error("Error fetching permits:", err3);
            return res.status(500).json({
              message: "Error retrieving permits",
              error: err3.message,
            });
          }

          // Enrich each permit with a working pickup_file_url
          let enriched = [];
          try {
            enriched = await Promise.all(
              permitsResult.map((r) => enrichPermitRow(req, r))
            );
          } catch (e) {
            console.error("Error enriching permits:", e);
            enriched = permitsResult.map((r) => ({
              ...r,
              pickup_file_url: null,
            }));
          }

          // ----- 4) STATISTICS -----
          const totalApplications = enriched.length;

          const approvedPermits = enriched.filter((p) =>
            ["approved", "active", "completed", "ready-for-pickup"].includes(
              p.status?.toLowerCase()
            )
          ).length;

          const pendingPermits = enriched.filter((p) =>
            ["pending", "in-review", "in-progress", "requirements-completed"].includes(
              p.status?.toLowerCase()
            )
          ).length;

          const activePermits = enriched.filter((p) =>
            ["approved", "active"].includes(p.status?.toLowerCase())
          ).length;

          // ----- 5) RECENT PAYMENT ACTIVITY -----
          const recentActivityQuery = `
            SELECT 
              CASE 
                WHEN application_type = 'business' THEN 'Business Permit Payment Submitted'
                WHEN application_type = 'electrical' THEN 'Electrical Permit Payment Submitted'
                WHEN application_type = 'electronics' THEN 'Electronics Permit Payment Submitted'
                WHEN application_type = 'cedula' THEN 'Cedula Payment Submitted'
                WHEN application_type = 'building' THEN 'Building Permit Payment Submitted'
                WHEN application_type = 'plumbing' THEN 'Plumbing Permit Payment Submitted'
                WHEN application_type = 'fencing' THEN 'Fencing Permit Payment Submitted'
                ELSE 'Payment Submitted'
              END AS action,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS time,
              'payment' AS type,
              payment_status AS status,
              receipt_id AS referenceNo
            FROM tbl_payment_receipts
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
          `;

          db.query(recentActivityQuery, [userId], (err4, recentActivity) => {
            if (err4) {
              console.error("Error fetching recent activity:", err4);
              return res.status(500).json({
                message: "Error retrieving recent activity",
                error: err4.message,
              });
            }

            // ----- 6) FINAL RESPONSE -----
            const userInfo = userInfoResult[0] || {};
            const memberSince = memberResult[0]?.member_since || "N/A";
            const businessInfo = (businessResult && businessResult[0]) || {};

            // keep old fallback (business name from first business permit)
            const businessFromPermit = enriched.find(
              (p) => p.permit_category === "business"
            );

            res.json({
              userInfo: {
                full_name: userInfo.full_name || "",
                firstname: userInfo.firstname || "",
                middlename: userInfo.middlename || "",
                lastname: userInfo.lastname || "",
                phone_number: userInfo.phone_number || "",
                address: userInfo.address || "",
                member_since: memberSince,

                // BUSINESS INFO (from tbl_user_business_info, fallback to permit)
                business_name:
                  businessInfo.business_name ||
                  businessFromPermit?.business_name ||
                  "",
                business_type: businessInfo.business_type || "",
                tin_number: businessInfo.tin_no || "",

                // extra business fields
                trade_name: businessInfo.trade_name || "",
                registration_no: businessInfo.registration_no || "",
                business_address: businessInfo.business_address || "",
                business_postal_code: businessInfo.business_postal_code || "",
                business_email: businessInfo.business_email || "",
                business_telephone: businessInfo.business_telephone || "",
                business_mobile: businessInfo.business_mobile || "",

                // LESSOR INFO
                lessor_full_name: businessInfo.lessor_full_name || "",
                lessor_address: businessInfo.lessor_address || "",
                lessor_phone: businessInfo.lessor_phone || "",
                lessor_email: businessInfo.lessor_email || "",
                monthly_rental:
                  businessInfo.monthly_rental !== null &&
                  businessInfo.monthly_rental !== undefined
                    ? businessInfo.monthly_rental
                    : "",
              },

              // keep permits logic exactly the same, just attach expiry_date as before
              permits: enriched.map((permit) => ({
                ...permit,
                expiry_date: "2025-12-31",
              })),
              recentActivity,
              statistics: {
                totalApplications,
                approvedPermits,
                pendingPermits,
                activePermits,
              },
            });
          });
        });
      });
    });
  });
};
