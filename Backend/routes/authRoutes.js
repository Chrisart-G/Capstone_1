const express = require('express');
const router = express.Router();
const loginController = require('../Controller/loginController')

router.post('/login', loginController.Login);
router.get('/session', loginController.CheckSession);
router.get('/userinfo', loginController.GetUserInfo);
router.post('/logout', loginController.Logout);


module.exports = router;
