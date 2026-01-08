// Backend/Routes/userupdateRoutes.js
const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/sessionAuth");
const UserUpdate = require("../Controller/userupdateController");

// GET current values to edit
router.get(
  "/user/update/:application_type/:application_id",
  isAuthenticated,
  UserUpdate.getApplicationForUpdate
);

// PUT update values
router.put(
  "/user/update/:application_type/:application_id",
  isAuthenticated,
  UserUpdate.updateApplication
);
router.post(
  "/user/cancel/:application_type/:application_id",
  isAuthenticated,
  UserUpdate.cancelApplication
);

module.exports = router;
