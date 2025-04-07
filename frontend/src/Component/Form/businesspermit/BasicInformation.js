import React from 'react';
import { InputField, RadioButton } from './FormComponents';

const BasicInformation = ({ formData, handleChange }) => (
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

export default BasicInformation;