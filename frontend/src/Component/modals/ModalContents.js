// src/modals/ModalContents.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AttachRequirementFromLibraryModal from "./AttachRequirementFromLibraryModal";

// Icons & small helpers you already use elsewhere
import { FileText } from "lucide-react";

const API_BASE_URL = "http://localhost:8081";

/* ----------------------------- helpers ----------------------------- */

function typeToApiSlug(typeLabel = "") {
  // Map the label you show in UI to the application_type used by your APIs/tables
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
  // Your different payloads sometimes use different id field names
  return (
    selectedApplication?.id ||
    selectedApplication?.cedula_id ||
    selectedApplication?.BusinessP_id ||
    selectedApplication?.application_id ||
    selectedApplication?.applicationId ||
    null
  );
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

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // requirements
        const r = await axios.get(
          `${API_BASE_URL}/api/attached-requirements`,
          {
            withCredentials: true,
            params: { application_type: applicationType, application_id: applicationId }
          }
        );

        // comments
        const c = await axios.get(
          `${API_BASE_URL}/api/application-comments`,
          {
            withCredentials: true,
            params: { application_type: applicationType, application_id: applicationId }
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
            {/* Attach new from Library (System) */}
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
          <p className="text-sm text-gray-500 mt-3">Loading attached requirements…</p>
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
        System attached: {new Date(it.uploaded_at).toLocaleString()}
      </p>
      {it.user_uploaded_at && (
        <p className="text-xs text-gray-500">
          User uploaded: {new Date(it.user_uploaded_at).toLocaleString()}
        </p>
      )}
    </div>

    <div className="flex flex-wrap gap-2">
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
        <span className="text-xs text-gray-400 italic">No file</span>
      )}
    </div>
  </div>
))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-3">No requirements attached yet.</p>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white border rounded-md p-4">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Comments</h4>

        {/* list */}
        {comments?.length ? (
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 border rounded p-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.comment}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {c.author_role ? `${c.author_role} • ` : ""}
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
        )}

        {/* add */}
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
                  await axios.post(
                    `${API_BASE_URL}/api/application-comments`,
                    {
                      application_type: applicationType,
                      application_id: applicationId,
                      comment: commentText
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

      {/* attach-from-library modal (system) */}
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
  // Your original upload modal — leaving as-is if you still use it elsewhere.
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
          headers: { "Content-Type": "multipart/form-data" }
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
            ✅ Attached: <span className="font-semibold">{requirementPDF.name}</span>
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cedula Information</h3>

      {/* existing details... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Full Name:</strong> {selectedApplication.name || 'N/A'}</p>
          <p><strong>Address:</strong> {selectedApplication.address || 'N/A'}</p>
          <p><strong>Place of Birth:</strong> {selectedApplication.place_of_birth || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> {new Date(selectedApplication.date_of_birth).toLocaleDateString() || 'N/A'}</p>
          <p><strong>Profession:</strong> {selectedApplication.profession || 'N/A'}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Yearly Income:</strong> ₱{selectedApplication.yearly_income?.toLocaleString() || '0.00'}</p>
          <p><strong>Purpose:</strong> {selectedApplication.purpose || 'N/A'}</p>
          <p><strong>Sex:</strong> {selectedApplication.sex || 'N/A'}</p>
          <p><strong>Civil Status:</strong> {selectedApplication.civil_status || 'N/A'}</p>
          <p><strong>TIN:</strong> {selectedApplication.tin || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-purple-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-3 text-gray-700">Applicant Information</h4>
        <p><strong>Submitted by:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p><strong>Application Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString() || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Last Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString() || 'N/A'}</p>
        </div>
      </div>

      {/* NEW: files & comments */}
      <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Cedula" }} />
    </div>
  );
}

/* --------------- Electrical (removed local upload UI) ---------------- */

