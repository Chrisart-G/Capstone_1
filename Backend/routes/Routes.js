const express = require('express');
const router = express.Router();
const controller = require('../Contoller/loginController');

router.post('/login', controller.Login);

module.exports = router;