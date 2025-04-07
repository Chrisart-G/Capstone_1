import React from 'react';
import { InputField } from './FormComponents';

const BusinessDetails = ({ formData, handleChange }) => (
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

export default BusinessDetails;