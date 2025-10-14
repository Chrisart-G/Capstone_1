
const express = require('express');
const router = express.Router();

const electronicPermitController = require('../Controller/electronicpermitsController');

// ======================= ELECTRONICS PERMIT ROUTES =======================

// Create new electronics permit application
router.post('/electronics-permits', electronicPermitController.createElectronicsPermit);

module.exports = router;