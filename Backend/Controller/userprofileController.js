const db = require('../db/dbconnect');

exports.MunicipalUserProfile = (req, res) => {
  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  const userId = req.session.user.user_id;

  // Query for user info
  const userInfoQuery = `
    SELECT full_name, phone_number, address
    FROM tbl_user_info
    WHERE user_id = ?
  `;

  db.query(userInfoQuery, [userId], (err1, userInfoResult) => {
    if (err1) {
      console.error("Error fetching user info:", err1);
      return res.status(500).json({ message: "Error retrieving user info", error: err1.message });
    }

    // Query for business permits
    const permitsQuery = `
      SELECT business_name AS permitType, application_date, status, BusinessP_id AS referenceNo
      FROM business_permits
      WHERE user_id = ?
      ORDER BY application_date DESC
    `;

    db.query(permitsQuery, [userId], (err2, permitsResult) => {
      if (err2) {
        console.error("Error fetching permits:", err2);
        return res.status(500).json({ message: "Error retrieving permits", error: err2.message });
      }

      // Recent Business Activities
      const recentBusinessQuery = `
        SELECT 'Business Permit Application Submitted' AS action, application_date AS time, 'application' AS type,
               status, BusinessP_id AS referenceNo
        FROM business_permits
        WHERE user_id = ?
        ORDER BY application_date DESC
        LIMIT 3
      `;

      db.query(recentBusinessQuery, [userId], (err3, recentBusiness) => {
        if (err3) {
          console.error("Error fetching recent business:", err3);
          return res.status(500).json({ message: "Error retrieving recent business", error: err3.message });
        }

        const recentCedulaQuery = `
          SELECT 'Cedula Application Submitted' AS action, created_at AS time, 'application' AS type,
                 'approved' AS status, NULL AS referenceNo
          FROM tbl_cedula
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 2
        `;

        db.query(recentCedulaQuery, [userId], (err4, recentCedulas) => {
          if (err4) {
            console.error("Error fetching recent cedulas:", err4);
            return res.status(500).json({ message: "Error retrieving recent cedulas", error: err4.message });
          }

          const recentActivity = [...recentBusiness, ...recentCedulas].sort(
            (a, b) => new Date(b.time) - new Date(a.time)
          );

          res.json({
            userInfo: userInfoResult[0] || {},
            permits: permitsResult,
            recentActivity
          });
        });
      });
    });
  });
};
