// routes/userdashRoutes.js  (or wherever your *user* electrical routes are)
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
const PDF_fillelectronicsController = require('../Controller/PDF_fillelectronicsController');

/* ───────── USER: Electronics Inline Form ───────── */
router.get( '/user/electronics/form',        isAuthenticated, PDF_fillelectronicsController.user_getForm);
router.post('/user/electronics/form/save',   isAuthenticated, PDF_fillelectronicsController.user_saveDraft);
router.post('/user/electronics/form/sign',   isAuthenticated, PDF_fillelectronicsController.user_stampSignaturePreview);
router.post('/user/electronics/form/submit', isAuthenticated, PDF_fillelectronicsController.user_submitFilled);

module.exports = router;
