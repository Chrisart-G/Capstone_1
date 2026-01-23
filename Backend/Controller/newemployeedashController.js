// Controller/newemployeedashController.js
const db = require("../db/dbconnect");

/* ---------------- Auth ---------------- */
function requireAuth(req, res) {
  if (!req.session || !req.session.user || !req.session.user.user_id) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized. Please log in." });
    return false;
  }
  return true;
}

/* ---------------- Dept helpers ---------------- */

function isBusinessCoreDept(deptRaw) {
  const d = (deptRaw || "").toString().toUpperCase();
  if (!d) return false;

  // Your BPLO / Business office
  if (d === "BPLO") return true;
  if (d.includes("BUSINESS")) return true;

  return false;
}

/**
 * Map employee department -> LGU office_name used in `business_lgu_requirements_status.office_name`
 * This dashboard is specifically for:
 *  - MEO  = Municipal Environment Office
 *  - MAO  = Municipal Agriculture Office
 *  - MHO  = Municipal Health Office
 */
function getLguOfficeNameForDept(deptRaw) {
  const d = (deptRaw || "").toString().toUpperCase();
  if (!d) return null;

  if (d === "MEO" || d.includes("MEO") || d.includes("ENVIRONMENT")) {
    return "MEO";
  }

  if (d === "MAO" || d.includes("MAO") || d.includes("AGRICULTURE")) {
    return "MAO";
  }

  if (d === "MHO" || d.includes("MHO") || d.includes("HEALTH")) {
    return "MHO";
  }

  return null;
}

/* ---------------- Simple status updater for normal tables ---------------- */
function updateStatus(res, table, idCol, idVal, statusCol, statusVal) {
  const sql = `UPDATE ${table} SET ${statusCol} = ?, updated_at = NOW() WHERE ${idCol} = ?`;
  db.query(sql, [statusVal, idVal], (err, result) => {
    if (err) {
      console.error("[newEmployeeDash] updateStatus error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update status." });
    }
    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Record not found." });
    }
    return res.json({ success: true, message: `Moved to ${statusVal}` });
  });
}

/* ---------------- Status updater for business_lgu_requirements_status ----- */
function updateBusinessLguStatus(res, applicationId, officeName, statusVal) {
  const sql = `
    UPDATE business_lgu_requirements_status
    SET status = ?, updated_at = NOW()
    WHERE application_id = ? AND office_name = ?
  `;
  db.query(sql, [statusVal, applicationId, officeName], (err, result) => {
    if (err) {
      console.error("[newEmployeeDash] updateBusinessLguStatus error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update LGU status." });
    }
    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message:
          "LGU requirement row not found for this office/application.",
      });
    }
    return res.json({
      success: true,
      message: `LGU status moved to ${statusVal}`,
    });
  });
}

/* ===================================================================
   LIST (ONLY BUSINESS PERMITS) – for new employee dashboard
=================================================================== */

/**
 * For BPLO / Business office:
 *   - list is based on business_permits.status (same as old EmployeeDashboard)
 *
 * For MEO / MAO / MHO:
 *   - list is based on business_lgu_requirements_status for their office_name
 *   - status shown in dashboard = `business_lgu_requirements_status.status`
 */
