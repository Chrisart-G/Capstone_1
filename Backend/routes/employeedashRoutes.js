// routes/employeedashRoutes.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
const C = require('../Controller/employeedashController');

// ---- LISTS
router.get('/plumbing-applications', isAuthenticated, C.getAllPlumbingPermitsForEmployee);
router.get('/electronics-applications', isAuthenticated, C.getAllElectronicsPermitsForEmployee);
router.get('/building-applications', isAuthenticated, C.getAllBuildingPermitsForEmployee);
router.get('/fencing-applications', isAuthenticated, C.getAllFencingPermitsForEmployee);

// ---- GET BY ID (for modal “View Info”)
router.get('/plumbing-applications/:id', isAuthenticated, C.getPlumbingById);
router.get('/electronics-applications/:id', isAuthenticated, C.getElectronicsById);
router.get('/building-applications/:id', isAuthenticated, C.getBuildingById);
router.get('/fencing-applications/:id', isAuthenticated, C.getFencingById);

// ---- ACCEPT (move to in-review)
router.put('/plumbing-applications/:id/accept', isAuthenticated, C.acceptPlumbing);
router.put('/electronics-applications/:id/accept', isAuthenticated, C.acceptElectronics);
router.put('/building-applications/:id/accept', isAuthenticated, C.acceptBuilding);
router.put('/fencing-applications/:id/accept', isAuthenticated, C.acceptFencing);

// ---- IN-PROGRESS
router.put('/plumbing-applications/move-to-inprogress', isAuthenticated, C.plumbingToInProgress);
router.put('/electronics-applications/move-to-inprogress', isAuthenticated, C.electronicsToInProgress);
router.put('/building-applications/move-to-inprogress', isAuthenticated, C.buildingToInProgress);
router.put('/fencing-applications/move-to-inprogress', isAuthenticated, C.fencingToInProgress);

// ---- REQUIREMENTS-COMPLETED
router.put('/plumbing-applications/move-to-requirements-completed', isAuthenticated, C.plumbingToRequirementsCompleted);
router.put('/electronics-applications/move-to-requirements-completed', isAuthenticated, C.electronicsToRequirementsCompleted);
router.put('/building-applications/move-to-requirements-completed', isAuthenticated, C.buildingToRequirementsCompleted);
router.put('/fencing-applications/move-to-requirements-completed', isAuthenticated, C.fencingToRequirementsCompleted);

// ---- APPROVED
router.put('/plumbing-applications/move-to-approved', isAuthenticated, C.plumbingToApproved);
router.put('/electronics-applications/move-to-approved', isAuthenticated, C.electronicsToApproved);
router.put('/building-applications/move-to-approved', isAuthenticated, C.buildingToApproved);
router.put('/fencing-applications/move-to-approved', isAuthenticated, C.fencingToApproved);

// ---- READY FOR PICKUP
router.put('/plumbing-applications/set-pickup', isAuthenticated, C.plumbingSetPickup);
router.put('/electronics-applications/set-pickup', isAuthenticated, C.electronicsSetPickup);
router.put('/building-applications/set-pickup', isAuthenticated, C.buildingSetPickup);
router.put('/fencing-applications/set-pickup', isAuthenticated, C.fencingSetPickup);


// Requirements library + attach (from system, not local upload)
router.get('/requirements-library', isAuthenticated, C.listRequirementLibrary);
router.post('/attach-requirement', isAuthenticated, C.attachRequirementFromLibrary);
router.get('/attached-requirements', isAuthenticated, C.getAttachedRequirements);
// Comments on application
router.get('/application-comments', isAuthenticated, C.getApplicationComments);
router.post('/application-comments', isAuthenticated, C.addApplicationComment);
//--------------for sms
router.get('/sms/credits', isAuthenticated, C.smsCredits);
router.post('/sms/test', isAuthenticated, C.smsTest);
module.exports = router;
