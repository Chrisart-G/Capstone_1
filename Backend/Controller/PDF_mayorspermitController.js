// Controller/PDF_mayorspermitController.js
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");
const QRCode = require("qrcode"); // <<< NEW

/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_DIR = path.join(UPLOADS_ROOT, "system_generated", "mayors_permit");
const SIG_DIR = path.join(UPLOAD_DIR, "signatures");
const TEMPLATE_PATH =
  process.env.MAYORS_PERMIT_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "MAYORS PERMIT FORM Final (1).pdf");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(SIG_DIR, { recursive: true });

/* ───────── DB helpers ───────── */
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function getBusinessRow(businessId) {
  const rows = await q(
    `SELECT * FROM business_permits WHERE BusinessP_id = ? LIMIT 1`,
    [businessId]
  );
  return rows[0] || null;
}

/** Get assessment totals saved earlier by your LGU assessment UI. */
async function getAssessmentTotals(businessId) {
  const rows = await q(
    `SELECT total_fees_lgu, fsif_15
       FROM business_permit_assessment
      WHERE BusinessP_id = ? LIMIT 1`,
    [businessId]
  );
  if (!rows[0]) return { total_fees_lgu: 0, fsif_15: 0 };
  return rows[0];
}

/** Ensure application_index has an entry; return {app_uid, user_id}. */
async function ensureIndexed(appType, appId, fallbackUserId = null) {
  const sel = await q(
    `SELECT app_uid, user_id FROM application_index
      WHERE application_type = ? AND application_id = ? LIMIT 1`,
    [appType, appId]
  );
  if (sel[0]) return sel[0];

  let uid = `APP-${appType.toUpperCase()}-${appId}-${crypto.randomBytes(3).toString("hex")}`;
  let userId = fallbackUserId;

  if (!userId) {
    const r = await q(
      `SELECT user_id FROM business_permits WHERE BusinessP_id = ? LIMIT 1`,
      [appId]
    );
    userId = r[0]?.user_id || null;
  }

  await q(
    `INSERT INTO application_index (app_uid, application_type, application_id, user_id, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [uid, appType, appId, userId]
  );

  return { app_uid: uid, user_id: userId };
}

/** Upsert attachment into tbl_application_requirements (no duplicates by file_path label). */
async function upsertAttachment({ app_uid, user_id, appType, appId, fileUrlDbPath, label }) {
  const dupe = await q(
    `SELECT requirement_id FROM tbl_application_requirements
      WHERE application_type = ? AND application_id = ? AND file_path = ?
      LIMIT 1`,
    [appType, appId, label]
  );

  if (dupe[0]) {
    await q(
      `UPDATE tbl_application_requirements
          SET pdf_path = ?, uploaded_at = NOW()
        WHERE requirement_id = ?`,
      [fileUrlDbPath, dupe[0].requirement_id]
    );
  } else {
    await q(
      `INSERT INTO tbl_application_requirements
        (app_uid, user_id, file_path, application_type, application_id, pdf_path, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [app_uid, user_id, label, appType, appId, fileUrlDbPath]
    );
  }
}

/* ───────── Utils ───────── */
/** Turn a '/uploads/...' or 'http://host/uploads/...' into an absolute disk path. */
function toAbsUploadsPath(maybeUrl) {
  if (!maybeUrl) return null;
  const withoutHost = String(maybeUrl).replace(/^https?:\/\/[^/]+/i, "");
  const clean = withoutHost.replace(/^\/+/, ""); // now starts with 'uploads/...'
  return path.join(__dirname, "..", clean);
}

