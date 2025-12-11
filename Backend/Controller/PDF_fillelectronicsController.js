// Controller/PDF_fillelectronicsController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "system_generated", "electronics");
const TEMPLATE_PATH =
  process.env.ELECTRONICS_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "ELECTRONICS_PERMIT_template.pdf"); // <— put your template here

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ───────── DB helpers ───────── */
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

/* ───────── Path utils ───────── */
const toRelUploadsPath = (rowOrString) => {
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
      "";
  }
  if (!raw) return null;
  const s0 = String(raw).trim();
  if (!s0) return null;

  const urlMatch = s0.match(/(\/uploads\/[\s\S]+)$/i);
  let rel = urlMatch ? urlMatch[1] : s0;
  rel = rel.replace(/\\/g, "/");

  if (!/^\/?uploads\//i.test(rel)) return null;
  if (!rel.startsWith("/")) rel = `/${rel}`;
  return rel;
};

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

/* ───────── application_index upsert ───────── */
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
      if (Number.isFinite(v) && v > 0) {
        applicantUserId = v;
        break;
      }
    }
  }

  await q(
    `INSERT INTO application_index (application_type, application_id, user_id, created_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
    ["electronics", application_id, applicantUserId]
  );

  const after = await q(
    `SELECT app_uid, user_id
       FROM application_index
      WHERE application_type = ? AND application_id = ?
      LIMIT 1`,
    ["electronics", application_id]
  );
  return after[0];
}

/* ───────── tolerant loader (find the row regardless of table name/PK) ───────── */
async function getByKeys(table, keyValue) {
  const cols = await tableColumns(table);
  if (cols.size === 0) return null;

  const candidates = [
    ["id", keyValue],
    ["application_id", keyValue],
    ["electronics_id", keyValue],
    ["elp_id", keyValue],
    ["application_no", String(keyValue)],
    ["ep_no", String(keyValue)],
    ["elp_no", String(keyValue)],
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

async function getElectronicsApplication(application_id) {
  const tryTables = [
    "tbl_electronics_permits",
    "electronics_permit_applications",
    "electronics_permits",
    "tbl_electronics_permit",
  ];
  for (const t of tryTables) {
    const row = await getByKeys(t, application_id);
    if (row) return { row, table: t };
  }
  return null;
}

/* ───────── Row → PDF template mapping ───────── */
function mapRow(r) {
  if (!r) return null;
  return {
    // Header numbers
    application_no: r.application_no || r.app_no || "",
    ep_no: r.ep_no || r.elp_no || r.electronics_permit_no || "",
    building_permit_no: r.building_permit_no || r.bp_no || "",

    // Owner / applicant
    last_name: r.last_name || r.owner_last_name || "",
    first_name: r.first_name || r.owner_first_name || "",
    mi: r.middle_initial || r.mi || r.middle_name || "",

    tin: r.tin || r.tin_no || "",

    // Address
    address_no: r.address_no || "",
    address_street: r.address_street || r.street || "",
    address_barangay: r.address_barangay || r.barangay || "",
    address_city: r.address_city || r.city_municipality || "",
    address_zip: r.address_zip_code || r.zip_code || "",
    telephone: r.telephone_no || r.mobile_no || "",

    // Use / ownership
    construction_owned: r.construction_owned || "",
    form_of_ownership: r.form_of_ownership || "",
    use_or_character: r.use_or_character || "",

    // Location
    loc_street: r.location_street || "",
    loc_lot: r.location_lot_no || r.lot_no || "",
    loc_blk: r.location_blk_no || r.block_no1 || "",
    loc_tct: r.location_tct_no || r.tct_no || "",
    loc_tax: r.location_tax_dec_no || r.tax_dec_no || "",

    // Summary
    scope_of_work: r.scope_of_work || "",

    // City / Brgy duplicates used on template
    city_municipality: r.address_city || r.city_municipality || "",
    barangay: r.address_barangay || r.barangay || "",
  };
}

/* ───────── PDF filler (coords mirror your electrical template; tweak if needed) ───────── */
async function fillElectronicsTemplate(mapped) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Electronics template not found at: ${TEMPLATE_PATH}\n` +
        `Set ELECTRONICS_TEMPLATE_PATH in your .env to the correct PDF path.`
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

  // Header numbers
  draw(mapped.application_no, 18, 892);
  draw(mapped.ep_no, 215, 892);
  draw(mapped.building_permit_no, 410, 892);

  // Name / TIN
    draw(mapped.mi, 35, 830);
  draw(mapped.last_name, 160, 830);
  draw(mapped.first_name, 260, 830);
  draw(mapped.tin, 390, 830);

    // Ownership / Use
  draw(mapped.construction_owned, 14, 800);
  draw(mapped.form_of_ownership, 211, 800);
  draw(mapped.use_or_character, 407, 800);


  // Address
  draw(mapped.address_no, 105, 730);
  draw(mapped.address_street, 160, 730);
  draw(mapped.address_barangay, 247, 730);
  draw(mapped.address_city, 333, 730);
  draw(mapped.address_zip, 435, 730);
  draw(mapped.telephone, 479, 730);


  // Location
  draw(mapped.loc_lot, 220, 712);
  draw(mapped.loc_blk, 330, 712);       


  draw(mapped.loc_tct, 50, 690);
    draw(mapped.loc_tax, 481, 680);

  // City / Brgy
    draw(mapped.loc_street, 54, 661);
  draw(mapped.barangay, 169, 661);
  draw(mapped.city_municipality, 365, 661);

  // Scope
  draw(mapped.scope_of_work, 105, 599);

  return await pdfDoc.save();
}

