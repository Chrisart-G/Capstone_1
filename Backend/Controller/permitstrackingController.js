// Controller/permitstrackingController.js
const db = require('../db/dbconnect');
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload"); // you already use it in server.js

// --- UTIL: build absolute file URL ---
function absUrl(req, relPath) {
  return relPath ? `${req.protocol}://${req.get("host")}${relPath}` : null;
}
/** Small helper to ensure we have a logged in user */
function getUserIdFromSession(req) {
  if (!req.session?.user?.user_id) return null;
  return req.session.user.user_id;
}

/** Normalize cross-model statuses so your UI steps render consistently */
function normalizeStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();

  // Map occasional variants to your UI's expected set
  if (s === 'in-review' || s === 'in review') return 'in-review';
  if (s === 'in-progress' || s === 'in progress') return 'in-progress';
  if (s === 'requirements-completed' || s === 'requirements completed') return 'requirements-completed';
  if (s === 'ready-for-pickup' || s === 'ready for pickup') return 'ready-for-pickup';
  if (s === 'completed') return 'approved'; // building table sometimes uses "completed"
  if (['pending','approved','rejected'].includes(s)) return s;
  return 'pending';
}

/** ---- Plumbing ----
 *  Table: tbl_plumbing_permits (id, application_no, pp_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getPlumbingPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT 
        id,
        application_no,
        pp_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_plumbing_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get plumbing permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve plumbing permits", error: err.message });
      }

      // normalize statuses
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

/** ---- Electronics ----
 *  Table: tbl_electronics_permits (id, application_no, ep_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getElectronicsPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT
        id,
        application_no,
        ep_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_electronics_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get electronics permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve electronics permits", error: err.message });
      }
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

/** ---- Building ----
 *  Table: tbl_building_permits (id, application_no, bp_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getBuildingPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT
        id,
        application_no,
        bp_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_building_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get building permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve building permits", error: err.message });
      }
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};

/** ---- Fencing ----
 *  Table: tbl_fencing_permits (id, application_no, fp_no, building_permit_no, user_id, ... , status, created_at, updated_at)
 */
exports.getFencingPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT
        id,
        application_no,
        fp_no,
        building_permit_no,
        first_name,
        last_name,
        scope_of_work,
        status,
        created_at,
        updated_at
      FROM tbl_fencing_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get fencing permits for tracking failed:", err);
        return res.status(500).json({ message: "Failed to retrieve fencing permits", error: err.message });
      }
      results.forEach(r => { r.status = normalizeStatus(r.status); });
      res.status(200).json({ success: true, permits: results });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Unexpected server error", error: err.message });
  }
};
// Create or reuse application_index row
function ensureAppIndex(application_type, application_id, user_id, cb) {
  const t = String(application_type || "").toLowerCase();

  const selectSql = `
    SELECT app_uid
    FROM application_index
    WHERE application_type = ?
      AND application_id = ?
      AND user_id = ?
    LIMIT 1
  `;

  db.query(selectSql, [t, application_id, user_id], (selErr, selRows) => {
    if (selErr) return cb(selErr);
    if (selRows.length) return cb(null, selRows[0].app_uid); // already exists

    const insertSql = `
      INSERT INTO application_index (application_type, application_id, user_id)
      VALUES (?, ?, ?)
    `;
    db.query(insertSql, [t, application_id, user_id], (insErr, insRes) => {
      if (insErr) return cb(insErr);
      cb(null, insRes.insertId); // new app_uid
    });
  });
}

