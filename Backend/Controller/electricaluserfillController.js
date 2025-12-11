// Controller/electricaluserfillController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

// ───────── Configs ─────────
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const ADMIN_GEN_DIR   = path.join(UPLOADS_ROOT, "system_generated", "electrical");
const USER_FILLED_DIR = path.join(UPLOADS_ROOT, "user_filled", "electrical");
const USER_DRAFT_DIR  = path.join(UPLOADS_ROOT, "user_drafts", "electrical");

// turn on to draw tiny guide dots & labels to calibrate coords quickly
const DEBUG_PDF_GUIDES = process.env.DEBUG_PDF_GUIDES === "1";

fs.mkdirSync(USER_FILLED_DIR, { recursive: true });
fs.mkdirSync(USER_DRAFT_DIR,  { recursive: true });

// ───────── Helpers ─────────
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function tableColumns(table) {
  try {
    const rows = await q(`SHOW COLUMNS FROM \`${table}\``);
    return new Set(rows.map(r => r.Field));
  } catch {
    return new Set();
  }
}

function toRelUploadsPath(rowOrString) {
  let raw = rowOrString;
  if (typeof rowOrString === "object" && rowOrString) {
    raw =
      rowOrString.pdf_path ||
      rowOrString.user_upload_path ||
      rowOrString.file_url ||
      rowOrString.filepath ||
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
}

function absFromRelUploads(rel) {
  return path.resolve(path.join(__dirname, "..", rel.replace(/^\//, "")));
}

function jsonDraftPath(appId) {
  return path.join(USER_DRAFT_DIR, `electrical-${appId}.json`);
}

async function getRequirementRow(appType, appId, label, extraSelect = []) {
  const cols = await tableColumns("tbl_application_requirements");
  const select = ["requirement_id", "application_type", "application_id", "file_path", "pdf_path", "user_upload_path", "user_uploaded_at"];
  select.push(...extraSelect);
  const rows = await q(
    `SELECT ${select.join(", ")}
       FROM tbl_application_requirements
      WHERE application_type=? AND application_id=? AND file_path=?
      LIMIT 1`,
    [appType, appId, label]
  );
  return { row: rows[0] || null, cols };
}

async function latestAdminPdfForElectrical(appId) {
  const { row } = await getRequirementRow("electrical", appId, "Electrical Permit Filled Form");
  const rel = toRelUploadsPath(row) || null;
  if (rel && fs.existsSync(absFromRelUploads(rel))) return rel;

  const prefix = `electrical-${appId}-`;
  if (fs.existsSync(ADMIN_GEN_DIR)) {
    const files = fs.readdirSync(ADMIN_GEN_DIR)
      .filter(f => f.startsWith(prefix) && f.toLowerCase().endsWith(".pdf"))
      .map(f => ({ f, ts: Number((f.split("-")[2] || "").replace(".pdf","")) || 0 }))
      .sort((a,b)=>b.ts - a.ts);
    if (files[0]) return `/uploads/system_generated/electrical/${files[0].f}`;
  }
  return null;
}

// ───────── Coordinates (fixed) ─────────
// Biggest issue: x=680 and x=740 were beyond common page widths (A4=595pt, Letter=612pt).
// Move those to safer ~540. Keep others but we'll clamp at draw time too.
const COORDS = {
  box2: {
    professional_name: { x: 40,  y: 446, size: 9 },   
    professional_date: { x: 195, y: 446, size: 9 },

    address:           { x: 335,  y: 491, size: 9 },
    prc_no:            { x: 325, y: 471, size: 9 },
    validity:          { x: 480, y: 471, size: 9 },  

    ptr_no:            { x: 326, y: 450, size: 9 },
    date_issued:       { x: 499, y: 450, size: 9 }, 

    issued_at:         { x: 330, y: 430, size: 9 },
    tin:               { x: 467, y: 430, size: 9 },  

    sig_rect:          { x: 0, y: 440, width: 240, height: 40 },
  },
  box3: {
    role_pe:  { x: 17,  y: 379 },
    role_re:  { x: 224, y: 379 },
    role_rme: { x: 422, y: 379 },

    sig_rect:    { x: 200, y: 332, width: 240, height: 40 },
    signed_name: { x: 238, y: 342, size: 9 },
    date:        { x: 440, y: 342, size: 9 },

    prc_no:      { x: 52,  y: 302, size: 9 },
    ptr_no:      { x: 52,  y: 280, size: 9 },
    issued_at:   { x: 52,  y: 262, size: 9 },
    address:     { x: 52,  y: 242, size: 9 },

    validity:    { x: 339, y: 302, size: 9 },   
    date_issued: { x: 355, y: 280, size: 9 }, 
    tin:         { x: 330, y: 262, size: 9 }, 
    
    
  },
  box4: {
    owner_name: { x: 40,  y: 175, size: 9 },
    date:       { x: 230, y: 175, size: 9 },
    sig_rect:   { x: 0,  y: 173  , width: 240, height: 40 },
    address:    { x: 80,  y: 150, size: 9 },
  },
  box5: {
    lot_owner_name: { x: 339, y: 175, size: 9 },
    date:           { x: 524, y: 175, size: 9 }, 
    address:        { x: 412, y: 150, size: 9 },
    sig_rect:       { x: 300, y: 175, width: 240, height: 40 },
  },
};

// small vector check
function drawCheck(page, x, y, size = 10, thickness = 1) {
  const x1 = x, y1 = y;
  const x2 = x + size*0.4, y2 = y - size*0.5;
  const x3 = x + size, y3 = y + size*0.2;
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness });
  page.drawLine({ start: { x: x2, y: y2 }, end: { x: x3, y: y3 }, thickness });
}

// deep merge for plain objects
function deepMerge(a, b) {
  const out = { ...(a || {}) };
  for (const k of Object.keys(b || {})) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) {
      out[k] = deepMerge(out[k], b[k]);
    } else {
      out[k] = b[k];
    }
  }
  return out;
}

