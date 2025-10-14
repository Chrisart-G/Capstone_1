import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

const ElectronicsPermitForm = () => {
  const [formData, setFormData] = useState({
    // Owner/Applicant fields
    lastName: '',
    firstName: '',
    middleInitial: '',
    tin: '',
    forConstructionOwned: '',
    formOfOwnership: '',
    useOrCharacter: '',
    
    // Address fields
    ownerNo: '',
    ownerStreet: '',
    ownerBarangay: '',
    ownerCity: '',
    ownerZipCode: '',
    telephoneNo: '',
    
    // Location of Construction fields
    lotNo: '',
    blkNo: '',
    tctNo: '',
    currentTaxDecNo: '',
    constructionStreet: '',
    constructionBarangay: '',
    constructionCity: '',
    
    // Scope of work
    scopeOfWork: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scopeOfWorkOptions = [
    'New Construction',
    'Addition/Extension',
    'Renovation/Alteration',
    'Repair',
    'Demolition',
    'Change of Occupancy',
    'Installation of Equipment',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = [
      'lastName', 'firstName', 'tin', 'forConstructionOwned', 
      'formOfOwnership', 'useOrCharacter', 'ownerStreet', 
      'ownerBarangay', 'ownerCity', 'telephoneNo', 'scopeOfWork'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // TIN validation (basic format check) - optional format validation
    // Removed strict format check to allow flexibility

    // Phone number validation
    if (formData.telephoneNo && !/^[\d\s\-\+\(\)]+$/.test(formData.telephoneNo)) {
      newErrors.telephoneNo = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('http://localhost:8081/api/electronics-permits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert('Electronics permit application submitted successfully!');
          console.log('Submission response:', data);
          
          // Navigate to Docutracker page
          window.location.href = '/Docutracker';
        } else {
          alert(data.message || 'Failed to submit application. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred while submitting the application. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Please fill in all required fields correctly.');
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, required = false, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name]}</span>}
    </div>
  );

  return (
    <div>
      <Uheader/>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Form Header */}
            <div className="text-center py-6 border-b">
              <div className="flex justify-center items-center">
                <img src="img/logo.png" alt="" className="w-40 h-30"/>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ELECTRONICS PERMIT FORM</h1>
            </div>

            <div className="p-6 space-y-8">
              {/* Owner/Applicant Section */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">OWNER / APPLICANT</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="LAST NAME" name="lastName" placeholder="Last Name" required />
                <InputField label="FIRST NAME" name="firstName" placeholder="First Name" required />
                <InputField label="M.I" name="middleInitial" placeholder="Middle Initial" />
                <InputField label="TIN" name="tin" placeholder="TIN #" required />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InputField label="FOR CONSTRUCTION OWNED" name="forConstructionOwned" placeholder="For Construction Owned" required />
                <InputField label="FORM OF OWNERSHIP" name="formOfOwnership" placeholder="Form Of Ownership" required />
                <InputField label="USE OR CHARACTER OF OCCUPANCY" name="useOrCharacter" placeholder="Use or character of occupancy" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <InputField label="NO." name="ownerNo" placeholder="No." />
                <InputField label="STREET" name="ownerStreet" placeholder="Street" required />
                <InputField label="BARANGAY" name="ownerBarangay" placeholder="Barangay" required />
                <InputField label="CITY / MUNICIPALITY" name="ownerCity" placeholder="City/Municipality" required />
                <InputField label="ZIP CODE" name="ownerZipCode" placeholder="Zipcode" />
              </div>

              <div className="flex justify-center">
                <InputField label="TELEPHONE NO." name="telephoneNo" placeholder="Telephone no." required className="w-full max-w-sm" />
              </div>

              {/* Location of Construction Section */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">LOCATION OF CONSTRUCTION:</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="LOT NO." name="lotNo" placeholder="Lot no." />
                <InputField label="BLK NO." name="blkNo" placeholder="Blk no." />
                <InputField label="TCT NO." name="tctNo" placeholder="Tct no." />
                <InputField label="CURRENT TAX DEC. NO." name="currentTaxDecNo" placeholder="Current tax dec. no." />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InputField label="STREET" name="constructionStreet" placeholder="Street" />
                <InputField label="BARANGAY" name="constructionBarangay" placeholder="Barangay" />
                <InputField label="CITY / MUNICIPALITY" name="constructionCity" placeholder="City/Municipality" />
              </div>

              {/* Scope of Work Section */}
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">SCOPE OF WORK</h2>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  SELECT SCOPE OF WORK <span className="text-red-500">*</span>
                </label>
                <select
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.scopeOfWork ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Select an Option --</option>
                  {scopeOfWorkOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-8 h-5 w-5 text-gray-400 pointer-events-none" />
                {errors.scopeOfWork && <span className="text-red-500 text-xs mt-1 block">{errors.scopeOfWork}</span>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <UFooter/>
    </div>
  );
};

export default ElectronicsPermitForm;