import React from 'react';

// Reusable form components
export const InputField = ({ label, name, type = 'text', value, onChange, className = '', required = false }) => (
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

export const RadioButton = ({ label, name, value, checked, onChange }) => (
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