const db = require('../db/dbconnect');
const bcrypt = require('bcrypt');

exports.Signup = async (req, res) => {
  try {
    const { email, password, firstname, middlename, lastname, address, phoneNumber } = req.body;

    // Check if email already exists
    db.query('SELECT email FROM tb_logins WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error("Database error during email check:", err);
        return res.status(500).json({ message: "Database error during signup" });
      }

      if (result.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'citizen';

        // Insert into tb_logins
        const loginQuery = "INSERT INTO tb_logins (email, password, role) VALUES (?, ?, ?)";
        db.query(loginQuery, [email, hashedPassword, role], (err, loginResult) => {
          if (err) {
            console.error("Error during login insert:", err);
            return res.status(500).json({ message: "Error during login insert" });
          }

          const userId = loginResult.insertId;

          // Insert into tbl_user_info with separate name fields
          const infoQuery = `
            INSERT INTO tbl_user_info (user_id, firstname, middlename, lastname, address, phone_number)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          // Handle middlename - if empty string, convert to null for database
          const middleNameValue = middlename && middlename.trim() !== '' ? middlename.trim() : null;
          
          db.query(infoQuery, [userId, firstname.trim(), middleNameValue, lastname.trim(), address.trim(), phoneNumber.trim()], (err, infoResult) => {
            if (err) {
              console.error("Error inserting user info:", err);
              return res.status(500).json({ message: "Error inserting user info" });
            }

            return res.status(201).json({ 
              message: "Signup successful", 
              userId,
              userInfo: {
                firstname: firstname.trim(),
                middlename: middleNameValue,
                lastname: lastname.trim(),
                address: address.trim(),
                phoneNumber: phoneNumber.trim()
              }
            });
          });
        });
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        return res.status(500).json({ message: "Error processing password" });
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};