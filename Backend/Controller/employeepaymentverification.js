const db = require('../db/dbconnect');

// Get all payment receipts with user information
exports.getAllPaymentReceipts = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const { status = 'all', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (status !== 'all') {
      whereClause = 'WHERE pr.payment_status = ?';
      params.push(status);
    }

    // FIXED: Updated SQL query with new column structure
    const sql = `
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
        u.email as user_email,
        CONCAT_WS(' ', ui.firstname, ui.middlename, ui.lastname) as user_full_name,
        ui.firstname,
        ui.middlename,
        ui.lastname,
        ui.phone_number as user_phone,
        ui.address as user_address,
        approver.email as approved_by_email,
        CONCAT_WS(' ', approver_info.firstname, approver_info.middlename, approver_info.lastname) as approved_by_full_name,
        approver_info.firstname as approved_by_firstname,
        approver_info.middlename as approved_by_middlename,
        approver_info.lastname as approved_by_lastname
      FROM tbl_payment_receipts pr
      LEFT JOIN tb_logins u ON pr.user_id = u.user_id
      LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      LEFT JOIN tb_logins approver ON pr.approved_by = approver.user_id
      LEFT JOIN tbl_user_info approver_info ON pr.approved_by = approver_info.user_id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error fetching payment receipts:", err);
        return res.status(500).json({ 
          success: false,
          message: "Failed to fetch payment receipts", 
          error: err.message 
        });
      }

      // Transform results to match expected format
      const transformedResults = results.map(receipt => {
        // Use the individual name fields directly instead of splitting concatenated names
        const firstName = receipt.firstname || '';
        const lastName = receipt.lastname || '';
        
        const approverFirstName = receipt.approved_by_firstname || '';
        const approverLastName = receipt.approved_by_lastname || '';

        return {
          ...receipt,
          user_first_name: firstName,
          user_last_name: lastName,
          user_phone: receipt.user_phone,
          approved_by_first_name: approverFirstName,
          approved_by_last_name: approverLastName
        };
      });

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total 
        FROM tbl_payment_receipts pr 
        LEFT JOIN tb_logins u ON pr.user_id = u.user_id
        ${whereClause}
      `;
      
      let countParams = status !== 'all' ? [status] : [];

      db.query(countSql, countParams, (countErr, countResults) => {
        if (countErr) {
          console.error("Error counting payment receipts:", countErr);
          return res.status(500).json({ 
            success: false,
            message: "Failed to count payment receipts", 
            error: countErr.message 
          });
        }

        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
          success: true,
          message: 'Payment receipts fetched successfully',
          data: {
            receipts: transformedResults,
            pagination: {
              currentPage: parseInt(page),
              totalPages: totalPages,
              totalRecords: total,
              hasNextPage: parseInt(page) < totalPages,
              hasPrevPage: parseInt(page) > 1
            }
          }
        });
      });
    });

  } catch (error) {
    console.error('Error fetching payment receipts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment receipts',
      error: error.message
    });
  }
};

