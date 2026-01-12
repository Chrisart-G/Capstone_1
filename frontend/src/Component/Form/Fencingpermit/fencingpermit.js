// src/Component/Form/fencingpermit/FencingPermitForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

const FencingPermitForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleInitial: '',
    tin: '',
    constructionOwnership: '',
    ownershipForm: '',
    useOrCharacter: '',
    addressNo: '',
    street: '',
    barangay: '',             // manual
    cityMunicipality: '',
    zipCode: '',
    telephoneNo: '',
    locationStreet: '',
    lotNo: '',
    blockNo1: '',
    blockNo2: '',
    taxDecNo: '',
    locationBarangay: '',
    locationCity: '',
    scopeOfWork: '',
    otherScopeSpecify: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // NEW: draft + modals state
  const [draftStatus, setDraftStatus] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  /* ================== AUTO-FILL USER INFO ================== */
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUserInfo(true);
      try {
        const res = await fetch('http://localhost:8081/api/user-info-fencing', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn('Failed to fetch fencing user info, status:', res.status);
          return;
        }

        const data = await res.json();
        if (!data.success || !data.userInfo) {
          console.warn('Fencing user info success=false or no userInfo payload');
          return;
        }

        const ui = data.userInfo;

        setFormData(prev => ({
          ...prev,
          lastName: ui.lastName || prev.lastName,
          firstName: ui.firstName || prev.firstName,
          middleInitial: ui.middleInitial || prev.middleInitial,
          street: ui.street || prev.street,
          // barangay is manual – keep as-is if user already typed
          cityMunicipality: ui.cityMunicipality || prev.cityMunicipality || 'Hinigaran',
          telephoneNo: ui.telephoneNo || ui.phoneNumber || prev.telephoneNo,
        }));
      } catch (err) {
        console.error('Error fetching fencing user info:', err);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  /* ================== LOAD DRAFT FROM LOCALSTORAGE ================== */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fencingPermitDraft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          ...parsed,
        }));
        setDraftStatus('Loaded saved draft.');
      }
    } catch (err) {
      console.error('Error loading fencing draft:', err);
    }
  }, []);

  /* ================== HELPERS ================== */
  const handleInputChange = (field, value) => {
    setError('');
    setSuccess('');
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'scopeOfWork' && value !== 'others'
        ? { otherScopeSpecify: '' }
        : {}),
    }));
  };

  const validateForm = () => {
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!formData.scopeOfWork || formData.scopeOfWork === '') {
      setError('Please select a valid scope of work');
      return false;
    }

    if (formData.scopeOfWork === 'others' && !formData.otherScopeSpecify.trim()) {
      setError('Please specify the scope of work when selecting "Others"');
      return false;
    }

    return true;
  };

  /* ================== SAVE AS DRAFT ================== */
  const handleSaveDraft = () => {
    try {
      localStorage.setItem('fencingPermitDraft', JSON.stringify(formData));
      setDraftStatus('Draft saved locally on this device.');
    } catch (err) {
      console.error('Error saving fencing draft:', err);
      setDraftStatus('Failed to save draft. Please check browser storage settings.');
    }
  };

  /* ================== SUBMIT LOGIC (USED BY CONFIRM MODAL) ================== */
  const submitForm = async () => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8081/api/fencing-permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit application');
      }

      setSuccess(
        `Application submitted successfully! Your application number is: ${data.data.applicationNo}`
      );
      setIsSuccessModalOpen(true);
      setIsReviewOpen(false);
      setIsConfirmOpen(false);

      // Clear draft on successful submit
      localStorage.removeItem('fencingPermitDraft');
      setDraftStatus('');

      return true;
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while submitting the application');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================== BUTTON HANDLERS ================== */
  const handleReviewClick = () => {
    if (validateForm()) {
      setIsReviewOpen(true);
    }
  };

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    await submitForm();
  };

  /* ================== RENDER ================== */
  return (
    <div>
      <Uheader />
      <div className="min-h-screen bg-gray-100 p-4">
        {/* Main Form Container */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Logo and Title Section */}
          <div className="text-center py-6 border-b">
            <div className="flex justify-center items-center">
              <img src="img/logo.png" alt="" className="w-40 h-30" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              FENCING PERMIT FORM
            </h1>
          </div>

          {/* Alert Messages */}
          {error && (
            <div
              className="mx-6 mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && !isSuccessModalOpen && (
            <div
              className="mx-6 mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Draft status */}
          {draftStatus && (
            <div className="mx-6 mt-3 text-xs text-gray-600 italic">
              {draftStatus}
            </div>
          )}

          {/* Information Note */}
          <div className="mx-6 mt-6 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Application numbers (APPLICATION NO., FP
              NO., and BUILDING PERMIT NO.) will be automatically generated upon
              successful submission.
            </p>
          </div>

          {/* OWNER / APPLICANT */}
          <div className="bg-blue-600 text-white px-6 py-3 mt-6">
            <h2 className="text-lg font-bold">OWNER / APPLICANT</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* LAST NAME */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  LAST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="Last Name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* FIRST NAME */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  FIRST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="First Name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* M.I */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  M.I
                </label>
                <input
                  type="text"
                  value={formData.middleInitial}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="Middle Initial"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* TIN */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  TIN
                </label>
                <input
                  type="text"
                  value={formData.tin}
                  onChange={e => handleInputChange('tin', e.target.value)}
                  placeholder="TIN #"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  FOR CONSTRUCTION OWNED
                </label>
                <input
                  type="text"
                  value={formData.constructionOwnership}
                  onChange={e =>
                    handleInputChange('constructionOwnership', e.target.value)
                  }
                  placeholder="For Construction Owned"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  FORM OF OWNERSHIP
                </label>
                <input
                  type="text"
                  value={formData.ownershipForm}
                  onChange={e =>
                    handleInputChange('ownershipForm', e.target.value)
                  }
                  placeholder="Form Of Ownership"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  USE OR CHARACTER OF OCCUPANCY
                </label>
                <input
                  type="text"
                  value={formData.useOrCharacter}
                  onChange={e =>
                    handleInputChange('useOrCharacter', e.target.value)
                  }
                  placeholder="Use or character of occupancy"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  NO.
                </label>
                <input
                  type="text"
                  value={formData.addressNo}
                  onChange={e => handleInputChange('addressNo', e.target.value)}
                  placeholder="No."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  STREET
                </label>
                <input
                  type="text"
                  value={formData.street}
                  readOnly
                  placeholder="Street"
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  BARANGAY
                </label>
                <input
                  type="text"
                  value={formData.barangay}
                  onChange={e => handleInputChange('barangay', e.target.value)}
                  placeholder="Barangay"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  CITY / MUNICIPALITY
                </label>
                <input
                  type="text"
                  value={formData.cityMunicipality}
                  readOnly
                  placeholder="City/Municipality"
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  ZIP CODE
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={e => handleInputChange('zipCode', e.target.value)}
                  placeholder="Zipcode"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-1" />
            </div>

            {/* Telephone No. */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                TELEPHONE NO.
              </label>
              <input
                type="text"
                value={formData.telephoneNo}
                readOnly
                className="w-full max-w-md p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                placeholder="Telephone no."
              />
              <p className="text-xs text-gray-500 mt-1">
                * Auto-filled from your account information (phone number)
              </p>
            </div>
          </div>

          {/* LOCATION OF CONSTRUCTION Section */}
          <div className="bg-blue-600 text-white px-6 py-3">
            <h2 className="text-lg font-bold">LOCATION OF CONSTRUCTION:</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  STREET
                </label>
                <input
                  type="text"
                  value={formData.locationStreet}
                  onChange={e =>
                    handleInputChange('locationStreet', e.target.value)
                  }
                  placeholder="Street"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  LOT NO.
                </label>
                <input
                  type="text"
                  value={formData.lotNo}
                  onChange={e => handleInputChange('lotNo', e.target.value)}
                  placeholder="Lotno."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  BLK NO.
                </label>
                <input
                  type="text"
                  value={formData.blockNo1}
                  onChange={e => handleInputChange('blockNo1', e.target.value)}
                  placeholder="Blkno."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  BLK NO.
                </label>
                <input
                  type="text"
                  value={formData.blockNo2}
                  onChange={e => handleInputChange('blockNo2', e.target.value)}
                  placeholder="Blkno."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  TAX DEC. NO.
                </label>
                <input
                  type="text"
                  value={formData.taxDecNo}
                  onChange={e => handleInputChange('taxDecNo', e.target.value)}
                  placeholder="Taxdec.no."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  BARANGAY
                </label>
                <input
                  type="text"
                  value={formData.locationBarangay}
                  onChange={e =>
                    handleInputChange('locationBarangay', e.target.value)
                  }
                  placeholder="Barangay"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  CITY / MUNICIPALITY
                </label>
                <input
                  type="text"
                  value={formData.locationCity}
                  onChange={e =>
                    handleInputChange('locationCity', e.target.value)
                  }
                  placeholder="City/Municipality"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Scope of Work Section */}
          <div className="bg-blue-600 text-white px-6 py-3">
            <h2 className="text-lg font-bold">SCOPE OF WORK</h2>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-gray-700">
                SELECT SCOPE OF WORK <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.scopeOfWork}
                onChange={e => handleInputChange('scopeOfWork', e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">-- Select an Option --</option>
                <option value="new-construction">NEW CONSTRUCTION</option>
                <option value="erection">ERECTION</option>
                <option value="addition">ADDITION</option>
                <option value="repair">REPAIR</option>
                <option value="demolition">DEMOLITION</option>
                <option value="others">OTHERS</option>
              </select>
            </div>

            {formData.scopeOfWork === 'others' && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Please specify: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.otherScopeSpecify}
                  onChange={e =>
                    handleInputChange('otherScopeSpecify', e.target.value)
                  }
                  placeholder="Specify other scope of work"
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Bottom buttons */}
            <div className="flex justify-between items-center mt-8">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="bg-yellow-500 text-white px-6 py-3 rounded hover:bg-yellow-600"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={handleReviewClick}
                  disabled={isSubmitting || isLoadingUserInfo}
                  className={`px-6 py-3 rounded text-white ${
                    isSubmitting || isLoadingUserInfo
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Review & Submit'}
                </button>
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-600">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Review Fencing Permit Application</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500">Last Name</p>
                <p className="font-semibold">{formData.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500">First Name</p>
                <p className="font-semibold">{formData.firstName}</p>
              </div>
              <div>
                <p className="text-gray-500">Middle Initial</p>
                <p className="font-semibold">{formData.middleInitial}</p>
              </div>
              <div>
                <p className="text-gray-500">TIN</p>
                <p className="font-semibold">{formData.tin}</p>
              </div>

              <div>
                <p className="text-gray-500">Construction Ownership</p>
                <p className="font-semibold">{formData.constructionOwnership}</p>
              </div>
              <div>
                <p className="text-gray-500">Form of Ownership</p>
                <p className="font-semibold">{formData.ownershipForm}</p>
              </div>
              <div>
                <p className="text-gray-500">Use / Character</p>
                <p className="font-semibold">{formData.useOrCharacter}</p>
              </div>

              <div>
                <p className="text-gray-500">Owner Address</p>
                <p className="font-semibold">
                  {formData.addressNo} {formData.street}, {formData.barangay},{' '}
                  {formData.cityMunicipality} {formData.zipCode}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Telephone No.</p>
                <p className="font-semibold">{formData.telephoneNo}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500">Location of Construction</p>
                <p className="font-semibold">
                  {formData.locationStreet} | Lot {formData.lotNo} | Blk{' '}
                  {formData.blockNo1} {formData.blockNo2 && `& ${formData.blockNo2}`} | Tax
                  Dec No. {formData.taxDecNo}
                </p>
                <p className="font-semibold">
                  {formData.locationBarangay}, {formData.locationCity}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500">Scope of Work</p>
                <p className="font-semibold">
                  {formData.scopeOfWork === 'others'
                    ? `OTHERS – ${formData.otherScopeSpecify}`
                    : formData.scopeOfWork}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsReviewOpen(false)}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleOpenConfirm}
                className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Confirm Submission</h3>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to submit this fencing permit application?
              Once submitted, changes can only be made by coordinating with the
              municipal office.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL – redirects to /Docutracker */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-700 mb-4">
              Your fencing permit application has been submitted successfully.
            </p>
            {success && (
              <p className="text-xs text-gray-600 mb-4">{success}</p>
            )}
            <div className="flex justify-end">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/Docutracker');
                }}
              >
                Go to Document Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      <UFooter />
    </div>
  );
};

export default FencingPermitForm;
