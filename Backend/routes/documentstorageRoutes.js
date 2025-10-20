// routes/documentstorageRoutes.js
const express = require("express");
const Controller = require("../Controller/documentstorageController");

const router = express.Router();

// Offices & Categories
router.get("/offices", Controller.getOffices);
router.get("/categories/:office_id", Controller.getCategoriesByOffice);
router.post("/categories", Controller.addCategory);

// Requirements CRUD
router.get("/requirements", Controller.listRequirements);
router.post("/requirements", Controller.addRequirement);            // expects FormData with `template` (optional)
router.put("/requirements/:id", Controller.updateRequirement);      // same
router.delete("/requirements/:id", Controller.deleteRequirement);

// Optional: download template
router.get("/requirements/:id/template", Controller.downloadTemplate);

module.exports = router;
