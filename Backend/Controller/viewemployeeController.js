const db = require('../db/dbconnect');
const bcrypt = require('bcrypt');

// Get all employees with their login information
exports.getAllEmployees = async (req, res) => {
  try {
    const query = `
      SELECT e.employee_id, e.user_id, e.first_name, e.last_name, e.phone, e.position, 
             e.department, e.start_date, l.email, l.role
      FROM tbl_employeeinformation e
      JOIN tb_logins l ON e.user_id = l.user_id
      ORDER BY e.employee_id DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
      }
      
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error in getAllEmployees:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT e.employee_id, e.user_id, e.first_name, e.last_name, e.phone, e.position, 
             e.department, e.start_date, l.email, l.role
      FROM tbl_employeeinformation e
      JOIN tb_logins l ON e.user_id = l.user_id
      WHERE e.employee_id = ?
    `;
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching employee:', err);
        return res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      return res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, position, department, email, password } = req.body;
    
    // Start a transaction
    db.beginTransaction(async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Transaction error', error: err.message });
      }
      
      try {
        // First, get the user_id associated with this employee
        const getUserIdQuery = 'SELECT user_id FROM tbl_employeeinformation WHERE employee_id = ?';
        
        db.query(getUserIdQuery, [id], async (err, results) => {
          if (err || results.length === 0) {
            return db.rollback(() => {
              res.status(404).json({ message: 'Employee not found' });
            });
          }
          
          const user_id = results[0].user_id;
          
          // Update employee information
          const updateEmployeeQuery = `
            UPDATE tbl_employeeinformation 
            SET first_name = ?, last_name = ?, phone = ?, position = ?, department = ?
            WHERE employee_id = ?
          `;
          
          db.query(updateEmployeeQuery, [first_name, last_name, phone, position, department, id], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Failed to update employee information', error: err.message });
              });
            }
            
            // Update email in the login table
            const updateEmailQuery = 'UPDATE tb_logins SET email = ? WHERE user_id = ?';
            
            db.query(updateEmailQuery, [email, user_id], async (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Failed to update email', error: err.message });
                });
              }
              
              // If password is provided, update it
              if (password) {
                try {
                  // Hash the password
                  const saltRounds = 10;
                  const hashedPassword = await bcrypt.hash(password, saltRounds);
                  
                  const updatePasswordQuery = 'UPDATE tb_logins SET password = ? WHERE user_id = ?';
                  
                  db.query(updatePasswordQuery, [hashedPassword, user_id], (err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ message: 'Failed to update password', error: err.message });
                      });
                    }
                    
                    // Commit the transaction
                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({ message: 'Failed to commit transaction', error: err.message });
                        });
                      }
                      
                      return res.status(200).json({ message: 'Employee updated successfully' });
                    });
                  });
                } catch (hashError) {
                  return db.rollback(() => {
                    res.status(500).json({ message: 'Password hashing error', error: hashError.message });
                  });
                }
              } else {
                // If no password update, commit the transaction
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ message: 'Failed to commit transaction', error: err.message });
                    });
                  }
                  
                  return res.status(200).json({ message: 'Employee updated successfully' });
                });
              }
            });
          });
        });
      } catch (error) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Error in update process', error: error.message });
        });
      }
    });
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start a transaction
    db.beginTransaction(async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Transaction error', error: err.message });
      }
      
      try {
        // First, get the user_id associated with this employee
        const getUserIdQuery = 'SELECT user_id FROM tbl_employeeinformation WHERE employee_id = ?';
        
        db.query(getUserIdQuery, [id], (err, results) => {
          if (err || results.length === 0) {
            return db.rollback(() => {
              res.status(404).json({ message: 'Employee not found' });
            });
          }
          
          const user_id = results[0].user_id;
          
          // Delete employee information first (due to foreign key constraint)
          const deleteEmployeeQuery = 'DELETE FROM tbl_employeeinformation WHERE employee_id = ?';
          
          db.query(deleteEmployeeQuery, [id], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Failed to delete employee information', error: err.message });
              });
            }
            
            // Delete user login information
            const deleteLoginQuery = 'DELETE FROM tb_logins WHERE user_id = ?';
            
            db.query(deleteLoginQuery, [user_id], (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Failed to delete login information', error: err.message });
                });
              }
              
              // Commit the transaction
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ message: 'Failed to commit transaction', error: err.message });
                  });
                }
                
                return res.status(200).json({ message: 'Employee deleted successfully' });
              });
            });
          });
        });
      } catch (error) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Error in delete process', error: error.message });
        });
      }
    });
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, phone, position, department, email, password } = req.body;
    
    if (!first_name || !last_name || !position || !department || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Start a transaction
    db.beginTransaction(async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Transaction error', error: err.message });
      }
      
      try {
        // Check if email already exists
        const checkEmailQuery = 'SELECT user_id FROM tb_logins WHERE email = ?';
        
        db.query(checkEmailQuery, [email], async (err, results) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ message: 'Database error', error: err.message });
            });
          }
          
          if (results.length > 0) {
            return db.rollback(() => {
              res.status(400).json({ message: 'Email already exists' });
            });
          }
          
          try {
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Create user login first to get user_id
            const createLoginQuery = `
              INSERT INTO tb_logins (email, password, role, created_at) 
              VALUES (?, ?, 'employee', CURRENT_TIMESTAMP)
            `;
            
            db.query(createLoginQuery, [email, hashedPassword], (err, result) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Failed to create login', error: err.message });
                });
              }
              
              const user_id = result.insertId;
              
              // Create employee record
              const createEmployeeQuery = `
                INSERT INTO tbl_employeeinformation 
                (user_id, first_name, last_name, phone, position, department, start_date, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE(), CURRENT_TIMESTAMP)
              `;
              
              db.query(createEmployeeQuery, [user_id, first_name, last_name, phone, position, department], (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ message: 'Failed to create employee record', error: err.message });
                  });
                }
                
                // Commit the transaction
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ message: 'Failed to commit transaction', error: err.message });
                    });
                  }
                  
                  return res.status(201).json({ message: 'Employee created successfully', user_id });
                });
              });
            });
          } catch (hashError) {
            return db.rollback(() => {
              res.status(500).json({ message: 'Password hashing error', error: hashError.message });
            });
          }
        });
      } catch (error) {
        return db.rollback(() => {
          res.status(500).json({ message: 'Error in create process', error: error.message });
        });
      }
    });
  } catch (error) {
    console.error('Error in createEmployee:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};