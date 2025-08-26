const db = require('../db/dbconnect');
const path = require('path');
const fs = require('fs');

// Document pricing configuration - can be easily modified in the future
const DOCUMENT_PRICES = {
  business: 500.00,
  electrical: 300.00,
  cedula: 100.00,
  mayors: 150.00,
  building: 800.00,
  plumbing: 250.00,
  fencing: 200.00,
  electronics: 350.00,
  renewal_business: 400.00
};

// Payment percentage (20% down payment)
const PAYMENT_PERCENTAGE = 20.00;

// Helper function to get document price
const getDocumentPrice = (applicationType) => {
  return DOCUMENT_PRICES[applicationType] || 0.00;
};

// Helper function to calculate payment amount (20% of total)
const calculatePaymentAmount = (applicationType) => {
  const totalPrice = getDocumentPrice(applicationType);
  return (totalPrice * PAYMENT_PERCENTAGE) / 100;
};

// Save file helper function (similar to your business permit controller)
const saveReceiptFile = (file) => {
  if (!file) return null;
  const uploadPath = path.join(__dirname, '../uploads/receipts');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = `receipt-${uniqueSuffix}${path.extname(file.name)}`;
  const filePath = path.join(uploadPath, filename);
  file.mv(filePath);
  return `/uploads/receipts/${filename}`;
};

