const db = require('../db/dbconnect');

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




// this coode to get the data from tbl_business_permits and get the email from tb_logins display
exports.getAllPermits = (req, res) => {
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

    const sql = `
        SELECT bp.BusinessP_id, bp.status, bp.business_name, bp.application_type, 
               bp.application_date, bp.created_at, l.email
        FROM business_permits bp
        LEFT JOIN tb_logins l ON bp.user_id = l.user_id
        WHERE bp.user_id = ?
        ORDER BY bp.created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching permits:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving permit applications", 
                error: err.message 
            });
        }

        res.json({ success: true, permits: results });
    });
};


exports.GetAllApplications = (req, res) => {
    // Check if user is logged in
    if (!req.session.user || !req.session.user.user_id) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }
    
    // Sample query - adjust based on your actual database schema
    // This query gets all applications and counts associated documents
    const query = `
        SELECT 
            a.id, 
            a.applicant_name as name, 
            a.application_type as type, 
            a.submission_date as submitted, 
            a.status,
            COUNT(d.id) as documentCount
        FROM 
            applications a
        LEFT JOIN 
            application_documents d ON a.id = d.application_id
        GROUP BY 
            a.id
        ORDER BY 
            a.submission_date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching applications:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'An error occurred while fetching applications' 
            });
        }
        
        return res.json({ 
            success: true, 
            applications: results
        });
    });
};

// Get single application by ID
// Get all applications
exports.GetAllApplications = (req, res) => {
    // Check if user is logged in
    if (!req.session.user || !req.session.user.user_id) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }
    
    // Updated query to use business_permits table instead of applications
    const query = `
        SELECT 
            a.BusinessP_id as id, 
            CONCAT(a.first_name, ' ', a.last_name) as name, 
            a.application_type as type, 
            a.application_date as submitted, 
            a.status,
            COUNT(b.id) as documentCount
        FROM 
            business_permits a
        LEFT JOIN 
            business_activities b ON a.BusinessP_id = b.permit_id
        GROUP BY 
            a.BusinessP_id
        ORDER BY 
            a.application_date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching applications:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'An error occurred while fetching applications' 
            });
        }
        
        return res.json({ 
            success: true, 
            applications: results 
        });
    });
};

// Get application by ID
exports.GetApplicationById = (req, res) => {
    // Check if user is logged in
    if (!req.session.user || !req.session.user.user_id) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }
    
    const applicationId = req.params.id;
    
    // Updated query to use business_permits table
    const query = `
        SELECT 
            a.BusinessP_id, 
            CONCAT(a.first_name, ' ', a.last_name) as name, 
            a.application_type as type, 
            a.application_date as submitted, 
            a.status,
            a.business_name,
            a.business_address,
            a.business_type,
            a.business_telephone as contact_number
        FROM 
            business_permits a
        WHERE 
            a.BusinessP_id = ?
    `;
    
    db.query(query, [applicationId], (err, results) => {
        if (err) {
            console.error('Error fetching application details:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'An error occurred while fetching application details' 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Application not found' 
            });
        }
        
        // Get application activities instead of documents
        const activitiesQuery = `
            SELECT id, line_of_business, units, capitalization, created_at
            FROM business_activities
            WHERE permit_id = ?
        `;
        
        db.query(activitiesQuery, [applicationId], (actErr, activities) => {
            if (actErr) {
                console.error('Error fetching business activities:', actErr);
                return res.status(500).json({ 
                    success: false, 
                    message: 'An error occurred while fetching business activities' 
                });
            }
            
            const applicationData = results[0];
            applicationData.activities = activities;
            
            return res.json({ 
                success: true, 
                application: applicationData
            });
        });
    });
};

// Update application status
exports.UpdateApplicationStatus = (req, res) => {
    // Check if user is logged in
    if (!req.session.user || !req.session.user.user_id) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }
    
    const { applicationId, newStatus, remarks } = req.body;
    
    // Update application status in business_permits table
    const updateQuery = `
        UPDATE business_permits
        SET status = ?, updated_at = NOW()
        WHERE BusinessP_id = ?
    `;
    
    db.query(
        updateQuery, 
        [newStatus, applicationId], 
        (err, results) => {
            if (err) {
                console.error('Error updating application status:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'An error occurred while updating application status' 
                });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Application not found' 
                });
            }
            
            return res.json({ 
                success: true, 
                message: 'Application status updated successfully' 
            });
        }
    );
};