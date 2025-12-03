// Controller/forgotPasswordController.js
const db = require('../db/dbconnect');
const bcrypt = require('bcrypt');
const { isSmsEnabled, sendSms } = require('../services/smsService');

/* ---------------- Helpers ---------------- */
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function minutesFromNow(mins = 10) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d;
}
function normalizePhone(p) {
  if (!p) return null;
  let s = String(p).trim();
  // keep only digits and leading + if present
  s = s.replace(/[^\d+]/g, '');
  // drop leading +
  s = s.replace(/^\+/, '');
  // convert common PH forms to 63XXXXXXXXXX
  if (s.startsWith('09') && s.length === 11) return '63' + s.slice(1);      // 09xxxxxxxxx -> 63xxxxxxxxxx
  if (s.startsWith('9') && s.length === 10)  return '63' + s;               // 9xxxxxxxxx  -> 63xxxxxxxxxx
  if (s.startsWith('0') && s.length === 11)  return '63' + s.slice(1);      // 0xxxxxxxxxx -> 63xxxxxxxxxx
  if (s.startsWith('63') && s.length === 12) return s;                      // 63xxxxxxxxxx
  return s; // fallback (still digits)
}

/**
 * Build a candidate set of phone strings matching how it could be saved in DB.
 * Returns array like: ['639xxxxxxxxx', '+639xxxxxxxxx', '09xxxxxxxxx', '9xxxxxxxxx']
 */
function phoneCandidatesFromCanon(canon63) {
  const set = new Set();
  const c = String(canon63 || '');
  if (!c) return [];

  set.add(c);                        // 63xxxxxxxxxx
  set.add('+' + c);                  // +63xxxxxxxxxx
  if (c.startsWith('63') && c.length === 12) {
    const local11 = '0' + c.slice(2);    // 09xxxxxxxxx
    const local10 = c.slice(2);          // 9xxxxxxxxx
    set.add(local11);
    set.add(local10);
  }
  return Array.from(set);
}

/* ---------------------------------------------------
   STEP 1: identify by email OR phone (robust matching)
---------------------------------------------------- */
exports.request = (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier) return res.status(400).json({ message: "Missing email or phone" });

  const byEmail = 'SELECT user_id FROM tb_logins WHERE email = ? LIMIT 1';
  const canon63 = normalizePhone(identifier);
  const candidates = phoneCandidatesFromCanon(canon63);

  // First try by email
  db.query(byEmail, [identifier], (e1, r1) => {
    if (e1) {
      console.error("[FP] lookup email error:", e1);
      return res.status(500).json({ message: "Lookup failed" });
    }
    if (r1.length) {
      console.log(`[FP] request by email OK userId=${r1[0].user_id}`);
      return res.json({ userId: r1[0].user_id });
    }

    // If no email match and no usable phone, stop
    if (!candidates.length) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Build dynamic placeholders for IN (...)
    const placeholders = candidates.map(() => '?').join(',');
    // Clean stored phone in SQL to compare fairly (strip +, spaces, dashes)
    const byPhone = `
      SELECT u.user_id
      FROM tb_logins u
      JOIN tbl_user_info i ON u.user_id = i.user_id
      WHERE REPLACE(REPLACE(REPLACE(i.phone_number, '+',''), ' ', ''), '-', '') IN (${placeholders})
      LIMIT 1
    `;

    // Also pass cleaned candidates (strip +, space, dash to match SQL cleaning)
    const cleanedCandidates = candidates.map(v => String(v).replace(/[+\s-]/g, ''));

    db.query(byPhone, cleanedCandidates, (e2, r2) => {
      if (e2) {
        console.error("[FP] lookup phone error:", e2);
        return res.status(500).json({ message: "Lookup failed" });
      }
      if (!r2.length) {
        return res.status(404).json({ message: "Account not found" });
      }
      console.log(`[FP] request by phone OK userId=${r2[0].user_id} idForms=`, candidates);
      return res.json({ userId: r2[0].user_id });
    });
  });
};

