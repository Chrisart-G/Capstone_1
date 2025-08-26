const express = require('express');
const router = express.Router();

const userprofileController = require('../Controller/userprofileController');

// ======================= USER PROFILE ROUTES =======================
router.get('/user/profile', userprofileController.MunicipalUserProfile);

module.exports = router;
