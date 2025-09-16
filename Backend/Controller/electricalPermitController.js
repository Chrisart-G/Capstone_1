const db = require('../db/dbconnect');
//use to create
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
      scopeOfWork
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

      // Insert into database - building_permit_no will be auto-generated
      const sql = `INSERT INTO tbl_electrical_permits (
        user_id,
        last_name, first_name, middle_initial, tin,
        construction_owned, form_of_ownership, use_or_character,
        address_no, address_street, address_barangay, address_city, address_zip_code,
        telephone_no, location_street, location_lot_no, location_blk_no,
        location_tct_no, location_tax_dec_no, location_barangay, location_city,
        scope_of_work
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
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
        scopeOfWork
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
        
        // Generate all three numbers based on the inserted ID
        const applicationNo = `EP-APP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const epNo = `EP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;
        const buildingPermitNo = `BP-${new Date().getFullYear()}-${String(permitId).padStart(6, '0')}`;

        // Update the record with all generated numbers
        const updateSql = `UPDATE tbl_electrical_permits SET application_no = ?, ep_no = ?, building_permit_no = ? WHERE id = ?`;
        
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

          // After successful electrical permit submission, update the payment receipt form access
          const updateFormAccessSql = `UPDATE tbl_payment_receipts 
            SET form_access_used = 1, 
                form_access_used_at = CURRENT_TIMESTAMP,
                form_submitted = 1,
                form_submitted_at = CURRENT_TIMESTAMP,
                related_application_id = ?
            WHERE user_id = ? 
            AND application_type = 'electrical' 
            AND payment_status = 'approved' 
            AND form_access_granted = 1 
            AND form_access_used = 0
            ORDER BY created_at DESC 
            LIMIT 1`;

          db.query(updateFormAccessSql, [permitId, userId], (formAccessErr) => {
            if (formAccessErr) {
              console.error("Form access update failed:", formAccessErr);
              // Don't rollback the entire transaction for this, just log the error
              console.warn("Electrical permit submitted successfully but form access update failed");
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
                  buildingPermitNo: buildingPermitNo,
                  status: 'pending'
                },
                formAccessUpdated: !formAccessErr // Let frontend know if form access was updated
              });
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
//use in track documents for fetch
exports.getAllElectricalPermits = (req, res) => {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized. Please log in." 
      });
    }
    
    // Get user_id from session
    const userId = req.session.user.user_id;
    console.log("Using user_id for electrical permit:", userId);

    const sql = `
        SELECT ep.id, ep.application_no, ep.ep_no, ep.status, 
               ep.first_name, ep.last_name, ep.scope_of_work,
               ep.created_at, ep.updated_at, l.email
        FROM tbl_electrical_permits ep
        LEFT JOIN tb_logins l ON ep.user_id = l.user_id
        WHERE ep.user_id = ?
        ORDER BY ep.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching electrical permits:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving electrical permit applications", 
                error: err.message 
            });
        }

        res.json({ success: true, permits: results });
    });
};
//use in employee dashboard 
exports.getAllElectricalPermitsForEmployee = (req, res) => {
    console.log("Session in ElectricalPermit (Employee):", req.session);
    console.log("User in session:", req.session?.user);

    if (!req.session || !req.session.user) {
        console.log("User not authenticated");
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const sql = `
        SELECT ep.id, ep.application_no, ep.ep_no, ep.status, 
               ep.first_name, ep.last_name, ep.middle_initial, ep.scope_of_work,
               ep.building_permit_no, ep.tin, ep.construction_owned, ep.form_of_ownership,
               ep.use_or_character, ep.address_no, ep.address_street, ep.address_barangay,
               ep.address_city, ep.address_zip_code, ep.telephone_no,
               ep.location_street, ep.location_lot_no, ep.location_blk_no, ep.location_tct_no,
               ep.location_tax_dec_no, ep.location_barangay, ep.location_city,
               ep.created_at, ep.updated_at, l.email, ep.user_id
        FROM tbl_electrical_permits ep
        LEFT JOIN tb_logins l ON ep.user_id = l.user_id
        ORDER BY ep.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching electrical permits for employee:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving electrical permit applications", 
                error: err.message 
            });
        }

        // Transform the data to match the expected format
        const transformedResults = results.map(permit => ({
            id: permit.id,
            type: 'Electrical Permit',
            name: `${permit.first_name} ${permit.middle_initial || ''} ${permit.last_name}`.trim(),
            status: permit.status || 'pending',
            submitted: permit.created_at,
            // Add electrical permit specific fields that actually exist in the table
            application_no: permit.application_no,
            ep_no: permit.ep_no,
            building_permit_no: permit.building_permit_no,
            scope_of_work: permit.scope_of_work,
            tin: permit.tin,
            construction_owned: permit.construction_owned,
            form_of_ownership: permit.form_of_ownership,
            use_or_character: permit.use_or_character,
            // Address fields
            address_no: permit.address_no,
            address_street: permit.address_street,
            address_barangay: permit.address_barangay,
            address_city: permit.address_city,
            address_zip_code: permit.address_zip_code,
            telephone_no: permit.telephone_no,
            // Location fields
            location_street: permit.location_street,
            location_lot_no: permit.location_lot_no,
            location_blk_no: permit.location_blk_no,
            location_tct_no: permit.location_tct_no,
            location_tax_dec_no: permit.location_tax_dec_no,
            location_barangay: permit.location_barangay,
            location_city: permit.location_city,
            // Basic fields
            first_name: permit.first_name,
            middle_initial: permit.middle_initial,
            last_name: permit.last_name,
            email: permit.email,
            user_id: permit.user_id,
            created_at: permit.created_at,
            updated_at: permit.updated_at
        }));

        res.json({ success: true, applications: transformedResults });
    });
};
// function to update electrical permit status
exports.updateElectricalPermitStatus = (req, res) => {
    const permitId = req.params.id;
    const { status } = req.body;

    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const sql = `UPDATE tbl_electrical_permits SET status = ?, updated_at = NOW() WHERE id = ?`;

    db.query(sql, [status, permitId], (err, result) => {
        if (err) {
            console.error("Error updating electrical permit status:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error updating electrical permit status", 
                error: err.message 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Electrical permit not found" 
            });
        }

        res.json({ 
            success: true, 
            message: "Electrical permit status updated successfully" 
        });
    });
};
//this function to get single electrical permit details
exports.getElectricalPermitById = (req, res) => {
    const permitId = req.params.id;

    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const sql = `
        SELECT ep.*, l.email
        FROM tbl_electrical_permits ep
        LEFT JOIN tb_logins l ON ep.user_id = l.user_id
        WHERE ep.id = ?
    `;

    db.query(sql, [permitId], (err, results) => {
        if (err) {
            console.error("Error fetching electrical permit details:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving electrical permit details", 
                error: err.message 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Electrical permit not found" 
            });
        }

        const permit = results[0];
        const transformedPermit = {
            id: permit.id,
            type: 'Electrical Permit',
            name: `${permit.first_name} ${permit.middle_initial || ''} ${permit.last_name}`.trim(),
            status: permit.status || 'pending',
            submitted: permit.created_at,
            ...permit // Include all fields
        };

        res.json({ success: true, application: transformedPermit });
    });
};

// In electricalPermitController.js
exports.moveElectricalToInProgress = (req, res) => {
  const { applicationId } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `UPDATE tbl_electrical_permits SET status = 'in-progress', updated_at = NOW() WHERE id = ?`;

  db.query(sql, [applicationId], (err, result) => {
    if (err) {
      console.error("Failed:", err);
      return res.status(500).json({ success: false, message: "Failed to update" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Permit not found" });
    }

    res.json({ success: true, message: "Moved to in-progress" });
  });
};

exports.moveElectricalToRequirementsCompleted = (req, res) => {
  const { applicationId } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `UPDATE tbl_electrical_permits SET status = 'requirements-completed', updated_at = NOW() WHERE id = ?`;

  db.query(sql, [applicationId], (err, result) => {
    if (err) {
      console.error("Failed:", err);
      return res.status(500).json({ success: false, message: "Failed to update" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Permit not found" });
    }

    res.json({ success: true, message: "Moved to requirements-completed" });
  });
};


exports.moveElectricalToApproved = (req, res) => {
  const { applicationId } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `UPDATE tbl_electrical_permits SET status = 'approved', updated_at = NOW() WHERE id = ?`;

  db.query(sql, [applicationId], (err, result) => {
    if (err) {
      console.error("Failed:", err);
      return res.status(500).json({ success: false, message: "Failed to update" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Permit not found" });
    }

    res.json({ success: true, message: "Electrical permit approved" });
  });
};
exports.moveElectricalToReadyForPickup = (req, res) => {
  const { applicationId, schedule } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const sql = `
    UPDATE tbl_electrical_permits 
    SET status = 'ready-for-pickup', pickup_schedule = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [schedule, applicationId], (err, result) => {
    if (err) {
      console.error('Error setting pickup for electrical permit:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Electrical permit not found' });
    }

    return res.json({ success: true, message: 'Electrical permit set to ready for pickup' });
  });
};
// Move to Approved
exports.moveElectricalToApproved = (req, res) => {
  const { electricalId } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    UPDATE tbl_electrical_permit 
    SET application_status = 'approved', updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [electricalId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to approve" });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Electrical permit not found" });
    return res.json({ success: true, message: "Electrical permit approved" });
  });
};

// Set Pickup Schedule (Ready for Pickup)
exports.moveElectricalToReadyForPickup = (req, res) => {
  const { electricalId, schedule } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const sql = `
    UPDATE tbl_electrical_permit 
    SET application_status = 'ready-for-pickup', pickup_schedule = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [schedule, electricalId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Permit not found' });
    return res.json({ success: true, message: 'Electrical permit set to ready for pickup' });
  });
};

