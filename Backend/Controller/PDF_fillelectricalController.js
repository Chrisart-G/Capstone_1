// Controller/PDF_fillelectricalController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

// ───────── Config ─────────
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "system_generated", "electrical");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const TEMPLATE_PATH =
  process.env.ELECTRICAL_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "ELECTRICAL_PERMIT_template.pdf");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ───────── DB helpers ─────────
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function tableColumns(tableName) {
  try {
    const rows = await q(`SHOW COLUMNS FROM \`${tableName}\``);
    return new Set(rows.map((r) => r.Field));
  } catch {
    return new Set();
  }
}

// ───────── Path utils (normalize + safe delete) ─────────
function toRelUploadsPath(rowOrString) {
  let raw = rowOrString;

  if (typeof rowOrString === "object" && rowOrString) {
    raw =
      rowOrString.pdf_path ||
      rowOrString.file_url ||
      rowOrString.system_file_url ||
      rowOrString.filepath ||
      rowOrString.user_file_url ||
      rowOrString.user_pdf_path ||
      rowOrString.user_filepath ||
      rowOrString.user_file_path ||
      ""; // file_path is usually a label, not a path
  }

  if (!raw) return null;
  const s0 = String(raw).trim();
  if (!s0) return null;

  // Extract "/uploads/..." from full URL if needed
  const urlMatch = s0.match(/(\/uploads\/[\s\S]+)$/i);
  let rel = urlMatch ? urlMatch[1] : s0;

  rel = rel.replace(/\\/g, "/"); // normalize slashes

  if (!/^\/?uploads\//i.test(rel)) return null;
  if (!rel.startsWith("/")) rel = `/${rel}`;

  return rel;
}

function safeUnlink(relPath) {
  try {
    if (!relPath) return false;
    const abs = path.resolve(path.join(__dirname, "..", relPath.replace(/^\//, "")));
    if (!abs.startsWith(UPLOADS_ROOT)) return false;
    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
      return true;
    }
  } catch {}
  return false;
}

// ───────── application_index upsert (INT PK, uniq on type+id) ─────────
async function ensureAppIndex(application_type, application_id, srcRow) {
  const existing = await q(
    `SELECT app_uid, user_id
       FROM application_index
      WHERE application_type = ? AND application_id = ?
      LIMIT 1`,
    [application_type, application_id]
  );
  if (existing.length) return existing[0];

  const possibleUserCols = ["user_id", "applicant_user_id", "owner_user_id", "submitted_by", "created_by"];
  let applicantUserId = null;
  for (const k of possibleUserCols) {
    if (k in (srcRow || {})) {
      const v = Number(srcRow[k]);
      if (Number.isFinite(v) && v > 0) { applicantUserId = v; break; }
    }
  }

  await q(
    `INSERT INTO application_index (application_type, application_id, user_id, created_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
    [application_type, application_id, applicantUserId]
  );

  const after = await q(
    `SELECT app_uid, user_id
       FROM application_index
      WHERE application_type = ? AND application_id = ?
      LIMIT 1`,
    [application_type, application_id]
  );
  return after[0];
}

// ───────── Electrical application loader (tolerant) ─────────
async function getByKeys(table, keyValue) {
  const cols = await tableColumns(table);
  if (cols.size === 0) return null;

  const candidates = [
    ["id", keyValue],
    ["application_id", keyValue],
    ["electrical_id", keyValue],
    ["ep_id", keyValue],
    ["application_no", String(keyValue)],
    ["ep_no", String(keyValue)],
  ].filter(([col]) => cols.has(col));

  if (!candidates.length) return null;

  const whereParts = candidates.map(([col]) => `\`${col}\` = ?`);
  const params = candidates.map(([, val]) => val);
  const sql = `SELECT * FROM \`${table}\` WHERE ${whereParts.join(" OR ")} LIMIT 1`;

  try {
    const rows = await q(sql, params);
    return rows && rows[0] ? rows[0] : null;
  } catch {
    return null;
  }
}

async function getElectricalApplication(application_id) {
  const tryTables = [
    "tbl_electrical_permits",
    "electrical_permit_applications",
    "electrical_permits",
    "tbl_electrical_permit",
  ];
  for (const t of tryTables) {
    const row = await getByKeys(t, application_id);
    if (row) return { row, table: t };
  }
  return null;
}

// ───────── Row → Template map ─────────
function mapRow(r) {
  if (!r) return null;
  return {
    // NEW: header numbers
    application_no: r.application_no || r.app_no || "",
    ep_no: r.ep_no || r.electrical_permit_no || "",
    building_permit_no: r.building_permit_no || r.bp_no || "",

    // existing fields (UNCHANGED)
    last_name: r.last_name || r.owner_last_name || "",
    first_name: r.first_name || r.owner_first_name || "",
    mi: r.middle_initial || r.mi || "",
    tin: r.tin || r.tin_no || "",
    address_no: r.address_no || "",
    address_street: r.address_street || r.street || "",
    address_barangay: r.address_barangay || r.barangay || "",
    address_city: r.address_city || r.city_municipality || "",
    address_zip: r.address_zip_code || r.zip_code || "",
    telephone: r.telephone_no || r.mobile_no || "",
    construction_owned: r.construction_owned || "",
    form_of_ownership: r.form_of_ownership || "",
    use_or_character: r.use_or_character || "",
    loc_street: r.location_street || "",
    loc_lot: r.location_lot_no || r.lot_no || "",
    loc_blk: r.location_blk_no || r.block_no1 || "",
    loc_tct: r.location_tct_no || r.tct_no || "",
    loc_tax: r.location_tax_dec_no || r.tax_dec_no || "",
    scope_of_work: r.scope_of_work || "",
    city_municipality: r.address_city || r.city_municipality || "",
    barangay: r.address_barangay || r.barangay || "",
  };
}


// ───────── PDF filler ─────────
async function fillElectricalTemplate(mapped) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Electrical template not found at: ${TEMPLATE_PATH}\n` +
      `Set ELECTRICAL_TEMPLATE_PATH in your .env to the correct PDF path.`
    );
  }

  const src = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(src);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const p1 = pdfDoc.getPages()[0];
  const draw = (text, x, y, size = 9) => {
    const s = String(text ?? "").trim();
    if (!s) return;
    p1.drawText(s, { x, y, size, font });
  };

  // NEW: Header numbers (adjust these x/y a hair if needed for your template)
  // APPLICATION NO. | EP NO. | BUILDING PERMIT NO.
  draw(mapped.application_no,      18, 892);
  draw(mapped.ep_no,              215, 892);
  draw(mapped.building_permit_no, 410, 892);

  // Name / TIN  (UNCHANGED)
  draw(mapped.last_name, 145, 817);
  draw(mapped.first_name, 225, 817);
  draw(mapped.mi, 318, 817);
  draw(mapped.tin, 430, 817);

  // Address  (UNCHANGED)
  draw(mapped.address_no, 65, 702);
  draw(mapped.address_street, 120, 702);
  draw(mapped.address_barangay, 197, 702);
  draw(mapped.address_city, 295, 702);
  draw(mapped.address_zip, 411, 702);
  draw(mapped.telephone, 456, 702);

  // Ownership / Use  (UNCHANGED)
  draw(mapped.construction_owned, 14, 775);
  draw(mapped.form_of_ownership, 211, 775);
  draw(mapped.use_or_character, 407, 775);

  // Location  (UNCHANGED)
  draw(mapped.loc_lot, 197, 674);
  draw(mapped.loc_blk, 283, 674);
  draw(mapped.loc_tct, 373, 674);
  draw(mapped.loc_tax, 481, 674);
  draw(mapped.loc_street, 48, 646);

  // City / Brgy  (UNCHANGED)
  draw(mapped.barangay, 163, 646);
  draw(mapped.city_municipality, 395, 646);

  // Scope  (UNCHANGED)
  draw(mapped.scope_of_work, 89, 611);

  return await pdfDoc.save();
}


// ───────── Attach (and clean old file when updating) ─────────
async function attachToAppRequirements({ application_type, application_id, pdf_path, srcRow }) {
  // application_index upsert (returns app_uid INT AUTO_INCREMENT)
  let app_uid = null;
  let applicantUserId = null;
  try {
    const idx = await ensureAppIndex(application_type, application_id, srcRow);
    app_uid = idx?.app_uid || null;
    applicantUserId = idx?.user_id || null;
  } catch (e) {
    console.warn("ensureAppIndex warning:", e.message);
  }

  const cols = await tableColumns("tbl_application_requirements");
  const hasAppUid     = cols.has("app_uid");
  const hasUserId     = cols.has("user_id");
  const hasPdfPath    = cols.has("pdf_path");
  const hasFileUrl    = cols.has("file_url");      // may be missing in your DB
  const hasUploadedAt = cols.has("uploaded_at");
  const hasFilePath   = cols.has("file_path");

  const FILE_LABEL = "Electrical Permit Filled Form";
  const relPath = toRelUploadsPath(pdf_path) || pdf_path;
  const absUrl  = `${PUBLIC_BASE_URL}${relPath}`;

  // Build SELECT list dynamically (avoid selecting columns that don't exist)
  const selectBits = ["requirement_id"];
  if (hasPdfPath) selectBits.push("pdf_path");
  if (hasFileUrl) selectBits.push("file_url");

  const dupe = await q(
    `SELECT ${selectBits.join(", ")}
       FROM tbl_application_requirements
      WHERE application_type = ? AND application_id = ? AND file_path = ?
      LIMIT 1`,
    [application_type, application_id, FILE_LABEL]
  );

  if (dupe.length) {
    // Keep the previous file path to delete later if it became unreferenced
    const oldRel = hasPdfPath || hasFileUrl ? toRelUploadsPath(dupe[0]) : null;

    const sets = [];
    const vals = [];
    if (hasPdfPath)  { sets.push("pdf_path = ?"); vals.push(relPath); }
    if (hasFileUrl)  { sets.push("file_url = ?"); vals.push(absUrl); }
    if (hasUploadedAt) sets.push("uploaded_at = NOW()");

    if (sets.length) {
      await q(
        `UPDATE tbl_application_requirements
            SET ${sets.join(", ")}
          WHERE requirement_id = ?`,
        [...vals, dupe[0].requirement_id]
      );
    }

    // If an old file existed and it's no longer referenced anywhere, delete it
    if (oldRel && oldRel !== relPath) {
      const stillRef1 = await q(
        `SELECT 1 FROM tbl_application_requirements WHERE ${hasPdfPath ? "pdf_path = ?" : "0"} ${hasPdfPath && hasFileUrl ? "OR" : ""} ${hasFileUrl ? "file_url LIKE ?" : ""} LIMIT 1`,
        hasPdfPath && hasFileUrl ? [oldRel, `%${oldRel}%`] : hasPdfPath ? [oldRel] : hasFileUrl ? [`%${oldRel}%`] : []
      );
      let stillRef2 = [];
      try {
        const colsLegacy = await tableColumns("attached_requirements");
        const hasLegacyFileUrl = colsLegacy.has("file_url");
        const where = hasLegacyFileUrl ? "(file_path = ? OR file_url LIKE ?)" : "(file_path = ?)";
        stillRef2 = await q(
          `SELECT 1 FROM attached_requirements WHERE ${where} LIMIT 1`,
          hasLegacyFileUrl ? [oldRel, `%${oldRel}%`] : [oldRel]
        );
      } catch {}
      if (!stillRef1.length && !stillRef2.length) safeUnlink(oldRel);
    }
    return;
  }

  // Insert new row (only columns that exist)
  const colsIns = [];
  const valsIns = [];
  const ph = [];

  if (hasAppUid)   { colsIns.push("app_uid");   valsIns.push(app_uid);         ph.push("?"); }
  if (hasUserId)   { colsIns.push("user_id");   valsIns.push(applicantUserId); ph.push("?"); }
  if (hasFilePath) { colsIns.push("file_path"); valsIns.push(FILE_LABEL);      ph.push("?"); }

  colsIns.push("application_type"); valsIns.push(application_type); ph.push("?");
  colsIns.push("application_id");   valsIns.push(application_id);   ph.push("?");

  if (hasPdfPath)  { colsIns.push("pdf_path");  valsIns.push(relPath); ph.push("?"); }
  if (hasFileUrl)  { colsIns.push("file_url");  valsIns.push(absUrl);  ph.push("?"); }
  if (hasUploadedAt) { colsIns.push("uploaded_at"); ph.push("NOW()"); }

  const sql =
    `INSERT INTO tbl_application_requirements (${colsIns.join(", ")})
     VALUES (${ph.join(", ")})`;

  await q(sql, valsIns);
}


// ───────── Generate handler ─────────
exports.generateFilledElectrical = async (req, res) => {
  try {
    const { application_id } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required and must be a positive number" });
    }

    const hit = await getElectricalApplication(appId);
    if (!hit) {
      return res.status(404).json({ success: false, message: "Electrical application not found" });
    }

    const row = hit.row;

    const mapped = mapRow(row);
    const outBytes = await fillElectricalTemplate(mapped);

    const filename = `electrical-${appId}-${Date.now()}.pdf`;
    const absPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const relPath = `/uploads/system_generated/electrical/${filename}`;
    const file_url = `${PUBLIC_BASE_URL}${relPath}`;

    await attachToAppRequirements({
      application_type: "electrical",
      application_id: appId,
      pdf_path: relPath,
      srcRow: row,
    });

try {
  const colsLegacy = await tableColumns("attached_requirements");
  const hasLegacyFileUrl = colsLegacy.has("file_url");
  const baseCols = ["application_type", "application_id", "file_path", "uploaded_at", "source"];
  const basePh   = ["?", "?", "?", "NOW()", "?"];
  const baseVals = ["electrical", appId, relPath, "system"];

  if (hasLegacyFileUrl) {
    baseCols.splice(3, 0, "file_url");        // insert before uploaded_at
    basePh.splice(3, 0, "?");
    baseVals.splice(3, 0, file_url);
  }

  await q(
    `INSERT INTO attached_requirements (${baseCols.join(", ")})
     VALUES (${basePh.join(", ")})`,
    baseVals
  );
} catch {}

    return res.json({ success: true, file_path: relPath, file_url });
  } catch (err) {
    console.error("generateFilledElectrical error:", err);
    return res.status(500).json({ success: false, message: "Server error generating Electrical form." });
  }
};

// ───────── REMOVE handler (delete DB row + file) ─────────

exports.removeAttachedRequirement = async (req, res) => {
  try {
    const {
      requirement_id,
      application_type,
      application_id,
      file_path,  // label
      pdf_path,   // optional direct "/uploads/..."
    } = req.body || {};

    const cols = await tableColumns("tbl_application_requirements");
    const hasPdfPath  = cols.has("pdf_path");
    const hasFileUrl  = cols.has("file_url");

    let row;

    if (Number.isFinite(Number(requirement_id))) {
      const selectBits = ["requirement_id", "application_type", "application_id", "file_path"];
      if (hasPdfPath) selectBits.push("pdf_path");
      if (hasFileUrl) selectBits.push("file_url");

      const list = await q(
        `SELECT ${selectBits.join(", ")}
           FROM tbl_application_requirements
          WHERE requirement_id = ?
          LIMIT 1`,
        [Number(requirement_id)]
      );
      row = list[0];
      if (!row) return res.status(404).json({ success: false, message: "Requirement not found." });
    } else if (application_type && Number.isFinite(Number(application_id)) && (file_path || pdf_path)) {
      const selectBits = ["requirement_id", "application_type", "application_id", "file_path"];
      if (hasPdfPath) selectBits.push("pdf_path");
      if (hasFileUrl) selectBits.push("file_url");

      const params = [application_type, Number(application_id)];
      let where = `application_type = ? AND application_id = ?`;
      if (pdf_path && (hasPdfPath || hasFileUrl)) {
        if (hasPdfPath) { where += ` AND (pdf_path = ?`; params.push(pdf_path); }
        if (hasFileUrl) {
          where += hasPdfPath ? ` OR file_url LIKE ?)` : ` AND (file_url LIKE ?)`;
          params.push(`%${pdf_path}%`);
        } else if (hasPdfPath) {
          where += `)`;
        }
      } else if (file_path) {
        where += ` AND file_path = ?`;
        params.push(file_path);
      } else {
        return res.status(400).json({ success: false, message: "Nothing to match (no file_path/pdf_path)." });
      }

      const list = await q(
        `SELECT ${selectBits.join(", ")} FROM tbl_application_requirements WHERE ${where} LIMIT 1`,
        params
      );
      row = list[0];
      if (!row) return res.status(404).json({ success: false, message: "Requirement not found." });
    } else {
      return res.status(400).json({ success: false, message: "Provide requirement_id OR (application_type, application_id, and file_path/pdf_path)." });
    }

    const oldRel = toRelUploadsPath(row);

    await q(`DELETE FROM tbl_application_requirements WHERE requirement_id = ?`, [row.requirement_id]);

    // best-effort cleanup of legacy table
    try {
      const colsLegacy = await tableColumns("attached_requirements");
      const hasLegacyFileUrl = colsLegacy.has("file_url");
      if (oldRel) {
        const where = hasLegacyFileUrl ? "(file_path = ? OR file_url LIKE ?)" : "(file_path = ?)";
        const params = hasLegacyFileUrl ? [oldRel, `%${oldRel}%`] : [oldRel];
        await q(
          `DELETE FROM attached_requirements
             WHERE application_type = ? AND application_id = ? AND ${where}`,
          [row.application_type, row.application_id, ...params]
        );
      }
    } catch {}

    // delete file if no one else references it
    if (oldRel) {
      const stillRef1 = await q(
        `SELECT 1 FROM tbl_application_requirements WHERE ${hasPdfPath ? "pdf_path = ?" : "0"} ${hasPdfPath && hasFileUrl ? "OR" : ""} ${hasFileUrl ? "file_url LIKE ?" : ""} LIMIT 1`,
        hasPdfPath && hasFileUrl ? [oldRel, `%${oldRel}%`] : hasPdfPath ? [oldRel] : hasFileUrl ? [`%${oldRel}%`] : []
      );
      let stillRef2 = [];
      try {
        const colsLegacy = await tableColumns("attached_requirements");
        const hasLegacyFileUrl = colsLegacy.has("file_url");
        const where = hasLegacyFileUrl ? "(file_path = ? OR file_url LIKE ?)" : "(file_path = ?)";
        stillRef2 = await q(
          `SELECT 1 FROM attached_requirements WHERE ${where} LIMIT 1`,
          hasLegacyFileUrl ? [oldRel, `%${oldRel}%`] : [oldRel]
        );
      } catch {}
      if (!stillRef1.length && !stillRef2.length) safeUnlink(oldRel);
    }

    return res.json({ success: true, message: "Requirement removed." });
  } catch (err) {
    console.error("removeAttachedRequirement error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove requirement." });
  }
};

