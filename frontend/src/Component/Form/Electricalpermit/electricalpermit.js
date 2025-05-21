import { useState } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

export default function ElectricalPermitForm() {
  const [formData, setFormData] = useState({
    applicationNo: '',
    epNo: '',
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
    scopeOfWork: {
      newInstallation: false,
      annualInspection: false,
      temporary: false,
      reconnection: false,
      separationOfService: false,
      upgradingOfService: false,
      relocation: false,
      others: false,
      othersSpecify: '',
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('scopeOfWork.')) {
      const scopeField = name.split('.')[1];
      setFormData({
        ...formData,
        scopeOfWork: {
          ...formData.scopeOfWork,
          [scopeField]: type === 'checkbox' ? checked : value
        }
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
          <h1 className="text-xl font-bold mt-4">ELECTRICAL PERMIT</h1>
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
            <p className="text-xs mb-1">EP NO.</p>
            <input
              type="text"
              name="epNo"
              value={formData.epNo}
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
              <p className="text-xs">TELEPHONE NO.</p>
              <input
                type="text"
                name="telephoneNo"
                value={formData.telephoneNo}
                onChange={handleChange}
                className="w-full focus:outline-none text-sm"
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

          {/* Scope of Work */}
          <div className="mb-1">
            <p className="text-xs font-bold">SCOPE OF WORK</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-gray-300 p-1">
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name="scopeOfWork.newInstallation"
                  checked={formData.scopeOfWork.newInstallation}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">NEW INSTALLATION</label>
              </div>
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name="scopeOfWork.annualInspection"
                  checked={formData.scopeOfWork.annualInspection}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">ANNUAL INSPECTION</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="scopeOfWork.temporary"
                  checked={formData.scopeOfWork.temporary}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">TEMPORARY</label>
              </div>
            </div>
            <div className="border border-gray-300 p-1">
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name="scopeOfWork.reconnection"
                  checked={formData.scopeOfWork.reconnection}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">RECONNECTION OF SERVICE ENTRANCE</label>
              </div>
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name="scopeOfWork.separationOfService"
                  checked={formData.scopeOfWork.separationOfService}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">SEPARATION OF SERVICE ENTRANCE</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="scopeOfWork.upgradingOfService"
                  checked={formData.scopeOfWork.upgradingOfService}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">UPGRADING OF SERVICE ENTRANCE</label>
              </div>
            </div>
            <div className="border border-gray-300 p-1">
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name="scopeOfWork.relocation"
                  checked={formData.scopeOfWork.relocation}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">RELOCATION OF SERVICE ENTRANCE</label>
              </div>
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  name="scopeOfWork.others"
                  checked={formData.scopeOfWork.others}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-xs">OTHERS (Specify)</label>
                <input
                  type="text"
                  name="scopeOfWork.othersSpecify"
                  value={formData.scopeOfWork.othersSpecify}
                  onChange={handleChange}
                  disabled={!formData.scopeOfWork.others}
                  className="ml-2 border-b border-gray-300 focus:outline-none text-sm w-full"
                />
              </div>
            </div>
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