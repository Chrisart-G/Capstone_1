// services/smsNotifier.js
// Thin wrapper around controllers/smsController.notifyOnStatusChange
// so you can call one function from any controller after a status update.

const { notifyOnStatusChange } = require('../Controller/smsController');

/**
 * Send an SMS for an application status change.
 * Pass either user_id OR (application_type + application_id).
 *
 * @param {Object} opts
 * @param {string} [opts.application_type]  // 'business'|'electrical'|'plumbing'|'electronics'|'building'|'fencing'|'cedula'
 * @param {number} [opts.application_id]
 * @param {number} [opts.user_id]
 * @param {string} [opts.office_name]       // e.g., 'Office of the Building Official'
 * @param {string} [opts.application_no]    // optional reference number
 * @param {string} opts.new_status          // 'in-review'|'in-progress'|'requirements-completed'|'approved'|'ready-for-pickup'|'rejected'
 * @param {string} [opts.extra_note]        // short, GSM-safe text
 * @returns {Promise<{success:boolean, skipped?:boolean, reason?:string, phone?:string, provider?:any}>}
 */
module.exports = async function sendStatusSMS(opts) {
  // You can add project-wide defaults here if needed.
  return notifyOnStatusChange(opts);
};