// Submit payment receipt
exports.submitPaymentReceipt = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { user_id, application_type, permit_name, payment_method } = req.body;
    
    // Validate required fields
    if (!user_id || !application_type || !permit_name || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: user_id, application_type, permit_name, payment_method'
      });
    }

    // Validate application type
    if (!DOCUMENT_PRICES.hasOwnProperty(application_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application type'
      });
    }

    if (!req.files || !req.files.receipt_image) {
      return res.status(400).json({
        success: false,
        message: 'Receipt image is required'
      });
    }

    // Get user info first
    const userInfoQuery = 'SELECT ui.*, l.email FROM tbl_user_info ui JOIN tb_logins l ON ui.user_id = l.user_id WHERE ui.user_id = ?';
    
    db.query(userInfoQuery, [user_id], async (err, userInfo) => {
      if (err) {
        console.error('Get user info error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      if (userInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User information not found'
        });
      }

      // FIXED: Check existing payments with proper logic
      const existingPaymentQuery = `
        SELECT * FROM tbl_payment_receipts 
        WHERE user_id = ? AND application_type = ?
        ORDER BY created_at DESC LIMIT 1
      `;
      
      db.query(existingPaymentQuery, [user_id, application_type], async (err2, existingPayments) => {
        if (err2) {
          console.error('Check existing payment error:', err2);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err2.message
          });
        }

        // Check if user has existing payments and their status
        if (existingPayments.length > 0) {
          const latestPayment = existingPayments[0];
          
          // Case 1: User has pending payment
          if (latestPayment.payment_status === 'pending') {
            return res.status(400).json({
              success: false,
              message: 'You have a pending payment submission for this application type. Please wait for admin approval before submitting a new payment.',
              data: {
                existing_payment: {
                  receipt_id: latestPayment.receipt_id,
                  status: latestPayment.payment_status,
                  created_at: latestPayment.created_at,
                  permit_name: latestPayment.permit_name
                }
              }
            });
          }
          
          // Case 2: User has approved payment but hasn't used form access yet
          if (latestPayment.payment_status === 'approved' && 
              latestPayment.form_access_granted === 1 && 
              latestPayment.form_access_used === 0) {
            return res.status(400).json({
              success: false,
              message: 'You have an approved payment for this application type. Please complete your application form before submitting a new payment.',
              data: {
                existing_payment: {
                  receipt_id: latestPayment.receipt_id,
                  status: latestPayment.payment_status,
                  form_access_granted: latestPayment.form_access_granted,
                  approved_at: latestPayment.approved_at,
                  permit_name: latestPayment.permit_name
                }
              }
            });
          }
          
          // Case 3: User can submit new payment (previous was rejected or form access was used)
          // This is allowed - user can proceed with new payment
        }

        try {
          // Save receipt image file
          const receiptImagePath = saveReceiptFile(req.files.receipt_image);
          
          if (!receiptImagePath) {
            return res.status(400).json({
              success: false,
              message: 'Failed to save receipt image. Please check file format and size.'
            });
          }

          // Get document price (prepare for future database integration)
          const totalAmount = await getDocumentPrice(application_type);
          const paymentAmount = calculatePaymentAmount(totalAmount);

          // Insert new payment receipt record
          const insertQuery = `INSERT INTO tbl_payment_receipts (
            user_id, application_type, permit_name, receipt_image, 
            payment_method, payment_amount, payment_percentage, total_document_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

          db.query(insertQuery, [
            user_id, 
            application_type, 
            permit_name, 
            receiptImagePath, 
            payment_method, 
            paymentAmount, 
            PAYMENT_PERCENTAGE,
            totalAmount
          ], (err3, result) => {
            if (err3) {
              console.error('Insert payment receipt error:', err3);
              return res.status(500).json({
                success: false,
                message: 'Failed to save payment receipt. Please try again.',
                error: err3.message
              });
            }

            res.status(201).json({
              success: true,
              message: 'Payment receipt submitted successfully! Please wait for admin approval.',
              data: {
                receipt_id: result.insertId,
                user_info: userInfo[0],
                status: 'pending',
                payment_details: {
                  total_document_price: totalAmount,
                  payment_amount: paymentAmount,
                  payment_percentage: PAYMENT_PERCENTAGE,
                  remaining_amount: totalAmount - paymentAmount
                }
              }
            });
          });

        } catch (fileError) {
          console.error('File processing error:', fileError);
          return res.status(500).json({
            success: false,
            message: 'Error processing receipt image',
            error: fileError.message
          });
        }
      });
    });

  } catch (error) {
    console.error('Submit payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error. Please try again.',
      error: error.message
    });
  }
};

// Get payment receipts for admin/employee review
exports.getPaymentReceipts = (req, res) => {
  try {
    const { status, application_type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pr.*,
        ui.full_name,
        ui.address,
        ui.phone_number,
        l.email,
        approver.email as approved_by_email
      FROM tbl_payment_receipts pr
      JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      JOIN tb_logins l ON pr.user_id = l.user_id
      LEFT JOIN tb_logins approver ON pr.approved_by = approver.user_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (status) {
      query += ' AND pr.payment_status = ?';
      queryParams.push(status);
    }

    if (application_type) {
      query += ' AND pr.application_type = ?';
      queryParams.push(application_type);
    }

    query += ' ORDER BY pr.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    db.query(query, queryParams, (err, receipts) => {
      if (err) {
        console.error('Get payment receipts error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM tbl_payment_receipts pr WHERE 1=1';
      const countParams = [];

      if (status) {
        countQuery += ' AND payment_status = ?';
        countParams.push(status);
      }

      if (application_type) {
        countQuery += ' AND application_type = ?';
        countParams.push(application_type);
      }

      db.query(countQuery, countParams, (err2, countResult) => {
        if (err2) {
          console.error('Get count error:', err2);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err2.message
          });
        }

        const total = countResult[0].total;

        res.json({
          success: true,
          data: receipts,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total: total,
            total_pages: Math.ceil(total / limit)
          }
        });
      });
    });

  } catch (error) {
    console.error('Get payment receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's payment receipts
exports.getUserPaymentReceipts = (req, res) => {
  try {
    const { user_id } = req.params;

    const query = `SELECT 
      pr.*,
      ui.full_name,
      ui.address,
      ui.phone_number,
      l.email
    FROM tbl_payment_receipts pr
    JOIN tbl_user_info ui ON pr.user_id = ui.user_id
    JOIN tb_logins l ON pr.user_id = l.user_id
    WHERE pr.user_id = ?
    ORDER BY pr.created_at DESC`;

    db.query(query, [user_id], (err, receipts) => {
      if (err) {
        console.error('Get user payment receipts error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: receipts
      });
    });

  } catch (error) {
    console.error('Get user payment receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Approve/Reject payment receipt
exports.updatePaymentStatus = (req, res) => {
  try {
    const { receipt_id } = req.params;
    const { status, admin_notes, approved_by } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    const updateFields = ['payment_status = ?'];
    const updateValues = [status];

    if (admin_notes) {
      updateFields.push('admin_notes = ?');
      updateValues.push(admin_notes);
    }

    if (status === 'approved') {
      updateFields.push('approved_by = ?', 'approved_at = CURRENT_TIMESTAMP', 'form_access_granted = 1');
      updateValues.push(approved_by);
    }

    updateValues.push(receipt_id);

    const updateQuery = `UPDATE tbl_payment_receipts SET ${updateFields.join(', ')} WHERE receipt_id = ?`;

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error('Update payment status error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment receipt not found'
        });
      }

      // Get updated receipt info
      const getUpdatedQuery = `SELECT 
        pr.*,
        ui.full_name,
        ui.phone_number,
        l.email
      FROM tbl_payment_receipts pr
      JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      JOIN tb_logins l ON pr.user_id = l.user_id
      WHERE pr.receipt_id = ?`;

      db.query(getUpdatedQuery, [receipt_id], (err2, updatedReceipt) => {
        if (err2) {
          console.error('Get updated receipt error:', err2);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err2.message
          });
        }

        res.json({
          success: true,
          message: `Payment receipt ${status} successfully`,
          data: updatedReceipt[0]
        });
      });
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Check form access permission
exports.checkFormAccess = (req, res) => {
  try {
    const { user_id, application_type } = req.params;

    const query = `SELECT * FROM tbl_payment_receipts 
     WHERE user_id = ? AND application_type = ? 
     AND payment_status = 'approved' AND form_access_granted = 1 
     ORDER BY created_at DESC LIMIT 1`;

    db.query(query, [user_id, application_type], (err, result) => {
      if (err) {
        console.error('Check form access error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      if (result.length === 0) {
        return res.json({
          success: false,
          hasAccess: false,
          message: 'No approved payment found for this application type'
        });
      }

      const receipt = result[0];

      res.json({
        success: true,
        hasAccess: !receipt.form_access_used,
        receipt_id: receipt.receipt_id,
        message: receipt.form_access_used 
          ? 'Form access has already been used'
          : 'Form access granted',
        payment_details: {
          total_document_price: receipt.total_document_price,
          payment_amount: receipt.payment_amount,
          remaining_amount: receipt.total_document_price - receipt.payment_amount
        }
      });
    });

  } catch (error) {
    console.error('Check form access error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark form access as used
exports.useFormAccess = (req, res) => {
  try {
    const { user_id, application_type } = req.body;

    const query = `UPDATE tbl_payment_receipts 
     SET form_access_used = 1, form_access_used_at = CURRENT_TIMESTAMP
     WHERE user_id = ? AND application_type = ? 
     AND payment_status = 'approved' AND form_access_granted = 1 
     AND form_access_used = 0
     ORDER BY created_at DESC LIMIT 1`;

    db.query(query, [user_id, application_type], (err, result) => {
      if (err) {
        console.error('Use form access error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid form access found or already used'
        });
      }

      res.json({
        success: true,
        message: 'Form access marked as used'
      });
    });

  } catch (error) {
    console.error('Use form access error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get payment statistics
exports.getPaymentStats = (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        payment_status,
        application_type,
        COUNT(*) as count,
        SUM(payment_amount) as total_amount,
        SUM(total_document_price) as total_document_value
      FROM tbl_payment_receipts 
      GROUP BY payment_status, application_type
      ORDER BY payment_status, application_type
    `;

    db.query(statsQuery, (err, stats) => {
      if (err) {
        console.error('Get payment stats error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message
        });
      }

      const totalStatsQuery = `
        SELECT 
          COUNT(*) as total_receipts,
          SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN payment_status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN payment_status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
          SUM(payment_amount) as total_revenue,
          SUM(total_document_price) as total_potential_revenue
        FROM tbl_payment_receipts
      `;

      db.query(totalStatsQuery, (err2, totalStats) => {
        if (err2) {
          console.error('Get total stats error:', err2);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err2.message
          });
        }

        res.json({
          success: true,
          data: {
            detailed_stats: stats,
            summary: totalStats[0],
            document_prices: DOCUMENT_PRICES,
            payment_percentage: PAYMENT_PERCENTAGE
          }
        });
      });
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get document pricing information
exports.getDocumentPrices = (req, res) => {
  try {
    const { application_type } = req.query;
    
    if (application_type) {
      const price = getDocumentPrice(application_type);
      const paymentAmount = calculatePaymentAmount(application_type);
      
      return res.json({
        success: true,
        data: {
          application_type: application_type,
          total_price: price,
          payment_amount: paymentAmount,
          payment_percentage: PAYMENT_PERCENTAGE,
          remaining_amount: price - paymentAmount
        }
      });
    }
    
    // Return all prices
    const allPrices = Object.keys(DOCUMENT_PRICES).map(type => ({
      application_type: type,
      total_price: DOCUMENT_PRICES[type],
      payment_amount: calculatePaymentAmount(type),
      payment_percentage: PAYMENT_PERCENTAGE,
      remaining_amount: DOCUMENT_PRICES[type] - calculatePaymentAmount(type)
    }));
    
    res.json({
      success: true,
      data: allPrices
    });
    
  } catch (error) {
    console.error('Get document prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
//--------------this line for tracking in user---------------
exports.getPaymentReceiptsForTracking = async (req, res) => {
  try {
    // Use session-based authentication like the cedula controller
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in.",
        data: []
      });
    }

    const userId = req.session.user.user_id;
    console.log('Getting payment receipts for user:', userId);

    const query = `SELECT 
      pr.receipt_id,
      pr.user_id,
      pr.application_type,
      pr.permit_name,
      pr.receipt_image,
      pr.payment_method,
      pr.payment_amount,
      pr.payment_percentage,
      pr.total_document_price,
      pr.payment_status,
      pr.admin_notes,
      pr.approved_by,
      pr.approved_at,
      pr.form_access_granted,
      pr.form_access_used,
      pr.form_access_used_at,
      pr.created_at,
      pr.updated_at,
      ui.full_name,
      ui.address,
      ui.phone_number,
      l.email,
      approver.email as approved_by_email,
      DATE_FORMAT(pr.created_at, '%Y-%m-%d %H:%i:%s') as formatted_created_at,
      DATE_FORMAT(pr.approved_at, '%Y-%m-%d %H:%i:%s') as formatted_approved_at,
      (pr.total_document_price - pr.payment_amount) as remaining_amount
    FROM tbl_payment_receipts pr
    LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
    LEFT JOIN tb_logins l ON pr.user_id = l.user_id
    LEFT JOIN tb_logins approver ON pr.approved_by = approver.user_id
    WHERE pr.user_id = ?
    ORDER BY pr.created_at DESC`;

    db.query(query, [userId], (err, receipts) => {
      if (err) {
        console.error('Get payment receipts for tracking error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve payment receipts',
          error: err.message,
          data: []
        });
      }

      console.log('Found payment receipts:', receipts ? receipts.length : 0);
      console.log('Payment receipts data:', receipts);

      // Return consistent response structure like cedula controller
      res.status(200).json({
        success: true,
        data: receipts || [],
        count: receipts ? receipts.length : 0
      });
    });

  } catch (error) {
    console.error('Get payment receipts for tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error',
      error: error.message,
      data: []
    });
  }
};
// Add this function to your paymentController.js

