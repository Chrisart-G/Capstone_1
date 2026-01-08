// Frontend/src/modals/userupdatemodal.js
import React, { useEffect, useMemo, useState } from "react";
import { X, RefreshCcw, Save } from "lucide-react";

const API_BASE_URL = "http://localhost:8081";

const FIELD_SETS = {
  business: [
    { key: "application_type", label: "Application Type" },
    { key: "payment_mode", label: "Payment Mode" },
    { key: "tin_no", label: "TIN No." },
    { key: "registration_no", label: "Registration No." },
    { key: "registration_date", label: "Registration Date" },

    { key: "business_name", label: "Business Name" },
    { key: "trade_name", label: "Trade Name" },
    { key: "business_address", label: "Business Address" },
    { key: "business_postal_code", label: "Business Postal Code" },
    { key: "business_email", label: "Business Email" },
    { key: "business_telephone", label: "Business Telephone" },
    { key: "business_mobile", label: "Business Mobile" },

    { key: "owner_name", label: "Owner Name" },
    { key: "owner_address", label: "Owner Address" },
    { key: "owner_postal_code", label: "Owner Postal Code" },
    { key: "owner_email", label: "Owner Email" },
    { key: "owner_telephone", label: "Owner Telephone" },
    { key: "owner_mobile", label: "Owner Mobile" },

    { key: "emergency_contact", label: "Emergency Contact" },
    { key: "emergency_phone", label: "Emergency Phone" },
    { key: "emergency_email", label: "Emergency Email" },

    { key: "business_area", label: "Business Area" },
    { key: "lessor_name", label: "Lessor Name" },
    { key: "lessor_address", label: "Lessor Address" },
    { key: "lessor_telephone", label: "Lessor Telephone" },
    { key: "monthly_rental", label: "Monthly Rental" },

    { key: "bus_tax_incentives", label: "Tax Incentives" },
    { key: "business_type", label: "Business Type" },
  ],

  electrical: [
    { key: "last_name", label: "Last Name" },
    { key: "first_name", label: "First Name" },
    { key: "middle_initial", label: "Middle Initial" },
    { key: "tin", label: "TIN" },
    { key: "telephone_no", label: "Telephone No." },

    { key: "address_no", label: "Address No." },
    { key: "address_street", label: "Street" },
    { key: "address_barangay", label: "Barangay" },
    { key: "address_city", label: "City" },
    { key: "address_zip_code", label: "Zip Code" },

    { key: "location_lot_no", label: "Lot No." },
    { key: "location_blk_no", label: "Block No." },
    { key: "location_tct_no", label: "TCT No." },
    { key: "location_tax_dec_no", label: "Tax Dec No." },
    { key: "location_street", label: "Location Street" },
    { key: "location_barangay", label: "Location Barangay" },
    { key: "location_city", label: "Location City" },

    { key: "construction_owned", label: "Construction Owned" },
    { key: "form_of_ownership", label: "Form of Ownership" },
    { key: "use_or_character", label: "Use/Character of Occupancy" },
    { key: "scope_of_work", label: "Scope of Work" },
    { key: "other_scope_specify", label: "Other Scope (Specify)" },
  ],

  electronics: [
    { key: "last_name", label: "Last Name" },
    { key: "first_name", label: "First Name" },
    { key: "middle_initial", label: "Middle Initial" },
    { key: "tin", label: "TIN" },
    { key: "telephone_no", label: "Telephone No." },

    { key: "address_no", label: "Address No." },
    { key: "address_street", label: "Street" },
    { key: "address_barangay", label: "Barangay" },
    { key: "address_city", label: "City" },
    { key: "address_zip_code", label: "Zip Code" },

    { key: "location_lot_no", label: "Lot No." },
    { key: "location_blk_no", label: "Block No." },
    { key: "location_tct_no", label: "TCT No." },
    { key: "location_tax_dec_no", label: "Tax Dec No." },
    { key: "location_street", label: "Location Street" },
    { key: "location_barangay", label: "Location Barangay" },
    { key: "location_city", label: "Location City" },

    { key: "construction_owned", label: "Construction Owned" },
    { key: "form_of_ownership", label: "Form of Ownership" },
    { key: "use_or_character", label: "Use/Character of Occupancy" },
    { key: "scope_of_work", label: "Scope of Work" },
    { key: "other_scope_specify", label: "Other Scope (Specify)" },
  ],

  plumbing: [
    { key: "last_name", label: "Last Name" },
    { key: "first_name", label: "First Name" },
    { key: "middle_initial", label: "Middle Initial" },
    { key: "tin", label: "TIN" },
    { key: "telephone_no", label: "Telephone No." },

    { key: "address_no", label: "Address No." },
    { key: "street", label: "Street" },
    { key: "barangay", label: "Barangay" },
    { key: "city", label: "City" },
    { key: "zip_code", label: "Zip Code" },

    { key: "location_lot_no", label: "Lot No." },
    { key: "location_blk_no", label: "Block No." },
    { key: "location_tct_no", label: "TCT No." },
    { key: "location_tax_dec_no", label: "Tax Dec No." },
    { key: "location_street", label: "Location Street" },
    { key: "location_barangay", label: "Location Barangay" },
    { key: "location_city", label: "Location City" },

    { key: "construction_owned", label: "Construction Owned" },
    { key: "ownership_form", label: "Ownership Form" },
    { key: "use_or_character", label: "Use/Character of Occupancy" },
    { key: "scope_of_work", label: "Scope of Work" },
    { key: "other_scope_specify", label: "Other Scope (Specify)" },
  ],

  building: [
    { key: "last_name", label: "Last Name" },
    { key: "first_name", label: "First Name" },
    { key: "middle_initial", label: "Middle Initial" },
    { key: "tin", label: "TIN" },
    { key: "telephone_no", label: "Telephone No." },

    { key: "address_no", label: "Address No." },
    { key: "address_street", label: "Street" },
    { key: "address_barangay", label: "Barangay" },
    { key: "address_city", label: "City" },
    { key: "address_zip_code", label: "Zip Code" },

    { key: "location_lot_no", label: "Lot No." },
    { key: "location_blk_no", label: "Block No." },
    { key: "location_tct_no", label: "TCT No." },
    { key: "location_tax_dec_no", label: "Tax Dec No." },
    { key: "location_street", label: "Location Street" },
    { key: "location_barangay", label: "Location Barangay" },
    { key: "location_city", label: "Location City" },

    { key: "permit_type", label: "Permit Type" },
    { key: "occupancy_type", label: "Occupancy Type" },
    { key: "construction_owned", label: "Construction Owned" },
    { key: "form_of_ownership", label: "Form of Ownership" },
    { key: "use_or_character", label: "Use/Character of Occupancy" },
    { key: "scope_of_work", label: "Scope of Work" },
    { key: "other_scope_specify", label: "Other Scope (Specify)" },
  ],

  fencing: [
    { key: "last_name", label: "Last Name" },
    { key: "first_name", label: "First Name" },
    { key: "middle_initial", label: "Middle Initial" },
    { key: "tin", label: "TIN" },
    { key: "telephone_no", label: "Telephone No." },

    { key: "address_no", label: "Address No." },
    { key: "address_street", label: "Street" },
    { key: "address_barangay", label: "Barangay" },
    { key: "address_city", label: "City" },
    { key: "address_zip_code", label: "Zip Code" },

    { key: "location_lot_no", label: "Lot No." },
    { key: "location_blk_no", label: "Block No." },
    { key: "location_tct_no", label: "TCT No." },
    { key: "location_tax_dec_no", label: "Tax Dec No." },
    { key: "location_street", label: "Location Street" },
    { key: "location_barangay", label: "Location Barangay" },
    { key: "location_city", label: "Location City" },

    { key: "construction_owned", label: "Construction Owned" },
    { key: "form_of_ownership", label: "Form of Ownership" },
    { key: "use_or_character", label: "Use/Character of Occupancy" },
    { key: "scope_of_work", label: "Scope of Work" },
    { key: "other_scope_specify", label: "Other Scope (Specify)" },
  ],

  cedula: [
    { key: "name", label: "Full Name" },
    { key: "address", label: "Address" },
    { key: "place_of_birth", label: "Place of Birth" },
    { key: "date_of_birth", label: "Date of Birth" },
    { key: "profession", label: "Profession" },
    { key: "yearly_income", label: "Yearly Income" },
    { key: "purpose", label: "Purpose" },
    { key: "sex", label: "Sex" },
    { key: "status", label: "Civil Status" },
    { key: "tin", label: "TIN" },
  ],
};

