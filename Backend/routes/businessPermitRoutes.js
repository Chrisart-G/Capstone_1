const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

const BuspermitController = require('../Controller/buspermitController');
const applicationController = require('../Controller/applicationController');

// ======================= BUSINESS PERMIT ROUTES =======================
router.post('/BusinessPermit', isAuthenticated, BuspermitController.SubmitBusinessPermit);
router.get('/businesspermits', isAuthenticated, BuspermitController.getAllPermits);

router.get('/applications', isAuthenticated, BuspermitController.GetAllApplications);
router.get('/applications/:id', isAuthenticated, BuspermitController.GetApplicationById);
router.put('/applications/:id/accept', applicationController.acceptApplication);

router.put('/applications/move-to-inprogress', BuspermitController.moveBusinessToInProgress);
router.put('/applications/move-to-requirements-completed', BuspermitController.moveBusinessToRequirementsCompleted);
router.put('/applications/move-to-approved', BuspermitController.moveBusinessToApproved);
router.put('/applications/set-pickup', BuspermitController.moveBusinessToReadyForPickup);

module.exports = router;