exports.useFormAccess = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in."
      });
    }

    const userId = req.session.user.user_id;
    const receiptId = req.params.receiptId;

    console.log(`User ${userId} attempting to use form access for receipt ${receiptId}`);

    // First, verify the receipt belongs to the user and check current status
    const checkQuery = `
      SELECT 
        receipt_id,
        user_id,
        application_type,
        payment_status,
        form_access_granted,
        form_access_used,
        form_access_used_at
      FROM tbl_payment_receipts 
      WHERE receipt_id = ? AND user_id = ?
    `;

    db.query(checkQuery, [receiptId, userId], (err, results) => {
      if (err) {
        console.error('Database error checking receipt:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found or does not belong to you'
        });
      }

      const receipt = results[0];

      // Check if payment is approved
      if (receipt.payment_status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Payment must be approved before accessing the form'
        });
      }

      // Check if form access is granted
      if (!receipt.form_access_granted) {
        return res.status(403).json({
          success: false,
          message: 'Form access has not been granted yet'
        });
      }

      // Check if form access has already been used
      if (receipt.form_access_used) {
        return res.status(403).json({
          success: false,
          message: 'Form access has already been used',
          usedAt: receipt.form_access_used_at
        });
      }

      // Update the record to mark form access as used
      const updateQuery = `
        UPDATE tbl_payment_receipts 
        SET 
          form_access_used = 1,
          form_access_used_at = NOW(),
          updated_at = NOW()
        WHERE receipt_id = ? AND user_id = ?
      `;

      db.query(updateQuery, [receiptId, userId], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Database error updating form access:', updateErr);
          return res.status(500).json({
            success: false,
            message: 'Failed to update form access status'
          });
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Receipt not found or update failed'
          });
        }

        console.log(`Form access successfully marked as used for receipt ${receiptId}`);

        // Return success response
        res.status(200).json({
          success: true,
          message: 'Form access granted successfully',
          data: {
            receiptId: receiptId,
            applicationType: receipt.application_type,
            usedAt: new Date().toISOString()
          }
        });
      });
    });

  } catch (error) {
    console.error('Error in useFormAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error',
      error: error.message
    });
  }
};

// Also add this function to get form access status (optional, for additional checks)
exports.getFormAccessStatus = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in."
      });
    }

    const userId = req.session.user.user_id;
    const receiptId = req.params.receiptId;

    const query = `
      SELECT 
        receipt_id,
        application_type,
        payment_status,
        form_access_granted,
        form_access_used,
        form_access_used_at
      FROM tbl_payment_receipts 
      WHERE receipt_id = ? AND user_id = ?
    `;

    db.query(query, [receiptId, userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
      }

      res.status(200).json({
        success: true,
        data: results[0]
      });
    });

  } catch (error) {
    console.error('Error in getFormAccessStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error'
    });
  }
};
//aadaidowkdoadoawjdaw
//this test