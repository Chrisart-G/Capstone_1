// routes/PDF_fillbuildingpermitRoutes.js
const express = require("express");
const router = express.Router();

const PDF_fillbuildingController = require("../Controller/PDF_fillbuildingController");

// Match the same pattern used by fencing/plumbing/electronics:
router.post("/building-permit/generate-form", PDF_fillbuildingController.generateFilledBuilding);

// Optional: quick probe
router.get("/health/building-form", (_req, res) =>
  res.json({ ok: true, message: "Building form routes up" })
);

module.exports = router;
