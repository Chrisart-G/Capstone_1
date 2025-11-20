import { useState, useEffect } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

export default function PlumbingPermitForm() {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleInitial: '',
    tin: '',
    constructionOwned: '',
    formOfOwnership: '',
    useOrCharacter: '',
    addressNo: '',
    addressStreet: '',
    addressBarangay: '',
    addressCity: '',
    addressZipCode: '',
    telephoneNo: '',
    locationStreet: '',
    locationLotNo: '',
    locationBlkNo: '',
    locationTctNo: '',
    locationTaxDecNo: '',
    locationBarangay: '',
    locationCity: '',
    scopeOfWork: 'none',
    otherScopeSpecify: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ⭐ NEW: auto-fill states
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [autoFillError, setAutoFillError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear any previous messages
    setError('');
    setSuccess('');

    // Enforce 1 char for middleInitial
    const processedValue = name === 'middleInitial' ? value.slice(0, 1) : value;
    
    if (name === 'scopeOfWork') {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        otherScopeSpecify: processedValue === 'others' ? prev.otherScopeSpecify : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  // ⭐ NEW: fetch user info for plumbing auto-fill
  useEffect(() => {
    const fetchUserInfoForPlumbing = async () => {
      setIsLoadingUserInfo(true);
      setAutoFillError('');

      try {
        const response = await fetch('http://localhost:8081/api/user-info-plumbing', {
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
              addressStreet: ui.addressStreet || prev.addressStreet,
              addressBarangay: ui.addressBarangay || prev.addressBarangay,
              addressCity: ui.addressCity || prev.addressCity,
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
        console.error('Error fetching user info for plumbing:', err);
        setAutoFillError('Unable to auto-fill your information. You can still complete the form manually.');
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfoForPlumbing();
  }, []);

  const validateForm = () => {
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (formData.scopeOfWork === 'none') {
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
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8081/api/plumbing-permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session-based auth
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      if (data.success) {
        setSuccess(`Application submitted successfully! Your application number is: ${data.data.applicationNo}`);
        
        // Reset after a short delay
        setTimeout(() => {
          setFormData({
            lastName: '',
            firstName: '',
            middleInitial: '',
            tin: '',
            constructionOwned: '',
            formOfOwnership: '',
            useOrCharacter: '',
            addressNo: '',
            addressStreet: '',
            addressBarangay: '',
            addressCity: '',
            addressZipCode: '',
            telephoneNo: '',
            locationStreet: '',
            locationLotNo: '',
            locationBlkNo: '',
            locationTctNo: '',
            locationTaxDecNo: '',
            locationBarangay: '',
            locationCity: '',
            scopeOfWork: 'none',
            otherScopeSpecify: ''
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Uheader/>
      <div className="max-w-4xl mx-auto p-4 bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center text-xs text-center">
                Official Seal
              </div>
            </div>
            <p className="text-sm font-semibold">Republic of the Philippines</p>
            <p className="text-sm font-semibold">Municipality of Hinigaran</p>
            <p className="text-sm font-semibold">Province of Negros Occidental</p>
            <p className="text-sm font-semibold">OFFICE OF THE BUILDING OFFICIAL</p>
            <p className="text-sm">Area Code 06034</p>
            <h1 className="text-xl font-bold mt-4">PLUMBING PERMIT</h1>
          </div>

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

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Information Note */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Application numbers (APPLICATION NO., PP NO., and BUILDING PERMIT NO.) will be automatically generated upon successful submission.
            </p>
          </div>

          {/* BOX 1 - Owner/Applicant Information */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">BOX 1 (TO BE ACCOMPLISHED IN PRINT BY THE OWNER/APPLICANT)</p>
            
            {/* Name Fields */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {/* LAST NAME (auto-filled, read-only) */}
              <div className="col-span-2 border border-gray-300 p-1">
                <p className="text-xs mb-1">LAST NAME <span className="text-red-500">*</span></p>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                  title="Auto-filled from your account information"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* FIRST NAME (auto-filled, read-only) */}
              <div className="col-span-1 border border-gray-300 p-1">
                <p className="text-xs mb-1">FIRST NAME <span className="text-red-500">*</span></p>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  readOnly
                  className="w-full focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                  title="Auto-filled from your account information"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  * Auto-filled from your account information
                </p>
              </div>

              {/* M.I + TIN */}
              <div className="col-span-1 border border-gray-300 p-1">
                <div className="grid grid-cols-2">
                  <div>
                    <p className="text-xs">M.I.</p>
                    <input
                      type="text"
                      name="middleInitial"
                      value={formData.middleInitial}
                      onChange={handleChange}
                      maxLength={1}
                      readOnly
                      className="w-full focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                      placeholder="M"
                      title="Auto-filled from your account information"
                    />
                  </div>
                  <div>
                    <p className="text-xs">TIN</p>
                    <input
                      type="text"
                      name="tin"
                      value={formData.tin}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Construction Info */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">FOR CONSTRUCTION OWNED</p>
                <input
                  type="text"
                  name="constructionOwned"
                  value={formData.constructionOwned}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">FORM OF OWNERSHIP</p>
                <input
                  type="text"
                  name="formOfOwnership"
                  value={formData.formOfOwnership}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">USE OR CHARACTER OF OCCUPANCY</p>
                <input
                  type="text"
                  name="useOrCharacter"
                  value={formData.useOrCharacter}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="border border-gray-300 p-1">
                <p className="text-xs">NO.</p>
                <input
                  type="text"
                  name="addressNo"
                  value={formData.addressNo}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              {/* STREET (auto-filled, read-only) */}
              <div className="col-span-2 border border-gray-300 p-1">
                <p className="text-xs">STREET</p>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleChange}
                  readOnly
                  className="w-full focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                  title="Auto-filled from your account information"
                />
              </div>
              {/* BARANGAY (auto-filled, read-only) */}
              <div className="border border-gray-300 p-1">
                <p className="text-xs">BARANGAY</p>
                <input
                  type="text"
                  name="addressBarangay"
                  value={formData.addressBarangay}
                  onChange={handleChange}
                  readOnly
                  className="w-full focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                  title="Auto-filled from your account information"
                />
              </div>
              {/* CITY/MUNICIPALITY (auto-filled, read-only) */}
              <div className="border border-gray-300 p-1">
                <p className="text-xs">CITY/MUNICIPALITY</p>
                <input
                  type="text"
                  name="addressCity"
                  value={formData.addressCity}
                  onChange={handleChange}
                  readOnly
                  className="w-full focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                  title="Auto-filled from your account information"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">ZIP CODE</p>
                <input
                  type="text"
                  name="addressZipCode"
                  value={formData.addressZipCode}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Phone Number (auto-filled, read-only) */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="col-span-6 border border-gray-300 p-1">
                <p className="text-xs text-center">TELEPHONE NO.</p>
                <input
                  type="text"
                  name="telephoneNo"
                  value={formData.telephoneNo}
                  onChange={handleChange}
                  readOnly
                  className="w-1/2 mx-auto block text-center border-b border-gray-300 focus:outline-none text-sm bg-gray-100 cursor-not-allowed"
                  placeholder="Enter phone number"
                  title="Auto-filled from your account information"
                />
                <p className="text-[10px] text-gray-500 mt-1 text-center">
                  * Auto-filled from your account information
                </p>
              </div>
            </div>

            {/* Location of Construction */}
            <div className="mb-1">
              <p className="text-xs font-bold">LOCATION OF CONSTRUCTION:</p>
            </div>
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="col-span-2 border border-gray-300 p-1">
                <p className="text-xs">STREET</p>
                <input
                  type="text"
                  name="locationStreet"
                  value={formData.locationStreet}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">LOT NO.</p>
                <input
                  type="text"
                  name="locationLotNo"
                  value={formData.locationLotNo}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">BLK NO.</p>
                <input
                  type="text"
                  name="locationBlkNo"
                  value={formData.locationBlkNo}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">TCT NO.</p>
                <input
                  type="text"
                  name="locationTctNo"
                  value={formData.locationTctNo}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">TAX DEC. NO.</p>
                <input
                  type="text"
                  name="locationTaxDecNo"
                  value={formData.locationTaxDecNo}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="col-span-3 border border-gray-300 p-1">
                <p className="text-xs">BARANGAY</p>
                <input
                  type="text"
                  name="locationBarangay"
                  value={formData.locationBarangay}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="col-span-3 border border-gray-300 p-1">
                <p className="text-xs">CITY/MUNICIPALITY</p>
                <input
                  type="text"
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Scope of Work - DROPDOWN */}
            <div className="mb-1">
              <p className="text-xs font-bold">SCOPE OF WORK <span className="text-red-500">*</span></p>
            </div>
            <div className="border border-gray-300 p-2">
              <div className="mb-2">
                <label className="block text-xs mb-1">Select Scope of Work:</label>
                <select
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">-- Select an option --</option>
                  <option value="newConstruction">NEW CONSTRUCTION</option>
                  <option value="erection">ERECTION</option>
                  <option value="addition">ADDITION</option>
                  <option value="alteration">ALTERATION</option>
                  <option value="renovation">RENOVATION</option>
                  <option value="moving">MOVING</option>
                  <option value="repair">REPAIR</option>
                  <option value="conversion">CONVERSION</option>
                  <option value="accessoryBuilding">ACCESSORY BUILDING/STRUCTURE</option>
                  <option value="demolition">DEMOLITION</option>
                  <option value="others">OTHERS (Specify)</option>
                </select>
              </div>
              
              {formData.scopeOfWork === 'others' && (
                <div>
                  <label className="block text-xs mb-1">Please specify: <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="otherScopeSpecify"
                    value={formData.otherScopeSpecify}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify other scope of work"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || isLoadingUserInfo}
              className={`${
                isSubmitting || isLoadingUserInfo
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-700'
              } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {/* Required Fields Note */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
        </div>
      </div>
      <UFooter/>
    </div>
  );
}
