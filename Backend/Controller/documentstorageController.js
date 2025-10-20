// Controller/documentstorageController.js
const db = require("../db/dbconnect");
const fs = require("fs");
const path = require("path");

// ---- where to store templates ----
const REQ_SUBDIR = "uploads/requirements";
const REQ_ABS_DIR = path.join(__dirname, "..", REQ_SUBDIR);

// ensure folder exists
function ensureUploadDir() {
  if (!fs.existsSync(REQ_ABS_DIR)) {
    fs.mkdirSync(REQ_ABS_DIR, { recursive: true });
  }
}
ensureUploadDir();

// ---- helper to save (optional) file via express-fileupload ----
function saveTemplateFile(file) {
  if (!file) return null; // no file uploaded
  const safeName = `${Date.now()}_${String(file.name).replace(/[^\w.\-]+/g, "_")}`;
  const absPath = path.join(REQ_ABS_DIR, safeName);
  file.mv(absPath);
  return `/${REQ_SUBDIR}/${safeName}`; // server-relative URL
}

// ================= Offices =================
exports.getOffices = (_req, res) => {
  const sql = "SELECT office_id, office_name FROM tbl_offices WHERE status = 'active' ORDER BY office_name";
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
};

// ================= Categories =================
exports.getCategoriesByOffice = (req, res) => {
  const { office_id } = req.params;
  const sql = `
    SELECT category_id, category_name
    FROM tbl_requirement_categories
    WHERE office_id = ? AND status = 'active'
    ORDER BY category_name
  `;
  db.query(sql, [office_id], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
};

exports.addCategory = (req, res) => {
  const { office_id, category_name, description = "" } = req.body;
  if (!office_id || !category_name) {
    return res.status(400).json({ ok: false, message: "office_id and category_name are required." });
  }
  const sql = "INSERT INTO tbl_requirement_categories SET ?";
  db.query(sql, { office_id, category_name, description }, (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, id: result.insertId });
  });
};

// ================= Requirements =================
exports.listRequirements = (req, res) => {
  const { office_id = "", category_id = "" } = req.query;
  let where = "WHERE 1=1";
  const params = [];

  if (office_id) {
    where += " AND dr.office_id = ?";
    params.push(office_id);
  }
  if (category_id) {
    where += " AND dr.category_id = ?";
    params.push(category_id);
  }

  const sql = `
    SELECT dr.*, o.office_name, c.category_name
    FROM tbl_document_requirements dr
    JOIN tbl_offices o ON o.office_id = dr.office_id
    LEFT JOIN tbl_requirement_categories c ON c.category_id = dr.category_id
    ${where}
    ORDER BY o.office_name, c.category_name, dr.name
  `;
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, data: rows });
  });
};

exports.addRequirement = (req, res) => {
  const file = req.files?.template || null;

  const {
    name,
    office_id,
    category_id = null,
    instructions = "",
    permit_type,                 // <-- add this
    allowed_extensions = "pdf",  // optional control
    is_required = 1,
    is_active = 1,
    created_by = null            // optional: current admin user_id
  } = req.body;

  if (!name || !office_id || !permit_type) {
    return res.status(400).json({ ok: false, message: "name, office_id, and permit_type are required." });
  }

  let template_path = null;
  try {
    template_path = saveTemplateFile(file); // may be null (allowed)
  } catch (e) {
    return res.status(500).json({ ok: false, message: "File upload failed", error: e.message });
  }

  const payload = {
    name,
    office_id,
    category_id: category_id || null,
    instructions,
    permit_type,                 // <-- store it
    template_path,
    allowed_extensions,
    is_required: Number(is_required) ? 1 : 0,
    is_active: Number(is_active) ? 1 : 0,
    created_by: created_by || null,
  };

  db.query("INSERT INTO tbl_document_requirements SET ?", payload, (err, result) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.status(201).json({ ok: true, id: result.insertId });
  });
};

exports.updateRequirement = (req, res) => {
  const { id } = req.params;
  const file = req.files?.template || null;

  const {
    name,
    office_id,
    category_id = null,
    instructions = "",
    permit_type,
    allowed_extensions = "pdf",
    is_required = 1,
    is_active = 1
  } = req.body;

  db.query(
    "SELECT template_path FROM tbl_document_requirements WHERE requirement_id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, error: err.message });
      if (!rows.length) return res.status(404).json({ ok: false, message: "Requirement not found." });

      let template_path = rows[0].template_path;

      if (file) {
        try {
          if (template_path) {
            const rel = template_path.replace(/^[\\/]+/, ""); // strip leading slash
            const oldAbs = path.join(__dirname, "..", rel);
            if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
          }
          template_path = saveTemplateFile(file);
        } catch (e) {
          return res.status(500).json({ ok: false, message: "File upload failed", error: e.message });
        }
      }

      const data = {
        name,
        office_id,
        category_id: category_id || null,
        instructions,
        permit_type,                 // keep in sync
        template_path,
        allowed_extensions,
        is_required: Number(is_required) ? 1 : 0,
        is_active: Number(is_active) ? 1 : 0
      };

      db.query("UPDATE tbl_document_requirements SET ? WHERE requirement_id = ?", [data, id], (err2) => {
        if (err2) return res.status(500).json({ ok: false, error: err2.message });
        res.json({ ok: true });
      });
    }
  );
};

exports.deleteRequirement = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT template_path FROM tbl_document_requirements WHERE requirement_id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, error: err.message });
      if (!rows.length) return res.status(404).json({ ok: false, message: "Requirement not found." });

      const { template_path } = rows[0];

      db.query("DELETE FROM tbl_document_requirements WHERE requirement_id = ?", [id], (err2) => {
        if (err2) return res.status(500).json({ ok: false, error: err2.message });

        if (template_path) {
          const abs = path.join(__dirname, "..", template_path);
          if (fs.existsSync(abs)) fs.unlinkSync(abs);
        }
        res.json({ ok: true });
      });
    }
  );
};

// Optional: download by id (works too since you already serve /uploads statically)
exports.downloadTemplate = (req, res) => {
  const { id } = req.params;
  db.query("SELECT name, template_path FROM tbl_document_requirements WHERE requirement_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    if (!rows.length || !rows[0].template_path) {
      return res.status(404).json({ ok: false, message: "Template not found." });
    }
    const abs = path.join(__dirname, "..", rows[0].template_path);
    if (!fs.existsSync(abs)) return res.status(404).json({ ok: false, message: "File missing." });
    res.download(abs, `${rows[0].name}_template${path.extname(abs)}`);
  });
};
