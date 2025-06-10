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
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8081/api/cedula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Include cookies for session authentication
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Cedula application submitted successfully!');
        // Reset form
        setFormData({
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
      } else {
        setMessage(data.message || 'An error occurred while submitting the form.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Uheader />
      <div className="max-w-4xl mx-auto p-8">
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        
        <form className="bg-gray-50 rounded-lg shadow-lg grid grid-cols-2 gap-6 p-8" onSubmit={handleSubmit}>
          <h2 className="col-span-2 text-3xl font-bold text-center text-gray-800 mb-6">
            Cedula Permit Form
          </h2>
          
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
                disabled={loading}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          ))}
          
          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="sex">
              Sex:
            </label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              disabled={loading}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
              Status:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      <UFooter />
    </>
  );
}

export default CedulaPermitForm;