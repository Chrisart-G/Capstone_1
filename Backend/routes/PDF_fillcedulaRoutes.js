// Routes/PDF_fillcedulaRoutes.js
const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/sessionAuth");
const Cedula = require("../Controller/PDF_fillcedulaController");

// Employee: generate filled Cedula and attach as requirement
router.post(
  "/cedula-permit/generate-form",
  isAuthenticated,
  Cedula.generateFilledCedula
);

// (Optional) if you want a dedicated remove route using the controller above,
// you can also expose this here:
//
// router.post(
//   "/attached-requirements/remove",
//   isAuthenticated,
//   Cedula.removeAttachedRequirement
// );

module.exports = router;
