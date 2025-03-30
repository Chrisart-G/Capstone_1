const express = require('express');
const router = express.Router();
const loginController = require('../Controller/loginController')
const SignupControler = require('../Controller/signupController')

router.post('/login', loginController.Login);
router.post('/Signup', SignupControler.Signup);

module.exports = router;
