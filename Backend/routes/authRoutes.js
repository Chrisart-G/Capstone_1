const express = require('express');
const router = express.Router();

const loginController = require('../Controller/loginController');
const SignupControler = require('../Controller/signupController');

// ======================= AUTHENTICATION ROUTES =======================
router.post('/login', loginController.Login);
router.get('/session', loginController.CheckSession);
router.get('/userinfo', loginController.GetUserInfo);
router.post('/logout', loginController.Logout);

// Signup route
router.post('/Signup', SignupControler.Signup);

module.exports = router;