// Clamp coords to page so nothing is off-canvas anymore
function clampToPage(page, x, y, margin = 18) {
  const w = page.getWidth();
  const h = page.getHeight();
  return {
    x: Math.min(Math.max(x, margin), w - margin),
    y: Math.min(Math.max(y, margin), h - margin),
  };
}

function drawTextSafe(page, font, value, coord, labelForDebug) {
  const s = (value ?? "").toString().trim();
  if (!s) return;
  const size = coord.size || 9;
  const { x, y } = clampToPage(page, coord.x, coord.y);
  page.drawText(s, { x, y, size, font });

  if (DEBUG_PDF_GUIDES && labelForDebug) {
    // tiny crosshair + label to see placement
    page.drawRectangle({ x: x - 1, y: y - 1, width: 2, height: 2, color: undefined, borderColor: undefined });
    page.drawText(labelForDebug, { x: x + 3, y: y + 3, size: 6, font });
  }
}

// ───────── GET /user/electrical/form ─────────
exports.getFormInfo = async (req, res) => {
  try {
    const appId = Number(req.query.application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    const adminRel = await latestAdminPdfForElectrical(appId);

    // file draft on disk
    let fileDraft = null;
    const draftPath = jsonDraftPath(appId);
    if (fs.existsSync(draftPath)) {
      try { fileDraft = JSON.parse(fs.readFileSync(draftPath, "utf8")); } catch {}
    }

    // DB draft
    const rows = await q(
      "SELECT box2, box3, box4, box5, sig_box2, sig_owner, sig_lot, draft_pdf_path, final_pdf_path, status FROM electrical_form_submissions WHERE application_id=? LIMIT 1",
      [appId]
    );
    let dbDraft = null;
    if (rows[0]) {
      dbDraft = {
        box2: rows[0].box2 ? JSON.parse(rows[0].box2) : undefined,
        box3: rows[0].box3 ? JSON.parse(rows[0].box3) : undefined,
        box4: rows[0].box4 ? JSON.parse(rows[0].box4) : undefined,
        box5: rows[0].box5 ? JSON.parse(rows[0].box5) : undefined,
        signatures: {
          box2: rows[0].sig_box2 || "",
           box3: rows[0].sig_box2 || "",
          owner: rows[0].sig_owner || "",
          lot: rows[0].sig_lot || "",
        },
        draft_pdf_path: rows[0].draft_pdf_path || null,
        final_pdf_path: rows[0].final_pdf_path || null,
        status: rows[0].status || "draft",
      };
    }

    // user-filled url from app requirements (if any)
    const { row } = await getRequirementRow("electrical", appId, "Electrical Permit Filled Form");
    const userRel = row?.user_upload_path ? toRelUploadsPath(row.user_upload_path) : null;

    // merge disk + db (db wins), only for returning to UI
    const merged = deepMerge(fileDraft || {}, dbDraft || {});

    return res.json({
      success: true,
      application_id: appId,
      admin_template_url: adminRel ? `${PUBLIC_BASE_URL}${adminRel}` : null,
      user_filled_url: userRel ? `${PUBLIC_BASE_URL}${userRel}` : (dbDraft?.final_pdf_path ? `${PUBLIC_BASE_URL}${dbDraft.final_pdf_path}` : null),
      draft: merged || {},
      coords: COORDS,
    });
  } catch (e) {
    console.error("getFormInfo error:", e);
    return res.status(500).json({ success: false, message: "Failed to load form info" });
  }
};

// ───────── POST /user/electrical/form/save ─────────
exports.saveDraftFields = async (req, res) => {
  try {
    const { application_id, data } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({ success: false, message: "data must be an object" });
    }

    // save JSON to disk
    fs.writeFileSync(jsonDraftPath(appId), JSON.stringify(data, null, 2));

    // upsert to electrical_form_submissions (store latest boxes)
    const exist = await q("SELECT id FROM electrical_form_submissions WHERE application_id=? LIMIT 1", [appId]);
    const fields = {
      box2: data.box2 ? JSON.stringify(data.box2) : null,
      box3: data.box3 ? JSON.stringify(data.box3) : null,
      box4: data.box4 ? JSON.stringify(data.box4) : null,
      box5: data.box5 ? JSON.stringify(data.box5) : null,
    };
    if (exist[0]) {
      await q(
        "UPDATE electrical_form_submissions SET box2=?, box3=?, box4=?, box5=?, updated_at=NOW() WHERE application_id=?",
        [fields.box2, fields.box3, fields.box4, fields.box5, appId]
      );
    } else {
      await q(
        "INSERT INTO electrical_form_submissions (application_id, status, box2, box3, box4, box5) VALUES (?,?,?,?,?,?)",
        [appId, "draft", fields.box2, fields.box3, fields.box4, fields.box5]
      );
    }

    return res.json({ success: true });
  } catch (e) {
    console.error("saveDraftFields error:", e);
    return res.status(500).json({ success: false, message: "Failed to save draft" });
  }
};

