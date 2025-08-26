const express = require('express');
const router = express.Router();

const employeeController = require('../Controller/viewemployeeController');
const addemployeeController = require('../Controller/addemployeeController');

// ======================= EMPLOYEE MANAGEMENT ROUTES =======================
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// Additional add employee route
router.post('/addemployee', addemployeeController.addEmployee);

module.exports = router;
    