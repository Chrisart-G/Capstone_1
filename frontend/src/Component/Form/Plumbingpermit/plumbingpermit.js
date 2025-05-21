import { useState } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

export default function PlumbingPermitForm() {
  const [formData, setFormData] = useState({
    applicationNo: '',
    ppNo: '',
    buildingPermitNo: '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'scopeOfWork') {
      setFormData({
        ...formData,
        [name]: value,
        // Reset the other scope specify field if the selected option is not "others"
        otherScopeSpecify: value === 'others' ? formData.otherScopeSpecify : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Form submitted successfully!');
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

        {/* Application Number Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-300 p-2">
            <p className="text-xs mb-1">APPLICATION NO.</p>
            <input
              type="text"
              name="applicationNo"
              value={formData.applicationNo}
              onChange={handleChange}
              className="w-full border-b border-gray-300 focus:outline-none text-sm"
            />
          </div>
          <div className="border border-gray-300 p-2">
            <p className="text-xs mb-1">PP NO.</p>
            <input
              type="text"
              name="ppNo"
              value={formData.ppNo}
              onChange={handleChange}
              className="w-full border-b border-gray-300 focus:outline-none text-sm"
            />
          </div>
          <div className="border border-gray-300 p-2">
            <p className="text-xs mb-1">BUILDING PERMIT NO.</p>
            <input
              type="text"
              name="buildingPermitNo"
              value={formData.buildingPermitNo}
              onChange={handleChange}
              className="w-full border-b border-gray-300 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* BOX 1 - Owner/Applicant Information */}
        <div className="border border-gray-500 p-2">
          <p className="text-sm font-bold mb-2">BOX 1 (TO BE ACCOMPLISHED IN PRINT BY THE OWNER/APPLICANT)</p>
          
          {/* Name Fields */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="col-span-2 border border-gray-300 p-1">
              <p className="text-xs mb-1">LAST NAME</p>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full focus:outline-none text-sm"
              />
            </div>
            <div className="col-span-1 border border-gray-300 p-1">
              <p className="text-xs mb-1">FIRST NAME</p>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full focus:outline-none text-sm"
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

          {/* Scope of Work - DROPDOWN */}
          <div className="mb-1">
            <p className="text-xs font-bold">SCOPE OF WORK</p>
          </div>
          <div className="border border-gray-300 p-2">
            <div className="mb-2">
              <label className="block text-xs mb-1">Select Scope of Work:</label>
              <select
                name="scopeOfWork"
                value={formData.scopeOfWork}
                onChange={handleChange}
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
                <label className="block text-xs mb-1">Please specify:</label>
                <input
                  type="text"
                  name="otherScopeSpecify"
                  value={formData.otherScopeSpecify}
                  onChange={handleChange}
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
    <UFooter/>
    </div>
  );
}