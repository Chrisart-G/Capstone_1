// Routes/admindashRoutes.js
const express = require('express');
const router = express.Router();
const adminDashController = require('../Controller/admindashController');
const auth = require('../middleware/sessionAuth');

// GET /api/admin-dashboard/stats
router.get('/stats', auth, adminDashController.getAdminDashboardStats);

module.exports = router;
