const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

const applicationRequirementsController = require('../Controller/applicationrequirementsController');

// ======================= APPLICATION REQUIREMENTS ROUTES =======================
router.post('/upload-requirement', isAuthenticated, applicationRequirementsController.uploadRequirement);

module.exports = router;
