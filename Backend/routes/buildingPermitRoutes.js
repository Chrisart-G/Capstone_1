const express = require('express');
const router = express.Router();

const buildingPermitController = require('../Controller/buildingPermitController');

// ======================= BUILDING PERMIT ROUTES =======================

// Create new building permit application
router.post('/building-permits', buildingPermitController.createBuildingPermit);

// Get all building permits for logged-in user
router.get('/getbuilding-permits', buildingPermitController.getAllBuildingPermits);






module.exports = router;