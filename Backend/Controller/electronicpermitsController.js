const db = require('../db/dbconnect');

// Create Electronics Permit
exports.createElectronicsPermit = async (req, res) => {
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
      lastName,
      firstName,
      middleInitial,
      tin,
      forConstructionOwned,
      formOfOwnership,
      useOrCharacter,
      ownerNo,
      ownerStreet,
      ownerBarangay,
      ownerCity,
      ownerZipCode,
      telephoneNo,
      lotNo,
      blkNo,
      tctNo,
      currentTaxDecNo,
      constructionStreet,
      constructionBarangay,
      constructionCity,
      scopeOfWork
    } = req.body;

    // Validate required fields
    if (!lastName || !firstName || !scopeOfWork) {
      return res.status(400).json({
        success: false,
        message: 'Last name, first name, and scope of work are required'
      });
    }

    // Validate scope of work is not empty
    if (scopeOfWork.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid scope of work'
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
      const sql = `INSERT INTO tbl_electronics_permits (
        user_id,
        last_name, first_name, middle_initial, tin,
        construction_owned, form_of_ownership, use_or_character,
        address_no, address_street, address_barangay, address_city, address_zip_code,
        telephone_no,
        location_lot_no, location_blk_no, location_tct_no, location_tax_dec_no,
        location_street, location_barangay, location_city,
        scope_of_work
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        userId,
        lastName,
        firstName,
        middleInitial || null,
        tin || null,
        forConstructionOwned || null,
        formOfOwnership || null,
        useOrCharacter || null,
        ownerNo || null,
        ownerStreet || null,
        ownerBarangay || null,
        ownerCity || null,
        ownerZipCode || null,
        telephoneNo || null,
        lotNo || null,
        blkNo || null,
        tctNo || null,
        currentTaxDecNo || null,
        constructionStreet || null,
        constructionBarangay || null,
        constructionCity || null,
        scopeOfWork
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Electronics permit insert failed:", err);
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
        const applicationNo = `ELC-APP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const epNo = `ELC-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const buildingPermitNo = `ELEC-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;

        // Update the record with all generated numbers
        const updateSql = `UPDATE tbl_electronics_permits SET application_no = ?, ep_no = ?, building_permit_no = ? WHERE id = ?`;
        
        db.query(updateSql, [applicationNo, epNo, buildingPermitNo, permitId], (updateErr) => {
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
            AND application_type = 'electronics' 
            AND payment_status = 'approved' 
            AND form_access_granted = 1 
            AND form_access_used = 0
            ORDER BY created_at DESC 
            LIMIT 1`;

          db.query(updateFormAccessSql, [permitId, userId], (formAccessErr) => {
            if (formAccessErr) {
              console.error("Form access update failed:", formAccessErr);
              console.warn("Electronics permit submitted successfully but form access update failed");
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
                message: 'Electronics permit application submitted successfully',
                data: {
                  id: permitId,
                  applicationNo: applicationNo,
                  epNo: epNo,
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
    console.error('Error creating electronics permit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit electronics permit application',
      error: error.message
    });
  }
};