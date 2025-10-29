const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

// Controller imports
const loginController = require('../Controller/loginController');
const SignupControler = require('../Controller/signupController');
const BuspermitController = require('../Controller/buspermitController');
const addemployeeController = require('../Controller/addemployeeController');

const officeManagementController = require('../Controller/officeManagementController');
const applicationController = require('../Controller/applicationController'); 
const electricalPermitController = require('../Controller/electricalPermitController');
const CedulaController = require('../Controller/cedulaController');
const userprofileController = require('../Controller/userprofileController');
const applicationRequirementsController = require('../Controller/applicationrequirementsController');

// ======================= AUTHENTICATION ROUTES =======================
router.post('/login', loginController.Login);
router.post('/Signup', SignupControler.Signup);

// ======================= BUSINESS PERMIT ROUTES =======================
router.post('/BusinessPermit', isAuthenticated, BuspermitController.SubmitBusinessPermit);
router.get('/businesspermits', isAuthenticated, BuspermitController.getAllPermits);

router.get('/applications', isAuthenticated, BuspermitController.GetAllApplications);
router.get('/applications/:id', isAuthenticated, BuspermitController.GetApplicationById);
router.put('/applications/:id/accept', applicationController.acceptApplication);

router.put('/applications/move-to-inprogress', BuspermitController.moveBusinessToInProgress);
router.put('/applications/move-to-requirements-completed', BuspermitController.moveBusinessToRequirementsCompleted);
router.put('/applications/move-to-approved', BuspermitController.moveBusinessToApproved);
router.put('/applications/set-pickup', BuspermitController.moveBusinessToReadyForPickup);

// ======================= EMPLOYEE MANAGEMENT ROUTES =======================
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

router.post('/addemployee', addemployeeController.addEmployee);

// ======================= OFFICE MANAGEMENT ROUTES =======================
router.get('/offices', officeManagementController.getAllOffices);
router.get('/offices/:id', officeManagementController.getOfficeById);
router.post('/offices', officeManagementController.createOffice);
router.put('/offices/:id', officeManagementController.updateOffice);
router.delete('/offices/:id', officeManagementController.deleteOffice);

router.delete('/offices/:officeId/employees/:employeeId', officeManagementController.removeEmployeeFromOffice);
router.post('/offices/:id/assign-employees', officeManagementController.assignEmployeesToOffice);
router.get('/offices/:id/employees', officeManagementController.getOfficeEmployees);

// (Extra employee route from office controller)
router.get('/employees', officeManagementController.getAllEmployees);

// ======================= ELECTRICAL PERMIT ROUTES =======================
router.post('/electrical-permits', electricalPermitController.createElectricalPermit);
router.get('/getelectrical-permits', electricalPermitController.getAllElectricalPermits);
router.get('/electrical-applications', electricalPermitController.getAllElectricalPermitsForEmployee);
router.get('/electrical-applications/:id', electricalPermitController.getElectricalPermitById);
router.put('/electrical-applications/:id/accept', electricalPermitController.updateElectricalPermitStatus);

router.put('/electrical-applications/move-to-inprogress', electricalPermitController.moveElectricalToInProgress);
router.put('/electrical-applications/move-to-requirements-completed', electricalPermitController.moveElectricalToRequirementsCompleted);
router.put('/electrical-applications/move-to-approved', electricalPermitController.moveElectricalToApproved);
router.put('/electrical-applications/set-pickup', electricalPermitController.moveElectricalToReadyForPickup);

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

// ======================= APPLICATION REQUIREMENTS ROUTES =======================
router.post('/upload-requirement', isAuthenticated, applicationRequirementsController.uploadRequirement);

// ======================= USER PROFILE ROUTES =======================
router.get('/user/profile', userprofileController.MunicipalUserProfile);

module.exports = router;
