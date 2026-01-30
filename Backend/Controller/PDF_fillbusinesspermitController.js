// Controller/PDF_fillbusinesspermitController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const REQUIREMENTS_DIR = path.join(UPLOADS_ROOT, "requirements");
const TEMPLATE_PATH =
  process.env.BUSINESS_PERMIT_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "business_permit_full_template.pdf");

fs.mkdirSync(REQUIREMENTS_DIR, { recursive: true });

/* Helpers */
const posix = path.posix;
function toUrlRel(...segments) {
  return "/" + posix.join(...segments.map(s => String(s).replace(/^\/+|\/+$/g, "")));
}
function toRelUploadsPath(s) {
  if (!s) return null;
  const normalized = String(s).replace(/\\/g, "/");
  const i = normalized.indexOf("/uploads/");
  return i >= 0 ? normalized.slice(i) : null;
}
function fileExistsRel(rel) {
  try {
    const abs = path.join(__dirname, "..", rel.replace(/^\/+/, "").replace(/\//g, path.sep));
    fs.accessSync(abs, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
/* Find latest USER-FILLED file path */
async function getLatestUserFilledPath(application_id) {
  const rows = await q(
    `SELECT pdf_path AS p, uploaded_at
       FROM tbl_application_requirements
      WHERE application_type='business'
        AND application_id=?
        AND file_path = 'Business Permit – Verification Sheet (User Filled)'
      ORDER BY uploaded_at DESC
      LIMIT 1`,
    [application_id]
  );
  if (!rows.length) return null;
  
  const rel = toRelUploadsPath(rows[0].p);
  return rel && fileExistsRel(rel) ? rel : null;
}
/* DB helper */
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

/* Find latest EMPLOYEE LGU form (base) */
async function resolveEmployeeTemplate(application_id) {
  const rows = await q(
    `SELECT pdf_path AS p
       FROM tbl_application_requirements
      WHERE application_type='business'
        AND application_id=?
        AND (file_path = 'Business Permit LGU Form'
             OR file_path LIKE '%Business Permit LGU%'
             OR file_path LIKE '%LGU Form%')
      ORDER BY uploaded_at DESC
      LIMIT 1`,
    [application_id]
  );
  const rel = rows[0]?.p && toRelUploadsPath(rows[0].p);
  if (!rel) return null;
  const abs = path.join(__dirname, "..", rel.replace(/^\/+/, "").replace(/\//g, path.sep));
  try {
    fs.accessSync(abs, fs.constants.R_OK);
    return { abs, url: `${PUBLIC_BASE_URL}${rel}` };
  } catch {
    return null;
  }
}

/* Find latest USER-FILLED attachment (healing for stale final_pdf_path) */
async function resolveLatestUserFilled(application_id) {
  const rows = await q(
    `SELECT pdf_path AS p
       FROM tbl_application_requirements
      WHERE application_type='business'
        AND application_id=?
        AND (file_path = 'Business Permit – Verification Sheet (User Filled)'
             OR file_path LIKE '%Verification Sheet (User Filled)%'
             OR file_path LIKE '%User Filled%')
      ORDER BY uploaded_at DESC
      LIMIT 1`,
    [application_id]
  );
  const rel = rows[0]?.p && toRelUploadsPath(rows[0].p);
  return rel && fileExistsRel(rel) ? rel : null;
}

/* Business application row */
async function getBusinessApp(application_id) {
  const r = await q(`SELECT * FROM business_permits WHERE BusinessP_id=? LIMIT 1`, [application_id]);
  return r[0] || null;
}

function mapHeaderRow(row) {
  const contact =
    row.contact_no ?? row.contact_number ?? row.owner_contact ?? row.business_contact ??
    row.mobile_no ?? row.mobile ?? row.phone_number ?? row.phone ?? row.telephone ?? row.tel_no ?? "";

  const first  = row.first_name  ?? row.fname  ?? row.owner_first_name     ?? row.applicant_first_name  ?? "";
  const middle = row.middle_name ?? row.mname  ?? row.owner_middle_name    ?? row.applicant_middle_name ?? "";
  const last   = row.last_name   ?? row.lname  ?? row.owner_last_name      ?? row.applicant_last_name   ?? "";

  const businessName    = row.business_name ?? row.trade_name ?? row.establishment_name ?? "";
  const businessAddress = row.business_address ?? row.establishment_address ?? row.address ?? "";

  return {
    year: new Date().getFullYear(),
    business_type: String(row.application_type || "").toUpperCase(),
    applicant_name: [first, middle, last].filter(Boolean).join(" "),
    business_name: businessName,
    business_address: businessAddress,
    contact_no: String(contact),
  };
}

/* NEW HELPER FUNCTIONS FOR MERGING DATA */
// Helper to merge existing data with new department data
async function mergePDFData(existingSheet, newData, department) {
  // Start with existing data or empty object
  const merged = existingSheet || {};
  
  // Department to section mapping
  const departmentSections = {
    'MPDO': ['zoning', 'fitness'],
    'MEO': ['environment', 'market'],
    'MHO': ['sanitation'],
    'MAO': ['agriculture']
  };
  
  // Get sections this department can update
  const sectionsToUpdate = departmentSections[department] || [];
  
  // Only update sections that this department has access to
  sectionsToUpdate.forEach(section => {
    if (newData[section]) {
      merged[section] = newData[section];
    }
  });
  
  return merged;
}

// Get existing form data
async function getExistingFormData(appId) {
  const existingForm = (await q(
    `SELECT zoning, fitness, environment, sanitation, market, agriculture, status
     FROM business_clearance_form WHERE application_id=? LIMIT 1`, 
    [appId]
  ))[0];

  if (!existingForm) return {};

  return {
    zoning: existingForm.zoning ? JSON.parse(existingForm.zoning) : {},
    fitness: existingForm.fitness ? JSON.parse(existingForm.fitness) : {},
    environment: existingForm.environment ? JSON.parse(existingForm.environment) : {},
    sanitation: existingForm.sanitation ? JSON.parse(existingForm.sanitation) : {},
    market: existingForm.market ? JSON.parse(existingForm.market) : {},
    agriculture: existingForm.agriculture ? JSON.parse(existingForm.agriculture) : {}
  };
}

// Check if all departments have completed their sections
async function checkAllDepartmentsComplete(appId) {
  const form = (await q(
    `SELECT zoning, fitness, environment, sanitation, market, agriculture, status
     FROM business_clearance_form WHERE application_id=? LIMIT 1`, 
    [appId]
  ))[0];

  if (!form) return false;

  try {
    const sections = {
      zoning: form.zoning ? JSON.parse(form.zoning) : {},
      fitness: form.fitness ? JSON.parse(form.fitness) : {},
      environment: form.environment ? JSON.parse(form.environment) : {},
      sanitation: form.sanitation ? JSON.parse(form.sanitation) : {},
      market: form.market ? JSON.parse(form.market) : {},
      agriculture: form.agriculture ? JSON.parse(form.agriculture) : {}
    };

    // Check if all sections have an action set
    const allSections = Object.values(sections);
    const allHaveAction = allSections.every(section => 
      section && section.action && section.action.trim() !== ''
    );
    
    return allHaveAction;
  } catch (error) {
    console.error('Error checking completion:', error);
    return false;
  }
}

// Replace your entire XY configuration with this corrected version:
const XY = {
  page3: {
    header: {
      YEAR:             { x: 120, y: 801 },
      BUSINESS_TYPE:    { x: 420, y: 801 },
      NAME_APPLICANT:   { x: 190, y: 768 },
      BUSINESS_NAME:    { x: 190, y: 748 },
      BUSINESS_ADDRESS: { x: 190, y: 728 },
      CONTACT_NO:       { x: 190, y: 708 },
    },
    // Section 1: Zoning (Page 3, first section)
    sec1: {
      APPROVED:           { x: 100, y: 670 },  // Checkbox for Approved
      APPROVED_WITH_COND: { x: 200, y: 670 },  // Checkbox for Approved with Conditions
      DENIED:             { x: 350, y: 670 },  // Checkbox for Denied
      DEF_1: { x: 205, y: 585 },
      DEF_2: { x: 205, y: 569 },
      DEF_3: { x: 205, y: 553 },
      DEF_4: { x: 205, y: 537 },
      DEF_5: { x: 205, y: 521 },
      REMARKS: { x: 205, y: 500 },
    },
    // Section 2: Fitness (Page 3, second section)
    sec2: {
      APPROVED:           { x: 100, y: 450 },  // Checkbox for Approved
      APPROVED_WITH_COND: { x: 200, y: 450 },  // Checkbox for Approved with Conditions
      DENIED:             { x: 350, y: 450 },  // Checkbox for Denied
      DEF_1: { x: 205, y: 465 },
      DEF_2: { x: 205, y: 449 },
      DEF_3: { x: 205, y: 433 },
      DEF_4: { x: 205, y: 417 },
      DEF_5: { x: 205, y: 401 },
      REMARKS: { x: 205, y: 380 },
    },
    // Section 3: Environment/Solid Waste (Page 3, third section)
    sec3: {
      APPROVED:           { x: 100, y: 230 },  // Checkbox for Approved
      APPROVED_WITH_COND: { x: 200, y: 230 },  // Checkbox for Approved with Conditions
      DENIED:             { x: 350, y: 230 },  // Checkbox for Denied
      DEF_1: { x: 205, y: 345 },
      DEF_2: { x: 205, y: 329 },
      DEF_3: { x: 205, y: 313 },
      DEF_4: { x: 205, y: 297 },
      DEF_5: { x: 205, y: 281 },
      REMARKS: { x: 205, y: 260 },
    },
  },
  page4: {
    header: {
      YEAR:             { x: 120, y: 801 },
      BUSINESS_TYPE:    { x: 420, y: 801 },
      NAME_APPLICANT:   { x: 190, y: 768 },
      BUSINESS_NAME:    { x: 190, y: 748 },
      BUSINESS_ADDRESS: { x: 190, y: 728 },
      CONTACT_NO:       { x: 190, y: 708 },
    },
    // Section 4: Sanitation (Page 4, first section)
    sec4: {
      APPROVED:           { x: 100, y: 670 },  // Checkbox for Approved
      APPROVED_WITH_COND: { x: 200, y: 670 },  // Checkbox for Approved with Conditions
      DENIED:             { x: 350, y: 670 },  // Checkbox for Denied
      DEF_1: { x: 205, y: 585 },
      DEF_2: { x: 205, y: 569 },
      DEF_3: { x: 205, y: 553 },
      DEF_4: { x: 205, y: 537 },
      DEF_5: { x: 205, y: 521 },
      REMARKS: { x: 205, y: 500 },
    },
    // Section 5: Public Market (Page 4, second section)
    sec5: {
      APPROVED:           { x: 100, y: 450 },  // Checkbox for Approved
      APPROVED_WITH_COND: { x: 200, y: 450 },  // Checkbox for Approved with Conditions
      DENIED:             { x: 350, y: 450 },  // Checkbox for Denied
      DEF_1: { x: 180, y: 555 },
      DEF_2: { x: 180, y: 539 },
      DEF_3: { x: 180, y: 523 },
      DEF_4: { x: 180, y: 507 },
      DEF_5: { x: 180, y: 491 },
      REMARKS: { x: 180, y: 470 },
    },
    // Section 6: Agriculture (Page 4, third section)
    sec6: {
      APPROVED:           { x: 100, y: 230 },  // Checkbox for Approved
      APPROVED_WITH_COND: { x: 200, y: 230 },  // Checkbox for Approved with Conditions
      DENIED:             { x: 350, y: 230 },  // Checkbox for Denied
      DEF_1: { x: 205, y: 345 },
      DEF_2: { x: 205, y: 329 },
      DEF_3: { x: 205, y: 313 },
      DEF_4: { x: 205, y: 297 },
      DEF_5: { x: 205, y: 281 },
      REMARKS: { x: 205, y: 260 },
    },
  },
  fontSize: 9,
};
/* Draw helpers */
function drawText(page, font, text, xy, size = XY.fontSize) {
  const t = String(text ?? "").trim();
  if (!t) return;
  page.drawText(t, { x: xy.x, y: xy.y, size, font });
}
/* Update the mark() function to be more visible */
function mark(page, font, xy, markChar = "X") {  // Changed from "_______" to "X"
  page.drawText(markChar, { 
    x: xy.x, 
    y: xy.y, 
    size: XY.fontSize, 
    font,
    color: rgb(0, 0, 0) // Ensure black color
  });
}


// Add this at the top of your file after the imports
const { rgb } = require('pdf-lib');

/* Render onto p3–p4; if only 2 pages, use p2 for both groups */
async function renderSheet({ basePdfBytes, header, sheet }) {
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const n = pages.length;
  const pA = n >= 3 ? pages[2] : pages[Math.min(1, n - 1)];
  const pB = n >= 4 ? pages[3] : pages[Math.min(1, n - 1)];

  const drawHeader = (page, hdrXY) => {
    drawText(page, font, header.year,             hdrXY.YEAR, 9);
    drawText(page, font, header.business_type,    hdrXY.BUSINESS_TYPE, 9);
    drawText(page, font, header.applicant_name,   hdrXY.NAME_APPLICANT, 9);
    drawText(page, font, header.business_name,    hdrXY.BUSINESS_NAME, 9);
    drawText(page, font, header.business_address, hdrXY.BUSINESS_ADDRESS, 9);
    drawText(page, font, header.contact_no,       hdrXY.CONTACT_NO, 9);
  };
  drawHeader(pA, XY.page3.header);
  drawHeader(pB, XY.page4.header);

  const stamp = (page, secXY, secData) => {
    const a = (secData?.action || "").toLowerCase();
    if (a === "approved") mark(page, font, secXY.APPROVED);
    else if (a === "approved_with_conditions") mark(page, font, secXY.APPROVED_WITH_COND);
    else if (a === "denied") mark(page, font, secXY.DENIED);

    const defs = secData?.deficiencies || {};
    if (defs["1"]) mark(page, font, secXY.DEF_1, defs["1"]);
    if (defs["2"]) mark(page, font, secXY.DEF_2, defs["2"]);
    if (defs["3"]) mark(page, font, secXY.DEF_3, defs["3"]);
    if (defs["4"]) mark(page, font, secXY.DEF_4, defs["4"]);
    if (defs["5"]) mark(page, font, secXY.DEF_5, defs["5"]);
    if (secData?.remarks) drawText(page, font, secData.remarks, secXY.REMARKS);
  };

  stamp(pA, XY.page3.sec1, sheet.zoning);
  stamp(pA, XY.page3.sec2, sheet.fitness);
  stamp(pA, XY.page3.sec3, sheet.environment);
  stamp(pB, XY.page4.sec4, sheet.sanitation);
  stamp(pB, XY.page4.sec5, sheet.market);
  stamp(pB, XY.page4.sec6, sheet.agriculture);

  return await pdfDoc.save();
}

/* ───────── GET: load draft + heal stale final path + admin template ───────── */
exports.user_getForm = async (req, res) => {
  try {
    const appId = Number(req.query.application_id || req.body?.application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    const draft = (await q(
      `SELECT application_id, draft_pdf_path, final_pdf_path, zoning, fitness, environment, sanitation, market, agriculture
         FROM business_clearance_form WHERE application_id=? LIMIT 1`, [appId]))[0] || null;

    let draftPayload = null;
    let user_filled_url = null;

    if (draft) {
      draftPayload = {
        zoning:      draft.zoning ? JSON.parse(draft.zoning) : {},
        fitness:     draft.fitness ? JSON.parse(draft.fitness) : {},
        environment: draft.environment ? JSON.parse(draft.environment) : {},
        sanitation:  draft.sanitation ? JSON.parse(draft.sanitation) : {},
        market:      draft.market ? JSON.parse(draft.market) : {},
        agriculture: draft.agriculture ? JSON.parse(draft.agriculture) : {},
      };

      // HEAL: if final_pdf_path is missing/old, replace with latest valid /uploads/requirements path
      let rel = draft.final_pdf_path && (toRelUploadsPath(draft.final_pdf_path) || draft.final_pdf_path);
      if (!rel || !fileExistsRel(rel) || rel.includes("/system_generated/")) {
        const healed = await resolveLatestUserFilled(appId);
        if (healed) {
          await q(`UPDATE business_clearance_form SET final_pdf_path=?, updated_at=NOW() WHERE application_id=?`, [healed, appId]);
          rel = healed;
        } else {
          rel = null;
        }
      }
      if (rel) user_filled_url = `${PUBLIC_BASE_URL}${rel}`;
    }

    // Show latest employee LGU template (base) if present
    let admin_template_url = null;
    try {
      const t = await resolveEmployeeTemplate(appId);
      if (t?.url) admin_template_url = t.url;
    } catch {}

    // Check completion status
    const is_complete = await checkAllDepartmentsComplete(appId);

    return res.json({ 
      success: true, 
      draft: draftPayload, 
      admin_template_url, 
      user_filled_url,
      is_complete 
    });
  } catch (e) {
    console.error("business user_getForm error:", e);
    return res.status(500).json({ success: false, message: "Failed to load form." });
  }
};

/* ───────── POST: save draft ───────── */
exports.user_saveDraft = async (req, res) => {
  try {
    const { application_id, data, department } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    // Get existing data
    const existingData = await getExistingFormData(appId);
    
    // Merge with new data based on department
    const mergedData = await mergePDFData(existingData, data, department);

    // Save merged data
    const zoning = JSON.stringify(mergedData.zoning || {});
    const fitness = JSON.stringify(mergedData.fitness || {});
    const environment = JSON.stringify(mergedData.environment || {});
    const sanitation = JSON.stringify(mergedData.sanitation || {});
    const market = JSON.stringify(mergedData.market || {});
    const agriculture = JSON.stringify(mergedData.agriculture || {});

    await q(
      `INSERT INTO business_clearance_form
         (application_id, status, zoning, fitness, environment, sanitation, market, agriculture, updated_at)
       VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         status='draft', zoning=VALUES(zoning), fitness=VALUES(fitness), 
         environment=VALUES(environment), sanitation=VALUES(sanitation), 
         market=VALUES(market), agriculture=VALUES(agriculture),
         updated_at=NOW()`,
      [appId, zoning, fitness, environment, sanitation, market, agriculture]
    );

    // Check completion status
    const is_complete = await checkAllDepartmentsComplete(appId);

    return res.json({ 
      success: true, 
      message: "Draft saved.",
      is_complete 
    });
  } catch (e) {
    console.error("business user_saveDraft error:", e);
    return res.status(500).json({ success: false, message: "Failed to save draft." });
  }
};

/* ───────── POST: preview (writes to /uploads/requirements) ───────── */
exports.user_generatePreview = async (req, res) => {
  try {
    const { application_id, data, department } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    const appRow = await getBusinessApp(appId);
    if (!appRow) return res.status(404).json({ success: false, message: "Business application not found." });

    // Get existing data
    const existingData = await getExistingFormData(appId);
    
    // Merge with new data based on department
    const mergedData = await mergePDFData(existingData, data, department);

    let baseAbs = TEMPLATE_PATH;
    const resolved = await resolveEmployeeTemplate(appId);
    if (resolved?.abs) baseAbs = resolved.abs;

    const header = mapHeaderRow(appRow);
    const baseBytes = fs.readFileSync(baseAbs);

    const outBytes = await renderSheet({ basePdfBytes: baseBytes, header, sheet: mergedData || {} });
    
    // Check if preview already exists
    let rel;
    const existingPreview = await getLatestUserFilledPath(appId);
    
    if (existingPreview && existingPreview.includes('preview')) {
      // Update existing preview file
      const abs = path.join(__dirname, "..", existingPreview.replace(/^\/+/, "").replace(/\//g, path.sep));
      fs.writeFileSync(abs, outBytes);
      rel = existingPreview;
    } else {
      // Create new preview file
      const fname = `business_permit_${appId}_lgu_form_preview.pdf`;
      const abs = path.join(REQUIREMENTS_DIR, fname);
      fs.writeFileSync(abs, outBytes);
      rel = toUrlRel("uploads", "requirements", fname);
    }
    
    await q(`UPDATE business_clearance_form SET draft_pdf_path=?, updated_at=NOW() WHERE application_id=?`, [rel, appId]);

    // Check completion status
    const is_complete = await checkAllDepartmentsComplete(appId);

    return res.json({ 
      success: true, 
      preview_url: `${PUBLIC_BASE_URL}${rel}`,
      is_complete 
    });
  } catch (e) {
    console.error("business user_generatePreview error:", e);
    return res.status(500).json({ success: false, message: "Failed to build preview." });
  }
};

/* ───────── POST: submit (render FINAL + UPDATE existing file) ───────── */
exports.user_submitFilled = async (req, res) => {
  try {
    const { application_id, data, department } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "application_id is required" });
    }

    // Get existing form data
    const existingData = await getExistingFormData(appId);
    
    // Merge new data with existing data based on department
    const mergedData = await mergePDFData(existingData, data, department);

    // Check if all departments are now complete
    const is_complete = await checkAllDepartmentsComplete(appId);
    
    // Determine status based on completion
    const status = is_complete ? 'submitted' : 'in_progress';

    // Save merged form data
    const zoning = JSON.stringify(mergedData.zoning || {});
    const fitness = JSON.stringify(mergedData.fitness || {});
    const environment = JSON.stringify(mergedData.environment || {});
    const sanitation = JSON.stringify(mergedData.sanitation || {});
    const market = JSON.stringify(mergedData.market || {});
    const agriculture = JSON.stringify(mergedData.agriculture || {});

   await q(
  `INSERT INTO business_clearance_form
     (application_id, status, zoning, fitness, environment, sanitation, market, agriculture, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
   ON DUPLICATE KEY UPDATE
     status=VALUES(status), zoning=VALUES(zoning), fitness=VALUES(fitness), 
     environment=VALUES(environment), sanitation=VALUES(sanitation), 
     market=VALUES(market), agriculture=VALUES(agriculture),
     updated_at=NOW()`,
  [appId, status, zoning, fitness, environment, sanitation, market, agriculture]
);

// If zoning is approved, update the related requirement
if (zoning === 'approve') {
  await q(
    `UPDATE business_lgu_requirements_status
     SET status = 'approved', updated_at = NOW(),
         remarks = 'Zoning clearance approved via clearance form'
     WHERE application_id = ? AND requirement_key = 'zoning_clearance'`,
    [appId]
  );
}
console.log('Fitness status:', fitness);
if (fitness === 'approve') {
  console
}
// Similarly for other fields like occupancy_permit (if fitness maps to it)
// if (fitness === 'approve') {
//   await q(
//     `UPDATE business_lgu_requirements_status
//      SET status = 'approved', updated_at = NOW(),
//          remarks = 'Occupancy permit approved via clearance form'
//      WHERE application_id = ? AND requirement_key = 'occupancy_permit'`,
//     [appId]
//   );
// }

    const appRow = await getBusinessApp(appId);
    if (!appRow) return res.status(404).json({ success: false, message: "Business application not found." });
    
    const header = mapHeaderRow(appRow);

    let baseAbs = TEMPLATE_PATH;
    const resolved = await resolveEmployeeTemplate(appId);
    if (resolved?.abs) baseAbs = resolved.abs;

    const baseBytes = fs.readFileSync(baseAbs);
    const outBytes = await renderSheet({ basePdfBytes: baseBytes, header, sheet: mergedData || {} });

    let rel, url;
    const existingUserFilled = await getLatestUserFilledPath(appId);
    
    if (existingUserFilled) {
      // UPDATE existing file - overwrite it
      const abs = path.join(__dirname, "..", existingUserFilled.replace(/^\/+/, "").replace(/\//g, path.sep));
      fs.writeFileSync(abs, outBytes);
      rel = existingUserFilled;
      url = `${PUBLIC_BASE_URL}${rel}`;
      
      // Update the timestamp in database (same record, same file)
      await q(
        `UPDATE tbl_application_requirements 
         SET uploaded_at=NOW()
         WHERE application_type='business' 
           AND application_id=?
           AND pdf_path = ?`,
        [appId, existingUserFilled]
      );
    } else {
      // CREATE new file (first time submission) - use a consistent filename
      const fname = `business_permit_${appId}_filled_final.pdf`;
      const abs = path.join(REQUIREMENTS_DIR, fname);
      fs.writeFileSync(abs, outBytes);
      rel = toUrlRel("uploads", "requirements", fname);
      url = `${PUBLIC_BASE_URL}${rel}`;

      // Insert new record
      await q(
        `INSERT INTO tbl_application_requirements
           (app_uid, user_id, file_path, application_type, application_id, pdf_path, uploaded_at)
         VALUES (
           (SELECT app_uid FROM application_index WHERE application_type='business' AND application_id=? LIMIT 1),
           (SELECT user_id FROM business_permits WHERE BusinessP_id=? LIMIT 1),
           'Business Permit – Verification Sheet (User Filled)', 'business', ?, ?, NOW()
         )`,
        [appId, appId, appId, rel]
      );
    }

    // Update final_pdf_path
    await q(`UPDATE business_clearance_form SET final_pdf_path=?, updated_at=NOW() WHERE application_id=?`, [rel, appId]);

    return res.json({ 
      success: true, 
      user_filled_url: url,
      updated_existing: !!existingUserFilled,
      is_complete: is_complete,
      message: existingUserFilled ? "Form updated successfully." : "Form submitted successfully."
    });
  } catch (e) {
    console.error("business user_submitFilled error:", e);
    return res.status(500).json({ success: false, message: "Failed to submit filled form." });
  }
};