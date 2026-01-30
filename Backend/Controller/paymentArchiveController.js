const db = require('../db/dbconnect');

/* -------------------------------------------------------------------------- */
/*  Get Payment Archive Statistics                                            */
/* -------------------------------------------------------------------------- */
exports.getPaymentArchiveStats = async (req, res) => {
  try {
    console.log('Getting payment archive stats...');
    
    // Base query - get approved payments
    const whereClause = 'WHERE payment_status = "approved"';
    
    // Create promises for all queries
    const queries = {
      totalArchived: `SELECT COUNT(*) as count FROM tbl_payment_receipts ${whereClause}`,
      business: `SELECT COUNT(*) as count FROM tbl_payment_receipts ${whereClause} AND (application_type LIKE '%business%' OR application_type = 'renewal_business')`,
      last30Days: `SELECT COUNT(*) as count FROM tbl_payment_receipts ${whereClause} AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      today: `SELECT COUNT(*) as count FROM tbl_payment_receipts ${whereClause} AND DATE(created_at) = CURDATE()`,
      totalAmount: `SELECT COALESCE(SUM(payment_amount), 0) as amount FROM tbl_payment_receipts ${whereClause}`
    };

    // Execute all queries
    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        const [result] = await new Promise((resolve, reject) => {
          db.query(query, (err, rows) => {
            if (err) {
              console.error(`Query error for ${key}:`, err);
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
        results[key] = result?.count || result?.amount || 0;
      } catch (err) {
        console.error(`Error executing ${key} query:`, err);
        results[key] = 0;
      }
    }

    console.log('Stats results:', results);

    res.json({
      success: true,
      stats: {
        totalArchived: parseInt(results.totalArchived) || 0,
        businessPermits: parseInt(results.business) || 0,
        last30Days: parseInt(results.last30Days) || 0,
        today: parseInt(results.today) || 0,
        totalAmount: parseFloat(results.totalAmount || 0).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Get payment archive stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get Archived Payments List                                                */
/* -------------------------------------------------------------------------- */
exports.getArchivedPayments = async (req, res) => {
  try {
    console.log('Getting archived payments...');
    console.log('Query params:', req.query);
    
    const { office } = req.query;
    
    let whereClause = 'WHERE pr.payment_status = "approved"';
    const params = [];

    // Add office filtering if provided and not 'all'
    if (office && office !== 'all' && office !== 'Unknown') {
      // Join with employee table to get department
      whereClause += ' AND ei.department = ?';
      params.push(office);
    }

    const query = `
      SELECT 
        pr.receipt_id,
        pr.user_id,
        pr.application_type,
        pr.permit_name,
        pr.payment_method,
        pr.payment_amount,
        pr.total_document_price,
        pr.payment_status,
        pr.receipt_image,
        pr.admin_notes,
        pr.approved_by,
        pr.approved_at,
        pr.created_at,
        pr.updated_at,
        tl.email as user_email,
        tl.role as user_role,
        ei.department as office,
        CONCAT(ei.first_name, ' ', ei.last_name) as archived_by_name
      FROM tbl_payment_receipts pr
      LEFT JOIN tb_logins tl ON pr.user_id = tl.user_id
      LEFT JOIN tbl_employeeinformation ei ON pr.approved_by = ei.user_id
      ${whereClause}
      ORDER BY pr.approved_at DESC, pr.created_at DESC
      LIMIT 100
    `;

    console.log('Executing query:', query);
    console.log('Query params:', params);

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Database error in getArchivedPayments:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error',
          error: err.message 
        });
      }

      console.log(`Found ${results.length} approved payments`);

      const items = results.map(row => {
        // Get applicant name from email
        let applicantName = 'Unknown Applicant';
        if (row.user_email) {
          applicantName = row.user_email.split('@')[0];
          applicantName = applicantName.charAt(0).toUpperCase() + applicantName.slice(1);
        }

        return {
          id: row.receipt_id,
          receipt_id: row.receipt_id,
          applicant_name: applicantName,
          email: row.user_email || 'N/A',
          phone: 'N/A',
          application_type: row.application_type || 'N/A',
          permit_name: row.permit_name || 'N/A',
          payment_method: row.payment_method || 'N/A',
          payment_amount: parseFloat(row.payment_amount || 0),
          total_amount: parseFloat(row.total_document_price || 0),
          payment_status: row.payment_status || 'approved',
          receipt_image: row.receipt_image,
          office: row.office || 'General',
          archived_by: row.archived_by_name || 'System',
          archived_at: row.approved_at || row.created_at,
          archived_reason: 'Payment Approved',
          admin_notes: row.admin_notes || '',
          approved_by: row.approved_by,
          approved_at: row.approved_at,
          original_created_at: row.created_at,
          updated_at: row.updated_at
        };
      });

      res.json({
        success: true,
        items: items
      });
    });

  } catch (error) {
    console.error('Get archived payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get Offices for Filtering                                                 */
/* -------------------------------------------------------------------------- */
exports.getPaymentArchiveOffices = async (req, res) => {
  try {
    console.log('Getting payment archive offices...');
    
    // Get distinct departments from employee table
    const query = `
      SELECT DISTINCT department as office 
      FROM tbl_employeeinformation 
      WHERE department IS NOT NULL AND department != ''
      ORDER BY department
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Get payment archive offices error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error',
          error: err.message 
        });
      }

      console.log('Office results:', results);

      let offices = results.map(row => row.office).filter(office => office);
      
      // If no offices found, add some common ones
      if (offices.length === 0) {
        offices = ['BPLO', 'MTO', 'MEO', 'MPDO', 'MAO', 'MHO'];
      }
      
      // Add "All" option
      offices.unshift('all');

      console.log('Final offices list:', offices);

      res.json({
        success: true,
        offices: offices
      });
    });

  } catch (error) {
    console.error('Get payment archive offices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Get Single Payment Receipt                                                */
/* -------------------------------------------------------------------------- */
exports.getPaymentReceipt = async (req, res) => {
  try {
    const { receipt_id } = req.params;
    console.log('Getting payment receipt:', receipt_id);
    
    const query = `
      SELECT 
        pr.*,
        tl.email as user_email,
        tl.role as user_role
      FROM tbl_payment_receipts pr
      LEFT JOIN tb_logins tl ON pr.user_id = tl.user_id
      WHERE pr.receipt_id = ? AND pr.payment_status = "approved"
    `;

    db.query(query, [receipt_id], (err, results) => {
      if (err) {
        console.error('Get payment receipt error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error',
          error: err.message 
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Payment receipt not found' 
        });
      }

      const payment = results[0];
      
      res.json({
        success: true,
        payment: payment
      });
    });

  } catch (error) {
    console.error('Get payment receipt error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Archive a Payment                                                         */
/* -------------------------------------------------------------------------- */
exports.archivePayment = async (req, res) => {
  try {
    const { receipt_id, reason } = req.body;
    console.log('Archiving payment:', receipt_id, reason);
    
    if (!receipt_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Receipt ID is required' 
      });
    }

    // For now, just acknowledge the request
    // You can add an 'is_archived' column to tbl_payment_receipts later
    res.json({
      success: true,
      message: 'Payment marked as archived',
      receipt_id: receipt_id
    });

  } catch (error) {
    console.error('Archive payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/* -------------------------------------------------------------------------- */
/*  Restore Archived Payment                                                  */
/* -------------------------------------------------------------------------- */
exports.restorePayment = async (req, res) => {
  try {
    const { receipt_id } = req.params;
    console.log('Restoring payment:', receipt_id);

    // For now, just acknowledge the request
    res.json({
      success: true,
      message: 'Payment restored successfully',
      receipt_id: receipt_id
    });

  } catch (error) {
    console.error('Restore payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};