import React, { useState, useEffect } from 'react';
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
  
  // Auto-fill states
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    email: '',
    phoneNumber: ''
  });
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // Fetch user info for auto-fill
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUserInfo(true);
      try {
        const response = await fetch('http://localhost:8081/api/user-info-cedula', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const userData = data.userInfo;
            setUserInfo(userData);
            
            // Auto-fill the form with user data
            setFormData(prevData => ({
              ...prevData,
              name: userData.name,
              address: userData.address
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

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
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Cedula application submitted successfully!');
        // Reset form but keep auto-filled data
        setFormData({
          name: userInfo.name,
          address: userInfo.address,
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

        {/* Loading indicator */}
        {isLoadingUserInfo && (
          <div className="flex justify-center items-center py-4 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading user information...</span>
          </div>
        )}
        
        <form className="bg-gray-50 rounded-lg shadow-lg grid grid-cols-2 gap-6 p-8" onSubmit={handleSubmit}>
          <h2 className="col-span-2 text-3xl font-bold text-center text-gray-800 mb-6">
            Cedula Permit Form
          </h2>
          
          {/* Name field - Read-only */}
          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              readOnly
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 cursor-not-allowed"
              title="This field is auto-filled from your account information and cannot be edited"
            />
            <p className="text-xs text-gray-500 mt-1">
              * Auto-filled from your account information
            </p>
          </div>

          {/* Address field - Read-only */}
          <div className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              readOnly
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 cursor-not-allowed"
              title="This field is auto-filled from your account information and cannot be edited"
            />
            <p className="text-xs text-gray-500 mt-1">
              * Auto-filled from your account information
            </p>
          </div>
          
          {/* Other editable fields */}
          {[
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
              disabled={loading || isLoadingUserInfo}
              className={`w-full py-3 font-semibold rounded-lg transition duration-200 ${
                loading || isLoadingUserInfo
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
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