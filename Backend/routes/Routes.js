const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');
// controller import section
const loginController = require('../Controller/loginController');
const SignupControler = require('../Controller/signupController');
const BuspermitController = require('../Controller/buspermitController');
const addemployeeController = require('../Controller/addemployeeController');

//route path 
router.post('/login', loginController.Login);
router.post('/Signup', SignupControler.Signup);
router.post('/BusinessPermit',isAuthenticated, BuspermitController.SubmitBusinessPermit);
router.post('/addemployee', addemployeeController.addEmployee);
//route for get path
router.get('/businesspermits', isAuthenticated, BuspermitController.getAllPermits);
module.exports = router;
    