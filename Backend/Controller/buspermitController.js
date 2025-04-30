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