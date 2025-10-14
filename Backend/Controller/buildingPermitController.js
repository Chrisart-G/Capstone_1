const db = require('../db/dbconnect');

// Create Building Permit
exports.createBuildingPermit = async (req, res) => {
  try {
    // Session-based authentication
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const userId = req.session.user.user_id;
    
    const {
      appliesAlsoFor,
      lastName,
      firstName,
      middleInitial,
      tin,
      forConstructionOwned,
      formOfOwnership,
      no,
      street,
      barangay,
      cityMunicipality,
      zipCode,
      telephoneNo,
      lotNo,
      blkNo,
      tctNo,
      currentTaxDecNo,
      constructionStreet,
      constructionBarangay,
      constructionCity,
      scopeOfWork,
      groupA,
      groupB,
      groupC,
      groupD,
      groupE,
      groupF,
      groupG,
      groupH,
      groupI,
      groupJ1,
      groupJ2
    } = req.body;

    // Validate required fields
    if (!lastName || !firstName || !scopeOfWork) {
      return res.status(400).json({
        success: false,
        message: 'Last name, first name, and scope of work are required'
      });
    }

    // Use transaction
    db.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database transaction error", 
          error: err.message 
        });
      }

      // Insert into database
      const sql = `INSERT INTO tbl_building_permits (
        user_id,
        applies_also_for,
        last_name, first_name, middle_initial, tin,
        construction_owned, form_of_ownership,
        address_no, address_street, address_barangay, address_city, address_zip_code,
        telephone_no,
        location_lot_no, location_blk_no, location_tct_no, location_tax_dec_no,
        location_street, location_barangay, location_city,
        scope_of_work,
        group_a, group_b, group_c, group_d, group_e, group_f,
        group_g, group_h, group_i, group_j1, group_j2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        userId,
        appliesAlsoFor || null,
        lastName,
        firstName,
        middleInitial || null,
        tin || null,
        forConstructionOwned || null,
        formOfOwnership || null,
        no || null,
        street || null,
        barangay || null,
        cityMunicipality || null,
        zipCode || null,
        telephoneNo || null,
        lotNo || null,
        blkNo || null,
        tctNo || null,
        currentTaxDecNo || null,
        constructionStreet || null,
        constructionBarangay || null,
        constructionCity || null,
        scopeOfWork,
        groupA || null,
        groupB || null,
        groupC || null,
        groupD || null,
        groupE || null,
        groupF || null,
        groupG || null,
        groupH || null,
        groupI || null,
        groupJ1 || null,
        groupJ2 || null
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Building permit insert failed:", err);
          return db.rollback(() => {
            res.status(500).json({ 
              success: false,
              message: "Insert failed", 
              error: err.message 
            });
          });
        }

        const permitId = result.insertId;
        
        // Generate all three numbers based on the inserted ID
        const applicationNo = `BP-APP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const bpNo = `BP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const buildingPermitNo = `BLDG-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;

        // Update the record with all generated numbers
        const updateSql = `UPDATE tbl_building_permits SET application_no = ?, bp_no = ?, building_permit_no = ? WHERE id = ?`;
        
        db.query(updateSql, [applicationNo, bpNo, buildingPermitNo, permitId], (updateErr) => {
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

          // Update payment receipt form access
          const updateFormAccessSql = `UPDATE tbl_payment_receipts 
            SET form_access_used = 1, 
                form_access_used_at = CURRENT_TIMESTAMP,
                form_submitted = 1,
                form_submitted_at = CURRENT_TIMESTAMP,
                related_application_id = ?
            WHERE user_id = ? 
            AND application_type = 'building' 
            AND payment_status = 'approved' 
            AND form_access_granted = 1 
            AND form_access_used = 0
            ORDER BY created_at DESC 
            LIMIT 1`;

          db.query(updateFormAccessSql, [permitId, userId], (formAccessErr) => {
            if (formAccessErr) {
              console.error("Form access update failed:", formAccessErr);
              console.warn("Building permit submitted successfully but form access update failed");
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
                message: 'Building permit application submitted successfully',
                data: {
                  id: permitId,
                  applicationNo: applicationNo,
                  bpNo: bpNo,
                  buildingPermitNo: buildingPermitNo,
                  status: 'pending'
                },
                formAccessUpdated: !formAccessErr
              });
            });
          });
        });
      });
    });

  } catch (error) {
    console.error('Error creating building permit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit building permit application',
      error: error.message
    });
  }
};

// Get all building permits for user
exports.getAllBuildingPermits = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }

    const userId = req.session.user.user_id;
    
    const sql = `SELECT * FROM tbl_building_permits WHERE user_id = ? ORDER BY created_at DESC`;
    
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching building permits:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch building permits",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        data: results
      });
    });

  } catch (error) {
    console.error('Error fetching building permits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch building permits',
      error: error.message
    });
  }
};



// Update building permit status
exports.updateBuildingPermitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const sql = `UPDATE tbl_building_permits 
                 SET status = ?, status_updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.query(sql, [status, id], (err, result) => {
      if (err) {
        console.error("Error updating building permit status:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update status",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Building permit not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Building permit status updated successfully"
      });
    });

  } catch (error) {
    console.error('Error updating building permit status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Move to In Progress
exports.moveBuildingToInProgress = async (req, res) => {
  try {
    const { id } = req.body;
    
    const sql = `UPDATE tbl_building_permits 
                 SET status = 'in_progress', status_updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error moving to in progress:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update status",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        message: "Moved to in progress successfully"
      });
    });

  } catch (error) {
    console.error('Error moving to in progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Move to Requirements Completed
exports.moveBuildingToRequirementsCompleted = async (req, res) => {
  try {
    const { id } = req.body;
    
    const sql = `UPDATE tbl_building_permits 
                 SET status = 'requirements_completed', status_updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error moving to requirements completed:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update status",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        message: "Moved to requirements completed successfully"
      });
    });

  } catch (error) {
    console.error('Error moving to requirements completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Move to Approved
exports.moveBuildingToApproved = async (req, res) => {
  try {
    const { id } = req.body;
    
    const sql = `UPDATE tbl_building_permits 
                 SET status = 'approved', status_updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error moving to approved:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update status",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        message: "Moved to approved successfully"
      });
    });

  } catch (error) {
    console.error('Error moving to approved:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Set Ready for Pickup
exports.moveBuildingToReadyForPickup = async (req, res) => {
  try {
    const { id } = req.body;
    
    const sql = `UPDATE tbl_building_permits 
                 SET status = 'ready_for_pickup', status_updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error setting ready for pickup:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update status",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        message: "Set to ready for pickup successfully"
      });
    });

  } catch (error) {
    console.error('Error setting ready for pickup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};