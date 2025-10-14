import { useState } from "react";
import axios from "axios";

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
      formData.append("requirement", requirementPDF); // ✅ field name matches backend

      const res = await axios.post(
        "http://localhost:8081/api/upload-requirement", // ✅ route from your backend
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.success) {
        alert("Requirement uploaded successfully.");
        onClose(); // Close modal after success
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

export function CedulaModalContent({ selectedApplication }) {
  return (
    <div className="bg-indigo-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cedula Information</h3>
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
    </div>
  );
}

//ElectricalPermitModalContent
export function ElectricalPermitModalContent({ selectedApplication }) {
  const [showUpload, setShowUpload] = useState(false);
  const [requirementPDF, setRequirementPDF] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setRequirementPDF(file);
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleCancel = () => {
    setRequirementPDF(null);
    setShowUpload(false);
  };

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

      {/* Upload Toggle */}
      {!showUpload && (
        <button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
        >
          Attach Requirements (PDF)
        </button>
      )}

      {/* Upload Area */}
      {showUpload && (
        <div className="bg-blue-50 p-4 rounded-md mt-2 space-y-3">
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
            <p className="text-sm text-gray-700">
              ✅ Attached: <span className="font-semibold">{requirementPDF.name}</span>
            </p>
          )}

          <button
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export function BusinessPermitModalContent({ selectedApplication }) {
  const [showUpload, setShowUpload] = useState(false);
  const [requirementPDF, setRequirementPDF] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setRequirementPDF(file);
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleCancel = () => {
    setRequirementPDF(null);
    setShowUpload(false);
  };

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

        {/* Upload */}
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
          >
            Attach Requirements (PDF)
          </button>
        )}

        {showUpload && (
          <div className="bg-blue-50 p-4 rounded-md mt-2 space-y-3">
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
              <p className="text-sm text-gray-700">
                ✅ Attached: <span className="font-semibold">{requirementPDF.name}</span>
              </p>
            )}

            <button
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 📂 Display Uploaded Requirements */}
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
          ].map((doc, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- NEW MODAL CONTENTS (no style/function changes to your existing ones) ---------------- */

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
    </div>
  );
}