export function ElectricalPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Electrical Permit Information</h3>

      {/* Main Permit Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
          <p><strong>Building Permit No:</strong> {selectedApplication.building_permit_no}</p>
          <p><strong>Scope of Work:</strong> {selectedApplication.scope_of_work}</p>
          <p><strong>Use or Character:</strong> {selectedApplication.use_or_character}</p>
          <p><strong>Construction Owned:</strong> {selectedApplication.construction_owned}</p>
          <p><strong>Form of Ownership:</strong> {selectedApplication.form_of_ownership}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Status:</strong> {selectedApplication.status}</p>
          <p><strong>Email:</strong> {selectedApplication.email}</p>
          <p><strong>Telephone:</strong> {selectedApplication.telephone_no}</p>
          <p><strong>Application Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Applicant Info */}
      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Applicant Information</h4>
        <p><strong>Name:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.middle_initial || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
        <p><strong>Telephone:</strong> {selectedApplication.telephone_no || 'N/A'}</p>
      </div>

      {/* Address Info */}
      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Address Information</h4>
        <p><strong>Address:</strong> {`${selectedApplication.address_no} ${selectedApplication.address_street}, Brgy. ${selectedApplication.address_barangay}, ${selectedApplication.address_city}, ${selectedApplication.address_zip_code}`}</p>
        <p><strong>Location:</strong> {`${selectedApplication.location_street}, Lot ${selectedApplication.location_lot_no}, Blk ${selectedApplication.location_blk_no}, TCT: ${selectedApplication.location_tct_no}, Tax Dec: ${selectedApplication.location_tax_dec_no}`}</p>
      </div>

      {/* NEW: files & comments */}
      <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Electrical Permit" }} />
    </div>
  );
}

/* ---------------- Business (kept uploads display) + panel ------------- */

