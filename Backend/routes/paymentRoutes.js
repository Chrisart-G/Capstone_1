const express = require('express');
const router = express.Router();
const paymentController = require('../Controller/paymentController');
const auth = require('../middleware/sessionAuth'); 

// Public routes (for citizens)
router.post('/submit', auth, paymentController.submitPaymentReceipt);
router.get('/user/:user_id', auth, paymentController.getUserPaymentReceipts);
router.get('/check-access/:user_id/:application_type', auth, paymentController.checkFormAccess);
router.post('/use-access', auth, paymentController.useFormAccess);

//this routes for tracking in user end 
router.get('/tracking', auth, paymentController.getPaymentReceiptsForTracking);
router.post('/use-form-access/:receiptId', auth, paymentController.useFormAccess);
router.get('/form-access-status/:receiptId', auth, paymentController.getFormAccessStatus);

// Admin/Employee routes
router.get('/', auth, paymentController.getPaymentReceipts);
router.put('/status/:receipt_id', auth, paymentController.updatePaymentStatus);
router.get('/stats', auth, paymentController.getPaymentStats);

module.exports = router;