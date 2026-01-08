// Routes/employeeArchiveRoutes.js
const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/sessionAuth");
const ArchiveController = require("../Controller/EmployeeArchiveController");

// Stats + list for archives page
router.get(
  "/employee/archive-stats",
  isAuthenticated,
  ArchiveController.getArchiveStats
);

router.get(
  "/employee/archive-list",
  isAuthenticated,
  ArchiveController.getArchiveList
);

// Mark an application as picked up + archived
router.post(
  "/employee/archive/mark-picked-up",
  isAuthenticated,
  ArchiveController.markPickedUp
);

module.exports = router;
