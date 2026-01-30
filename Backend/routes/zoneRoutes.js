const express = require('express');
const router = express.Router();
const zoneController = require('../Controller/zoneController');

// Submit zoning permit application
router.post('/zoning-permits', zoneController.submitZoningPermit);

module.exports = router;