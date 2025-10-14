const express = require('express');
const router = express.Router();
const userProfileController = require('../Controller/userprofileController');

// ======================= USER PROFILE ROUTES =======================
// Get user profile with all permits and statistics
router.get('/profile', userProfileController.MunicipalUserProfile);

module.exports = router;