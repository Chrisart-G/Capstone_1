// Controller/employeedashController.js
const db = require('../db/dbconnect');

/**
 * Helper: check auth
 */
function requireAuth(req, res) {
  if (!req.session || !req.session.user || !req.session.user.user_id) {
    res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    return false;
  }
  return true;
}

/**
 * ---- GET LISTS (Employee View) ----
 * Each query LEFT JOINs tb_logins to expose email to the dashboard.
 * Uses consistent shape: { id, type, name, status, submitted, email, user_id, ...raw }
 */

// PLUMBING
exports.getAllPlumbingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT p.*, l.email
    FROM tbl_plumbing_permits p
    LEFT JOIN tb_logins l ON p.user_id = l.user_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching plumbing permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving plumbing permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Plumbing Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

// ELECTRONICS
exports.getAllElectronicsPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT e.*, l.email
    FROM tbl_electronics_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    ORDER BY e.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching electronics permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving electronics permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Electronics Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

// BUILDING
exports.getAllBuildingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT b.*, l.email
    FROM tbl_building_permits b
    LEFT JOIN tb_logins l ON b.user_id = l.user_id
    ORDER BY b.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching building permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving building permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Building Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

// FENCING
exports.getAllFencingPermitsForEmployee = (req, res) => {
  if (!requireAuth(req, res)) return;

  const sql = `
    SELECT f.*, l.email
    FROM tbl_fencing_permits f
    LEFT JOIN tb_logins l ON f.user_id = l.user_id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching fencing permits:', err);
      return res.status(500).json({ success: false, message: 'Error retrieving fencing permits' });
    }
    const applications = rows.map(r => ({
      id: r.id,
      type: 'Fencing Permit',
      name: `${r.first_name || ''} ${r.middle_initial || ''} ${r.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      status: r.status || 'pending',
      submitted: r.created_at,
      email: r.email,
      user_id: r.user_id,
      ...r
    }));
    res.json({ success: true, applications });
  });
};

/**
 * ---- GET BY ID (for “View Info” modal) ----
 */

exports.getPlumbingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT p.*, l.email
    FROM tbl_plumbing_permits p
    LEFT JOIN tb_logins l ON p.user_id = l.user_id
    WHERE p.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving plumbing permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Plumbing permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

exports.getElectronicsById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT e.*, l.email
    FROM tbl_electronics_permits e
    LEFT JOIN tb_logins l ON e.user_id = l.user_id
    WHERE e.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving electronics permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Electronics permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

exports.getBuildingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT b.*, l.email
    FROM tbl_building_permits b
    LEFT JOIN tb_logins l ON b.user_id = l.user_id
    WHERE b.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving building permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Building permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

