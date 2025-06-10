

const path = require('path');
const fs = require('fs');
const db = require('../db/dbconnect');

const saveFile = (file) => {
    if (!file) return null;
    const uploadPath = path.join(__dirname, '../uploads/business_docs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    const filename = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadPath, filename);
    file.mv(filePath);
    return `/uploads/business_docs/${filename}`;
  };
  
  exports.SubmitBusinessPermit = async (req, res) => {
      try {
        if (!req.session?.user?.user_id) {
          return res.status(401).json({ message: "Unauthorized. Please log in." });
        }
    
        const userId = req.session.user.user_id;
    
        if (!req.body.data) {
          return res.status(400).json({ message: "Missing form data" });
        }
    
        let data;
        try {
          data = JSON.parse(req.body.data);
        } catch (jsonErr) {
          return res.status(400).json({ message: "Invalid JSON format", error: jsonErr.message });
        }
    
        const files = req.files || {};
        const filled_up_form = saveFile(files.filled_up_form);
        const sec_dti_cda_cert = saveFile(files.sec_dti_cda_cert);
        const local_sketch = saveFile(files.local_sketch);
        const sworn_capital = saveFile(files.sworn_capital);
        const tax_clearance = saveFile(files.tax_clearance);
        const brgy_clearance = saveFile(files.brgy_clearance);
        const cedula = saveFile(files.cedula);
    
        db.beginTransaction((err) => {
          if (err) return res.status(500).json({ message: "DB error", error: err });
    
          
          const sql = `INSERT INTO business_permits (
              application_type, payment_mode, application_date, tin_no, registration_no, registration_date,
              business_type, amendment_from, amendment_to, tax_incentive, tax_incentive_entity,
              last_name, first_name, middle_name, business_name, trade_name,
              business_address, business_postal_code, business_email, business_telephone, business_mobile,
              owner_address, owner_postal_code, owner_email, owner_telephone, owner_mobile,
              emergency_contact, emergency_phone, emergency_email,
              business_area, male_employees, female_employees, local_employees,
              lessor_name, lessor_address, lessor_phone, lessor_email, monthly_rental,
              filled_up_forms, sec_dti_cda_certificate, local_sketch, sworn_statement_capital, tax_clearance, 
              brgy_clearance_business, cedula,
              user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
          const values = [
            data.applicationType, data.paymentMode, data.applicationDate, data.tinNo, data.registrationNo, data.registrationDate,
            data.businessType, data.amendmentFrom, data.amendmentTo, data.taxIncentive, data.taxIncentiveEntity,
            data.lastName, data.firstName, data.middleName, data.businessName, data.tradeName,
            data.businessAddress, data.businessPostalCode, data.businessEmail, data.businessTelephone, data.businessMobile,
            data.ownerAddress, data.ownerPostalCode, data.ownerEmail, data.ownerTelephone, data.ownerMobile,
            data.emergencyContact, data.emergencyPhone, data.emergencyEmail,
            data.businessArea, data.maleEmployees, data.femaleEmployees, data.localEmployees,
            data.lessorName, data.lessorAddress, data.lessorPhone, data.lessorEmail, data.monthlyRental,
            filled_up_form, sec_dti_cda_cert, local_sketch, sworn_capital, tax_clearance, brgy_clearance, cedula,
            userId
          ];
    
          db.query(sql, values, (err, result) => {
            if (err) {
              console.error(" Permit insert failed:", err);
              return db.rollback(() => res.status(500).json({ message: "Insert failed", error: err.message }));
            }
    
            const permitId = result.insertId;
            const activityValues = data.businessActivities.map((act) => [
              permitId,
              act.line,
              act.units,
              act.capitalization,
              act.grossEssential,
              act.grossNonEssential,
            ]);
    
            const actSql = `INSERT INTO business_activities (
              permit_id, line_of_business, units, capitalization, gross_essential, gross_non_essential
            ) VALUES ?`;
    
            db.query(actSql, [activityValues], (err2) => {
              if (err2) {
                console.error(" Activity insert failed:", err2);
                return db.rollback(() => res.status(500).json({ message: "Activity insert failed", error: err2.message }));
              }
    
              db.commit((err3) => {
                if (err3) {
                  console.error(" Commit failed:", err3);
                  return db.rollback(() => res.status(500).json({ message: "Commit failed", error: err3.message }));
                }
    
                res.status(201).json({ success: true, message: "Business permit submitted successfully", permitId });
              });
            });
          });
        });
      } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Unexpected server error", error: err.message });
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

  const query = `SELECT * FROM business_permits WHERE BusinessP_id = ?`;

  db.query(query, [applicationId], (err, results) => {
    if (err) {
      console.error('Error fetching full application details:', err);
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

    // ✅ Then fetch related business activities
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