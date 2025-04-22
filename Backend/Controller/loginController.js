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
                    // Save the correct user_id to session
                    req.session.user = {
                        user_id: user.user_id,
                        email: user.email,
                        role: user.role
                    };

                    // Explicitly save the session
                    req.session.save(err => {
                        if (err) {
                            console.error("Session save error:", err);
                            return res.status(500).json({ message: "Session error" });
                        }
                        
                        // Add debug logging
                        console.log("Session saved with user_id:", user.user_id);
                        
                        return res.json({
                            message: "Login successful",
                            user: req.session.user
                        });
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

exports.CheckSession = (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
};

exports.Logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
    });
};
