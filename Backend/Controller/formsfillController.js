// Controller/formsfillController.js
const db = require('../db/dbconnect');

exports.getUserInfo = (req, res) => {
  console.log("Session in getUserInfo:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;
  console.log("Using user_id for user info:", userId);

  const sql = `
      SELECT ui.firstname,
             ui.middlename,
             ui.lastname,
             ui.address,
             ui.phone_number,
             l.email
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
        error: err.message,
      });
    }

    if (results.length === 0) {
      console.log("No user info found for user_id:", userId);
      return res.status(404).json({
        success: false,
        message: "User information not found",
      });
    }

    const userInfo = results[0];

    const userData = {
      firstName: userInfo.firstname || "",
      middleName: userInfo.middlename || "",
      lastName: userInfo.lastname || "",
      email: userInfo.email || "",
      phoneNumber: userInfo.phone_number || "",
      address: userInfo.address || "",
    };

    console.log("Returning user data:", userData);
    res.json({
      success: true,
      userInfo: userData,
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

// this line of code are for fencing permit auto fill -------------------------------------//
exports.getUserInfoForFencing = (req, res) => {
  console.log("Session in getUserInfoForFencing:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;
  console.log("Using user_id for fencing user info:", userId);

  const sql = `
      SELECT ui.firstname, ui.middlename, ui.lastname, ui.address, ui.phone_number, l.email
      FROM tbl_user_info ui
      LEFT JOIN tb_logins l ON ui.user_id = l.user_id
      WHERE ui.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user info for fencing:", err);
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

    const rawAddress = userInfo.address || '';
    const addressParts = rawAddress
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    const middleInitial =
      (userInfo.middlename || '').trim().charAt(0).toUpperCase() || '';

    const phone = userInfo.phone_number || '';

    const userData = {
      // name
      lastName: userInfo.lastname || '',
      firstName: userInfo.firstname || '',
      middleInitial,

      // owner / applicant address pieces
      street: addressParts[0] || '',
      // barangay is manual in the form now, so we don't auto-fill it
      barangay: '',
      cityMunicipality: addressParts[2] || 'Hinigaran', // default city

      // contact
      telephoneNo: phone,       // <- this is tbl_user_info.phone_number
      phoneNumber: phone,       // optional alias, if you need later

      // extras
      fullAddress: rawAddress,
      email: userInfo.email || ''
    };

    console.log("Returning fencing user data:", userData);
    res.json({
      success: true,
      userInfo: userData
    });
  });
};

// this line of code are for electronics permit auto fill -------------------------------------//
exports.getUserInfoForElectronics = (req, res) => {
  console.log("Session in getUserInfoForElectronics:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;
  console.log("Using user_id for electronics user info:", userId);

  const sql = `
      SELECT ui.firstname, ui.middlename, ui.lastname, ui.address, ui.phone_number, l.email
      FROM tbl_user_info ui
      LEFT JOIN tb_logins l ON ui.user_id = l.user_id
      WHERE ui.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user info for electronics:", err);
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

    const rawAddress = userInfo.address || '';
    const addressParts = rawAddress
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    const middleInitial =
      (userInfo.middlename || '').trim().charAt(0).toUpperCase() || '';

    const userData = {
      // name
      lastName: userInfo.lastname || '',
      firstName: userInfo.firstname || '',
      middleInitial,

      // owner address pieces
      ownerStreet: addressParts[0] || '',
      ownerBarangay: addressParts[1] || '',
      ownerCity: addressParts[2] || 'Hinigaran', // default city if missing

      // contact
      telephoneNo: userInfo.phone_number || '',

      // extras if ever needed
      fullAddress: rawAddress,
      email: userInfo.email || ''
    };

    console.log("Returning electronics user data:", userData);
    res.json({
      success: true,
      userInfo: userData
    });
  });
};

// this line of code is for building permit auto fill -------------------------------------//
exports.getUserInfoForBuilding = (req, res) => {
  console.log("Session in getUserInfoForBuilding:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;
  console.log("Using user_id for building user info:", userId);

  const sql = `
      SELECT ui.firstname, ui.middlename, ui.lastname, ui.address, ui.phone_number, l.email
      FROM tbl_user_info ui
      LEFT JOIN tb_logins l ON ui.user_id = l.user_id
      WHERE ui.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user info for building:", err);
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

    const rawAddress = userInfo.address || '';
    const addressParts = rawAddress
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    const middleInitial =
      (userInfo.middlename || '').trim().charAt(0).toUpperCase() || '';

    const userData = {
      // name
      lastName: userInfo.lastname || '',
      firstName: userInfo.firstname || '',
      middleInitial,

      // owner / applicant address pieces (for building form fields)
      street: addressParts[0] || '',
      barangay: addressParts[1] || '',
      cityMunicipality: addressParts[2] || 'Hinigaran', // default city

      // contact
      telephoneNo: userInfo.phone_number || '',

      // extra if ever needed
      fullAddress: rawAddress,
      email: userInfo.email || ''
    };

    console.log("Returning building user data:", userData);
    res.json({
      success: true,
      userInfo: userData
    });
  });
};

