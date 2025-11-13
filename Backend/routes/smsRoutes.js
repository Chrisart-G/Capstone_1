// routes/smsRoutes.js
const express = require("express");
const router = express.Router();
const sms = require("../Controller/smsController"); // ✅ correct path/casing

// In production, protect these with real admin auth
router.get("/status", sms.getSmsEnabledStatus);
router.post("/toggle", sms.setSmsEnabled);
router.get("/credits", sms.getCredits); // 🔎 debug credits

router.post("/send", sms.sendStatusUpdate);
router.post("/test", sms.sendTest);

module.exports = router;
