// controllers/smsController.js
const axios = require("axios");
const db = require("../db/dbconnect");

const { IPROG_API_TOKEN, SMS_ENABLED = "true" } = process.env;

// ---- small db promise helper
function q(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );
}

// ---- feature flag (DB first, then .env)
async function getSmsEnabledFlag() {
  try {
    const rows = await q('SELECT v FROM system_settings WHERE k="sms_enabled" LIMIT 1');
    if (rows && rows[0]) return rows[0].v === "true";
  } catch (_) {}
  return String(SMS_ENABLED).toLowerCase() === "true";
}

async function setSmsEnabledFlag(enabled) {
  await q(
    'INSERT INTO system_settings (k, v) VALUES ("sms_enabled", ?) ON DUPLICATE KEY UPDATE v=VALUES(v)',
    [enabled ? "true" : "false"]
  );
  return enabled;
}

// ---- phone normalizer: to 639xxxxxxxxx (PH)
function normPhone(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/\D/g, ""); // keep digits
  if (s.startsWith("09")) s = "63" + s.slice(1);     // 09xxxxxxxxx -> 639xxxxxxxxx
  else if (s.startsWith("9") && s.length === 10) s = "63" + s; // 9xxxxxxxxx -> 639xxxxxxxxx
  else if (s.startsWith("0") && s.length === 11) s = "63" + s.slice(1); // 0xxxxxxxxxx -> 63xxxxxxxxxx
  else if (s.startsWith("63")) { /* ok */ }
  else if (s.startsWith("+63")) s = s.replace("+", "");
  return s;
}

// ---- IPROG sender (docs show query params) 
// POST https://sms.iprogtech.com/api/v1/sms_messages?api_token=...&message=...&phone_number=639...
async function iprogSend({ phone, message, provider = 0 }) {
  const url = "https://sms.iprogtech.com/api/v1/sms_messages";
  const params = {
    api_token: IPROG_API_TOKEN,
    phone_number: normPhone(phone),
    message: message,
    sms_provider: provider, // optional
  };
  // DEBUG
  console.log("[SMS] iprogSend →", { url, params });

  const res = await axios.post(url, null, {
    params,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
    validateStatus: () => true, // don't throw; we inspect below
  });

  console.log("[SMS] iprogSend ← status:", res.status, "data:", res.data);

  if (res.status >= 200 && res.status < 300) return res.data;
  const err = new Error("IPROG send failed");
  err.response = res;
  throw err;
}

// ---- credits check (useful for debugging)
async function iprogCredits() {
  const url = "https://sms.iprogtech.com/api/v1/account/sms_credits";
  const params = { api_token: IPROG_API_TOKEN };
  console.log("[SMS] credits check →", { url, params });

  const res = await axios.get(url, { params, timeout: 10000, validateStatus: () => true });
  console.log("[SMS] credits check ←", res.status, res.data);
  return res.data;
}

// ---- clamps to ~2 segments
function clamp(msg) {
  return (msg || "").trim().slice(0, 306);
}

// ---- Lookups
async function getUserPhoneByUserId(userId) {
  const rows = await q("SELECT phone_number FROM tbl_user_info WHERE user_id=? LIMIT 1", [userId]);
  return rows?.[0]?.phone_number || null;
}

async function getUserPhoneByApp(application_type, application_id) {
  const idx = await q(
    "SELECT user_id FROM application_index WHERE application_type=? AND application_id=? LIMIT 1",
    [String(application_type).toLowerCase(), Number(application_id)]
  );
  const userId = idx?.[0]?.user_id;
  if (!userId) return null;
  return getUserPhoneByUserId(userId);
}

// ---- Message template
function buildStatusMessage({ officeName, applicationTypeLabel, applicationNo, newStatus, extraNote }) {
  const lines = [
    officeName || "Municipality",
    `${applicationTypeLabel || "Application"} ${applicationNo ? `#${applicationNo}` : ""}`.trim(),
    `Status: ${newStatus}`,
    extraNote || "Login to your account for details.",
  ].filter(Boolean);
  return clamp(lines.join("\n"));
}