// ───────── POST /user/electrical/form/sign ─────────
exports.stampSignature = async (req, res) => {
  try {
    const { application_id, which, data_url } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }
    if (!data_url || !String(data_url).startsWith("data:image/")) {
      return res.status(400).json({ success: false, message: "Valid data_url (PNG/JPG) is required" });
    }

    const adminRel = await latestAdminPdfForElectrical(appId);
    if (!adminRel) return res.status(404).json({ success:false, message:"No generated template found yet." });

    const abs = absFromRelUploads(adminRel);
    const pdfBytes = fs.readFileSync(abs);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const base64 = data_url.split(",")[1];
    const buf = Buffer.from(base64, "base64");
    const img = /^data:image\/png/i.test(data_url) ? await pdfDoc.embedPng(buf) : await pdfDoc.embedJpg(buf);

    const p1 = pdfDoc.getPages()[0];
    const rect =
      which === "box5" ? COORDS.box5.sig_rect :
      which === "box3" ? COORDS.box3.sig_rect :
      which === "box2" ? COORDS.box2.sig_rect :
      COORDS.box4.sig_rect;

    p1.drawImage(img, { x: rect.x, y: rect.y, width: rect.width, height: rect.height });

    const outName = `electrical-${appId}-signed-preview.pdf`;
    const outRel  = `/uploads/user_filled/electrical/${outName}`;
    fs.writeFileSync(path.join(USER_FILLED_DIR, outName), await pdfDoc.save());

    // reuse sig_box2 for Box2/Box3 to avoid schema change
    const exist = await q("SELECT id FROM electrical_form_submissions WHERE application_id=? LIMIT 1", [appId]);
    const col =
      which === "box5" ? "sig_lot" :
      which === "box3" ? "sig_box2" :
      which === "box2" ? "sig_box2" : "sig_owner";
    if (exist[0]) {
      await q(`UPDATE electrical_form_submissions SET ${col}=?, draft_pdf_path=?, updated_at=NOW() WHERE application_id=?`,
        [data_url, outRel, appId]);
    } else {
      await q(`INSERT INTO electrical_form_submissions (application_id, ${col}, draft_pdf_path) VALUES (?,?,?)`,
        [appId, data_url, outRel]);
    }

    return res.json({ success:true, preview_url: `${PUBLIC_BASE_URL}${outRel}` });
  } catch (e) {
    console.error("stampSignature error:", e);
    return res.status(500).json({ success:false, message:"Failed to stamp signature" });
  }
};