/* ───────── Attach into tbl_application_requirements (and legacy table) ───────── */
async function attachToAppRequirements({ application_id, pdf_path, srcRow }) {
  let app_uid = null;
  let applicantUserId = null;
  try {
    const idx = await ensureAppIndex("electronics", application_id, srcRow);
    app_uid = idx?.app_uid || null;
    applicantUserId = idx?.user_id || null;
  } catch (e) {
    console.warn("ensureAppIndex warning:", e.message);
  }

  const cols = await tableColumns("tbl_application_requirements");
  const hasAppUid = cols.has("app_uid");
  const hasUserId = cols.has("user_id");
  const hasPdfPath = cols.has("pdf_path");
  const hasFileUrl = cols.has("file_url");
  const hasUploadedAt = cols.has("uploaded_at");
  const hasFilePath = cols.has("file_path");

  const FILE_LABEL = "Electronics Permit Filled Form";
  const relPath = toRelUploadsPath(pdf_path) || pdf_path;
  const absUrl = `${PUBLIC_BASE_URL}${relPath}`;

  const selectBits = ["requirement_id"];
  if (hasPdfPath) selectBits.push("pdf_path");
  if (hasFileUrl) selectBits.push("file_url");

  const dupe = await q(
    `SELECT ${selectBits.join(", ")}
       FROM tbl_application_requirements
      WHERE application_type = ? AND application_id = ? AND file_path = ?
      LIMIT 1`,
    ["electronics", application_id, FILE_LABEL]
  );

  if (dupe.length) {
    const oldRel = toRelUploadsPath(dupe[0]);

    const sets = [];
    const vals = [];
    if (hasPdfPath) {
      sets.push("pdf_path = ?");
      vals.push(relPath);
    }
    if (hasFileUrl) {
      sets.push("file_url = ?");
      vals.push(absUrl);
    }
    if (hasUploadedAt) sets.push("uploaded_at = NOW()");

    if (sets.length) {
      await q(
        `UPDATE tbl_application_requirements
            SET ${sets.join(", ")}
          WHERE requirement_id = ?`,
        [...vals, dupe[0].requirement_id]
      );
    }

    // cleanup old file if unreferenced
    if (oldRel && oldRel !== relPath) {
      const stillRef1 = await q(
        `SELECT 1 FROM tbl_application_requirements WHERE ${
          hasPdfPath ? "pdf_path = ?" : "0"
        } ${hasPdfPath && hasFileUrl ? "OR" : ""} ${
          hasFileUrl ? "file_url LIKE ?" : ""
        } LIMIT 1`,
        hasPdfPath && hasFileUrl
          ? [oldRel, `%${oldRel}%`]
          : hasPdfPath
          ? [oldRel]
          : hasFileUrl
          ? [`%${oldRel}%`]
          : []
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

  // insert
  const colsIns = [];
  const valsIns = [];
  const ph = [];

  if (hasAppUid) {
    colsIns.push("app_uid");
    valsIns.push(app_uid);
    ph.push("?");
  }
  if (hasUserId) {
    colsIns.push("user_id");
    valsIns.push(applicantUserId);
    ph.push("?");
  }
  if (hasFilePath) {
    colsIns.push("file_path");
    valsIns.push(FILE_LABEL);
    ph.push("?");
  }
  colsIns.push("application_type");
  valsIns.push("electronics");
  ph.push("?");
  colsIns.push("application_id");
  valsIns.push(application_id);
  ph.push("?");

  if (hasPdfPath) {
    colsIns.push("pdf_path");
    valsIns.push(relPath);
    ph.push("?");
  }
  if (hasFileUrl) {
    colsIns.push("file_url");
    valsIns.push(absUrl);
    ph.push("?");
  }
  if (hasUploadedAt) {
    colsIns.push("uploaded_at");
    ph.push("NOW()");
  }

  await q(
    `INSERT INTO tbl_application_requirements (${colsIns.join(", ")})
     VALUES (${ph.join(", ")})`,
    valsIns
  );

  // legacy (best-effort)
  try {
    const colsLegacy = await tableColumns("attached_requirements");
    const hasLegacyFileUrl = colsLegacy.has("file_url");
    const baseCols = ["application_type", "application_id", "file_path", "uploaded_at", "source"];
    const basePh = ["?", "?", "?", "NOW()", "?"];
    const baseVals = ["electronics", application_id, relPath, "system"];
    if (hasLegacyFileUrl) {
      baseCols.splice(3, 0, "file_url");
      basePh.splice(3, 0, "?");
      baseVals.splice(3, 0, `${PUBLIC_BASE_URL}${relPath}`);
    }
    await q(
      `INSERT INTO attached_requirements (${baseCols.join(", ")})
       VALUES (${basePh.join(", ")})`,
      baseVals
    );
  } catch {}
}

/* ───────── Generate handler ───────── */
exports.generateFilledElectronics = async (req, res) => {
  try {
    const { application_id } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required and must be a positive number" });
    }

    const hit = await getElectronicsApplication(appId);
    if (!hit) {
      return res.status(404).json({ success: false, message: "Electronics application not found" });
    }

    const row = hit.row;
    const mapped = mapRow(row);
    const outBytes = await fillElectronicsTemplate(mapped);

    const filename = `electronics-${appId}-${Date.now()}.pdf`;
    const absPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const relPath = `/uploads/system_generated/electronics/${filename}`;

    await attachToAppRequirements({
      application_id: appId,
      pdf_path: relPath,
      srcRow: row,
    });

    return res.json({
      success: true,
      file_path: relPath,
      file_url: `${PUBLIC_BASE_URL}${relPath}`,
    });
  } catch (err) {
    console.error("generateFilledElectronics error:", err);
    return res.status(500).json({ success: false, message: "Server error generating Electronics form." });
  }
};

/* ───────── Remove handler (same semantics as electrical) ───────── */
exports.removeAttachedRequirement = async (req, res) => {
  try {
    const { requirement_id, application_type, application_id, file_path, pdf_path } = req.body || {};

    const cols = await tableColumns("tbl_application_requirements");
    const hasPdfPath = cols.has("pdf_path");
    const hasFileUrl = cols.has("file_url");

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
        if (hasPdfPath) {
          where += ` AND (pdf_path = ?`;
          params.push(pdf_path);
        }
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
      return res.status(400).json({
        success: false,
        message: "Provide requirement_id OR (application_type, application_id, and file_path/pdf_path).",
      });
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

    // delete file if unreferenced
    if (oldRel) {
      const stillRef1 = await q(
        `SELECT 1 FROM tbl_application_requirements WHERE ${hasPdfPath ? "pdf_path = ?" : "0"} ${
          hasPdfPath && hasFileUrl ? "OR" : ""
        } ${hasFileUrl ? "file_url LIKE ?" : ""} LIMIT 1`,
        hasPdfPath && hasFileUrl
          ? [oldRel, `%${oldRel}%`]
          : hasPdfPath
          ? [oldRel]
          : hasFileUrl
          ? [`%${oldRel}%`]
          : []
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
    console.error("removeAttachedRequirement (electronics) error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove requirement." });
  }
};



















/* ─────────────────────────── USER INLINE FORM (Boxes 2–5) ─────────────────────────── */
/* ─────────────────────────── USER INLINE FORM (Boxes 2–5) ─────────────────────────── */

const PREVIEW_DIR    = path.join(__dirname, "..", "uploads", "system_generated", "electronics", "previews");
const USERFILLED_DIR = path.join(__dirname, "..", "uploads", "system_generated", "electronics", "user_filled");
fs.mkdirSync(PREVIEW_DIR, { recursive: true });
fs.mkdirSync(USERFILLED_DIR, { recursive: true });

/* Simple dataURL → Buffer */
function dataUrlToBuffer(dataUrl = "") {
  const b64 = String(dataUrl || "").split(",").pop();
  if (!b64) return null;
  try { return Buffer.from(b64, "base64"); } catch { return null; }
}

/* Date normalizer: from <input type="date"> "YYYY-MM-DD" → "MM/DD/YYYY" */
function fmtDate(d) {
  if (!d) return "";
  try {
    const [Y, M, D] = String(d).split("-");
    if (Y && M && D) return `${M}/${D}/${Y}`;
    return String(d);
  } catch { return String(d); }
}

/* All the coordinates live here so it’s easy to adjust */
const XY = {
  // BOX 2 (Design Professional)
  box2: {
    sig: { x: 82, y: 445, w: 220, h: 50 },
    engineer_name: { x: 350, y: 735 },
    date:          { x: 53, y: 735 },   // was 755
    address:       { x: 350, y: 705 },
    prc_no:        { x: 350, y: 675 },
    validity:      { x: 53, y: 675 },   // was 755
    ptr_no:        { x: 350, y: 647 },
    date_issued:   { x: 53, y: 647 },   // was 755
    issued_at:     { x: 350, y: 618 },
    tin:           { x: 53, y: 618 },   // was 755
  },

  // BOX 3 (Supervisor / In-Charge)
  box3: {
    sig:         { x: 82, y: 350, w: 220, h: 50 },
    role:        { x: 82,  y: 520 },
    signed_name: { x: 350, y: 520 },
    date:        { x: 53, y: 520 },     // was 755
    prc_no:      { x: 350, y: 490 },
    validity:    { x: 53, y: 490 },     // was 755
    ptr_no:      { x: 350, y: 462 },
    date_issued: { x: 53, y: 462 },     // was 755
    issued_at:   { x: 350, y: 434 },
    tin:         { x: 53, y: 434 },     // was 755
    address:     { x: 350, y: 404 },
  },

  // BOX 4 (Owner)
  box4: {
    sig:        { x: 82, y: 230, w: 220, h: 50 },
    owner_name: { x: 350, y: 285 },
    date:       { x: 53, y: 285 },      // was 755
    address:    { x: 350, y: 255 },
  },

  // BOX 5 (Lot Owner consent)
  box5: {
    sig:           { x: 82, y: 135, w: 220, h: 50 },
    lot_owner_name:{ x: 350, y: 190 },
    date:          { x: 53, y: 190 },   // was 755
    address:       { x: 350, y: 160 },
  },

  fontSize: 9,
};

/* Draw helper for a single page */
function drawText(p, font, text, x, y, size = XY.fontSize) {
  const s = String(text ?? "").trim();
  if (!s) return;

  // keep drawings within the visible page
  const pageW = p.getWidth();
  const safeX = Math.min(x, pageW - 10);

  p.drawText(s, { x: safeX, y, size, font });
}


/* Render a preview: start from template (or latest admin file if present), stamp signature(s) only */
async function renderPreviewWithSignatures({ basePdfBytes, signatures }) {
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const page = pdfDoc.getPages()[0];

  const stamp = async (dataUrl, rect) => {
    const buf = dataUrlToBuffer(dataUrl);
    if (!buf) return;
    const png = await pdfDoc.embedPng(buf);
    const { width, height } = png.size();
    const scale = Math.min(rect.w / width, rect.h / height);
    page.drawImage(png, {
      x: rect.x,
      y: rect.y,
      width: width * scale,
      height: height * scale,
    });
  };

  if (signatures.box2) await stamp(signatures.box2, XY.box2.sig);
  if (signatures.box3) await stamp(signatures.box3, XY.box3.sig);
  if (signatures.box4) await stamp(signatures.box4, XY.box4.sig);
  if (signatures.box5) await stamp(signatures.box5, XY.box5.sig);

  return await pdfDoc.save();
}

/* Render the FINAL user-filled PDF: app header fields (existing) + Boxes 2–5 texts + signatures */
async function renderFinalUserFilled({ mappedAppRow, formData, signatures }) {
  // Start with your existing app-level render (page 1 fields from DB)
  const baseBytes = await fillElectronicsTemplate(mappedAppRow);
  const pdfDoc = await PDFDocument.load(baseBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Helper to stamp PNG
  const stamp = async (dataUrl, rect) => {
    const buf = dataUrlToBuffer(dataUrl);
    if (!buf) return;
    const png = await pdfDoc.embedPng(buf);
    const { width, height } = png.size();
    const scale = Math.min(rect.w / width, rect.h / height);
    page.drawImage(png, { x: rect.x, y: rect.y, width: width * scale, height: height * scale });
  };

  // BOX 2 text (with date formatting)
  const b2 = formData.box2 || {};
  drawText(page, font, b2.engineer_name, XY.box2.engineer_name.x, XY.box2.engineer_name.y);
  drawText(page, font, fmtDate(b2.date), XY.box2.date.x, XY.box2.date.y);
  drawText(page, font, b2.address,       XY.box2.address.x,       XY.box2.address.y);
  drawText(page, font, b2.prc_no,        XY.box2.prc_no.x,        XY.box2.prc_no.y);
  drawText(page, font, b2.validity,      XY.box2.validity.x,      XY.box2.validity.y);
  drawText(page, font, b2.ptr_no,        XY.box2.ptr_no.x,        XY.box2.ptr_no.y);
  drawText(page, font, fmtDate(b2.date_issued), XY.box2.date_issued.x, XY.box2.date_issued.y);
  drawText(page, font, b2.issued_at,     XY.box2.issued_at.x,     XY.box2.issued_at.y);
  drawText(page, font, b2.tin,           XY.box2.tin.x,           XY.box2.tin.y);

  // BOX 3 text (with date formatting)
  const b3 = formData.box3 || {};
  drawText(page, font, (b3.role || "").toUpperCase(),  XY.box3.role.x, XY.box3.role.y);
  drawText(page, font, b3.signed_name, XY.box3.signed_name.x, XY.box3.signed_name.y);
  drawText(page, font, fmtDate(b3.date),        XY.box3.date.x,         XY.box3.date.y);
  drawText(page, font, b3.prc_no,      XY.box3.prc_no.x,       XY.box3.prc_no.y);
  drawText(page, font, b3.validity,    XY.box3.validity.x,     XY.box3.validity.y);
  drawText(page, font, b3.ptr_no,      XY.box3.ptr_no.x,       XY.box3.ptr_no.y);
  drawText(page, font, fmtDate(b3.date_issued), XY.box3.date_issued.x,  XY.box3.date_issued.y);
  drawText(page, font, b3.issued_at,   XY.box3.issued_at.x,    XY.box3.issued_at.y);
  drawText(page, font, b3.tin,         XY.box3.tin.x,          XY.box3.tin.y);
  drawText(page, font, b3.address,     XY.box3.address.x,      XY.box3.address.y);

  // BOX 4 text (with date formatting)
  const b4 = formData.box4 || {};
  drawText(page, font, b4.owner_name, XY.box4.owner_name.x, XY.box4.owner_name.y);
  drawText(page, font, fmtDate(b4.date),       XY.box4.date.x,       XY.box4.date.y);
  drawText(page, font, b4.address,    XY.box4.address.x,    XY.box4.address.y);

  // BOX 5 text (with date formatting)
  const b5 = formData.box5 || {};
  drawText(page, font, b5.lot_owner_name, XY.box5.lot_owner_name.x, XY.box5.lot_owner_name.y);
  drawText(page, font, fmtDate(b5.date),           XY.box5.date.x,           XY.box5.date.y);
  drawText(page, font, b5.address,        XY.box5.address.x,        XY.box5.address.y);

  // Signatures (2/3/4/5)
  if (signatures.box2) await stamp(signatures.box2, XY.box2.sig);
  if (signatures.box3) await stamp(signatures.box3, XY.box3.sig);
  if (signatures.box4) await stamp(signatures.box4, XY.box4.sig);
  if (signatures.box5) await stamp(signatures.box5, XY.box5.sig);

  return await pdfDoc.save();
}

/* ───────────── GET: load current draft, latest admin/user PDF URLs ───────────── */
exports.user_getForm = async (req, res) => {
  try {
    const application_id = Number(req.query.application_id || req.body?.application_id);
    if (!Number.isFinite(application_id) || application_id <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    // Draft row (unique by application_id)
    const rows = await q(
      `SELECT * FROM electronics_form_submissions WHERE application_id = ? LIMIT 1`,
      [application_id]
    );
    const draftRow = rows[0] || null;

    let draft = null, user_filled_url = null;
    if (draftRow) {
      draft = {
        box2: draftRow.box2 ? JSON.parse(draftRow.box2) : null,
        box3: draftRow.box3 ? JSON.parse(draftRow.box3) : null,
        box4: draftRow.box4 ? JSON.parse(draftRow.box4) : null,
        box5: draftRow.box5 ? JSON.parse(draftRow.box5) : null,
        signatures: {
          box2: draftRow.sig_box2 || null,
          box4: draftRow.sig_owner || null,
          box5: draftRow.sig_lot || null,
        },
      };
      if (draftRow.final_pdf_path) {
        const rel = toRelUploadsPath(draftRow.final_pdf_path) || draftRow.final_pdf_path;
        user_filled_url = `${PUBLIC_BASE_URL}${rel}`;
      }
    }

    // Try to show latest admin/system PDF for this application (if any)
    let admin_template_url = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'electronics' AND application_id = ?
          ORDER BY uploaded_at DESC LIMIT 1`,
        [application_id]
      );
      if (list.length) {
        const rel = toRelUploadsPath(list[0].u || list[0].p) || (list[0].p ? toRelUploadsPath(list[0].p) : null);
        if (rel) admin_template_url = `${PUBLIC_BASE_URL}${rel}`;
      }
    } catch {}

    return res.json({
      success: true,
      draft,
      admin_template_url,
      user_filled_url,
    });
  } catch (e) {
    console.error("user_getForm (electronics) error:", e);
    return res.status(500).json({ success: false, message: "Failed to load form." });
  }
};

/* ───────────── POST: save draft (text only; signatures dropped to keep payload light) ───────────── */
exports.user_saveDraft = async (req, res) => {
  try {
    const { application_id, data } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    const box2 = JSON.stringify(data?.box2 || {});
    const box3 = JSON.stringify(data?.box3 || {});
    const box4 = JSON.stringify(data?.box4 || {});
    const box5 = JSON.stringify(data?.box5 || {});

    await q(
      `INSERT INTO electronics_form_submissions (application_id, status, box2, box3, box4, box5, updated_at)
       VALUES (?, 'draft', ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status='draft', box2=VALUES(box2), box3=VALUES(box3),
                               box4=VALUES(box4), box5=VALUES(box5), updated_at=NOW()`,
      [appId, box2, box3, box4, box5]
    );

    return res.json({ success: true, message: "Draft saved." });
  } catch (e) {
    console.error("user_saveDraft (electronics) error:", e);
    return res.status(500).json({ success: false, message: "Failed to save draft." });
  }
};

/* ───────────── POST: stamp a signature onto a PREVIEW PDF ───────────── */
exports.user_stampSignaturePreview = async (req, res) => {
  try {
    const { application_id, which, data_url } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }
    if (!["box2", "box3", "box4", "box5"].includes(which)) {
      return res.status(400).json({ success: false, message: "which must be one of box2/box3/box4/box5" });
    }
    if (!data_url) {
      return res.status(400).json({ success: false, message: "data_url is required" });
    }

    // Keep signature in DB for box2/4/5 (box3 is preview-only by design)
    if (which === "box2") {
      await q(
        `INSERT INTO electronics_form_submissions (application_id, status, sig_box2, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE sig_box2=VALUES(sig_box2), updated_at=NOW()`,
        [appId, data_url]
      );
    } else if (which === "box4") {
      await q(
        `INSERT INTO electronics_form_submissions (application_id, status, sig_owner, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE sig_owner=VALUES(sig_owner), updated_at=NOW()`,
        [appId, data_url]
      );
    } else if (which === "box5") {
      await q(
        `INSERT INTO electronics_form_submissions (application_id, status, sig_lot, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE sig_lot=VALUES(sig_lot), updated_at=NOW()`,
        [appId, data_url]
      );
    }

    // Choose base PDF for preview: try latest admin/system file; fallback to raw template
    let baseBytes = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'electronics' AND application_id = ?
          ORDER BY uploaded_at DESC LIMIT 1`,
        [appId]
      );
      if (list.length) {
        const rel = toRelUploadsPath(list[0].u || list[0].p) || (list[0].p ? toRelUploadsPath(list[0].p) : null);
        if (rel) baseBytes = fs.readFileSync(path.join(__dirname, "..", rel.replace(/^\//, "")));
      }
    } catch {}
    if (!baseBytes) baseBytes = fs.readFileSync(TEMPLATE_PATH);

    // Load any already-saved sigs for composite preview
    const row = (await q(`SELECT sig_box2, sig_owner, sig_lot FROM electronics_form_submissions WHERE application_id=? LIMIT 1`, [appId]))[0] || {};
    const signatures = {
      box2: which === "box2" ? data_url : row.sig_box2 || null,
      box3: which === "box3" ? data_url : null, // not persisted
      box4: which === "box4" ? data_url : row.sig_owner || null,
      box5: which === "box5" ? data_url : row.sig_lot || null,
    };

    const outBytes = await renderPreviewWithSignatures({ basePdfBytes: baseBytes, signatures });
    const filename = `electronics-preview-${appId}-${Date.now()}.pdf`;
    const absPath  = path.join(PREVIEW_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const rel = `/uploads/system_generated/electronics/previews/${filename}`;

    await q(
      `UPDATE electronics_form_submissions SET draft_pdf_path = ?, updated_at = NOW() WHERE application_id = ?`,
      [rel, appId]
    );

    return res.json({ success: true, preview_url: `${PUBLIC_BASE_URL}${rel}` });
  } catch (e) {
    console.error("user_stampSignaturePreview (electronics) error:", e);
    return res.status(500).json({ success: false, message: "Failed to stamp signature." });
  }
};

/* ───────────── POST: submit (render FINAL PDF + attach) ───────────── */
exports.user_submitFilled = async (req, res) => {
  try {
    const { application_id, data } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    // Persist latest JSON (including signatures if present in payload)
    const box2 = JSON.stringify(data?.box2 || {});
    const box3 = JSON.stringify(data?.box3 || {});
    const box4 = JSON.stringify(data?.box4 || {});
    const box5 = JSON.stringify(data?.box5 || {});

    // Keep signatures (if data included them)
    const sig_box2 = data?.box2?.signature_data_url || null;
    const sig_owner = data?.box4?.signature_data_url || null;
    const sig_lot = data?.box5?.signature_data_url || null;

    await q(
      `INSERT INTO electronics_form_submissions (application_id, status, box2, box3, box4, box5, sig_box2, sig_owner, sig_lot, updated_at)
       VALUES (?, 'submitted', ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status='submitted', box2=VALUES(box2), box3=VALUES(box3),
                               box4=VALUES(box4), box5=VALUES(box5),
                               sig_box2=IFNULL(VALUES(sig_box2), sig_box2),
                               sig_owner=IFNULL(VALUES(sig_owner), sig_owner),
                               sig_lot=IFNULL(VALUES(sig_lot), sig_lot),
                               updated_at=NOW()`,
      [appId, box2, box3, box4, box5, sig_box2, sig_owner, sig_lot]
    );

    // Fetch application info to fill header fields
    const hit = await getElectronicsApplication(appId);
    if (!hit) return res.status(404).json({ success: false, message: "Electronics application not found" });
    const mappedApp = mapRow(hit.row);

    // Prepare signatures composite (persisted ones win if client didn't send)
    const row = (await q(`SELECT sig_box2, sig_owner, sig_lot FROM electronics_form_submissions WHERE application_id=? LIMIT 1`, [appId]))[0] || {};
    const signatures = {
      box2: sig_box2 || row.sig_box2 || null,
      box3: data?.box3?.signature_data_url || null, // preview-only but embed if sent
      box4: sig_owner || row.sig_owner || null,
      box5: sig_lot || row.sig_lot || null,
    };

    // Render final user-filled PDF
    const outBytes = await renderFinalUserFilled({
      mappedAppRow: mappedApp,
      formData: { box2: data?.box2 || {}, box3: data?.box3 || {}, box4: data?.box4 || {}, box5: data?.box5 || {} },
      signatures,
    });

    const filename = `electronics-userfilled-${appId}-${Date.now()}.pdf`;
    const absPath  = path.join(USERFILLED_DIR, filename);
    fs.writeFileSync(absPath, outBytes);
    const rel = `/uploads/system_generated/electronics/user_filled/${filename}`;
    const url = `${PUBLIC_BASE_URL}${rel}`;

    // Attach to application requirements
    await attachToAppRequirements({
      application_id: appId,
      pdf_path: rel,
      srcRow: hit.row,
    });

    // Save final path back to drafts table for quick “View last submitted”
    await q(`UPDATE electronics_form_submissions SET final_pdf_path = ?, updated_at = NOW() WHERE application_id = ?`, [rel, appId]);

    return res.json({ success: true, user_filled_url: url });
  } catch (e) {
    console.error("user_submitFilled (electronics) error:", e);
    return res.status(500).json({ success: false, message: "Failed to submit form." });
  }
};
