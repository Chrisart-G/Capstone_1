// Routes/admindocupriceRoutes.js
const express = require('express');
const router = express.Router();
const adminDocuPriceController = require('../Controller/admindocupriceController');
const auth = require('../middleware/sessionAuth');

// All routes protected for admin/employee only
router.get('/', auth, adminDocuPriceController.getAllDocumentPrices);
router.put('/:application_type', auth, adminDocuPriceController.updateDocumentPrice);
router.get('/public/:application_type', adminDocuPriceController.getPublicPriceByType);

module.exports = router;