exports.getFencingById = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;

  const sql = `
    SELECT f.*, l.email
    FROM tbl_fencing_permits f
    LEFT JOIN tb_logins l ON f.user_id = l.user_id
    WHERE f.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error retrieving fencing permit' });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Fencing permit not found' });
    res.json({ success: true, application: rows[0] });
  });
};

/**
 * ---- STATUS TRANSITIONS ----
 * All: accept -> set in-review
 * move-to-inprogress
 * move-to-requirements-completed
 * move-to-approved
 * set-pickup -> ready-for-pickup (+ schedule)
 */

// generic helper to update status on a table by id
function updateStatus(res, table, id, status, schedule) {
  const hasSchedule = typeof schedule !== 'undefined' && schedule !== null;
  const sql = hasSchedule
    ? `UPDATE ${table} SET status = ?, pickup_schedule = ?, updated_at = NOW() WHERE id = ?`
    : `UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id = ?`;

  const params = hasSchedule ? [status, schedule, id] : [status, id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(`Failed to update ${table}:`, err);
      return res.status(500).json({ success: false, message: 'Failed to update' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: `Moved to ${status}` });
  });
}

// ---- Accept -> in-review
exports.acceptPlumbing = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_plumbing_permits', id, 'in-review');
};

exports.acceptElectronics = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_electronics_permits', id, 'in-review');
};

exports.acceptBuilding = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_building_permits', id, 'in-review');
};

exports.acceptFencing = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { id } = req.params;
  updateStatus(res, 'tbl_fencing_permits', id, 'in-review');
};

// ---- Move to in-progress
exports.plumbingToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_plumbing_permits', req.body.applicationId || req.body.id, 'in-progress');
};

exports.electronicsToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'in-progress');
};

exports.buildingToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_building_permits', req.body.applicationId || req.body.id, 'in-progress');
};

exports.fencingToInProgress = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_fencing_permits', req.body.applicationId || req.body.id, 'in-progress');
};

// ---- Move to requirements-completed
exports.plumbingToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_plumbing_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

exports.electronicsToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

exports.buildingToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_building_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

exports.fencingToRequirementsCompleted = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_fencing_permits', req.body.applicationId || req.body.id, 'requirements-completed');
};

// ---- Move to approved
exports.plumbingToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_plumbing_permits', req.body.applicationId || req.body.id, 'approved');
};

exports.electronicsToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_electronics_permits', req.body.applicationId || req.body.id, 'approved');
};

exports.buildingToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_building_permits', req.body.applicationId || req.body.id, 'approved');
};

exports.fencingToApproved = (req, res) => {
  if (!requireAuth(req, res)) return;
  updateStatus(res, 'tbl_fencing_permits', req.body.applicationId || req.body.id, 'approved');
};

// ---- Set pickup (ready-for-pickup)
exports.plumbingSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_plumbing_permits', applicationId, 'ready-for-pickup', schedule);
};

exports.electronicsSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_electronics_permits', applicationId, 'ready-for-pickup', schedule);
};

exports.buildingSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_building_permits', applicationId, 'ready-for-pickup', schedule);
};

exports.fencingSetPickup = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { applicationId, schedule } = req.body;
  updateStatus(res, 'tbl_fencing_permits', applicationId, 'ready-for-pickup', schedule);
};
// ========================= REQUIREMENTS LIBRARY (EMPLOYEE) =========================

// GET /requirements-library?permit_type=&office_id=&category_id=&q=
exports.listRequirementLibrary = (req, res) => {
  if (!requireAuth(req, res)) return;

  // support both names
  const incomingType = req.query.permit_type || req.query.application_type || "";
  const { office_id = "", category_id = "", q = "" } = req.query;

  let where = "WHERE dr.is_active = 1";
  const params = [];

  if (incomingType) {
    where += " AND dr.permit_type = ?";
    params.push(incomingType);
  }
  if (office_id) {
    where += " AND dr.office_id = ?";
    params.push(office_id);
  }
  if (category_id) {
    where += " AND dr.category_id = ?";
    params.push(category_id);
  }
  if (q) {
    const like = `%${q}%`;
    where += " AND (dr.name LIKE ? OR o.office_name LIKE ? OR IFNULL(c.category_name,'') LIKE ?)";
    params.push(like, like, like);
  }

  const sql = `
    SELECT
      dr.requirement_id,
      dr.name,
      dr.permit_type,
      dr.template_path,
      dr.allowed_extensions,
      dr.is_required,
      dr.instructions,
      dr.office_id,
      dr.category_id,
      o.office_name,
      c.category_name
    FROM tbl_document_requirements dr
    JOIN tbl_offices o ON o.office_id = dr.office_id
    LEFT JOIN tbl_requirement_categories c ON c.category_id = dr.category_id
    ${where}
    ORDER BY o.office_name, c.category_name, dr.name
  `;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("listRequirementLibrary error:", err);
      return res.status(500).json({ success: false, message: "Failed to load requirements library." });
    }
    const base = `${req.protocol}://${req.get("host")}`;
    const items = rows.map(r => ({
      ...r,
      file_url: r.template_path ? `${base}${r.template_path}` : null
    }));
    res.json({ success: true, items });
  });
};

