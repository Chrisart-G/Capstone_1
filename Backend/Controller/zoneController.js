const db = require('../db/dbconnect');

// Submit Zoning Permit Form
exports.submitZoningPermit = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      });
    }

    const userId = req.session.user.user_id;
    const formData = req.body;

    // Generate application number BEFORE insert
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const generatedAppNo = `ZP-${new Date().getFullYear()}-${String(timestamp).slice(-6)}${randomNum}`;

    console.log(`Generated application number: ${generatedAppNo}`);

    // List ALL 51 columns in EXACT order as in your table
    const sql = `
      INSERT INTO zoning_permits (
        application_no, date_of_receipt, pmd_or_no, date_issued, amount_paid,
        applicant_last_name, applicant_first_name, applicant_middle_initial, corporation_name,
        applicant_address, corporation_address, authorized_rep_name, project_nature,
        project_nature_other_specify, project_type, project_area_type, project_area_sqm,
        project_location, project_tenure, project_tenure_other_specify, right_over_land,
        right_over_land_other_specify, existing_land_use, existing_land_use_agri_specify,
        existing_land_use_other_specify, commercial_specify, crop, project_cost_words,
        project_cost_figures, q14_written_notice, q16a_office_filed, q14b_dates_filed,
        q16c_actions_taken, release_mode, mail_address_to, mail_addressed_name, signature_applicant,
        signature_authorized_rep, notary_day, notary_month, notary_year, notary_at_municipality,
        notary_province, residence_cert_no, residence_cert_issued_on, residence_cert_issued_at,
        doc_no, page_no, book_no, series_year, user_id
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?
      )
    `;

    // Count the ? marks - should be 51
    const placeholderCount = (sql.match(/\?/g) || []).length;
    console.log(`SQL expects ${placeholderCount} values`);

    // Prepare ALL 51 values in EXACT order
    // Use generatedAppNo instead of formData.applicationNo
    const values = [
      // Office Use (5) - application_no is now generated, not from form
      generatedAppNo,  // ← THIS IS THE FIX: Use generated value instead of null
      formData.dateOfReceipt || null,
      formData.pmdOrNo || null,
      formData.dateIssued || null,
      formData.amountPaid || null,
      
      // Applicant Info (7)
      formData.applicantLastName || null,
      formData.applicantFirstName || null,
      formData.applicantMiddleInitial || null,
      formData.corporationName || null,
      formData.applicantAddress || null,
      formData.corporationAddress || null,
      formData.authorizedRepresentativeName || null,
      
      // Project Details (13)
      formData.projectNature === "none" ? null : formData.projectNature,
      formData.projectNatureOtherSpecify || null,
      formData.projectType || null,
      formData.projectAreaType === "none" ? null : formData.projectAreaType,
      formData.projectAreaSqm || null,
      formData.projectLocation || null,
      formData.projectTenure === "none" ? null : formData.projectTenure,
      formData.projectTenureOtherSpecify || null,
      formData.rightOverLand === "none" ? null : formData.rightOverLand,
      formData.rightOverLandOtherSpecify || null,
      formData.existingLandUse === "none" ? null : formData.existingLandUse,
      formData.existingLandUseAgriSpecify || null,
      formData.existingLandUseOtherSpecify || null,
      formData.commercialSpecify || null,
      formData.crop || null,
      
      // Project Cost (2)
      formData.projectCostWords || null,
      formData.projectCostFigures || null,
      
      // Written Notice (4)
      formData.q14WrittenNotice === "none" ? null : formData.q14WrittenNotice,
      formData.q16aOfficeFiled || null,
      formData.q14bDatesFiled || null,
      formData.q16cActionsTaken || null,
      
      // Release Mode (3)
      formData.releaseMode === "none" ? null : formData.releaseMode,
      formData.mailAddressTo || null,
      formData.mailAddressedName || null,
      
      // Signatures (2)
      formData.signatureApplicant || null,
      formData.signatureAuthorizedRep || null,
      
      // Notary Section (13)
      formData.notaryDay || null,
      formData.notaryMonth || null,
      formData.notaryYear || null,
      formData.notaryAtMunicipality || null,
      formData.notaryProvince || null,
      formData.residenceCertNo || null,
      formData.residenceCertIssuedOn || null,
      formData.residenceCertIssuedAt || null,
      formData.docNo || null,
      formData.pageNo || null,
      formData.bookNo || null,
      formData.seriesYear || null,
      
      // User ID (1)
      userId
    ];

    console.log(`Prepared ${values.length} values`);
    console.log(`Application number: ${generatedAppNo}`);

    // Verify counts match
    if (values.length !== placeholderCount) {
      return res.status(500).json({
        success: false,
        message: `Configuration error: SQL expects ${placeholderCount} values, but got ${values.length}`
      });
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        console.error("SQL:", sql);
        console.error("Values:", values);
        return res.status(500).json({
          success: false,
          message: "Database insert failed",
          error: err.message
        });
      }

      const permitId = result.insertId;
      console.log(`Insert successful! Permit ID: ${permitId}`);
      
      // Return success response with the generated application number
      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: {
          permitId: permitId,
          applicationNo: generatedAppNo
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};