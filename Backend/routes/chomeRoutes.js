// routes/chomeRoutes.js
const express = require('express');
const router = express.Router();
const chomeController = require('../Controller/chomeController');

// Home-page announcement (public or session-based, your choice)
router.get('/home-announcement', chomeController.getHomeAnnouncement);

module.exports = router;
