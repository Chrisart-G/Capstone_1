// Controller/PDF_fillefencingController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "system_generated", "fencing");
const TEMPLATE_PATH =
  process.env.FENCING_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "FENCING_PERMIT_template.pdf"); // put your fencing template here

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
    ["fencing", application_id, applicantUserId]
  );

  const after = await q(
    `SELECT app_uid, user_id
       FROM application_index
      WHERE application_type = ? AND application_id = ?
      LIMIT 1`,
    ["fencing", application_id]
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
    ["fencing_id", keyValue],
    ["fp_id", keyValue],
    ["application_no", String(keyValue)],
    ["fp_no", String(keyValue)],
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

async function getFencingApplication(application_id) {
  const tryTables = [
    "tbl_fencing_permits",
    "fencing_permit_applications",
    "fencing_permits",
    "tbl_fencing_permit",
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
    fp_no: r.fp_no || r.fencing_permit_no || "",
    building_permit_no: r.building_permit_no || r.bp_no || "",

    // Owner / applicant
    last_name: r.last_name || r.owner_last_name || "",
    first_name: r.first_name || r.owner_first_name || "",
    mi: r.middle_initial || r.mi || r.middle_name || "",

    tin: r.tin || r.tin_no || "",

    // Address (mailing)
    address_no: r.address_no || "",
    address_street: r.address_street || r.street || "",
    address_barangay: r.address_barangay || r.barangay || "",
    address_city: r.address_city || r.city_municipality || "",
    address_zip: r.address_zip_code || r.zip_code || "",
    telephone: r.telephone_no || r.mobile_no || "",

    // Use / ownership
    construction_owned: r.construction_owned || "",
    form_of_ownership: r.ownership_form || r.form_of_ownership || "",
    use_or_character: r.use_or_character || "",

    // Location (site)
    loc_street: r.location_street || "",
    loc_lot: r.location_lot_no || r.lot_no || "",
    loc_blk1: r.location_blk_no || r.block_no1 || r.blk_no || "",
    loc_blk2: r.block_no2 || "",
    loc_tct: r.location_tct_no || r.tct_no || "",
    loc_tax: r.location_tax_dec_no || r.tax_dec_no || "",

    // Summary
    scope_of_work: r.scope_of_work || "",

    // City / Brgy duplicates for template
    city_municipality: r.address_city || r.city_municipality || "",
    barangay: r.address_barangay || r.barangay || "",
  };
}

/* ───────── PDF filler (coords: start with sane defaults, tweak as needed) ───────── */
async function fillFencingTemplate(mapped) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Fencing template not found at: ${TEMPLATE_PATH}\n` +
        `Set FENCING_TEMPLATE_PATH in your .env to the correct PDF path.`
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
  draw(mapped.fp_no,          215, 892);
  draw(mapped.building_permit_no, 410, 892);

  // Applicant name / TIN  (MI • Last • First • TIN)
  draw(mapped.mi,         35, 830);
  draw(mapped.last_name, 160, 830);
  draw(mapped.first_name,260, 830);
  draw(mapped.tin,       390, 830);

  // Ownership / Use
  draw(mapped.construction_owned, 14, 800);
  draw(mapped.form_of_ownership, 211, 800);
  draw(mapped.use_or_character,  407, 800);

  // Mailing Address
  draw(mapped.address_no,      105, 730);
  draw(mapped.address_street,  160, 730);
  draw(mapped.address_barangay,247, 730);
  draw(mapped.address_city,    333, 730);
  draw(mapped.address_zip,     435, 730);
  draw(mapped.telephone,       479, 730);

  // Site Location (Lot/Blk/TCT/Tax/Street/Brgy/City)
  draw(mapped.loc_lot,         220, 712);
  const blkCombo = [mapped.loc_blk1, mapped.loc_blk2].filter(Boolean).join("–");
  draw(blkCombo,               330, 712);

  draw(mapped.loc_tct,          50, 690);
  draw(mapped.loc_tax,         481, 680);

  draw(mapped.loc_street,       54, 661);
  draw(mapped.barangay,        169, 661);
  draw(mapped.city_municipality,365,661);

  // Scope / description
  draw(mapped.scope_of_work,   105, 599);

  return await pdfDoc.save();
}

/* ───────── Attach into tbl_application_requirements (and legacy table) ───────── */
async function attachToAppRequirements({ application_id, pdf_path, srcRow }) {
  let app_uid = null;
  let applicantUserId = null;
  try {
    const idx = await ensureAppIndex("fencing", application_id, srcRow);
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

  const FILE_LABEL = "Fencing Permit Filled Form";
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
    ["fencing", application_id, FILE_LABEL]
  );

  if (dupe.length) {
    const oldRel = toRelUploadsPath(dupe[0]);

    const sets = [];
    const vals = [];
    if (hasPdfPath) { sets.push("pdf_path = ?"); vals.push(relPath); }
    if (hasFileUrl) { sets.push("file_url = ?"); vals.push(absUrl); }
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
    return;
  }

  // insert
  const colsIns = [];
  const valsIns = [];
  const ph = [];

  if (hasAppUid) { colsIns.push("app_uid"); valsIns.push(app_uid); ph.push("?"); }
  if (hasUserId) { colsIns.push("user_id"); valsIns.push(applicantUserId); ph.push("?"); }

  if (hasFilePath) { colsIns.push("file_path"); valsIns.push(FILE_LABEL); ph.push("?"); }

  colsIns.push("application_type"); valsIns.push("fencing"); ph.push("?");
  colsIns.push("application_id");  valsIns.push(application_id); ph.push("?");

  if (hasPdfPath) { colsIns.push("pdf_path"); valsIns.push(relPath); ph.push("?"); }
  if (hasFileUrl) { colsIns.push("file_url"); valsIns.push(absUrl); ph.push("?"); }
  if (hasUploadedAt) { colsIns.push("uploaded_at"); ph.push("NOW()"); }

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
    const baseVals = ["fencing", application_id, relPath, "system"];
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
exports.generateFilledFencing = async (req, res) => {
  try {
    const { application_id } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required and must be a positive number" });
    }

    const hit = await getFencingApplication(appId);
    if (!hit) return res.status(404).json({ success: false, message: "Fencing application not found" });

    const row = hit.row;
    const mapped = mapRow(row);
    const outBytes = await fillFencingTemplate(mapped);

    const filename = `fencing-${appId}-${Date.now()}.pdf`;
    const absPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const relPath = `/uploads/system_generated/fencing/${filename}`;

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
    console.error("generateFilledFencing error:", err);
    return res.status(500).json({ success: false, message: "Server error generating Fencing form." });
  }
};

/* ───────── Remove handler ───────── */
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
    console.error("removeAttachedRequirement (fencing) error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove requirement." });
  }
};




/* ───────────────────────── USER INLINE (Boxes 2–5 for FENCING) ───────────────────────── */

const PREVIEW_DIR_F = path.join(__dirname, "..", "uploads", "system_generated", "fencing", "previews");
const USERFILLED_DIR_F = path.join(__dirname, "..", "uploads", "system_generated", "fencing", "user_filled");
fs.mkdirSync(PREVIEW_DIR_F, { recursive: true });
fs.mkdirSync(USERFILLED_DIR_F, { recursive: true });

function dataUrlToBuffer(dataUrl = "") {
  const b64 = String(dataUrl || "").split(",").pop();
  if (!b64) return null;
  try { return Buffer.from(b64, "base64"); } catch { return null; }
}

function fmtDate(d) {
  if (!d) return "";
  try {
    const [Y, M, D] = String(d).split("-");
    if (Y && M && D) return `${M}/${D}/${Y}`;
    return String(d);
  } catch { return String(d); }
}

/* If your fencing layout is similar to electronics, these XY will work.
   Tweak as needed after a quick visual test. */
const FXY = {
  box2: {
    sig: { x: 82, y: 445, w: 220, h: 50 },
    engineer_name: { x: 350, y: 735 },
    date:          { x: 53,  y: 735 },
    address:       { x: 350, y: 705 },
    prc_no:        { x: 350, y: 675 },
    validity:      { x: 53,  y: 675 },
    ptr_no:        { x: 350, y: 647 },
    date_issued:   { x: 53,  y: 647 },
    issued_at:     { x: 350, y: 618 },
    tin:           { x: 53,  y: 618 },
  },
  box3: {
    sig:         { x: 82, y: 350, w: 220, h: 50 },
    role:        { x: 82,  y: 520 },
    signed_name: { x: 350, y: 520 },
    date:        { x: 53,  y: 520 },
    prc_no:      { x: 350, y: 490 },
    validity:    { x: 53,  y: 490 },
    ptr_no:      { x: 350, y: 462 },
    date_issued: { x: 53,  y: 462 },
    issued_at:   { x: 350, y: 434 },
    tin:         { x: 53,  y: 434 },
    address:     { x: 350, y: 404 },
  },
  box4: {
    sig:        { x: 82, y: 230, w: 220, h: 50 },
    owner_name: { x: 350, y: 285 },
    date:       { x: 53,  y: 285 },
    address:    { x: 350, y: 255 },
  },
  box5: {
    sig:            { x: 82, y: 135, w: 220, h: 50 },
    lot_owner_name: { x: 350, y: 190 },
    date:           { x: 53,  y: 190 },
    address:        { x: 350, y: 160 },
  },
  fontSize: 9,
};

function drawTextF(p, font, text, x, y, size = FXY.fontSize) {
  const s = String(text ?? "").trim();
  if (!s) return;
  const pageW = p.getWidth();
  p.drawText(s, { x: Math.min(x, pageW - 10), y, size, font });
}

async function renderPreviewWithSignaturesF({ basePdfBytes, signatures }) {
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const page = pdfDoc.getPages()[0];

  const stamp = async (dataUrl, rect) => {
    const buf = dataUrlToBuffer(dataUrl);
    if (!buf) return;
    const png = await pdfDoc.embedPng(buf);
    const { width, height } = png.size();
    const scale = Math.min(rect.w / width, rect.h / height);
    page.drawImage(png, { x: rect.x, y: rect.y, width: width * scale, height: height * scale });
  };

  if (signatures.box2) await stamp(signatures.box2, FXY.box2.sig);
  if (signatures.box3) await stamp(signatures.box3, FXY.box3.sig);
  if (signatures.box4) await stamp(signatures.box4, FXY.box4.sig);
  if (signatures.box5) await stamp(signatures.box5, FXY.box5.sig);

  return await pdfDoc.save();
}

async function renderFinalUserFilledF({ mappedAppRow, formData, signatures }) {
  // Start from fencing header render (page 1 DB fields)
  const baseBytes = await fillFencingTemplate(mappedAppRow);
  const pdfDoc = await PDFDocument.load(baseBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const stamp = async (dataUrl, rect) => {
    const buf = dataUrlToBuffer(dataUrl);
    if (!buf) return;
    const png = await pdfDoc.embedPng(buf);
    const { width, height } = png.size();
    const scale = Math.min(rect.w / width, rect.h / height);
    page.drawImage(png, { x: rect.x, y: rect.y, width: width * scale, height: height * scale });
  };

  // BOX 2
  const b2 = formData.box2 || {};
  drawTextF(page, font, b2.engineer_name, FXY.box2.engineer_name.x, FXY.box2.engineer_name.y);
  drawTextF(page, font, fmtDate(b2.date), FXY.box2.date.x, FXY.box2.date.y);
  drawTextF(page, font, b2.address, FXY.box2.address.x, FXY.box2.address.y);
  drawTextF(page, font, b2.prc_no, FXY.box2.prc_no.x, FXY.box2.prc_no.y);
  drawTextF(page, font, b2.validity, FXY.box2.validity.x, FXY.box2.validity.y);
  drawTextF(page, font, b2.ptr_no, FXY.box2.ptr_no.x, FXY.box2.ptr_no.y);
  drawTextF(page, font, fmtDate(b2.date_issued), FXY.box2.date_issued.x, FXY.box2.date_issued.y);
  drawTextF(page, font, b2.issued_at, FXY.box2.issued_at.x, FXY.box2.issued_at.y);
  drawTextF(page, font, b2.tin, FXY.box2.tin.x, FXY.box2.tin.y);

  // BOX 3
  const b3 = formData.box3 || {};
  drawTextF(page, font, (b3.role || "").toUpperCase(), FXY.box3.role.x, FXY.box3.role.y);
  drawTextF(page, font, b3.signed_name, FXY.box3.signed_name.x, FXY.box3.signed_name.y);
  drawTextF(page, font, fmtDate(b3.date), FXY.box3.date.x, FXY.box3.date.y);
  drawTextF(page, font, b3.prc_no, FXY.box3.prc_no.x, FXY.box3.prc_no.y);
  drawTextF(page, font, b3.validity, FXY.box3.validity.x, FXY.box3.validity.y);
  drawTextF(page, font, b3.ptr_no, FXY.box3.ptr_no.x, FXY.box3.ptr_no.y);
  drawTextF(page, font, fmtDate(b3.date_issued), FXY.box3.date_issued.x, FXY.box3.date_issued.y);
  drawTextF(page, font, b3.issued_at, FXY.box3.issued_at.x, FXY.box3.issued_at.y);
  drawTextF(page, font, b3.tin, FXY.box3.tin.x, FXY.box3.tin.y);
  drawTextF(page, font, b3.address, FXY.box3.address.x, FXY.box3.address.y);

  // BOX 4
  const b4 = formData.box4 || {};
  drawTextF(page, font, b4.owner_name, FXY.box4.owner_name.x, FXY.box4.owner_name.y);
  drawTextF(page, font, fmtDate(b4.date), FXY.box4.date.x, FXY.box4.date.y);
  drawTextF(page, font, b4.address, FXY.box4.address.x, FXY.box4.address.y);

  // BOX 5
  const b5 = formData.box5 || {};
  drawTextF(page, font, b5.lot_owner_name, FXY.box5.lot_owner_name.x, FXY.box5.lot_owner_name.y);
  drawTextF(page, font, fmtDate(b5.date), FXY.box5.date.x, FXY.box5.date.y);
  drawTextF(page, font, b5.address, FXY.box5.address.x, FXY.box5.address.y);

  // Signatures
  if (signatures.box2) await stamp(signatures.box2, FXY.box2.sig);
  if (signatures.box3) await stamp(signatures.box3, FXY.box3.sig);
  if (signatures.box4) await stamp(signatures.box4, FXY.box4.sig);
  if (signatures.box5) await stamp(signatures.box5, FXY.box5.sig);

  return await pdfDoc.save();
}

/* GET: load draft + latest admin/user URLs */
exports.user_getForm = async (req, res) => {
  try {
    const application_id = Number(req.query.application_id || req.body?.application_id);
    if (!Number.isFinite(application_id) || application_id <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    const rows = await q(`SELECT * FROM fencing_form_submissions WHERE application_id = ? LIMIT 1`, [application_id]);
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

    // latest admin/system PDF for this application (if any)
    let admin_template_url = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'fencing' AND application_id = ?
          ORDER BY uploaded_at DESC LIMIT 1`,
        [application_id]
      );
      if (list.length) {
        const rel = toRelUploadsPath(list[0].u || list[0].p) || (list[0].p ? toRelUploadsPath(list[0].p) : null);
        if (rel) admin_template_url = `${PUBLIC_BASE_URL}${rel}`;
      }
    } catch {}

    return res.json({ success: true, draft, admin_template_url, user_filled_url });
  } catch (e) {
    console.error("user_getForm (fencing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to load form." });
  }
};

