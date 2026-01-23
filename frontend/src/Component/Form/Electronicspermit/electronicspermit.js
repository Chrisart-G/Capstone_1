import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react'; // still here even if unused, safe
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

const DRAFT_KEY = 'electronics_permit_draft_v1';

/* ✅ Keep outside to prevent focus loss */
const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
  className = "",
  readOnly = false,
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      maxLength={name === 'middleInitial' ? 1 : undefined}
      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      title={readOnly ? 'Auto-filled from your account information' : undefined}
    />
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    {readOnly && (
      <p className="text-[10px] text-gray-500 mt-1">
        * Auto-filled from your account information
      </p>
    )}
  </div>
);

const ReviewModal = ({ open, onClose, onSubmit, formData }) => {
  if (!open) return null;

  const Row = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 whitespace-pre-wrap break-words">
        {value?.trim?.() ? value : '—'}
      </span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-2">
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Review Application</h2>
              <p className="text-xs text-gray-500">Please verify all details before submitting.</p>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
              type="button"
            >
              Close
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
            <Section title="OWNER / APPLICANT">
              <Row label="Last Name" value={formData.lastName} />
              <Row label="First Name" value={formData.firstName} />
              <Row label="M.I" value={formData.middleInitial} />
              <Row label="TIN" value={formData.tin} />
              <Row label="For Construction Owned" value={formData.forConstructionOwned} />
              <Row label="Form of Ownership" value={formData.formOfOwnership} />
              <Row label="Use/Character of Occupancy" value={formData.useOrCharacter} />
            </Section>

            <Section title="OWNER ADDRESS">
              <Row label="No." value={formData.ownerNo} />
              <Row label="Street" value={formData.ownerStreet} />
              <Row label="Barangay" value={formData.ownerBarangay} />
              <Row label="City/Municipality" value={formData.ownerCity} />
              <Row label="Zip Code" value={formData.ownerZipCode} />
              <Row label="Telephone No." value={formData.telephoneNo} />
            </Section>

            <Section title="LOCATION OF CONSTRUCTION">
              <Row label="Lot No." value={formData.lotNo} />
              <Row label="Blk No." value={formData.blkNo} />
              <Row label="TCT No." value={formData.tctNo} />
              <Row label="Current Tax Dec. No." value={formData.currentTaxDecNo} />
              <Row label="Street" value={formData.constructionStreet} />
              <Row label="Barangay" value={formData.constructionBarangay} />
              <Row label="City/Municipality" value={formData.constructionCity} />
            </Section>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2">
                <h3 className="font-semibold text-sm">SCOPE OF WORK</h3>
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                  Describe Scope of Work
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                  {formData.scopeOfWork?.trim() ? formData.scopeOfWork : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ElectronicsPermitForm = () => {
  const [formData, setFormData] = useState({
    // Owner/Applicant fields
    lastName: '',
    firstName: '',
    middleInitial: '',
    tin: '',
    forConstructionOwned: '',
    formOfOwnership: '',
    useOrCharacter: '',

    // Address fields
    ownerNo: '',
    ownerStreet: '',
    ownerBarangay: '',
    ownerCity: '',
    ownerZipCode: '',
    telephoneNo: '',

    // Location of Construction fields
    lotNo: '',
    blkNo: '',
    tctNo: '',
    currentTaxDecNo: '',
    constructionStreet: '',
    constructionBarangay: '',
    constructionCity: '',

    // Scope of work
    scopeOfWork: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill states
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [autoFillError, setAutoFillError] = useState('');

  // Draft + Review UI
  const [draftMessage, setDraftMessage] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    // ✅ Load draft first (if any)
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const { savedAt, ...draftData } = parsed;
          setFormData(prev => ({ ...prev, ...draftData }));
          setDraftMessage(savedAt ? `Draft loaded (saved ${new Date(savedAt).toLocaleString()})` : 'Draft loaded.');
          setTimeout(() => setDraftMessage(''), 4000);
        }
      }
    } catch (e) {
      // ignore invalid draft
    }

    const fetchUserInfoForElectronics = async () => {
      setIsLoadingUserInfo(true);
      setAutoFillError('');

      try {
        const response = await fetch('http://localhost:8081/api/user-info-electronics', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.userInfo) {
            const ui = data.userInfo;

            setFormData(prev => ({
              ...prev,
              lastName: ui.lastName || prev.lastName,
              firstName: ui.firstName || prev.firstName,
              middleInitial: ui.middleInitial || prev.middleInitial,
              ownerStreet: ui.ownerStreet || prev.ownerStreet,
              // ownerBarangay is manual
              ownerCity: ui.ownerCity || prev.ownerCity,
              telephoneNo: ui.telephoneNo || prev.telephoneNo
            }));
          } else {
            setAutoFillError(data.message || 'Could not auto-fill your information.');
          }
        } else if (response.status === 401) {
          setAutoFillError('Please log in to auto-fill your information.');
        } else {
          setAutoFillError('Failed to load your profile information for auto-fill.');
        }
      } catch (err) {
        console.error('Error fetching user info for electronics:', err);
        setAutoFillError('Unable to auto-fill your information. You can still complete the form manually.');
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfoForElectronics();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'middleInitial' ? value.slice(0, 1) : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      'lastName', 'firstName', 'tin', 'forConstructionOwned',
      'formOfOwnership', 'useOrCharacter', 'ownerStreet',
      'ownerBarangay', 'ownerCity', 'telephoneNo', 'scopeOfWork'
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.telephoneNo && !/^[\d\s\-\+\(\)]+$/.test(formData.telephoneNo)) {
      newErrors.telephoneNo = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Extracted submit logic so Review modal can submit too
  const submitApplication = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8081/api/electronics-permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Clear draft on successful submit
        localStorage.removeItem(DRAFT_KEY);

        alert('Electronics permit application submitted successfully!');
        console.log('Submission response:', data);
        window.location.href = '/Docutracker';
      } else {
        alert(data.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitApplication();
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          ...formData,
          savedAt: new Date().toISOString(),
        })
      );
      setDraftMessage('Draft saved successfully.');
      setTimeout(() => setDraftMessage(''), 3000);
    } catch (e) {
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleReview = () => {
    // validate first so review doesn’t hide missing required fields
    if (!validateForm()) {
      alert('Please fill in all required fields correctly before reviewing.');
      return;
    }
    setReviewOpen(true);
  };

  return (
    <div>
      <Uheader />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Form Header */}
            <div className="text-center py-6 border-b">
              <div className="flex justify-center items-center">
                <img src="img/logo.png" alt="" className="w-40 h-30" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ELECTRONICS PERMIT FORM</h1>
            </div>

            <div className="p-6 space-y-8">
              {/* Draft message */}
              {draftMessage && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded">
                  {draftMessage}
                </div>
              )}

              {/* Auto-fill status */}
              {(isLoadingUserInfo || autoFillError) && (
                <div>
                  {isLoadingUserInfo && (
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      <span>Loading your profile information...</span>
                    </div>
                  )}
                  {autoFillError && !isLoadingUserInfo && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded">
                      {autoFillError}
                    </div>
                  )}
                </div>
              )}

              {/* Owner/Applicant Section */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">OWNER / APPLICANT</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="LAST NAME" name="lastName" placeholder="Last Name" required readOnly
                  value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
                <InputField label="FIRST NAME" name="firstName" placeholder="First Name" required readOnly
                  value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
                <InputField label="M.I" name="middleInitial" placeholder="M" readOnly
                  value={formData.middleInitial} onChange={handleInputChange} error={errors.middleInitial} />
                <InputField label="TIN" name="tin" placeholder="TIN #" required
                  value={formData.tin} onChange={handleInputChange} error={errors.tin} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InputField label="FOR CONSTRUCTION OWNED" name="forConstructionOwned" placeholder="For Construction Owned" required
                  value={formData.forConstructionOwned} onChange={handleInputChange} error={errors.forConstructionOwned} />
                <InputField label="FORM OF OWNERSHIP" name="formOfOwnership" placeholder="Form Of Ownership" required
                  value={formData.formOfOwnership} onChange={handleInputChange} error={errors.formOfOwnership} />
                <InputField label="USE OR CHARACTER OF OCCUPANCY" name="useOrCharacter" placeholder="Use or character of occupancy" required
                  value={formData.useOrCharacter} onChange={handleInputChange} error={errors.useOrCharacter} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <InputField label="NO." name="ownerNo" placeholder="No."
                  value={formData.ownerNo} onChange={handleInputChange} error={errors.ownerNo} />
                <InputField label="STREET" name="ownerStreet" placeholder="Street" required readOnly
                  value={formData.ownerStreet} onChange={handleInputChange} error={errors.ownerStreet} />
                <InputField label="BARANGAY" name="ownerBarangay" placeholder="Barangay" required readOnly={false}
                  value={formData.ownerBarangay} onChange={handleInputChange} error={errors.ownerBarangay} />
                <InputField label="CITY / MUNICIPALITY" name="ownerCity" placeholder="City/Municipality" required readOnly
                  value={formData.ownerCity} onChange={handleInputChange} error={errors.ownerCity} />
                <InputField label="ZIP CODE" name="ownerZipCode" placeholder="Zipcode"
                  value={formData.ownerZipCode} onChange={handleInputChange} error={errors.ownerZipCode} />
              </div>

              <div className="flex justify-center">
                <InputField label="TELEPHONE NO." name="telephoneNo" placeholder="Telephone no." required className="w-full max-w-sm" readOnly
                  value={formData.telephoneNo} onChange={handleInputChange} error={errors.telephoneNo} />
              </div>

              {/* Location of Construction Section */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">LOCATION OF CONSTRUCTION:</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="LOT NO." name="lotNo" placeholder="Lot no."
                  value={formData.lotNo} onChange={handleInputChange} error={errors.lotNo} />
                <InputField label="BLK NO." name="blkNo" placeholder="Blk no."
                  value={formData.blkNo} onChange={handleInputChange} error={errors.blkNo} />
                <InputField label="TCT NO." name="tctNo" placeholder="Tct no."
                  value={formData.tctNo} onChange={handleInputChange} error={errors.tctNo} />
                <InputField label="CURRENT TAX DEC. NO." name="currentTaxDecNo" placeholder="Current tax dec. no."
                  value={formData.currentTaxDecNo} onChange={handleInputChange} error={errors.currentTaxDecNo} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InputField label="STREET" name="constructionStreet" placeholder="Street"
                  value={formData.constructionStreet} onChange={handleInputChange} error={errors.constructionStreet} />
                <InputField label="BARANGAY" name="constructionBarangay" placeholder="Barangay"
                  value={formData.constructionBarangay} onChange={handleInputChange} error={errors.constructionBarangay} />
                <InputField label="CITY / MUNICIPALITY" name="constructionCity" placeholder="City/Municipality"
                  value={formData.constructionCity} onChange={handleInputChange} error={errors.constructionCity} />
              </div>

              {/* Scope of Work */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">SCOPE OF WORK</h2>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  DESCRIBE SCOPE OF WORK <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleInputChange}
                  placeholder="Describe all electronics work to be done. You can list multiple items, one per line or separated by commas."
                  className={`w-full px-3 py-2 border rounded-md min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.scopeOfWork ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.scopeOfWork && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.scopeOfWork}
                  </span>
                )}
                <p className="text-[11px] text-gray-500 mt-1">
                  You can type as much as you need here.
                </p>
              </div>

              {/* ✅ Buttons: Save Draft + Review + Submit */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className={`px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={handleReview}
                  disabled={isSubmitting || isLoadingUserInfo}
                  className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting || isLoadingUserInfo ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Review
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoadingUserInfo}
                  className={`px-8 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting || isLoadingUserInfo ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>

              {/* Review Modal */}
              <ReviewModal
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
                onSubmit={submitApplication}
                formData={formData}
              />
            </div>
          </div>
        </main>
      </div>
      <UFooter />
    </div>
  );
};

export default ElectronicsPermitForm;