// POST /attach-requirement
// Body: { application_type, application_id, doc_requirement_id }
// POST /attach-requirement
// --- AUTO-HEAL: ensure the (application_type, application_id) exists in application_index
function ensureAppIndexed(appType, appId, cb) {
  const map = {
    business:         { sql: 'SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1' },
    renewal_business: { sql: 'SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1' },
    special_sales:    { sql: 'SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1' },
    electrical:       { sql: 'SELECT user_id FROM tbl_electrical_permits WHERE id = ? LIMIT 1' },
    building:         { sql: 'SELECT user_id FROM tbl_building_permits WHERE id = ? LIMIT 1' },
    plumbing:         { sql: 'SELECT user_id FROM tbl_plumbing_permits WHERE id = ? LIMIT 1' },
    fencing:          { sql: 'SELECT user_id FROM tbl_fencing_permits WHERE id = ? LIMIT 1' },
    electronics:      { sql: 'SELECT user_id FROM tbl_electronics_permits WHERE id = ? LIMIT 1' },
    cedula:           { sql: 'SELECT user_id FROM tbl_cedula WHERE id = ? LIMIT 1' },
    zoning:           { sql: null },
    mayors:           { sql: null }
  };

  const entry = map[appType];
  if (!entry || !entry.sql) return cb(new Error(`Unsupported or un-indexable type: ${appType}`));

  db.query(entry.sql, [appId], (e, rows) => {
    if (e) return cb(e);
    if (!rows.length || !rows[0].user_id) return cb(new Error('Application not found to index.'));
    const userId = rows[0].user_id;

    const ins = `
      INSERT IGNORE INTO application_index (application_type, application_id, user_id, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(ins, [appType, appId, userId], (insErr) => {
      if (insErr) return cb(insErr);
      cb(null, { user_id: userId }); // app_uid will be fetched on re-query
    });
  });
}

exports.attachRequirementFromLibrary = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type, application_id, doc_requirement_id } = req.body || {};

  // ---- validation ----
  if (!application_type) {
    return res.status(400).json({ success: false, message: "application_type is required." });
  }
  if (application_id === undefined || application_id === null || application_id === "") {
    return res.status(400).json({ success: false, message: "application_id is required." });
  }
  if (!doc_requirement_id) {
    return res.status(400).json({ success: false, message: "doc_requirement_id is required." });
  }

  const appType = String(application_type).toLowerCase();
  const appId   = Number(application_id);
  const docId   = Number(doc_requirement_id);

  const ALLOWED = new Set([
    'business','renewal_business','special_sales',
    'cedula','building','electrical','plumbing',
    'fencing','electronics','zoning','mayors'
  ]);
  if (!ALLOWED.has(appType)) {
    return res.status(400).json({ success: false, message: `Unsupported application_type: ${application_type}` });
  }
  if (!Number.isFinite(appId) || appId <= 0) {
    return res.status(400).json({ success: false, message: "application_id must be a positive number." });
  }
  if (!Number.isFinite(docId) || docId <= 0) {
    return res.status(400).json({ success: false, message: "doc_requirement_id must be a positive number." });
  }

  // helper to continue after we have a valid index row
  const proceed = ({ app_uid, user_id: applicantUserId }) => {
    // ---- 2) get requirement template ----
    const getDocSql = `
      SELECT requirement_id, name, template_path
      FROM tbl_document_requirements
      WHERE requirement_id = ?
      LIMIT 1
    `;
    db.query(getDocSql, [docId], (docErr, docRows) => {
      if (docErr) {
        console.error("attachRequirementFromLibrary doc lookup error:", docErr);
        return res.status(500).json({ success: false, message: "Server error (doc lookup)." });
      }
      if (!docRows.length) {
        return res.status(404).json({ success: false, message: "Document requirement not found." });
      }
      const reqRow = docRows[0];
      if (!reqRow.template_path) {
        return res.status(400).json({ success: false, message: "This requirement has no stored PDF/template." });
      }

      // ---- 3) prevent duplicates on same app/file name ----
      const dupeSql = `
        SELECT 1
        FROM tbl_application_requirements
        WHERE application_type = ? AND application_id = ? AND file_path = ?
        LIMIT 1
      `;
      db.query(dupeSql, [appType, appId, reqRow.name], (dupeErr, dupeRows) => {
        if (dupeErr) {
          console.error("duplicate check error:", dupeErr);
          return res.status(500).json({ success: false, message: "Server error (duplicate check)." });
        }
        if (dupeRows.length) {
          return res.status(409).json({ success: false, message: "This requirement is already attached to the application." });
        }

        // ---- 4) insert, tying to app_uid and applicantUserId ----
        const ins = `
          INSERT INTO tbl_application_requirements
            (app_uid, user_id, file_path, application_type, application_id, pdf_path, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        db.query(
          ins,
          [app_uid, applicantUserId, reqRow.name, appType, appId, reqRow.template_path],
          (insErr, result) => {
            if (insErr) {
              console.error("attachRequirementFromLibrary insert error:", insErr);
              return res.status(500).json({ success: false, message: "Failed to attach requirement." });
            }
            const base = `${req.protocol}://${req.get("host")}`;
            res.json({
              success: true,
              message: "Requirement attached from library.",
              attached_id: result.insertId,
              app_uid,
              user_id: applicantUserId,
              name: reqRow.name,
              pdf_path: reqRow.template_path,
              file_url: `${base}${reqRow.template_path}`
            });
          }
        );
      });
    });
  };

  // ---- 1) resolve app_uid + applicant's user_id from application_index (with auto-heal) ----
  const getAppUid = `
    SELECT app_uid, user_id
    FROM application_index
    WHERE application_type = ? AND application_id = ?
    LIMIT 1
  `;
  db.query(getAppUid, [appType, appId], (idxErr, idxRows) => {
    if (idxErr) {
      console.error("attachRequirementFromLibrary index lookup error:", idxErr);
      return res.status(500).json({ success: false, message: "Server error (application index lookup)." });
    }

    if (!idxRows.length) {
      // auto-create the missing index row, then re-query
      return ensureAppIndexed(appType, appId, (healErr) => {
        if (healErr) {
          console.error("ensureAppIndexed error:", healErr);
          return res.status(404).json({ success:false, message:"Application not indexed." });
        }
        db.query(getAppUid, [appType, appId], (reErr, reRows) => {
          if (reErr) {
            console.error("re-query index error:", reErr);
            return res.status(500).json({ success:false, message:"Server error (re-lookup index)." });
          }
          if (!reRows.length) {
            return res.status(404).json({ success:false, message:"Application not indexed." });
          }
          proceed(reRows[0]);
        });
      });
    }

    proceed(idxRows[0]);
  });
};



