// routes/newemployeedashRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../Controller/newemployeedashController");

/* ===================================================================
   LIST
=================================================================== */

// Business permits for BPLO or MEO/MAO/MHO (depending on logged-in department)
router.get("/applications", ctrl.getAllBusinessPermitsForEmployee);

/* ===================================================================
   GET BY ID
=================================================================== */

router.get("/applications/:id", ctrl.getBusinessPermitById);

/* ===================================================================
   STATUS: ACCEPT (→ IN-REVIEW)
=================================================================== */

router.put("/applications/:id/accept", ctrl.acceptBusiness);

/* ===================================================================
   STATUS: MOVE TO ON-HOLD
=================================================================== */

router.put("/applications/:id/move-to-onhold", ctrl.businessToOnHold);

/* ===================================================================
   STATUS: MOVE TO APPROVED
=================================================================== */

router.put("/applications/:id/move-to-approved", ctrl.businessToApproved);

/* ===================================================================
   STATUS: MOVE BACK TO PENDING (from On Hold)
=================================================================== */

router.put("/applications/:id/move-to-pending", ctrl.businessToPending);
router.put("/applications/:id/update-requirement-status", ctrl.updateRequirementStatus);
module.exports = router;
