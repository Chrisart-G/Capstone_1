import React, { useState } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

const FencingPermitForm = () => {
  const [formData, setFormData] = useState({
    applicationNo: ['', '', '', '', '', '', '', '', '', ''],
    fpNo: ['', '', '', '', '', '', '', '', '', ''],
    buildingPermitNo: ['', '', '', '', '', '', '', '', '', ''],
    lastName: '',
    firstName: '',
    middleInitial: '',
    tin: '',
    constructionOwnership: '',
    ownershipForm: '',
    addressNo: '',
    street: '',
    barangay: '',
    cityMunicipality: '',
    zipCode: '',
    telephoneNo: '',
    lotNo: '',
    blockNo: '',
    tctNo: '',
    taxDecNo: '',
    locationStreet: '',
    locationBarangay: '',
    locationCity: '',
    scopeOfWork: {
      primaryWork: '',
      repairText: '',
      demolitionText: '',
      othersText: ''
    }
  });

  const handleNumberBoxChange = (field, index, value) => {
    if (value.length <= 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value.toUpperCase() : item)
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScopeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      scopeOfWork: {
        ...prev.scopeOfWork,
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    console.log('Form Data:', formData);
    alert('Fencing Permit Application Submitted Successfully!\nCheck console for form data.');
  };

  const NumberBoxes = ({ field, label }) => (
    <div className="flex flex-col items-center">
      <label className="text-xs font-bold mb-1 text-black">{label}</label>
      <div className="flex">
        {formData[field].map((value, index) => (
          <input
            key={index}
            type="text"
            value={value}
            onChange={(e) => handleNumberBoxChange(field, index, e.target.value)}
            className="w-6 h-6 border-2 border-black text-center text-sm font-bold focus:outline-none focus:bg-blue-50"
            maxLength="1"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div>
        <Uheader/>
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto bg-white border-2 border-black">
        {/* Form Header */}
        <div className="p-6">
          <div className="text-right text-xs mb-4 font-bold">NBC FORM NO. B - 03</div>
          
          {/* Header Section with Logo */}
          <div className="flex items-start justify-center mb-6">
            <div className="flex-shrink-0 mr-6">
              <div className="w-[106px] h-[136px] overflow-hidden flex items-center justify-center">
                 <img 
                 src="/img/logo.png"
                 className="w-full h-full object-cover"
                  />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Republic of the Philippines</p>
              <p className="text-sm font-medium">Municipality of Hinigaran</p>
              <p className="text-sm font-medium">Province of Negros Occidental</p>
              <h1 className="text-lg font-bold mt-2">OFFICE OF THE BUILDING OFFICIAL</h1>
              <h2 className="text-2xl font-bold mt-2">FENCING PERMIT</h2>
            </div>
          </div>

          {/* Permit Numbers Section */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <NumberBoxes field="applicationNo" label="APPLICATION NO." />
            <NumberBoxes field="fpNo" label="FP NO." />
            <NumberBoxes field="buildingPermitNo" label="BUILDING PERMIT NO." />
          </div>

          {/* Main Form Section */}
          <div className="border-2 border-black">
            <div className="bg-gray-100 p-2 border-b-2 border-black">
              <h3 className="text-sm font-bold">BOX 1 (TO BE ACCOMPLISHED IN PRINT BY THE OWNER/APPLICANT)</h3>
            </div>
            
            <div className="p-4">
              {/* Owner/Applicant Section */}
              <div className="border-b-2 border-black pb-4 mb-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">OWNER/APPLICANT</td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">LAST NAME</div>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">FIRST NAME</div>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">M.I.</div>
                        <input
                          type="text"
                          value={formData.middleInitial}
                          onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                          maxLength="2"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">TIN</div>
                        <input
                          type="text"
                          value={formData.tin}
                          onChange={(e) => handleInputChange('tin', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">FOR CONSTRUCTION OWNED BY AN ENTERPRISE</td>
                      <td className="border-2 border-black p-2" colSpan="2">
                        <input
                          type="text"
                          value={formData.constructionOwnership}
                          onChange={(e) => handleInputChange('constructionOwnership', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">FORM OF OWNERSHIP</td>
                      <td className="border-2 border-black p-2">
                        <input
                          type="text"
                          value={formData.ownershipForm}
                          onChange={(e) => handleInputChange('ownershipForm', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Address Section */}
              <div className="border-b-2 border-black pb-4 mb-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">ADDRESS:</td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">NO.</div>
                        <input
                          type="text"
                          value={formData.addressNo}
                          onChange={(e) => handleInputChange('addressNo', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">STREET</div>
                        <input
                          type="text"
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">BARANGAY</div>
                        <input
                          type="text"
                          value={formData.barangay}
                          onChange={(e) => handleInputChange('barangay', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">CITY/MUNICIPALITY</div>
                        <input
                          type="text"
                          value={formData.cityMunicipality}
                          onChange={(e) => handleInputChange('cityMunicipality', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">ZIP CODE</div>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="text-xs font-bold mb-1">TELEPHONE NO.</div>
                        <input
                          type="text"
                          value={formData.telephoneNo}
                          onChange={(e) => handleInputChange('telephoneNo', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Location of Construction Section */}
              <div className="border-b-2 border-black pb-4 mb-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">LOCATION OF CONSTRUCTION:</td>
                      <td className="border-2 border-black p-2">
                        <div className="flex items-center">
                          <span className="text-xs font-bold mr-2">LOT NO.</span>
                          <input
                            type="text"
                            value={formData.lotNo}
                            onChange={(e) => handleInputChange('lotNo', e.target.value)}
                            className="flex-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="flex items-center">
                          <span className="text-xs font-bold mr-2">BLK NO.</span>
                          <input
                            type="text"
                            value={formData.blockNo}
                            onChange={(e) => handleInputChange('blockNo', e.target.value)}
                            className="flex-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="flex items-center">
                          <span className="text-xs font-bold mr-2">TCT NO.</span>
                          <input
                            type="text"
                            value={formData.tctNo}
                            onChange={(e) => handleInputChange('tctNo', e.target.value)}
                            className="flex-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </td>
                      <td className="border-2 border-black p-2">
                        <div className="flex items-center">
                          <span className="text-xs font-bold mr-2">TAX DEC. NO.</span>
                          <input
                            type="text"
                            value={formData.taxDecNo}
                            onChange={(e) => handleInputChange('taxDecNo', e.target.value)}
                            className="flex-1 border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">STREET</td>
                      <td className="border-2 border-black p-2">
                        <input
                          type="text"
                          value={formData.locationStreet}
                          onChange={(e) => handleInputChange('locationStreet', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                      <td className="border-2 border-black p-2 font-bold text-xs bg-gray-50">BARANGAY</td>
                      <td className="border-2 border-black p-2" colSpan="2">
                        <input
                          type="text"
                          value={formData.locationBarangay}
                          onChange={(e) => handleInputChange('locationBarangay', e.target.value)}
                          className="w-full border-b border-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Scope of Work Section */}
              <div>
                <div className="bg-gray-100 p-2 border-2 border-black mb-4">
                  <h3 className="text-sm font-bold">SCOPE OF WORK</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Primary Work Type Dropdown */}
                  <div className="flex items-center">
                    <label className="text-sm font-bold mr-4 min-w-32">Work Type:</label>
                    <select
                      value={formData.scopeOfWork.primaryWork}
                      onChange={(e) => handleScopeChange('primaryWork', e.target.value)}
                      className="flex-1 max-w-64 p-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="">Select Work Type</option>
                      <option value="new-construction">NEW CONSTRUCTION</option>
                      <option value="erection">ERECTION</option>
                      <option value="addition">ADDITION</option>
                      <option value="repair">REPAIR</option>
                      <option value="demolition">DEMOLITION</option>
                      <option value="others">OTHERS</option>
                    </select>
                  </div>

                  {/* Conditional Text Fields Based on Selection */}
                  {formData.scopeOfWork.primaryWork === 'repair' && (
                    <div className="flex items-center">
                      <label className="text-sm font-bold mr-4 min-w-32">Repair Details:</label>
                      <input
                        type="text"
                        value={formData.scopeOfWork.repairText}
                        onChange={(e) => handleScopeChange('repairText', e.target.value)}
                        placeholder="Please specify repair details..."
                        className="flex-1 max-w-96 p-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}

                  {formData.scopeOfWork.primaryWork === 'demolition' && (
                    <div className="flex items-center">
                      <label className="text-sm font-bold mr-4 min-w-32">Demolition Details:</label>
                      <input
                        type="text"
                        value={formData.scopeOfWork.demolitionText}
                        onChange={(e) => handleScopeChange('demolitionText', e.target.value)}
                        placeholder="Please specify demolition details..."
                        className="flex-1 max-w-96 p-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}

                  {formData.scopeOfWork.primaryWork === 'others' && (
                    <div className="flex items-center">
                      <label className="text-sm font-bold mr-4 min-w-32">Other Work Details:</label>
                      <input
                        type="text"
                        value={formData.scopeOfWork.othersText}
                        onChange={(e) => handleScopeChange('othersText', e.target.value)}
                        placeholder="Please specify other work details..."
                        className="flex-1 max-w-96 p-2 border-2 border-gray-400 rounded focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Submit Fencing Permit Application
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