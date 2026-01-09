// routes/employeedashRoutes.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
const C = require('../Controller/employeedashController');
const PDF_fillelectricalController = require("../Controller/PDF_fillelectricalController");
const PDF_fillelectronicsController = require("../Controller/PDF_fillelectronicsController");
const PDF_fillefencingController = require("../Controller/PDF_fillefencingController"); // ← add this

/* ===================== LISTS ===================== */
router.get('/plumbing-applications', isAuthenticated, C.getAllPlumbingPermitsForEmployee);
router.get('/electronics-applications', isAuthenticated, C.getAllElectronicsPermitsForEmployee);
router.get('/building-applications', isAuthenticated, C.getAllBuildingPermitsForEmployee);
router.get('/fencing-applications', isAuthenticated, C.getAllFencingPermitsForEmployee);
router.get('/electrical-applications', isAuthenticated, C.getAllElectricalPermitsForEmployee);


/* ===================== GET BY ID ===================== */
router.get('/plumbing-applications/:id', isAuthenticated, C.getPlumbingById);
router.get('/electronics-applications/:id', isAuthenticated, C.getElectronicsById);
router.get('/building-applications/:id', isAuthenticated, C.getBuildingById);
router.get('/fencing-applications/:id', isAuthenticated, C.getFencingById);
router.get('/electrical-applications/:id', isAuthenticated, C.getElectricalPermitById);


/* ================= ACCEPT (→ in-review) ================= */
// 4 permits
router.put('/plumbing-applications/:id/accept', isAuthenticated, C.acceptPlumbing);
router.put('/electronics-applications/:id/accept', isAuthenticated, C.acceptElectronics);
router.put('/building-applications/:id/accept', isAuthenticated, C.acceptBuilding);
router.put('/fencing-applications/:id/accept', isAuthenticated, C.acceptFencing);
// electrical (frontend already calls this path)
router.put('/electrical-applications/:id/accept', isAuthenticated, C.updateElectricalPermitStatus);

/* ============ IN-REVIEW → IN-PROGRESS ============ */
router.put('/plumbing-applications/move-to-inprogress', isAuthenticated, C.plumbingToInProgress);
router.put('/electronics-applications/move-to-inprogress', isAuthenticated, C.electronicsToInProgress);
router.put('/building-applications/move-to-inprogress', isAuthenticated, C.buildingToInProgress);
router.put('/fencing-applications/move-to-inprogress', isAuthenticated, C.fencingToInProgress);
router.put('/electrical-applications/move-to-inprogress', isAuthenticated, C.electricalToInProgress);

/* ===== IN-PROGRESS → REQUIREMENTS-COMPLETED ===== */
router.put('/plumbing-applications/move-to-requirements-completed', isAuthenticated, C.plumbingToRequirementsCompleted);
router.put('/electronics-applications/move-to-requirements-completed', isAuthenticated, C.electronicsToRequirementsCompleted);
router.put('/building-applications/move-to-requirements-completed', isAuthenticated, C.buildingToRequirementsCompleted);
router.put('/fencing-applications/move-to-requirements-completed', isAuthenticated, C.fencingToRequirementsCompleted);
router.put('/electrical-applications/move-to-requirements-completed', isAuthenticated, C.electricalToRequirementsCompleted);

/* ========== REQUIREMENTS-COMPLETED → APPROVED ========== */
router.put('/plumbing-applications/move-to-approved', isAuthenticated, C.plumbingToApproved);
router.put('/electronics-applications/move-to-approved', isAuthenticated, C.electronicsToApproved);
router.put('/building-applications/move-to-approved', isAuthenticated, C.buildingToApproved);
router.put('/fencing-applications/move-to-approved', isAuthenticated, C.fencingToApproved);
router.put('/electrical-applications/move-to-approved', isAuthenticated, C.electricalToApproved);

/* ================= READY FOR PICKUP ================= */
router.put('/plumbing-applications/set-pickup', isAuthenticated, C.plumbingSetPickup);
router.put('/electronics-applications/set-pickup', isAuthenticated, C.electronicsSetPickup);
router.put('/building-applications/set-pickup', isAuthenticated, C.buildingSetPickup);
router.put('/fencing-applications/set-pickup', isAuthenticated, C.fencingSetPickup);
router.put('/electrical-applications/set-pickup', isAuthenticated, C.electricalSetPickup);



