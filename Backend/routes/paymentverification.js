const express = require('express');
const router = express.Router();
const employeePaymentController = require('../Controller/employeepaymentverification');

// ======================= PAYMENT VERIFICATION ROUTES =======================

// Get all payment receipts with optional filtering and pagination
router.get('/payment-receipts', employeePaymentController.getAllPaymentReceipts);

// Get payment receipt by ID
router.get('/payment-receipts/:id', employeePaymentController.getPaymentReceiptById);

// Approve payment receipt
router.put('/payment-receipts/:id/approve', employeePaymentController.approvePaymentReceipt);

// Reject payment receipt
router.put('/payment-receipts/:id/reject', employeePaymentController.rejectPaymentReceipt);

// Get payment statistics
router.get('/payment-statistics', employeePaymentController.getPaymentStatistics);

module.exports = router;