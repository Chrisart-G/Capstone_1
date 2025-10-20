// controllers/usernavController.js
const db = require('../db/dbconnect');

/* ------------ tiny query helper (callbacks, like your other controllers) ------------ */
function q(sql, params, cb) {
  db.query(sql, params, (err, rows) => (err ? cb(err) : cb(null, rows)));
}

/* ------------------ ensure we have a table to memo "last seen" times ---------------- */
function ensureSeenTable(cb) {
  const sql = `
    CREATE TABLE IF NOT EXISTS tbl_user_nav_seen (
      user_id INT NOT NULL PRIMARY KEY,
      last_seen_request_doc_at DATETIME NULL,
      last_seen_track_status_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  q(sql, [], cb);
}

function upsertSeen(userId, fields, cb) {
  const cols = Object.keys(fields);
  const vals = Object.values(fields);
  const sets = cols.map(c => `${c} = VALUES(${c})`).join(', ');
  const sql = `
    INSERT INTO tbl_user_nav_seen (user_id, ${cols.join(', ')})
    VALUES (?, ${cols.map(() => '?').join(', ')})
    ON DUPLICATE KEY UPDATE ${sets};
  `;
  q(sql, [userId, ...vals], cb);
}

/* ------------------------------------ GET badges ----------------------------------- */
/**
 * GET /api/user/nav/badges
 * Returns { badges: { requestDocument, trackStatus } }
 * - requestDocument: approved payments with granted-but-unused form access since last seen
 * - trackStatus: any non-pending app updates OR approved payments since last seen
 */
exports.getUserNavBadges = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    const userId = req.session.user.user_id;

    ensureSeenTable((err) => {
      if (err) {
        console.error('ensureSeenTable error:', err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
      }

      // fetch last seen
      q(
        `SELECT last_seen_request_doc_at, last_seen_track_status_at
           FROM tbl_user_nav_seen WHERE user_id = ?`,
        [userId],
        (err2, seenRows) => {
          if (err2) {
            console.error('seen fetch error:', err2);
            return res.status(500).json({ success: false, message: 'Server error', error: err2.message });
          }

          const lastSeenReq = seenRows[0]?.last_seen_request_doc_at || null;
          const lastSeenTrack = seenRows[0]?.last_seen_track_status_at || null;

          // ONE query with placeholders everywhere — no literals embedded
          const sql = `
            SELECT
              /* Request Document: latest approved payment awaiting form use + count */
              (SELECT MAX(updated_at)
                 FROM tbl_payment_receipts
                WHERE user_id = ?
                  AND payment_status = 'approved'
                  AND form_access_granted = 1
                  AND form_access_used = 0) AS latestRequestDoc,

              (SELECT COUNT(*)
                 FROM tbl_payment_receipts
                WHERE user_id = ?
                  AND payment_status = 'approved'
                  AND form_access_granted = 1
                  AND form_access_used = 0) AS countRequestDoc,

              /* Track Status: latest across all your apps (non-pending) + approved payments */
              GREATEST(
                IFNULL((SELECT MAX(updated_at) FROM business_permits
                         WHERE user_id = ? AND status <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(GREATEST(IFNULL(status_updated_at,'1970-01-01'), IFNULL(updated_at,'1970-01-01')))
                         FROM tbl_building_permits
                        WHERE user_id = ? AND status <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(updated_at) FROM tbl_electrical_permits
                         WHERE user_id = ? AND IFNULL(status,'') <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(updated_at) FROM tbl_plumbing_permits
                         WHERE user_id = ? AND status <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(updated_at) FROM tbl_fencing_permits
                         WHERE user_id = ? AND status <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(updated_at) FROM tbl_electronics_permits
                         WHERE user_id = ? AND status <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(updated_at) FROM tbl_cedula
                         WHERE user_id = ? AND application_status <> 'pending'), '1970-01-01'),
                IFNULL((SELECT MAX(updated_at) FROM tbl_payment_receipts
                         WHERE user_id = ? AND payment_status = 'approved'), '1970-01-01')
              ) AS latestTrackStatus,

              /* How many "updated" items since last seen for Track Status */
              (
                (SELECT COUNT(*) FROM business_permits
                   WHERE user_id = ? AND status <> 'pending' AND ( ? IS NULL OR updated_at > ? )) +
                (SELECT COUNT(*) FROM tbl_building_permits
                   WHERE user_id = ? AND status <> 'pending'
                     AND ( ? IS NULL OR GREATEST(IFNULL(status_updated_at,'1970-01-01'), IFNULL(updated_at,'1970-01-01')) > ? )) +
                (SELECT COUNT(*) FROM tbl_electrical_permits
                   WHERE user_id = ? AND IFNULL(status,'') <> 'pending' AND ( ? IS NULL OR updated_at > ? )) +
                (SELECT COUNT(*) FROM tbl_plumbing_permits
                   WHERE user_id = ? AND status <> 'pending' AND ( ? IS NULL OR updated_at > ? )) +
                (SELECT COUNT(*) FROM tbl_fencing_permits
                   WHERE user_id = ? AND status <> 'pending' AND ( ? IS NULL OR updated_at > ? )) +
                (SELECT COUNT(*) FROM tbl_electronics_permits
                   WHERE user_id = ? AND status <> 'pending' AND ( ? IS NULL OR updated_at > ? )) +
                (SELECT COUNT(*) FROM tbl_cedula
                   WHERE user_id = ? AND application_status <> 'pending' AND ( ? IS NULL OR updated_at > ? )) +
                (SELECT COUNT(*) FROM tbl_payment_receipts
                   WHERE user_id = ? AND payment_status = 'approved' AND ( ? IS NULL OR updated_at > ? ))
              ) AS countTrackStatus
          `;

          const lastSeenTrackParam = lastSeenTrack ? new Date(lastSeenTrack) : null;

          const params = [
            // latest request doc + count
            userId, userId,

            // latestTrackStatus (8 user_id placeholders)
            userId, userId, userId, userId, userId, userId, userId, userId,

            // countTrackStatus (8 blocks × (user_id + lastSeen + lastSeen))
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
            userId, lastSeenTrackParam, lastSeenTrackParam,
          ];

          q(sql, params, (err3, rows) => {
            if (err3) {
              console.error('latest activity fetch error:', err3);
              return res.status(500).json({ success: false, message: 'Server error', error: err3.message });
            }

            const r = rows[0] || {};
            const latestRequestDoc = r.latestRequestDoc ? new Date(r.latestRequestDoc) : null;
            const latestTrackStatus = r.latestTrackStatus ? new Date(r.latestTrackStatus) : null;

            const showReq =
              latestRequestDoc && (!lastSeenReq || new Date(lastSeenReq) < latestRequestDoc);
            const showTrack =
              latestTrackStatus && (!lastSeenTrack || new Date(lastSeenTrack) < latestTrackStatus);

            return res.status(200).json({
              success: true,
              badges: {
                requestDocument: showReq ? Number(r.countRequestDoc) || 1 : 0,
                trackStatus: showTrack ? Number(r.countTrackStatus) || 1 : 0,
              },
            });
          });
        }
      );
    });
  } catch (error) {
    console.error('Unexpected error in getUserNavBadges:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/* ------------------------------- mark-as-seen APIs ------------------------------- */
exports.markRequestDocViewed = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    const userId = req.session.user.user_id;
    ensureSeenTable((err) => {
      if (err) {
        console.error('ensureSeenTable error:', err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
      }
      upsertSeen(userId, { last_seen_request_doc_at: new Date() }, (err2) => {
        if (err2) {
          console.error('upsertSeen request-doc error:', err2);
          return res.status(500).json({ success: false, message: 'Server error', error: err2.message });
        }
        return res.status(200).json({ success: true });
      });
    });
  } catch (error) {
    console.error('markRequestDocViewed error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.markTrackStatusViewed = (req, res) => {
  try {
    if (!req.session?.user?.user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    const userId = req.session.user.user_id;
    ensureSeenTable((err) => {
      if (err) {
        console.error('ensureSeenTable error:', err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
      }
      upsertSeen(userId, { last_seen_track_status_at: new Date() }, (err2) => {
        if (err2) {
          console.error('upsertSeen track-status error:', err2);
          return res.status(500).json({ success: false, message: 'Server error', error: err2.message });
        }
        return res.status(200).json({ success: true });
      });
    });
  } catch (error) {
    console.error('markTrackStatusViewed error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