/* ================ REQUIREMENTS LIBRARY / COMMENTS ================ */
router.get('/requirements-library', isAuthenticated, C.listRequirementLibrary);
router.post('/attach-requirement', isAuthenticated, C.attachRequirementFromLibrary);
router.get('/attached-requirements', isAuthenticated, C.getAttachedRequirements);
router.get('/application-comments', isAuthenticated, C.getApplicationComments);
router.post('/application-comments', isAuthenticated, C.addApplicationComment);
router.post('/attached-requirements/remove', isAuthenticated, C.removeAttachedRequirement);
// *** NEW: user-side comments for tracking page ***
router.get('/user/comments', isAuthenticated, C.getUserComments);
// ===== Section 2: Assessment (add-only) =====
router.post('/business-permit/assessment/save', isAuthenticated, C.saveBusinessPermitAssessment);
router.post('/business-permit/generate-form-with-assessment', isAuthenticated, C.generateBusinessPermitFormWithAssessment);


// routes/employeedashRoutes.js
router.post(
  "/electrical-permit/generate-form",
  isAuthenticated, // optional but recommended
  PDF_fillelectricalController.generateFilledElectrical
);
router.post(
  "/attached-requirements/remove",
  isAuthenticated,
  PDF_fillelectricalController.removeAttachedRequirement
);

router.post(
  '/business-permit/generate-form',
  isAuthenticated,
  C.generateBusinessPermitForm
);
router.post(
  "/electronics-permit/generate-form",
  isAuthenticated,
  PDF_fillelectronicsController.generateFilledElectronics
);
router.post(
  "/electronics/attached-requirements/remove",
  isAuthenticated,
  PDF_fillelectronicsController.removeAttachedRequirement
);
// FENCING: generate filled form and attach
router.post(
  "/fencing-permit/generate-form",
  isAuthenticated,
  PDF_fillefencingController.generateFilledFencing
);

// FENCING: remove an attached requirement (system/generated)
router.post(
  "/fencing/attached-requirements/remove",
  isAuthenticated,
  PDF_fillefencingController.removeAttachedRequirement
);
/* ===== ANY STATUS → ON-HOLD ===== */
router.put(
  '/applications/move-to-onhold',
  isAuthenticated,
  C.businessToOnHold
);
router.put(
  '/electrical-applications/move-to-onhold',
  isAuthenticated,
  C.electricalToOnHold
);
router.put(
  '/plumbing-applications/move-to-onhold',
  isAuthenticated,
  C.plumbingToOnHold
);
router.put(
  '/electronics-applications/move-to-onhold',
  isAuthenticated,
  C.electronicsToOnHold
);
router.put(
  '/building-applications/move-to-onhold',
  isAuthenticated,
  C.buildingToOnHold
);
router.put(
  '/fencing-applications/move-to-onhold',
  isAuthenticated,
  C.fencingToOnHold
);
router.put(
  '/cedula/move-to-onhold',
  isAuthenticated,
  C.moveCedulaToOnHold
);

/* ===== APPROVED → PICKUP-DOCUMENT ===== */
router.put(
  '/applications/move-to-pickup-document',
  isAuthenticated,
  C.businessToPickupDocument
);
router.put(
  '/electrical-applications/move-to-pickup-document',
  isAuthenticated,
  C.electricalToPickupDocument
);
router.put(
  '/plumbing-applications/move-to-pickup-document',
  isAuthenticated,
  C.plumbingToPickupDocument
);
router.put(
  '/electronics-applications/move-to-pickup-document',
  isAuthenticated,
  C.electronicsToPickupDocument
);
router.put(
  '/building-applications/move-to-pickup-document',
  isAuthenticated,
  C.buildingToPickupDocument
);
router.put(
  '/fencing-applications/move-to-pickup-document',
  isAuthenticated,
  C.fencingToPickupDocument
);
router.put(
  '/cedula/move-to-pickup-document',
  isAuthenticated,
  C.moveCedulaToPickupDocument
);

module.exports = router;
