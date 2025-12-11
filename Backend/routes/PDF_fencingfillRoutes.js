const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/sessionAuth');
const Fencing = require('../Controller/PDF_fillefencingController');

/* User inline form (Boxes 2–5) */
router.get( '/user/fencing/form',        isAuthenticated, Fencing.user_getForm);
router.post('/user/fencing/form/save',   isAuthenticated, Fencing.user_saveDraft);
router.post('/user/fencing/form/sign',   isAuthenticated, Fencing.user_stampSignaturePreview);
router.post('/user/fencing/form/submit', isAuthenticated, Fencing.user_submitFilled);

module.exports = router;
