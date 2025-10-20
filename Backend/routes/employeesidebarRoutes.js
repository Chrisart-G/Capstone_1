// routes/employeesidebarRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../Controller/employeesidebarController');

// GET badge counts for the employee sidebar
router.get('/employee/sidebar/badges', controller.getSidebarBadges);

module.exports = router;