// ================== PUBLIC HTTP HANDLERS ==================
exports.getSmsEnabledStatus = async (req, res) => {
  try {
    const enabled = await getSmsEnabledFlag();
    res.json({ success: true, sms_enabled: enabled });
  } catch (e) {
    console.error("[SMS] getSmsEnabledStatus error:", e);
    res.status(500).json({ success: false, message: "Failed to read setting" });
  }
};

exports.setSmsEnabled = async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean")
      return res.status(400).json({ success: false, message: "enabled must be boolean" });
    await setSmsEnabledFlag(enabled);
    res.json({ success: true, sms_enabled: enabled });
  } catch (e) {
    console.error("[SMS] setSmsEnabled error:", e);
    res.status(500).json({ success: false, message: "Failed to update setting" });
  }
};

// GET /api/sms/credits  (debug)
exports.getCredits = async (_req, res) => {
  try {
    const data = await iprogCredits();
    res.json({ success: true, data });
  } catch (e) {
    console.error("[SMS] credits error:", e?.response?.data || e);
    res.status(500).json({ success: false, message: "Credits check failed" });
  }
};

// POST /api/sms/send
exports.sendStatusUpdate = async (req, res) => {
  try {
    const {
      user_id,
      application_type,
      application_id,
      office_name,
      application_no,
      new_status, // required
      extra_note,
    } = req.body;

    const enabled = await getSmsEnabledFlag();
    if (!enabled) return res.json({ success: true, skipped: true, reason: "sms-disabled" });
    if (!new_status) return res.status(400).json({ success: false, message: "new_status required" });

    let phone = null;
    if (user_id) phone = await getUserPhoneByUserId(user_id);
    else if (application_type && application_id) phone = await getUserPhoneByApp(application_type, application_id);

    if (!phone) return res.status(404).json({ success: false, message: "Phone not found" });

    const appTypeLabel = (application_type || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const message = buildStatusMessage({
      officeName: office_name,
      applicationTypeLabel: appTypeLabel,
      applicationNo: application_no,
      newStatus: new_status,
      extraNote: extra_note,
    });

    const provider = await iprogSend({ phone, message });
    res.json({ success: true, phone: normPhone(phone), provider });
  } catch (e) {
    console.error("[SMS] sendStatusUpdate error:", e?.response?.status, e?.response?.data || e);
    res.status(500).json({ success: false, message: "SMS send failed" });
  }
};

// POST /api/sms/test { phone, message }
exports.sendTest = async (req, res) => {
  try {
    const { phone, message } = req.body;
    const enabled = await getSmsEnabledFlag();
    if (!enabled) return res.json({ success: true, skipped: true, reason: "sms-disabled" });
    if (!phone || !message) return res.status(400).json({ success: false, message: "phone and message required" });
    const provider = await iprogSend({ phone, message: clamp(message) });
    res.json({ success: true, phone: normPhone(phone), provider });
  } catch (e) {
    console.error("[SMS] sendTest error:", e?.response?.status, e?.response?.data || e);
    res.status(500).json({ success: false, message: "SMS send failed" });
  }
};

// ================== PROGRAMMATIC API ==================
exports.notifyOnStatusChange = async function notifyOnStatusChange({
  user_id,
  application_type,
  application_id,
  office_name,
  application_no,
  new_status,
  extra_note,
}) {
  const enabled = await getSmsEnabledFlag();
  if (!enabled) return { success: true, skipped: true, reason: "sms-disabled" };

  let phone = null;
  if (user_id) phone = await getUserPhoneByUserId(user_id);
  else if (application_type && application_id) phone = await getUserPhoneByApp(application_type, application_id);
  if (!phone) return { success: false, message: "Phone not found" };

  const appTypeLabel = (application_type || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const message = buildStatusMessage({
    officeName: office_name,
    applicationTypeLabel: appTypeLabel,
    applicationNo: application_no,
    newStatus: new_status,
    extraNote: extra_note,
  });

  try {
    const provider = await iprogSend({ phone, message });
    return { success: true, phone: normPhone(phone), provider };
  } catch (e) {
    console.error("[SMS] notifyOnStatusChange error:", e?.response?.status, e?.response?.data || e);
    return { success: false, message: "SMS send failed" };
  }
};
