// Controller/renewalController.js
const db = require('../db/dbconnect');

/* ---------------- Small DB helper (same style as buspermitController) ---------------- */
function q(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );
}

/**
 * INTERNAL helper: fetch all business permits for a user, newest first.
 */
async function fetchBusinessPermitsForUser(userId) {
  const rows = await q(
    `
    SELECT
      BusinessP_id      AS id,
      business_name,
      trade_name,
      business_address,
      application_date   AS valid_until,
      status
    FROM business_permits
    WHERE user_id = ?
    ORDER BY application_date DESC, BusinessP_id DESC
    `,
    [userId]
  );
  return rows;
}

/**
 * GET /api/renewal-business-permit/list/:user_id
 *
 * Returns ALL business permits for that user (used in the payment modal
 * so the user can choose which business to renew).
 */
exports.getBusinessPermitsForUser = async (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.',
    });
  }

  console.log('[Renewal] getBusinessPermitsForUser →', { userId });

  try {
    const rows = await fetchBusinessPermitsForUser(userId);

    if (!rows.length) {
      return res.json({
        success: false,
        message: 'No business permits found for this user.',
        data: [],
      });
    }

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('getBusinessPermitsForUser error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load business permits.',
      error: err.message,
    });
  }
};

/**
 * GET /api/renewal-business-permit/current/:user_id
 *
 * Kept for compatibility – returns ONLY the latest business permit.
 * (Now built on top of fetchBusinessPermitsForUser.)
 */
exports.getCurrentBusinessPermitForUser = async (req, res) => {
  const userId = req.params.user_id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.',
    });
  }

  console.log('[Renewal] getCurrentBusinessPermitForUser →', { userId });

  try {
    const rows = await fetchBusinessPermitsForUser(userId);

    if (!rows.length) {
      return res.json({
        success: false,
        message: 'No business permit found for this user.',
      });
    }

    return res.json({
      success: true,
      data: rows[0], // latest
    });
  } catch (err) {
    console.error('getCurrentBusinessPermitForUser error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load current business permit.',
      error: err.message,
    });
  }
};

/**
 * GET /api/renewal-business-permit/prefill
 *
 * Used by RenewalBusinessPermitForm to auto-fill the fields.
 * Uses the logged-in user from the session and returns keys that
 * match your React formData.
 */
exports.getRenewalPrefill = async (req, res) => {
  if (!req.session?.user || !req.session.user.user_id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please log in.',
    });
  }

  const userId = req.session.user.user_id;
  console.log('[Renewal] getRenewalPrefill → userId:', userId);

  try {
    const rows = await q(
      `
      SELECT
        -- NAME OF TAXPAYER / REGISTRANT
        last_name               AS lastName,
        first_name              AS firstName,
        middle_name             AS middleName,

        -- BUSINESS
        business_name           AS businessName,
        trade_name              AS tradeName,
        business_address        AS businessAddress,
        business_postal_code    AS businessPostalCode,
        business_email          AS businessEmail,
        business_telephone      AS businessTelephone,
        business_mobile         AS businessMobile,

        -- OWNER
        owner_address           AS ownerAddress,
        owner_postal_code       AS ownerPostalCode,
        owner_email             AS ownerEmail,
        owner_telephone         AS ownerTelephone,
        owner_mobile            AS ownerMobile,

        -- EMERGENCY CONTACT
        emergency_contact       AS emergencyContact,
        emergency_phone         AS emergencyPhone,
        emergency_email         AS emergencyEmail,

        -- AREA + EMPLOYEES
        business_area           AS businessArea,
        male_employees          AS maleEmployees,
        female_employees        AS femaleEmployees,
        local_employees         AS localEmployees,

        -- LESSOR
        lessor_name             AS lessorName,
        lessor_address          AS lessorAddress,
        lessor_phone            AS lessorPhone,
        lessor_email            AS lessorEmail,
        monthly_rental          AS monthlyRental,

        -- REGISTRATION / TAX
        tin_no                  AS tinNo,
        registration_no         AS registrationNo,
        registration_date       AS registrationDate,
        business_type           AS businessType,
        tax_incentive           AS taxIncentive,
        tax_incentive_entity    AS taxIncentiveEntity

      FROM business_permits
      WHERE user_id = ?
      ORDER BY application_date DESC, BusinessP_id DESC
      LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) {
      return res.json({
        success: false,
        message: 'No existing business permit found for this user.',
      });
    }

    const prefill = rows[0];

    return res.json({
      success: true,
      data: prefill,
    });
  } catch (err) {
    console.error('getRenewalPrefill error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load renewal prefill data.',
      error: err.message,
    });
  }
};
