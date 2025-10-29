// Controller/employeepaymentverification.js
const db = require('../db/dbconnect');

// ====== SMS CORE (added) ======
const axios = require("axios");
const { IPROG_API_TOKEN, SMS_ENABLED = "true" } = process.env;

// tiny db->promise helper (safe to reuse)
function q(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );
}

// feature flag from DB (fallback to .env)
async function getSmsEnabledFlag() {
  try {
    const rows = await q('SELECT v FROM system_settings WHERE k="sms_enabled" LIMIT 1');
    if (rows && rows[0]) return rows[0].v === "true";
  } catch (_) {}
  return String(SMS_ENABLED).toLowerCase() === "true";
}

// normalize to 639xxxxxxxxx
function normPhone(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/\D/g, "");
  if (s.startsWith("09")) s = "63" + s.slice(1);
  else if (s.startsWith("9") && s.length === 10) s = "63" + s;
  else if (s.startsWith("0") && s.length === 11) s = "63" + s.slice(1);
  else if (s.startsWith("+63")) s = s.replace("+", "");
  return s;
}

// peso formatter (tolerant)
function formatPHP(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
  } catch {
    return "₱" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

// send via IPROG
async function iprogSend({ phone, message }) {
  const url = "https://sms.iprogtech.com/api/v1/sms_messages";
  const params = {
    api_token: IPROG_API_TOKEN,
    phone_number: normPhone(phone),
    message: String(message || "").slice(0, 306),
  };

  console.log("[SMS] SEND →", { url, params });
  const res = await axios.post(url, null, {
    params,
    timeout: 15000,
    validateStatus: () => true,
  });
  console.log("[SMS] SEND ←", res.status, res.data);

  if (res.status >= 200 && res.status < 300) return res.data;
  const err = new Error("IPROG send failed");
  err.response = res;
  throw err;
}

// optional credits checker (not wired to routes here)
async function iprogCredits() {
  const url = "https://sms.iprogtech.com/api/v1/account/sms_credits";
  const res = await axios.get(url, {
    params: { api_token: IPROG_API_TOKEN },
    timeout: 10000,
    validateStatus: () => true,
  });
  console.log("[SMS] CREDITS ←", res.status, res.data);
  return res.data;
}

// Build concise payment message
function buildPaymentMessage({ permit_name, application_type, payment_amount, payment_percentage, total_document_price, status, admin_notes }) {
  const lines = [
    "Municipal Payments",
    `${permit_name || "Permit"} ${application_type ? `(${application_type})` : ""}`.trim(),
    `Status: ${status === 'approved' ? 'Approved' : 'Rejected'}`,
  ];

  const amountLine = (() => {
    const parts = [];
    if (payment_amount != null) parts.push(`Paid: ${formatPHP(payment_amount)}`);
    if (total_document_price != null) parts.push(`of ${formatPHP(total_document_price)}`);
    if (payment_percentage != null) parts.push(`(${Number(payment_percentage)}%)`);
    return parts.length ? parts.join(" ") : null;
  })();
  if (amountLine) lines.push(amountLine);

  if (status === 'approved') {
    lines.push("Your payment was approved. You may proceed in the portal.");
  } else {
    lines.push("Your payment was not approved. See notes in the portal.");
  }

  if (admin_notes) {
    const note = String(admin_notes).trim().replace(/\s+/g, " ");
    if (note) lines.push(`Note: ${note}`.slice(0, 120)); // keep short
  }

  lines.push("Login for details.");
  return lines.filter(Boolean).join("\n").slice(0, 306);
}

// Fire SMS for a payment receipt id + status
async function fireSmsForPayment(receiptId, status, admin_notes) {
  try {
    const smsOn = await getSmsEnabledFlag();
    if (!smsOn) {
      console.log("[SMS] Skipped (disabled)");
      return;
    }

    // fetch receipt + user phone
    const rows = await q(`
      SELECT 
        pr.receipt_id,
        pr.user_id,
        pr.application_type,
        pr.permit_name,
        pr.payment_amount,
        pr.payment_percentage,
        pr.total_document_price,
        ui.phone_number AS user_phone
      FROM tbl_payment_receipts pr
      LEFT JOIN tbl_user_info ui ON pr.user_id = ui.user_id
      WHERE pr.receipt_id = ?
      LIMIT 1
    `, [receiptId]);

    if (!rows || !rows[0]) {
      console.log("[SMS] No receipt found for", receiptId);
      return;
    }

    const r = rows[0];
    if (!r.user_phone) {
      console.log("[SMS] No phone for user", r.user_id);
      return;
    }

    const message = buildPaymentMessage({
      permit_name: r.permit_name,
      application_type: r.application_type,
      payment_amount: r.payment_amount,
      payment_percentage: r.payment_percentage,
      total_document_price: r.total_document_price,
      status,
      admin_notes
    });

    console.log("[SMS] Will send (payment) →", { receiptId, userId: r.user_id, phone: normPhone(r.user_phone), status });
    await iprogSend({ phone: r.user_phone, message });
  } catch (e) {
    console.error("[SMS] fireSmsForPayment error:", e?.response?.status, e?.response?.data || e);
  }
}
// ====== END SMS CORE ======


// ======================= ORIGINAL CONTROLLER CODE (unchanged logic) =======================

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

          // respond to UI (unchanged)
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

          // 🔔 SMS in background (non-blocking)
          fireSmsForPayment(id, 'approved', admin_notes)
            .then(() => console.log("[SMS] done payment approve", { id }))
            .catch(e => console.error("[SMS] bg error approve:", e?.response?.data || e));
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

          // respond to UI (unchanged)
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

          // 🔔 SMS in background (non-blocking)
          fireSmsForPayment(id, 'rejected', admin_notes)
            .then(() => console.log("[SMS] done payment reject", { id }))
            .catch(e => console.error("[SMS] bg error reject:", e?.response?.data || e));
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
