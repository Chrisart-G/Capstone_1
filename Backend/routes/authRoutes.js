const express = require('express');
const router = express.Router();

const loginController = require('../Controller/loginController');
const SignupControler = require('../Controller/signupController');
const otpController = require('../Controller/otpController');

// AUTH
router.post('/login', loginController.Login);
router.get('/session', loginController.CheckSession);
router.get('/userinfo', loginController.GetUserInfo);
router.post('/logout', loginController.Logout);

// Signup (keep both casings harmlessly)
router.post('/signup', SignupControler.Signup);

// OTP
router.post('/otp/send', otpController.sendOtp);
router.post('/otp/verify', otpController.verifyOtp); 

module.exports = router;
