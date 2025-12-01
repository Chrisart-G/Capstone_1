const db = require('../db/dbconnect');
const path = require('path');
const fs = require('fs');


const getDocumentPricing = (applicationType, callback) => {
  const sql = `
    SELECT 
      application_type,
      permit_name,
      current_price,
      payment_percentage
    FROM tbl_document_prices
    WHERE application_type = ? AND is_active = 1
    LIMIT 1
  `;

  db.query(sql, [applicationType], (err, rows) => {
    if (err) return callback(err);

    if (!rows || rows.length === 0) {
      const e = new Error(
        'Pricing not found for application_type: ' + applicationType
      );
      e.code = 'PRICE_NOT_FOUND';
      return callback(e);
    }

    const row = rows[0];
    const totalPrice = parseFloat(row.current_price);
    const percentage = parseFloat(row.payment_percentage || 100);
    const paymentAmount = (totalPrice * percentage) / 100;

    callback(null, {
      application_type: row.application_type,
      permit_name: row.permit_name,
      total_price: totalPrice,
      payment_percentage: percentage,
      payment_amount: paymentAmount,
    });
  });
};

/* -------------------------------------------------------------------------- */
/*  FILE HELPER                                                                */
/* -------------------------------------------------------------------------- */

const saveReceiptFile = (file) => {
  if (!file) return null;
  const uploadPath = path.join(__dirname, '../uploads/receipts');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const filename = `receipt-${uniqueSuffix}${path.extname(file.name)}`;
  const filePath = path.join(uploadPath, filename);
  file.mv(filePath);
  return `/uploads/receipts/${filename}`;
};

/* -------------------------------------------------------------------------- */
/*  SUBMIT PAYMENT RECEIPT (NOW USING DB PRICES)                               */
/* -------------------------------------------------------------------------- */