/* POST: save draft (text only) */
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
      `INSERT INTO fencing_form_submissions (application_id, status, box2, box3, box4, box5, updated_at)
       VALUES (?, 'draft', ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status='draft', box2=VALUES(box2), box3=VALUES(box3),
                               box4=VALUES(box4), box5=VALUES(box5), updated_at=NOW()`,
      [appId, box2, box3, box4, box5]
    );

    return res.json({ success: true, message: "Draft saved." });
  } catch (e) {
    console.error("user_saveDraft (fencing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to save draft." });
  }
};

/* POST: stamp a signature onto a PREVIEW PDF */
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

    // Persist for box2/4/5 (box3 stays preview-only by design)
    if (which === "box2") {
      await q(
        `INSERT INTO fencing_form_submissions (application_id, status, sig_box2, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE sig_box2=VALUES(sig_box2), updated_at=NOW()`,
        [appId, data_url]
      );
    } else if (which === "box4") {
      await q(
        `INSERT INTO fencing_form_submissions (application_id, status, sig_owner, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE sig_owner=VALUES(sig_owner), updated_at=NOW()`,
        [appId, data_url]
      );
    } else if (which === "box5") {
      await q(
        `INSERT INTO fencing_form_submissions (application_id, status, sig_lot, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE sig_lot=VALUES(sig_lot), updated_at=NOW()`,
        [appId, data_url]
      );
    }

    // base PDF for preview: latest admin/system else raw template
    let baseBytes = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'fencing' AND application_id = ?
          ORDER BY uploaded_at DESC LIMIT 1`,
        [appId]
      );
      if (list.length) {
        const rel = toRelUploadsPath(list[0].u || list[0].p) || (list[0].p ? toRelUploadsPath(list[0].p) : null);
        if (rel) baseBytes = fs.readFileSync(path.join(__dirname, "..", rel.replace(/^\//, "")));
      }
    } catch {}
    if (!baseBytes) baseBytes = fs.readFileSync(TEMPLATE_PATH);

    const row = (await q(
      `SELECT sig_box2, sig_owner, sig_lot FROM fencing_form_submissions WHERE application_id=? LIMIT 1`,
      [appId]
    ))[0] || {};

    const signatures = {
      box2: which === "box2" ? data_url : row.sig_box2 || null,
      box3: which === "box3" ? data_url : null, // not persisted
      box4: which === "box4" ? data_url : row.sig_owner || null,
      box5: which === "box5" ? data_url : row.sig_lot || null,
    };

    const outBytes = await renderPreviewWithSignaturesF({ basePdfBytes: baseBytes, signatures });
    const filename = `fencing-preview-${appId}-${Date.now()}.pdf`;
    const absPath  = path.join(PREVIEW_DIR_F, filename);
    fs.writeFileSync(absPath, outBytes);

    const rel = `/uploads/system_generated/fencing/previews/${filename}`;
    await q(`UPDATE fencing_form_submissions SET draft_pdf_path = ?, updated_at = NOW() WHERE application_id = ?`,
      [rel, appId]
    );

    return res.json({ success: true, preview_url: `${PUBLIC_BASE_URL}${rel}` });
  } catch (e) {
    console.error("user_stampSignaturePreview (fencing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to stamp signature." });
  }
};

/* POST: submit (render FINAL PDF + attach to requirements) */
exports.user_submitFilled = async (req, res) => {
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

    const sig_box2 = data?.box2?.signature_data_url || null;
    const sig_owner = data?.box4?.signature_data_url || null;
    const sig_lot = data?.box5?.signature_data_url || null;

    await q(
      `INSERT INTO fencing_form_submissions (application_id, status, box2, box3, box4, box5, sig_box2, sig_owner, sig_lot, updated_at)
       VALUES (?, 'submitted', ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status='submitted', box2=VALUES(box2), box3=VALUES(box3),
                               box4=VALUES(box4), box5=VALUES(box5),
                               sig_box2=IFNULL(VALUES(sig_box2), sig_box2),
                               sig_owner=IFNULL(VALUES(sig_owner), sig_owner),
                               sig_lot=IFNULL(VALUES(sig_lot), sig_lot),
                               updated_at=NOW()`,
      [appId, box2, box3, box4, box5, sig_box2, sig_owner, sig_lot]
    );

    const hit = await getFencingApplication(appId);
    if (!hit) return res.status(404).json({ success: false, message: "Fencing application not found" });
    const mappedApp = mapRow(hit.row);

    const row = (await q(
      `SELECT sig_box2, sig_owner, sig_lot FROM fencing_form_submissions WHERE application_id=? LIMIT 1`,
      [appId]
    ))[0] || {};

    const signatures = {
      box2: sig_box2 || row.sig_box2 || null,
      box3: data?.box3?.signature_data_url || null, // we embed it if sent with submit
      box4: sig_owner || row.sig_owner || null,
      box5: sig_lot || row.sig_lot || null,
    };

    const outBytes = await renderFinalUserFilledF({
      mappedAppRow: mappedApp,
      formData: { box2: data?.box2 || {}, box3: data?.box3 || {}, box4: data?.box4 || {}, box5: data?.box5 || {} },
      signatures,
    });

    const filename = `fencing-userfilled-${appId}-${Date.now()}.pdf`;
    const absPath  = path.join(USERFILLED_DIR_F, filename);
    fs.writeFileSync(absPath, outBytes);

    const rel = `/uploads/system_generated/fencing/user_filled/${filename}`;
    const url = `${PUBLIC_BASE_URL}${rel}`;

    await attachToAppRequirements({ application_id: appId, pdf_path: rel, srcRow: hit.row });

    await q(`UPDATE fencing_form_submissions SET final_pdf_path = ?, updated_at = NOW() WHERE application_id = ?`,
      [rel, appId]
    );

    return res.json({ success: true, user_filled_url: url });
  } catch (e) {
    console.error("user_submitFilled (fencing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to submit form." });
  }
};
