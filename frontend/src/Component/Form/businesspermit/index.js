import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import BasicInformation from './BasicInformation';
import ContactInformation from './ContactInformation';
import BusinessDetails from './BusinessDetails';
import BusinessActivity from './BusinessActivity';
import ReviewAndSubmit from './ReviewAndSubmit';

const MayorsPermitForm = () => {
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
    businessLines: [
      {
        line: '',
        units: '',
        capitalization: '',
        essentialGross: '',
        nonEssentialGross: '',
      },
    ],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Basic Information',
    'Contact Information',
    'Business Details',
    'Business Activity',
    'Review & Submit',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessLineChange = (index, field, value) => {
    const updatedLines = [...formData.businessLines];
    updatedLines[index][field] = value;
    setFormData((prev) => ({ ...prev, businessLines: updatedLines }));
  };

  const addBusinessLine = () => {
    setFormData((prev) => ({
      ...prev,
      businessLines: [
        ...prev.businessLines,
        {
          line: '',
          units: '',
          capitalization: '',
          essentialGross: '',
          nonEssentialGross: '',
        },
      ],
    }));
  };

  const removeBusinessLine = (index) => {
    const updatedLines = [...formData.businessLines];
    updatedLines.splice(index, 1);
    setFormData((prev) => ({ ...prev, businessLines: updatedLines }));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
    // Handle actual submission here (e.g. API call)
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInformation formData={formData} handleChange={handleChange} />;
      case 1:
        return <ContactInformation formData={formData} handleChange={handleChange} />;
      case 2:
        return <BusinessDetails formData={formData} handleChange={handleChange} />;
      case 3:
        return (
          <BusinessActivity
            formData={formData}
            handleChange={handleChange}
            handleBusinessLineChange={handleBusinessLineChange}
            addBusinessLine={addBusinessLine}
            removeBusinessLine={removeBusinessLine}
          />
        );
      case 4:
        return <ReviewAndSubmit formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="mayors-permit-form p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <ProgressBar steps={steps} currentStep={currentStep} />
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MayorsPermitForm;