exports.submitPaymentReceipt = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const { user_id, application_type, permit_name, payment_method } = req.body;

    // Validate required fields
    if (!user_id || !application_type || !permit_name || !payment_method) {
      return res.status(400).json({
        success: false,
        message:
          'All fields are required: user_id, application_type, permit_name, payment_method',
      });
    }

    if (!req.files || !req.files.receipt_image) {
      return res.status(400).json({
        success: false,
        message: 'Receipt image is required',
      });
    }

    // Get user info
    const userInfoQuery = `
      SELECT 
        ui.*, 
        l.email,
        CONCAT(ui.firstname, ' ', COALESCE(ui.middlename, ''), ' ', ui.lastname) as full_name
      FROM tbl_user_info ui 
      JOIN tb_logins l ON ui.user_id = l.user_id 
      WHERE ui.user_id = ?
    `;

    db.query(userInfoQuery, [user_id], async (err, userInfo) => {
      if (err) {
        console.error('Get user info error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message,
        });
      }

      if (userInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User information not found',
        });
      }

      // Check existing payments
      const existingPaymentQuery = `
        SELECT * FROM tbl_payment_receipts 
        WHERE user_id = ? AND application_type = ?
        ORDER BY created_at DESC LIMIT 1
      `;

      db.query(
        existingPaymentQuery,
        [user_id, application_type],
        async (err2, existingPayments) => {
          if (err2) {
            console.error('Check existing payment error:', err2);
            return res.status(500).json({
              success: false,
              message: 'Internal server error',
              error: err2.message,
            });
          }

          // business rules for pending / approved etc.
          if (existingPayments.length > 0) {
            const latestPayment = existingPayments[0];

            if (latestPayment.payment_status === 'pending') {
              return res.status(400).json({
                success: false,
                message:
                  'You have a pending payment submission for this application type. Please wait for admin approval before submitting a new payment.',
                data: {
                  existing_payment: {
                    receipt_id: latestPayment.receipt_id,
                    status: latestPayment.payment_status,
                    created_at: latestPayment.created_at,
                    permit_name: latestPayment.permit_name,
                  },
                },
              });
            }

            if (
              latestPayment.payment_status === 'approved' &&
              latestPayment.form_access_granted === 1 &&
              latestPayment.form_access_used === 0
            ) {
              return res.status(400).json({
                success: false,
                message:
                  'You have an approved payment for this application type. Please complete your application form before submitting a new payment.',
                data: {
                  existing_payment: {
                    receipt_id: latestPayment.receipt_id,
                    status: latestPayment.payment_status,
                    form_access_granted: latestPayment.form_access_granted,
                    approved_at: latestPayment.approved_at,
                    permit_name: latestPayment.permit_name,
                  },
                },
              });
            }
          }

          // 🔹 Get price from tbl_document_prices
          getDocumentPricing(application_type, (priceErr, pricing) => {
            if (priceErr) {
              console.error('Get document pricing error:', priceErr);

              if (priceErr.code === 'PRICE_NOT_FOUND') {
                return res.status(400).json({
                  success: false,
                  message:
                    'Pricing is not configured for this application type. Please contact the administrator.',
                });
              }

              return res.status(500).json({
                success: false,
                message: 'Failed to retrieve document pricing.',
                error: priceErr.message,
              });
            }

            try {
              // Save receipt image file
              const receiptImagePath = saveReceiptFile(
                req.files.receipt_image
              );

              if (!receiptImagePath) {
                return res.status(400).json({
                  success: false,
                  message:
                    'Failed to save receipt image. Please check file format and size.',
                });
              }

              const totalAmount = pricing.total_price;
              const paymentAmount = pricing.payment_amount;
              const paymentPercentage = pricing.payment_percentage;

              const insertQuery = `INSERT INTO tbl_payment_receipts (
                user_id, application_type, permit_name, receipt_image, 
                payment_method, payment_amount, payment_percentage, total_document_price
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

              db.query(
                insertQuery,
                [
                  user_id,
                  application_type,
                  // keep frontend permit_name; you can use pricing.permit_name if you prefer
                  permit_name,
                  receiptImagePath,
                  payment_method,
                  paymentAmount,
                  paymentPercentage,
                  totalAmount,
                ],
                (err3, result) => {
                  if (err3) {
                    console.error('Insert payment receipt error:', err3);
                    return res.status(500).json({
                      success: false,
                      message:
                        'Failed to save payment receipt. Please try again.',
                      error: err3.message,
                    });
                  }

                  res.status(201).json({
                    success: true,
                    message:
                      'Payment receipt submitted successfully! Please wait for admin approval.',
                    data: {
                      receipt_id: result.insertId,
                      user_info: userInfo[0],
                      status: 'pending',
                      payment_details: {
                        total_document_price: totalAmount,
                        payment_amount: paymentAmount,
                        payment_percentage: paymentPercentage,
                        remaining_amount: totalAmount - paymentAmount,
                      },
                    },
                  });
                }
              );
            } catch (fileError) {
              console.error('File processing error:', fileError);
              return res.status(500).json({
                success: false,
                message: 'Error processing receipt image',
                error: fileError.message,
              });
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Submit payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error. Please try again.',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get payment receipts for admin/employee review (unchanged shape)          */
/* -------------------------------------------------------------------------- */

exports.getPaymentReceipts = (req, res) => {
  try {
    const { status, application_type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pr.*,
        CONCAT(ui.firstname, ' ', COALESCE(ui.middlename, ''), ' ', ui.lastname) as full_name,
        ui.address,
        ui.phone_number,
        l.email,
        approver.email as approved_by_email
      FROM tbl_payment_receipts pr
      LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      LEFT JOIN tb_logins l ON pr.user_id = l.user_id
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
          error: err.message,
        });
      }

      let countQuery =
        'SELECT COUNT(*) as total FROM tbl_payment_receipts pr WHERE 1=1';
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
            error: err2.message,
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
            total_pages: Math.ceil(total / limit),
          },
        });
      });
    });
  } catch (error) {
    console.error('Get payment receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get user's payment receipts (unchanged)                                   */
/* -------------------------------------------------------------------------- */

exports.getUserPaymentReceipts = (req, res) => {
  try {
    const { user_id } = req.params;

    const query = `
      SELECT 
        pr.*,
        CONCAT(ui.firstname, ' ', COALESCE(ui.middlename, ''), ' ', ui.lastname) as full_name,
        ui.address,
        ui.phone_number,
        l.email
      FROM tbl_payment_receipts pr
      LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      LEFT JOIN tb_logins l ON pr.user_id = l.user_id
      WHERE pr.user_id = ?
      ORDER BY pr.created_at DESC
    `;

    db.query(query, [user_id], (err, receipts) => {
      if (err) {
        console.error('Get user payment receipts error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: receipts,
      });
    });
  } catch (error) {
    console.error('Get user payment receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Approve / Reject payment receipt (unchanged)                              */
/* -------------------------------------------------------------------------- */

exports.updatePaymentStatus = (req, res) => {
  try {
    const { receipt_id } = req.params;
    const { status, admin_notes, approved_by } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"',
      });
    }

    const updateFields = ['payment_status = ?'];
    const updateValues = [status];

    if (admin_notes) {
      updateFields.push('admin_notes = ?');
      updateValues.push(admin_notes);
    }

    if (status === 'approved') {
      updateFields.push(
        'approved_by = ?',
        'approved_at = CURRENT_TIMESTAMP',
        'form_access_granted = 1'
      );
      updateValues.push(approved_by);
    }

    updateValues.push(receipt_id);

    const updateQuery = `UPDATE tbl_payment_receipts SET ${updateFields.join(
      ', '
    )} WHERE receipt_id = ?`;

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error('Update payment status error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment receipt not found',
        });
      }

      const getUpdatedQuery = `
        SELECT 
          pr.*,
          CONCAT(ui.firstname, ' ', COALESCE(ui.middlename, ''), ' ', ui.lastname) as full_name,
          ui.phone_number,
          l.email
        FROM tbl_payment_receipts pr
        LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
        LEFT JOIN tb_logins l ON pr.user_id = l.user_id
        WHERE pr.receipt_id = ?
      `;

      db.query(getUpdatedQuery, [receipt_id], (err2, updatedReceipt) => {
        if (err2) {
          console.error('Get updated receipt error:', err2);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err2.message,
          });
        }

        res.json({
          success: true,
          message: `Payment receipt ${status} successfully`,
          data: updatedReceipt[0],
        });
      });
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Check form access permission (unchanged)                                  */
/* -------------------------------------------------------------------------- */

exports.checkFormAccess = (req, res) => {
  try {
    const { user_id, application_type } = req.params;

    const query = `
      SELECT * FROM tbl_payment_receipts 
      WHERE user_id = ? AND application_type = ? 
      AND payment_status = 'approved' AND form_access_granted = 1 
      ORDER BY created_at DESC LIMIT 1
    `;

    db.query(query, [user_id, application_type], (err, result) => {
      if (err) {
        console.error('Check form access error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.json({
          success: false,
          hasAccess: false,
          message: 'No approved payment found for this application type',
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
          remaining_amount:
            receipt.total_document_price - receipt.payment_amount,
        },
      });
    });
  } catch (error) {
    console.error('Check form access error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get payment statistics (now pulling prices from DB)                       */
/* -------------------------------------------------------------------------- */

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
          error: err.message,
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
            error: err2.message,
          });
        }

        const docPriceQuery = `
          SELECT 
            application_type,
            permit_name,
            default_price,
            current_price,
            payment_percentage,
            is_active
          FROM tbl_document_prices
        `;

        db.query(docPriceQuery, (err3, docPrices) => {
          if (err3) {
            console.error('Get document prices error:', err3);
            return res.status(500).json({
              success: false,
              message: 'Internal server error',
              error: err3.message,
            });
          }

          res.json({
            success: true,
            data: {
              detailed_stats: stats,
              summary: totalStats[0],
              document_prices: docPrices,
            },
          });
        });
      });
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get document pricing information (DB only)                                */
/* -------------------------------------------------------------------------- */

exports.getDocumentPrices = (req, res) => {
  try {
    const { application_type } = req.query;

    if (application_type) {
      // Single type
      getDocumentPricing(application_type, (err, pricing) => {
        if (err) {
          console.error('Get document prices error:', err);

          if (err.code === 'PRICE_NOT_FOUND') {
            return res.status(404).json({
              success: false,
              message:
                'No pricing configuration found for this application type.',
            });
          }

          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message,
          });
        }

        return res.json({
          success: true,
          data: {
            application_type: pricing.application_type,
            permit_name: pricing.permit_name,
            total_price: pricing.total_price,
            payment_amount: pricing.payment_amount,
            payment_percentage: pricing.payment_percentage,
            remaining_amount: pricing.total_price - pricing.payment_amount,
          },
        });
      });
    } else {
      // All active types
      const sql = `
        SELECT 
          application_type,
          permit_name,
          current_price,
          payment_percentage
        FROM tbl_document_prices
        WHERE is_active = 1
        ORDER BY id ASC
      `;

      db.query(sql, (err, rows) => {
        if (err) {
          console.error('Get all document prices error:', err);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message,
          });
        }

        const data = rows.map((row) => {
          const total = parseFloat(row.current_price);
          const pct = parseFloat(row.payment_percentage || 100);
          const pay = (total * pct) / 100;

          return {
            application_type: row.application_type,
            permit_name: row.permit_name,
            total_price: total,
            payment_amount: pay,
            payment_percentage: pct,
            remaining_amount: total - pay,
          };
        });

        res.json({
          success: true,
          data,
        });
      });
    }
  } catch (error) {
    console.error('Get document prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get payment receipts for tracking in user (unchanged)                     */
/* -------------------------------------------------------------------------- */

exports.getPaymentReceiptsForTracking = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
        data: [],
      });
    }

    const userId = req.session.user.user_id;
    console.log('Getting payment receipts for user:', userId);

    const query = `
      SELECT 
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
        CONCAT(ui.firstname, ' ', COALESCE(ui.middlename, ''), ' ', ui.lastname) as full_name,
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
      ORDER BY pr.created_at DESC
    `;

    db.query(query, [userId], (err, receipts) => {
      if (err) {
        console.error('Get payment receipts for tracking error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve payment receipts',
          error: err.message,
          data: [],
        });
      }

      console.log('Found payment receipts:', receipts ? receipts.length : 0);

      res.status(200).json({
        success: true,
        data: receipts || [],
        count: receipts ? receipts.length : 0,
      });
    });
  } catch (error) {
    console.error('Get payment receipts for tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error',
      error: error.message,
      data: [],
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Use form access (unchanged)                                               */
/* -------------------------------------------------------------------------- */

exports.useFormAccess = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
      });
    }

    const userId = req.session.user.user_id;
    const receiptId = req.params.receiptId;

    console.log(
      `User ${userId} attempting to use form access for receipt ${receiptId}`
    );

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
          message: 'Database error occurred',
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found or does not belong to you',
        });
      }

      const receipt = results[0];

      if (receipt.payment_status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Payment must be approved before accessing the form',
        });
      }

      if (!receipt.form_access_granted) {
        return res.status(403).json({
          success: false,
          message: 'Form access has not been granted yet',
        });
      }

      if (receipt.form_access_used) {
        return res.status(403).json({
          success: false,
          message: 'Form access has already been used',
          usedAt: receipt.form_access_used_at,
        });
      }

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
            message: 'Failed to update form access status',
          });
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Receipt not found or update failed',
          });
        }

        console.log(
          `Form access successfully marked as used for receipt ${receiptId}`
        );

        res.status(200).json({
          success: true,
          message: 'Form access granted successfully',
          data: {
            receiptId: receiptId,
            applicationType: receipt.application_type,
            usedAt: new Date().toISOString(),
          },
        });
      });
    });
  } catch (error) {
    console.error('Error in useFormAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error',
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get form access status (unchanged)                                        */
/* -------------------------------------------------------------------------- */

exports.getFormAccessStatus = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.',
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
          message: 'Database error occurred',
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Receipt not found',
        });
      }

      res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  } catch (error) {
    console.error('Error in getFormAccessStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected server error',
    });
  }
};
