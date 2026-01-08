// Backend/Routes/employeeHistoryRoutes.js
const express = require("express");
const router = express.Router();

const isAuthenticated = require("../middleware/sessionAuth");
const employeeHistory = require("../Controller/employeeHistoryController");

// Stats cards (Total, Approved, Rejected, Avg Time)
router.get(
  "/history-stats",
  isAuthenticated,
  employeeHistory.getHistoryStats
);

// List of applications processed by this employee
router.get(
  "/history-list",
  isAuthenticated,
  employeeHistory.getHistoryList
);

module.exports = router;
