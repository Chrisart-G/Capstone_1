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
                    
                    return res.json(user);
                } else {
                    
                    return res.status(401).json({ message: "Invalid email or password" });
                }
            });
        } else {
           
            return res.status(401).json({ message: "Invalid email or password" });
        }
    });
};