//-------------------------- for the fetch of requirements
exports.getUserAttachedRequirements = (req, res) => {
  const userId = getUserIdFromSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  const application_type = String(req.query.application_type || "").toLowerCase();
  const application_id = Number(req.query.application_id || 0);

  if (!application_type || !application_id) {
    return res.status(400).json({
      success: false,
      message: "application_type and application_id are required."
    });
  }

  console.log("getUserAttachedRequirements:", {
    userId,
    application_type,
    application_id
  });

  // 1) Try normal path via application_index (preferred)
  const idxSql = `
    SELECT app_uid
    FROM application_index
    WHERE application_type = ?
      AND application_id = ?
      AND user_id = ?
    LIMIT 1
  `;

  db.query(idxSql, [application_type, application_id, userId], (idxErr, idxRows) => {
    if (idxErr) {
      console.error("getUserAttachedRequirements idx error:", idxErr);
      return res.status(500).json({ success: false, message: "Server error." });
    }

    // Helper to send rows -> items
    const sendRows = (rows) => {
      const items = rows.map(r => ({
        requirement_id: r.requirement_id,
        name: r.requirement_name,
        template_url: absUrl(req, r.pdf_path),        // template to download
        user_file_url: absUrl(req, r.user_upload_path), // user's uploaded file (if any)
        uploaded_at: r.uploaded_at,
        user_uploaded_at: r.user_uploaded_at
      }));

      console.log(
        "getUserAttachedRequirements -> rows:",
        items.length
      );

      // IMPORTANT: always success=true, even if 0 items
      return res.json({ success: true, items });
    };

    if (idxRows.length) {
      // ✅ Normal case: we have app_uid
      const app_uid = idxRows[0].app_uid;
      const sql = `
        SELECT
          requirement_id,
          file_path AS requirement_name,
          pdf_path,
          user_upload_path,
          uploaded_at,
          user_uploaded_at
        FROM tbl_application_requirements
        WHERE app_uid = ?
        ORDER BY uploaded_at ASC
      `;
      db.query(sql, [app_uid], (err, rows) => {
        if (err) {
          console.error("getUserAttachedRequirements error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to load attached requirements."
          });
        }
        return sendRows(rows);
      });
    } else {
      // ⚠️ Fallback: no application_index row, try direct match on user_id + type + id
      console.warn(
        "getUserAttachedRequirements: no application_index row, using fallback",
        { application_type, application_id, userId }
      );

      const fallbackSql = `
        SELECT
          requirement_id,
          file_path AS requirement_name,
          pdf_path,
          user_upload_path,
          uploaded_at,
          user_uploaded_at
        FROM tbl_application_requirements
        WHERE user_id = ?
          AND application_type = ?
          AND application_id = ?
        ORDER BY uploaded_at ASC
      `;

      db.query(
        fallbackSql,
        [userId, application_type, application_id],
        (fbErr, fbRows) => {
          if (fbErr) {
            console.error("getUserAttachedRequirements fallback error:", fbErr);
            return res.status(500).json({
              success: false,
              message: "Failed to load attached requirements."
            });
          }
          return sendRows(fbRows);
        }
      );
    }
  });
};

/**
 * POST /user/requirements/upload
 * FormData: application_type, application_id, requirement_id (the row PK in tbl_application_requirements), file
 * Saves user's filled file and stores path in tbl_application_requirements.user_upload_path
 */
