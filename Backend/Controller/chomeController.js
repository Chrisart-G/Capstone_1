// Controller/chomeController.js
const db = require('../db/dbconnect');

// Get all published announcements for citizen home page
exports.getHomeAnnouncement = (req, res) => {
  const sql = `
    SELECT 
      id,
      title,
      body,
      DATE_FORMAT(posted_at, '%M %e, %Y') AS postedAt
    FROM tbl_announcements
    WHERE is_published = 1
    ORDER BY posted_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching home announcement:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load latest announcements.',
      });
    }

    if (!rows || rows.length === 0) {
      // No published announcements
      return res.json({
        success: false,
        announcements: [],
        message: 'No active announcements.',
      });
    }

    const announcements = rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      postedAt: row.postedAt,
    }));

    return res.json({
      success: true,
      announcements,
    });
  });
};