export function BusinessPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Permit Information</h3>

      {/* Business Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Business Name:</strong> {selectedApplication.business_name}</p>
          <p><strong>Trade Name:</strong> {selectedApplication.trade_name}</p>
          <p><strong>Application Type:</strong> {selectedApplication.application_type}</p>
          <p><strong>Business Address:</strong> {selectedApplication.business_address}</p>
          <p><strong>Email:</strong> {selectedApplication.business_email}</p>
          <p><strong>Phone Number:</strong> {selectedApplication.business_telephone}</p>
        </div>
        <div className="space-y-2">
          <p><strong>TIN Number:</strong> {selectedApplication.tin_no}</p>
          <p><strong>Registration Number:</strong> {selectedApplication.registration_no}</p>
          <p><strong>Registration Date:</strong> {new Date(selectedApplication.registration_date).toLocaleDateString()}</p>
          <p><strong>Application Date:</strong> {new Date(selectedApplication.application_date).toLocaleDateString()}</p>
          <p><strong>Payment Mode:</strong> {selectedApplication.payment_mode}</p>
          <p><strong>Emergency Contact:</strong> {selectedApplication.emergency_contact}</p>
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Owner Information</h4>
        <p><strong>Full Name:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.middle_name || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
        <p><strong>Address:</strong> {selectedApplication.owner_address || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedApplication.owner_email || 'N/A'}</p>
        <p><strong>Phone:</strong> {selectedApplication.owner_telephone || 'N/A'}</p>
        <p><strong>Mobile:</strong> {selectedApplication.owner_mobile || 'N/A'}</p>
      </div>

      {/* Business Activities */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Business Activities</h4>
        {selectedApplication.activities?.length > 0 ? (
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Line of Business</th>
                <th className="text-left px-4 py-2">Units</th>
                <th className="text-left px-4 py-2">Capitalization</th>
                <th className="text-left px-4 py-2">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {selectedApplication.activities.map((act, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{act.line_of_business}</td>
                  <td className="px-4 py-2">{act.units}</td>
                  <td className="px-4 py-2">₱{Number(act.capitalization).toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(act.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No business activities recorded.</p>
        )}
      </div>

      {/* Existing static “Uploaded Requirements” (from business table fields) remains */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">Uploaded Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Filled-up Form", path: selectedApplication.filled_up_forms },
            { label: "SEC/DTI/CDA Certificate", path: selectedApplication.sec_dti_cda_certificate },
            { label: "Local Sketch", path: selectedApplication.local_sketch },
            { label: "Sworn Capital Statement", path: selectedApplication.sworn_statement_capital },
            { label: "Tax Clearance", path: selectedApplication.tax_clearance },
            { label: "Brgy. Clearance", path: selectedApplication.brgy_clearance_business },
            { label: "Cedula", path: selectedApplication.cedula },
          ].map((doc, index) =>
            doc.path ? (
              <div key={index} className="bg-white border p-3 rounded shadow-sm">
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
              <div key={index} className="text-sm text-gray-500 italic">
                {doc.label}: Not uploaded
              </div>
            )
          )}
        </div>
      </div>

      {/* NEW: unified files (user + system) + comments */}
      <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Business Permit" }} />
    </div>
  );
}

/* -------------------- New four permit modals + panel ------------------- */

export function PlumbingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Plumbing Permit Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
          <p><strong>PP No:</strong> {selectedApplication.pp_no}</p>
          <p><strong>Building Permit No:</strong> {selectedApplication.building_permit_no}</p>
          <p><strong>Scope of Work:</strong> {selectedApplication.scope_of_work}</p>
          {selectedApplication.other_scope_specify && (
            <p><strong>Other Scope:</strong> {selectedApplication.other_scope_specify}</p>
          )}
          <p><strong>Form of Ownership:</strong> {selectedApplication.form_of_ownership}</p>
          <p><strong>Use/Character:</strong> {selectedApplication.use_or_character}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Status:</strong> {selectedApplication.status}</p>
          <p><strong>Email:</strong> {selectedApplication.email}</p>
          <p><strong>Telephone:</strong> {selectedApplication.telephone_no}</p>
          <p><strong>Application Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Applicant Information</h4>
        <p><strong>Name:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.middle_initial || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
        <p><strong>Telephone:</strong> {selectedApplication.telephone_no || 'N/A'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Address/Location</h4>
        <p><strong>Address:</strong> {`${selectedApplication.address_no || ''} ${selectedApplication.address_street || ''}, Brgy. ${selectedApplication.address_barangay || ''}, ${selectedApplication.address_city || ''} ${selectedApplication.address_zip_code || ''}`}</p>
        <p><strong>Location:</strong> {`${selectedApplication.location_street || ''}, Lot ${selectedApplication.location_lot_no || ''}, Blk ${selectedApplication.location_blk_no || ''}, TCT ${selectedApplication.location_tct_no || ''}, Tax Dec ${selectedApplication.location_tax_dec_no || ''}`}</p>
      </div>

      {/* NEW: files & comments */}
      <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Plumbing Permit" }} />
    </div>
  );
}

export function ElectronicsPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Electronics Permit Information</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
        <p><strong>EP No:</strong> {selectedApplication.ep_no}</p>
        <p><strong>Building Permit No:</strong> {selectedApplication.building_permit_no}</p>
        <p><strong>Scope of Work:</strong> {selectedApplication.scope_of_work}</p>
        <p><strong>Form of Ownership:</strong> {selectedApplication.form_of_ownership}</p>
        <p><strong>Use/Character:</strong> {selectedApplication.use_or_character}</p>
      </div>
      <div className="space-y-2">
        <p><strong>Status:</strong> {selectedApplication.status}</p>
        <p><strong>Email:</strong> {selectedApplication.email}</p>
        <p><strong>Telephone:</strong> {selectedApplication.telephone_no}</p>
        <p><strong>Application Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
      </div>
    </div>

    <div className="bg-green-100 p-4 rounded-md">
      <h4 className="text-md font-semibold mb-2 text-gray-700">Applicant Information</h4>
      <p><strong>Name:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.middle_initial || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
      <p><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
      <p><strong>Telephone:</strong> {selectedApplication.telephone_no || 'N/A'}</p>
    </div>

    <div className="bg-blue-100 p-4 rounded-md">
      <h4 className="text-md font-semibold mb-2 text-gray-700">Address/Location</h4>
      <p><strong>Address:</strong> {`${selectedApplication.address_no || ''} ${selectedApplication.address_street || ''}, Brgy. ${selectedApplication.address_barangay || ''}, ${selectedApplication.address_city || ''} ${selectedApplication.address_zip_code || ''}`}</p>
      <p><strong>Location:</strong> {`${selectedApplication.location_street || ''} ${selectedApplication.location_lot_no ? ' • Lot ' + selectedApplication.location_lot_no : ''}${selectedApplication.location_blk_no ? ' • Blk ' + selectedApplication.location_blk_no : ''}${selectedApplication.location_tct_no ? ' • TCT ' + selectedApplication.location_tct_no : ''}${selectedApplication.location_tax_dec_no ? ' • Tax Dec ' + selectedApplication.location_tax_dec_no : ''}`}</p>
    </div>

    {/* NEW: files & comments */}
    <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Electronics Permit" }} />
  </div>
  );
}

