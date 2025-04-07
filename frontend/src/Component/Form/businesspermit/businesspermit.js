import React, { useState } from 'react';

const MayorsPermitForm = () => {
  // Consolidated initial state with default values
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Define the steps of the wizard
  const steps = [
    "Basic Information",
    "Contact Information",
    "Business Details",
    "Business Activity",
    "Review & Submit"
  ];

  // Generic handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes to businessLines array
  const handleBusinessLineChange = (index, field, value) => {
    const updatedLines = [...formData.businessLines];
    updatedLines[index][field] = value;
    setFormData(prev => ({ ...prev, businessLines: updatedLines }));
  };

  // Add new business line
  const addBusinessLine = () => {
    setFormData(prev => ({
      ...prev,
      businessLines: [...prev.businessLines, { line: '', units: '', capitalization: '', essentialGross: '', nonEssentialGross: '' }]
    }));
  };

  // Remove business line at specified index
  const removeBusinessLine = (index) => {
    const updatedLines = [...formData.businessLines];
    updatedLines.splice(index, 1);
    setFormData(prev => ({ ...prev, businessLines: updatedLines }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Submit data to backend here
    alert('Form submitted successfully!');
  };

  // Reusable form components
  const InputField = ({ label, name, type = 'text', value, onChange, className = '', required = false }) => (
    <div className={className}>
      <label className="block font-medium mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded"
        required={required}
      />
    </div>
  );

  const RadioButton = ({ label, name, value, checked, onChange }) => (
    <label className="inline-flex items-center mr-4">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio h-4 w-4 text-blue-600"
      />
      <span className="ml-2">{label}</span>
    </label>
  );

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`text-xs md:text-sm text-center ${currentStep >= index ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
            style={{ width: `${100 / steps.length}%` }}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Step 1: Basic Information
  const renderBasicInformation = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="flex items-center">
          <span className="font-medium mr-4">Application Type:</span>
          <div className="flex">
            <RadioButton 
              label="NEW" 
              name="applicationType" 
              value="NEW" 
              checked={formData.applicationType === 'NEW'} 
              onChange={handleChange} 
            />
            <RadioButton 
              label="RENEWAL" 
              name="applicationType" 
              value="RENEWAL" 
              checked={formData.applicationType === 'RENEWAL'} 
              onChange={handleChange} 
            />
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
        <InputField 
          label="DATE OF APPLICATION:" 
          name="applicationDate" 
          type="date" 
          value={formData.applicationDate} 
          onChange={handleChange} 
          required
        />
        
        <InputField 
          label="TIN NO:" 
          name="tinNo" 
          value={formData.tinNo} 
          onChange={handleChange} 
          required
        />
        
        <InputField 
          label="DTI/SEC/CDA REGISTRATION NO:" 
          name="registrationNo" 
          value={formData.registrationNo} 
          onChange={handleChange} 
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <InputField 
          label="DATE OF REGISTRATION:" 
          name="registrationDate" 
          type="date" 
          value={formData.registrationDate} 
          onChange={handleChange} 
          required
        />
        
        <div>
          <label className="block font-medium mb-1">TYPE OF BUSINESS:</label>
          <div className="flex flex-wrap">
            {['SINGLE', 'PARTNERSHIP', 'CORPORATION', 'COOPERATIVE'].map(type => (
              <RadioButton 
                key={type}
                label={type} 
                name="businessType" 
                value={type} 
                checked={formData.businessType === type} 
                onChange={handleChange} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tax incentive section */}
      <div className="mb-4">
        <label className="block font-medium mb-1">ARE YOU ENJOYING TAX INCENTIVE FROM ANY GOVERNMENT ENTITY?</label>
        <div className="flex items-center mb-2">
          <RadioButton 
            label="YES" 
            name="taxIncentive" 
            value="YES" 
            checked={formData.taxIncentive === 'YES'} 
            onChange={handleChange} 
          />
          <RadioButton 
            label="NO" 
            name="taxIncentive" 
            value="NO" 
            checked={formData.taxIncentive === 'NO'} 
            onChange={handleChange} 
          />
        </div>
        {formData.taxIncentive === 'YES' && (
          <InputField 
            label="PLEASE SPECIFY THE ENTITY:" 
            name="taxIncentiveEntity" 
            value={formData.taxIncentiveEntity} 
            onChange={handleChange} 
          />
        )}
      </div>

      {/* Taxpayer information */}
      <div className="mb-4">
        <h3 className="font-medium text-center mb-2">NAME OF TAXPAYER / REGISTRANT</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField 
            label="LAST NAME:" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            required
          />
          <InputField 
            label="FIRST NAME:" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            required
          />
          <InputField 
            label="MIDDLE NAME:" 
            name="middleName" 
            value={formData.middleName} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField 
          label="BUSINESS NAME:" 
          name="businessName" 
          value={formData.businessName} 
          onChange={handleChange} 
          required
        />
        <InputField 
          label="TRADE NAME / FRANCHISE:" 
          name="tradeName" 
          value={formData.tradeName} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );

  // Step 2: Contact Information
  const renderContactInformation = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">Contact Information</h2>
      
      {formData.applicationType === 'RENEWAL' && (
        <p className="text-sm italic mb-4 text-gray-600">
          NOTE: For Renewal application, fill up only if certain information has changed.
        </p>
      )}
      
      <h3 className="font-medium mb-2">Business Location & Contact Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
        <InputField 
          label="BUSINESS ADDRESS:" 
          name="businessAddress" 
          value={formData.businessAddress} 
          onChange={handleChange}
          className="md:col-span-2"
          required
        />
        
        <InputField 
          label="POSTAL CODE:" 
          name="businessPostalCode" 
          value={formData.businessPostalCode} 
          onChange={handleChange} 
          required
        />
        
        <InputField 
          label="EMAIL ADDRESS:" 
          name="businessEmail" 
          type="email"
          value={formData.businessEmail} 
          onChange={handleChange} 
          required
        />
        
        <InputField 
          label="TELEPHONE NO:" 
          name="businessTelephone" 
          value={formData.businessTelephone} 
          onChange={handleChange} 
        />
        
        <InputField 
          label="MOBILE NO:" 
          name="businessMobile" 
          value={formData.businessMobile} 
          onChange={handleChange} 
          required
        />
      </div>

      <h3 className="font-medium mb-2">Owner's Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <InputField 
          label="OWNER'S ADDRESS:" 
          name="ownerAddress" 
          value={formData.ownerAddress} 
          onChange={handleChange}
          className="md:col-span-2"
          required
        />
        
        <InputField 
          label="POSTAL CODE:" 
          name="ownerPostalCode" 
          value={formData.ownerPostalCode} 
          onChange={handleChange} 
          required
        />
        
        <InputField 
          label="EMAIL ADDRESS:" 
          name="ownerEmail" 
          type="email"
          value={formData.ownerEmail} 
          onChange={handleChange} 
          required
        />
        
        <InputField 
          label="TELEPHONE NO:" 
          name="ownerTelephone" 
          value={formData.ownerTelephone} 
          onChange={handleChange} 
        />
        
        <InputField 
          label="MOBILE NO:" 
          name="ownerMobile" 
          value={formData.ownerMobile} 
          onChange={handleChange} 
          required
        />
      </div>
    </div>
  );

  // Step 3: Business Details
  const renderBusinessDetails = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">Business Details</h2>
      
      {formData.applicationType === 'RENEWAL' && (
        <p className="text-sm italic mb-4 text-gray-600">
          NOTE: For Renewal application, fill up only if certain information has changed.
        </p>
      )}
      
      {/* Business metrics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <InputField 
          label="BUSINESS AREA (IN SQ M.):" 
          name="businessArea" 
          type="number"
          value={formData.businessArea} 
          onChange={handleChange} 
          required
        />
        
        <div>
          <label className="block font-medium mb-1">TOTAL NO. OF EMPLOYEES:</label>
          <div className="grid grid-cols-2 gap-2">
            <InputField 
              label="MALE:" 
              name="maleEmployees" 
              type="number"
              value={formData.maleEmployees} 
              onChange={handleChange} 
              required
            />
            <InputField 
              label="FEMALE:" 
              name="femaleEmployees" 
              type="number"
              value={formData.femaleEmployees} 
              onChange={handleChange} 
              required
            />
          </div>
        </div>
        
        <InputField 
          label="NO. OF EMPLOYEES RESIDING WITHIN LGU:" 
          name="lguEmployees" 
          type="number"
          value={formData.lguEmployees} 
          onChange={handleChange} 
        />
      </div>

      {/* Rental section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-center mb-4">NOTE: FILL UP ONLY IF BUSINESS PLACE IS RENTED</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InputField 
            label="LESSOR'S FULL NAME:" 
            name="lessorName" 
            value={formData.lessorName} 
            onChange={handleChange} 
          />
          
          <InputField 
            label="LESSOR'S FULL ADDRESS:" 
            name="lessorAddress" 
            value={formData.lessorAddress} 
            onChange={handleChange} 
          />
          
          <InputField 
            label="LESSOR'S TELEPHONE/MOBILE NO:" 
            name="lessorTelephone" 
            value={formData.lessorTelephone} 
            onChange={handleChange} 
          />
          
          <InputField 
            label="LESSOR'S EMAIL ADDRESS:" 
            name="lessorEmail" 
            type="email"
            value={formData.lessorEmail} 
            onChange={handleChange} 
          />
          
          <InputField 
            label="MONTHLY RENTAL:" 
            name="monthlyRental" 
            type="number"
            value={formData.monthlyRental} 
            onChange={handleChange} 
          />
        </div>
      </div>
    </div>
  );

  // Step 4: Business Activity
  const renderBusinessActivity = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">Business Activity</h2>
      
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">LINE OF BUSINESS</th>
              <th className="border border-gray-300 p-2 text-left">NO. OF UNITS</th>
              <th className="border border-gray-300 p-2 text-left">CAPITALIZATION</th>
              <th className="border border-gray-300 p-2 text-center" colSpan="2">GROSS/SALES RECEIPTS</th>
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
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={line.units}
                    onChange={(e) => handleBusinessLineChange(index, 'units', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded"
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={line.capitalization}
                    onChange={(e) => handleBusinessLineChange(index, 'capitalization', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded"
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={line.essentialGross}
                    onChange={(e) => handleBusinessLineChange(index, 'essentialGross', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded"
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={line.nonEssentialGross}
                    onChange={(e) => handleBusinessLineChange(index, 'nonEssentialGross', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded"
                    required
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
  );

  // Step 5: Review & Submit
  const renderReviewAndSubmit = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">Review Your Application</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Application Type:</p>
            <p>{formData.applicationType || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Payment Mode:</p>
            <p>{formData.paymentMode || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Business Name:</p>
            <p>{formData.businessName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Trade Name:</p>
            <p>{formData.tradeName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">TIN No:</p>
            <p>{formData.tinNo || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Registration No:</p>
            <p>{formData.registrationNo || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Business Type:</p>
            <p>{formData.businessType || 'Not specified'}</p>
          </div>
        </div>

        <h3 className="font-medium mb-2">Applicant Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Last Name:</p>
            <p>{formData.lastName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">First Name:</p>
            <p>{formData.firstName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Middle Name:</p>
            <p>{formData.middleName || 'Not specified'}</p>
          </div>
        </div>

        <h3 className="font-medium mb-2">Business Address</h3>
        <div className="mb-4">
          <p>{formData.businessAddress || 'Not specified'}</p>
          <p>Postal Code: {formData.businessPostalCode || 'Not specified'}</p>
          <p>Email: {formData.businessEmail || 'Not specified'}</p>
          <p>Phone: {formData.businessTelephone || 'Not specified'}, Mobile: {formData.businessMobile || 'Not specified'}</p>
        </div>

        <h3 className="font-medium mb-2">Business Activity</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Line of Business</th>
                <th className="border border-gray-300 p-2">Units</th>
                <th className="border border-gray-300 p-2">Capitalization</th>
                <th className="border border-gray-300 p-2">Essential Gross</th>
                <th className="border border-gray-300 p-2">Non-Essential Gross</th>
              </tr>
            </thead>
            <tbody>
              {formData.businessLines.map((line, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{line.line || 'Not specified'}</td>
                  <td className="border border-gray-300 p-2">{line.units || '0'}</td>
                  <td className="border border-gray-300 p-2">{line.capitalization || '0'}</td>
                  <td className="border border-gray-300 p-2">{line.essentialGross || '0'}</td>
                  <td className="border border-gray-300 p-2">{line.nonEssentialGross || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              By submitting this form, I certify that the information provided is true and correct to the best of my knowledge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the appropriate step based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderContactInformation();
      case 2:
        return renderBusinessDetails();
      case 3:
        return renderBusinessActivity();
      case 4:
        return renderReviewAndSubmit();
      default:
        return renderBasicInformation();
    }
  };

  // Navigation buttons
  const renderNavButtons = () => (
    <div className="flex justify-between mt-8">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600"
        >
          Previous
        </button>
      ) : (
        <div></div> // Empty div to maintain flex spacing
      )}

      {currentStep < steps.length - 1 ? (
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Next
        </button>
      ) : (
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-green-700"
        >
          Submit Application
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mb-10">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">BUSINESS PERMIT APPLICATION</h1>
      
      {/* Progress bar */}
      <ProgressBar />
      
      <form onSubmit={handleSubmit}>
        {/* Render current step */}
        {renderStepContent()}
        
        {/* Navigation buttons */}
        {renderNavButtons()}
      </form>
    </div>
  );
};

export default MayorsPermitForm;