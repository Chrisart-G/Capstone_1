const db = require('../db/dbconnect');

// Helper function to generate application number
const generateApplicationNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM tbl_electrical_permits WHERE YEAR(created_at) = ?',
      [currentYear]
    );
    
    const count = result[0].count + 1;
    return `EP-${currentYear}-${count.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating application number:', error);
    throw error;
  }
};

// Helper function to generate EP number
const generateEPNumber = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM tbl_electrical_permits WHERE ep_no IS NOT NULL AND YEAR(created_at) = ?',
      [currentYear]
    );
    
    const count = result[0].count + 1;
    return `EP-${currentYear.toString().slice(-2)}-${count.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating EP number:', error);
    throw error;
  }
};


exports.createElectricalPermit = async (req, res) => {
  try {
    // Use session-based authentication like the working business permit controller
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const userId = req.session.user.user_id;
    
    const {
      buildingPermitNo,
      lastName,
      firstName,
      middleInitial,
      tin,
      constructionOwned,
      formOfOwnership,
      useOrCharacter,
      addressNo,
      addressStreet,
      addressBarangay,
      addressCity,
      addressZipCode,
      telephoneNo,
      locationStreet,
      locationLotNo,
      locationBlkNo,
      locationTctNo,
      locationTaxDecNo,
      locationBarangay,
      locationCity,
      scopeOfWork,
      otherScopeSpecify
    } = req.body;

    // Validate required fields
    if (!lastName || !firstName || !scopeOfWork) {
      return res.status(400).json({
        success: false,
        message: 'Last name, first name, and scope of work are required'
      });
    }

    // Use transaction like the working business permit code
    db.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database transaction error", 
          error: err.message 
        });
      }

      // Insert into database - handle null building_permit_no properly
      const sql = `INSERT INTO tbl_electrical_permits (
        building_permit_no, user_id,
        last_name, first_name, middle_initial, tin,
        construction_owned, form_of_ownership, use_or_character,
        address_no, address_street, address_barangay, address_city, address_zip_code,
        telephone_no, location_street, location_lot_no, location_blk_no,
        location_tct_no, location_tax_dec_no, location_barangay, location_city,
        scope_of_work, other_scope_specify
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        buildingPermitNo || null, // Handle empty string as null
        userId,
        lastName,
        firstName,
        middleInitial || null,
        tin || null,
        constructionOwned || null,
        formOfOwnership || null,
        useOrCharacter || null,
        addressNo || null,
        addressStreet || null,
        addressBarangay || null,
        addressCity || null,
        addressZipCode || null,
        telephoneNo || null,
        locationStreet || null,
        locationLotNo || null,
        locationBlkNo || null,
        locationTctNo || null,
        locationTaxDecNo || null,
        locationBarangay || null,
        locationCity || null,
        scopeOfWork,
        otherScopeSpecify || null
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Electrical permit insert failed:", err);
          return db.rollback(() => {
            res.status(500).json({ 
              success: false,
              message: "Insert failed", 
              error: err.message 
            });
          });
        }

        const permitId = result.insertId;
        
        // Generate application number and EP number based on the inserted ID
        const applicationNo = `EP-APP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const epNo = `EP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;

        // Update the record with generated numbers
        const updateSql = `UPDATE tbl_electrical_permits SET application_no = ?, ep_no = ? WHERE id = ?`;
        
        db.query(updateSql, [applicationNo, epNo, permitId], (updateErr) => {
          if (updateErr) {
            console.error("❌ Update application numbers failed:", updateErr);
            return db.rollback(() => {
              res.status(500).json({ 
                success: false,
                message: "Failed to generate application numbers", 
                error: updateErr.message 
              });
            });
          }

          // Commit the transaction
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

            // Success response
            res.status(201).json({
              success: true,
              message: 'Electrical permit application submitted successfully',
              data: {
                id: permitId,
                applicationNo: applicationNo,
                epNo: epNo,
                status: 'pending'
              }
            });
          });
        });
      });
    });

  } catch (error) {
    console.error('Error creating electrical permit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit electrical permit application',
      error: error.message
    });
  }
};

// Get all electrical permits for a specific user
exports.getUserElectricalPermits = async (req, res) => {
  try {
    // Fix: Use session-based authentication
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const userId = req.session.user.user_id;

    const [permits] = await db.query(
      `SELECT * FROM tbl_electrical_permits 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: permits
    });

  } catch (error) {
    console.error('Error fetching user electrical permits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch electrical permits',
      error: error.message
    });
  }
};

// Get all electrical permits (for admin/employees)
exports.getAllElectricalPermits = async (req, res) => {
  try {
    const [permits] = await db.query(
      `SELECT ep.*, tl.email as user_email 
       FROM tbl_electrical_permits ep
       LEFT JOIN tb_logins tl ON ep.user_id = tl.user_id
       ORDER BY ep.created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: permits
    });

  } catch (error) {
    console.error('Error fetching all electrical permits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch electrical permits',
      error: error.message
    });
  }
};

// Get electrical permit by ID
exports.getElectricalPermitById = async (req, res) => {
  try {
    const permitId = req.params.id;

    const [permit] = await db.query(
      `SELECT ep.*, tl.email as user_email 
       FROM tbl_electrical_permits ep
       LEFT JOIN tb_logins tl ON ep.user_id = tl.user_id
       WHERE ep.id = ?`,
      [permitId]
    );

    if (permit.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Electrical permit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: permit[0]
    });

  } catch (error) {
    console.error('Error fetching electrical permit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch electrical permit',
      error: error.message
    });
  }
};

// Update electrical permit status
exports.updateElectricalPermitStatus = async (req, res) => {
  try {
    const permitId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'processing'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const [result] = await db.query(
      'UPDATE tbl_electrical_permits SET status = ? WHERE id = ?',
      [status, permitId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Electrical permit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Electrical permit status updated successfully'
    });

  } catch (error) {
    console.error('Error updating electrical permit status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update electrical permit status',
      error: error.message
    });
  }
};

// Delete electrical permit
exports.deleteElectricalPermit = async (req, res) => {
  try {
    const permitId = req.params.id;

    const [result] = await db.query(
      'DELETE FROM tbl_electrical_permits WHERE id = ?',
      [permitId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Electrical permit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Electrical permit deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting electrical permit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete electrical permit',
      error: error.message
    });
  }
};