const express = require('express');
const router = express.Router();

const buildingPermitController = require('../Controller/buildingPermitController');

// ======================= BUILDING PERMIT ROUTES =======================

// Create new building permit application
router.post('/building-permits', buildingPermitController.createBuildingPermit);

// Get all building permits for logged-in user
router.get('/getbuilding-permits', buildingPermitController.getAllBuildingPermits);




// Update building permit status (accept/reject)
router.put('/building-applications/:id/accept', buildingPermitController.updateBuildingPermitStatus);

// Move building permit through workflow stages
router.put('/building-applications/move-to-inprogress', buildingPermitController.moveBuildingToInProgress);
router.put('/building-applications/move-to-requirements-completed', buildingPermitController.moveBuildingToRequirementsCompleted);
router.put('/building-applications/move-to-approved', buildingPermitController.moveBuildingToApproved);
router.put('/building-applications/set-pickup', buildingPermitController.moveBuildingToReadyForPickup);

module.exports = router;