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
// this section for get user login by session to fetch the data 
exports.GetUserInfo = (req, res) => {
    // Check if user is logged in
    if (!req.session.user || !req.session.user.user_id) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }
    
    // Get user ID from session
    const userId = req.session.user.user_id;
    
    // Fixed query to use first_name and last_name instead of full_name
    const query = `
        SELECT l.user_id, l.email, l.role, 
               CONCAT(e.first_name, ' ', e.last_name) as fullName, 
               e.position, e.department
        FROM tb_logins l
        LEFT JOIN tbl_employeeinformation e ON l.user_id = e.user_id
        WHERE l.user_id = ?
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'An error occurred while fetching user data' 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Return userData instead of user for consistency
        return res.json({ 
            success: true, 
            userData: results[0] 
        });
    });
};




// this section for login and log out session for each 
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
