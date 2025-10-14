const express = require('express');
const router = express.Router();
const fencingPermitController = require('../Controller/fencingPermitController');

// ======================= FENCING PERMIT ROUTES =======================
// Create new fencing permit application
router.post('/fencing-permits', fencingPermitController.createFencingPermit);

module.exports = router;