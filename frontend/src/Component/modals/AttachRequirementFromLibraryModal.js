import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, X } from "lucide-react";

const API = "http://localhost:8081";

// Helper: normalize to our enum used in tbl_document_requirements.permit_type and tbl_application_requirements.application_type
function resolvePermitType({ module, applicationType }) {
  // 1) If parent told us the module explicitly, trust it.
  if (module) return String(module).toLowerCase();

  const t = String(applicationType || "").toLowerCase().trim();

  // 2) Common special cases coming from per-table application_type fields
  if (t === "new") return "business";
  if (t === "renewal" || t === "renewal_business") return "renewal_business";

  // 3) Fallback heuristics
  if (t.includes("business")) return "business";
  if (t.includes("electrical")) return "electrical";
  if (t.includes("cedula")) return "cedula";
  if (t.includes("building")) return "building";
  if (t.includes("plumbing")) return "plumbing";
  if (t.includes("fencing")) return "fencing";
  if (t.includes("electronics")) return "electronics";

  return ""; // unknown
}

export default function AttachRequirementFromLibraryModal({
  open,
  onClose,
  // What you PASS from the page:
  //   module: "business" | "electrical" | "cedula" | "building" | "plumbing" | "fencing" | "electronics"
  //   applicationType: raw value from the row (e.g., "new", "annualInspection", etc.)
  module,            // <--- NEW (prefer passing this!)
  applicationType,   // existing
  applicationId,     // number
  onAttached,
}) {
  const [loading, setLoading] = useState(false);

  // filters
  const [offices, setOffices] = useState([]);
  const [officeId, setOfficeId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [q, setQ] = useState("");

  // library items
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // already attached for this application
  const [attached, setAttached] = useState([]);

  const permitType = useMemo(() => {
    return resolvePermitType({ module, applicationType });
  }, [module, applicationType]);

  async function loadOffices() {
    const r = await axios.get(`${API}/api/document-storage/offices`, { withCredentials: true });
    if (r.data.ok) setOffices(r.data.data);
  }

  async function loadCategoriesForOffice(id) {
    if (!id) { setCategories([]); return; }
    const r = await axios.get(`${API}/api/document-storage/categories/${id}`, { withCredentials: true });
    if (r.data.ok) setCategories(r.data.data);
  }

  async function loadLibrary() {
    if (!permitType) { setItems([]); return; } // avoid 0-found confusion
    setLoading(true);
    try {
      const params = { permit_type: permitType };
      if (officeId) params.office_id = officeId;
      if (categoryId) params.category_id = categoryId;
      if (q) params.q = q;

      const r = await axios.get(`${API}/api/requirements-library`, {
        withCredentials: true,
        params,
      });
      if (r.data.success) setItems(r.data.items);
    } catch (e) {
      console.error(e);
      alert("Failed to load requirements library.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAttached() {
    if (!applicationId || !permitType) return;
    try {
      const r = await axios.get(`${API}/api/attached-requirements`, {
        withCredentials: true,
        params: { application_type: permitType, application_id: applicationId },
      });
      if (r.data.success) setAttached(r.data.items);
    } catch (e) {
      console.error(e);
    }
  }

  async function attachSelected() {
    if (!selectedId) return alert("Please select a requirement.");
    if (!permitType) return alert("No permit type detected for this application.");
    if (!applicationId) return alert("No application id.");

    const payload = {
      application_type: permitType,
      application_id: Number(applicationId),
      doc_requirement_id: Number(selectedId),
    };
    console.log("POST /api/attach-requirement payload:", payload);

    try {
      const r = await axios.post(`${API}/api/attach-requirement`, payload, {
        withCredentials: true
      });
      if (r.data.success) {
        await loadAttached();
        onAttached?.(r.data);
        alert("Attached from system library.");
        onClose();
      } else {
        alert(r.data.message || "Attach failed.");
      }
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Server error.";
      alert(msg);
    }
  }

  // open lifecycle
  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    loadOffices();
    loadAttached();
    loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // when permitType changes (e.g., from "new" -> "business"), refetch lists
  useEffect(() => {
    if (!open) return;
    loadAttached();
    loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permitType]);

  // dependent filters
  useEffect(() => {
    if (!open) return;
    loadCategoriesForOffice(officeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeId]);

  // refetch when filters/search change
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(loadLibrary, 250); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeId, categoryId, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Attach Requirement (from System)</h3>
            <p className="text-sm text-gray-500">
              {module || applicationType} • Application ID: {applicationId} • Type: {permitType || "—"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, office, category…"
                className="pl-8 pr-3 py-2 border rounded w-64"
              />
            </div>

            <select
              value={officeId}
              onChange={(e) => setOfficeId(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All Departments</option>
              {offices.map((o) => (
                <option key={o.office_id} value={o.office_id}>{o.office_name}</option>
              ))}
            </select>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border rounded px-3 py-2"
              disabled={!officeId}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>

            <span className="text-sm text-gray-500 self-center">
              {loading ? "Loading…" : `${items.length} found`}
            </span>
          </div>

          {/* Library list */}
          <div className="border rounded">
            <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 py-2 px-3">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Department</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-1 text-right">Pick</div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {items.map((it) => (
                <div key={it.requirement_id} className="grid grid-cols-12 items-center py-2 px-3 border-t text-sm">
                  <div className="col-span-5">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">{it.instructions}</div>
                    {it.template_path && (
                      <a
                        href={`${API}${it.template_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Preview PDF
                      </a>
                    )}
                  </div>
                  <div className="col-span-3">{it.office_name}</div>
                  <div className="col-span-3">{it.category_name || "—"}</div>
                  <div className="col-span-1 text-right">
                    <input
                      type="radio"
                      name="pick"
                      checked={selectedId === it.requirement_id}
                      onChange={() => setSelectedId(it.requirement_id)}
                    />
                  </div>
                </div>
              ))}
              {!items.length && !loading && (
                <div className="text-center text-gray-500 py-8">No requirements match your filters.</div>
              )}
            </div>
          </div>

          {/* Already attached to this application */}
          <div>
            <div className="text-sm font-semibold mb-2">Already Attached to this Application</div>
            <div className="border rounded">
              <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 py-2 px-3">
                <div className="col-span-6">Name</div>
                <div className="col-span-6">PDF</div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {attached.map((a) => (
                  <div key={a.requirement_id} className="grid grid-cols-12 items-center py-2 px-3 border-t text-sm">
                    <div className="col-span-6">{a.file_path}</div>
                    <div className="col-span-6">
                      {a.pdf_path ? (
                        <a href={`${API}${a.pdf_path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          View PDF
                        </a>
                      ) : "—"}
                    </div>
                  </div>
                ))}
                {!attached.length && (
                  <div className="text-center text-gray-500 py-6 text-sm">Nothing attached yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-4 flex justify-end gap-2 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={attachSelected}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            disabled={!selectedId}
          >
            Attach
          </button>
        </div>
      </div>
    </div>
  );
}
