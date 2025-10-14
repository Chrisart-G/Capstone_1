const db = require('../db/dbconnect');

// Create Fencing Permit
exports.createFencingPermit = async (req, res) => {
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
      constructionOwnership,
      ownershipForm,
      useOrCharacter,
      addressNo,
      street,
      barangay,
      cityMunicipality,
      zipCode,
      telephoneNo,
      locationStreet,
      lotNo,
      blockNo1,
      blockNo2,
      taxDecNo,
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

    // Validate scope of work
    if (scopeOfWork === '' || scopeOfWork === 'none') {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid scope of work'
      });
    }

    // If "others" is selected, otherScopeSpecify is required
    if (scopeOfWork === 'others' && !otherScopeSpecify) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the scope of work when selecting "Others"'
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
      const sql = `INSERT INTO tbl_fencing_permits (
        user_id,
        last_name, first_name, middle_initial, tin,
        construction_ownership, ownership_form, use_or_character,
        address_no, street, barangay, city_municipality, zip_code,
        telephone_no,
        location_street, lot_no, block_no1, block_no2,
        tax_dec_no, location_barangay, location_city,
        scope_of_work, other_scope_specify
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        userId,
        lastName,
        firstName,
        middleInitial || null,
        tin || null,
        constructionOwnership || null,
        ownershipForm || null,
        useOrCharacter || null,
        addressNo || null,
        street || null,
        barangay || null,
        cityMunicipality || null,
        zipCode || null,
        telephoneNo || null,
        locationStreet || null,
        lotNo || null,
        blockNo1 || null,
        blockNo2 || null,
        taxDecNo || null,
        locationBarangay || null,
        locationCity || null,
        scopeOfWork,
        otherScopeSpecify || null
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Fencing permit insert failed:", err);
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
        const applicationNo = `FP-APP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const fpNo = `FP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const buildingPermitNo = `FENC-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;

        // Update the record with all generated numbers
        const updateSql = `UPDATE tbl_fencing_permits SET application_no = ?, fp_no = ?, building_permit_no = ? WHERE id = ?`;
        
        db.query(updateSql, [applicationNo, fpNo, buildingPermitNo, permitId], (updateErr) => {
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
            AND application_type = 'fencing' 
            AND payment_status = 'approved' 
            AND form_access_granted = 1 
            AND form_access_used = 0
            ORDER BY created_at DESC 
            LIMIT 1`;

          db.query(updateFormAccessSql, [permitId, userId], (formAccessErr) => {
            if (formAccessErr) {
              console.error("Form access update failed:", formAccessErr);
              console.warn("Fencing permit submitted successfully but form access update failed");
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
                message: 'Fencing permit application submitted successfully',
                data: {
                  id: permitId,
                  applicationNo: applicationNo,
                  fpNo: fpNo,
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
    console.error('Error creating fencing permit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit fencing permit application',
      error: error.message
    });
  }
};