exports.getAllBusinessPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const dept = req.session.user.department || "";
  const isBusinessCore = isBusinessCoreDept(dept);
  const officeName = getLguOfficeNameForDept(dept);

  // 1) BPLO / Business – same as old behavior: use main business_permits.status
  if (isBusinessCore || !officeName) {
    const sql = `
      SELECT b.*, l.email
      FROM business_permits b
      LEFT JOIN tb_logins l ON b.user_id = l.user_id
      ORDER BY b.created_at DESC
    `;
    db.query(sql, (err, rows) => {
      if (err) {
        console.error("Error retrieving business permits:", err);
        return res.status(500).json({
          success: false,
          message: "Error retrieving business permits",
        });
      }

      const applications = rows.map((r) => ({
        id: r.BusinessP_id,
        type: "Business Permit",
        name: `${r.first_name || ""} ${r.middle_name || ""} ${
          r.last_name || ""
        }`
          .replace(/\s+/g, " ")
          .trim(),
        status: r.status || "pending", // main status
        submitted: r.created_at,
        email: r.email,
        user_id: r.user_id,
        // keep both possible column names if they exist
        applicationType:
          r.applicationType ||
          r.application_type ||
          r.application_type_of_business,
        ...r,
      }));

      return res.json({ success: true, applications });
    });
    return;
  }

  // 2) MEO / MAO / MHO – based on business_lgu_requirements_status
  const sql = `
  SELECT
    s.id AS lgu_status_id,
    s.application_id,
    s.requirement_key,
    s.office_name,
    s.status AS lgu_status,
    s.remarks AS lgu_remarks,
    s.pdf_path AS lgu_pdf_path,
    s.updated_at AS lgu_updated_at,

    b.BusinessP_id,
    b.business_name,
    b.first_name,
    b.middle_name,
    b.last_name,
    b.application_type AS applicationType,
    b.status AS main_status,
    b.created_at,
    b.user_id,

    l.email
  FROM business_lgu_requirements_status s
  JOIN business_permits b ON s.application_id = b.BusinessP_id
  LEFT JOIN tb_logins l ON b.user_id = l.user_id
  WHERE s.office_name = ?
  ORDER BY b.created_at DESC
`;

  db.query(sql, [officeName], (err, rows) => {
    if (err) {
      console.error("Error retrieving LGU business permits:", err);
      return res.status(500).json({
        success: false,
        message: "Error retrieving business permits",
      });
    }

    const applications = rows.map((r) => ({
      id: r.BusinessP_id,
      type: "Business Permit",
      name: `${r.first_name || ""} ${r.middle_name || ""} ${
        r.last_name || ""
      }`
        .replace(/\s+/g, " ")
        .trim(),
      // dashboard status = LGU status for this office
      status: r.lgu_status || "pending",
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,

      // extra LGU fields if you need them on FE
      lgu_status_id: r.lgu_status_id,
      requirement_key: r.requirement_key,
      lgu_pdf_path: r.lgu_pdf_path,
      lgu_remarks: r.lgu_remarks,

      applicationType:
        r.applicationType ||
        r.application_type ||
        r.application_type_of_business,
      ...r,
    }));

    return res.json({ success: true, applications });
  });
};

/* ===================================================================
   GET BY ID (Business Permit only)
=================================================================== */

exports.getBusinessPermitById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT b.*, l.email
    FROM business_permits b
    LEFT JOIN tb_logins l ON b.user_id = l.user_id
    WHERE b.BusinessP_id = ? LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error retrieving business permit:", err);
      return res.status(500).json({
        success: false,
        message: "Error retrieving business permit",
      });
    }
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Business permit not found" });
    }

    return res.json({ success: true, application: rows[0] });
  });
};

/* ===================================================================
   STATUS CHANGES (PENDING / IN-REVIEW / ON-HOLD / APPROVED)
   Business Permit ONLY – works both for BPLO and MEO/MAO/MHO
=================================================================== */

// ACCEPT → IN-REVIEW
exports.acceptBusiness = (req, res) => {
  if (!requireAuth(req, res)) return;

  const dept = req.session.user.department || "";
  const isBusinessCore = isBusinessCoreDept(dept);
  const officeName = getLguOfficeNameForDept(dept);

  // BPLO: update main business_permits.status
  if (isBusinessCore || !officeName) {
    return updateStatus(
      res,
      "business_permits",
      "BusinessP_id",
      req.params.id,
      "status",
      "in-review"
    );
  }

  // MEO / MAO / MHO: update LGU status only
  return updateBusinessLguStatus(res, req.params.id, officeName, "in-review");
};

