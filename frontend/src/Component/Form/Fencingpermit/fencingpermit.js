import React, { useState, useEffect } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

const FencingPermitForm = () => {
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
    barangay: '',
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

  // Auto-fill states
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [autoFillError, setAutoFillError] = useState('');

  // Fetch user info for fencing auto-fill
  useEffect(() => {
    const fetchUserInfoForFencing = async () => {
      setIsLoadingUserInfo(true);
      setAutoFillError('');

      try {
        const response = await fetch('http://localhost:8081/api/user-info-fencing', {
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
              street: ui.street || prev.street,
              barangay: ui.barangay || prev.barangay,
              cityMunicipality: ui.cityMunicipality || prev.cityMunicipality,
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
        console.error('Error fetching user info for fencing:', err);
        setAutoFillError('Unable to auto-fill your information. You can still fill the form manually.');
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfoForFencing();
  }, []);

  const handleInputChange = (field, value) => {
    // Clear messages when user starts typing
    setError('');
    setSuccess('');

    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset otherScopeSpecify if scope changes to non-others
      ...(field === 'scopeOfWork' && value !== 'others' ? { otherScopeSpecify: '' } : {})
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

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
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
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      if (data.success) {
        setSuccess(`Application submitted successfully! Your application number is: ${data.data.applicationNo}`);

        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            lastName: '',
            firstName: '',
            middleInitial: '',
            tin: '',
            constructionOwnership: '',
            ownershipForm: '',
            useOrCharacter: '',
            addressNo: '',
            street: '',
            barangay: '',
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
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 3000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while submitting the application');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Uheader/>
      <div className="min-h-screen bg-gray-100 p-4">

        {/* Main Form Container */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Logo and Title Section */}
          <div className="text-center py-6 border-b">
            <div className="flex justify-center items-center">
              <img src="img/logo.png" alt="" className="w-40 h-30"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">FENCING PERMIT FORM</h1>
          </div>

          {/* Auto-fill status message */}
          {(isLoadingUserInfo || autoFillError) && (
            <div className="mx-6 mt-4">
              {isLoadingUserInfo && (
                <div className="flex items-center text-xs text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                  <span>Loading your profile information...</span>
                </div>
              )}
              {autoFillError && !isLoadingUserInfo && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mt-1">
                  {autoFillError}
                </div>
              )}
            </div>
          )}

          {/* Alert Messages */}
          {error && (
            <div className="mx-6 mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Information Note */}
          <div className="mx-6 mt-6 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Application numbers (APPLICATION NO., FP NO., and BUILDING PERMIT NO.) will be automatically generated upon successful submission.
            </p>
          </div>

          {/* Owner/Applicant Section */}
          <div className="bg-blue-600 text-white px-6 py-3 mt-6">
            <h2 className="text-lg font-bold">OWNER / APPLICANT</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* LAST NAME (auto-filled, read-only) */}
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
                  title="This field is auto-filled from your account information"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* FIRST NAME (auto-filled, read-only) */}
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
                  title="This field is auto-filled from your account information"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* MIDDLE INITIAL (auto-filled, read-only if provided) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">M.I</label>
                <input
                  type="text"
                  value={formData.middleInitial}
                  readOnly
                  maxLength="5"
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="Middle Initial"
                  title="This field is auto-filled from your account information"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* TIN (user editable) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">TIN</label>
                <input
                  type="text"
                  value={formData.tin}
                  onChange={(e) => handleInputChange('tin', e.target.value)}
                  placeholder="TIN #"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">FOR CONSTRUCTION OWNED</label>
                <input
                  type="text"
                  value={formData.constructionOwnership}
                  onChange={(e) => handleInputChange('constructionOwnership', e.target.value)}
                  placeholder="For Construction Owned"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">FORM OF OWNERSHIP</label>
                <input
                  type="text"
                  value={formData.ownershipForm}
                  onChange={(e) => handleInputChange('ownershipForm', e.target.value)}
                  placeholder="Form Of Ownership"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">USE OR CHARACTER OF OCCUPANCY</label>
                <input
                  type="text"
                  value={formData.useOrCharacter}
                  onChange={(e) => handleInputChange('useOrCharacter', e.target.value)}
                  placeholder="Use or character of occupancy"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">NO.</label>
                <input
                  type="text"
                  value={formData.addressNo}
                  onChange={(e) => handleInputChange('addressNo', e.target.value)}
                  placeholder="No."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* STREET (auto-filled, read-only) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">STREET</label>
                <input
                  type="text"
                  value={formData.street}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="Street"
                  title="This field is auto-filled from your account information"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* BARANGAY (auto-filled, read-only) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">BARANGAY</label>
                <input
                  type="text"
                  value={formData.barangay}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="Barangay"
                  title="This field is auto-filled from your account information"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* CITY / MUNICIPALITY (auto-filled, read-only) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">CITY / MUNICIPALITY</label>
                <input
                  type="text"
                  value={formData.cityMunicipality}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                  placeholder="City/Municipality"
                  title="This field is auto-filled from your account information"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">ZIP CODE</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Zipcode"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-1"></div>
            </div>

            {/* TELEPHONE (auto-filled, read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-gray-700">TELEPHONE NO.</label>
              <input
                type="text"
                value={formData.telephoneNo}
                readOnly
                className="w-full max-w-md p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                placeholder="Telephone no."
                title="This field is auto-filled from your account information"
              />
              <p className="text-xs text-gray-500 mt-1">
                * Auto-filled from your account information
              </p>
            </div>
          </div>

          {/* Location of Construction Section */}
          <div className="bg-blue-600 text-white px-6 py-3">
            <h2 className="text-lg font-bold">LOCATION OF CONSTRUCTION:</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">STREET</label>
                <input
                  type="text"
                  value={formData.locationStreet}
                  onChange={(e) => handleInputChange('locationStreet', e.target.value)}
                  placeholder="Street"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">LOT NO.</label>
                <input
                  type="text"
                  value={formData.lotNo}
                  onChange={(e) => handleInputChange('lotNo', e.target.value)}
                  placeholder="Lotno."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">BLK NO.</label>
                <input
                  type="text"
                  value={formData.blockNo1}
                  onChange={(e) => handleInputChange('blockNo1', e.target.value)}
                  placeholder="Blkno."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">BLK NO.</label>
                <input
                  type="text"
                  value={formData.blockNo2}
                  onChange={(e) => handleInputChange('blockNo2', e.target.value)}
                  placeholder="Blkno."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">TAX DEC. NO.</label>
                <input
                  type="text"
                  value={formData.taxDecNo}
                  onChange={(e) => handleInputChange('taxDecNo', e.target.value)}
                  placeholder="Taxdec.no."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">BARANGAY</label>
                <input
                  type="text"
                  value={formData.locationBarangay}
                  onChange={(e) => handleInputChange('locationBarangay', e.target.value)}
                  placeholder="Barangay"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">CITY / MUNICIPALITY</label>
                <input
                  type="text"
                  value={formData.locationCity}
                  onChange={(e) => handleInputChange('locationCity', e.target.value)}
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
                onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
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

            {/* Show text input when "others" is selected */}
            {formData.scopeOfWork === 'others' && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Please specify: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.otherScopeSpecify}
                  onChange={(e) => handleInputChange('otherScopeSpecify', e.target.value)}
                  placeholder="Specify other scope of work"
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoadingUserInfo}
                className={`${
                  isSubmitting || isLoadingUserInfo
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
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
      <UFooter/>
    </div>
  );
};

export default FencingPermitForm;
