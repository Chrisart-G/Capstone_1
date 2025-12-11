// Controller/PDF_fillplumbingController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");


/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "system_generated", "plumbing");
const USERFILLED_DIR_P = path.join(UPLOADS_ROOT, "user_filled"); 
const TEMPLATE_PATH =
  process.env.PLUMBING_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "PLUMBING_PERMIT_template.pdf"); // put your plumbing template here

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
    ["plumbing", application_id, applicantUserId]
  );

  const after = await q(
    `SELECT app_uid, user_id
       FROM application_index
      WHERE application_type = ? AND application_id = ?
      LIMIT 1`,
    ["plumbing", application_id]
  );
  return after[0];
}

/* ───────── tolerant loader ───────── */
async function getByKeys(table, keyValue) {
  const cols = await tableColumns(table);
  if (cols.size === 0) return null;

  const candidates = [
    ["id", keyValue],
    ["application_id", keyValue],
    ["plumbing_id", keyValue],
    ["pp_id", keyValue],
    ["application_no", String(keyValue)],
    ["pp_no", String(keyValue)],
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

async function getPlumbingApplication(application_id) {
  const tryTables = [
    "tbl_plumbing_permits",      // main table in your dump
    "plumbing_permit_applications",
    "plumbing_permits",
    "tbl_plumbing_permit",
  ];
  for (const t of tryTables) {
    const row = await getByKeys(t, application_id);
    if (row) return { row, table: t };
  }
  return null;
}

/* ───────── Row → PDF template mapping ─────────
   Columns reference (tbl_plumbing_permits) includes:
   application_no, pp_no, building_permit_no, last_name, first_name, middle_initial, tin,
   construction_owned, form_of_ownership, use_or_character, address_* , telephone_no,
   location_* , scope_of_work, other_scope_specify, etc.  */
function mapRow(r) {
  if (!r) return null;
  return {
    // Header numbers
    application_no: r.application_no || r.app_no || "",
    pp_no: r.pp_no || r.plumbing_permit_no || "",
    building_permit_no: r.building_permit_no || r.bp_no || "",

    // Owner / applicant
    last_name: r.last_name || r.owner_last_name || "",
    first_name: r.first_name || r.owner_first_name || "",
    mi: r.middle_initial || r.mi || r.middle_name || "",

    tin: r.tin || r.tin_no || "",

    // Address (mailing)
    address_no: r.address_no || "",
    address_street: r.address_street || r.street || "",
    address_barangay: r.address_barangay || r.location_barangay || "",
    address_city: r.address_city || r.location_city || "",
    address_zip: r.address_zip_code || r.zip_code || "",
    telephone: r.telephone_no || r.mobile_no || "",

    // Use / ownership
    construction_owned: r.construction_owned || "",
    form_of_ownership: r.form_of_ownership || "",
    use_or_character: r.use_or_character || "",

    // Location (site)
    loc_street: r.location_street || "",
    loc_lot: r.location_lot_no || r.lot_no || "",
    loc_blk: r.location_blk_no || r.block_no || "",
    loc_tct: r.location_tct_no || r.tct_no || "",
    loc_tax: r.location_tax_dec_no || r.tax_dec_no || "",

    // Summary
    scope_of_work: r.scope_of_work || "",
    other_scope_specify: r.other_scope_specify || "",

    // Duplicates for template convenience
    city_municipality: r.address_city || r.location_city || "",
    barangay: r.address_barangay || r.location_barangay || "",
  };
}

/* ───────── PDF filler (coords similar to Fencing—tune to your template) ───────── */
async function fillPlumbingTemplate(mapped) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Plumbing template not found at: ${TEMPLATE_PATH}\n` +
        `Set PLUMBING_TEMPLATE_PATH in your .env to the correct PDF path.`
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
  draw(mapped.pp_no,          215, 892);
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

  // Site Location
  draw(mapped.loc_lot,         220, 712);
  draw(mapped.loc_blk,         330, 712);
  draw(mapped.loc_tct,          50, 690);
  draw(mapped.loc_tax,         481, 680);
  draw(mapped.loc_street,       54, 661);
  draw(mapped.barangay,        169, 661);
  draw(mapped.city_municipality,365,661);

  // Scope / description
  const scopeLine = [mapped.scope_of_work, mapped.other_scope_specify].filter(Boolean).join(" – ");
  draw(scopeLine, 105, 599);

  return await pdfDoc.save();
}

/* ───────── Attach into tbl_application_requirements ───────── */
async function attachToAppRequirements({ application_id, pdf_path, srcRow }) {
  let app_uid = null;
  let applicantUserId = null;
  try {
    const idx = await ensureAppIndex("plumbing", application_id, srcRow);
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

  const FILE_LABEL = "Plumbing Permit Filled Form";
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
    ["plumbing", application_id, FILE_LABEL]
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

    // cleanup old if unreferenced
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

  colsIns.push("application_type"); valsIns.push("plumbing"); ph.push("?");
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
    const baseVals = ["plumbing", application_id, relPath, "system"];
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
exports.generateFilledPlumbing = async (req, res) => {
  try {
    const { application_id } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required and must be a positive number" });
    }

    const hit = await getPlumbingApplication(appId);
    if (!hit) return res.status(404).json({ success: false, message: "Plumbing application not found" });

    const row = hit.row;
    const mapped = mapRow(row);
    const outBytes = await fillPlumbingTemplate(mapped);

    const filename = `plumbing-${appId}-${Date.now()}.pdf`;
    const absPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const relPath = `/uploads/system_generated/plumbing/${filename}`;

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
    console.error("generateFilledPlumbing error:", err);
    return res.status(500).json({ success: false, message: "Server error generating Plumbing form." });
  }
};






// ───────────────────────── USER INLINE (Boxes 2–6 for PLUMBING) ─────────────────────────
const PREVIEW_DIR_P = path.join(UPLOADS_ROOT, "previews");

// Ensure all dirs exist
fs.mkdirSync(UPLOAD_DIR, { recursive: true });        // you already had this
fs.mkdirSync(USERFILLED_DIR_P, { recursive: true });   // ensure /uploads/user_filled exists
fs.mkdirSync(PREVIEW_DIR_P, { recursive: true });  
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

/* ── XY map (page 1). You may fine-tune a few pixels depending on your template offset. */
const PXY = {
  // BOX 2 — fixtures grid (template like the screenshot)
  // For each row we set Qty, New box, Existing box. We have left and right columns.
  box2: {
    sig: { x: 82, y: 445, w: 220, h: 50 }, // "Prepared by" signature area beneath the table
    // left column baselines
    left: {
      originY: 696,      // top row Y
      rowGap: 18.4,      // distance between rows
      xQty:  30,         // Qty value
      xNew:  98,         // mark "X" in this square for NEW
      xExist: 132,       // mark "X" in this square for EXISTING
      xOthersText: 228,  // free text for "Others"
      totalY:  456,      // "TOTAL" line (left side)
      xTotal:  62        // where we draw the sum number on "TOTAL" (left)
    },
    right: {
      originY: 696,
      rowGap: 18.4,
      xQty:   515,
      xNew:   582,
      xExist: 616,
      xOthersText: 712,
      totalY: 456,
      xTotal: 548
    },
    // bottom four system checkboxes (x,y is center of the small box to place an "X")
    systems: {
      water_distribution: { x: 34,  y: 430 },
      sewage_system:      { x: 270, y: 430 },
      septic_tank:        { x: 468, y: 430 },
      storm_drainage:     { x: 640, y: 430 },
    },
  },

  // BOX 3 – Design Professional (plans/specs)
  box3: {
    sig:         { x: 82,  y: 350, w: 220, h: 50 },
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

  // BOX 4 – Supervisor / In-Charge
  box4: {
    sig:         { x: 82,  y: 230, w: 220, h: 50 },
    signed_name: { x: 350, y: 285 },
    date:        { x: 53,  y: 285 },
    address:     { x: 350, y: 255 },
    prc_no:      { x: 350, y: 225 },
    validity:    { x: 53,  y: 225 },
    ptr_no:      { x: 350, y: 197 },
    date_issued: { x: 53,  y: 197 },
    issued_at:   { x: 350, y: 169 },
    tin:         { x: 53,  y: 169 },
  },

  // BOX 5 – Design Professional (CTC)
  box5: {
    sig:            { x: 82,  y: 120, w: 220, h: 50 },
    signed_name:    { x: 350, y: 135 },
    date:           { x: 53,  y: 135 },
    address:        { x: 350, y: 110 },
    ctc_no:         { x: 140, y: 90 },
    ctc_date_issued:{ x: 300, y: 90 },
    ctc_place_issued:{x: 430, y: 90 },
  },

  // BOX 6 – Supervisor/In-Charge (CTC)
  box6: {
    sig:            { x: 82,  y: 60,  w: 220, h: 50 },
    signed_name:    { x: 350, y: 75 },
    date:           { x: 53,  y: 75 },
    address:        { x: 350, y: 52 },
    ctc_no:         { x: 140, y: 34 },
    ctc_date_issued:{ x: 300, y: 34 },
    ctc_place_issued:{x: 430, y: 34 },
  },

  fontSize: 9,
};

function drawTextP(p, font, text, x, y, size = PXY.fontSize) {
  const s = String(text ?? "").trim();
  if (!s) return;
  const pageW = p.getWidth();
  p.drawText(s, { x: Math.min(x, pageW - 10), y, size, font });
}

async function renderPreviewWithSignaturesP({ basePdfBytes, signatures }) {
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

  if (signatures.box2) await stamp(signatures.box2, PXY.box2.sig);
  if (signatures.box3) await stamp(signatures.box3, PXY.box3.sig);
  if (signatures.box4) await stamp(signatures.box4, PXY.box4.sig);
  if (signatures.box5) await stamp(signatures.box5, PXY.box5.sig);
  if (signatures.box6) await stamp(signatures.box6, PXY.box6.sig);

  return await pdfDoc.save();
}

/* ---------- FIXTURE DEFINITIONS (match the frontend keys/order) ---------- */
const FIXTURES_LEFT = [
  { key: "water_closet",     label: "WATER CLOSET" },
  { key: "floor_drain",      label: "FLOOR DRAIN" },
  { key: "lavatory",         label: "LAVATORY" },
  { key: "kitchen_sink",     label: "KITCHEN SINK" },
  { key: "faucet",           label: "FAUCET" },
  { key: "shower_head",      label: "SHOWER HEAD" },
  { key: "water_meter",      label: "WATER METER" },
  { key: "grease_trap",      label: "GREASE TRAP" },
  { key: "bath_tub",         label: "BATH TUB" },
  { key: "slop_sink",        label: "SLOP SINK" },
  { key: "urinal",           label: "URINAL" },
  { key: "aircon_unit",      label: "AIR CONDITIONING UNIT" },
  { key: "water_tank",       label: "WATER TANK / RESERVOIR" },
];

const FIXTURES_RIGHT = [
  { key: "bidet",            label: "BIDET" },
  { key: "laundry_trays",    label: "LAUNDRY TRAYS" },
  { key: "dental_cuspidor",  label: "DENTAL CUSPIDOR" },
  { key: "drinking_fountain",label: "DRINKING FOUNTAIN" },
  { key: "bar_sink",         label: "BAR SINK" },
  { key: "soda_fountain_sink", label: "SODA FOUNTAIN SINK" },
  { key: "laboratory_sink",  label: "LABORATORY SINK" },
  { key: "sterilizer",       label: "STERILIZER" },
  { key: "others",           label: "OTHERS (Specify)" },
];

function numberOrZero(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

async function renderFinalUserFilledP({ mappedAppRow, formData, signatures, baseBytes }) {
  const pdfDoc = await PDFDocument.load(baseBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = PXY.fontSize;

  /* ========== BOX 2: render fixtures grid, totals, systems and signature ========== */
  const b2 = formData.box2 || {};
  const left = b2.fixtures_left || {};
  const right = b2.fixtures_right || {};
  const systems = b2.systems || {};
  const rowGap = PXY.box2.left.rowGap;

  // draw an X mark at (cx, cy) roughly centered in a small checkbox square
  const drawX = (cx, cy) => {
    const d = 4.5;
    page.drawLine({ start: { x: cx - d, y: cy - d }, end: { x: cx + d, y: cy + d }, thickness: 0.8 });
    page.drawLine({ start: { x: cx - d, y: cy + d }, end: { x: cx + d, y: cy - d }, thickness: 0.8 });
  };

  // LEFT column rows
  let y = PXY.box2.left.originY;
  let totalLeft = 0;
  for (let i = 0; i < FIXTURES_LEFT.length; i++) {
    const key = FIXTURES_LEFT[i].key;
    const row = left[key] || {};
    const qty = numberOrZero(row.qty);
    totalLeft += qty;

    // Qty
    if (qty) drawTextP(page, font, String(qty), PXY.box2.left.xQty, y, size);

    // New / Existing
    if (row.is_new) drawX(PXY.box2.left.xNew, y + 3);
    if (row.is_existing) drawX(PXY.box2.left.xExist, y + 3);

    // Others text field
    if (key === "water_tank" /* last */ && left.others?.text) {
      drawTextP(page, font, String(left.others.text || ""), PXY.box2.left.xOthersText, y - rowGap, size);
    }

    y -= rowGap;
  }
  // LEFT total
  if (totalLeft) drawTextP(page, font, String(totalLeft), PXY.box2.left.xTotal, PXY.box2.left.totalY, size);

  // RIGHT column rows
  y = PXY.box2.right.originY;
  let totalRight = 0;
  for (let i = 0; i < FIXTURES_RIGHT.length; i++) {
    const key = FIXTURES_RIGHT[i].key;
    const row = right[key] || {};
    const qty = numberOrZero(row.qty);
    totalRight += qty;

    if (qty) drawTextP(page, font, String(qty), PXY.box2.right.xQty, y, size);
    if (row.is_new) drawX(PXY.box2.right.xNew, y + 3);
    if (row.is_existing) drawX(PXY.box2.right.xExist, y + 3);
    if (key === "others" && row.text) {
      drawTextP(page, font, String(row.text), PXY.box2.right.xOthersText, y, size);
    }
    y -= rowGap;
  }
  if (totalRight) drawTextP(page, font, String(totalRight), PXY.box2.right.xTotal, PXY.box2.right.totalY, size);

  // systems checkboxes
  if (systems.water_distribution) drawX(PXY.box2.systems.water_distribution.x, PXY.box2.systems.water_distribution.y);
  if (systems.sewage_system)      drawX(PXY.box2.systems.sewage_system.x,      PXY.box2.systems.sewage_system.y);
  if (systems.septic_tank)        drawX(PXY.box2.systems.septic_tank.x,        PXY.box2.systems.septic_tank.y);
  if (systems.storm_drainage)     drawX(PXY.box2.systems.storm_drainage.x,     PXY.box2.systems.storm_drainage.y);

  // Signature for "Prepared by"
  if (signatures.box2) {
    const buf = dataUrlToBuffer(signatures.box2);
    if (buf) {
      const png = await pdfDoc.embedPng(buf);
      const { width, height } = png.size();
      const scale = Math.min(PXY.box2.sig.w / width, PXY.box2.sig.h / height);
      page.drawImage(png, {
        x: PXY.box2.sig.x,
        y: PXY.box2.sig.y,
        width: width * scale,
        height: height * scale,
      });
    }
  }

  /* ========== BOX 3–6 (unchanged from your implementation) ========== */
  const b3 = formData.box3 || {};
  drawTextP(page, font, b3.signed_name, PXY.box3.signed_name.x, PXY.box3.signed_name.y);
  drawTextP(page, font, fmtDate(b3.date), PXY.box3.date.x, PXY.box3.date.y);
  drawTextP(page, font, b3.prc_no, PXY.box3.prc_no.x, PXY.box3.prc_no.y);
  drawTextP(page, font, b3.validity, PXY.box3.validity.x, PXY.box3.validity.y);
  drawTextP(page, font, b3.ptr_no, PXY.box3.ptr_no.x, PXY.box3.ptr_no.y);
  drawTextP(page, font, fmtDate(b3.date_issued), PXY.box3.date_issued.x, PXY.box3.date_issued.y);
  drawTextP(page, font, b3.issued_at, PXY.box3.issued_at.x, PXY.box3.issued_at.y);
  drawTextP(page, font, b3.tin, PXY.box3.tin.x, PXY.box3.tin.y);
  drawTextP(page, font, b3.address, PXY.box3.address.x, PXY.box3.address.y);

  const b4 = formData.box4 || {};
  drawTextP(page, font, b4.signed_name, PXY.box4.signed_name.x, PXY.box4.signed_name.y);
  drawTextP(page, font, fmtDate(b4.date), PXY.box4.date.x, PXY.box4.date.y);
  drawTextP(page, font, b4.address, PXY.box4.address.x, PXY.box4.address.y);
  drawTextP(page, font, b4.prc_no, PXY.box4.prc_no.x, PXY.box4.prc_no.y);
  drawTextP(page, font, b4.validity, PXY.box4.validity.x, PXY.box4.validity.y);
  drawTextP(page, font, b4.ptr_no, PXY.box4.ptr_no.x, PXY.box4.ptr_no.y);
  drawTextP(page, font, fmtDate(b4.date_issued), PXY.box4.date_issued.x, PXY.box4.date_issued.y);
  drawTextP(page, font, b4.issued_at, PXY.box4.issued_at.x, PXY.box4.issued_at.y);
  drawTextP(page, font, b4.tin, PXY.box4.tin.x, PXY.box4.tin.y);

  const b5 = formData.box5 || {};
  drawTextP(page, font, b5.signed_name, PXY.box5.signed_name.x, PXY.box5.signed_name.y);
  drawTextP(page, font, fmtDate(b5.date), PXY.box5.date.x, PXY.box5.date.y);
  drawTextP(page, font, b5.address, PXY.box5.address.x, PXY.box5.address.y);
  drawTextP(page, font, b5.ctc_no, PXY.box5.ctc_no.x, PXY.box5.ctc_no.y);
  drawTextP(page, font, fmtDate(b5.ctc_date_issued), PXY.box5.ctc_date_issued.x, PXY.box5.ctc_date_issued.y);
  drawTextP(page, font, b5.ctc_place_issued, PXY.box5.ctc_place_issued.x, PXY.box5.ctc_place_issued.y);

  const b6 = formData.box6 || {};
  drawTextP(page, font, b6.signed_name, PXY.box6.signed_name.x, PXY.box6.signed_name.y);
  drawTextP(page, font, fmtDate(b6.date), PXY.box6.date.x, PXY.box6.date.y);
  drawTextP(page, font, b6.address, PXY.box6.address.x, PXY.box6.address.y);
  drawTextP(page, font, b6.ctc_no, PXY.box6.ctc_no.x, PXY.box6.ctc_no.y);
  drawTextP(page, font, fmtDate(b6.ctc_date_issued), PXY.box6.ctc_date_issued.x, PXY.box6.ctc_date_issued.y);
  drawTextP(page, font, b6.ctc_place_issued, PXY.box6.ctc_place_issued.x, PXY.box6.ctc_place_issued.y);

  // signatures Box 3–6
  const stamp = async (dataUrl, rect) => {
    const buf = dataUrlToBuffer(dataUrl);
    if (!buf) return;
    const png = await pdfDoc.embedPng(buf);
    const { width, height } = png.size();
    const scale = Math.min(rect.w / width, rect.h / height);
    page.drawImage(png, { x: rect.x, y: rect.y, width: width * scale, height: height * scale });
  };
  if (signatures.box3) await stamp(signatures.box3, PXY.box3.sig);
  if (signatures.box4) await stamp(signatures.box4, PXY.box4.sig);
  if (signatures.box5) await stamp(signatures.box5, PXY.box5.sig);
  if (signatures.box6) await stamp(signatures.box6, PXY.box6.sig);

  return await pdfDoc.save();
}

/* GET /user/plumbing/form — unchanged */
exports.user_getForm = async (req, res) => {
  try {
    const application_id = Number(req.query.application_id || req.body?.application_id);
    if (!Number.isFinite(application_id) || application_id <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    const rows = await q(`SELECT * FROM plumbing_form_submissions WHERE application_id = ? LIMIT 1`, [application_id]);
    const draftRow = rows[0] || null;

    let draft = null, user_filled_url = null;
    if (draftRow) {
      draft = {
        box2: draftRow.box2 ? JSON.parse(draftRow.box2) : null,
        box3: draftRow.box3 ? JSON.parse(draftRow.box3) : null,
        box4: draftRow.box4 ? JSON.parse(draftRow.box4) : null,
        box5: draftRow.box5 ? JSON.parse(draftRow.box5) : null,
        box6: draftRow.box6 ? JSON.parse(draftRow.box6) : null,
        signatures: {
          box2: draftRow.sig_box2 || null,
          box4: draftRow.sig_box4 || null,
          box5: draftRow.sig_box5 || null,
          box6: draftRow.sig_box6 || null,
        },
      };
      if (draftRow.final_pdf_path) {
        const rel = toRelUploadsPath(draftRow.final_pdf_path) || draftRow.final_pdf_path;
        user_filled_url = `${PUBLIC_BASE_URL}${rel}`;
      }
    }

    // latest admin/system template
    let admin_template_url = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'plumbing' AND application_id = ?
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
    console.error("user_getForm (plumbing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to load form." });
  }
};

/* POST /user/plumbing/form/save — unchanged (box2 now holds fixtures JSON) */
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
    const box6 = JSON.stringify(data?.box6 || {});

    await q(
      `INSERT INTO plumbing_form_submissions (application_id, status, box2, box3, box4, box5, box6, updated_at)
       VALUES (?, 'draft', ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status='draft',
         box2=VALUES(box2), box3=VALUES(box3), box4=VALUES(box4), box5=VALUES(box5), box6=VALUES(box6), updated_at=NOW()`,
      [appId, box2, box3, box4, box5, box6]
    );

    return res.json({ success: true, message: "Draft saved." });
  } catch (e) {
    console.error("user_saveDraft (plumbing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to save draft." });
  }
};

/* POST /user/plumbing/form/sign — unchanged (persists sig for box2/4/5/6, previews for all) */
exports.user_stampSignaturePreview = async (req, res) => {
  try {
    const { application_id, which, data_url } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }
    if (!["box2", "box3", "box4", "box5", "box6"].includes(which)) {
      return res.status(400).json({ success: false, message: "which must be one of box2/box3/box4/box5/box6" });
    }
    if (!data_url) return res.status(400).json({ success: false, message: "data_url is required" });

    if (["box2","box4","box5","box6"].includes(which)) {
      const col = which === "box2" ? "sig_box2" : which === "box4" ? "sig_box4" : which === "box5" ? "sig_box5" : "sig_box6";
      await q(
        `INSERT INTO plumbing_form_submissions (application_id, status, ${col}, updated_at)
         VALUES (?, 'draft', ?, NOW())
         ON DUPLICATE KEY UPDATE ${col}=VALUES(${col}), updated_at=NOW()`,
        [appId, data_url]
      );
    }

    let baseBytes = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'plumbing' AND application_id = ?
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
      `SELECT sig_box2, sig_box4, sig_box5, sig_box6 FROM plumbing_form_submissions WHERE application_id=? LIMIT 1`,
      [appId]
    ))[0] || {};

    const signatures = {
      box2: which === "box2" ? data_url : row.sig_box2 || null,
      box3: which === "box3" ? data_url : null,
      box4: which === "box4" ? data_url : row.sig_box4 || null,
      box5: which === "box5" ? data_url : row.sig_box5 || null,
      box6: which === "box6" ? data_url : row.sig_box6 || null,
    };

    const outBytes = await renderPreviewWithSignaturesP({ basePdfBytes: baseBytes, signatures });
    const filename = `plumbing-preview-${appId}-${Date.now()}.pdf`;
    const absPath  = path.join(PREVIEW_DIR_P, filename);
    fs.writeFileSync(absPath, outBytes);

    const rel = `/uploads/previews/${filename}`;
    await q(`UPDATE plumbing_form_submissions SET draft_pdf_path = ?, updated_at = NOW() WHERE application_id = ?`,
      [rel, appId]
    );

    return res.json({ success: true, preview_url: `${PUBLIC_BASE_URL}${rel}` });
  } catch (e) {
    console.error("user_stampSignaturePreview (plumbing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to stamp signature." });
  }
};

/* POST /user/plumbing/form/submit — unchanged aside from passing box2 structure */
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
    const box6 = JSON.stringify(data?.box6 || {});

    const sig_box2 = data?.box2?.signature_data_url || null;
    const sig_box4 = data?.box4?.signature_data_url || null;
    const sig_box5 = data?.box5?.signature_data_url || null;
    const sig_box6 = data?.box6?.signature_data_url || null;

    await q(
      `INSERT INTO plumbing_form_submissions (application_id, status, box2, box3, box4, box5, box6, sig_box2, sig_box4, sig_box5, sig_box6, updated_at)
       VALUES (?, 'submitted', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status='submitted',
         box2=VALUES(box2), box3=VALUES(box3), box4=VALUES(box4), box5=VALUES(box5), box6=VALUES(box6),
         sig_box2=IFNULL(VALUES(sig_box2), sig_box2),
         sig_box4=IFNULL(VALUES(sig_box4), sig_box4),
         sig_box5=IFNULL(VALUES(sig_box5), sig_box5),
         sig_box6=IFNULL(VALUES(sig_box6), sig_box6),
         updated_at=NOW()`,
      [appId, box2, box3, box4, box5, box6, sig_box2, sig_box4, sig_box5, sig_box6]
    );

    let baseBytes = null;
    try {
      const cols = await tableColumns("tbl_application_requirements");
      const list = await q(
        `SELECT ${cols.has("pdf_path") ? "pdf_path" : "file_path"} AS p,
                ${cols.has("file_url") ? "file_url" : "NULL"} AS u
           FROM tbl_application_requirements
          WHERE application_type = 'plumbing' AND application_id = ?
          ORDER BY uploaded_at DESC LIMIT 1`,
        [appId]
      );
      if (list.length) {
        const rel = toRelUploadsPath(list[0].u || list[0].p) || (list[0].p ? toRelUploadsPath(list[0].p) : null);
        if (rel) baseBytes = fs.readFileSync(path.join(__dirname, "..", rel.replace(/^\//, "")));
      }
    } catch {}
    if (!baseBytes) baseBytes = fs.readFileSync(TEMPLATE_PATH);

    const hit = await getPlumbingApplication(appId);
    if (!hit) return res.status(404).json({ success: false, message: "Plumbing application not found" });
    const mappedApp = mapRow(hit.row);

    const row = (await q(
      `SELECT sig_box2, sig_box4, sig_box5, sig_box6 FROM plumbing_form_submissions WHERE application_id=? LIMIT 1`,
      [appId]
    ))[0] || {};

    const signatures = {
      box2: sig_box2 || row.sig_box2 || null,
      box3: data?.box3?.signature_data_url || null,
      box4: sig_box4 || row.sig_box4 || null,
      box5: sig_box5 || row.sig_box5 || null,
      box6: sig_box6 || row.sig_box6 || null,
    };

    const outBytes = await renderFinalUserFilledP({
      mappedAppRow: mappedApp,
      formData: {
        box2: data?.box2 || {},
        box3: data?.box3 || {},
        box4: data?.box4 || {},
        box5: data?.box5 || {},
        box6: data?.box6 || {}
      },
      signatures,
      baseBytes,
    });

    const filename = `plumbing-userfilled-${appId}-${Date.now()}.pdf`;
    const absPath  = path.join(USERFILLED_DIR_P, filename);
    fs.writeFileSync(absPath, outBytes);

    const rel = `/uploads/user_filled/${filename}`;
    const url = `${PUBLIC_BASE_URL}${rel}`;

    await attachToAppRequirements({ application_id: appId, pdf_path: rel, srcRow: hit.row, application_type: 'plumbing' });

    await q(`UPDATE plumbing_form_submissions SET final_pdf_path = ?, updated_at = NOW() WHERE application_id = ?`,
      [rel, appId]
    );

    return res.json({ success: true, user_filled_url: url });
  } catch (e) {
    console.error("user_submitFilled (plumbing) error:", e);
    return res.status(500).json({ success: false, message: "Failed to submit form." });
  }
};
