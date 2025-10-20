import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit2, Trash2, X } from "lucide-react";
import AdminSidebar from "../Header/Adminsidebar";

const API = "http://localhost:8081/api/document-storage";

// Keep this in sync with your backend enum
const PERMIT_TYPES = [
  "business",
  "renewal_business",
  "special_sales",
  "cedula",
  "building",
  "electrical",
  "plumbing",
  "fencing",
  "electronics",
  "zoning",
  "mayors",
];

/* ------------------------- Row (memo) ------------------------- */
const Row = React.memo(function Row({ r, onEdit, onDelete }) {
  return (
    <tr className="border-t">
      <td className="px-4 py-2">
        <div className="font-medium">{r.name}</div>
        <div className="text-xs text-gray-500">{r.permit_type || "—"}</div>
      </td>
      <td className="px-4 py-2">{r.office_name}</td>
      <td className="px-4 py-2">{r.category_name || "—"}</td>
      <td className="px-4 py-2 text-center">
        <button
          onClick={() => onEdit(r)}
          className="text-blue-600 mr-2 hover:text-blue-800"
          title="Edit"
        >
          <Edit2 className="inline w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(r.requirement_id)}
          className="text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash2 className="inline w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

/* ------------------------- Table (memo) ------------------------- */
const ReqTable = React.memo(function ReqTable({ requirements, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded shadow">
      <table className="w-full">
        <thead className="bg-gray-100 text-sm text-gray-600">
          <tr>
            <th className="px-4 py-2 text-left">Name / Permit</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requirements.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                No requirements found.
              </td>
            </tr>
          ) : (
            requirements.map((r) => (
              <Row key={r.requirement_id} r={r} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

/* ------------------------- Filters (memo) ------------------------- */
const Filters = React.memo(function Filters({
  offices, categories, officeId, categoryId, setOfficeId, setCategoryId,
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <select
        value={officeId}
        onChange={(e) => setOfficeId(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Select Department</option>
        {offices.map((o) => (
          <option key={o.office_id} value={o.office_id}>{o.office_name}</option>
        ))}
      </select>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
        ))}
      </select>
    </div>
  );
});

/* ------------------------- Add Form (memo) ------------------------- */
const AddForm = React.memo(function AddForm({
  form, setForm, canSubmit, onSubmit,
}) {
  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-3">Add Requirement</h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Requirement Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        />

        {/* Permit Type */}
        <select
          value={form.permit_type}
          onChange={(e) => setForm((prev) => ({ ...prev, permit_type: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select Permit Type</option>
          {PERMIT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <textarea
          placeholder="Instructions (optional)"
          value={form.instructions}
          onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        />

        <input
          type="file"
          onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files[0] }))}
          className="w-full"
        />

        <button
          onClick={onSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={!canSubmit}
        >
          Save Requirement
        </button>
      </div>
    </div>
  );
});

/* ------------------------- Edit Modal ------------------------- */
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ========================= PAGE ========================= */
export default function AdminDocumentRequirements() {
  const [offices, setOffices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requirements, setRequirements] = useState([]);

  const [officeId, setOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    instructions: "",
    file: null,
    permit_type: "", // NEW
  });

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    office_id: "",
    category_id: "",
    instructions: "",
    file: null,
    permit_type: "", // NEW
  });
  const [editCats, setEditCats] = useState([]);

  // ---- data loaders (stable) ----
  const loadOffices = useCallback(async () => {
    const r = await fetch(`${API}/offices`);
    const j = await r.json();
    if (j.ok) setOffices(j.data);
  }, []);

  const loadCategories = useCallback(async (office_id) => {
    if (!office_id) { setCategories([]); return; }
    const r = await fetch(`${API}/categories/${office_id}`);
    const j = await r.json();
    if (j.ok) setCategories(j.data);
  }, []);

  const loadEditCats = useCallback(async (office_id) => {
    if (!office_id) { setEditCats([]); return; }
    const r = await fetch(`${API}/categories/${office_id}`);
    const j = await r.json();
    if (j.ok) setEditCats(j.data);
  }, []);

  const loadRequirements = useCallback(async () => {
    const q = new URLSearchParams();
    if (officeId) q.set("office_id", officeId);
    if (categoryId) q.set("category_id", categoryId);
    const r = await fetch(`${API}/requirements?${q.toString()}`);
    const j = await r.json();
    if (j.ok) setRequirements(j.data);
  }, [officeId, categoryId]);

  // ---- effects ----
  useEffect(() => { loadOffices(); }, [loadOffices]);
  useEffect(() => { if (officeId) loadCategories(officeId); }, [officeId, loadCategories]);
  useEffect(() => { loadRequirements(); }, [loadRequirements]);

  // ---- actions (stable) ----
  const addCategory = useCallback(async () => {
    if (!officeId || !newCategory.trim()) { alert("Select office and enter category name."); return; }
    const r = await fetch(`${API}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ office_id: officeId, category_name: newCategory }),
    });
    const j = await r.json();
    if (j.ok) {
      setNewCategory("");
      loadCategories(officeId);
      alert("Category added successfully.");
    } else {
      alert(j.error || j.message);
    }
  }, [officeId, newCategory, loadCategories]);

  const addRequirement = useCallback(async () => {
    if (!officeId || !form.name.trim() || !form.permit_type) {
      alert("Please fill Name, Department and Permit Type.");
      return;
    }
    const fd = new FormData();
    fd.append("office_id", officeId);
    if (categoryId) fd.append("category_id", categoryId);
    fd.append("name", form.name);
    fd.append("instructions", form.instructions);
    fd.append("permit_type", form.permit_type); // NEW
    if (form.file) fd.append("template", form.file);

    const r = await fetch(`${API}/requirements`, { method: "POST", body: fd });
    const j = await r.json();
    if (j.ok) {
      setForm({ name: "", instructions: "", file: null, permit_type: "" });
      loadRequirements();
      alert("Requirement added successfully.");
    } else {
      alert(j.error || j.message);
    }
  }, [officeId, categoryId, form, loadRequirements]);

  const openEdit = useCallback((row) => {
    setEditing(row);
    setEditData({
      name: row.name || "",
      office_id: String(row.office_id || ""),
      category_id: row.category_id ? String(row.category_id) : "",
      instructions: row.instructions || "",
      file: null,
      permit_type: row.permit_type || "", // NEW
    });
    loadEditCats(String(row.office_id || ""));
    setIsEditOpen(true);
  }, [loadEditCats]);

  const submitEdit = useCallback(async () => {
    if (!editing) return;
    if (!editData.name.trim() || !editData.office_id || !editData.permit_type) {
      alert("Please fill Name, Department and Permit Type.");
      return;
    }
    const fd = new FormData();
    fd.append("name", editData.name);
    fd.append("office_id", editData.office_id);
    if (editData.category_id) fd.append("category_id", editData.category_id);
    fd.append("instructions", editData.instructions || "");
    fd.append("permit_type", editData.permit_type); // NEW
    if (editData.file) fd.append("template", editData.file);

    const r = await fetch(`${API}/requirements/${editing.requirement_id}`, { method: "PUT", body: fd });
    const j = await r.json();
    if (j.ok) {
      setIsEditOpen(false);
      setEditing(null);
      setEditData({ name: "", office_id: "", category_id: "", instructions: "", file: null, permit_type: "" });
      loadRequirements();
    } else {
      alert(j.error || j.message || "Update failed.");
    }
  }, [editing, editData, loadRequirements]);

  const deleteRequirement = useCallback(async (id) => {
    if (!window.confirm("Delete this requirement?")) return;
    const r = await fetch(`${API}/requirements/${id}`, { method: "DELETE" });
    const j = await r.json();
    if (j.ok) loadRequirements();
    else alert(j.error || j.message || "Delete failed.");
  }, [loadRequirements]);

  // stable booleans for memo children
  const canSubmit = useMemo(
    () => !!officeId && !!form.name.trim() && !!form.permit_type,
    [officeId, form.name, form.permit_type]
  );

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 fixed inset-y-0 left-0">
        <AdminSidebar />
      </aside>
      <main className="ml-64 flex-1 bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Document Requirements</h1>

        {/* Filters */}
        <Filters
          offices={offices}
          categories={categories}
          officeId={officeId}
          categoryId={categoryId}
          setOfficeId={setOfficeId}
          setCategoryId={setCategoryId}
        />

        {/* Add Category */}
        {officeId && (
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category"
              className="border rounded px-3 py-2 flex-1"
            />
            <button onClick={addCategory} className="bg-blue-600 text-white px-4 rounded">
              Add Category
            </button>
          </div>
        )}

        {/* Add Requirement (memoized) */}
        <AddForm form={form} setForm={setForm} canSubmit={canSubmit} onSubmit={addRequirement} />

        {/* Table (memoized) */}
        <ReqTable requirements={requirements} onEdit={openEdit} onDelete={deleteRequirement} />

        {/* Edit Modal */}
        <Modal
          open={isEditOpen}
          title="Edit Requirement"
          onClose={() => {
            setIsEditOpen(false);
            setEditing(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={editData.name}
                onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="Requirement Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Permit Type</label>
              <select
                value={editData.permit_type}
                onChange={(e) => setEditData((p) => ({ ...p, permit_type: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Permit Type</option>
                {PERMIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  value={editData.office_id}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditData((p) => ({ ...p, office_id: v, category_id: "" }));
                    loadEditCats(v);
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {offices.map((o) => (
                    <option key={o.office_id} value={o.office_id}>{o.office_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editData.category_id}
                  onChange={(e) => setEditData((p) => ({ ...p, category_id: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Category</option>
                  {editCats.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instructions</label>
              <textarea
                rows={3}
                value={editData.instructions}
                onChange={(e) => setEditData((p) => ({ ...p, instructions: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Replace template (optional)</label>
              <input
                type="file"
                onChange={(e) => setEditData((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep the existing template.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={submitEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
                disabled={!editData.name.trim() || !editData.office_id || !editData.permit_type}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditing(null);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