/** If no signature path provided, get the newest file in SIG_DIR (or null). */
function newestSignatureInDir() {
  if (!fs.existsSync(SIG_DIR)) return null;
  const files = fs.readdirSync(SIG_DIR)
    .filter(f => /\.(png|jpe?g)$/i.test(f))
    .map(f => ({ f, t: fs.statSync(path.join(SIG_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return files[0] ? path.join(SIG_DIR, files[0].f) : null;
}

/* ───────── QR helper (NEW) ───────── */
/**
 * Add a QR code to an existing PDF.
 *
 * @param {string} pdfAbsPath  absolute path to the PDF
 * @param {string} qrData      text/URL to encode
 * @param {Object} options
 *   - pageIndex (default 0)
 *   - x, y        (bottom-left corner)
 *   - size        (square side length)
 */
async function addQrToPdfFile(pdfAbsPath, qrData, options = {}) {
  const {
    pageIndex = 0,
    x,
    y,
    size = 70,   // default side length
  } = options;

  if (!qrData) throw new Error("QR data is required.");
  if (!fs.existsSync(pdfAbsPath)) {
    throw new Error(`PDF not found at path: ${pdfAbsPath}`);
  }

  const pdfBytes = fs.readFileSync(pdfAbsPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[pageIndex];
  if (!page) throw new Error(`Page index ${pageIndex} not found in PDF.`);

  // Generate QR PNG buffer
  const qrBuffer = await QRCode.toBuffer(qrData, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 4,
  });

  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const imgW = qrImage.width;
  const imgH = qrImage.height;

  // keep square aspect ratio
  const targetSize = size || 70;
  const scale = Math.min(targetSize / imgW, targetSize / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;

  // default position: bottom-right with a margin
  const { width: pageW, height: pageH } = page.getSize();
  const margin = 40;

  const finalX = typeof x === "number" ? x : (pageW - drawW - margin);
  const finalY = typeof y === "number" ? y : margin;

  page.drawImage(qrImage, {
    x: finalX,
    y: finalY,
    width: drawW,
    height: drawH,
  });

  const updatedBytes = await pdfDoc.save();
  fs.writeFileSync(pdfAbsPath, updatedBytes);
}

/* ───────── PDF drawing ───────── */
/** XY tuned for your screenshot/template (adjust if needed) */
const XY = {
  // Top header area
  PERMIT_NO:           { x: 203, y: 610 },
  DATE_OF_ISSUANCE:    { x: 203, y: 575 },
  NAME_OF_PERMITTEE:   { x: 205, y: 540 },
  BUSINESS_NAME:       { x: 203, y: 505 },
  BUSINESS_ADDRESS:    { x: 203, y: 463 },
  KIND_OF_BUSINESS:    { x: 205, y: 425 },

  BUSINESS_STATUS:     { x: 208, y: 375 },
  MODE_OF_PAYMENT:     { x: 208, y: 338 },
  OR_NO:               { x: 205, y: 287 },
  AMOUNT_PAID:         { x: 205, y: 252 },
  DATE_OF_EXPIRY:      { x: 205, y: 196 }, 

  // Signature box just above the mayor’s printed name (tweak to fit)
  MAYOR_SIGNATURE:     { x: 360, y: 250, w: 165, h: 55 },

  // <<< NEW: suggested QR location (bottom-right area)
  QR_CODE:             { x: 390, y: 80, size: 100 }, // tweak as needed
};

async function buildMayorsPermitPDF({ templatePath, outAbsPath, payload }) {
  const bytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(bytes);

  const page = pdfDoc.getPage(0);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (val, { x, y }, { bold = false, size = 11 } = {}) => {
    if (val == null || val === "") return;
    page.drawText(String(val), { x, y, size, font: bold ? fontBold : font });
  };

  // Text fields
  drawText(payload.permitNo,        XY.PERMIT_NO,        { bold: true });
  drawText(payload.kindOfBusiness,  XY.KIND_OF_BUSINESS);
  drawText(payload.dateOfIssuance,  XY.DATE_OF_ISSUANCE);
  drawText(payload.dateOfExpiry,    XY.DATE_OF_EXPIRY);
  drawText(payload.nameOfPermittee, XY.NAME_OF_PERMITTEE, { bold: true });
  drawText(payload.businessName,    XY.BUSINESS_NAME,     { bold: true });
  drawText(payload.businessAddress, XY.BUSINESS_ADDRESS);
  drawText(payload.businessStatus,  XY.BUSINESS_STATUS);
  drawText(payload.modeOfPayment,   XY.MODE_OF_PAYMENT);
  drawText(payload.orNo,            XY.OR_NO);
  drawText(payload.amountPaid,      XY.AMOUNT_PAID,       { bold: true });

  // Mayor e-signature (PNG/JPG), keep aspect ratio and center in box
  const sigPath = payload.mayorSignatureAbs;
  if (sigPath && fs.existsSync(sigPath)) {
    try {
      const raw = fs.readFileSync(sigPath);
      const img = /\.(png)$/i.test(sigPath) ? await pdfDoc.embedPng(raw) : await pdfDoc.embedJpg(raw);

      const imgW = img.width;
      const imgH = img.height;
      const boxW = XY.MAYOR_SIGNATURE.w;
      const boxH = XY.MAYOR_SIGNATURE.h;
      const scale = Math.min(boxW / imgW, boxH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      page.drawImage(img, {
        x: XY.MAYOR_SIGNATURE.x + (boxW - drawW) / 2,
        y: XY.MAYOR_SIGNATURE.y + (boxH - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    } catch (err) {
      console.warn("Signature embed failed, continuing without image:", err.message);
    }
  }

  const outBytes = await pdfDoc.save();
  fs.writeFileSync(outAbsPath, outBytes);
}

/* ───────── Public endpoints ───────── */

/**
 * POST /api/mayors-permit/upload-signature
 * FormData: signature (png/jpg)
 * Returns: { success, db_path, file_url }
 */
exports.uploadMayorSignature = async (req, res) => {
  try {
    const file = req.files?.signature; // express-fileupload
    if (!file) {
      return res.status(400).json({ success: false, message: "No signature file uploaded." });
    }
    if (!/image\/(png|jpeg|jpg)/i.test(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Signature must be PNG or JPG." });
    }

    const ext = /\.png$/i.test(file.name) ? ".png" : ".jpg";
    const fname = `mayor_sign_${Date.now()}${ext}`;
    const absPath = path.join(SIG_DIR, fname);

    await file.mv(absPath);

    const dbPath = `/uploads/system_generated/mayors_permit/signatures/${fname}`;
    const fileUrl = `${PUBLIC_BASE_URL}${dbPath}`;
    return res.json({ success: true, db_path: dbPath, file_url: fileUrl });
  } catch (e) {
    console.error("uploadMayorSignature error:", e);
    return res.status(500).json({ success: false, message: "Upload failed." });
  }
};

/**
 * POST /api/mayors-permit/generate-final
 * Body:
 *  - application_id (BusinessP_id)
 *  - permit_no
 *  - kind_of_business
 *  - date_of_issuance (ISO | yyyy-mm-dd) optional
 *  - mayor_signature_path (optional; '/uploads/...' or full URL)
 */
exports.generateFinalMayorsPermit = async (req, res) => {
  try {
    const {
      application_id,
      permit_no,
      kind_of_business,
      date_of_issuance,
      mayor_signature_path,
    } = req.body || {};

    const businessId = Number(application_id);
    if (!Number.isFinite(businessId) || businessId <= 0) {
      return res.status(400).json({ success: false, message: "application_id must be a positive number." });
    }
    if (!permit_no || !kind_of_business) {
      return res.status(400).json({ success: false, message: "permit_no and kind_of_business are required." });
    }

    const row = await getBusinessRow(businessId);
    if (!row) return res.status(404).json({ success: false, message: "Business permit not found." });

    // Compose values
    const nameOfPermittee = `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`
      .replace(/\s+/g, " ")
      .trim();

    const businessName = row.business_name || row.trade_name || "";
    const businessAddress =
      row.business_address ||
      [row.owner_address, row.business_postal_code ? ` ${row.business_postal_code}` : ""]
        .filter(Boolean)
        .join("");

    const isRenewal = /\brenewal\b/i.test(row.application_type || "");
    const businessStatus = isRenewal ? "Renewal" : "New";
    const modeOfPayment = row.payment_mode || "";

    // Dates
    const issuedDate = date_of_issuance ? new Date(date_of_issuance) : new Date();
    const expiryDate = new Date(issuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Amount Paid = total_fees_lgu ONLY
    const t = await getAssessmentTotals(businessId);
    const amountPaidNum = Number(t.total_fees_lgu || 0);

    // OR number intentionally not taken from receipts per your requirement
    const orNo = "N/A";

    // Signature absolute path: use provided path or fall back to latest in SIG_DIR
    let mayorSignatureAbs = null;
    if (mayor_signature_path) {
      mayorSignatureAbs = toAbsUploadsPath(mayor_signature_path);
    } else {
      mayorSignatureAbs = newestSignatureInDir();
    }

    const payload = {
      permitNo: String(permit_no).trim(),
      kindOfBusiness: String(kind_of_business).trim(),
      dateOfIssuance: issuedDate.toLocaleDateString(),
      dateOfExpiry:   expiryDate.toLocaleDateString(),
      nameOfPermittee,
      businessName,
      businessAddress,
      businessStatus,
      modeOfPayment,
      orNo,
      amountPaid: amountPaidNum.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      mayorSignatureAbs, // optional
    };

    // Build and save PDF (no QR yet)
    const fname = `mayors_permit_final_${businessId}_${Date.now()}.pdf`;
    const absPath = path.join(UPLOAD_DIR, fname);
    await buildMayorsPermitPDF({
      templatePath: TEMPLATE_PATH,
      outAbsPath: absPath,
      payload,
    });

    const dbPath = `/uploads/system_generated/mayors_permit/${fname}`;
    const appTypeForIndex = isRenewal ? "renewal_business" : "business";

    // Ensure we have app_uid for QR + attachment
    const { app_uid, user_id } = await ensureIndexed(
      appTypeForIndex,
      businessId,
      row.user_id || null
    );

    // >>> NEW: generate verification URL + embed QR into the PDF
    const verificationUrl = `${PUBLIC_BASE_URL}/verify/app/${app_uid}`;
    try {
      await addQrToPdfFile(absPath, verificationUrl, {
        pageIndex: 0,
        x: XY.QR_CODE.x,
        y: XY.QR_CODE.y,
        size: XY.QR_CODE.size,
      });
    } catch (qrErr) {
      // Do NOT break existing behavior if QR fails
      console.error("Failed to embed QR into Mayor's Permit PDF:", qrErr);
    }

    // Attach into tbl_application_requirements (unchanged behavior)
    await upsertAttachment({
      app_uid,
      user_id,
      appType: appTypeForIndex,
      appId: businessId,
      fileUrlDbPath: dbPath,
      label: "Mayor’s Permit – Final Output",
    });

    const base = `${req.protocol}://${req.get("host")}`;
    return res.json({
      success: true,
      message: "Final Mayor’s Permit generated and attached.",
      pdf_path: dbPath,
      file_url: `${base}${dbPath}`,
      drawn: payload,
      // extra, like business permit with assessment
      verification_url: verificationUrl,
    });
  } catch (e) {
    console.error("generateFinalMayorsPermit error:", e);
    return res.status(500).json({ success: false, message: "Failed to generate Final Mayor’s Permit." });
  }
};

/**
 * Optional: remove attachment helper (mirrors your other remove endpoints)
 * Body: { requirement_id }
 */
exports.removeAttachedRequirement = async (req, res) => {
  try {
    const { requirement_id } = req.body || {};
    if (!requirement_id) return res.status(400).json({ success: false, message: "requirement_id is required." });

    await q(`DELETE FROM tbl_application_requirements WHERE requirement_id = ? LIMIT 1`, [requirement_id]);
    return res.json({ success: true });
  } catch (e) {
    console.error("Mayor’s removeAttachedRequirement error:", e);
    return res.status(500).json({ success: false, message: "Failed to remove requirement." });
  }
};