// In Controller/permitstrackingController.js
exports.uploadUserRequirement = (req, res) => {
  const userId = getUserIdFromSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  const application_type = String(req.body.application_type || "").toLowerCase();
  const application_id = Number(req.body.application_id || 0);
  const requirement_id  = Number(req.body.requirement_id || 0);
  const file = req.files?.file || null;

  if (!application_type || !application_id || !requirement_id || !file) {
    return res.status(400).json({
      success: false,
      message: "application_type, application_id, requirement_id and file are required."
    });
  }

  // Validate this requirement row belongs to THIS user's app
  const sql = `
    SELECT
      r.requirement_id,
      r.app_uid,
      r.user_upload_path,
      ai.user_id
    FROM tbl_application_requirements r
    JOIN application_index ai ON ai.app_uid = r.app_uid
    WHERE r.requirement_id = ? AND ai.application_type = ? AND ai.application_id = ?
    LIMIT 1
  `;

  db.query(sql, [requirement_id, application_type, application_id], (err, rows) => {
    if (err) {
      console.error("uploadUserRequirement lookup error:", err);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found for this application."
      });
    }
    const row = rows[0];

    if (row.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to upload for this application."
      });
    }

    // ❗ NEW: once user has uploaded, do not allow another upload
    if (row.user_upload_path) {
      return res.status(400).json({
        success: false,
        message:
          "A file has already been uploaded for this requirement. " +
          "Please contact the municipal office if you need to change it."
      });
    }

    // Save file under /uploads/user_uploads
    const UP_SUBDIR = "uploads/user_uploads";
    const absDir = path.join(__dirname, "..", UP_SUBDIR);
    if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

    const safe = `${Date.now()}_${String(file.name).replace(/[^\w.\-]+/g, "_")}`;
    const absPath = path.join(absDir, safe);

    file.mv(absPath, (mvErr) => {
      if (mvErr) {
        console.error("upload mv error:", mvErr);
        return res.status(500).json({ success: false, message: "Failed to save file." });
      }

      const relPath = `/${UP_SUBDIR}/${safe}`;
      const upd = `
        UPDATE tbl_application_requirements
        SET user_upload_path = ?, user_uploaded_at = NOW()
        WHERE requirement_id = ?
      `;
      db.query(upd, [relPath, requirement_id], (updErr) => {
        if (updErr) {
          console.error("upload update error:", updErr);
          return res.status(500).json({ success: false, message: "Failed to record upload." });
        }
        res.json({
          success: true,
          message: "File uploaded.",
          requirement_id,
          user_file_url: absUrl(req, relPath)
        });
      });
    });
  });
};
exports.replaceUserRequirementUpload = (req, res) => {
  const userId = getUserIdFromSession(req);
  const role = req.session?.user?.role || 'citizen';

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  if (role !== 'admin' && role !== 'employee') {
    return res.status(403).json({
      success: false,
      message: "Only municipal staff can replace uploads."
    });
  }

  const requirement_id = Number(req.body.requirement_id || 0);
  const file = req.files?.file || null;

  if (!requirement_id || !file) {
    return res.status(400).json({
      success: false,
      message: "requirement_id and file are required."
    });
  }

  const sql = `
    SELECT requirement_id, user_upload_path
    FROM tbl_application_requirements
    WHERE requirement_id = ?
    LIMIT 1
  `;

  db.query(sql, [requirement_id], (err, rows) => {
    if (err) {
      console.error("replaceUserRequirementUpload lookup error:", err);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found."
      });
    }

    const row = rows[0];

    // Optional: delete existing file
    if (row.user_upload_path) {
      try {
        const rel = row.user_upload_path.replace(/^\//, "");
        const absOld = path.join(__dirname, "..", rel);
        if (fs.existsSync(absOld)) {
          fs.unlinkSync(absOld);
        }
      } catch (e) {
        console.warn("Failed to delete old requirement file:", e);
      }
    }

    // Save new file
    const UP_SUBDIR = "uploads/user_uploads";
    const absDir = path.join(__dirname, "..", UP_SUBDIR);
    if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

    const safe = `${Date.now()}_${String(file.name).replace(/[^\w.\-]+/g, "_")}`;
    const absPath = path.join(absDir, safe);

    file.mv(absPath, (mvErr) => {
      if (mvErr) {
        console.error("replace mv error:", mvErr);
        return res.status(500).json({ success: false, message: "Failed to save file." });
      }

      const relPath = `/${UP_SUBDIR}/${safe}`;
      const upd = `
        UPDATE tbl_application_requirements
        SET user_upload_path = ?, user_uploaded_at = NOW()
        WHERE requirement_id = ?
      `;
      db.query(upd, [relPath, requirement_id], (updErr) => {
        if (updErr) {
          console.error("replaceUserRequirementUpload update error:", updErr);
          return res.status(500).json({ success: false, message: "Failed to record upload." });
        }

        return res.json({
          success: true,
          message: "Requirement file has been replaced.",
          requirement_id,
          user_file_url: absUrl(req, relPath)
        });
      });
    });
  });
};
exports.replaceUserRequirementUploadByUser = (req, res) => {
  const userId = getUserIdFromSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  const application_type = String(req.body.application_type || "").toLowerCase();
  const application_id = Number(req.body.application_id || 0);
  const requirement_id  = Number(req.body.requirement_id || 0);
  const file = req.files?.file || null;

  if (!application_type || !application_id || !requirement_id || !file) {
    return res.status(400).json({
      success: false,
      message: "application_type, application_id, requirement_id and file are required."
    });
  }

  const sql = `
    SELECT
      r.requirement_id,
      r.app_uid,
      r.user_upload_path,
      ai.user_id
    FROM tbl_application_requirements r
    JOIN application_index ai ON ai.app_uid = r.app_uid
    WHERE r.requirement_id = ? AND ai.application_type = ? AND ai.application_id = ?
    LIMIT 1
  `;

  db.query(sql, [requirement_id, application_type, application_id], (err, rows) => {
    if (err) {
      console.error("replaceUserRequirementUploadByUser lookup error:", err);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found for this application."
      });
    }

    const row = rows[0];

    // must be the same user who owns this application
    if (row.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to replace this requirement."
      });
    }

    // delete old file if it exists
    if (row.user_upload_path) {
      try {
        const rel = row.user_upload_path.replace(/^\//, "");
        const absOld = path.join(__dirname, "..", rel);
        if (fs.existsSync(absOld)) {
          fs.unlinkSync(absOld);
        }
      } catch (e) {
        console.warn("Failed to delete old requirement file:", e);
      }
    }

    // Save new file
    const UP_SUBDIR = "uploads/user_uploads";
    const absDir = path.join(__dirname, "..", UP_SUBDIR);
    if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

    const safe = `${Date.now()}_${String(file.name).replace(/[^\w.\-]+/g, "_")}`;
    const absPath = path.join(absDir, safe);

    file.mv(absPath, (mvErr) => {
      if (mvErr) {
        console.error("replaceUserRequirementUploadByUser mv error:", mvErr);
        return res.status(500).json({ success: false, message: "Failed to save file." });
      }

      const relPath = `/${UP_SUBDIR}/${safe}`;
      const upd = `
        UPDATE tbl_application_requirements
        SET user_upload_path = ?, user_uploaded_at = NOW()
        WHERE requirement_id = ?
      `;
      db.query(upd, [relPath, requirement_id], (updErr) => {
        if (updErr) {
          console.error("replaceUserRequirementUploadByUser update error:", updErr);
          return res.status(500).json({ success: false, message: "Failed to record upload." });
        }

        return res.json({
          success: true,
          message: "Requirement file has been replaced.",
          requirement_id,
          user_file_url: absUrl(req, relPath)
        });
      });
    });
  });
};
exports.addUserCommentForApplication = (req, res) => {
  const userId = getUserIdFromSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
  }

  const application_type = String(req.body.application_type || "").toLowerCase();
  const application_id = Number(req.body.application_id || 0);
  const rawStatus      = req.body.status_at_post || null;
  const comment        = String(req.body.comment || "").trim();

  if (!application_type || !application_id || !comment) {
    return res.status(400).json({
      success: false,
      message: "application_type, application_id and comment are required."
    });
  }

  // normalize status (pending / in-review / in-progress / etc.)
  const status_at_post = rawStatus ? normalizeStatus(rawStatus) : null;

  // ensure we have an app_uid in application_index
  ensureAppIndex(application_type, application_id, userId, (idxErr, appUid) => {
    if (idxErr) {
      console.error("ensureAppIndex error (user comment):", idxErr);
      return res.status(500).json({ success: false, message: "Failed to link application index." });
    }

    const insertSql = `
      INSERT INTO application_comments
        (app_uid, application_type, application_id, status_at_post, comment, author_user_id, author_role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'user', NOW())
    `;

    db.query(
      insertSql,
      [String(appUid), application_type, application_id, status_at_post, comment, userId],
      (insErr, insRes) => {
        if (insErr) {
          console.error("addUserCommentForApplication insert error:", insErr);
          return res.status(500).json({ success: false, message: "Failed to save your comment." });
        }

        return res.json({
          success: true,
          message: "Comment posted.",
          id: insRes.insertId
        });
      }
    );
  });
};
exports.getZoningPermitsForTracking = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized. Please log in." });

    const sql = `
      SELECT 
        zoning_id as id,
        application_no,
        NULL as zp_no,
        NULL as building_permit_no,
        applicant_first_name as first_name,
        applicant_last_name as last_name,
        project_type as scope_of_work,
        'pending' as status, -- Default status since your table doesn't have status field
        created_at,
        updated_at
      FROM zoning_permits
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Get zoning permits for tracking failed:", err);
        return res.status(500).json({ 
          message: "Failed to retrieve zoning permits", 
          error: err.message 
        });
      }
      
      // If your zoning_permits table doesn't have status, default to pending
      results.forEach(r => { 
        r.status = normalizeStatus(r.status || 'pending'); 
        // Format names if needed
        if (r.first_name || r.last_name) {
          r.first_name = r.first_name || '';
          r.last_name = r.last_name || '';
        }
      });
      
      res.status(200).json({ 
        success: true, 
        permits: results 
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ 
      message: "Unexpected server error", 
      error: err.message 
    });
  }
};