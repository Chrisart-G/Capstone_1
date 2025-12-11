// routes/permitstrackingRoutes.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
const PermitsTrackingController = require('../Controller/permitstrackingController');

// existing
router.get('/plumbing-permits-tracking',    isAuthenticated, PermitsTrackingController.getPlumbingPermitsForTracking);
router.get('/electronics-permits-tracking', isAuthenticated, PermitsTrackingController.getElectronicsPermitsForTracking);
router.get('/building-permits-tracking',    isAuthenticated, PermitsTrackingController.getBuildingPermitsForTracking);
router.get('/fencing-permits-tracking',     isAuthenticated, PermitsTrackingController.getFencingPermitsForTracking);

router.get('/user/requirements',            isAuthenticated, PermitsTrackingController.getUserAttachedRequirements);
router.post('/user/requirements/upload',    isAuthenticated, PermitsTrackingController.uploadUserRequirement);
router.post('/admin/requirements/replace-upload', isAuthenticated, PermitsTrackingController.replaceUserRequirementUpload);

// 🔥 NEW: user can replace their own uploaded requirement file
router.post('/user/requirements/replace-upload', isAuthenticated, PermitsTrackingController.replaceUserRequirementUploadByUser);

// 🔥 NEW: user comments
router.post('/user/comments',               isAuthenticated, PermitsTrackingController.addUserCommentForApplication);

// ───────────────────────────────────────────────────────────
// 🔥 NEW Electrical “fill in system” endpoints
const ElectricalUserFill = require('../Controller/electricaluserfillController');

// Load latest generated template + saved draft + (if any) user-filled URL
router.get('/user/electrical/form',         isAuthenticated, ElectricalUserFill.getFormInfo);

// Save draft (Boxes 2–5 text fields, roles, etc.)
router.post('/user/electrical/form/save',   isAuthenticated, ElectricalUserFill.saveDraftFields);

// Stamp a drawn/uploaded e-signature image onto the working PDF (preview)
router.post('/user/electrical/form/sign',   isAuthenticated, ElectricalUserFill.stampSignature);

// Render draft onto PDF, flatten, and attach as the user's upload
router.post('/user/electrical/form/submit', isAuthenticated, ElectricalUserFill.submitFilledPdf);

module.exports = router;
