// routes/permitstrackingRoutes.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
const PermitsTrackingController = require('../Controller/permitstrackingController');

// one endpoint per permit type (clear and explicit)
router.get('/plumbing-permits-tracking',   isAuthenticated, PermitsTrackingController.getPlumbingPermitsForTracking);
router.get('/electronics-permits-tracking',isAuthenticated, PermitsTrackingController.getElectronicsPermitsForTracking);
router.get('/building-permits-tracking',   isAuthenticated, PermitsTrackingController.getBuildingPermitsForTracking);
router.get('/fencing-permits-tracking',    isAuthenticated, PermitsTrackingController.getFencingPermitsForTracking);
// User-facing requirements (download template + upload filled file)
router.get('/user/requirements', isAuthenticated, PermitsTrackingController.getUserAttachedRequirements);
router.post('/user/requirements/upload', isAuthenticated, PermitsTrackingController.uploadUserRequirement);

module.exports = router;
