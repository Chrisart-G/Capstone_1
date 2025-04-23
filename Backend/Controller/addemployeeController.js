const db = require('../db/dbconnect');
const bcrypt = require('bcrypt');

exports.addEmployee = (req, res) => {
  const { email, password, firstName, lastName, phone, position, department, startDate } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required login information' });
  }

  if (!firstName || !lastName || !position || !department || !startDate) {
    return res.status(400).json({ message: 'Missing required employee information' });
  }

  // Hash the password first
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error('Hashing error:', hashErr);
      return res.status(500).json({ message: 'Error hashing password' });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error('Transaction error:', err);
        return res.status(500).json({ message: 'Database transaction error' });
      }

      const role = 'employee'; // fixed role
      const loginSql = `
        INSERT INTO tb_logins (email, password, role, created_at) 
        VALUES (?, ?, ?, NOW())
      `;
      const loginValues = [email, hashedPassword, role];

      console.log('Login Insert:', loginValues); // Debug log

      db.query(loginSql, loginValues, (loginErr, loginResult) => {
        if (loginErr) {
          db.rollback(() => {
            if (loginErr.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ message: 'Email already exists' });
            }
            console.error('Login insert error:', loginErr);
            return res.status(500).json({ message: 'Failed to insert login info' });
          });
          return;
        }

        const userId = loginResult.insertId;

        // Ensure employee table exists
        const createTableSql = `
          CREATE TABLE IF NOT EXISTS tbl_employeeinformation (
            employee_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            phone VARCHAR(20),
            position VARCHAR(100) NOT NULL,
            department VARCHAR(50) NOT NULL,
            start_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES tb_logins(user_id) ON DELETE CASCADE
          )
        `;

        db.query(createTableSql, (createErr) => {
          if (createErr) {
            db.rollback(() => {
              console.error('Create table error:', createErr);
              return res.status(500).json({ message: 'Failed to create employee table' });
            });
            return;
          }

          const employeeSql = `
            INSERT INTO tbl_employeeinformation 
            (user_id, first_name, last_name, phone, position, department, start_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(employeeSql, [userId, firstName, lastName, phone || null, position, department, startDate], (empErr) => {
            if (empErr) {
              db.rollback(() => {
                console.error('Employee insert error:', empErr);
                return res.status(500).json({ message: 'Failed to insert employee info' });
              });
              return;
            }

            db.commit((commitErr) => {
              if (commitErr) {
                db.rollback(() => {
                  console.error('Commit error:', commitErr);
                  return res.status(500).json({ message: 'Transaction commit failed' });
                });
                return;
              }

              return res.status(201).json({ message: 'Employee added successfully', employeeId: userId });
            });
          });
        });
      });
    });
  });
};
