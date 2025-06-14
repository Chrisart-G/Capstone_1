const db = require('../db/dbconnect');
const bcrypt = require('bcrypt');

exports.Signup = async (req, res) => {
  try {
    const { email, password, fullName, address, phoneNumber } = req.body;

    db.query('SELECT email FROM tb_logins WHERE email = ?', [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error during signup" });

      if (result.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = 'citizen';

      // Insert into tb_logins
      const loginQuery = "INSERT INTO tb_logins (email, password, role) VALUES (?, ?, ?)";
      db.query(loginQuery, [email, hashedPassword, role], (err, loginResult) => {
        if (err) return res.status(500).json({ message: "Error during login insert" });

        const userId = loginResult.insertId;

        // Insert into tbl_user_info
        const infoQuery = `
          INSERT INTO tbl_user_info (user_id, full_name, address, phone_number)
          VALUES (?, ?, ?, ?)
        `;
        db.query(infoQuery, [userId, fullName, address, phoneNumber], (err, infoResult) => {
          if (err) return res.status(500).json({ message: "Error inserting user info" });

          return res.status(201).json({ message: "Signup successful", userId });
        });
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
