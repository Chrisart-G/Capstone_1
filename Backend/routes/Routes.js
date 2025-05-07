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

//route path for manage office 
// OFFICE MANAGEMENT ROUTES
router.get('/offices', officeManagementController.getAllOffices);
router.get('/offices/:id', officeManagementController.getOfficeById);
router.post('/offices', officeManagementController.createOffice);
router.put('/offices/:id', officeManagementController.updateOffice);
router.delete('/offices/:id', officeManagementController.deleteOffice);

router.post('/offices/assign', officeManagementController.assignEmployeesToOffice);
router.put('/offices/unassign/:assignment_id', officeManagementController.removeEmployeeFromOffice);
router.get('/offices/available-employees', officeManagementController.getUnassignedEmployees);
router.get('/offices/:id/employees', officeManagementController.getOfficeEmployees);
module.exports = router;
    