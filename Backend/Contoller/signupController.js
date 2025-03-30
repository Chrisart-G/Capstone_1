const db = require('../dbconnect');
const bcrypt = require('bcrypt'); 

exports.Signup = async (req, res) => {
    try {
        const email = req.body.email;

        db.query('SELECT email FROM tb_logins WHERE email = ?', [email], async (err, result) => {
            if (err) {
                console.error("Error checking for existing email:", err);
                return res.status(500).json({ message: "Database error during signup" }); 
            }

            if (result.length > 0) {
                return res.status(409).json({ message: "Email already exists" }); // 409 Conflict
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            const sql = "INSERT INTO tb_logins (email, password) VALUES (?, ?)";
            const values = [email, hashedPassword];

            db.query(sql, values, (err, data) => {
                if (err) {
                    console.error("Signup error:", err);
                    return res.status(500).json({ message: "Error during signup" });
                }
                return res.status(201).json({ message: "Signup successful", data }); 
            });
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Error during signup" });
    }
};