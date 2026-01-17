import React, { useState, useEffect } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

function CedulaPermitForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    placeOfBirth: '',
    dateOfBirth: '',
    profession: '',
    yearlyIncome: '',
    purpose: '',
    sex: '',
    status: '',
    tin: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-fill states
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    email: '',
    phoneNumber: '',
  });
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // New states for draft + modals
  const [draftLoading, setDraftLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Fetch user info for auto-fill
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUserInfo(true);
      try {
        const response = await fetch('http://localhost:8081/api/user-info-cedula', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const userData = data.userInfo;
            setUserInfo(userData);

            // Auto-fill the form with user data (name & address)
            setFormData((prevData) => ({
              ...prevData,
              name: userData.name,
              address: userData.address,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Load saved draft, if any
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/cedula/draft', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.draft) {
          setFormData((prev) => ({
            ...prev,
            ...data.draft,
          }));
        }
      } catch (err) {
        console.error('Error loading cedula draft:', err);
      }
    };

    fetchDraft();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Existing submit logic – now with redirect to /Docutracker on success
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8081/api/cedula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Cedula application submitted successfully!');
        // Reset form but keep auto-filled data
        setFormData({
          name: userInfo.name,
          address: userInfo.address,
          placeOfBirth: '',
          dateOfBirth: '',
          profession: '',
          yearlyIncome: '',
          purpose: '',
          sex: '',
          status: '',
          tin: '',
        });

        // 🔹 NEW: go to Docutracker after successful submission
        window.location.href = '/Docutracker';
      } else {
        setMessage(data.message || 'An error occurred while submitting the form.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = () => {
    setMessage('');
    setIsReviewModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (loading) return;
    setIsConfirmModalOpen(false);
    await handleSubmit({ preventDefault: () => {} });
  };

  const handleSaveDraft = async () => {
    if (draftLoading || loading) return;
    setDraftLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8081/api/cedula/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Cedula draft saved successfully!');
      } else {
        setMessage(data.message || 'Failed to save draft.');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setMessage('Network error while saving draft. Please try again.');
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <>
      <Uheader />
      <div className="max-w-4xl mx-auto p-8 relative">
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {isLoadingUserInfo && (
          <div className="flex justify-center items-center py-4 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading user information...</span>
          </div>
        )}

        <form className="bg-gray-50 rounded-lg shadow-lg grid grid-cols-2 gap-6 p-8">
          <h2 className="col-span-2 text-3xl font-bold text-center text-gray-800 mb-6">
            Cedula Permit Form
          </h2>

          {/* Name field - Read-only */}
          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              readOnly
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 cursor-not-allowed"
              title="This field is auto-filled from your account information and cannot be edited"
            />
            <p className="text-xs text-gray-500 mt-1">
              * Auto-filled from your account information
            </p>
          </div>

          {/* Address field - Read-only */}
          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              readOnly
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 cursor-not-allowed"
              title="This field is auto-filled from your account information and cannot be edited"
            />
            <p className="text-xs text-gray-500 mt-1">
              * Auto-filled from your account information
            </p>
          </div>

          {/* Other editable fields */}
          {[
            { label: 'Place of Birth', name: 'placeOfBirth', type: 'text' },
            { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
            { label: 'Profession', name: 'profession', type: 'text' },
            { label: 'Yearly Income', name: 'yearlyIncome', type: 'number' },
            { label: 'Purpose', name: 'purpose', type: 'text' },
            { label: 'TIN', name: 'tin', type: 'text' },
          ].map((field, index) => (
            <div className="mb-4" key={index}>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor={field.name}
              >
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                required
                disabled={loading}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          ))}

          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="sex">
              Sex:
            </label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              disabled={loading}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
              Status:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          {/* Buttons: Save as Draft + Review & Submit */}
          <div className="col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={draftLoading || loading || isLoadingUserInfo}
              className={`w-full sm:w-1/2 py-3 font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition duration-200 ${
                draftLoading || loading || isLoadingUserInfo
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {draftLoading ? 'Saving Draft...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={handleOpenReview}
              disabled={loading || isLoadingUserInfo}
              className={`w-full sm:w-1/2 py-3 font-semibold rounded-lg transition duration-200 ${
                loading || isLoadingUserInfo
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Review &amp; Submit
            </button>
          </div>
        </form>

        {/* Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Review Your Cedula Details</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="text-gray-800 text-right">{formData.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Address:</span>
                  <span className="text-gray-800 text-right">{formData.address || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Place of Birth:</span>
                  <span className="text-gray-800 text-right">
                    {formData.placeOfBirth || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Date of Birth:</span>
                  <span className="text-gray-800 text-right">
                    {formData.dateOfBirth || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Profession:</span>
                  <span className="text-gray-800 text-right">
                    {formData.profession || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Yearly Income:</span>
                  <span className="text-gray-800 text-right">
                    {formData.yearlyIncome || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Purpose:</span>
                  <span className="text-gray-800 text-right">
                    {formData.purpose || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Sex:</span>
                  <span className="text-gray-800 text-right">{formData.sex || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="text-gray-800 text-right">{formData.status || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">TIN:</span>
                  <span className="text-gray-800 text-right">{formData.tin || '-'}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Back &amp; Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setIsConfirmModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  Proceed to Confirmation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-2">Confirm Submission</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to submit this Cedula application? Once submitted,
                you may need to contact the municipal office to correct any mistakes.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <UFooter />
    </>
  );
}

export default CedulaPermitForm;
