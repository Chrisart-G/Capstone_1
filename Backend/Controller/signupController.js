// Controller/signupController.js
const db = require("../db/dbconnect");
const bcrypt = require("bcrypt");
const { isSmsEnabled } = require("../services/smsService");

exports.Signup = async (req, res) => {
  try {
    const {
      email,
      password,
      firstname,
      middlename,
      lastname,
      address,
      phoneNumber,

      // account type + business info
      accountType, // 'citizen' | 'business_owner'
      businessName,
      businessTradeName,
      businessType, // 'single' | 'partnership' | 'corporation' | 'cooperative'
      businessTinNo,
      businessRegistrationNo,
      businessAddress,
      businessEmail,
      businessTelephone,
      businessMobile,
      businessPostalCode, // optional

      // NEW: lessor info from frontend
      lessorFullName,
      lessorAddress,
      lessorPhone,
      lessorEmail,
      lessorMonthlyRental,
    } = req.body;

    // basic server-side validation (common to both account types)
    if (
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !address ||
      !phoneNumber
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedFirst = String(firstname).trim();
    const trimmedLast = String(lastname).trim();
    const trimmedAddress = String(address).trim();
    const trimmedPhone = String(phoneNumber).trim();
    const middleNameValue =
      middlename && middlename.trim() !== "" ? middlename.trim() : null;

    // normalize account type
    const trimmedAccountType =
      accountType && accountType === "business_owner"
        ? "business_owner"
        : "citizen";

    // extra validation for business owners (minimal – only core items)
    if (trimmedAccountType === "business_owner") {
      if (!businessName || String(businessName).trim() === "") {
        return res.status(400).json({
          message: "Business Name is required for business owner accounts.",
        });
      }
      if (!businessAddress || String(businessAddress).trim() === "") {
        return res.status(400).json({
          message: "Business Address is required for business owner accounts.",
        });
      }
    }

    // trim business fields (optional)
    const trimmedBusinessName = businessName
      ? String(businessName).trim()
      : null;
    const trimmedBusinessTradeName = businessTradeName
      ? String(businessTradeName).trim()
      : null;
    const trimmedBusinessType = businessType
      ? String(businessType).trim()
      : null;
    const trimmedBusinessTinNo = businessTinNo
      ? String(businessTinNo).trim()
      : null;
    const trimmedBusinessRegNo = businessRegistrationNo
      ? String(businessRegistrationNo).trim()
      : null;
    const trimmedBusinessAddress = businessAddress
      ? String(businessAddress).trim()
      : null;
    const trimmedBusinessEmail = businessEmail
      ? String(businessEmail).trim()
      : null;
    const trimmedBusinessTelephone = businessTelephone
      ? String(businessTelephone).trim()
      : null;
    const trimmedBusinessMobile = businessMobile
      ? String(businessMobile).trim()
      : null;
    const trimmedBusinessPostalCode = businessPostalCode
      ? String(businessPostalCode).trim()
      : null;

    // trim lessor fields (optional)
    const trimmedLessorFullName = lessorFullName
      ? String(lessorFullName).trim()
      : null;
    const trimmedLessorAddress = lessorAddress
      ? String(lessorAddress).trim()
      : null;
    const trimmedLessorPhone = lessorPhone ? String(lessorPhone).trim() : null;
    const trimmedLessorEmail = lessorEmail ? String(lessorEmail).trim() : null;

    let monthlyRentalValue = null;
    if (
      lessorMonthlyRental !== undefined &&
      lessorMonthlyRental !== null &&
      String(lessorMonthlyRental).trim() !== ""
    ) {
      const parsed = parseFloat(String(lessorMonthlyRental));
      monthlyRentalValue = isNaN(parsed) ? null : parsed;
    }

    // 1) check email uniqueness
    db.query(
      "SELECT email FROM tb_logins WHERE email = ? LIMIT 1",
      [trimmedEmail],
      (err, emailRows) => {
        if (err) {
          console.error("Database error during email check:", err);
          return res
            .status(500)
            .json({ message: "Database error during signup (email check)." });
        }
        if (emailRows.length > 0) {
          return res.status(409).json({ message: "Email already exists" });
        }

        // 2) check phone number uniqueness
        db.query(
          "SELECT phone_number FROM tbl_user_info WHERE phone_number = ? LIMIT 1",
          [trimmedPhone],
          async (err2, phoneRows) => {
            if (err2) {
              console.error("Database error during phone check:", err2);
              return res.status(500).json({
                message: "Database error during signup (phone check).",
              });
            }
            if (phoneRows.length > 0) {
              return res
                .status(409)
                .json({ message: "Phone number is already in use." });
            }

            // 3) create login + user_info (+ optional business info)
            try {
              const hashedPassword = await bcrypt.hash(password, 10);

              // keep existing role behaviour
              const role = "citizen";

              const loginQuery =
                "INSERT INTO tb_logins (email, password, role) VALUES (?, ?, ?)";
              db.query(
                loginQuery,
                [trimmedEmail, hashedPassword, role],
                (err3, loginResult) => {
                  if (err3) {
                    console.error("Error during login insert:", err3);
                    return res
                      .status(500)
                      .json({ message: "Error during login insert" });
                  }

                  const userId = loginResult.insertId;
                  const infoQuery = `
                    INSERT INTO tbl_user_info (
                      user_id, firstname, middlename, lastname, address, phone_number
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                  `;

                  db.query(
                    infoQuery,
                    [
                      userId,
                      trimmedFirst,
                      middleNameValue,
                      trimmedLast,
                      trimmedAddress,
                      trimmedPhone,
                    ],
                    async (err4) => {
                      if (err4) {
                        console.error("Error inserting user info:", err4);
                        return res
                          .status(500)
                          .json({ message: "Error inserting user info" });
                      }

                      const smsEnabled = await isSmsEnabled().catch(() => false);

                      const baseUserInfo = {
                        firstname: trimmedFirst,
                        middlename: middleNameValue,
                        lastname: trimmedLast,
                        address: trimmedAddress,
                        phoneNumber: trimmedPhone,
                      };

                      // If NOT a business owner, we are done here
                      if (trimmedAccountType !== "business_owner") {
                        console.log("[SIGNUP] New citizen account created:", {
                          userId,
                          email: trimmedEmail,
                          phone: trimmedPhone,
                          smsEnabled,
                        });

                        return res.status(201).json({
                          message:
                            "Signup record created. Please verify your phone to activate your account.",
                          userId,
                          smsEnabled,
                          userInfo: baseUserInfo,
                          accountType: trimmedAccountType,
                          businessSaved: false,
                        });
                      }

                      // Business owner: insert business info row WITH LESSOR FIELDS
                      const bizQuery = `
                        INSERT INTO tbl_user_business_info (
                          user_id,
                          is_business_owner,
                          business_name,
                          trade_name,
                          business_type,
                          tin_no,
                          registration_no,
                          business_address,
                          business_postal_code,
                          business_email,
                          business_telephone,
                          business_mobile,
                          lessor_full_name,
                          lessor_address,
                          lessor_phone,
                          lessor_email,
                          monthly_rental
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      `;

                      const bizValues = [
                        userId,
                        1,
                        trimmedBusinessName,
                        trimmedBusinessTradeName,
                        trimmedBusinessType,
                        trimmedBusinessTinNo,
                        trimmedBusinessRegNo,
                        trimmedBusinessAddress,
                        trimmedBusinessPostalCode,
                        trimmedBusinessEmail,
                        trimmedBusinessTelephone,
                        trimmedBusinessMobile,
                        trimmedLessorFullName,
                        trimmedLessorAddress,
                        trimmedLessorPhone,
                        trimmedLessorEmail,
                        monthlyRentalValue,
                      ];

                      db.query(bizQuery, bizValues, (bizErr) => {
                        if (bizErr) {
                          console.error(
                            "Error inserting user business info:",
                            bizErr
                          );

                          // Account is still created; only business profile failed.
                          return res.status(201).json({
                            message:
                              "Signup record created, but we could not save your business details. You can update them later in your profile.",
                            userId,
                            smsEnabled,
                            userInfo: baseUserInfo,
                            accountType: trimmedAccountType,
                            businessSaved: false,
                          });
                        }

                        console.log("[SIGNUP] New business owner created:", {
                          userId,
                          email: trimmedEmail,
                          phone: trimmedPhone,
                          smsEnabled,
                        });

                        return res.status(201).json({
                          message:
                            "Signup record created. Please verify your phone to activate your account.",
                          userId,
                          smsEnabled,
                          userInfo: baseUserInfo,
                          accountType: trimmedAccountType,
                          businessSaved: true,
                        });
                      });
                    }
                  );
                }
              );
            } catch (hashError) {
              console.error("Error hashing password:", hashError);
              return res
                .status(500)
                .json({ message: "Error processing password" });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
