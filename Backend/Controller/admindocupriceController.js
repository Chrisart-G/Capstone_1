// Controller/admindocupriceController.js
const db = require('../db/dbconnect');

// Keep in sync with enums
const ALLOWED_TYPES = [
  'business',
  'electrical',
  'cedula',
  'mayors',
  'building',
  'plumbing',
  'fencing',
  'electronics',
  'renewal_business',
];

/**
 * GET /api/document-prices
 * List all configured document prices
 */
exports.getAllDocumentPrices = (req, res) => {
  const sql = `
    SELECT
      id,
      application_type,
      permit_name,
      default_price,
      current_price,
      payment_percentage,
      is_active,
      updated_by,
      updated_at
    FROM tbl_document_prices
    ORDER BY application_type
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching document prices:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch document prices',
        error: err.message,
      });
    }

    return res.json({
      success: true,
      data: rows || [],
    });
  });
};

/**
 * PUT /api/document-prices/:application_type
 * Update current_price and payment_percentage for a given application_type
 */
exports.updateDocumentPrice = (req, res) => {
  const { application_type } = req.params;
  let { current_price, payment_percentage } = req.body;

  if (!ALLOWED_TYPES.includes(application_type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application_type',
    });
  }

  current_price = Number(current_price);
  payment_percentage = payment_percentage !== undefined
    ? Number(payment_percentage)
    : 100;

  if (Number.isNaN(current_price) || current_price < 0) {
    return res.status(400).json({
      success: false,
      message: 'current_price must be a non-negative number',
    });
  }

  if (
    Number.isNaN(payment_percentage) ||
    payment_percentage <= 0 ||
    payment_percentage > 100
  ) {
    return res.status(400).json({
      success: false,
      message: 'payment_percentage must be between 0 and 100',
    });
  }

  const updatedBy = req.session?.user?.user_id || null;

  const sql = `
    UPDATE tbl_document_prices
    SET current_price = ?, payment_percentage = ?, updated_by = ?
    WHERE application_type = ?
  `;

  db.query(
    sql,
    [current_price, payment_percentage, updatedBy, application_type],
    (err, result) => {
      if (err) {
        console.error('Error updating document price:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to update document price',
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'No configuration found for this application_type',
        });
      }

      // Return updated row
      const getSql = `
        SELECT
          id,
          application_type,
          permit_name,
          default_price,
          current_price,
          payment_percentage,
          is_active,
          updated_by,
          updated_at
        FROM tbl_document_prices
        WHERE application_type = ?
        LIMIT 1
      `;

      db.query(getSql, [application_type], (err2, rows) => {
        if (err2) {
          console.error('Error fetching updated document price:', err2);
          return res.status(500).json({
            success: false,
            message: 'Updated but failed to fetch updated record',
            error: err2.message,
          });
        }

        return res.json({
          success: true,
          message: 'Document price updated successfully',
          data: rows[0],
        });
      });
    }
  );
};


exports.getPublicPriceByType = (req, res) => {
  const { application_type } = req.params;

  if (!ALLOWED_TYPES.includes(application_type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application_type',
    });
  }

  const sql = `
    SELECT
      application_type,
      permit_name,
      default_price,
      current_price,
      payment_percentage,
      is_active,
      updated_at
    FROM tbl_document_prices
    WHERE application_type = ? AND is_active = 1
    LIMIT 1
  `;

  db.query(sql, [application_type], (err, rows) => {
    if (err) {
      console.error('Error fetching public document price:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch document price',
        error: err.message,
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active pricing configuration found for this type',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  });
};