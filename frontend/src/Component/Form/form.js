import React, { useState } from 'react';

const MayorsPermitForm = () => {
  const [formData, setFormData] = useState({
    applicationType: '',
    paymentMode: '',
    applicationDate: '',
    tinNo: '',
    registrationNo: '',
    registrationDate: '',
    businessType: '',
    amendmentFrom: '',
    amendmentTo: '',
    taxIncentive: '',
    taxIncentiveEntity: '',
    lastName: '',
    firstName: '',
    middleName: '',
    businessName: '',
    tradeName: '',
    businessAddress: '',
    businessPostalCode: '',
    businessEmail: '',
    businessTelephone: '',
    businessMobile: '',
    ownerAddress: '',
    ownerPostalCode: '',
    ownerEmail: '',
    ownerTelephone: '',
    ownerMobile: '',
    emergencyContact: '',
    emergencyTelephone: '',
    emergencyEmail: '',
    businessArea: '',
    maleEmployees: '',
    femaleEmployees: '',
    lguEmployees: '',
    lessorName: '',
    lessorAddress: '',
    lessorTelephone: '',
    lessorEmail: '',
    monthlyRental: '',
    businessLines: [{ line: '', units: '', capitalization: '', essentialGross: '', nonEssentialGross: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBusinessLineChange = (index, field, value) => {
    const updatedBusinessLines = [...formData.businessLines];
    updatedBusinessLines[index][field] = value;
    setFormData({ ...formData, businessLines: updatedBusinessLines });
  };

  const addBusinessLine = () => {
    setFormData({
      ...formData,
      businessLines: [...formData.businessLines, { line: '', units: '', capitalization: '', essentialGross: '', nonEssentialGross: '' }]
    });
  };

  const removeBusinessLine = (index) => {
    const updatedBusinessLines = [...formData.businessLines];
    updatedBusinessLines.splice(index, 1);
    setFormData({ ...formData, businessLines: updatedBusinessLines });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Submit data to backend here
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">BUSINESS PERMIT APPLICATION</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">1. BASIC INFORMATION</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Application Type:</span>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="applicationType"
                    value="NEW"
                    checked={formData.applicationType === 'NEW'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">NEW</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="applicationType"
                    value="RENEWAL"
                    checked={formData.applicationType === 'RENEWAL'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">RENEWAL</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block font-medium mb-1">MODE OF PAYMENT:</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Payment Mode</option>
                <option value="ANNUALLY">ANNUALLY</option>
                <option value="SEMI-ANNUALLY">SEMI-ANNUALLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block font-medium mb-1">DATE OF APPLICATION:</label>
              <input
                type="date"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">TIN NO:</label>
              <input
                type="text"
                name="tinNo"
                value={formData.tinNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">DTI/SEC/CDA REGISTRATION NO:</label>
              <input
                type="text"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block font-medium mb-1">DATE OF REGISTRATION:</label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">TYPE OF BUSINESS:</label>
              <div className="flex flex-wrap space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="businessType"
                    value="SINGLE"
                    checked={formData.businessType === 'SINGLE'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1">SINGLE</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="businessType"
                    value="PARTNERSHIP"
                    checked={formData.businessType === 'PARTNERSHIP'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1">PARTNERSHIP</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="businessType"
                    value="CORPORATION"
                    checked={formData.businessType === 'CORPORATION'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1">CORPORATION</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="businessType"
                    value="COOPERATIVE"
                    checked={formData.businessType === 'COOPERATIVE'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1">COOPERATIVE</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">AMENDMENT:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">FROM:</label>
                <div className="flex flex-wrap space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="amendmentFrom"
                      value="SINGLE"
                      checked={formData.amendmentFrom === 'SINGLE'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">SINGLE</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="amendmentFrom"
                      value="PARTNERSHIP"
                      checked={formData.amendmentFrom === 'PARTNERSHIP'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">PARTNERSHIP</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="amendmentFrom"
                      value="CORPORATION"
                      checked={formData.amendmentFrom === 'CORPORATION'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">CORPORATION</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">TO:</label>
                <div className="flex flex-wrap space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="amendmentTo"
                      value="SINGLE"
                      checked={formData.amendmentTo === 'SINGLE'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">SINGLE</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="amendmentTo"
                      value="PARTNERSHIP"
                      checked={formData.amendmentTo === 'PARTNERSHIP'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">PARTNERSHIP</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="amendmentTo"
                      value="CORPORATION"
                      checked={formData.amendmentTo === 'CORPORATION'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-1">CORPORATION</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">ARE YOU ENJOYING TAX INCENTIVE FROM ANY GOVERNMENT ENTITY?</label>
            <div className="flex items-center space-x-4 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="taxIncentive"
                  value="YES"
                  checked={formData.taxIncentive === 'YES'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">YES</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="taxIncentive"
                  value="NO"
                  checked={formData.taxIncentive === 'NO'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">NO</span>
              </label>
            </div>
            {formData.taxIncentive === 'YES' && (
              <div>
                <label className="block text-sm mb-1">PLEASE SPECIFY THE ENTITY:</label>
                <input
                  type="text"
                  name="taxIncentiveEntity"
                  value={formData.taxIncentiveEntity}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-center mb-2">NAME OF TAXPAYER / REGISTRANT</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">LAST NAME:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">FIRST NAME:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">MIDDLE NAME:</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">BUSINESS NAME:</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">TRADE NAME / FRANCHISE:</label>
              <input
                type="text"
                name="tradeName"
                value={formData.tradeName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Other Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">2. OTHER INFORMATION</h2>
          <p className="text-sm italic mb-4 text-gray-600">
            NOTE: For Renewal application, do not fill up this section unless certain information have changed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">BUSINESS ADDRESS:</label>
              <input
                type="text"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">POSTAL CODE:</label>
              <input
                type="text"
                name="businessPostalCode"
                value={formData.businessPostalCode}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">EMAIL ADDRESS:</label>
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">TELEPHONE NO:</label>
              <input
                type="text"
                name="businessTelephone"
                value={formData.businessTelephone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">MOBILE NO:</label>
              <input
                type="text"
                name="businessMobile"
                value={formData.businessMobile}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">OWNER'S ADDRESS:</label>
              <input
                type="text"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">POSTAL CODE:</label>
              <input
                type="text"
                name="ownerPostalCode"
                value={formData.ownerPostalCode}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">EMAIL ADDRESS:</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">TELEPHONE NO:</label>
              <input
                type="text"
                name="ownerTelephone"
                value={formData.ownerTelephone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">MOBILE NO:</label>
              <input
                type="text"
                name="ownerMobile"
                value={formData.ownerMobile}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block font-medium mb-1">IN CASE OF EMERGENCY, PROVIDE NAME OF CONTACT PERSON:</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">TELEPHONE/MOBILE NO:</label>
              <input
                type="text"
                name="emergencyTelephone"
                value={formData.emergencyTelephone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">EMAIL ADDRESS:</label>
              <input
                type="email"
                name="emergencyEmail"
                value={formData.emergencyEmail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block font-medium mb-1">BUSINESS AREA (IN SQ M.):</label>
              <input
                type="number"
                name="businessArea"
                value={formData.businessArea}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">TOTAL NO. OF EMPLOYEES:</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">MALE:</label>
                  <input
                    type="number"
                    name="maleEmployees"
                    value={formData.maleEmployees}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">FEMALE:</label>
                  <input
                    type="number"
                    name="femaleEmployees"
                    value={formData.femaleEmployees}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block font-medium mb-1">NO. OF EMPLOYEES RESIDING WITHIN LGU:</label>
              <input
                type="number"
                name="lguEmployees"
                value={formData.lguEmployees}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-center mb-4">NOTE: FILL UP ONLY IF BUSINESS PLACE IS RENTED</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block font-medium mb-1">LESSOR'S FULL NAME:</label>
                <input
                  type="text"
                  name="lessorName"
                  value={formData.lessorName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">LESSOR'S FULL ADDRESS:</label>
                <input
                  type="text"
                  name="lessorAddress"
                  value={formData.lessorAddress}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">LESSOR'S TELEPHONE/MOBILE NO:</label>
                <input
                  type="text"
                  name="lessorTelephone"
                  value={formData.lessorTelephone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">LESSOR'S EMAIL ADDRESS:</label>
                <input
                  type="email"
                  name="lessorEmail"
                  value={formData.lessorEmail}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">MONTHLY RENTAL:</label>
                <input
                  type="number"
                  name="monthlyRental"
                  value={formData.monthlyRental}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Business Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">3. BUSINESS ACTIVITY</h2>
          
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">LINE OF BUSINESS</th>
                  <th className="border border-gray-300 p-2 text-left">NO. OF UNITS</th>
                  <th className="border border-gray-300 p-2 text-left">CAPITALIZATION (FOR NEW BUSINESS)</th>
                  <th className="border border-gray-300 p-2 text-center" colSpan="2">GROSS/SALES RECEIPTS (FOR RENEWAL)</th>
                  <th className="border border-gray-300 p-2 text-center">ACTIONS</th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-2" colSpan="3"></th>
                  <th className="border border-gray-300 p-2 text-center">ESSENTIAL</th>
                  <th className="border border-gray-300 p-2 text-center">NON-ESSENTIAL</th>
                  <th className="border border-gray-300 p-2"></th>
                </tr>
              </thead>
              <tbody>
                {formData.businessLines.map((line, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={line.line}
                        onChange={(e) => handleBusinessLineChange(index, 'line', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={line.units}
                        onChange={(e) => handleBusinessLineChange(index, 'units', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={line.capitalization}
                        onChange={(e) => handleBusinessLineChange(index, 'capitalization', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={line.essentialGross}
                        onChange={(e) => handleBusinessLineChange(index, 'essentialGross', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        value={line.nonEssentialGross}
                        onChange={(e) => handleBusinessLineChange(index, 'nonEssentialGross', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {formData.businessLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBusinessLine(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addBusinessLine}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Business Line
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-green-700"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default MayorsPermitForm;