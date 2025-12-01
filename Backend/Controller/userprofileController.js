// Controller/userprofileController.js
const db = require("../db/dbconnect");

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

      // 7 user_id values for 7 "WHERE user_id = ?" clauses
      const permitParams = [
        userId, // business
        userId, // building
        userId, // electronics
        userId, // electrical
        userId, // plumbing
        userId, // fencing
        userId, // cedula
      ];

      db.query(allPermitsQuery, permitParams, (err3, permitsResult) => {
        if (err3) {
          console.error("Error fetching permits:", err3);
          return res.status(500).json({
            message: "Error retrieving permits",
            error: err3.message,
          });
        }

        // ----- 4) STATISTICS -----
        const totalApplications = permitsResult.length;

        const approvedPermits = permitsResult.filter((p) =>
          ["approved", "active", "completed", "ready-for-pickup"].includes(
            p.status?.toLowerCase()
          )
        ).length;

        const pendingPermits = permitsResult.filter((p) =>
          ["pending", "in-review", "in-progress", "requirements-completed"].includes(
            p.status?.toLowerCase()
          )
        ).length;

        const activePermits = permitsResult.filter((p) =>
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
          const baseUrl = `${req.protocol}://${req.get("host")}`;

          res.json({
            userInfo: {
              full_name: userInfo.full_name || "",
              firstname: userInfo.firstname || "",
              middlename: userInfo.middlename || "",
              lastname: userInfo.lastname || "",
              phone_number: userInfo.phone_number || "",
              address: userInfo.address || "",
              member_since: memberSince,
              // business info from first business permit if present
              business_name:
                permitsResult.find((p) => p.permit_category === "business")
                  ?.business_name || "",
              business_type: "",
              tin_number: "",
            },
            permits: permitsResult.map((permit) => ({
              ...permit,
              expiry_date: "2025-12-31", // placeholder
              pickup_file_url: permit.pickup_file_path
                ? `${baseUrl}${permit.pickup_file_path}`
                : null,
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
};
