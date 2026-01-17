// Controller/adminnotifControler.js
const db = require('../db/dbconnect');

/**
 * Helper to check session
 */
function requireSession(req, res) {
  if (!req.session?.user?.user_id) {
    res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    return null;
  }
  return req.session.user;
}

/* ==================== ANNOUNCEMENTS ==================== */

// GET /api/admin/announcements
exports.getAnnouncements = (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;

  const sql = `
    SELECT id, title, body, is_published, posted_by, posted_at, updated_at
    FROM tbl_announcements
    ORDER BY posted_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching announcements:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load announcements.',
        error: err.message,
      });
    }

    res.status(200).json({
      success: true,
      announcements: rows,
    });
  });
};

// POST /api/admin/announcements
exports.createAnnouncement = (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;

  const { title, body, isPublished } = req.body || {};

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: 'Title and body are required.',
    });
  }

  const sql = `
    INSERT INTO tbl_announcements (title, body, is_published, posted_by)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    title.trim(),
    body,
    isPublished === false ? 0 : 1,
    user.user_id || null,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error creating announcement:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create announcement.',
        error: err.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully.',
      announcementId: result.insertId,
    });
  });
};

/* ==================== ADMIN NOTIFICATIONS ==================== */

// GET /api/admin/notifications
exports.getAllNotifications = (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;

  const sql = `
    SELECT id, type, title, message, employee_id, status, created_at, read_at, resolved_at
    FROM tbl_admin_notifications
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching admin notifications:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load notifications.',
        error: err.message,
      });
    }

    res.status(200).json({
      success: true,
      notifications: rows,
    });
  });
};

// PATCH /api/admin/notifications/:id/read
exports.markNotificationAsRead = (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;

  const notifId = req.params.id;
  if (!notifId) {
    return res.status(400).json({
      success: false,
      message: 'Notification ID is required.',
    });
  }

  const sql = `
    UPDATE tbl_admin_notifications
    SET status = 'read', read_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [notifId], (err, result) => {
    if (err) {
      console.error('Error marking notification as read:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification.',
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  });
};
// PUT /api/admin/announcements/:id
exports.updateAnnouncement = (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;

  const announcementId = req.params.id;
  const { title, body, isPublished } = req.body || {};

  if (!announcementId) {
    return res.status(400).json({
      success: false,
      message: 'Announcement ID is required.',
    });
  }

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: 'Title and body are required.',
    });
  }

  const sql = `
    UPDATE tbl_announcements
    SET title = ?, body = ?, is_published = ?
    WHERE id = ?
  `;

  const values = [
    String(title).trim(),
    body,
    isPublished === false || isPublished === 0 ? 0 : 1,
    announcementId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating announcement:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update announcement.',
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
    });
  });
};

// DELETE /api/admin/announcements/:id
exports.deleteAnnouncement = (req, res) => {
  const user = requireSession(req, res);
  if (!user) return;

  const announcementId = req.params.id;

  if (!announcementId) {
    return res.status(400).json({
      success: false,
      message: 'Announcement ID is required.',
    });
  }

  const sql = `DELETE FROM tbl_announcements WHERE id = ?`;

  db.query(sql, [announcementId], (err, result) => {
    if (err) {
      console.error('Error deleting announcement:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete announcement.',
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  });
};

