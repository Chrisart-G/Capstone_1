// Controller/PDF_cedulaTreasurerController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_DIR = path.join(UPLOADS_ROOT, "system_generated", "cedula");
const SIG_DIR = path.join(UPLOAD_DIR, "signatures");
const TEMPLATE_PATH = path.join(__dirname, "..", "templates", "CEDULA_template.pdf");

fs.mkdirSync(SIG_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

/** Upload Treasurer’s signature (PNG/JPG) */
exports.uploadTreasurerSignature = async (req, res) => {
  try {
    const file = req.files?.signature;
    if (!file) return res.status(400).json({ success: false, message: "No signature uploaded." });
    if (!/image\/(png|jpeg|jpg)/i.test(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Signature must be PNG or JPG." });
    }

    const ext = path.extname(file.name || "").toLowerCase() === ".png" ? ".png" : ".jpg";
    const fname = `treasurer_sign_${Date.now()}${ext}`;
    const absPath = path.join(SIG_DIR, fname);

    await file.mv(absPath);

    const dbPath = `/uploads/system_generated/cedula/signatures/${fname}`;
    const fileUrl = `${PUBLIC_BASE_URL}${dbPath}`;
    return res.json({ success: true, db_path: dbPath, file_url: fileUrl });
  } catch (e) {
    console.error("uploadTreasurerSignature error:", e);
    return res.status(500).json({ success: false, message: "Upload failed." });
  }
};

/** Generate Cedula Final (adds Treasurer amounts + signature) */
exports.generateCedulaFinal = async (req, res) => {
  try {
    const {
      application_id,
      taxable_amount,
      tax_due,
      interest,
      total_amount,
      treasurer_signature_path,
    } = req.body || {};

    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res.status(400).json({ success: false, message: "Valid application_id is required." });
    }

    // IMPORTANT: tbl_cedula uses `id`, NOT `cedula_id`
    const rows = await q("SELECT * FROM tbl_cedula WHERE id = ? LIMIT 1", [appId]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Cedula application not found." });

    const cedula = rows[0];
    const userId = cedula.user_id;

    // Ensure application_index exists to get app_uid
    let idx = await q(
      "SELECT app_uid FROM application_index WHERE application_type = ? AND application_id = ? LIMIT 1",
      ["cedula", appId]
    );
    let appUid = idx[0]?.app_uid;

    if (!appUid) {
      const ins = await q(
        "INSERT INTO application_index (application_type, application_id, user_id) VALUES (?,?,?)",
        ["cedula", appId, userId]
      );
      appUid = ins.insertId;
    }

    // Load template
    if (!fs.existsSync(TEMPLATE_PATH)) {
      return res.status(500).json({ success: false, message: "Cedula template not found on server." });
    }

    const pdfBytes = fs.readFileSync(TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.getPages()[0];

    // NOTE: You MUST adjust these coordinates to match your template.
    // These are placeholders so the code works and does not crash.
    const draw = (text, x, y, size = 10) => {
      const s = text == null ? "" : String(text);
      page.drawText(s, { x, y, size, font });
    };

    draw(taxable_amount || "", 410, 145, 10);
    draw(tax_due || "",        410, 130, 10);
    draw(interest || "",       410, 115, 10);
    draw(total_amount || "",   410, 100, 10);

    // Signature (optional)
    if (treasurer_signature_path) {
      // treasurer_signature_path is like: /uploads/system_generated/cedula/signatures/xxx.png
      const rel = String(treasurer_signature_path).replace(/^\/uploads\//, "");
      const absSig = path.join(UPLOADS_ROOT, rel);

      if (fs.existsSync(absSig)) {
        const imgBytes = fs.readFileSync(absSig);
        const isPng = absSig.toLowerCase().endsWith(".png");
        const img = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);

        // Placeholder coordinates (adjust to your template)
        page.drawImage(img, { x: 430, y: 60, width: 120, height: 40 });
      }
    }

    // Save PDF
    const outName = `cedula_final_${appId}_${Date.now()}.pdf`;
    const outAbs = path.join(UPLOAD_DIR, outName);
    const outBytes = await pdfDoc.save();
    fs.writeFileSync(outAbs, outBytes);

    const dbPath = `/uploads/system_generated/cedula/${outName}`;
    const fileUrl = `${PUBLIC_BASE_URL}${dbPath}`;

    // Attach (replace existing "Cedula Final Form" if any)
    await q(
      "DELETE FROM tbl_application_requirements WHERE application_type=? AND application_id=? AND file_path=?",
      ["cedula", appId, "Cedula Final Form"]
    );

    await q(
      `INSERT INTO tbl_application_requirements
        (app_uid, user_id, file_path, application_type, application_id, pdf_path, uploaded_at)
       VALUES (?,?,?,?,?,?, NOW())`,
      [appUid, userId, "Cedula Final Form", "cedula", appId, dbPath]
    );

    return res.json({ success: true, file_url: fileUrl, db_path: dbPath });
  } catch (e) {
    console.error("generateCedulaFinal error:", e);
    return res.status(500).json({ success: false, message: "Failed to generate final Cedula PDF." });
  }
};
