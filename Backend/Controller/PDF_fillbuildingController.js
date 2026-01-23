// Controller/PDF_fillbuildingController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const db = require("../db/dbconnect");

/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT   = path.join(__dirname, "..", "uploads");
const OUT_DIR        = path.join(UPLOADS_ROOT, "system_generated", "building");
const TEMPLATE_PATH  =
  process.env.BUILDING_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "BUILDING PERMIT FORM.pdf");

fs.mkdirSync(OUT_DIR, { recursive: true });

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

/* ───────── tolerant loader (like fencing) ───────── */
async function getByKeys(table, keyValue) {
  const cols = await tableColumns(table);
  if (cols.size === 0) return null;

  const candidates = [
    ["id", keyValue],
    ["application_id", keyValue],
    ["bp_id", keyValue],
    ["building_id", keyValue],
    ["application_no", String(keyValue)],
    ["building_permit_no", String(keyValue)],
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

async function getBuildingApplication(application_id) {
  const tryTables = [
    "tbl_building_permits",
    "building_permit_applications",
    "building_permits",
    "tbl_building_permit",
  ];
  for (const t of tryTables) {
    const row = await getByKeys(t, application_id);
    if (row) return { row, table: t };
  }
  return null;
}

/* ───────── Row → fields used by template ───────── */
function mapRow(r) {
  if (!r) return null;
  return {
    // Applicant name / TIN
    last_name: r.last_name || r.owner_last_name || "",
    first_name: r.first_name || r.owner_first_name || "",
    mi: r.middle_initial || r.mi || r.middle_name || "",

    tin: r.tin || r.tin_no || "",

    // Mailing address
    address_no: r.address_no || "",
    address_street: r.address_street || r.street || "",
    address_barangay: r.address_barangay || r.barangay || "",
    address_city: r.address_city || r.city_municipality || "",
    address_zip_code: r.address_zip_code || r.zip_code || "",
    telephone_no: r.telephone_no || r.mobile_no || "",

    // Location
    location_lot_no: r.location_lot_no || r.lot_no || "",
    location_blk_no: r.location_blk_no || r.block_no || r.block_no1 || "",
    location_tct_no: r.location_tct_no || r.tct_no || "",
    location_tax_dec_no: r.location_tax_dec_no || r.tax_dec_no || "",
    location_street: r.location_street || "",
    location_barangay: r.location_barangay || r.barangay || "",
    location_city: r.location_city || r.city_municipality || "",

    // Scope / Occupancy
    scope_of_work: r.scope_of_work || "",
    applies_also_for: r.applies_also_for || "",

    // Occupancy flags (truthy → check)
    group_a: r.group_a,
    group_b: r.group_b,
    group_c: r.group_c,
    group_d: r.group_d,
    group_e: r.group_e,
    group_f: r.group_f,
    group_g: r.group_g,
    group_h: r.group_h,
    group_i: r.group_i,
    group_j1: r.group_j1,
    group_j2: r.group_j2,
  };
}

/* ───────── PDF text helpers (your XY map preserved) ───────── */
function drawText(page, text, x, y, options = {}) {
  const { size = 9, font = null, color = rgb(0, 0, 0), maxWidth = undefined } = options;
  if (text == null) return;
  const str = String(text);
  page.drawText(str, { x, y, size, font, color, maxWidth });
}
function drawCheck(page, x, y, options = {}) {
  const { size = 8, color = rgb(0, 0, 0) } = options;
  page.drawRectangle({ x, y: y - size + 2, width: size, height: size, color });
}
const XY = {
  // Page 1 – Documentary Requirements + Remarks
  // NOTE: these coordinates are starting estimates only.
  // You can fine-tune X / Y after you see the output.
  page1: {
    unified_form:          { x: 107,  y: 867 },
    locational_clearance:  { x: 107,  y: 857 },
    rpt_and_taxdec:        { x: 107,  y: 846 },
    oct_tct_deed:          { x: 107,  y: 836 },
    lot_vicinity_map:      { x: 107,  y: 815 },

    survey_plan:           { x: 107,  y: 803 }, // "Five (5) Sets of Survey Plan..."
    arch:                  { x: 142,  y: 782 },
    specs:                 { x: 270, y: 784 },
    civil_structural:      { x: 118,  y: 774 },
    voltage_drop:          { x: 247, y: 773 },
    electrical:            { x: 142,  y: 761 },
    mechanical:            { x: 142,  y: 751 },
    sanitary:              { x: 142,  y: 741 },
    plumbing:              { x: 142,  y: 730 },
    electronics:           { x: 142,  y: 719 },
    geodetic:              { x: 142,  y: 709 },
    fire_protection_plan:  { x: 142,  y: 699 },

    prc_license:           { x: 107,  y: 678 },
    estimated_value:       { x: 107,  y: 667 },
    csafety_program:       { x: 107,  y: 656 },
    affidavit:             { x: 107,  y: 645 },
    soil_test:             { x: 107,  y: 634 },
    structural_analysis:   { x: 107,  y: 623 },
    ctc_owner:             { x: 107,  y: 612 },

    // REMARKS: [ ] Complete Documents   [ ] Incomplete Documents
    remarks_complete:      { x: 142,  y: 582 },
    remarks_incomplete:    { x: 142, y: 571 },
  },

  // Page 2 – existing owner/location/occupancy fields
  page2: {
    owner_last:    { x: 120,  y: 844 },
    owner_first:   { x: 190, y: 844 },
    owner_mi:      { x: 275, y: 844 },
    tin:           { x: 385, y: 844 },
    addr_no:       { x: 23,  y: 757 },
    addr_street:   { x: 49, y: 717 },
    addr_brgy:     { x: 175, y: 717 },
    addr_city:     { x: 360, y: 717 },
    addr_zip:      { x: 300, y: 757 },
    tel_no:        { x: 394,  y: 757 },
    loc_lot:       { x: 170, y: 734 },
    loc_blk:       { x: 220, y: 734 },
    loc_tct:       { x: 275, y: 734 },
    loc_taxdec:    { x: 394, y: 734 },
    loc_street:    { x: 70, y: 757 },
    loc_barangay:  { x: 130, y: 757 },
    loc_city:      { x: 200, y: 757 },
    scope_of_work: { x: 130, y: 690 },
    occ: {
      A:   { x: 20, y: 640 },
      B:   { x: 20, y: 604 },
      C:   { x: 20, y: 583 },
      D:   { x: 20, y: 556 },
      E:   { x: 187, y: 639 },
      F:   { x: 182, y: 604 },
      G:   { x: 187, y: 583 },
      H:   { x: 182, y: 556 },
      I:   { x: 320, y: 640 },
      J1:  { x: 460, y: 604 },
      J2:  { x: 320, y: 583 },
    },
    applies_also_for: { x: 130, y: 510 },
  },
};

const OCC_KEYS = [
  ["group_a",  "A"], ["group_b",  "B"], ["group_c",  "C"], ["group_d",  "D"],
  ["group_e",  "E"], ["group_f",  "F"], ["group_g",  "G"], ["group_h",  "H"],
  ["group_i",  "I"], ["group_j1", "J1"], ["group_j2", "J2"],
];

/* ───────── Fill and save one PDF ───────── */
async function buildPdfBytes(mapped, docChecks) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Building template not found at: ${TEMPLATE_PATH}\n` +
      `Set BUILDING_TEMPLATE_PATH in your .env to the correct PDF path.`
    );
  }

  const pdfBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1] || page1;

  /* ───── Page 1: Documentary Requirements + Remarks (employee filled) ───── */
  if (page1 && docChecks && typeof docChecks === "object") {
    const docs = docChecks.docs || {};
    const remarks = (docChecks.remarks || "").toString().toLowerCase();

    const docKeys = [
      "unified_form",
      "locational_clearance",
      "rpt_and_taxdec",
      "oct_tct_deed",
      "lot_vicinity_map",
      "survey_plan",
      "arch",
      "specs",
      "civil_structural",
      "voltage_drop",
      "electrical",
      "mechanical",
      "sanitary",
      "plumbing",
      "electronics",
      "geodetic",
      "fire_protection_plan",
      "prc_license",
      "estimated_value",
      "csafety_program",
      "affidavit",
      "soil_test",
      "structural_analysis",
      "ctc_owner",
    ];

    docKeys.forEach((k) => {
      if (!docs[k]) return;
      const pt = XY.page1[k];
      if (pt) drawCheck(page1, pt.x, pt.y);
    });

    if (remarks === "complete" && XY.page1.remarks_complete) {
      drawCheck(page1, XY.page1.remarks_complete.x, XY.page1.remarks_complete.y);
    } else if (remarks === "incomplete" && XY.page1.remarks_incomplete) {
      drawCheck(page1, XY.page1.remarks_incomplete.x, XY.page1.remarks_incomplete.y);
    }
  }

  /* ───── Page 2: existing owner / location / occupancy info ───── */
  const page = page2;

  drawText(page, mapped.last_name || "",  XY.page2.owner_last.x,  XY.page2.owner_last.y,  { font: helv });
  drawText(page, mapped.first_name || "", XY.page2.owner_first.x, XY.page2.owner_first.y, { font: helv });
  drawText(page, mapped.mi || "",         XY.page2.owner_mi.x,    XY.page2.owner_mi.y,    { font: helv });
  drawText(page, mapped.tin || "",        XY.page2.tin.x,         XY.page2.tin.y,         { font: helv });

  drawText(page, mapped.address_no || "",        XY.page2.addr_no.x,     XY.page2.addr_no.y,     { font: helv });
  drawText(page, mapped.address_street || "",    XY.page2.addr_street.x, XY.page2.addr_street.y, { font: helv });
  drawText(page, mapped.address_barangay || "",  XY.page2.addr_brgy.x,   XY.page2.addr_brgy.y,   { font: helv });
  drawText(page, mapped.address_city || "",      XY.page2.addr_city.x,   XY.page2.addr_city.y,   { font: helv });
  drawText(page, mapped.address_zip_code || "",  XY.page2.addr_zip.x,    XY.page2.addr_zip.y,    { font: helv });
  drawText(page, mapped.telephone_no || "",      XY.page2.tel_no.x,      XY.page2.tel_no.y,      { font: helv });

  drawText(page, mapped.location_lot_no || "",       XY.page2.loc_lot.x,     XY.page2.loc_lot.y,     { font: helv });
  drawText(page, mapped.location_blk_no || "",       XY.page2.loc_blk.x,     XY.page2.loc_blk.y,     { font: helv });
  drawText(page, mapped.location_tct_no || "",       XY.page2.loc_tct.x,     XY.page2.loc_tct.y,     { font: helv });
  drawText(page, mapped.location_tax_dec_no || "",   XY.page2.loc_taxdec.x,  XY.page2.loc_taxdec.y,  { font: helv });
  drawText(page, mapped.location_street || "",       XY.page2.loc_street.x,  XY.page2.loc_street.y,  { font: helv });
  drawText(page, mapped.location_barangay || "",     XY.page2.loc_barangay.x,XY.page2.loc_barangay.y,{ font: helv });
  drawText(page, mapped.location_city || "",         XY.page2.loc_city.x,    XY.page2.loc_city.y,    { font: helv });

  drawText(page, mapped.scope_of_work || "", XY.page2.scope_of_work.x, XY.page2.scope_of_work.y, { font: helv });

  OCC_KEYS.forEach(([col, key]) => {
    if (!mapped[col]) return;
    const pt = XY.page2.occ[key];
    if (pt) drawCheck(page, pt.x, pt.y);
  });

  if (mapped.applies_also_for) {
    drawText(page, mapped.applies_also_for, XY.page2.applies_also_for.x, XY.page2.applies_also_for.y, { font: helv });
  }

  return await pdfDoc.save();
}


/* ───────── Attach into tbl_application_requirements (same flow as Fencing) ───────── */
async function attachToAppRequirements({ application_id, pdf_path, srcRow }) {
  let app_uid = null;
  let applicantUserId = null;
  try {
    const idx = await ensureAppIndex("building", application_id, srcRow);
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

  const FILE_LABEL = "Building Permit Filled Form";
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
    ["building", application_id, FILE_LABEL]
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

  const colsIns = [];
  const valsIns = [];
  const ph = [];

  if (hasAppUid) { colsIns.push("app_uid"); valsIns.push(app_uid); ph.push("?"); }
  if (hasUserId) { colsIns.push("user_id"); valsIns.push(applicantUserId); ph.push("?"); }
  if (hasFilePath) { colsIns.push("file_path"); valsIns.push(FILE_LABEL); ph.push("?"); }

  colsIns.push("application_type"); valsIns.push("building"); ph.push("?");
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
    const baseVals = ["building", application_id, relPath, "system"];
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

/* ───────── Public handler (like fencing: no session middleware) ───────── */
exports.generateFilledBuilding = async (req, res) => {
  try {
    const { application_id } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required and must be a positive number" });
    }

    const hit = await getBuildingApplication(appId);
    if (!hit) return res.status(404).json({ success: false, message: "Building application not found" });

    const row = hit.row;
   const mapped = mapRow(row);
    const checksPayload = (req.body && req.body.checks) || null;
    const outBytes = await buildPdfBytes(mapped, checksPayload);

    const filename = `building-${appId}-${Date.now()}.pdf`;
    const absPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const relPath = `/uploads/system_generated/building/${filename}`;

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
    console.error("generateFilledBuilding error:", err);
    return res.status(500).json({ success: false, message: "Server error generating Building form." });
  }
};