// ───────── POST /user/electrical/form/submit ─────────
exports.submitFilledPdf = async (req, res) => {
  try {
    const { application_id, data } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    // Load drafts (disk + DB) and deep-merge with incoming data so latest user values win
    let fileDraft = {};
    const draftP = jsonDraftPath(appId);
    if (fs.existsSync(draftP)) {
      try { fileDraft = JSON.parse(fs.readFileSync(draftP, "utf8")); } catch {}
    }

    const rows = await q("SELECT box2,box3,box4,box5,sig_box2,sig_owner,sig_lot FROM electrical_form_submissions WHERE application_id=? LIMIT 1", [appId]);
    let dbDraft = {};
    if (rows[0]) {
      dbDraft = {
        box2: rows[0].box2 ? JSON.parse(rows[0].box2) : undefined,
        box3: rows[0].box3 ? JSON.parse(rows[0].box3) : undefined,
        box4: rows[0].box4 ? JSON.parse(rows[0].box4) : undefined,
        box5: rows[0].box5 ? JSON.parse(rows[0].box5) : undefined,
        signatures: {
          box2: rows[0].sig_box2 || "",
          owner: rows[0].sig_owner || "",
          lot: rows[0].sig_lot || "",
        }
      };
    }

    // deep merge order: file ⟶ db ⟶ incoming
    let payload = deepMerge(fileDraft, dbDraft);
    payload = deepMerge(payload, (data || {}));

    // Load base PDF
    const adminRel = await latestAdminPdfForElectrical(appId);
    if (!adminRel) return res.status(404).json({ success:false, message:"No generated template found yet." });

    const abs = absFromRelUploads(adminRel);
    const baseBytes = fs.readFileSync(abs);
    const pdfDoc = await PDFDocument.load(baseBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const p1 = pdfDoc.getPages()[0];

    // ───────── BOX 2 ─────────
    if (payload.box2) {
      const b = payload.box2;
      const map = {
        professional_name: { val: b.engineer_name, label: "b2.name" },
        professional_date: { val: b.date,         label: "b2.date" },
        address:           { val: b.address,      label: "b2.addr" },
        prc_no:            { val: b.prc_no,       label: "b2.prc" },
        validity:          { val: b.validity,     label: "b2.validity" },
        ptr_no:            { val: b.ptr_no,       label: "b2.ptr" },
        date_issued:       { val: b.date_issued,  label: "b2.dateIssued" },
        issued_at:         { val: b.issued_at,    label: "b2.issuedAt" },
        tin:               { val: b.tin,          label: "b2.tin" },
      };
      Object.entries(map).forEach(([coordKey, { val, label }]) => {
        const c = COORDS.box2[coordKey];
        if (c) drawTextSafe(p1, font, val, c, label);
      });

      const sig2 = payload.signatures?.box2 || payload.box2.signature_data_url;
      if (sig2 && /^data:image\//i.test(sig2)) {
        const base64 = sig2.split(",")[1];
        const buf = Buffer.from(base64, "base64");
        const img = /^data:image\/png/i.test(sig2) ? await pdfDoc.embedPng(buf) : await pdfDoc.embedJpg(buf);
        const r = COORDS.box2.sig_rect;
        p1.drawImage(img, { x: r.x, y: r.y, width: r.width, height: r.height });
      }
    }

    // ───────── BOX 3 ─────────
    if (payload.box3) {
      const b = payload.box3;

      if (b.role === "pe")  drawCheck(p1, COORDS.box3.role_pe.x,  COORDS.box3.role_pe.y,  10, 1.2);
      if (b.role === "re")  drawCheck(p1, COORDS.box3.role_re.x,  COORDS.box3.role_re.y,  10, 1.2);
      if (b.role === "rme") drawCheck(p1, COORDS.box3.role_rme.x, COORDS.box3.role_rme.y, 10, 1.2);

      const map = {
        signed_name: { val: b.signed_name, label: "b3.name" },
        date:        { val: b.date,        label: "b3.date" },
        prc_no:      { val: b.prc_no,      label: "b3.prc" },
        validity:    { val: b.validity,    label: "b3.validity" },  // ensure drawn
        ptr_no:      { val: b.ptr_no,      label: "b3.ptr" },
        date_issued: { val: b.date_issued, label: "b3.dateIssued" },
        issued_at:   { val: b.issued_at,   label: "b3.issuedAt" },
        tin:         { val: b.tin,         label: "b3.tin" },       // ensure drawn
        address:     { val: b.address,     label: "b3.addr" },
      };
      Object.entries(map).forEach(([coordKey, { val, label }]) => {
        const c = COORDS.box3[coordKey];
        if (c) drawTextSafe(p1, font, val, c, label);
      });

     const sig3 =
  payload.signatures?.box3 ||
  payload.signatures?.box2 ||          // ← read the shared storage
  payload.box3?.signature_data_url;
      if (sig3 && /^data:image\//i.test(sig3)) {
        const base64 = sig3.split(",")[1];
        const buf = Buffer.from(base64, "base64");
        const img = /^data:image\/png/i.test(sig3) ? await pdfDoc.embedPng(buf) : await pdfDoc.embedJpg(buf);
        const r = COORDS.box3.sig_rect;
        p1.drawImage(img, { x: r.x, y: r.y, width: r.width, height: r.height });
      }
    }

    // ───────── BOX 4 ─────────
    if (payload.box4) {
      const b = payload.box4;
      const map = {
        owner_name: { val: b.owner_name, label: "b4.name" },
        date:       { val: b.date,       label: "b4.date" },
        address:    { val: b.address,    label: "b4.addr" },
      };
      Object.entries(map).forEach(([coordKey, { val, label }]) => {
        const c = COORDS.box4[coordKey];
        if (c) drawTextSafe(p1, font, val, c, label);
      });

      const sig4 = payload.signatures?.owner || payload.box4.signature_data_url;
      if (sig4 && /^data:image\//i.test(sig4)) {
        const base64 = sig4.split(",")[1];
        const buf = Buffer.from(base64, "base64");
        const img = /^data:image\/png/i.test(sig4) ? await pdfDoc.embedPng(buf) : await pdfDoc.embedJpg(buf);
        const r = COORDS.box4.sig_rect;
        p1.drawImage(img, { x: r.x, y: r.y, width: r.width, height: r.height });
      }
    }

    // ───────── BOX 5 ─────────
    if (payload.box5) {
      const b = payload.box5;
      const map = {
        lot_owner_name: { val: b.lot_owner_name, label: "b5.name" },
        date:           { val: b.date,           label: "b5.date" },    // ensure drawn
        address:        { val: b.address,        label: "b5.addr" },
      };
      Object.entries(map).forEach(([coordKey, { val, label }]) => {
        const c = COORDS.box5[coordKey];
        if (c) drawTextSafe(p1, font, val, c, label);
      });

      const sig5 = payload.signatures?.lot || payload.box5.signature_data_url;
      if (sig5 && /^data:image\//i.test(sig5)) {
        const base64 = sig5.split(",")[1];
        const buf = Buffer.from(base64, "base64");
        const img = /^data:image\/png/i.test(sig5) ? await pdfDoc.embedPng(buf) : await pdfDoc.embedJpg(buf);
        const r = COORDS.box5.sig_rect;
        p1.drawImage(img, { x: r.x, y: r.y, width: r.width, height: r.height });
      }
    }

    // Save final PDF
    const outName = `electrical-${appId}-userfilled-${Date.now()}.pdf`;
    const outAbs  = path.join(USER_FILLED_DIR, outName);
    const outRel  = `/uploads/user_filled/electrical/${outName}`;
    fs.writeFileSync(outAbs, await pdfDoc.save());
    const outUrl = `${PUBLIC_BASE_URL}${outRel}`;

    // attach to tbl_application_requirements
    const { row, cols } = await getRequirementRow("electrical", appId, "Electrical Permit Filled Form");
    if (row) {
      const sets = [];
      const vals = [];
      if (cols.has("user_upload_path")) { sets.push("user_upload_path=?"); vals.push(outRel); }
      if (cols.has("user_uploaded_at")) { sets.push("user_uploaded_at=NOW()"); }
      if (!sets.length) { sets.push("pdf_path=?"); vals.push(outRel); }
      await q(`UPDATE tbl_application_requirements SET ${sets.join(", ")} WHERE requirement_id=?`, [...vals, row.requirement_id]);
    } else {
      const colsIns = ["application_type","application_id","file_path","pdf_path","user_upload_path","user_uploaded_at"];
      const ph = ["?","?","?","?","?","NOW()"];
      const valsIns = ["electrical", appId, "Electrical Permit Filled Form", outRel, outRel];
      await q(
        `INSERT INTO tbl_application_requirements (${colsIns.join(",")}) VALUES (${ph.join(",")})`,
        valsIns
      );
    }

    // persist final merged payload to DB (so nothing gets lost)
    const exist = await q("SELECT id FROM electrical_form_submissions WHERE application_id=? LIMIT 1", [appId]);
    const box2Json = payload.box2 ? JSON.stringify(payload.box2) : null;
    const box3Json = payload.box3 ? JSON.stringify(payload.box3) : null;
    const box4Json = payload.box4 ? JSON.stringify(payload.box4) : null;
    const box5Json = payload.box5 ? JSON.stringify(payload.box5) : null;

    if (exist[0]) {
      await q(
        "UPDATE electrical_form_submissions SET final_pdf_path=?, status='submitted', box2=?, box3=?, box4=?, box5=?, updated_at=NOW() WHERE application_id=?",
        [outRel, box2Json, box3Json, box4Json, box5Json, appId]
      );
    } else {
      await q(
        "INSERT INTO electrical_form_submissions (application_id, status, final_pdf_path, box2, box3, box4, box5) VALUES (?,?,?,?,?,?,?)",
        [appId, "submitted", outRel, box2Json, box3Json, box4Json, box5Json]
      );
    }

    // also persist to disk (optional)
    fs.writeFileSync(draftP, JSON.stringify(payload, null, 2));

    return res.json({ success:true, user_filled_url: outUrl, user_filled_path: outRel });
  } catch (e) {
    console.error("submitFilledPdf error:", e);
    return res.status(500).json({ success:false, message:"Failed to submit filled PDF" });
  }
};
