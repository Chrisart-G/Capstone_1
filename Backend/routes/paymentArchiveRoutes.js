const express = require('express');
const router = express.Router();
const paymentArchiveController = require('../Controllery/paymentArchiveController');

// Get payment archive statistics
router.get('/payment-archive-stats', paymentArchiveController.getPaymentArchiveStats);

// Get archived payments list (approved payments from tbl_payment_receipts)
router.get('/payment-archive-list', paymentArchiveController.getArchivedPayments);

// Get available offices for filtering
router.get('/payment-archive-offices', paymentArchiveController.getPaymentArchiveOffices);

// Get single payment receipt details
router.get('/payment-receipt/:receipt_id', paymentArchiveController.getPaymentReceipt);

// Archive a payment (mark as archived)
router.post('/archive-payment', paymentArchiveController.archivePayment);

// Restore an archived payment
router.post('/restore-payment/:receipt_id', paymentArchiveController.restorePayment);

module.exports = router;