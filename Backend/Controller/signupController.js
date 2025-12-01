// Controller/signupController.js
const db = require('../db/dbconnect');
const bcrypt = require('bcrypt');
const { isSmsEnabled } = require('../services/smsService');

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
    } = req.body;

    // basic server-side validation
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
        .json({ message: 'All required fields must be filled.' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedFirst = String(firstname).trim();
    const trimmedLast = String(lastname).trim();
    const trimmedAddress = String(address).trim();
    const trimmedPhone = String(phoneNumber).trim();
    const middleNameValue =
      middlename && middlename.trim() !== '' ? middlename.trim() : null;

    // 1) check email uniqueness
    db.query(
      'SELECT email FROM tb_logins WHERE email = ? LIMIT 1',
      [trimmedEmail],
      (err, emailRows) => {
        if (err) {
          console.error('Database error during email check:', err);
          return res
            .status(500)
            .json({ message: 'Database error during signup (email check).' });
        }
        if (emailRows.length > 0) {
          return res.status(409).json({ message: 'Email already exists' });
        }

        // 2) check phone number uniqueness
        db.query(
          'SELECT phone_number FROM tbl_user_info WHERE phone_number = ? LIMIT 1',
          [trimmedPhone],
          async (err2, phoneRows) => {
            if (err2) {
              console.error('Database error during phone check:', err2);
              return res.status(500).json({
                message: 'Database error during signup (phone check).',
              });
            }
            if (phoneRows.length > 0) {
              return res
                .status(409)
                .json({ message: 'Phone number is already in use.' });
            }

            // 3) create login + user_info
            try {
              const hashedPassword = await bcrypt.hash(password, 10);
              const role = 'citizen';

              const loginQuery =
                'INSERT INTO tb_logins (email, password, role) VALUES (?, ?, ?)';
              db.query(
                loginQuery,
                [trimmedEmail, hashedPassword, role],
                (err3, loginResult) => {
                  if (err3) {
                    console.error('Error during login insert:', err3);
                    return res.status(500).json({
                      message: 'Error during login insert',
                    });
                  }

                  const userId = loginResult.insertId;
                  const infoQuery = `
                    INSERT INTO tbl_user_info (user_id, firstname, middlename, lastname, address, phone_number)
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
                        console.error('Error inserting user info:', err4);
                        return res.status(500).json({
                          message: 'Error inserting user info',
                        });
                      }

                      // optional flag for frontend (in case you want to hide OTP UI when SMS is off)
                      const smsEnabled = await isSmsEnabled().catch(() => false);

                      console.log('[SIGNUP] New user created:', {
                        userId,
                        email: trimmedEmail,
                        phone: trimmedPhone,
                        smsEnabled,
                      });

                      return res.status(201).json({
                        message:
                          'Signup record created. Please verify your phone to activate your account.',
                        userId,
                        smsEnabled,
                        userInfo: {
                          firstname: trimmedFirst,
                          middlename: middleNameValue,
                          lastname: trimmedLast,
                          address: trimmedAddress,
                          phoneNumber: trimmedPhone,
                        },
                      });
                    }
                  );
                }
              );
            } catch (hashError) {
              console.error('Error hashing password:', hashError);
              return res
                .status(500)
                .json({ message: 'Error processing password' });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
