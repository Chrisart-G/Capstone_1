// Controller/businessAssessmentController.js
const db = require('../db/dbconnect');
const path = require('path');
const fs = require('fs');
// Helper to get user ID from session
function getUserIdFromSession(req) {
  if (!req.session?.user?.user_id) return null;
  return req.session.user.user_id;
}
function absUrl(req, relPath) {
  return relPath ? `${req.protocol}://${req.get("host")}${relPath}` : null;
}exports.uploadReceiptImage = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Check if file exists
    if (!req.files || !req.files.receipt_image) {
      return res.status(400).json({ 
        success: false, 
        message: "No receipt image provided. Please select a file to upload." 
      });
    }

    const file = req.files.receipt_image;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file type. Only JPG, PNG, and GIF images are allowed." 
      });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: "File size too large. Maximum size is 5MB." 
      });
    }

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `receipt-${timestamp}-${random}.${fileExtension}`;
    
    // Define upload directory
    const uploadDir = path.join(__dirname, '..', 'uploads', 'receipts');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const relativePath = `/uploads/receipts/${fileName}`;

    // Save file
    await file.mv(filePath);

    res.json({
      success: true,
      message: "Receipt uploaded successfully",
      file_path: relativePath,
      file_name: fileName,
      file_url: absUrl(req, relativePath)
    });

  } catch (error) {
    console.error("Unexpected error in uploadReceiptImage:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload receipt image. Please try again." 
    });
  }
};
// Get assessment for a specific business permit
exports.getBusinessAssessment = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const businessId = parseInt(req.params.businessId);
    if (!businessId) {
      return res.status(400).json({ success: false, message: "Business permit ID is required" });
    }

    // First verify this business permit belongs to the user
    const verifySql = `
      SELECT BusinessP_id FROM business_permits 
      WHERE BusinessP_id = ? AND user_id = ?
    `;

    db.query(verifySql, [businessId, userId], (verifyErr, verifyResults) => {
      if (verifyErr) {
        console.error("Business permit verification error:", verifyErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (verifyResults.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: "You are not authorized to access this business permit" 
        });
      }

      // Now get the assessment
      const assessmentSql = `
        SELECT 
          id,
          BusinessP_id,
          items_json,
          total_fees_lgu,
          fsif_15,
          created_at,
          updated_at
        FROM business_permit_assessment
        WHERE BusinessP_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `;

      db.query(assessmentSql, [businessId], (err, results) => {
        if (err) {
          console.error("Get assessment error:", err);
          return res.status(500).json({ success: false, message: "Failed to get assessment" });
        }

        if (results.length === 0) {
          return res.json({ 
            success: true, 
            hasAssessment: false,
            message: "No assessment found for this business permit" 
          });
        }

        const assessment = results[0];
        
        // Parse JSON items
        let items = [];
        try {
          items = JSON.parse(assessment.items_json);
        } catch (parseErr) {
          console.error("Error parsing items_json:", parseErr);
          items = {};
        }

        // Calculate grand total
        const totalFeesLGU = parseFloat(assessment.total_fees_lgu) || 0;
        const fsif15 = parseFloat(assessment.fsif_15) || 0;
        const grandTotal = totalFeesLGU + fsif15;

        res.json({
          success: true,
          hasAssessment: true,
          assessment: {
            id: assessment.id,
            BusinessP_id: assessment.BusinessP_id,
            items: items,
            fees: {
              total_fees_lgu: totalFeesLGU,
              fsif_15: fsif15,
              grand_total: grandTotal
            },
            created_at: assessment.created_at,
            updated_at: assessment.updated_at
          }
        });
      });
    });

  } catch (error) {
    console.error("Unexpected error in getBusinessAssessment:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};

// Get assessment for document tracker (by application type and ID)
exports.getAssessmentForTracker = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { application_type, application_id } = req.query;
    
    if (application_type !== 'business' || !application_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid application type or ID" 
      });
    }

    const businessId = parseInt(application_id);
    
    // Verify ownership and get assessment
    const sql = `
      SELECT 
        a.id,
        a.BusinessP_id,
        a.items_json,
        a.total_fees_lgu,
        a.fsif_15,
        a.created_at,
        b.business_name,
        b.application_type,
        b.status
      FROM business_permit_assessment a
      INNER JOIN business_permits b ON a.BusinessP_id = b.BusinessP_id
      WHERE a.BusinessP_id = ? 
        AND b.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 1
    `;

    db.query(sql, [businessId, userId], (err, results) => {
      if (err) {
        console.error("Get assessment for tracker error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        return res.json({ 
          success: true, 
          hasAssessment: false,
          message: "No assessment found" 
        });
      }

      const assessment = results[0];
      
      // Parse JSON items
      let items = [];
      try {
        items = JSON.parse(assessment.items_json);
      } catch (parseErr) {
        console.error("Error parsing items_json:", parseErr);
        items = {};
      }

      // Calculate totals
      const totalFeesLGU = parseFloat(assessment.total_fees_lgu) || 0;
      const fsif15 = parseFloat(assessment.fsif_15) || 0;
      const grandTotal = totalFeesLGU + fsif15;

      res.json({
        success: true,
        hasAssessment: true,
        assessment: {
          id: assessment.id,
          BusinessP_id: assessment.BusinessP_id,
          business_name: assessment.business_name,
          application_type: assessment.application_type,
          status: assessment.status,
          items: items,
          fees: {
            total_fees_lgu: totalFeesLGU,
            fsif_15: fsif15,
            grand_total: grandTotal
          },
          created_at: assessment.created_at
        }
      });
    });

  } catch (error) {
    console.error("Unexpected error in getAssessmentForTracker:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};
// Add this function to the existing controller
// Replace the entire createPaymentFromAssessment function with this:
exports.createPaymentFromAssessment = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { business_id, payment_method, receipt_image } = req.body;
    
    if (!business_id || !payment_method || !receipt_image) {
      return res.status(400).json({ 
        success: false, 
        message: "Business ID, payment method, and receipt image are required" 
      });
    }

    // Get the assessment AND current business permit status
    const assessmentSql = `
      SELECT 
        a.total_fees_lgu,
        a.fsif_15,
        b.business_name,
        b.application_type,
        b.status as business_status
      FROM business_permit_assessment a
      INNER JOIN business_permits b ON a.BusinessP_id = b.BusinessP_id
      WHERE a.BusinessP_id = ? AND b.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 1
    `;

    db.query(assessmentSql, [business_id, userId], (assessmentErr, assessmentResults) => {
      if (assessmentErr) {
        console.error("Assessment lookup error:", assessmentErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (assessmentResults.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No assessment found for this business permit" 
        });
      }

      const assessment = assessmentResults[0];
      const currentBusinessStatus = assessment.business_status;
      const totalFeesLGU = parseFloat(assessment.total_fees_lgu) || 0;
      const fsif15 = parseFloat(assessment.fsif_15) || 0;
      const grandTotal = totalFeesLGU + fsif15;

      // IMPORTANT: Check if payment already exists BEFORE creating new one
      const checkSql = `
        SELECT receipt_id, payment_status 
        FROM tbl_payment_receipts 
        WHERE user_id = ? 
          AND related_application_id = ?
          AND (payment_status = 'pending' OR payment_status = 'approved')
        LIMIT 1
      `;

      db.query(checkSql, [userId, business_id], (checkErr, checkResults) => {
        if (checkErr) {
          console.error("Payment check error:", checkErr);
          return res.status(500).json({ success: false, message: "Database error" });
        }

        if (checkResults.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Payment already ${checkResults[0].payment_status} for this assessment. You cannot submit multiple payments.`
          });
        }

        // Determine the correct application type
        let applicationType = 'business';
        if (assessment.application_type === 'new') {
          applicationType = 'business';
        } else if (assessment.application_type === 'renewal') {
          applicationType = 'renewal_business';
        }

        // Create payment record in tbl_payment_receipts
        const paymentSql = `
          INSERT INTO tbl_payment_receipts (
            user_id,
            application_type,
            permit_name,
            receipt_image,
            payment_method,
            payment_amount,
            payment_percentage,
            total_document_price,
            payment_status,
            related_application_id,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
        `;

        const permitName = assessment.business_name 
          ? `Business Permit - ${assessment.business_name}`
          : 'Business Permit';

        db.query(paymentSql, [
          userId,
          applicationType,
          permitName,
          receipt_image,
          payment_method,
          grandTotal,
          100.00, // Full payment
          grandTotal,
          business_id
        ], (paymentErr, paymentResult) => {
          if (paymentErr) {
            console.error("Payment creation error:", paymentErr);
            return res.status(500).json({ success: false, message: "Failed to create payment record" });
          }

          // IMPORTANT: DO NOT update business permit status!
          // The business permit keeps its current status (approved, pending, etc.)
          // Only the payment receipt gets 'pending' status
          
          // Log the current business status for debugging
          console.log(`Payment created for business permit ${business_id}. Business status remains: ${currentBusinessStatus}`);

          res.json({
            success: true,
            message: "Payment submitted successfully",
            payment_id: paymentResult.insertId,
            receipt_id: paymentResult.insertId,
            amount: grandTotal,
            business_status: currentBusinessStatus, // Return current status
            payment_status: 'pending', // Payment receipt status
            assessment: {
              total_fees_lgu: totalFeesLGU,
              fsif_15: fsif15,
              grand_total: grandTotal
            }
          });
        });
      });
    });

  } catch (error) {
    console.error("Unexpected error in createPaymentFromAssessment:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};
// Add this function to handle file upload for receipts
exports.uploadReceiptImage = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const file = req.files?.receipt_image;
    if (!file) {
      return res.status(400).json({ success: false, message: "No receipt image provided" });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file type. Only JPG, PNG, and GIF are allowed." 
      });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: "File size too large. Maximum size is 5MB." 
      });
    }

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    const fileExtension = file.name.split('.').pop();
    const fileName = `receipt-${timestamp}-${random}.${fileExtension}`;
    
    // Define upload path
    const uploadDir = path.join(__dirname, '..', 'uploads', 'receipts');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const relativePath = `/uploads/receipts/${fileName}`;

    // Save file
    file.mv(filePath, (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ success: false, message: "Failed to save receipt image" });
      }

      res.json({
        success: true,
        message: "Receipt uploaded successfully",
        file_path: relativePath,
        file_name: fileName
      });
    });

  } catch (error) {
    console.error("Unexpected error in uploadReceiptImage:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};// Add this function to check if payment already exists for an assessment
exports.checkAssessmentPaymentStatus = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { business_id } = req.query;
    
    if (!business_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Business ID is required" 
      });
    }

    // Check if payment exists for this business permit
    const paymentSql = `
      SELECT 
        receipt_id,
        payment_status,
        payment_amount,
        payment_percentage,
        total_document_price,
        approved_at,
        admin_notes,
        form_access_granted,
        form_access_used
      FROM tbl_payment_receipts
      WHERE user_id = ? 
        AND application_type = 'business'
        AND related_application_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    db.query(paymentSql, [userId, business_id], (err, results) => {
      if (err) {
        console.error("Check assessment payment error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        return res.json({ 
          success: true, 
          hasPayment: false,
          message: "No payment found for this assessment" 
        });
      }

      const payment = results[0];
      const totalPaid = parseFloat(payment.payment_amount) || 0;
      const totalPrice = parseFloat(payment.total_document_price) || 1;
      const paymentPercentage = parseFloat(payment.payment_percentage) || 0;
      const remainingAmount = totalPrice - totalPaid;

      res.json({
        success: true,
        hasPayment: true,
        payment: {
          ...payment,
          remaining_amount: remainingAmount > 0 ? remainingAmount : 0,
          payment_percentage: paymentPercentage,
          is_fully_paid: paymentPercentage >= 100,
          status_display: payment.payment_status === 'approved' ? 'Approved' :
                        payment.payment_status === 'rejected' ? 'Rejected' : 'Pending Review'
        }
      });
    });

  } catch (error) {
    console.error("Unexpected error in checkAssessmentPaymentStatus:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};
exports.checkExistingPayment = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { business_id } = req.body;
    
    if (!business_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Business ID is required" 
      });
    }

    // Check business permit status first
    const businessSql = `
      SELECT status 
      FROM business_permits 
      WHERE BusinessP_id = ? AND user_id = ?
    `;

    db.query(businessSql, [business_id, userId], (businessErr, businessResults) => {
      if (businessErr) {
        console.error("Business permit check error:", businessErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (businessResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Business permit not found"
        });
      }

      const businessStatus = businessResults[0].status;
      
      // Check if business permit is in a state that already has payment
      const paymentSubmittedStatuses = ['payment-submitted', 'completed', 'approved'];
      
      if (paymentSubmittedStatuses.includes(businessStatus)) {
        // Check if there's an APPROVED payment in tbl_payment_receipts
        const approvedPaymentSql = `
          SELECT receipt_id, payment_status 
          FROM tbl_payment_receipts 
          WHERE user_id = ? 
            AND related_application_id = ?
            AND payment_status = 'approved'
          LIMIT 1
        `;

        db.query(approvedPaymentSql, [userId, business_id], (approvedErr, approvedResults) => {
          if (approvedErr) {
            console.error("Approved payment check error:", approvedErr);
            return res.status(500).json({ success: false, message: "Database error" });
          }

          if (approvedResults.length > 0) {
            return res.json({
              success: true,
              hasPayment: true,
              source: 'payment_receipts',
              paymentStatus: 'approved',
              receiptId: approvedResults[0].receipt_id,
              message: `Payment has been approved for this business permit`
            });
          }

          // Business permit has payment status but no approved payment record
          return res.json({
            success: true,
            hasPayment: true,
            source: 'business_permit',
            status: businessStatus,
            message: `Business permit is already ${businessStatus}`
          });
        });
      } else {
        // Business permit doesn't have payment-submitted status, so check for pending payments
        const pendingPaymentSql = `
          SELECT receipt_id, payment_status 
          FROM tbl_payment_receipts 
          WHERE user_id = ? 
            AND related_application_id = ?
            AND payment_status = 'pending'
          LIMIT 1
        `;

        db.query(pendingPaymentSql, [userId, business_id], (pendingErr, pendingResults) => {
          if (pendingErr) {
            console.error("Pending payment check error:", pendingErr);
            return res.status(500).json({ success: false, message: "Database error" });
          }

          if (pendingResults.length > 0) {
            return res.json({
              success: true,
              hasPayment: true,
              source: 'payment_receipts',
              paymentStatus: 'pending',
              receiptId: pendingResults[0].receipt_id,
              message: `A payment is pending review for this business permit`
            });
          }

          // No payment records found
          res.json({
            success: true,
            hasPayment: false,
            message: "No existing payment found"
          });
        });
      }
    });

  } catch (error) {
    console.error("Unexpected error in checkExistingPayment:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};
exports.canMakePayment = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { business_id } = req.query;
    
    if (!business_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Business ID is required" 
      });
    }

    // Check if there's already a PENDING payment for this business permit
    const paymentSql = `
      SELECT payment_status 
      FROM tbl_payment_receipts 
      WHERE user_id = ? 
        AND related_application_id = ?
        AND payment_status = 'pending'
      LIMIT 1
    `;

    db.query(paymentSql, [userId, business_id], (paymentErr, paymentResults) => {
      if (paymentErr) {
        console.error("Payment check error:", paymentErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (paymentResults.length > 0) {
        return res.json({
          success: true,
          canMakePayment: false,
          reason: "A payment is already pending review",
          paymentStatus: 'pending'
        });
      }

      // Check if there's already an APPROVED payment
      const approvedSql = `
        SELECT payment_status 
        FROM tbl_payment_receipts 
        WHERE user_id = ? 
          AND related_application_id = ?
          AND payment_status = 'approved'
        LIMIT 1
      `;

      db.query(approvedSql, [userId, business_id], (approvedErr, approvedResults) => {
        if (approvedErr) {
          console.error("Approved payment check error:", approvedErr);
          return res.status(500).json({ success: false, message: "Database error" });
        }

        if (approvedResults.length > 0) {
          return res.json({
            success: true,
            canMakePayment: false,
            reason: "Payment has already been approved",
            paymentStatus: 'approved'
          });
        }

        // User can make payment - no existing pending or approved payments
        res.json({
          success: true,
          canMakePayment: true
        });
      });
    });

  } catch (error) {
    console.error("Unexpected error in canMakePayment:", error);
    res.status(500).json({ success: false, message: "Unexpected server error" });
  }
};