// Get payment receipt by ID
exports.getPaymentReceiptById = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const { id } = req.params;

    // FIXED: Updated SQL query with new column structure
    const sql = `
      SELECT 
        pr.*,
        u.email as user_email,
        CONCAT_WS(' ', ui.firstname, ui.middlename, ui.lastname) as user_full_name,
        ui.firstname,
        ui.middlename,
        ui.lastname,
        ui.phone_number as user_phone,
        ui.address as user_address,
        approver.email as approved_by_email,
        CONCAT_WS(' ', approver_info.firstname, approver_info.middlename, approver_info.lastname) as approved_by_full_name,
        approver_info.firstname as approved_by_firstname,
        approver_info.middlename as approved_by_middlename,
        approver_info.lastname as approved_by_lastname
      FROM tbl_payment_receipts pr
      LEFT JOIN tb_logins u ON pr.user_id = u.user_id
      LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      LEFT JOIN tb_logins approver ON pr.approved_by = approver.user_id
      LEFT JOIN tbl_user_info approver_info ON pr.approved_by = approver_info.user_id
      WHERE pr.receipt_id = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error fetching payment receipt:", err);
        return res.status(500).json({ 
          success: false,
          message: "Failed to fetch payment receipt", 
          error: err.message 
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment receipt not found'
        });
      }

      // Transform result using individual name fields instead of splitting
      const receipt = results[0];
      const firstName = receipt.firstname || '';
      const lastName = receipt.lastname || '';
      
      const approverFirstName = receipt.approved_by_firstname || '';
      const approverLastName = receipt.approved_by_lastname || '';

      const transformedReceipt = {
        ...receipt,
        user_first_name: firstName,
        user_last_name: lastName,
        user_phone: receipt.user_phone,
        approved_by_first_name: approverFirstName,
        approved_by_last_name: approverLastName
      };

      res.status(200).json({
        success: true,
        message: 'Payment receipt fetched successfully',
        data: transformedReceipt
      });
    });

  } catch (error) {
    console.error('Error fetching payment receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment receipt',
      error: error.message
    });
  }
};

// Approve payment receipt
exports.approvePaymentReceipt = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const { id } = req.params;
    const { admin_notes } = req.body;
    const approvedBy = req.session.user.user_id;

    db.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database transaction error", 
          error: err.message 
        });
      }

      const sql = `
        UPDATE tbl_payment_receipts 
        SET 
          payment_status = 'approved',
          approved_by = ?,
          approved_at = NOW(),
          admin_notes = ?,
          form_access_granted = 1,
          updated_at = NOW()
        WHERE receipt_id = ?
      `;

      db.query(sql, [approvedBy, admin_notes || null, id], (err, result) => {
        if (err) {
          console.error("❌ Payment approval failed:", err);
          return db.rollback(() => {
            res.status(500).json({ 
              success: false,
              message: "Payment approval failed", 
              error: err.message 
            });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({
              success: false,
              message: 'Payment receipt not found'
            });
          });
        }

        db.commit((commitErr) => {
          if (commitErr) {
            console.error("❌ Commit failed:", commitErr);
            return db.rollback(() => {
              res.status(500).json({ 
                success: false,
                message: "Commit failed", 
                error: commitErr.message 
              });
            });
          }

          res.status(200).json({
            success: true,
            message: 'Payment receipt approved successfully',
            data: {
              receipt_id: id,
              status: 'approved',
              approved_by: approvedBy,
              form_access_granted: true
            }
          });
        });
      });
    });

  } catch (error) {
    console.error('Error approving payment receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve payment receipt',
      error: error.message
    });
  }
};

// Reject payment receipt
exports.rejectPaymentReceipt = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const { id } = req.params;
    const { admin_notes } = req.body;
    const approvedBy = req.session.user.user_id;

    if (!admin_notes || admin_notes.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Admin notes are required when rejecting a payment'
      });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database transaction error", 
          error: err.message 
        });
      }

      const sql = `
        UPDATE tbl_payment_receipts 
        SET 
          payment_status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          admin_notes = ?,
          form_access_granted = 0,
          updated_at = NOW()
        WHERE receipt_id = ?
      `;

      db.query(sql, [approvedBy, admin_notes, id], (err, result) => {
        if (err) {
          console.error("❌ Payment rejection failed:", err);
          return db.rollback(() => {
            res.status(500).json({ 
              success: false,
              message: "Payment rejection failed", 
              error: err.message 
            });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({
              success: false,
              message: 'Payment receipt not found'
            });
          });
        }

        db.commit((commitErr) => {
          if (commitErr) {
            console.error("❌ Commit failed:", commitErr);
            return db.rollback(() => {
              res.status(500).json({ 
                success: false,
                message: "Commit failed", 
                error: commitErr.message 
              });
            });
          }

          res.status(200).json({
            success: true,
            message: 'Payment receipt rejected successfully',
            data: {
              receipt_id: id,
              status: 'rejected',
              approved_by: approvedBy,
              admin_notes: admin_notes
            }
          });
        });
      });
    });

  } catch (error) {
    console.error('Error rejecting payment receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment receipt',
      error: error.message
    });
  }
};

// Get payment statistics
exports.getPaymentStatistics = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const sql = `
      SELECT 
        payment_status,
        COUNT(*) as count,
        SUM(payment_amount) as total_amount
      FROM tbl_payment_receipts 
      GROUP BY payment_status
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Error fetching payment statistics:", err);
        return res.status(500).json({ 
          success: false,
          message: "Failed to fetch payment statistics", 
          error: err.message 
        });
      }

      const stats = {
        pending: { count: 0, total_amount: 0 },
        approved: { count: 0, total_amount: 0 },
        rejected: { count: 0, total_amount: 0 }
      };

      results.forEach(row => {
        if (stats[row.payment_status]) {
          stats[row.payment_status] = {
            count: row.count,
            total_amount: parseFloat(row.total_amount || 0)
          };
        }
      });

      res.status(200).json({
        success: true,
        message: 'Payment statistics fetched successfully',
        data: stats
      });
    });

  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};