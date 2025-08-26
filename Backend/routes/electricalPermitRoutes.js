const express = require('express');
const router = express.Router();

const electricalPermitController = require('../Controller/electricalPermitController');

// ======================= ELECTRICAL PERMIT ROUTES =======================
router.post('/electrical-permits', electricalPermitController.createElectricalPermit);
router.get('/getelectrical-permits', electricalPermitController.getAllElectricalPermits);
router.get('/electrical-applications', electricalPermitController.getAllElectricalPermitsForEmployee);
router.get('/electrical-applications/:id', electricalPermitController.getElectricalPermitById);
router.put('/electrical-applications/:id/accept', electricalPermitController.updateElectricalPermitStatus);

router.put('/electrical-applications/move-to-inprogress', electricalPermitController.moveElectricalToInProgress);
router.put('/electrical-applications/move-to-requirements-completed', electricalPermitController.moveElectricalToRequirementsCompleted);
router.put('/electrical-applications/move-to-approved', electricalPermitController.moveElectricalToApproved);
router.put('/electrical-applications/set-pickup', electricalPermitController.moveElectricalToReadyForPickup);

module.exports = router;
