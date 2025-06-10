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
exports.getAllCedulaForEmployee = (req, res) => {
    console.log("Session in Cedula (Employee):", req.session);
    console.log("User in session:", req.session?.user);

    if (!req.session || !req.session.user) {
        console.log("User not authenticated");
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const sql = `
        SELECT c.id, c.name, c.address, c.place_of_birth, c.date_of_birth,
               c.profession, c.yearly_income, c.purpose, c.sex, c.status as marital_status,
               c.tin, c.user_id, c.created_at, c.updated_at, l.email
        FROM tbl_cedula c
        LEFT JOIN tb_logins l ON c.user_id = l.user_id
        ORDER BY c.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching cedula applications for employee:", err);
            return res.status(500).json({
                success: false,
                message: "Error retrieving cedula applications",
                error: err.message
            });
        }
        
        // Transform the data to match the expected format (same as electrical permits)
        const transformedResults = results.map(cedula => ({
            id: cedula.id,
            type: 'Cedula',
            name: cedula.name,
            status: cedula.application_status || 'pending', // Use application_status if exists, otherwise default to pending
            submitted: cedula.created_at,
            // Cedula specific fields
            address: cedula.address,
            place_of_birth: cedula.place_of_birth,
            date_of_birth: cedula.date_of_birth,
            profession: cedula.profession,
            yearly_income: cedula.yearly_income,
            purpose: cedula.purpose,
            sex: cedula.sex,
            marital_status: cedula.marital_status,
            tin: cedula.tin,
            email: cedula.email,
            user_id: cedula.user_id,
            created_at: cedula.created_at,
            updated_at: cedula.updated_at
        }));
        
        res.json({ success: true, applications: transformedResults });
    });
};

exports.getCedulaById = (req, res) => {
    const cedulaId = req.params.id;

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
            console.error("Error fetching cedula details:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving cedula details", 
                error: err.message 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Cedula application not found" 
            });
        }

        const cedula = results[0];
        const transformedCedula = {
            id: cedula.id,
            type: 'Cedula',
            name: cedula.name,
            status: cedula.application_status || 'pending', // Use application_status if exists
            submitted: cedula.created_at,
            ...cedula // Include all fields
        };

        res.json({ success: true, application: transformedCedula });
    });
};

// Add this controller for accepting cedula applications
exports.updateCedulaStatus = (req, res) => {
    const cedulaId = req.params.id;
    const { status } = req.body;

    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // If your cedula table doesn't have application_status column, you need to add it
    // OR modify this to update a different field that represents status
    const sql = `UPDATE tbl_cedula SET application_status = ?, updated_at = NOW() WHERE id = ?`;

    db.query(sql, [status, cedulaId], (err, result) => {
        if (err) {
            console.error("Error updating cedula status:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error updating cedula status", 
                error: err.message 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Cedula application not found" 
            });
        }

        res.json({ 
            success: true, 
            message: "Cedula status updated successfully" 
        });
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
        status as application_status,
        tin,
        status as cedula_status,
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

// Get a specific cedula id not use
exports.getCedulaById = async (req, res) => {
    try {
      if (!req.session?.user?.user_id) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
      }

      const userId = req.session.user.user_id;
      const cedulaId = req.params.id;

      const sql = `SELECT * FROM tbl_cedula WHERE id = ? AND user_id = ?`;

      db.query(sql, [cedulaId, userId], (err, results) => {
        if (err) {
          console.error("Get cedula failed:", err);
          return res.status(500).json({ 
            message: "Failed to retrieve cedula record", 
            error: err.message 
          });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Cedula record not found" });
        }

        res.status(200).json({
          success: true,
          cedula: results[0]
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