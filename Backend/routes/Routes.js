const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
// controller import section
const loginController = require('../Controller/loginController');
const SignupControler = require('../Controller/signupController');
const BuspermitController = require('../Controller/buspermitController');
const addemployeeController = require('../Controller/addemployeeController');
const employeeController = require('../controller/viewemployeeController');
const officeManagementController = require('../Controller/officeManagementController');
const applicationController = require('../Controller/applicationController'); 
const electricalPermitController = require('../Controller/electricalPermitController');
const CedulaController = require('../Controller/cedulaController');
const userprofileController = require('../Controller/userprofileController')
const applicationRequirementsController = require('../Controller/applicationrequirementsController');
//route path 
router.post('/login', loginController.Login);
router.post('/Signup', SignupControler.Signup);
router.post('/BusinessPermit',isAuthenticated, BuspermitController.SubmitBusinessPermit);
///
router.get('/applications', isAuthenticated, BuspermitController.GetAllApplications);
router.get('/applications/:id', isAuthenticated, BuspermitController.GetApplicationById);

// router.put('/applications/status', isAuthenticated, hasRole(['admin', 'approver']), BuspermitController.UpdateApplicationStatus);
///
//for manage employee routes
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.post('/addemployee', addemployeeController.addEmployee);
//route for get path
router.get('/businesspermits', isAuthenticated, BuspermitController.getAllPermits);

// OFFICE MANAGEMENT ROUTES route path for manage office 
router.get('/offices', officeManagementController.getAllOffices);
router.get('/offices/:id', officeManagementController.getOfficeById);
router.post('/offices', officeManagementController.createOffice);
router.put('/offices/:id', officeManagementController.updateOffice);
router.delete('/offices/:id', officeManagementController.deleteOffice);
router.delete('/offices/:officeId/employees/:employeeId', officeManagementController.removeEmployeeFromOffice);

// EMPLOYEE ASSIGNMENT ROUTES
router.post('/offices/:id/assign-employees', officeManagementController.assignEmployeesToOffice);

router.get('/offices/:id/employees', officeManagementController.getOfficeEmployees);

// EMPLOYEE ROUTES
router.get('/employees', officeManagementController.getAllEmployees); // ADD THIS NEW ROUTE


//--------------------------------------------------------------
router.put('/applications/:id/accept', applicationController.acceptApplication);

// this is for creating new electrical permits
router.post('/electrical-permits', electricalPermitController.createElectricalPermit);
router.get('/getelectrical-permits', electricalPermitController.getAllElectricalPermits);
// Get all electrical permits for employee dashboard
router.get('/electrical-applications', electricalPermitController.getAllElectricalPermitsForEmployee);
// Get single electrical permit details
router.get('/electrical-applications/:id', electricalPermitController.getElectricalPermitById);
// Update electrical permit status
router.put('/electrical-applications/:id/accept', electricalPermitController.updateElectricalPermitStatus);

//<---------------------------------------------------------------->
router.post('/cedula', isAuthenticated, CedulaController.submitCedula);
router.get('/cedula', isAuthenticated, CedulaController.getUserCedulas);

router.put('/cedula/:id', isAuthenticated, CedulaController.updateCedula);
router.delete('/cedula/:id', isAuthenticated, CedulaController.deleteCedula);
router.get('/cedulas-tracking', isAuthenticated, CedulaController.getCedulasForTracking);
//----------------- 6/10/25
// Cedula routes for employee dashboard
router.get('/cedula-applications', CedulaController.getAllCedulaForEmployee);
router.get('/cedula-applications/:id', CedulaController.getCedulaById);
router.put('/cedula-applications/:id/accept', CedulaController.updateCedulaStatus);
//--------------------------------
router.get('/user/profile',userprofileController.MunicipalUserProfile );
//-----------
router.post('/upload-requirement', isAuthenticated, applicationRequirementsController.uploadRequirement);

module.exports = router;
    