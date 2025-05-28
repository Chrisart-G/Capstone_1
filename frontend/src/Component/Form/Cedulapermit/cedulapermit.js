import React, { useState } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

function CedulaPermitForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    placeOfBirth: '',
    dateOfBirth: '',
    profession: '',
    yearlyIncome: '',
    purpose: '',
    sex: '',
    status: '',
    tin: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Cedula Form Data:", formData);
    alert("Form submitted successfully!");
  };

  return (
    <>
      <Uheader />
      <form className="max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-lg grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <h2 className="col-span-2 text-3xl font-bold text-center text-gray-800 mb-6">Cedula Permit Form</h2>
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Address", name: "address", type: "text" },
          { label: "Place of Birth", name: "placeOfBirth", type: "text" },
          { label: "Date of Birth", name: "dateOfBirth", type: "date" },
          { label: "Profession", name: "profession", type: "text" },
          { label: "Yearly Income", name: "yearlyIncome", type: "number" },
          { label: "Purpose", name: "purpose", type: "text" },
          { label: "TIN", name: "tin", type: "text" },
        ].map((field, index) => (
          <div className="mb-4" key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div className="col-span-2 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="sex">Sex:</label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="col-span-2 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </div>
      </form>
      <UFooter />
    </>
  );
}

export default CedulaPermitForm;