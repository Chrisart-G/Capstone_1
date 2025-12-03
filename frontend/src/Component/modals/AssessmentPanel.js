import React, { useMemo, useState } from "react";
import clsx from "clsx";
import axios from "axios";

const API_BASE_URL = "http://localhost:8081";

const ROWS = [
  { code: "gross_sales_tax",               label: "Gross Sales Tax" },
  { code: "delivery_vans_trucks_tax",      label: "Tax on Delivery Vans/Trucks" },
  { code: "combustible_storage_tax",       label: "Tax on Storage for Combustible/Flammable or Explosive Substances" },
  { code: "signboard_billboards_tax",      label: "Tax on Signboard/Billboards" },
  { code: "mayors_permit_fee",             label: "Mayor’s Permit Fee" },
  { code: "garbage_charges",               label: "Garbage Charges" },
  { code: "trucks_vans_permit_fee",        label: "Delivery Trucks/Vans Permit Fee" },
  { code: "sanitary_inspection_fee",       label: "Sanitary Inspection Fee" },
  { code: "building_inspection_fee",       label: "Building Inspection Fee" },
  { code: "electrical_inspection_fee",     label: "Electrical Inspection Fee" },
  { code: "mechanical_inspection_fee",     label: "Mechanical Inspection Fee" },
  { code: "plumbing_inspection_fee",       label: "Plumbing Inspection Fee" },
  { code: "signboard_renewal_fee",         label: "Signboard/Billboard Renewal Fee" },
  { code: "combustible_sale_storage_fee",  label: "Storage & Sale of Combustible/Flammable or Explosive Substance" },
  { code: "others_fee",                    label: "Others" },
];

function sanitizeNum(v){ return v.replace(/[^\d.]/g, ""); }

export default function AssessmentPanel({
  applicationId,
  checks,
  onGenerated
}) {
  const [items, setItems] = useState(() =>
    Object.fromEntries(ROWS.map(r => [r.code, { amount: "", penalty: "" }]))
  );
  const [busy, setBusy] = useState(false);

  const computed = useMemo(() => {
    let lgu = 0;
    const rows = {};
    for (const r of ROWS) {
      const amt = Number(items[r.code]?.amount || 0);
      const pen = Number(items[r.code]?.penalty || 0);
      const tot = +(amt + pen).toFixed(2);
      rows[r.code] = { amount: amt, penalty: pen, total: tot };
      lgu += tot;
    }
    const fsif15 = +(lgu * 0.15).toFixed(2);
    return { rows, totalFeesLgu: +lgu.toFixed(2), fsif15 };
  }, [items]);

  const setCell = (code, field, val) =>
    setItems(prev => ({ ...prev, [code]: { ...prev[code], [field]: sanitizeNum(val) } }));

  const handleSaveAssessment = async () => {
    await axios.post(
      `${API_BASE_URL}/api/business-permit/assessment/save`,
      { application_id: applicationId, items: computed.rows },
      { withCredentials: true }
    );
  };

  const handleGenerate = async () => {
    try {
      setBusy(true);
      // persist assessment first so DB is in sync
      await handleSaveAssessment();
      // then generate full PDF with assessment included
      const { data } = await axios.post(
        `${API_BASE_URL}/api/business-permit/generate-form-with-assessment`,
        {
          application_type: "business",
          application_id: applicationId,
          checks,
          assessment: computed.rows
        },
        { withCredentials: true }
      );
      onGenerated?.(data);
      alert("LGU form (with assessment) generated.");
    } catch (e) {
      console.error(e);
      alert("Failed to generate LGU form with assessment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border rounded-md p-4 mt-5">
      <h5 className="text-sm font-semibold text-gray-700 mb-3">
        Assessment of Applicable Fees
      </h5>

      <div className="grid grid-cols-[1fr_140px_160px_160px] gap-2 text-sm">
        <div className="text-gray-500">Description</div>
        <div className="text-gray-500">Amount</div>
        <div className="text-gray-500">Penalty/Surcharge</div>
        <div className="text-gray-500">Total</div>

        {ROWS.map((r) => (
          <React.Fragment key={r.code}>
            <div className="py-1">{r.label}</div>
            <input
              inputMode="decimal"
              className="border rounded px-2 py-1"
              value={items[r.code].amount}
              onChange={(e) => setCell(r.code, "amount", e.target.value)}
              placeholder="0.00"
            />
            <input
              inputMode="decimal"
              className="border rounded px-2 py-1"
              value={items[r.code].penalty}
              onChange={(e) => setCell(r.code, "penalty", e.target.value)}
              placeholder="0.00"
            />
            <div className="py-1 font-medium">
              {computed.rows[r.code].total
                ? computed.rows[r.code].total.toLocaleString(undefined, { minimumFractionDigits: 2 })
                : "—"}
            </div>
          </React.Fragment>
        ))}

        {/* Totals */}
        <div className="py-2 font-semibold text-right col-span-3">TOTAL FEES for LGU</div>
        <div className="py-2 font-semibold">
          {computed.totalFeesLgu.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <div className="py-2 font-semibold text-right col-span-3">FIRE SAFETY INSPECTION FEE (15%)</div>
        <div className="py-2 font-semibold">
          {computed.fsif15.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={handleSaveAssessment}
          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Save Assessment
        </button>
        <button
          disabled={busy}
          onClick={handleGenerate}
          className={clsx(
            "px-4 py-2 rounded text-white",
            busy ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {busy ? "Generating…" : "Generate LGU Form (with Assessment)"}
        </button>
      </div>
    </div>
  );
}
