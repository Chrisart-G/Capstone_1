// routes/officeRoutes.js
const express = require('express');
const router = express.Router();
const officeController = require('../Controller/officeController');

// Offices
router.get('/offices', officeController.getOffices);
router.post('/offices', officeController.createOffice);
router.put('/offices/:id', officeController.updateOffice);
router.delete('/offices/:id', officeController.deleteOffice);

// Employees in office
router.get('/offices/:id/employees', officeController.getOfficeEmployees);
router.post(
  '/offices/:id/assign-employees',
  officeController.assignEmployeesToOffice
);
router.delete(
  '/offices/:id/employees/:employeeId',
  officeController.removeEmployeeFromOffice
);

// NEW: positions per office
router.get('/offices/:id/positions', officeController.getOfficePositions);
router.post('/offices/:id/positions', officeController.createOfficePosition);
router.put(
  '/offices/:id/positions/:positionId',
  officeController.updateOfficePosition
);
router.delete(
  '/offices/:id/positions/:positionId',
  officeController.deleteOfficePosition
);

module.exports = router;
