// components/User/ElectricalInlineForm.jsx
import React, { useEffect, useRef, useState } from "react";

/* ───────────────── UI helpers ───────────────── */

function InlineModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="
          absolute inset-0 md:inset-x-0 md:top-6 md:mb-6
          bg-white md:rounded-xl shadow-xl overflow-hidden
          w-full md:max-w-6xl mx-auto
          flex flex-col
        "
      >
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, onCancel, onConfirm, confirmText = "Confirm" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-x-0 mx-auto top-24 w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h4 className="font-semibold text-gray-800">{title}</h4>
        </div>
        <div className="p-4 text-gray-700 text-sm whitespace-pre-wrap">{message}</div>
        <div className="px-4 pb-4 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Signature widgets ───────────────── */

function SigPad({ label, height = 120, onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const getPos = (e, c) => {
    const r = c.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const start = (e) => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    drawing.current = true;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    const p = getPos(e, c);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const p = getPos(e, c);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => {
    drawing.current = false;
    emit();
  };
  const clear = () => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    emit();
  };
  const emit = () => {
    const c = canvasRef.current;
    onChange?.(c.toDataURL("image/png"));
  };

  const mobileHeight =
    typeof window !== "undefined" && window.innerWidth < 768 ? Math.min(100, height) : height;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <div className="border rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={mobileHeight}
          className="w-full block bg-white"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50"
      >
        Clear signature
      </button>
    </div>
  );
}

function SignatureField({ title, value, onChange, allowUpload = true }) {
  const fileRef = useRef(null);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <SigPad label={title} onChange={onChange} />
      {allowUpload && (
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50"
          >
            Or upload signature image
          </button>
        </div>
      )}
      {value && (
        <div className="mt-1">
          <img
            src={value}
            alt="signature preview"
            className="h-16 max-w-full border rounded bg-white"
          />
        </div>
      )}
    </div>
  );
}

/* ───────────────── Main component ───────────────── */