/* -----------------------------------------------
   STEP 1b: send / resend the OTP (same table)
----------------------------------------------- */
exports.resend = async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ message: "userId required" });

  db.query(
    'SELECT i.phone_number, l.email FROM tbl_user_info i JOIN tb_logins l ON i.user_id = l.user_id WHERE i.user_id=? LIMIT 1',
    [userId],
    async (err, rows) => {
      if (err) {
        console.error("[FP] resend lookup error:", err);
        return res.status(500).json({ message: "Lookup failed" });
      }
      if (!rows.length) return res.status(404).json({ message: "User not found" });

      const rawPhone = rows[0].phone_number;
      const canon63 = normalizePhone(rawPhone);
      const code = genOtp();
      const expires = minutesFromNow(10);

      db.query(
        'INSERT INTO tbl_phone_verifications (user_id, phone_number, otp_code, expires_at, attempts, is_used) VALUES (?, ?, ?, ?, 0, 0)',
        [userId, canon63 || rawPhone, code, expires],
        async (iErr) => {
          if (iErr) {
            console.error("[FP] resend insert error:", iErr);
            return res.status(500).json({ message: "Could not create OTP" });
          }

          const enabled = await isSmsEnabled().catch(() => false);
          console.log(`[FP] SEND → userId=${userId} phone=${canon63 || rawPhone} enabled=${enabled} code=${enabled ? "***" : code}`);

          if (enabled) {
            try {
              await sendSms({ to: canon63 || rawPhone, message: `Your password reset code is ${code}. It expires in 10 minutes.` });
              console.log("[FP] SEND ← OK");
            } catch (sErr) {
              console.error("[FP] SEND ← FAIL:", sErr?.message || sErr);
            }
          } else {
            console.log("[FP] SMS disabled. Returning dev_otp in response.");
          }

          return res.json({ success: true, dev_otp: enabled ? undefined : code });
        }
      );
    }
  );
};

/* -------------------------------
   STEP 2: verify the OTP
-------------------------------- */
exports.verify = (req, res) => {
  const { userId, code } = req.body || {};
  if (!userId || !code) return res.status(400).json({ message: "userId and code required" });

  db.query(
    `SELECT id, otp_code, expires_at, attempts, is_used
     FROM tbl_phone_verifications
     WHERE user_id=? AND is_used=0
     ORDER BY id DESC LIMIT 1`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("[FP] verify lookup error:", err);
        return res.status(500).json({ message: "Lookup failed" });
      }
      if (!rows.length) return res.status(400).json({ message: "No active code. Please resend." });

      const row = rows[0];
      const expired = new Date(row.expires_at) < new Date();
      const attempts = row.attempts + 1;

      if (expired) {
        db.query('UPDATE tbl_phone_verifications SET attempts=?, is_used=1 WHERE id=?', [attempts, row.id]);
        return res.status(400).json({ message: "Code expired. Please resend." });
      }
      if (String(row.otp_code) !== String(code)) {
        db.query('UPDATE tbl_phone_verifications SET attempts=? WHERE id=?', [attempts, row.id]);
        return res.status(400).json({ message: "Invalid code." });
      }

      db.query('UPDATE tbl_phone_verifications SET is_used=1, attempts=? WHERE id=?', [attempts, row.id]);
      req.session.reset_ok_for_user = Number(userId);
      console.log(`[FP] verify OK userId=${userId}`);
      return res.json({ success: true });
    }
  );
};

/* -----------------------------------------
   STEP 3: update password (after verify)
------------------------------------------ */
exports.reset = async (req, res) => {
  const { userId, newPassword } = req.body || {};
  if (!userId || !newPassword) return res.status(400).json({ message: "userId and newPassword required" });

  if (req.session.reset_ok_for_user !== Number(userId)) {
    return res.status(403).json({ message: "OTP verification required." });
  }

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE tb_logins SET password=? WHERE user_id=?', [hash, userId], (err) => {
      if (err) {
        console.error("[FP] reset error:", err);
        return res.status(500).json({ message: "Could not update password" });
      }
      console.log(`[FP] password updated userId=${userId}`);
      req.session.reset_ok_for_user = null;
      return res.json({ success: true });
    });
  } catch (e) {
    console.error("[FP] reset fatal:", e);
    res.status(500).json({ message: "Internal error" });
  }
};
