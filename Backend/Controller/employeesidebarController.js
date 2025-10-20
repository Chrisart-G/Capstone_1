// controllers/employeesidebarController.js
const db = require('../db/dbconnect');

/**
 * GET /api/employee/sidebar/badges
 * Returns { applications, payments }
 * Counts all "pending" applications across your permit tables
 * and "pending" payment receipts.
 */
exports.getSidebarBadges = (req, res) => {
  try {
    // --- Session auth (same style you already use) ---
    if (!req.session?.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    // NOTE: Simple, reliable single SELECT with scalar subqueries.
    // If a table doesn’t exist in your DB, remove that subquery.
    const sql = `
      SELECT
        (
          (SELECT COUNT(*) FROM business_permits          WHERE status = 'pending') +
          (SELECT COUNT(*) FROM tbl_building_permits      WHERE status = 'pending') +
          (SELECT COUNT(*) FROM tbl_electrical_permits    WHERE status = 'pending') +
          (SELECT COUNT(*) FROM tbl_plumbing_permits      WHERE status = 'pending') +
          (SELECT COUNT(*) FROM tbl_fencing_permits       WHERE status = 'pending') +
          (SELECT COUNT(*) FROM tbl_electronics_permits   WHERE status = 'pending') +
          (SELECT COUNT(*) FROM tbl_cedula                WHERE application_status = 'pending')
        ) AS applications,
        (
          SELECT COUNT(*) FROM tbl_payment_receipts WHERE payment_status = 'pending'
        ) AS payments
    `;

    db.query(sql, [], (err, rows) => {
      if (err) {
        console.error('Sidebar badges query failed:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to compute sidebar badges.',
          error: err.message,
        });
      }

      const row = rows && rows[0] ? rows[0] : { applications: 0, payments: 0 };

      return res.status(200).json({
        success: true,
        badges: {
          applications: Number(row.applications) || 0,
          payments: Number(row.payments) || 0,
        },
      });
    });
  } catch (error) {
    console.error('Unexpected error in getSidebarBadges:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message,
    });
  }
};