export function BuildingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Building Permit Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
          <p><strong>Building Permit No:</strong> {selectedApplication.building_permit_no}</p>
          <p><strong>Use/Character:</strong> {selectedApplication.use_or_character}</p>
          <p><strong>Form of Ownership:</strong> {selectedApplication.form_of_ownership}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Status:</strong> {selectedApplication.status}</p>
          <p><strong>Email:</strong> {selectedApplication.email}</p>
          <p><strong>Telephone:</strong> {selectedApplication.telephone_no}</p>
          <p><strong>Application Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Applicant Information</h4>
        <p><strong>Name:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.middle_initial || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
        <p><strong>Telephone:</strong> {selectedApplication.telephone_no || 'N/A'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Address/Location</h4>
        <p><strong>Address:</strong> {`${selectedApplication.address_no || ''} ${selectedApplication.address_street || ''}, Brgy. ${selectedApplication.address_barangay || ''}, ${selectedApplication.address_city || ''} ${selectedApplication.address_zip_code || ''}`}</p>
        <p><strong>Location:</strong> {`${selectedApplication.location_street || ''}${selectedApplication.location_lot_no ? ', Lot ' + selectedApplication.location_lot_no : ''}${selectedApplication.location_blk_no ? ', Blk ' + selectedApplication.location_blk_no : ''}`}</p>
      </div>

      {/* NEW: files & comments */}
      <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Building Permit" }} />
    </div>
  );
}

export function FencingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Fencing Permit Information</h3>

      <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Application No:</strong> {selectedApplication.application_no}</p>
          <p><strong>FP No:</strong> {selectedApplication.fp_no}</p>
          <p><strong>Building Permit No:</strong> {selectedApplication.building_permit_no}</p>
          <p><strong>Scope of Work:</strong> {selectedApplication.scope_of_work}</p>
          <p><strong>Ownership Form:</strong> {selectedApplication.ownership_form || selectedApplication.form_of_ownership}</p>
          <p><strong>Use/Character:</strong> {selectedApplication.use_or_character}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Status:</strong> {selectedApplication.status}</p>
          <p><strong>Email:</strong> {selectedApplication.email}</p>
          <p><strong>Telephone:</strong> {selectedApplication.telephone_no}</p>
          <p><strong>Application Date:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Applicant Information</h4>
        <p><strong>Name:</strong> {`${selectedApplication.first_name || ''} ${selectedApplication.middle_initial || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}</p>
        <p><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
        <p><strong>Telephone:</strong> {selectedApplication.telephone_no || 'N/A'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">Address/Location</h4>
        <p><strong>Address:</strong> {`${selectedApplication.address_no || ''} ${selectedApplication.street || selectedApplication.address_street || ''}, Brgy. ${selectedApplication.barangay || selectedApplication.address_barangay || ''}, ${selectedApplication.city_municipality || selectedApplication.address_city || ''} ${selectedApplication.zip_code || selectedApplication.address_zip_code || ''}`}</p>
        <p><strong>Location:</strong> {`${selectedApplication.location_street || ''}${selectedApplication.lot_no ? ', Lot ' + selectedApplication.lot_no : ''}${selectedApplication.block_no1 ? ', Blk ' + selectedApplication.block_no1 : ''}${selectedApplication.block_no2 ? '–' + selectedApplication.block_no2 : ''}${selectedApplication.tax_dec_no ? ', Tax Dec ' + selectedApplication.tax_dec_no : ''}`}</p>
      </div>

      {/* NEW: files & comments */}
      <AttachedRequirementsPanel selectedApplication={{ ...selectedApplication, type: "Fencing Permit" }} />
    </div>
  );
}
