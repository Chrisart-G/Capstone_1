import React, { useState } from 'react';
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
    scopeOfWork: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    alert('Fencing Permit Application Submitted Successfully!\nCheck console for form data.');
  };

  return (
    <div>
      <Uheader/>
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        {/* Logo and Title Section */}
        <div className="text-center py-6 border-b">
            <div class="flex justify-center items-center">
          <img src="img/logo.png" alt="" class="w-40 h-30"/>
      </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">FENCING PERMIT FORM</h1>
        </div>

        {/* Owner/Applicant Section */}
        <div className="bg-blue-600 text-white px-6 py-3">
          <h2 className="text-lg font-bold">OWNER / APPLICANT</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">LAST NAME</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Last Name"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">FIRST NAME</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="First Name"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">M.I</label>
              <input
                type="text"
                value={formData.middleInitial}
                onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                placeholder="Middle Name"
                maxLength="2"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
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
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">STREET</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Street"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">BARANGAY</label>
              <input
                type="text"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
                placeholder="Barangay"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">CITY / MUNICIPALITY</label>
              <input
                type="text"
                value={formData.cityMunicipality}
                onChange={(e) => handleInputChange('cityMunicipality', e.target.value)}
                placeholder="City/Municipality"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
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

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-gray-700">TELEPHONE NO.</label>
            <input
              type="text"
              value={formData.telephoneNo}
              onChange={(e) => handleInputChange('telephoneNo', e.target.value)}
              placeholder="Telephone no."
              className="w-full max-w-md p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
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
            <label className="block text-sm font-bold mb-2 text-gray-700">SELECT SCOPE OF WORK</label>
            <select
              value={formData.scopeOfWork}
              onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
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

          {/* Submit Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
    <UFooter/>
    </div>
  );
};

export default FencingPermitForm;