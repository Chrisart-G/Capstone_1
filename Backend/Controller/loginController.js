const db = require('../db/dbconnect');
const bcrypt = require('bcrypt'); 

exports.Login = (req, res) => {
    const sql = "SELECT * FROM tb_logins WHERE email = ?";
    const values = [req.body.email];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error("Login error:", err); 
            return res.json({ message: "Error during login attempt", error: err });
        }

        if (data.length > 0) {
            const user = data[0];

            bcrypt.compare(req.body.password, user.password, (bcryptErr, isMatch) => {
                if (bcryptErr) {
                    console.error("Bcrypt error:", bcryptErr);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (isMatch) {
                    // Set session
                    req.session.user = {
                        id: user.id,
                        email: user.email,
                        role: user.role  // if you have a role field
                    };

                    return res.json({
                        message: "Login successful",
                        user: req.session.user
                    });
                } else {
                    return res.status(401).json({ message: "Invalid email or password" });
                }
            });
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    });
};

// Check if user session exists
exports.CheckSession = (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
};

// Logout and destroy session
exports.Logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.clearCookie("connect.sid"); // Optional: clear cookie
        res.json({ message: "Logged out successfully" });
    });
};
