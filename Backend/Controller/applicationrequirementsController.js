const path = require('path');
const fs = require('fs');
const db = require('../db/dbconnect');

// Save file to disk
const saveRequirementFile = (file) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, '../uploads/requirements');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}_${file.name}`;
  const filePath = path.join(uploadDir, filename);
  file.mv(filePath);

  return `/uploads/requirements/${filename}`;
};

exports.uploadRequirement = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const userId = req.session.user.user_id;
    const file = req.files?.requirement;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = saveRequirementFile(file);
    const sql = 'INSERT INTO tbl_application_requirements (user_id, file_path, uploaded_at) VALUES (?, ?, NOW())';

    db.query(sql, [userId, filePath], (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ success: false, message: 'Database insert failed.', error: err.message });
      }

      return res.status(201).json({ success: true, message: 'Requirement uploaded successfully.' });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
