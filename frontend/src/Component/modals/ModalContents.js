// src/modals/ModalContents.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AttachRequirementFromLibraryModal from "./AttachRequirementFromLibraryModal";
import { FileText } from "lucide-react";

const API_BASE_URL = "http://localhost:8081";

/* ----------------------------- helpers ----------------------------- */

function typeToApiSlug(typeLabel = "") {
  const t = (typeLabel || "").toLowerCase();
  if (t.includes("business")) return "business";
  if (t.includes("electrical")) return "electrical";
  if (t.includes("plumbing")) return "plumbing";
  if (t.includes("electronics")) return "electronics";
  if (t.includes("building")) return "building";
  if (t.includes("fencing")) return "fencing";
  if (t.includes("cedula")) return "cedula";
  if (t.includes("mayor")) return "mayors";
  if (t.includes("renewal")) return "renewal_business";
  return t.replace(/\s+/g, "");
}

function appIdFromSelected(selectedApplication) {
  return (
    selectedApplication?.id ||
    selectedApplication?.cedula_id ||
    selectedApplication?.BusinessP_id ||
    selectedApplication?.application_id ||
    selectedApplication?.applicationId ||
    null
  );
}

// Pretty label for status strings like "in-review" → "In Review"
function niceStatusLabel(raw = "") {
  if (!raw) return "Unknown";
  return String(raw)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/* ------------------ shared panel: attached requirements ------------------ */

function AttachedRequirementsPanel({ selectedApplication }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const [attachOpen, setAttachOpen] = useState(false);

  const applicationType = useMemo(
    () => typeToApiSlug(selectedApplication?.type),
    [selectedApplication]
  );
  const applicationId = useMemo(
    () => appIdFromSelected(selectedApplication),
    [selectedApplication]
  );

  // comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentFilter, setCommentFilter] = useState("all"); // filter by status

  // NEW: LGU verification state (page 2) – only used for business permits
  const isBusinessApp =
    applicationType === "business" ||
    applicationType === "renewal_business" ||
    applicationType === "special_sales";

  const [checks, setChecks] = useState({
    occupancy_permit: "not_needed",
    zoning_clearance: "not_needed",
    barangay_clearance: "not_needed",
    sanitary_clearance: "not_needed",
    environment_certificate: "not_needed",
    market_clearance: "not_needed",
    fire_safety_certificate: "not_needed",
    river_floating_fish: "not_needed",
  });

  const [generating, setGenerating] = useState(false);

  const updateCheck = (key, value) =>
    setChecks((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    // reset checks whenever we switch to a different application
    setChecks({
      occupancy_permit: "not_needed",
      zoning_clearance: "not_needed",
      barangay_clearance: "not_needed",
      sanitary_clearance: "not_needed",
      environment_certificate: "not_needed",
      market_clearance: "not_needed",
      fire_safety_certificate: "not_needed",
      river_floating_fish: "not_needed",
    });
  }, [applicationType, applicationId]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!applicationType || !applicationId) return;
      setLoading(true);
      try {
        // requirements
        const r = await axios.get(
          `${API_BASE_URL}/api/attached-requirements`,
          {
            withCredentials: true,
            params: {
              application_type: applicationType,
              application_id: applicationId,
            },
          }
        );

        // comments
        const c = await axios.get(
          `${API_BASE_URL}/api/application-comments`,
          {
            withCredentials: true,
            params: {
              application_type: applicationType,
              application_id: applicationId,
            },
          }
        );

        if (!mounted) return;
        setItems(r.data?.items || []);
        setComments(c.data?.items || []);
      } catch (e) {
        console.error("Load attachments/comments failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (applicationType && applicationId) load();
    return () => {
      mounted = false;
    };
  }, [applicationType, applicationId, refreshTick]);

  const hasItems = items && items.length > 0;

  // distinct statuses present in comments (for filter dropdown)
  const commentStatusOptions = useMemo(() => {
    const set = new Set();
    comments.forEach((c) => {
      if (c.status_at_post) set.add(c.status_at_post);
    });
    return Array.from(set);
  }, [comments]);

  // comments filtered by currently selected status
  const filteredComments = useMemo(() => {
    if (commentFilter === "all") return comments;
    return comments.filter(
      (c) => (c.status_at_post || "") === commentFilter
    );
  }, [comments, commentFilter]);

  // remove/undo an attached requirement
  const handleRemoveRequirement = async (requirementId) => {
    if (!requirementId) return;
    const ok = window.confirm(
      "Remove this attached requirement from the application?"
    );
    if (!ok) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/attached-requirements/remove`,
        { requirement_id: requirementId },
        { withCredentials: true }
      );
      setRefreshTick((n) => n + 1);
    } catch (e) {
      console.error("Remove requirement failed:", e);
      alert("Failed to remove attached requirement.");
    }
  };

  // NEW: generate applicant requirements (2-page PDF) and attach
  const handleGenerateRequirements = async () => {
    if (!applicationType || !applicationId) return;

    const ok = window.confirm(
      "Generate the 2-page Business Permit form (with applicant info + LGU verification) and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/business-permit/generate-form`,
        {
          application_type: applicationType,
          application_id: applicationId,
          checks,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        alert("LGU form generated and attached successfully.");
        setRefreshTick((n) => n + 1);
      } else {
        alert(
          "Generation failed: " + (res.data?.message || "Unknown error")
        );
      }
    } catch (e) {
      console.error("Generate form failed:", e);
      alert("Failed to generate form. Check the console for details.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Attached Requirements (User + System) */}
      <div className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Attached Requirements
          </h4>
          <div className="flex items-center space-x-2">
            {isBusinessApp && (
              <button
                onClick={handleGenerateRequirements}
                disabled={generating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Generate Applicant Requirements"}
              </button>
            )}
            <button
              onClick={() => setAttachOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded"
            >
              Attach From System
            </button>
            <button
              onClick={() => setRefreshTick((n) => n + 1)}
              className="text-xs px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 mt-3">
            Loading attached requirements…
          </p>
        ) : hasItems ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((it) => (
              <div
                key={`${it.requirement_id}-${it.file_path}-${it.uploaded_at}-${it.user_uploaded_at || "na"}`}
                className="bg-gray-50 border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="pr-3 mb-2 md:mb-0">
                  <p className="text-sm font-medium text-gray-800">
                    {it.file_path || "Requirement"}
                  </p>
                  <p className="text-xs text-gray-500">
                    System attached:{" "}
                    {it.uploaded_at
                      ? new Date(it.uploaded_at).toLocaleString()
                      : "N/A"}
                  </p>
                  {it.user_uploaded_at && (
                    <p className="text-xs text-gray-500">
                      User uploaded:{" "}
                      {new Date(
                        it.user_uploaded_at
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {it.file_url && (
                    <a
                      href={it.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs md:text-sm"
                    >
                      View Template
                    </a>
                  )}
                  {it.user_file_url && (
                    <a
                      href={it.user_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-xs md:text-sm"
                    >
                      View User Upload
                    </a>
                  )}
                  {!it.file_url && !it.user_file_url && (
                    <span className="text-xs text-gray-400 italic">
                      No file
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveRequirement(it.requirement_id)
                    }
                    className="text-xs md:text-sm text-red-600 hover:text-red-700 hover:underline ml-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            No requirements attached yet.
          </p>
        )}

        {/* NEW: LGU verification mini-form for Business permits */}
        {isBusinessApp && (
          <div className="mt-5 border-t pt-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">
              LGU Verification of Documents (will appear on Page 2)
            </h5>
            <p className="text-xs text-gray-500 mb-3">
              Set which documents are required for this application.
              These choices will be checked/encoded on the second page
              of the generated PDF.
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-2 py-1 border">Description</th>
                    <th className="px-2 py-1 border">Yes</th>
                    <th className="px-2 py-1 border">No</th>
                    <th className="px-2 py-1 border">Not needed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["occupancy_permit", "Occupancy Permit (For New)"],
                    ["zoning_clearance", "Zoning (New and Renewal)"],
                    ["barangay_clearance", "Barangay Clearance (For Renewal)"],
                    [
                      "sanitary_clearance",
                      "Sanitary Permit / Health Clearance",
                    ],
                    [
                      "environment_certificate",
                      "Municipal Environmental Certificate",
                    ],
                    ["market_clearance", "Market Clearance (For Stall Holders)"],
                    [
                      "fire_safety_certificate",
                      "Valid Fire Safety Inspection Certificate",
                    ],
                    [
                      "river_floating_fish",
                      "Registration/Verification (River Tanab, Oyster Culture, Floating Fish Cage Operator)",
                    ],
                  ].map(([key, label]) => (
                    <tr key={key}>
                      <td className="px-2 py-1 border align-top">
                        {label}
                      </td>
                      {["yes", "no", "not_needed"].map((val) => (
                        <td
                          key={val}
                          className="px-2 py-1 border text-center"
                        >
                          <input
                            type="radio"
                            name={key}
                            value={val}
                            checked={checks[key] === val}
                            onChange={(e) =>
                              updateCheck(key, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Comments – unchanged from your version */}
      <div className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700">
            Comments
          </h4>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Filter:</span>
            <select
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              <option value="all">All statuses</option>
              {commentStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {niceStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredComments?.length ? (
          <div className="space-y-3 mb-4">
            {filteredComments.map((c) => (
              <div key={c.id} className="bg-gray-50 border rounded p-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {c.comment}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    {c.author_role ? `${c.author_role} • ` : ""}
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : ""}
                  </div>
                  {c.status_at_post && (
                    <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {niceStatusLabel(c.status_at_post)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
        )}

        <div className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Add a comment for the applicant…"
            className="w-full border rounded p-2 text-sm"
          />
          <div className="flex justify-end">
            <button
              disabled={!commentText.trim() || commentSubmitting}
              onClick={async () => {
                if (!commentText.trim()) return;
                try {
                  setCommentSubmitting(true);
                  const rawStatus =
                    selectedApplication.application_status ??
                    selectedApplication.status ??
                    "";

                  await axios.post(
                    `${API_BASE_URL}/api/application-comments`,
                    {
                      application_type: applicationType,
                      application_id: applicationId,
                      comment: commentText,
                      status_at_post: String(rawStatus)
                        .toLowerCase()
                        .replace(/\s+/g, "-"), // "In Review" → "in-review"
                    },
                    { withCredentials: true }
                  );

                  setCommentText("");
                  setRefreshTick((n) => n + 1);
                } catch (e) {
                  console.error("Add comment failed:", e);
                  alert("Failed to add comment.");
                } finally {
                  setCommentSubmitting(false);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {commentSubmitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      </div>

      <AttachRequirementFromLibraryModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        applicationType={selectedApplication?.type || ""}
        applicationId={applicationId}
        onAttached={() => setRefreshTick((n) => n + 1)}
      />
    </div>
  );
}



/* ---------------- existing simple upload modal (kept) ---------------- */

export function AttachRequirementsModal({ onClose }) {
  const [requirementPDF, setRequirementPDF] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") {
      setRequirementPDF(file);
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!requirementPDF) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("requirement", requirementPDF);

      const res = await axios.post(
        `${API_BASE_URL}/api/upload-requirement`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        alert("Requirement uploaded successfully.");
        onClose();
      } else {
        alert("Upload failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please check the console.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setRequirementPDF(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Attach Requirement (PDF)</h2>

        <input
          type="file"
          id="requirementUpload"
          accept="application/pdf"
          onChange={handleFileChange}
          hidden
        />
        <label
          htmlFor="requirementUpload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded cursor-pointer"
        >
          Upload PDF
        </label>

        {requirementPDF && (
          <p className="mt-2 text-sm text-gray-700">
            ✅ Attached:{" "}
            <span className="font-semibold">{requirementPDF.name}</span>
          </p>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!requirementPDF || uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Cedula (unchanged + panel) --------------------- */

export function CedulaModalContent({ selectedApplication }) {
  return (
    <div className="bg-indigo-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Cedula Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Full Name:</strong>{" "}
            {selectedApplication.name || "N/A"}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {selectedApplication.address || "N/A"}
          </p>
          <p>
            <strong>Place of Birth:</strong>{" "}
            {selectedApplication.place_of_birth || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {selectedApplication.date_of_birth
              ? new Date(
                  selectedApplication.date_of_birth
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Profession:</strong>{" "}
            {selectedApplication.profession || "N/A"}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Yearly Income:</strong> ₱
            {selectedApplication.yearly_income != null
              ? selectedApplication.yearly_income.toLocaleString()
              : "0.00"}
          </p>
          <p>
            <strong>Purpose:</strong>{" "}
            {selectedApplication.purpose || "N/A"}
          </p>
          <p>
            <strong>Sex:</strong> {selectedApplication.sex || "N/A"}
          </p>
          <p>
            <strong>Civil Status:</strong>{" "}
            {selectedApplication.civil_status || "N/A"}
          </p>
          <p>
            <strong>TIN:</strong> {selectedApplication.tin || "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-purple-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-3 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Submitted by:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.last_name || ""
          }`.trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <div>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{ ...selectedApplication, type: "Cedula" }}
      />
    </div>
  );
}

/* --------------- Electrical (removed local upload UI) ---------------- */

export function ElectricalPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Electrical Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          <p>
            <strong>Use or Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
          <p>
            <strong>Construction Owned:</strong>{" "}
            {selectedApplication.construction_owned}
          </p>
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address Information
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          }, ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}, Lot ${
            selectedApplication.location_lot_no || ""
          }, Blk ${selectedApplication.location_blk_no || ""}, TCT: ${
            selectedApplication.location_tct_no || ""
          }, Tax Dec: ${
            selectedApplication.location_tax_dec_no || ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Electrical Permit",
        }}
      />
    </div>
  );
}

/* ---------------- Business (kept uploads display) + panel ------------- */

export function BusinessPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Business Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Business Name:</strong>{" "}
            {selectedApplication.business_name}
          </p>
          <p>
            <strong>Trade Name:</strong>{" "}
            {selectedApplication.trade_name}
          </p>
          <p>
            <strong>Application Type:</strong>{" "}
            {selectedApplication.application_type}
          </p>
          <p>
            <strong>Business Address:</strong>{" "}
            {selectedApplication.business_address}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {selectedApplication.business_email}
          </p>
          <p>
            <strong>Phone Number:</strong>{" "}
            {selectedApplication.business_telephone}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>TIN Number:</strong>{" "}
            {selectedApplication.tin_no}
          </p>
          <p>
            <strong>Registration Number:</strong>{" "}
            {selectedApplication.registration_no}
          </p>
          <p>
            <strong>Registration Date:</strong>{" "}
            {selectedApplication.registration_date
              ? new Date(
                  selectedApplication.registration_date
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.application_date
              ? new Date(
                  selectedApplication.application_date
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Payment Mode:</strong>{" "}
            {selectedApplication.payment_mode}
          </p>
          <p>
            <strong>Emergency Contact:</strong>{" "}
            {selectedApplication.emergency_contact}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Owner Information
        </h4>
        <p>
          <strong>Full Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_name || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Address:</strong>{" "}
          {selectedApplication.owner_address || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.owner_email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          {selectedApplication.owner_telephone || "N/A"}
        </p>
        <p>
          <strong>Mobile:</strong>{" "}
          {selectedApplication.owner_mobile || "N/A"}
        </p>
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Business Activities
        </h4>
        {selectedApplication.activities?.length > 0 ? (
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Line of Business</th>
                <th className="text-left px-4 py-2">Units</th>
                <th className="text-left px-4 py-2">
                  Capitalization
                </th>
                <th className="text-left px-4 py-2">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {selectedApplication.activities.map((act, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">
                    {act.line_of_business}
                  </td>
                  <td className="px-4 py-2">{act.units}</td>
                  <td className="px-4 py-2">
                    ₱{Number(act.capitalization).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {act.created_at
                      ? new Date(
                          act.created_at
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">
            No business activities recorded.
          </p>
        )}
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Uploaded Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Filled-up Form",
              path: selectedApplication.filled_up_forms,
            },
            {
              label: "SEC/DTI/CDA Certificate",
              path: selectedApplication.sec_dti_cda_certificate,
            },
            {
              label: "Local Sketch",
              path: selectedApplication.local_sketch,
            },
            {
              label: "Sworn Capital Statement",
              path: selectedApplication.sworn_statement_capital,
            },
            {
              label: "Tax Clearance",
              path: selectedApplication.tax_clearance,
            },
            {
              label: "Brgy. Clearance",
              path: selectedApplication.brgy_clearance_business,
            },
            { label: "Cedula", path: selectedApplication.cedula },
          ].map((doc, index) =>
            doc.path ? (
              <div
                key={index}
                className="bg-white border p-3 rounded shadow-sm"
              >
                <p className="font-medium">{doc.label}:</p>
                <a
                  href={`http://localhost:8081${doc.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View / Download
                </a>
              </div>
            ) : (
              <div
                key={index}
                className="text-sm text-gray-500 italic"
              >
                {doc.label}: Not uploaded
              </div>
            )
          )}
        </div>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Business Permit",
        }}
      />
    </div>
  );
}

/* -------------------- New four permit modals + panel ------------------- */

export function PlumbingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Plumbing Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>PP No:</strong> {selectedApplication.pp_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          {selectedApplication.other_scope_specify && (
            <p>
              <strong>Other Scope:</strong>{" "}
              {selectedApplication.other_scope_specify}
            </p>
          )}
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          } ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}, Lot ${
            selectedApplication.location_lot_no || ""
          }, Blk ${selectedApplication.location_blk_no || ""}, TCT ${
            selectedApplication.location_tct_no || ""
          }, Tax Dec ${
            selectedApplication.location_tax_dec_no || ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Plumbing Permit",
        }}
      />
    </div>
  );
}

export function ElectronicsPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Electronics Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>EP No:</strong> {selectedApplication.ep_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          } ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""} ${
            selectedApplication.location_lot_no
              ? " • Lot " + selectedApplication.location_lot_no
              : ""
          }${
            selectedApplication.location_blk_no
              ? " • Blk " + selectedApplication.location_blk_no
              : ""
          }${
            selectedApplication.location_tct_no
              ? " • TCT " + selectedApplication.location_tct_no
              : ""
          }${
            selectedApplication.location_tax_dec_no
              ? " • Tax Dec " + selectedApplication.location_tax_dec_no
              : ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Electronics Permit",
        }}
      />
    </div>
  );
}

export function BuildingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Building Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          } ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}${
            selectedApplication.location_lot_no
              ? ", Lot " + selectedApplication.location_lot_no
              : ""
          }${
            selectedApplication.location_blk_no
              ? ", Blk " + selectedApplication.location_blk_no
              : ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Building Permit",
        }}
      />
    </div>
  );
}

export function FencingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Fencing Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>FP No:</strong> {selectedApplication.fp_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          <p>
            <strong>Ownership Form:</strong>{" "}
            {selectedApplication.ownership_form ||
              selectedApplication.form_of_ownership}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.street ||
            selectedApplication.address_street ||
            ""
          }, Brgy. ${
            selectedApplication.barangay ||
            selectedApplication.address_barangay ||
            ""
          }, ${
            selectedApplication.city_municipality ||
            selectedApplication.address_city ||
            ""
          } ${
            selectedApplication.zip_code ||
            selectedApplication.address_zip_code ||
            ""
          }`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}${
            selectedApplication.lot_no
              ? ", Lot " + selectedApplication.lot_no
              : ""
          }${
            selectedApplication.block_no1
              ? ", Blk " + selectedApplication.block_no1
              : ""
          }${
            selectedApplication.block_no2
              ? "–" + selectedApplication.block_no2
              : ""
          }${
            selectedApplication.tax_dec_no
              ? ", Tax Dec " + selectedApplication.tax_dec_no
              : ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Fencing Permit",
        }}
      />
    </div>
  );
}
