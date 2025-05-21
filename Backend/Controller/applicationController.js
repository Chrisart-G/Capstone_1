const db = require('../db/dbconnect');

// Accept an application and set its status to 'in-review'
exports.acceptApplication = (req, res) => {
  const id = req.params.id;

  const sql = `UPDATE business_permits SET status = 'in-review' WHERE BusinessP_id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error updating status:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    return res.status(200).json({ success: true, message: "Application moved to in-review" });
  });
};