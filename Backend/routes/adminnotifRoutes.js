// routes/adminnotifRoutes.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

const AdminNotifController = require('../Controller/adminnotifControler');

// =============== ANNOUNCEMENTS (Admin) ===============

// List all announcements
router.get(
  '/admin/announcements',
  isAuthenticated,
  AdminNotifController.getAnnouncements
);

// Create new announcement
router.post(
  '/admin/announcements',
  isAuthenticated,
  AdminNotifController.createAnnouncement
);

// ✅ Update existing announcement
router.put(
  '/admin/announcements/:id',
  isAuthenticated,
  AdminNotifController.updateAnnouncement
);

// ✅ Delete announcement
router.delete(
  '/admin/announcements/:id',
  isAuthenticated,
  AdminNotifController.deleteAnnouncement
);

// =============== ADMIN NOTIFICATIONS (from employees, etc.) ===============

// List all notifications
router.get(
  '/admin/notifications',
  isAuthenticated,
  AdminNotifController.getAllNotifications
);

// Mark notification as read
router.patch(
  '/admin/notifications/:id/read',
  isAuthenticated,
  AdminNotifController.markNotificationAsRead
);

module.exports = router;
