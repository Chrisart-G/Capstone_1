// routes/verificationRoutes.js
const express = require("express");
const router = express.Router();
const verificationController = require("../Controller/verificationController");

// HTML pages (when you open the QR link directly)
router.get("/app/:app_uid", verificationController.verifyBusinessApplication);
router.get("/mayors/:app_uid", verificationController.verifyMayorsPermit);

// JSON: auto-detect Mayor vs Business LGU
router.get("/any-json/:app_uid", verificationController.verifyAnyJson);

// QR image upload + decode
router.post("/upload-qr", verificationController.decodeQrFromImage);

module.exports = router;
