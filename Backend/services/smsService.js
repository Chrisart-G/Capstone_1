// services/smsService.js
const axios = require('axios');
const db = require('../db/dbconnect');

const { IPROG_API_TOKEN, SMS_ENABLED = 'true' } = process.env;

/* ---------------- Phone normalizer (same idea as in employeedash) ---------------- */
function normPhone(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/\D/g, "");
  if (s.startsWith("09")) s = "63" + s.slice(1);
  else if (s.startsWith("9") && s.length === 10) s = "63" + s;
  else if (s.startsWith("0") && s.length === 11) s = "63" + s.slice(1);
  else if (s.startsWith("+63")) s = s.replace("+", "");
  return s;
}

/* ---------------- Feature flag ---------------- */
async function isSmsEnabled() {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.query(
        'SELECT v FROM system_settings WHERE k = "sms_enabled" LIMIT 1',
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    if (rows && rows[0]) {
      const enabled = rows[0].v === 'true';
      console.log('[SMS][FLAG] system_settings.sms_enabled =', rows[0].v, '→', enabled);
      return enabled;
    }
  } catch (err) {
    console.error('[SMS][FLAG] DB error when checking sms_enabled:', err);
  }

  const fallback = String(SMS_ENABLED).toLowerCase() === 'true';
  console.log('[SMS][FLAG] using env SMS_ENABLED =', SMS_ENABLED, '→', fallback);
  return fallback;
}

/* ---------------- iProgTech send with DEBUG ---------------- */
async function sendSms({ to, message }) {
  const url = 'https://sms.iprogtech.com/api/v1/sms_messages';
  const phone = normPhone(to);

  const params = {
    api_token: IPROG_API_TOKEN,
    phone_number: phone,
    message: String(message || '').slice(0, 306),
  };

  console.log('[SMS][OTP] SEND →', { url, params });

  try {
    const res = await axios.post(url, null, {
      params,
      timeout: 15000,
      validateStatus: () => true,
    });

    console.log('[SMS][OTP] SEND ←', res.status, res.data);

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      data: res.data,
    };
  } catch (err) {
    console.error(
      '[SMS][OTP] ERROR:',
      err?.response?.status,
      err?.response?.data || err
    );
    return { ok: false, error: err };
  }
}

module.exports = { isSmsEnabled, sendSms };
