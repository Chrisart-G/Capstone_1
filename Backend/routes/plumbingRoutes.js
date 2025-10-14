const express = require('express');
const router = express.Router();

const plumbingPermitController = require('../Controller/plumbingController');

// ======================= PLUMBING PERMIT ROUTES =======================

// Create new plumbing permit application
router.post('/plumbing-permits', plumbingPermitController.createPlumbingPermit);

module.exports = router;