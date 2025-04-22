const db = require('../db/dbconnect');

// Submit a new business permit application
exports.SubmitBusinessPermit = async (req, res) => {
    try {
        console.log("Session in BusinessPermit:", req.session);
        console.log("User in session:", req.session?.user);
        console.log("User ID in session:", req.session?.user?.user_id);

        if (!req.session || !req.session.user || !req.session.user.user_id) {
            console.log("User not authenticated or missing user_id");
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }
        
        // Get user_id from session
        const userId = req.session.user.user_id;
        console.log("Using user_id for business permit:", userId);
        
        // Start transaction
        db.beginTransaction(err => {
            if (err) {
                console.error("Transaction error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            const {
                applicationType, paymentMode, applicationDate, tinNo, registrationNo, registrationDate,
                businessType, amendmentFrom, amendmentTo, taxIncentive, taxIncentiveEntity,
                lastName, firstName, middleName, businessName, tradeName,
                businessAddress, businessPostalCode, businessEmail, businessTelephone, businessMobile,
                ownerAddress, ownerPostalCode, ownerEmail, ownerTelephone, ownerMobile,
                emergencyContact, emergencyPhone, emergencyEmail,
                businessArea, maleEmployees, femaleEmployees, localEmployees,
                lessorName, lessorAddress, lessorPhone, lessorEmail, monthlyRental,
                businessActivities
            } = req.body;

            // Insert with the userId from session
            const permitSql = `
                INSERT INTO business_permits (
                    application_type, payment_mode, application_date, tin_no, registration_no, registration_date,
                    business_type, amendment_from, amendment_to, tax_incentive, tax_incentive_entity,
                    last_name, first_name, middle_name, business_name, trade_name,
                    business_address, business_postal_code, business_email, business_telephone, business_mobile,
                    owner_address, owner_postal_code, owner_email, owner_telephone, owner_mobile,
                    emergency_contact, emergency_phone, emergency_email,
                    business_area, male_employees, female_employees, local_employees,
                    lessor_name, lessor_address, lessor_phone, lessor_email, monthly_rental,
                    user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const permitValues = [
                applicationType, paymentMode, applicationDate, tinNo, registrationNo, registrationDate,
                businessType, amendmentFrom, amendmentTo, taxIncentive, taxIncentiveEntity,
                lastName, firstName, middleName, businessName, tradeName,
                businessAddress, businessPostalCode, businessEmail, businessTelephone, businessMobile,
                ownerAddress, ownerPostalCode, ownerEmail, ownerTelephone, ownerMobile,
                emergencyContact, emergencyPhone, emergencyEmail,
                businessArea, maleEmployees, femaleEmployees, localEmployees,
                lessorName, lessorAddress, lessorPhone, lessorEmail, monthlyRental,
                userId // Using userId from session
            ];

            // Debug statement
            console.log("Inserting business permit with user_id:", userId);
            

            db.query(permitSql, permitValues, (permitErr, permitResult) => {
                if (permitErr) {
                    console.error("Permit insert error:", permitErr);
                    return db.rollback(() => {
                        res.status(500).json({ message: "Error submitting permit application", error: permitErr });
                    });
                }

                const permitId = permitResult.insertId;

                if (businessActivities && businessActivities.length > 0) {
                    const activityValues = businessActivities.map(activity => [
                        permitId,
                        activity.line,
                        activity.units,
                        activity.capitalization,
                        activity.grossEssential,
                        activity.grossNonEssential
                    ]);

                    const activitySql = `
                        INSERT INTO business_activities 
                        (permit_id, line_of_business, units, capitalization, gross_essential, gross_non_essential)
                        VALUES ?
                    `;

                    db.query(activitySql, [activityValues], (activityErr) => {
                        if (activityErr) {
                            console.error("Activity insert error:", activityErr);
                            return db.rollback(() => {
                                res.status(500).json({ message: "Error submitting business activities", error: activityErr });
                            });
                        }

                        db.commit(commitErr => {
                            if (commitErr) {
                                console.error("Commit error:", commitErr);
                                return db.rollback(() => {
                                    res.status(500).json({ message: "Error finalizing submission", error: commitErr });
                                });
                            }

                            res.status(201).json({ 
                                success: true, 
                                message: "Business permit application submitted successfully",
                                permitId: permitId
                            });
                        });
                    });
                } else {
                    db.commit(commitErr => {
                        if (commitErr) {
                            console.error("Commit error:", commitErr);
                            return db.rollback(() => {
                                res.status(500).json({ message: "Error finalizing submission", error: commitErr });
                            });
                        }

                        res.status(201).json({ 
                            success: true, 
                            message: "Business permit application submitted successfully",
                            permitId: permitId
                        });
                    });
                }
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




// Get all business permit applications (for admin)
exports.getAllPermits = (req, res) => {
    const sql = `
        SELECT * 
        FROM business_permits
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching permits:", err);
            return res.status(500).json({ message: "Error retrieving permit applications", error: err });
        }

        res.json({ success: true, permits: results });
    });
};

// Get business permit applications for a specific user
exports.getUserPermits = (req, res) => {
    // Get user ID from session
    const userId = req.session.user ? req.session.user.id : null;
    
    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const sql = `
        SELECT * 
        FROM business_permits
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user permits:", err);
            return res.status(500).json({ message: "Error retrieving permit applications", error: err });
        }

        res.json({ success: true, permits: results });
    });
};

// Get a specific business permit by ID with its activities
exports.getPermitById = (req, res) => {
    const permitId = req.params.id;
    
    // Query to get the permit details
    const permitSql = `
        SELECT * 
        FROM business_permits
        WHERE id = ?
    `;
    
    // Query to get the business activities for this permit
    const activitiesSql = `
        SELECT * 
        FROM business_activities
        WHERE permit_id = ?
    `;
    
    // First get the permit details
    db.query(permitSql, [permitId], (permitErr, permitResults) => {
        if (permitErr) {
            console.error("Error fetching permit:", permitErr);
            return res.status(500).json({ message: "Error retrieving permit details", error: permitErr });
        }
        
        if (permitResults.length === 0) {
            return res.status(404).json({ message: "Permit not found" });
        }
        
        const permit = permitResults[0];
        
        // Then get the business activities
        db.query(activitiesSql, [permitId], (activitiesErr, activitiesResults) => {
            if (activitiesErr) {
                console.error("Error fetching activities:", activitiesErr);
                return res.status(500).json({ message: "Error retrieving business activities", error: activitiesErr });
            }
            
            // Combine permit with its activities
            permit.businessActivities = activitiesResults;
            
            res.json({ success: true, permit: permit });
        });
    });
};

// Update a business permit application status (for admin)
exports.updatePermitStatus = (req, res) => {
    const permitId = req.params.id;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }
    
    const sql = `
        UPDATE business_permits
        SET status = ?
        WHERE id = ?
    `;
    
    db.query(sql, [status, permitId], (err, result) => {
        if (err) {
            console.error("Error updating permit status:", err);
            return res.status(500).json({ message: "Error updating permit status", error: err });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permit not found" });
        }
        
        res.json({ success: true, message: `Permit status updated to ${status}` });
    });
};

// Delete a business permit application
exports.deletePermit = (req, res) => {
    const permitId = req.params.id;
    
    // Check if the user is authorized (either admin or the owner)
    const sql = `
        DELETE FROM business_permits
        WHERE id = ?
        ${req.session.user.role !== 'admin' ? 'AND user_id = ?' : ''}
    `;
    
    const values = req.session.user.role !== 'admin' 
        ? [permitId, req.session.user.id]
        : [permitId];
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error deleting permit:", err);
            return res.status(500).json({ message: "Error deleting permit application", error: err });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Permit not found or you're not authorized to delete it" });
        }
        
        res.json({ success: true, message: "Permit application deleted successfully" });
    });
};