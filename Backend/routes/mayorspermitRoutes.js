const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/sessionAuth");
const PDF_mayorspermitController = require("../Controller/PDF_mayorspermitController");

/* ───────── Mayor's Permit endpoints ───────── */

// Upload Mayor e-signature (PNG/JPG)
router.post(
  "/mayors-permit/upload-signature",
  isAuthenticated,
  PDF_mayorspermitController.uploadMayorSignature
);

// Generate Final Mayor's Permit
router.post(
  "/mayors-permit/generate-final",
  isAuthenticated,
  PDF_mayorspermitController.generateFinalMayorsPermit
);

// Optional: remove an attached requirement produced by this module
router.post(
  "/mayors-permit/attached-requirements/remove",
  isAuthenticated,
  PDF_mayorspermitController.removeAttachedRequirement
);

/* (Optional) Provide a generic alias so existing UI that posts to
   /api/attached-requirements/remove will also work. */
router.post(
  "/attached-requirements/remove",
  isAuthenticated,
  PDF_mayorspermitController.removeAttachedRequirement
);

module.exports = router;
