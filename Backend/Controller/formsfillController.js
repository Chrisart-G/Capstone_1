const db = require('../db/dbconnect');

exports.getUserInfo = (req, res) => {
    console.log("Session in getUserInfo:", req.session);
    console.log("User in session:", req.session?.user);
    console.log("User ID in session:", req.session?.user?.user_id);

    if (!req.session || !req.session.user || !req.session.user.user_id) {
        console.log("User not authenticated or missing user_id");
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    
    // Get user_id from session
    const userId = req.session.user.user_id;
    console.log("Using user_id for user info:", userId);

    const sql = `
        SELECT ui.firstname, ui.middlename, ui.lastname, ui.phone_number, l.email
        FROM tbl_user_info ui
        LEFT JOIN tb_logins l ON ui.user_id = l.user_id
        WHERE ui.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user info:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving user information", 
                error: err.message 
            });
        }

        if (results.length === 0) {
            console.log("No user info found for user_id:", userId);
            return res.status(404).json({ 
                success: false, 
                message: "User information not found" 
            });
        }

        const userInfo = results[0];
        
        // Since the database now has separate columns, we can directly use them
        const userData = {
            firstName: userInfo.firstname || '',
            middleName: userInfo.middlename || '',
            lastName: userInfo.lastname || '',
            email: userInfo.email || '',
            phoneNumber: userInfo.phone_number || ''
        };

        console.log("Returning user data:", userData);
        res.json({ 
            success: true, 
            userInfo: userData 
        });
    });
};

// this line of code are for electrical permit auto fill -------------------------------------//
exports.getUserInfoForElectrical = (req, res) => {
    console.log("Session in getUserInfoForElectrical:", req.session);
    console.log("User in session:", req.session?.user);
    console.log("User ID in session:", req.session?.user?.user_id);

    if (!req.session || !req.session.user || !req.session.user.user_id) {
        console.log("User not authenticated or missing user_id");
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    
    // Get user_id from session
    const userId = req.session.user.user_id;
    console.log("Using user_id for electrical user info:", userId);

    const sql = `
        SELECT ui.firstname, ui.middlename, ui.lastname, ui.address, ui.phone_number, l.email
        FROM tbl_user_info ui
        LEFT JOIN tb_logins l ON ui.user_id = l.user_id
        WHERE ui.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user info for electrical:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving user information", 
                error: err.message 
            });
        }

        if (results.length === 0) {
            console.log("No user info found for user_id:", userId);
            return res.status(404).json({ 
                success: false, 
                message: "User information not found" 
            });
        }

        const userInfo = results[0];
        
        // Parse address for different fields if needed
        const addressParts = (userInfo.address || '').split(',').map(part => part.trim());
        
        const userData = {
            firstName: userInfo.firstname || '',
            middleName: userInfo.middlename || '',
            lastName: userInfo.lastname || '',
            fullAddress: userInfo.address || '',
            phoneNumber: userInfo.phone_number || '',
            email: userInfo.email || '',
            // You can parse address into components if needed
            addressStreet: addressParts[0] || '',
            addressBarangay: addressParts[1] || '',
            addressCity: addressParts[2] || 'Hinigaran' // Default city
        };

        console.log("Returning electrical user data:", userData);
        res.json({ 
            success: true, 
            userInfo: userData 
        });
    });
};

// this line of code are for cedula permit auto fill -------------------------------------//
exports.getUserInfoForCedula = (req, res) => {
    console.log("Session in getUserInfoForCedula:", req.session);
    console.log("User in session:", req.session?.user);
    console.log("User ID in session:", req.session?.user?.user_id);

    if (!req.session || !req.session.user || !req.session.user.user_id) {
        console.log("User not authenticated or missing user_id");
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    
    // Get user_id from session
    const userId = req.session.user.user_id;
    console.log("Using user_id for cedula user info:", userId);

    const sql = `
        SELECT ui.firstname, ui.middlename, ui.lastname, ui.address, ui.phone_number, l.email
        FROM tbl_user_info ui
        LEFT JOIN tb_logins l ON ui.user_id = l.user_id
        WHERE ui.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user info for cedula:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error retrieving user information", 
                error: err.message 
            });
        }

        if (results.length === 0) {
            console.log("No user info found for user_id:", userId);
            return res.status(404).json({ 
                success: false, 
                message: "User information not found" 
            });
        }

        const userInfo = results[0];
        
        // Format name for cedula (full name)
        const fullName = [userInfo.firstname, userInfo.middlename, userInfo.lastname]
            .filter(name => name && name.trim()) // Remove empty/null values
            .join(' ');
        
        const userData = {
            name: fullName,
            address: userInfo.address || '',
            email: userInfo.email || '',
            phoneNumber: userInfo.phone_number || ''
        };

        console.log("Returning cedula user data:", userData);
        res.json({ 
            success: true, 
            userInfo: userData 
        });
    });
};