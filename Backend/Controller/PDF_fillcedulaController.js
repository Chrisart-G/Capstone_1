// Controller/PDF_fillcedulaController.js
const path = require("path");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const db = require("../db/dbconnect");

/* ───────── Config ───────── */
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:8081").replace(/\/+$/, "");
const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOAD_DIR = path.join(UPLOADS_ROOT, "system_generated", "cedula");
const TEMPLATE_PATH =
  process.env.CEDULA_TEMPLATE_PATH ||
  path.join(__dirname, "..", "templates", "CEDULA_template.pdf"); // put your Cedula template here

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
/* ───────── shared query helper ───────── */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
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

/* ───────── tolerant loader (find the row regardless of table name/PK) ───────── */
async function getByKeys(table, keyValue) {
  const cols = await tableColumns(table);
  if (cols.size === 0) return null;

  const candidates = [
    ["id", keyValue],
    ["application_id", keyValue],
    ["cedula_id", keyValue],
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

async function getCedulaApplication(application_id) {
  const tryTables = [
    "tbl_cedula",
    "cedula",
    "cedula_applications",
    "tbl_cedulas",
  ];
  for (const t of tryTables) {
    const row = await getByKeys(t, application_id);
    if (row) return { row, table: t };
  }
  return null;
}

/* ───────── Row → PDF template mapping ───────── */

function formatDateForPdf(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function mapRow(r) {
  if (!r) return null;

  return {
    name: r.name || "",
    address: r.address || "",
    place_of_birth: r.place_of_birth || "",
    date_of_birth_raw: r.date_of_birth || "",
    date_of_birth: formatDateForPdf(r.date_of_birth),
    profession: r.profession || "",
    yearly_income: r.yearly_income != null ? String(r.yearly_income) : "",
    purpose: r.purpose || "",
    sex: r.sex || "", // 'male' / 'female'
    civil_status: r.status || "", // 'single','married','widowed'
    tin: r.tin || "",
    created_at: r.created_at || null,
  };
}

/* ───────── PDF filler ───────── */

async function fillCedulaTemplate(mapped) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Cedula template not found at: ${TEMPLATE_PATH}\n` +
        `Set CEDULA_TEMPLATE_PATH in your .env to the correct PDF path.`
    );
  }

  const src = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(src);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const p1 = pdfDoc.getPages()[0];
  const { width, height } = p1.getSize();

  const draw = (text, x, y, size = 9) => {
    const s = String(text ?? "").trim();
    if (!s) return;
    p1.drawText(s, { x, y, size, font });
  };

  // NOTE:
  // Coordinates below are safe defaults inside the page.
  // Adjust x/y values after you visually inspect the output
  // so they line up with your actual CEDULA template fields.

  // Top line: Name and Address
  draw(mapped.name, 80, height - 97); // Name
  draw(mapped.address, 80, height - 124); // Address

  // Birth details
  draw(mapped.place_of_birth, 289, height - 149); // Place of Birth
  draw(mapped.date_of_birth, 384, height - 180); // Date of Birth

  // Profession & Purpose
  draw(mapped.profession, 80, height - 207); // Profession
  // draw(mapped.purpose, 80, height - 250); // Purpose / Remarks

  // Income, TIN
  // draw(mapped.yearly_income, 120, height - 900); // Yearly Income
  draw(mapped.tin, 380, height - 97); // TIN

  // Sex / Civil status (simple text – you can change to "X" markers later)
  draw(mapped.sex.toUpperCase(), 384, height - 124); // Sex
  draw(mapped.civil_status.toUpperCase(), 120, height - 174); // Civil Status

  // Date issued (use created_at if available)
  const issued = mapped.created_at ? formatDateForPdf(mapped.created_at) : "";
  draw(issued, width - 300, height - 67); // Date of issuance

  return await pdfDoc.save();
}

/* ───────── Attach into tbl_application_requirements (and legacy table) ───────── */

async function attachToAppRequirements({ application_id, pdf_path, srcRow }) {
  let app_uid = null;
  let applicantUserId = null;
  try {
    const idx = await ensureAppIndex("cedula", application_id, srcRow);
    app_uid = idx?.app_uid || null;
    applicantUserId = idx?.user_id || null;
  } catch (e) {
    console.warn("ensureAppIndex (cedula) warning:", e.message);
  }

  const cols = await tableColumns("tbl_application_requirements");
  const hasAppUid = cols.has("app_uid");
  const hasUserId = cols.has("user_id");
  const hasPdfPath = cols.has("pdf_path");
  const hasFileUrl = cols.has("file_url");
  const hasUploadedAt = cols.has("uploaded_at");
  const hasFilePath = cols.has("file_path");

  const FILE_LABEL = "Cedula Filled Form";
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
    ["cedula", application_id, FILE_LABEL]
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
  valsIns.push("cedula");
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
    const baseVals = ["cedula", application_id, relPath, "system"];
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

exports.generateFilledCedula = async (req, res) => {
  try {
    const { application_id } = req.body || {};
    const appId = Number(application_id);
    if (!Number.isFinite(appId) || appId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "application_id is required and must be a positive number" });
    }

    const hit = await getCedulaApplication(appId);
    if (!hit)
      return res.status(404).json({ success: false, message: "Cedula application not found" });

    const row = hit.row;
    const mapped = mapRow(row);
    const outBytes = await fillCedulaTemplate(mapped);

    const filename = `cedula-${appId}-${Date.now()}.pdf`;
    const absPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(absPath, outBytes);

    const relPath = `/uploads/system_generated/cedula/${filename}`;

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
    console.error("generateFilledCedula error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error generating Cedula form." });
  }
};

/* ───────── Remove handler (generic – works for all types) ───────── */

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
        return res.status(400).json({
          success: false,
          message: "Nothing to match (no file_path/pdf_path).",
        });
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

    return res.json({ success: true, message: "Requirement removed." });
  } catch (err) {
    console.error("removeAttachedRequirement (cedula) error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove requirement." });
  }
};

