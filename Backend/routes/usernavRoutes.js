// routes/usernavRoutes.js
const express = require('express');
const router = express.Router();
const usernav = require('../Controller/usernavController');

// badge counts
router.get('/user/nav/badges', usernav.getUserNavBadges);

// mark-as-seen endpoints
router.post('/user/nav/mark/request-doc-viewed', usernav.markRequestDocViewed);
router.post('/user/nav/mark/track-status-viewed', usernav.markTrackStatusViewed);

module.exports = router;
