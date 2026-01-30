// routes/PDF_fillbusinesspermitRoutes.js
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/sessionAuth");
const C = require("../Controller/PDF_fillbusinesspermitController");

/* ── USER inline fill (Business Permit – Verification Sheet) ── */
router.get ("/user/business/form",          isAuthenticated, C.user_getForm);
router.post("/user/business/form/save",     isAuthenticated, C.user_saveDraft);
router.post("/user/business/form/preview",  isAuthenticated, C.user_generatePreview);
router.post("/user/business/form/submit",    C.user_submitFilled);

module.exports = router;