// GET /attached-requirements?application_type=&application_id=
exports.getAttachedRequirements = (req, res) => {
  if (!requireAuth(req, res)) return;

  const { application_type = "", application_id = "" } = req.query;
  if (!application_type || !application_id) {
    return res.status(400).json({ success: false, message: "Missing application_type or application_id." });
  }

  const sql = `
    SELECT requirement_id, user_id, file_path, application_type, application_id, pdf_path, uploaded_at
    FROM tbl_application_requirements
    WHERE application_type = ? AND application_id = ?
    ORDER BY uploaded_at DESC
  `;
  db.query(sql, [application_type, application_id], (err, rows) => {
    if (err) {
      console.error("getAttachedRequirements error:", err);
      return res.status(500).json({ success: false, message: "Failed to load attached requirements." });
    }
    const base = `${req.protocol}://${req.get("host")}`;
    const items = rows.map(r => ({
      ...r,
      file_url: r.pdf_path ? `${base}${r.pdf_path}` : null
    }));
    res.json({ success: true, items });
  });
};

// GET /application-comments?application_type=&application_id=
exports.getApplicationComments = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { application_type = "", application_id = "" } = req.query;
  const sql = `
    SELECT id, app_uid, application_type, application_id, comment, author_user_id, author_role, created_at
    FROM application_comments
    WHERE application_type = ? AND application_id = ?
    ORDER BY created_at DESC
  `;
  db.query(sql, [application_type, application_id], (err, rows) => {
    if (err) return res.status(500).json({ success:false, message:'Failed to load comments' });
    res.json({ success:true, items: rows });
  });
};

// POST /application-comments  body: { application_type, application_id, comment }
exports.addApplicationComment = (req, res) => {
  if (!requireAuth(req, res)) return;
  const { application_type, application_id, comment } = req.body || {};
  if (!application_type || !application_id || !comment) {
    return res.status(400).json({ success:false, message:'Missing fields' });
  }
  const idxSql = `SELECT app_uid FROM application_index WHERE application_type=? AND application_id=? LIMIT 1`;
  db.query(idxSql, [application_type, application_id], (e, r) => {
    if (e) return res.status(500).json({ success:false, message:'Index lookup failed' });
    const app_uid = r?.[0]?.app_uid || null;
    const ins = `
      INSERT INTO application_comments (app_uid, application_type, application_id, comment, author_user_id, author_role, created_at)
      VALUES (?, ?, ?, ?, ?, 'employee', NOW())
    `;
    db.query(ins, [app_uid, application_type, application_id, comment, req.session.user.user_id], (ie) => {
      if (ie) return res.status(500).json({ success:false, message:'Failed to save comment' });
      res.json({ success:true });
    });
  });
};
