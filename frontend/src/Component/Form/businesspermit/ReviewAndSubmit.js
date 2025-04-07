import React from 'react';

const ReviewAndSubmit = ({ formData }) => (
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

export default ReviewAndSubmit;