// Backend/Controller/userupdateController.js
const db = require("../db/dbconnect");

/* ---------------- DB helper ---------------- */
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/* ---------------- session user id helper ---------------- */
function getSessionUserId(req) {
  // supports common patterns used in sessionAuth
  return (
    req.session?.user?.user_id ||
    req.session?.user_id ||
    req.session?.userId ||
    req.session?.user?.id ||
    null
  );
}

function normalizeType(s) {
  return String(s || "").toLowerCase().trim();
}

function pickAllowed(body, allowed = []) {
  const out = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

function canUserEditStatus(statusRaw) {
  const s = String(statusRaw || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");
  // allow edits only while not yet processed deeply
  return s === "pending" || s === "inreview";
}

/**
 * TYPE_MAP
 *  - table: exact DB table name
 *  - pk: primary key column name
 *  - userCol: column that stores the owner user_id
 *  - statusCol: column that holds the workflow status
 *  - editable: columns that can be updated from the user side
 *
 *  IMPORTANT: all column names below must match your SQL schema exactly.
 */
const TYPE_MAP = {
  /* ---------------- BUSINESS PERMIT ---------------- */
  business: {
    table: "business_permits",
    pk: "BusinessP_id",
    userCol: "user_id",
    statusCol: "status",
    editable: [
      "application_type",
      "payment_mode",
      "tin_no",
      "registration_no",
      "registration_date",

      // business info
      "business_name",
      "trade_name",
      "business_address",
      "business_postal_code",
      "business_email",
      "business_telephone",
      "business_mobile",

      // owner contact info (name is stored in separate columns in DB)
      // last_name / first_name / middle_name exist, but are often fixed;
      // include them here only if you want them editable:
      "last_name",
      "first_name",
      "middle_name",
      "owner_address",
      "owner_postal_code",
      "owner_email",
      "owner_telephone",
      "owner_mobile",

      // emergency & business details
      "emergency_contact",
      "emergency_phone",
      "emergency_email",
      "business_area",

      // lessor & rent
      "lessor_name",
      "lessor_address",
      "lessor_phone",
      "monthly_rental",

      // incentives & type
      "tax_incentive",
      "tax_incentive_entity",
      "business_type",
    ],
  },

  /* ---------------- ELECTRICAL PERMIT ---------------- */
  electrical: {
    table: "tbl_electrical_permits",
    pk: "id",
    userCol: "user_id",
    statusCol: "status",
    editable: [
      "last_name",
      "first_name",
      "middle_initial",
      "tin",
      "construction_owned",
      "form_of_ownership",
      "use_or_character",
      "address_no",
      "address_street",
      "address_barangay",
      "address_city",
      "address_zip_code",
      "telephone_no",
      "location_lot_no",
      "location_blk_no",
      "location_tct_no",
      "location_tax_dec_no",
      "location_street",
      "location_barangay",
      "location_city",
      "scope_of_work",
      "other_scope_specify",
    ],
  },

  /* ---------------- ELECTRONICS PERMIT ---------------- */
  electronics: {
    table: "tbl_electronics_permits",
    pk: "id",
    userCol: "user_id",
    statusCol: "status",
    editable: [
      "last_name",
      "first_name",
      "middle_initial",
      "tin",
      "construction_owned",
      "form_of_ownership",
      "use_or_character",
      "address_no",
      "address_street",
      "address_barangay",
      "address_city",
      "address_zip_code",
      "telephone_no",
      "location_lot_no",
      "location_blk_no",
      "location_tct_no",
      "location_tax_dec_no",
      "location_street",
      "location_barangay",
      "location_city",
      "scope_of_work",
      "other_scope_specify",
    ],
  },

  /* ---------------- PLUMBING PERMIT ---------------- */
  plumbing: {
    table: "tbl_plumbing_permits",
    pk: "id",
    userCol: "user_id",
    statusCol: "status",
    editable: [
      "last_name",
      "first_name",
      "middle_initial",
      "tin",
      "construction_owned",
      "form_of_ownership",
      "use_or_character",
      "address_no",
      "address_street",
      "address_barangay",
      "address_city",
      "address_zip_code",
      "telephone_no",
      "location_street",
      "location_lot_no",
      "location_blk_no",
      "location_tct_no",
      "location_tax_dec_no",
      "location_barangay",
      "location_city",
      "scope_of_work",
      "other_scope_specify",
    ],
  },

  /* ---------------- BUILDING PERMIT ---------------- */
  building: {
    table: "tbl_building_permits",
    pk: "id",
    userCol: "user_id",
    statusCol: "status",
    editable: [
      "last_name",
      "first_name",
      "middle_initial",
      "tin",
      "construction_owned",
      "form_of_ownership",
      "address_no",
      "address_street",
      "address_barangay",
      "address_city",
      "address_zip_code",
      "telephone_no",
      "location_lot_no",
      "location_blk_no",
      "location_tct_no",
      "location_tax_dec_no",
      "location_street",
      "location_barangay",
      "location_city",
      "scope_of_work",

      // group / occupancy breakdown
      "group_a",
      "group_b",
      "group_c",
      "group_d",
      "group_e",
      "group_f",
      "group_g",
      "group_h",
      "group_i",
      "group_j1",
      "group_j2",
      "applies_also_for",
    ],
  },

  /* ---------------- FENCING PERMIT ---------------- */
  fencing: {
    table: "tbl_fencing_permits",
    pk: "id",
    userCol: "user_id",
    statusCol: "status",
    editable: [
      "last_name",
      "first_name",
      "middle_initial",
      "tin",
      "construction_ownership", // note: actual column name
      "ownership_form",         // note: actual column name
      "use_or_character",
      "address_no",
      "street",                 // address_street equivalent
      "barangay",               // address_barangay equivalent
      "city_municipality",      // address_city equivalent
      "zip_code",               // address_zip_code equivalent
      "telephone_no",
      "location_street",
      "lot_no",                 // location_lot_no equivalent
      "block_no1",              // location_blk_no equivalent
      "tax_dec_no",             // location_tax_dec_no equivalent
      "location_barangay",
      "location_city",
      "scope_of_work",
      "other_scope_specify",
    ],
  },

  /* ---------------- CEDULA ---------------- */
  cedula: {
    table: "tbl_cedula",
    pk: "id",
    userCol: "user_id",
    statusCol: "application_status",
    editable: [
      "name",
      "address",
      "place_of_birth",
      "date_of_birth",
      "profession",
      "yearly_income",
      "purpose",
      "sex",
      "status",
      "tin",
    ],
  },
};

/* ---------------- GET record for update ---------------- */
exports.getApplicationForUpdate = async (req, res) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const application_type = normalizeType(req.params.application_type);
    const application_id = Number(req.params.application_id);

    const cfg = TYPE_MAP[application_type];
    if (!cfg) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application type." });
    }
    if (!Number.isFinite(application_id) || application_id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application id." });
    }

    const selectCols = [cfg.pk, cfg.statusCol, ...cfg.editable];

    const rows = await q(
      `SELECT ${selectCols.map((c) => `\`${c}\``).join(", ")}
       FROM \`${cfg.table}\`
       WHERE \`${cfg.pk}\` = ? AND \`${cfg.userCol}\` = ?
       LIMIT 1`,
      [application_id, userId]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getApplicationForUpdate error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ---------------- UPDATE record ---------------- */
