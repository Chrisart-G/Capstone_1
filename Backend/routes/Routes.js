const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/sessionAuth');

const loginController = require('../Controller/loginController')
const SignupControler = require('../Controller/signupController')
const BuspermitController = require('../Controller/buspermitController')

router.post('/login', loginController.Login);
router.post('/Signup', SignupControler.Signup);
router.post('/BusinessPermit',isAuthenticated, BuspermitController.SubmitBusinessPermit);
module.exports = router;
