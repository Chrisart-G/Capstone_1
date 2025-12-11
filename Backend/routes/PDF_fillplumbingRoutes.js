// routes/PDF_fillplumbingRoutes.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
const Plumbing = require('../Controller/PDF_fillplumbingController');

/* Admin/employee generation (you already had this) */
router.post('/plumbing-permit/generate-form', isAuthenticated, Plumbing.generateFilledPlumbing);

/* ───────── USER INLINE (Boxes 2–6) ───────── */
router.get( '/user/plumbing/form',        isAuthenticated, Plumbing.user_getForm);
router.post('/user/plumbing/form/save',   isAuthenticated, Plumbing.user_saveDraft);
router.post('/user/plumbing/form/sign',   isAuthenticated, Plumbing.user_stampSignaturePreview);
router.post('/user/plumbing/form/submit', isAuthenticated, Plumbing.user_submitFilled);

module.exports = router;