function normalize(s) {
  return String(s || "").toLowerCase().trim();
}

export default function UserUpdateModal({
  open,
  applicationType,     // e.g. "fencing"
  applicationId,       // numeric id
  displayTitle,        // shown on top
  currentStatus,       // optional display
  onClose,
  onUpdated,
}) {
  const typeKey = useMemo(() => normalize(applicationType), [applicationType]);
  const fields = FIELD_SETS[typeKey] || [];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    if (!typeKey || !applicationId) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const r = await fetch(
          `${API_BASE_URL}/api/user/update/${typeKey}/${applicationId}`,
          { credentials: "include" }
        );
        const j = await r.json();

        if (!mounted) return;

        if (!j.success) {
          setError(j.message || "Failed to load application data.");
          setForm({});
          return;
        }

        setForm(j.data || {});
      } catch (e) {
        console.error(e);
        if (mounted) setError("Server error while loading application data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, typeKey, applicationId]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {};
      fields.forEach((f) => {
        if (Object.prototype.hasOwnProperty.call(form, f.key)) {
          payload[f.key] = form[f.key];
        }
      });

      const r = await fetch(
        `${API_BASE_URL}/api/user/update/${typeKey}/${applicationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const j = await r.json();
      if (!j.success) {
        setError(j.message || "Failed to update application.");
        return;
      }

      if (onUpdated) onUpdated(j.data);
    } catch (e) {
      console.error(e);
      setError("Server error while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              Update Application
            </div>
            <div className="text-sm text-gray-600 mt-0.5">
              {displayTitle || `${typeKey} #${applicationId}`}
              {currentStatus ? (
                <span className="ml-2 text-xs text-gray-500">(Status: {currentStatus})</span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-4">
          {loading ? (
            <div className="flex items-center text-sm text-gray-600">
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-3 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-100">
                  {error}
                </div>
              )}

              {fields.length === 0 ? (
                <div className="text-sm text-gray-600">
                  No editable fields configured for: <b>{typeKey}</b>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {f.label}
                      </label>
                      <input
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form[f.key] ?? ""}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        placeholder={f.label}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t flex justify-end gap-2 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border bg-white hover:bg-gray-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || fields.length === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium inline-flex items-center ${
              saving || loading || fields.length === 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saving ? (
              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
