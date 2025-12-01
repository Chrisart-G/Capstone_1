const db = require('../db/dbconnect');
const { isSmsEnabled, sendSms } = require('../services/smsService');

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const isDev = process.env.NODE_ENV !== 'production';

function genOtp() {
  // 6-digit numeric
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.sendOtp = async (req, res) => {
  try {
    const { userId } = req.body; // prefer userId from your signup response
    console.log('[OTP] /otp/send called with body:', req.body);

    if (!userId) {
      console.warn('[OTP] sendOtp missing userId');
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    // fetch phone + verified flag
    db.query(
      'SELECT phone_number, phone_verified FROM tbl_user_info WHERE user_id = ? LIMIT 1',
      [userId],
      async (err, rows) => {
        if (err) {
          console.error('[OTP] DB error fetching user info:', err);
          return res.status(500).json({ success: false, message: 'DB error' });
        }
        if (!rows.length) {
          console.warn('[OTP] No tbl_user_info row for userId', userId);
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { phone_number, phone_verified } = rows[0];
        console.log('[OTP] user row:', { userId, phone_number, phone_verified });

        if (!phone_number) {
          console.warn('[OTP] No phone_number on file for userId', userId);
          return res.status(400).json({ success: false, message: 'No phone on file' });
        }
        if (phone_verified) {
          console.log('[OTP] Phone already verified for userId', userId);
          return res.status(200).json({ success: true, alreadyVerified: true });
        }

        const code = genOtp();
        const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

        console.log('[OTP] Generated code:', { userId, code, expiresAt });

        db.query(
          `INSERT INTO tbl_phone_verifications (user_id, phone_number, otp_code, expires_at)
           VALUES (?, ?, ?, ?)`,
          [userId, phone_number, code, expiresAt],
          async (err2) => {
            if (err2) {
              console.error('[OTP] Could not create OTP row:', err2);
              return res.status(500).json({ success: false, message: 'Could not create OTP' });
            }

            console.log('[OTP] OTP row inserted for userId', userId);

            const enabled = await isSmsEnabled().catch((e) => {
              console.error('[OTP] isSmsEnabled error:', e);
              return false;
            });

            console.log('[OTP] SMS enabled?', enabled);

            if (enabled) {
              // Use shared SMS service with debug logs
              const sms = await sendSms({
                to: phone_number,
                message: `Municipality of Hinigaran Online Portal Your verification code is ${code}. It will expire in ${OTP_TTL_MIN} minutes.`,
              }).catch((e) => {
                console.error('[OTP] sendSms throw:', e);
                return { ok: false, error: e };
              });

              console.log('[OTP] sendSms result:', sms);

              if (!sms || !sms.ok) {
                return res.status(500).json({
                  success: false,
                  message: 'Failed to send SMS',
                  sms_status: sms?.status || null,
                });
              }

              return res.json({ success: true, sent: true });
            } else {
              // DEV ONLY: return the code so you can test with sms off
              console.log('[OTP] SMS disabled, returning dev_otp:', isDev ? code : undefined);
              return res.json({
                success: true,
                sent: false,
                dev_otp: isDev ? code : undefined,
              });
            }
          }
        );
      }
    );
  } catch (e) {
    console.error('[OTP] sendOtp server error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, code } = req.body;
    console.log('[OTP] /otp/verify called with body:', req.body);

    if (!userId || !code) {
      console.warn('[OTP] verifyOtp missing userId or code');
      return res.status(400).json({ success: false, message: 'userId and code required' });
    }

    db.query(
      `SELECT * FROM tbl_phone_verifications
       WHERE user_id = ? AND is_used = 0
       ORDER BY id DESC LIMIT 1`,
      [userId],
      (err, rows) => {
        if (err) {
          console.error('[OTP] verify DB error:', err);
          return res.status(500).json({ success: false, message: 'DB error' });
        }
        if (!rows.length) {
          console.warn('[OTP] No OTP request found for userId', userId);
          return res.status(404).json({ success: false, message: 'No OTP request found' });
        }

        const otp = rows[0];
        console.log('[OTP] Latest OTP row:', otp);

        const now = new Date();
        const expired = now > otp.expires_at;
        const tooMany = otp.attempts >= MAX_ATTEMPTS;

        if (expired) {
          console.warn('[OTP] Code expired for userId', userId);
          return res.status(400).json({ success: false, message: 'Code expired' });
        }
        if (tooMany) {
          console.warn('[OTP] Too many attempts for OTP id', otp.id);
          return res.status(429).json({ success: false, message: 'Too many attempts' });
        }

        if (otp.otp_code !== String(code)) {
          console.warn('[OTP] Invalid code for userId', userId, 'expected', otp.otp_code, 'got', code);
          // bump attempts
          db.query(
            'UPDATE tbl_phone_verifications SET attempts = attempts + 1 WHERE id = ?',
            [otp.id],
            (uErr) => {
              if (uErr) console.error('[OTP] bump attempts error:', uErr);
            }
          );
          return res.status(400).json({ success: false, message: 'Invalid code' });
        }

        console.log('[OTP] Code matched for userId', userId, 'otp id', otp.id);

        // mark used + verify phone
        db.query(
          'UPDATE tbl_phone_verifications SET is_used = 1 WHERE id = ?',
          [otp.id],
          (e1) => {
            if (e1) {
              console.error('[OTP] mark OTP used error:', e1);
              // still try to mark phone verified
            }
            db.query(
              'UPDATE tbl_user_info SET phone_verified = 1 WHERE user_id = ?',
              [userId],
              (e2) => {
                if (e2) {
                  console.error('[OTP] Could not mark phone_verified:', e2);
                  return res.status(500).json({
                    success: false,
                    message: 'Could not mark verified',
                  });
                }
                console.log('[OTP] Phone verified for userId', userId);
                return res.json({ success: true, verified: true });
              }
            );
          }
        );
      }
    );
  } catch (e) {
    console.error('[OTP] verifyOtp server error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
