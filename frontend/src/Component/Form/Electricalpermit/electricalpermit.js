import { useState } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

export default function ElectricalPermitForm() {
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
    scopeOfWork: 'none'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitSuccess(false);

    try {
      // Validate required fields
      if (!formData.lastName || !formData.firstName || formData.scopeOfWork === 'none') {
        setSubmitMessage('Please fill in all required fields (Last Name, First Name, and Scope of Work)');
        setIsSubmitting(false);
        return;
      }

      // Additional validation for "others" option
      if (formData.scopeOfWork === 'others') {
        setSubmitMessage('Please select a specific scope of work option');
        setIsSubmitting(false);
        return;
      }

      // Prepare the data to send
      const requestData = {
        ...formData
      };

      console.log('Submitting data:', requestData);

      const response = await fetch('http://localhost:8081/api/electrical-permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        setSubmitSuccess(true);
        setIsModalOpen(true);
        setSubmitMessage(`Application submitted successfully! Application No: ${result.data.applicationNo}, EP No: ${result.data.epNo}, Building Permit No: ${result.data.buildingPermitNo}`);
        
        // Reset form
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
          scopeOfWork: 'none'
        });
      } else {
        setSubmitMessage(`Error: ${result.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage(`Network error: ${error.message}. Please check your connection and backend server.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStatus = () => {
    if (submitSuccess && isModalOpen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-700 mb-4">Your electrical permit application has been submitted successfully.</p>
            <div className="flex justify-end">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsModalOpen(false);
                  setSubmitSuccess(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
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
            <h1 className="text-xl font-bold mt-4">ELECTRICAL PERMIT</h1>
          </div>

          {/* FIXED: Removed Building Permit Number Field - Now Auto-Generated */}
          <div className="border border-gray-500 p-2">
            <div className="text-center mb-4">
              <p className="text-xs font-bold text-gray-600">APPLICATION NO., EP NO., and BUILDING PERMIT NO. will be generated automatically</p>
            </div>
          </div>

          {/* BOX 1 - Owner/Applicant Information */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">BOX 1 (TO BE ACCOMPLISHED IN PRINT BY THE OWNER/APPLICANT)</p>
            
            {/* Name Fields */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="col-span-2 border border-gray-300 p-1">
                <p className="text-xs mb-1">LAST NAME *</p>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                  required
                />
              </div>
              <div className="col-span-1 border border-gray-300 p-1">
                <p className="text-xs mb-1">FIRST NAME *</p>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                  required
                />
              </div>
              <div className="col-span-1 border border-gray-300 p-1">
                <div className="grid grid-cols-2">
                  <div>
                    <p className="text-xs">M.I.</p>
                    <input
                      type="text"
                      name="middleInitial"
                      value={formData.middleInitial}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-sm"
                      maxLength="5"
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
              <div className="col-span-2 border border-gray-300 p-1">
                <p className="text-xs">STREET</p>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">BARANGAY</p>
                <input
                  type="text"
                  name="addressBarangay"
                  value={formData.addressBarangay}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs">CITY/MUNICIPALITY</p>
                <input
                  type="text"
                  name="addressCity"
                  value={formData.addressCity}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm"
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

            {/* Phone Number */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="col-span-6 border border-gray-300 p-1">
                <p className="text-xs text-center">TELEPHONE NO.</p>
                <input
                  type="text"
                  name="telephoneNo"
                  value={formData.telephoneNo}
                  onChange={handleChange}
                  className="w-1/2 mx-auto block text-center border-b border-gray-300 focus:outline-none text-sm"
                  placeholder="Enter phone number"
                />
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

            {/* FIXED: Scope of Work Section - Removed Others Option */}
            <div className="mb-1">
              <p className="text-xs font-bold">SCOPE OF WORK *</p>
            </div>
            <div className="border border-gray-300 p-2">
              <div className="mb-2">
                <label className="block text-xs mb-1">Select Scope of Work:</label>
                <select
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="none">-- Select an option --</option>
                  <option value="newInstallation">NEW INSTALLATION</option>
                  <option value="annualInspection">ANNUAL INSPECTION</option>
                  <option value="temporary">TEMPORARY</option>
                  <option value="reconnection">RECONNECTION OF SERVICE ENTRANCE</option>
                  <option value="separationOfService">SEPARATION OF SERVICE ENTRANCE</option>
                  <option value="upgradingOfService">UPGRADING OF SERVICE ENTRANCE</option>
                  <option value="relocation">RELOCATION OF SERVICE ENTRANCE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {submitMessage && !isModalOpen && (
            <div className={`mt-4 p-3 rounded ${submitSuccess ? 'bg-green-700 text-green-700' : 'bg-green-400 text-black-700'}`}>
              {submitMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {/* Success Modal */}
          {renderFormStatus()}
        </div>
      </div>
      <UFooter/>
    </div>
  );
}