export default function ElectricalInlineForm({
  applicationId,
  onClose,
  onSubmitted,
}) {
  const API = "http://localhost:8081/api";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [adminTemplateUrl, setAdminTemplateUrl] = useState(null);
  const [userFilledUrl, setUserFilledUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // mobile pane: 'preview' | 'form'
  const [pane, setPane] = useState("preview");

  const [box2, setBox2] = useState({
    engineer_name: "",
    date: "",
    address: "",
    prc_no: "",
    validity: "",
    ptr_no: "",
    date_issued: "",
    issued_at: "",
    tin: "",
    signature_data_url: "",
  });

  const [box3, setBox3] = useState({
    role: "pe",
    signed_name: "",
    date: "",
    prc_no: "",
    validity: "",
    ptr_no: "",
    date_issued: "",
    issued_at: "",
    tin: "",
    address: "",
  });

  const [box4, setBox4] = useState({
    owner_name: "",
    date: "",
    address: "",
    signature_data_url: "",
  });

  const [box5, setBox5] = useState({
    lot_owner_name: "",
    date: "",
    address: "",
    signature_data_url: "",
  });

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const q = new URLSearchParams({ application_id: String(applicationId) });
        const r = await fetch(`${API}/user/electrical/form?${q.toString()}`, {
          credentials: "include",
        });
        const j = await r.json();

        if (!j?.success) throw new Error(j?.message || "Failed to load form info");
        if (gone) return;

        const draft = j.draft || {};
        if (draft.box2) setBox2((v) => ({ ...v, ...draft.box2 }));
        if (draft.box3) setBox3((v) => ({ ...v, ...draft.box3 }));
        if (draft.box4) setBox4((v) => ({ ...v, ...draft.box4 }));
        if (draft.box5) setBox5((v) => ({ ...v, ...draft.box5 }));

        setAdminTemplateUrl(j.admin_template_url || null);
        setUserFilledUrl(j.user_filled_url || null);
        setPreviewUrl(j.user_filled_url || j.admin_template_url || null);
      } catch (e) {
        console.error(e);
      } finally {
        if (!gone) setLoading(false);
      }
    })();
    return () => {
      gone = true;
    };
  }, [API, applicationId]);

  // temp signature storage for Box 3 (preview + submit)
  const [box3SigTemp, setBox3SigTemp] = useState("");

  const buildPayload = (opts = { includeSigs: false }) => {
    const keep = (o) => {
      const x = { ...o };
      if (!opts.includeSigs) delete x.signature_data_url; // drop big images when not needed
      return x;
    };

    const payload = {
      box2: keep(box2),      // includes signature on submit
      box3: { ...box3 },     // we’ll inject the signature below
      box4: keep(box4),
      box5: keep(box5),
    };

    // send Box 3 signature on submit when requested
    if (opts.includeSigs && box3SigTemp) {
      payload.box3.signature_data_url = box3SigTemp;
    }
    return payload;
  };

  async function saveDraft() {
    setSaving(true);
    try {
      const r = await fetch(`${API}/user/electrical/form/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          data: buildPayload({ includeSigs: true }), // keep as you had it
        }),
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

  async function stampSignature(which, dataUrlFromState) {
    try {
      const data_url =
        which === "box2" ? box2.signature_data_url :
        which === "box4" ? box4.signature_data_url :
        which === "box5" ? box5.signature_data_url :
        dataUrlFromState || "";

      if (!data_url) return alert("Please draw or upload a signature first.");

      const r = await fetch(`${API}/user/electrical/form/sign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, which, data_url }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to stamp signature.");
      setPreviewUrl(j.preview_url);
      if (window.innerWidth < 768) setPane("preview");
    } catch (e) {
      alert(e.message || "Server error while stamping signature.");
    }
  }

  async function doSubmit() {
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/user/electrical/form/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          data: buildPayload({ includeSigs: true }), // <-- ensure Box 3 sig is sent
        }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Failed to submit.");

      const url = j.user_filled_url || null;
      if (url) {
        setUserFilledUrl(url);
        setPreviewUrl(url);
      }
      alert("Submitted. Your filled PDF is attached and the preview is updated.");
      onSubmitted?.();
      if (window.innerWidth < 768) setPane("preview");
    } catch (e) {
      alert(e.message || "Server error while submitting.");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <InlineModal open title="Electrical Permit – Fill Boxes 2–5" onClose={onClose}>
      {loading ? (
        <div className="p-6 text-gray-600">Loading…</div>
      ) : (
        <>
          {/* Mobile tabs */}
          <div className="md:hidden px-3 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => setPane("preview")}
                className={`flex-1 px-3 py-2 rounded-md border text-sm ${
                  pane === "preview" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setPane("form")}
                className={`flex-1 px-3 py-2 rounded-md border text-sm ${
                  pane === "form" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                }`}
              >
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
                  title={adminTemplateUrl ? "Show latest admin-generated template" : "No admin template yet"}
                >
                  Use Admin Template
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs rounded border bg-white hover:bg-gray-50"
                  onClick={() => userFilledUrl && setPreviewUrl(userFilledUrl)}
                  disabled={!userFilledUrl}
                  title={userFilledUrl ? "Show last submitted user-filled PDF" : "No submitted PDF yet"}
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
                  <iframe
                    title="preview"
                    src={previewUrl}
                    className="w-full h-[55svh] md:h-[70vh]"
                  />
                ) : (
                  <div className="p-6 text-sm text-gray-500">No preview available.</div>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Stamp signatures to see placement. On Submit, Box 2/4/5 signatures are embedded by the
                server (Box 3 uses stamping preview per your backend).
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className={`${pane === "preview" ? "hidden md:block" : ""} max-h-full`}>
              <div className="space-y-6 md:max-h-[75vh] md:overflow-y-auto pr-1">
                {/* BOX 2 */}
                <section className="space-y-3">
                  <h4 className="font-semibold text-gray-800">BOX 2 – Design Professional</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block text-gray-600">Engineer (Printed Name)</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.engineer_name}
                        onChange={(e) => setBox2((v) => ({ ...v, engineer_name: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Date</span>
                      <input
                        type="date"
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.date}
                        onChange={(e) => setBox2((v) => ({ ...v, date: e.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block text-gray-600">Address</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.address}
                        onChange={(e) => setBox2((v) => ({ ...v, address: e.target.value }))}
                      />
                    </label>
                    <div />
                    <label className="text-sm">
                      <span className="block text-gray-600">PRC No.</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.prc_no}
                        onChange={(e) => setBox2((v) => ({ ...v, prc_no: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Validity</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.validity}
                        onChange={(e) => setBox2((v) => ({ ...v, validity: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">PTR No.</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.ptr_no}
                        onChange={(e) => setBox2((v) => ({ ...v, ptr_no: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Date Issued</span>
                      <input
                        type="date"
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.date_issued}
                        onChange={(e) => setBox2((v) => ({ ...v, date_issued: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Issued at</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.issued_at}
                        onChange={(e) => setBox2((v) => ({ ...v, issued_at: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">TIN</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box2.tin}
                        onChange={(e) => setBox2((v) => ({ ...v, tin: e.target.value }))}
                      />
                    </label>
                  </div>

                  <SignatureField
                    title="Box 2 Signature (Design Professional)"
                    value={box2.signature_data_url}
                    onChange={(val) => setBox2((v) => ({ ...v, signature_data_url: val }))}
                  />
                  <button
                    type="button"
                    className="mt-1 px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => stampSignature("box2")}
                  >
                    Stamp Box 2 signature to preview
                  </button>
                </section>

                {/* BOX 3 */}
                <section className="space-y-3">
                  <h4 className="font-semibold text-gray-800">BOX 3 – Supervisor / In-Charge</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        checked={box3.role === "pe"}
                        onChange={() => setBox3((v) => ({ ...v, role: "pe" }))}
                      />
                      Professional Electrical Engineer
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        checked={box3.role === "re"}
                        onChange={() => setBox3((v) => ({ ...v, role: "re" }))}
                      />
                      Registered Electrical Engineer
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        checked={box3.role === "rme"}
                        onChange={() => setBox3((v) => ({ ...v, role: "rme" }))}
                      />
                      Registered Master Electrician
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block text-gray-600">Signed Name (Printed)</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.signed_name}
                        onChange={(e) => setBox3((v) => ({ ...v, signed_name: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Date</span>
                      <input
                        type="date"
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.date}
                        onChange={(e) => setBox3((v) => ({ ...v, date: e.target.value }))}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block text-gray-600">PRC No.</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.prc_no}
                        onChange={(e) => setBox3((v) => ({ ...v, prc_no: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Validity</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.validity}
                        onChange={(e) => setBox3((v) => ({ ...v, validity: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">PTR No.</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.ptr_no}
                        onChange={(e) => setBox3((v) => ({ ...v, ptr_no: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Date Issued</span>
                      <input
                        type="date"
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.date_issued}
                        onChange={(e) => setBox3((v) => ({ ...v, date_issued: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Issued at</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.issued_at}
                        onChange={(e) => setBox3((v) => ({ ...v, issued_at: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">TIN</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box3.tin}
                        onChange={(e) => setBox3((v) => ({ ...v, tin: e.target.value }))}
                      />
                    </label>
                  </div>

                  <label className="text-sm block">
                    <span className="block text-gray-600">Address</span>
                    <input
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={box3.address}
                      onChange={(e) => setBox3((v) => ({ ...v, address: e.target.value }))}
                    />
                  </label>

                  <div className="mt-3 p-3 border rounded">
                    <div className="font-medium text-sm text-gray-800 mb-2">Box 3 Signature (stamp to preview)</div>
                    <SignatureField
                      title="Draw or upload (Box 3)"
                      value={box3SigTemp}
                      onChange={setBox3SigTemp}
                    />
                    <div className="mt-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                        onClick={() => stampSignature("box3", box3SigTemp)}
                      >
                        Stamp Box 3 signature to preview
                      </button>
                    </div>
                  </div>
                </section>

                {/* BOX 4 */}
                <section className="space-y-3">
                  <h4 className="font-semibold text-gray-800">BOX 4 – Building Owner</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block text-gray-600">Owner (Printed Name)</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box4.owner_name}
                        onChange={(e) => setBox4((v) => ({ ...v, owner_name: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Date</span>
                      <input
                        type="date"
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box4.date}
                        onChange={(e) => setBox4((v) => ({ ...v, date: e.target.value }))}
                      />
                    </label>
                  </div>
                  <label className="text-sm block">
                    <span className="block text-gray-600">Address</span>
                    <input
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={box4.address}
                      onChange={(e) => setBox4((v) => ({ ...v, address: e.target.value }))}
                    />
                  </label>

                  <SignatureField
                    title="Owner Signature (Box 4)"
                    value={box4.signature_data_url}
                    onChange={(val) => setBox4((v) => ({ ...v, signature_data_url: val }))}
                  />
                  <button
                    type="button"
                    className="mt-1 px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => stampSignature("box4")}
                  >
                    Stamp Box 4 signature to preview
                  </button>
                </section>

                {/* BOX 5 */}
                <section className="space-y-3">
                  <h4 className="font-semibold text-gray-800">BOX 5 – With My Consent: Lot Owner</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block text-gray-600">Lot Owner (Printed Name)</span>
                      <input
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box5.lot_owner_name}
                        onChange={(e) => setBox5((v) => ({ ...v, lot_owner_name: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-gray-600">Date</span>
                      <input
                        type="date"
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={box5.date}
                        onChange={(e) => setBox5((v) => ({ ...v, date: e.target.value }))}
                      />
                    </label>
                  </div>
                  <label className="text-sm block">
                    <span className="block text-gray-600">Address</span>
                    <input
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={box5.address}
                      onChange={(e) => setBox5((v) => ({ ...v, address: e.target.value }))}
                    />
                  </label>

                  <SignatureField
                    title="Lot Owner Signature (Box 5)"
                    value={box5.signature_data_url}
                    onChange={(val) => setBox5((v) => ({ ...v, signature_data_url: val }))}
                  />
                  <button
                    type="button"
                    className="mt-1 px-3 py-1.5 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => stampSignature("box5")}
                  >
                    Stamp Box 5 signature to preview
                  </button>
                </section>

                {/* Sticky action bar (mobile) */}
                <div className="md:hidden sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-t mt-4 py-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      disabled={saving}
                      className="w-full px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
                    >
                      {saving ? "Saving…" : "Save Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(true)}
                      disabled={submitting}
                      className="w-full px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden md:flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={saving}
                  className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
                >
                  {saving ? "Saving…" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Submit filled form?"
        message={
          "We will render your current entries (Boxes 2–5) onto the official template.\n" +
          "Box 2/4/5 signatures will be embedded. Box 3 signature uses the preview stamping.\n\n" +
          "Proceed?"
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doSubmit}
        confirmText="Submit now"
      />
    </InlineModal>
  );
}
