import React from 'react';
import { InputField } from './FormComponents';

const ContactInformation = ({ formData, handleChange }) => (
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

export default ContactInformation;