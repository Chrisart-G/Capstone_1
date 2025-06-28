const db = require('../db/dbconnect');

// Create/Submit Cedula
exports.submitCedula = async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session?.user?.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }

      const userId = req.session.user.user_id;
      const {
        name,
        address,
        placeOfBirth,
        dateOfBirth,
        profession,
        yearlyIncome,
        purpose,
        sex,
        status,
        tin
      } = req.body;

      // Validate required fields
      if (!name || !address || !placeOfBirth || !dateOfBirth || !profession || 
          !yearlyIncome || !purpose || !sex || !status || !tin) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate sex enum
      if (!['male', 'female'].includes(sex)) {
        return res.status(400).json({ message: "Invalid sex value" });
      }

      // Validate status enum
      if (!['single', 'married', 'widowed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      // Validate yearly income is a number
      if (isNaN(yearlyIncome) || parseFloat(yearlyIncome) < 0) {
        return res.status(400).json({ message: "Invalid yearly income" });
      }

      const sql = `INSERT INTO tbl_cedula (
        name, address, place_of_birth, date_of_birth, profession, 
        yearly_income, purpose, sex, status, tin, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        name,
        address,
        placeOfBirth,
        dateOfBirth,
        profession,
        parseFloat(yearlyIncome),
        purpose,
        sex,
        status,
        tin,
        userId
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Cedula insert failed:", err);
          return res.status(500).json({ 
            message: "Failed to submit cedula application", 
            error: err.message 
          });
        }

        res.status(201).json({
          success: true,
          message: "Cedula application submitted successfully",
          cedulaId: result.insertId
        });
      });

    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ 
        message: "Unexpected server error", 
        error: err.message 
      });
    }
};
    // this function to fetch the cedula app in employee end 
//use in employee dashboard 
exports.getAllCedulaForEmployee = (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const sql = `
    SELECT c.*, l.email
    FROM tbl_cedula c
    LEFT JOIN tb_logins l ON c.user_id = l.user_id
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching cedula applications:", err);
      return res.status(500).json({ success: false, message: "Error retrieving cedula applications" });
    }

    const transformedResults = results.map(app => ({
      id: app.id,
      type: 'Cedula',
      name: app.name,
      status: app.status || 'pending',
      submitted: app.created_at,
      email: app.email,
      user_id: app.user_id,
      ...app
    }));

    res.json({ success: true, applications: transformedResults });
  });
};

// Get single Cedula by ID
exports.getCedulaById = (req, res) => {
  const cedulaId = req.params.id;
  console.log("📥 Cedula ID received:", cedulaId);

  // Check session
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const sql = `
    SELECT c.*, l.email
    FROM tbl_cedula c
    LEFT JOIN tb_logins l ON c.user_id = l.user_id
    WHERE c.id = ?
  `;

  db.query(sql, [cedulaId], (err, results) => {
    if (err) {
      console.error("❌ SQL Error fetching cedula details:", err);
      return res.status(500).json({ success: false, message: "Server error retrieving cedula details" });
    }

    if (!results || results.length === 0) {
      console.warn("⚠️ No Cedula record found for ID:", cedulaId);
      return res.status(404).json({ success: false, message: "Cedula application not found" });
    }

    const cedula = results[0];

    // Build response object
    const transformedCedula = {
      id: cedula.id,
      type: 'Cedula', // ✅ Important for modal condition
      name: cedula.name,
      address: cedula.address,
      place_of_birth: cedula.place_of_birth,
      date_of_birth: cedula.date_of_birth,
      profession: cedula.profession,
      yearly_income: cedula.yearly_income,
      purpose: cedula.purpose,
      sex: cedula.sex,
      civil_status: cedula.status, // renamed for frontend label clarity
      tin: cedula.tin,
      created_at: cedula.created_at,
      updated_at: cedula.updated_at,
      email: cedula.email,
      user_id: cedula.user_id,
      status: cedula.status || 'pending'
    };

    console.log("✅ Cedula details sent:", transformedCedula);

    return res.json({ success: true, application: transformedCedula });
  });
};



// Accept Cedula
exports.updateCedulaStatus = (req, res) => {
  const cedulaId = req.params.id;
  const { status } = req.body;

  console.log("🔥 Body received from frontend:", req.body);

  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  if (!status) {
    console.warn("⚠️ Missing status in request body.");
    return res.status(400).json({ success: false, message: "Status is required." });
  }

  const sql = `UPDATE tbl_cedula SET application_status = ?, updated_at = NOW() WHERE id = ?`;

  db.query(sql, [status, cedulaId], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ success: false, message: "Error updating cedula status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula application not found" });
    }

    res.json({ success: true, message: "Cedula application status updated successfully" });
  });
};



