import React, { useEffect, useState } from "react";

/* Lightweight modal used in your other forms */
function InlineModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 md:inset-x-0 md:top-6 md:mb-6 bg-white md:rounded-xl shadow-xl overflow-hidden w-full md:max-w-6xl mx-auto flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Close</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Component ─────────────────────────── */
export default function BusinessinlineForms({
  applicationId,
  templateUrl,               // <- requirement template URL from the requirements list
  open = true,
  onClose,
  onSubmitted
}) {

  const API =
    (import.meta?.env && import.meta.env.VITE_API_URL) ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8081";
  const API_BASE = `${API.replace(/\/+$/, "")}/api`;

  // Normalize any relative URL (e.g., "/uploads/...") to an absolute one using API base
  const toAbs = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    return `${API.replace(/\/+$/, "")}${u.startsWith("/") ? "" : "/"}${u}`;
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pane, setPane] = useState("preview");
  const [adminTemplateUrl, setAdminTemplateUrl] = useState(null);
  const [userFilledUrl, setUserFilledUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 6 sections
  const emptySec = { action: "", deficiencies: {}, remarks: "" };
  const [zoning, setZoning] = useState(emptySec);
  const [fitness, setFitness] = useState(emptySec);
  const [environment, setEnvironment] = useState(emptySec);
  const [sanitation, setSanitation] = useState(emptySec);
  const [market, setMarket] = useState(emptySec);
  const [agriculture, setAgriculture] = useState(emptySec);

  // Seed preview from the requirement’s template when the modal opens
  useEffect(() => {
    if (templateUrl) {
      const abs = toAbs(templateUrl);
      setAdminTemplateUrl(abs);
      setPreviewUrl((prev) => prev || abs);
    }
  }, [templateUrl]); // run whenever a new requirement is opened

  // Load any saved draft and URLs produced by the server
  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const q = new URLSearchParams({ application_id: String(applicationId) });
        const r = await fetch(`${API_BASE}/user/business/form?${q}`, { credentials: "include" });
        const j = await r.json();
        if (!j?.success) throw new Error(j?.message || "Failed to load form");
        if (gone) return;

        if (j.draft) {
          setZoning({ ...emptySec, ...j.draft.zoning });
          setFitness({ ...emptySec, ...j.draft.fitness });
          setEnvironment({ ...emptySec, ...j.draft.environment });
          setSanitation({ ...emptySec, ...j.draft.sanitation });
          setMarket({ ...emptySec, ...j.draft.market });
          setAgriculture({ ...emptySec, ...j.draft.agriculture });
        }

        const adminURL = toAbs(j.admin_template_url) || adminTemplateUrl;
        const userURL  = toAbs(j.user_filled_url);

        setAdminTemplateUrl(adminURL || null);
        setUserFilledUrl(userURL || null);

        // Prefer user's last filled, then admin template, then prop-based template
        setPreviewUrl(userURL || adminURL || toAbs(templateUrl) || null);
      } catch (e) {
        console.error(e);
        alert(e.message || "Server error.");
      } finally {
        if (!gone) setLoading(false);
      }
    })();
    return () => { gone = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, applicationId]);

  const sections = [
    { key: "zoning",      title: "1. Zoning Ordinance",          state: zoning,      set: setZoning },
    { key: "fitness",     title: "2. Fitness for Occupancy",     state: fitness,     set: setFitness },
    { key: "environment", title: "3. Solid Waste / Environment", state: environment, set: setEnvironment },
    { key: "sanitation",  title: "4. Sanitation Code",           state: sanitation,  set: setSanitation },
    { key: "market",      title: "5. Public Market",             state: market,      set: setMarket },
    { key: "agriculture", title: "6. Agriculture Office",        state: agriculture, set: setAgriculture },
  ];

  function setAction(updater, value) { updater(s => ({ ...s, action: value })); }
  function setDef(updater, idx, val) { updater(s => ({ ...s, deficiencies: { ...(s.deficiencies || {}), [idx]: val } })); }
  function setRemarks(updater, val)  { updater(s => ({ ...s, remarks: val })); }

  const buildPayload = () => ({
    zoning, fitness, environment, sanitation, market, agriculture
  });

  async function saveDraft() {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/user/business/form/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, data: buildPayload() }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to save draft.");
      alert("Draft saved.");
    } catch (e) {
      alert(e.message || "Server error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function previewNow() {
    try {
      const r = await fetch(`${API_BASE}/user/business/form/preview`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, data: buildPayload() }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to build preview.");
      const abs = toAbs(j.preview_url);
      setPreviewUrl(abs);
      if (window.innerWidth < 768) setPane("preview");
    } catch (e) {
      alert(e.message || "Server error while generating preview.");
    }
  }

  async function submitNow() {
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE}/user/business/form/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, data: buildPayload() }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to submit.");
      if (j.user_filled_url) {
        const abs = toAbs(j.user_filled_url);
        setUserFilledUrl(abs);
        setPreviewUrl(abs);
      }
      alert("Submitted. Your filled sheet is attached to the application.");
      onSubmitted?.();
      if (window.innerWidth < 768) setPane("preview");
    } catch (e) {
      alert(e.message || "Server error while submitting.");
    } finally {
      setSubmitting(false);
    }
  }

  const ActionRadios = ({ value, onChange }) => (
    <div className="flex flex-wrap gap-4 text-sm">
      <label className="inline-flex items-center gap-2">
        <input type="radio" checked={value === "approved"} onChange={() => onChange("approved")} />
        Approved
      </label>
      <label className="inline-flex items-center gap-2">
        <input type="radio" checked={value === "approved_with_conditions"} onChange={() => onChange("approved_with_conditions")} />
        Approved with Conditions
      </label>
      <label className="inline-flex items-center gap-2">
        <input type="radio" checked={value === "denied"} onChange={() => onChange("denied")} />
        Denied
      </label>
    </div>
  );

  const DefInputs = ({ sec, setSec }) => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
      {[1,2,3,4,5].map(i => (
        <input key={i} className="border rounded px-2 py-1 text-sm" placeholder={`${i}`}
          value={sec.deficiencies?.[String(i)] || ""} onChange={e => setDef(setSec, String(i), e.target.value)} />
      ))}
    </div>
  );

  if (!open) return null;

  return (
    <InlineModal open title="Business Permit – LGU Verification Sheet" onClose={onClose}>
      {loading ? (
        <div className="p-6 text-gray-600">Loading…</div>
      ) : (
        <>
          {/* Mobile tabs */}
          <div className="md:hidden px-3 pt-2">
            <div className="flex gap-2">
              <button onClick={() => setPane("preview")}
                className={`flex-1 px-3 py-2 rounded-md border text-sm ${pane === "preview" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"}`}>
                Preview
              </button>
              <button onClick={() => setPane("form")}
                className={`flex-1 px-3 py-2 rounded-md border text-sm ${pane === "form" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"}`}>
                Form
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 px-3 md:px-4 pb-4">
            {/* LEFT: Preview */}
            <div className={`${pane === "form" ? "hidden md:block" : ""}`}>
              <div className="text-sm font-medium text-gray-800">Preview</div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50"
                  onClick={() => adminTemplateUrl && setPreviewUrl(adminTemplateUrl)}
                  disabled={!adminTemplateUrl}
                >
                  Use Admin Template
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50"
                  onClick={() => userFilledUrl && setPreviewUrl(userFilledUrl)}
                  disabled={!userFilledUrl}
                >
                  View Last Submitted
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50"
                  onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                  disabled={!previewUrl}
                >
                  Open in new tab
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {previewUrl ? (
                  <iframe title="preview" src={previewUrl} className="w-full h-[55svh] md:h-[70vh]" />
                ) : (
                  <div className="p-6 text-sm text-gray-500">
                    No preview available. Try “Use Admin Template” or “Build Preview”.
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Click “Build Preview” to see your selections and remarks stamped on page 3–4.
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className={`${pane === "preview" ? "hidden md:block" : ""} max-h-full`}>
              <div className="space-y-6 md:max-h-[75vh] md:overflow-y-auto pr-1">
                {sections.map((sec) => (
                  <section key={sec.key} className="space-y-3">
                    <h4 className="font-semibold text-gray-800">{sec.title}</h4>
                    <ActionRadios value={sec.state.action} onChange={val => setAction(sec.set, val)} />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Conditions / Documentary Deficiency (1–5)</div>
                      <DefInputs sec={sec.state} setSec={sec.set} />
                    </div>
                    <label className="text-sm block">
                      <span className="block text-gray-600">Remarks</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={sec.state.remarks}
                        onChange={e => setRemarks(sec.set, e.target.value)}
                      />
                    </label>
                    <hr className="mt-2" />
                  </section>
                ))}
              </div>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-3 pt-2">
                <button type="button" onClick={saveDraft} disabled={saving}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50">
                  {saving ? "Saving…" : "Save Draft"}
                </button>
                <button type="button" onClick={previewNow}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50">
                  Build Preview
                </button>
                <button type="button" onClick={submitNow} disabled={submitting}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>

              {/* Mobile sticky actions */}
              <div className="md:hidden sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-t mt-4 py-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button type="button" onClick={saveDraft} disabled={saving}
                    className="w-full px-4 py-2 rounded-md border bg-white hover:bg-gray-50">
                    {saving ? "Saving…" : "Save Draft"}
                  </button>
                  <button type="button" onClick={previewNow}
                    className="w-full px-4 py-2 rounded-md border bg-white hover:bg-gray-50">
                    Build Preview
                  </button>
                  <button type="button" onClick={submitNow} disabled={submitting}
                    className="w-full px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </InlineModal>
  );
}
