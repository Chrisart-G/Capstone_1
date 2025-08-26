const express = require('express');
const router = express.Router();

const officeManagementController = require('../Controller/officeManagementController');

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

module.exports = router;