//-----------------------------------------------------------------------------------------
// to get the data to fetch in document tracking 
exports.getCedulasForTracking = async (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.user_id;

    const sql = `
      SELECT 
        id,
        name,
        address,
        place_of_birth,
        date_of_birth,
        profession,
        yearly_income,
        purpose,
        sex,
        status,
        tin,
        application_status,
        created_at,
        updated_at
      FROM tbl_cedula 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get cedulas for tracking failed:", err);
        return res.status(500).json({
          message: "Failed to retrieve cedula records",
          error: err.message
        });
      }

      res.status(200).json({
        success: true,
        cedulas: results
      });
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Unexpected server error",
      error: err.message
    });
  }
};
// Get all cedula records for the logged-in not use
exports.getUserCedulas = async (req, res) => {
    try {
      if (!req.session?.user?.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }

      const userId = req.session.user.user_id;

      const sql = `SELECT * FROM tbl_cedula WHERE user_id = ? ORDER BY created_at DESC`;

      db.query(sql, [userId], (err, results) => {
        if (err) {
          console.error("Get cedulas failed:", err);
          return res.status(500).json({ 
            message: "Failed to retrieve cedula records", 
            error: err.message 
          });
        }

        res.status(200).json({
          success: true,
          cedulas: results
        });
      });

    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ 
        message: "Unexpected server error", 
        error: err.message 
      });
  }
};


// Update cedula not use
exports.updateCedula = async (req, res) => {
    try {
      if (!req.session?.user?.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }

      const userId = req.session.user.user_id;
      const cedulaId = req.params.id;
      const {
        name,
        address,
        placeOfBirth,
        dateOfBirth,
        profession,
        yearlyIncome,
        purpose,
        sex,
        status,
        tin
      } = req.body;

      // Validate required fields
      if (!name || !address || !placeOfBirth || !dateOfBirth || !profession || 
          !yearlyIncome || !purpose || !sex || !status || !tin) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const sql = `UPDATE tbl_cedula SET 
        name = ?, address = ?, place_of_birth = ?, date_of_birth = ?, 
        profession = ?, yearly_income = ?, purpose = ?, sex = ?, status = ?, tin = ?
        WHERE id = ? AND user_id = ?`;

      const values = [
        name, address, placeOfBirth, dateOfBirth, profession,
        parseFloat(yearlyIncome), purpose, sex, status, tin, cedulaId, userId
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Cedula update failed:", err);
          return res.status(500).json({ 
            message: "Failed to update cedula application", 
            error: err.message 
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Cedula record not found" });
        }

        res.status(200).json({
          success: true,
          message: "Cedula application updated successfully"
        });
      });

    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ 
        message: "Unexpected server error", 
        error: err.message 
      });
  }
};

// Delete cedula not use
exports.deleteCedula = async (req, res) => {
    try {
      if (!req.session?.user?.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }

      const userId = req.session.user.user_id;
      const cedulaId = req.params.id;

      const sql = `DELETE FROM tbl_cedula WHERE id = ? AND user_id = ?`;

      db.query(sql, [cedulaId, userId], (err, result) => {
        if (err) {
          console.error("Cedula delete failed:", err);
          return res.status(500).json({ 
            message: "Failed to delete cedula application", 
            error: err.message 
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Cedula record not found" });
        }

        res.status(200).json({
          success: true,
          message: "Cedula application deleted successfully"
        });
      });

    } catch (err) {
     console.error("Unexpected error:", err);
      res.status(500).json({ 
        message: "Unexpected server error", 
        error: err.message 
      });
    }
    };
// In cedulaController.js
exports.moveCedulaToInProgress = (req, res) => {
  const { id } = req.body;

  // Session check
  if (!req.session?.user?.user_id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Input validation
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ success: false, message: "Valid id is required" });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'in-progress', updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ success: false, message: "Database update failed" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula application not found" });
    }

    return res.json({ success: true, message: "Cedula moved to in-progress successfully" });
  });
};






exports.moveCedulaToRequirementsCompleted = (req, res) => {
  const { cedulaId } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `UPDATE tbl_cedula SET application_status = 'requirements-completed', updated_at = NOW() WHERE id = ?`;

  db.query(sql, [cedulaId], (err, result) => {
    if (err) {
      console.error("Failed:", err);
      return res.status(500).json({ success: false, message: "Failed to update" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cedula not found" });
    }

    return res.json({ success: true, message: "Cedula moved to requirements-completed" });
  });
};
// Move to Approved
exports.moveCedulaToApproved = (req, res) => {
  const { cedulaId } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'approved', updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [cedulaId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to approve" });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Cedula not found" });
    return res.json({ success: true, message: "Cedula approved" });
  });
};

// Set Pickup Schedule (Ready for Pickup)
exports.moveCedulaToReadyForPickup = (req, res) => {
  const { cedulaId, schedule } = req.body;

  if (!req.session?.user?.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const sql = `
    UPDATE tbl_cedula 
    SET application_status = 'ready-for-pickup', pickup_schedule = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [schedule, cedulaId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cedula not found' });
    return res.json({ success: true, message: 'Cedula set to ready for pickup' });
  });
};

