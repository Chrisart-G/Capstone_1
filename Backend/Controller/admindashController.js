// Controller/admindashController.js
const db = require('../db/dbconnect');

// small helper to use Promises with mysql
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

/**
 * GET /api/admin-dashboard/stats
 * Returns:
 * {
 *   success: true,
 *   totals: {
 *     totalEmployees,
 *     totalOffices,
 *     totalApplications
 *   },
 *   statusCounts: {
 *     'pending': 0,
 *     'in-review': 1,
 *     ...
 *   }
 * }
 */
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // total employees
    const empRows = await query(
      'SELECT COUNT(*) AS total_employees FROM tbl_employeeinformation'
    );

    // total offices
    const officeRows = await query(
      'SELECT COUNT(*) AS total_offices FROM tbl_offices'
    );

    // total applications (all documents submitted)
    // application_index has one row per submitted application
    const appRows = await query(
      'SELECT COUNT(*) AS total_applications FROM application_index'
    );

    // aggregate status counts across all permit tables + cedula
    const statusRows = await query(`
      SELECT status, COUNT(*) AS count
      FROM (
        SELECT status FROM business_permits
        UNION ALL
        SELECT status FROM tbl_building_permits
        UNION ALL
        SELECT status FROM tbl_electrical_permits
        UNION ALL
        SELECT status FROM tbl_electronics_permits
        UNION ALL
        SELECT status FROM tbl_plumbing_permits
        UNION ALL
        SELECT status FROM tbl_fencing_permits
        UNION ALL
        SELECT application_status AS status FROM tbl_cedula
      ) AS all_statuses
      GROUP BY status
    `);

    const statusCounts = {};
    statusRows.forEach(row => {
      statusCounts[row.status] = row.count;
    });

    res.json({
      success: true,
      totals: {
        totalEmployees: empRows[0]?.total_employees || 0,
        totalOffices: officeRows[0]?.total_offices || 0,
        totalApplications: appRows[0]?.total_applications || 0,
      },
      statusCounts,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard stats',
      error: err.message,
    });
  }
};
