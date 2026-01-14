const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

const formsfillController = require('../Controller/formsfillController');

// ======================= FORMS AUTO-FILL ROUTES =======================
// Route to get user information for auto-filling forms
router.get('/user-info', isAuthenticated, formsfillController.getUserInfo);

// Route to get user information for auto-filling cedula forms
router.get('/user-info-cedula', isAuthenticated, formsfillController.getUserInfoForCedula);

// Route to get user information for auto-filling electrical forms
router.get('/user-info-electrical', isAuthenticated, formsfillController.getUserInfoForElectrical);
// for fencing 
router.get('/user-info-fencing', isAuthenticated, formsfillController.getUserInfoForFencing);
// for electronics 
router.get('/user-info-electronics', isAuthenticated, formsfillController.getUserInfoForElectronics);
router.get('/user-info-building', isAuthenticated, formsfillController.getUserInfoForBuilding);
router.get('/user-info-plumbing', isAuthenticated, formsfillController.getUserInfoForPlumbing);

/* NEW: business-owner info for Business Permit autofill */
router.get(
  '/user-business-info',
  isAuthenticated,
  formsfillController.getBusinessInfoForBusinessPermit
);
module.exports = router;