// this line of code is for plumbing permit auto fill -------------------------------------//
exports.getUserInfoForPlumbing = (req, res) => {
  console.log("Session in getUserInfoForPlumbing:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;
  console.log("Using user_id for plumbing user info:", userId);

  const sql = `
      SELECT ui.firstname, ui.middlename, ui.lastname, ui.address, ui.phone_number, l.email
      FROM tbl_user_info ui
      LEFT JOIN tb_logins l ON ui.user_id = l.user_id
      WHERE ui.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user info for plumbing:", err);
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

    const rawAddress = userInfo.address || '';
    const addressParts = rawAddress
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    const middleInitial =
      (userInfo.middlename || '').trim().charAt(0).toUpperCase() || '';

    const userData = {
      // name
      lastName: userInfo.lastname || '',
      firstName: userInfo.firstname || '',
      middleInitial,

      // address pieces mapped to plumbing fields
      addressStreet: addressParts[0] || '',
      addressBarangay: addressParts[1] || '',
      addressCity: addressParts[2] || 'Hinigaran', // default

      // contact
      telephoneNo: userInfo.phone_number || '',

      // optional extra info
      fullAddress: rawAddress,
      email: userInfo.email || ''
    };

    console.log("Returning plumbing user data:", userData);
    res.json({
      success: true,
      userInfo: userData
    });
  });
};

// ==================== BUSINESS PERMIT AUTO-FILL (BUSINESS INFO) ==================== //
// ==================== BUSINESS PERMIT AUTO-FILL (BUSINESS INFO) ==================== //
exports.getBusinessInfoForBusinessPermit = (req, res) => {
  console.log("Session in getBusinessInfoForBusinessPermit:", req.session);
  console.log("User in session:", req.session?.user);
  console.log("User ID in session:", req.session?.user?.user_id);

  if (!req.session || !req.session.user || !req.session.user.user_id) {
    console.log("User not authenticated or missing user_id");
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.user_id;
  console.log("Using user_id for business info:", userId);

  // ⚠️ IMPORTANT: only use columns that actually exist in tbl_user_business_info
  const sql = `
      SELECT
        business_name,
        trade_name,
        business_address,
        business_postal_code,
        business_email,
        business_telephone,
        business_mobile,
        lessor_full_name,
        lessor_address,
        lessor_phone,
        lessor_email,
        monthly_rental,
        business_type,
        tin_no,
        registration_no
      FROM tbl_user_business_info
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching business info:", err);
      return res.status(500).json({
        success: false,
        message: "Error retrieving business information",
        error: err.message,
      });
    }

    if (results.length === 0) {
      console.log("No business info found for user_id:", userId);
      return res.status(404).json({
        success: false,
        message: "Business information not found",
      });
    }

    const row = results[0];

    // Map DB columns -> frontend form field names
    const businessData = {
      businessName: row.business_name || "",
      tradeName: row.trade_name || "",

      businessAddress: row.business_address || "",
      businessPostalCode: row.business_postal_code || "",
      businessEmail: row.business_email || "",
      businessTelephone: row.business_telephone || "",
      businessMobile: row.business_mobile || "",

      lessorName: row.lessor_full_name || "",
      lessorAddress: row.lessor_address || "",
      lessorPhone: row.lessor_phone || "",
      lessorEmail: row.lessor_email || "",
      monthlyRental:
        row.monthly_rental === null || row.monthly_rental === undefined
          ? ""
          : String(row.monthly_rental),

      businessType: row.business_type || "",
      tinNo: row.tin_no || "",
      registrationNo: row.registration_no || "",
    };

    console.log("Returning business data for permit form:", businessData);

    res.json({
      success: true,
      businessInfo: businessData,
    });
  });
};
