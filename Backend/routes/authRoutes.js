const express = require('express');
const router = express.Router();

const loginController = require('../Controller/loginController');
const SignupControler = require('../Controller/signupController');
const otpController = require('../Controller/otpController');
const forgotController = require('../Controller/forgotPasswordController');

// AUTH (existing)
router.post('/login', loginController.Login);
router.get('/session', loginController.CheckSession);
router.get('/userinfo', loginController.GetUserInfo);
router.post('/logout', loginController.Logout);

// Signup (existing)
router.post('/signup', SignupControler.Signup);

// OTP (existing for signup)
router.post('/otp/send', otpController.sendOtp);
router.post('/otp/verify', otpController.verifyOtp);

// ===== Forgot Password (NEW) =====
router.post('/forgot/request', forgotController.request);      // supply email or phone
router.post('/forgot/resend',  forgotController.resend);       // with userId
router.post('/forgot/verify',  forgotController.verify);       // with userId + code
router.post('/forgot/reset',   forgotController.reset);        // with userId + newPassword

module.exports = router;
