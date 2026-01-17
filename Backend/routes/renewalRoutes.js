// routes/renewalRoutes.js
const express = require('express');
const router = express.Router();

const {
  getCurrentBusinessPermitForUser,
  getBusinessPermitsForUser,
  getRenewalPrefill,
} = require('../Controller/renewalController');

// ALL business permits for this user (for the dropdown)
router.get('/list/:user_id', getBusinessPermitsForUser);

// Latest business permit only (kept just in case something else still uses it)
router.get('/current/:user_id', getCurrentBusinessPermitForUser);

// Prefill data for the renewal form
router.get('/prefill', getRenewalPrefill);

module.exports = router;