// MOVE TO ON-HOLD
exports.businessToOnHold = (req, res) => {
  if (!requireAuth(req, res)) return;

  const dept = req.session.user.department || "";
  const isBusinessCore = isBusinessCoreDept(dept);
  const officeName = getLguOfficeNameForDept(dept);

  if (isBusinessCore || !officeName) {
    return updateStatus(
      res,
      "business_permits",
      "BusinessP_id",
      req.params.id,
      "status",
      "on-hold"
    );
  }

  return updateBusinessLguStatus(res, req.params.id, officeName, "on-hold");
};

// MOVE TO APPROVED
exports.businessToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;

  const dept = req.session.user.department || "";
  const isBusinessCore = isBusinessCoreDept(dept);
  const officeName = getLguOfficeNameForDept(dept);

  if (isBusinessCore || !officeName) {
    return updateStatus(
      res,
      "business_permits",
      "BusinessP_id",
      req.params.id,
      "status",
      "approved"
    );
  }

  return updateBusinessLguStatus(res, req.params.id, officeName, "approved");
};

// MOVE BACK TO PENDING (from On Hold)
exports.businessToPending = (req, res) => {
  if (!requireAuth(req, res)) return;

  const dept = req.session.user.department || "";
  const isBusinessCore = isBusinessCoreDept(dept);
  const officeName = getLguOfficeNameForDept(dept);

  if (isBusinessCore || !officeName) {
    return updateStatus(
      res,
      "business_permits",
      "BusinessP_id",
      req.params.id,
      "status",
      "pending"
    );
  }

  return updateBusinessLguStatus(res, req.params.id, officeName, "pending");
};
// Add this function to handle generic status updates
exports.updateRequirementStatus = async (req, res) => {
  try {
    const { id } = req.params; // application ID from URL
    const { requirement_key, status } = req.body;
    
    console.log(`Updating requirement: ${requirement_key} to status: ${status} for app: ${id}`);
    
    if (!requirement_key || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "requirement_key and status are required" 
      });
    }
    
    // Get department from session
    const dept = req.session.user?.department || "";
    
    // Determine office name based on requirement key
    let officeName = '';
    if (requirement_key.includes('zoning') || requirement_key.includes('occupancy')) {
      officeName = 'MPDO';
    } else if (requirement_key.includes('environment') || requirement_key.includes('market')) {
      officeName = 'MEO';
    } else if (requirement_key.includes('sanitary')) {
      officeName = 'MHO';
    } else if (requirement_key.includes('river') || requirement_key.includes('agriculture')) {
      officeName = 'MAO';
    }
    
    if (!officeName) {
      return res.status(400).json({ 
        success: false, 
        message: "Could not determine office for this requirement" 
      });
    }
    
    // Check if user has access to update this requirement
    const userDept = dept.toLowerCase();
    const hasAccess = (
      (officeName === 'MPDO' && userDept.includes('mpdo')) ||
      (officeName === 'MEO' && (userDept.includes('meo') || userDept.includes('environment'))) ||
      (officeName === 'MHO' && (userDept.includes('mho') || userDept.includes('health'))) ||
      (officeName === 'MAO' && (userDept.includes('mao') || userDept.includes('agriculture')))
    );
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update this requirement" 
      });
    }
    
    // Check if record exists
    const existing = await q(
      `SELECT id FROM business_lgu_requirements_status 
       WHERE application_id = ? AND requirement_key = ? AND office_name = ?`,
      [id, requirement_key, officeName]
    );
    
    if (existing.length > 0) {
      // Update existing record
      await q(
        `UPDATE business_lgu_requirements_status 
         SET status = ?, updated_at = NOW() 
         WHERE id = ?`,
        [status, existing[0].id]
      );
    } else {
      // Insert new record
      await q(
        `INSERT INTO business_lgu_requirements_status 
         (application_id, requirement_key, office_name, status, updated_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [id, requirement_key, officeName, status]
      );
    }
    
    return res.json({ 
      success: true, 
      message: "Status updated successfully" 
    });
    
  } catch (error) {
    console.error("updateRequirementStatus error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update status" 
    });
  }
};