exports.updateApplication = async (req, res) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const application_type = normalizeType(req.params.application_type);
    const application_id = Number(req.params.application_id);

    const cfg = TYPE_MAP[application_type];
    if (!cfg) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application type." });
    }
    if (!Number.isFinite(application_id) || application_id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application id." });
    }

    // load current to check ownership + status
    const rows = await q(
      `SELECT \`${cfg.pk}\`, \`${cfg.statusCol}\`
       FROM \`${cfg.table}\`
       WHERE \`${cfg.pk}\` = ? AND \`${cfg.userCol}\` = ?
       LIMIT 1`,
      [application_id, userId]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    const currentStatus = rows[0][cfg.statusCol];
    if (!canUserEditStatus(currentStatus)) {
      return res.status(403).json({
        success: false,
        message:
          "This application can no longer be edited because it is already being processed.",
      });
    }

    const payload = pickAllowed(req.body || {}, cfg.editable);

    // prevent empty update
    const keys = Object.keys(payload);
    if (!keys.length) {
      return res
        .status(400)
        .json({ success: false, message: "No editable fields provided." });
    }

    // build UPDATE dynamically
    const setSql = keys.map((k) => `\`${k}\` = ?`).join(", ");
    const params = keys.map((k) => payload[k]);

    await q(
      `UPDATE \`${cfg.table}\`
       SET ${setSql}
       WHERE \`${cfg.pk}\` = ? AND \`${cfg.userCol}\` = ?`,
      [...params, application_id, userId]
    );

    // return refreshed row
    const selectCols = [cfg.pk, cfg.statusCol, ...cfg.editable];
    const updated = await q(
      `SELECT ${selectCols.map((c) => `\`${c}\``).join(", ")}
       FROM \`${cfg.table}\`
       WHERE \`${cfg.pk}\` = ? AND \`${cfg.userCol}\` = ?
       LIMIT 1`,
      [application_id, userId]
    );

    return res.json({
      success: true,
      message: "Application updated.",
      data: updated[0],
    });
  } catch (err) {
    console.error("updateApplication error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
// CANCEL application (user side)
exports.cancelApplication = async (req, res) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const application_type = normalizeType(req.params.application_type);
    const application_id = Number(req.params.application_id);

    const cfg = TYPE_MAP[application_type];
    if (!cfg) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application type." });
    }
    if (!Number.isFinite(application_id) || application_id <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application id." });
    }

    // 1. Load current record to check ownership + status
    const rows = await q(
      `SELECT \`${cfg.pk}\`, \`${cfg.statusCol}\`
       FROM \`${cfg.table}\`
       WHERE \`${cfg.pk}\` = ? AND \`${cfg.userCol}\` = ?
       LIMIT 1`,
      [application_id, userId]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    const currentStatus = rows[0][cfg.statusCol];
    const norm = String(currentStatus || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

    // Do NOT allow cancel once already approved / ready for pickup / rejected
    if (["approved", "readyforpickup", "rejected"].includes(norm)) {
      return res.status(403).json({
        success: false,
        message:
          "This application can no longer be cancelled because it has already been finalized.",
      });
    }

    // 2. Mark as rejected (we use 'rejected' because it's guaranteed in the enum)
    await q(
      `UPDATE \`${cfg.table}\`
       SET \`${cfg.statusCol}\` = 'rejected'
       WHERE \`${cfg.pk}\` = ? AND \`${cfg.userCol}\` = ?`,
      [application_id, userId]
    );

    // 3. Log a comment with the terms & conditions note
    const termsMessage =
      "Application cancelled by the applicant. The applicant acknowledges that any payments and processing expenses already incurred are NON-REFUNDABLE in accordance with the municipal terms and conditions.";

    await q(
      `INSERT INTO application_comments
         (app_uid, application_type, application_id, status_at_post, comment, author_user_id, author_role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'user', NOW())`,
      [
        String(userId),
        application_type,
        application_id,
        "rejected",
        termsMessage,
        userId,
      ]
    );

    return res.json({
      success: true,
      message:
        "Your application has been cancelled. Any payments or processing expenses already incurred are non-refundable as stated in the terms and conditions.",
    });
  } catch (err) {
    console.error("cancelApplication error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};