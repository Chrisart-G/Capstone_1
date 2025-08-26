const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

const CedulaController = require('../Controller/cedulaController');

// ======================= CEDULA ROUTES =======================
// Move status routes
router.put('/cedula/move-to-requirements-completed', CedulaController.moveCedulaToRequirementsCompleted);
router.put('/cedula/move-to-inprogress', CedulaController.moveCedulaToInProgress);
router.put('/cedula/move-to-approved', CedulaController.moveCedulaToApproved);
router.put('/cedula/set-pickup', CedulaController.moveCedulaToReadyForPickup);

// User Cedula routes
router.post('/cedula', isAuthenticated, CedulaController.submitCedula);
router.get('/cedula', isAuthenticated, CedulaController.getUserCedulas);
router.put('/cedula/:id', isAuthenticated, CedulaController.updateCedula);
router.delete('/cedula/:id', isAuthenticated, CedulaController.deleteCedula);
router.get('/cedulas-tracking', isAuthenticated, CedulaController.getCedulasForTracking);

// Cedula employee dashboard routes
router.get('/cedula-applications', CedulaController.getAllCedulaForEmployee);
router.get('/cedula-applications/:id', CedulaController.getCedulaById);
router.put('/cedula-applications/:id/accept', CedulaController.updateCedulaStatus);

module.exports = router;
