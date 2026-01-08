const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/sessionAuth");
const CedulaTreasurer = require("../Controller/PDF_cedulaTreasurerController");

router.post(
  "/cedula/upload-treasurer-signature",
  isAuthenticated,
  CedulaTreasurer.uploadTreasurerSignature
);

router.post(
  "/cedula/generate-final",
  isAuthenticated,
  CedulaTreasurer.generateCedulaFinal
);

module.exports = router;
