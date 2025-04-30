import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';
import axios from 'axios';

export default function BusinessPermitForm() {
  const [formData, setFormData] = useState({
    applicationType: 'new',
    paymentMode: 'annually',
    applicationDate: '',
    tinNo: '',
    registrationNo: '',
    registrationDate: '',
    businessType: 'single',
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
    emergencyPhone: '',
    emergencyEmail: '',
    businessArea: '',
    maleEmployees: '',
    femaleEmployees: '',
    localEmployees: '',
    lessorName: '',
    lessorAddress: '',
    lessorPhone: '',
    lessorEmail: '',
    monthlyRental: '',
    businessActivities: [{ line: '', units: '', capitalization: '', grossEssential: '', grossNonEssential: '' }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleBusinessActivityChange = (index, field, value) => {
    const updatedActivities = [...formData.businessActivities];
    updatedActivities[index][field] = value;
    setFormData({
      ...formData,
      businessActivities: updatedActivities
    });
  };

  const addBusinessActivity = () => {
    setFormData({
      ...formData,
      businessActivities: [...formData.businessActivities, { line: '', units: '', capitalization: '', grossEssential: '', grossNonEssential: '' }]
    });
  };

  const removeBusinessActivity = (index) => {
    const updatedActivities = [...formData.businessActivities];
    updatedActivities.splice(index, 1);
    setFormData({
      ...formData,
      businessActivities: updatedActivities
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await axios.post('http://localhost:8081/api/BusinessPermit', formData , { withCredentials: true });
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setIsModalOpen(true);
      } else {
        setSubmitError('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.response?.data?.message || 'An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderFormStatus = () => {
    if (submitSuccess && isModalOpen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-700 mb-4">Your business permit application has been submitted successfully.</p>
            <div className="flex justify-end">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate('/Docutracker'); 
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (submitError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
          <p className="font-bold">Error!</p>
          <p>{submitError}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
        <Uheader/>
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-10">
    <div className="text-center mb-8">
    <div class="flex justify-center items-center">
          <img src="img/logo.png" alt="" class="w-40 h-30"/>
      </div>
        <h1 className="text-3xl font-bold text-gray-800">BUSINESS PERMIT APPLICATION</h1>
      </div>
      {renderFormStatus()}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 bg-gray-100 p-3 rounded mb-4"> BASIC INFORMATION</h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <input
                    type="radio"
                    id="new"
                    name="applicationType"
                    value="new"
                    checked={formData.applicationType === 'new'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="new" className="font-medium">NEW</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="renewal"
                    name="applicationType"
                    value="renewal"
                    checked={formData.applicationType === 'renewal'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="renewal" className="font-medium">RENEWAL</label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="paymentMode" className="font-medium">MODE OF PAYMENT:</label>
                <select
                  id="paymentMode"
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                >
                  <option value="annually">ANNUALLY</option>
                  <option value="semi-annually">SEMI-ANNUALLY</option>
                  <option value="quarterly">QUARTERLY</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="applicationDate" className="block mb-1 font-medium">DATE OF APPLICATION:</label>
                <input
                  type="date"
                  id="applicationDate"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="tinNo" className="block mb-1 font-medium">TIN NO:</label>
                <input
                  type="text"
                  id="tinNo"
                  name="tinNo"
                  value={formData.tinNo}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="registrationNo" className="block mb-1 font-medium">DTI/SEC/CDA REGISTRATION NO:</label>
                <input
                  type="text"
                  id="registrationNo"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="registrationDate" className="block mb-1 font-medium">DATE OF REGISTRATION:</label>
                <input
                  type="date"
                  id="registrationDate"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">TYPE OF BUSINESS:</label>
              <div className="flex space-x-4">
                <div>
                  <input
                    type="radio"
                    id="single"
                    name="businessType"
                    value="single"
                    checked={formData.businessType === 'single'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="single">SINGLE</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="partnership"
                    name="businessType"
                    value="partnership"
                    checked={formData.businessType === 'partnership'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="partnership">PARTNERSHIP</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="corporation"
                    name="businessType"
                    value="corporation"
                    checked={formData.businessType === 'corporation'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="corporation">CORPORATION</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="cooperative"
                    name="businessType"
                    value="cooperative"
                    checked={formData.businessType === 'cooperative'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="cooperative">COOPERATIVE</label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">AMENDMENT:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amendmentFrom" className="block mb-1">FROM:</label>
                  <select
                    id="amendmentFrom"
                    name="amendmentFrom"
                    value={formData.amendmentFrom}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Type</option>
                    <option value="single">SINGLE</option>
                    <option value="partnership">PARTNERSHIP</option>
                    <option value="corporation">CORPORATION</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="amendmentTo" className="block mb-1">TO:</label>
                  <select
                    id="amendmentTo"
                    name="amendmentTo"
                    value={formData.amendmentTo}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Type</option>
                    <option value="single">SINGLE</option>
                    <option value="partnership">PARTNERSHIP</option>
                    <option value="corporation">CORPORATION</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">ARE YOU ENJOYING TAX INCENTIVE FROM ANY GOVERNMENT ENTITY?</label>
              <div className="flex items-center space-x-4 mb-2 justify-center">
                <div>
                  <input
                    type="radio"
                    id="taxIncentiveYes"
                    name="taxIncentive"
                    value="yes"
                    checked={formData.taxIncentive === 'yes'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="taxIncentiveYes">YES</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="taxIncentiveNo"
                    name="taxIncentive"
                    value="no"
                    checked={formData.taxIncentive === 'no'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="taxIncentiveNo">NO</label>
                </div>
              </div>
              {formData.taxIncentive === 'yes' && (
                <div>
                  <label htmlFor="taxIncentiveEntity" className="block mb-1">PLEASE SPECIFY THE ENTITY:</label>
                  <input
                    type="text"
                    id="taxIncentiveEntity"
                    name="taxIncentiveEntity"
                    value={formData.taxIncentiveEntity}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-center mb-4">NAME OF TAXPAYER / REGISTRANT</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="lastName" className="block mb-1 font-medium">LAST NAME:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block mb-1 font-medium">FIRST NAME:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="middleName" className="block mb-1 font-medium">MIDDLE NAME:</label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessName" className="block mb-1 font-medium">BUSINESS NAME:</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="tradeName" className="block mb-1 font-medium">TRADE NAME / FRANCHISE:</label>
                <input
                  type="text"
                  id="tradeName"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Other Information */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700 bg-gray-100 p-3 rounded"> OTHER INFORMATION</h2>
            {formData.applicationType === 'renewal' && (
              <p className="text-sm italic text-gray-600">NOTE: For Renewal application, do not fill up this section unless certain information have changed.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div>
              <label htmlFor="businessAddress" className="block mb-1 font-medium">BUSINESS ADDRESS:</label>
              <textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="businessPostalCode" className="block mb-1 font-medium">POSTAL CODE:</label>
                <input
                  type="text"
                  id="businessPostalCode"
                  name="businessPostalCode"
                  value={formData.businessPostalCode}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="businessEmail" className="block mb-1 font-medium">EMAIL ADDRESS:</label>
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="businessTelephone" className="block mb-1 font-medium">TELEPHONE NO:</label>
              <input
                type="text"
                id="businessTelephone"
                name="businessTelephone"
                value={formData.businessTelephone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="businessMobile" className="block mb-1 font-medium">MOBILE NO:</label>
              <input
                type="text"
                id="businessMobile"
                name="businessMobile"
                value={formData.businessMobile}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div>
              <label htmlFor="ownerAddress" className="block mb-1 font-medium">OWNER'S ADDRESS:</label>
              <textarea
                id="ownerAddress"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="ownerPostalCode" className="block mb-1 font-medium">POSTAL CODE:</label>
                <input
                  type="text"
                  id="ownerPostalCode"
                  name="ownerPostalCode"
                  value={formData.ownerPostalCode}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="ownerEmail" className="block mb-1 font-medium">EMAIL ADDRESS:</label>
                <input
                  type="email"
                  id="ownerEmail"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="ownerTelephone" className="block mb-1 font-medium">TELEPHONE NO:</label>
              <input
                type="text"
                id="ownerTelephone"
                name="ownerTelephone"
                value={formData.ownerTelephone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="ownerMobile" className="block mb-1 font-medium">MOBILE NO:</label>
              <input
                type="text"
                id="ownerMobile"
                name="ownerMobile"
                value={formData.ownerMobile}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-4">
              <label htmlFor="emergencyContact" className="block mb-1 font-medium">IN CASE OF EMERGENCY, PROVIDE NAME OF CONTACT PERSON:</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergencyPhone" className="block mb-1 font-medium">TELEPHONE/MOBILE NO:</label>
                <input
                  type="text"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="emergencyEmail" className="block mb-1 font-medium">EMAIL ADDRESS:</label>
                <input
                  type="email"
                  id="emergencyEmail"
                  name="emergencyEmail"
                  value={formData.emergencyEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="businessArea" className="block mb-1 font-medium">BUSINESS AREA (IN SQ M.):</label>
              <input
                type="text"
                id="businessArea"
                name="businessArea"
                value={formData.businessArea}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">TOTAL NO. OF EMPLOYEES:</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="maleEmployees" className="block text-sm">MALE:</label>
                  <input
                    type="number"
                    id="maleEmployees"
                    name="maleEmployees"
                    value={formData.maleEmployees}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="femaleEmployees" className="block text-sm">FEMALE:</label>
                  <input
                    type="number"
                    id="femaleEmployees"
                    name="femaleEmployees"
                    value={formData.femaleEmployees}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="localEmployees" className="block mb-1 font-medium">NO. OF EMPLOYEES RESIDING WITHIN LGU:</label>
              <input
                type="number"
                id="localEmployees"
                name="localEmployees"
                value={formData.localEmployees}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-center mb-3">FILL UP ONLY IF BUSINESS PLACE IS RENTED</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label htmlFor="lessorName" className="block mb-1 font-medium">LESSOR'S FULL NAME:</label>
                <input
                  type="text"
                  id="lessorName"
                  name="lessorName"
                  value={formData.lessorName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="lessorAddress" className="block mb-1 font-medium">LESSOR'S FULL ADDRESS:</label>
                <input
                  type="text"
                  id="lessorAddress"
                  name="lessorAddress"
                  value={formData.lessorAddress}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label htmlFor="lessorPhone" className="block mb-1 font-medium">LESSOR'S TELEPHONE/MOBILE NO:</label>
                <input
                  type="text"
                  id="lessorPhone"
                  name="lessorPhone"
                  value={formData.lessorPhone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="lessorEmail" className="block mb-1 font-medium">LESSOR'S EMAIL ADDRESS:</label>
                <input
                  type="email"
                  id="lessorEmail"
                  name="lessorEmail"
                  value={formData.lessorEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label htmlFor="monthlyRental" className="block mb-1 font-medium">MONTHLY RENTAL:</label>
              <input
                type="text"
                id="monthlyRental"
                name="monthlyRental"
                value={formData.monthlyRental}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Business Activity */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 bg-gray-100 p-3 rounded mb-4">3. BUSINESS ACTIVITY</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">LINE OF BUSINESS</th>
                  <th className="border p-2 text-left">NO. OF UNITS</th>
                  <th className="border p-2 text-left">CAPITALIZATION<br/>(FOR NEW BUSINESS)</th>
                  <th className="border p-2 text-left" colSpan="2">GROSS/SALES RECEIPTS<br/>(FOR RENEWAL)</th>
                  <th className="border p-2 text-left"></th>
                </tr>
                <tr>
                  <th className="border p-2" colSpan="3"></th>
                  <th className="border p-2 text-center">ESSENTIAL</th>
                  <th className="border p-2 text-center">NON-ESSENTIAL</th>
                  <th className="border p-2"></th>
                </tr>
              </thead>
              <tbody>
                {formData.businessActivities.map((activity, index) => (
                  <tr key={index}>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={activity.line}
                        onChange={(e) => handleBusinessActivityChange(index, 'line', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={activity.units}
                        onChange={(e) => handleBusinessActivityChange(index, 'units', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={activity.capitalization}
                        onChange={(e) => handleBusinessActivityChange(index, 'capitalization', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={activity.grossEssential}
                        onChange={(e) => handleBusinessActivityChange(index, 'grossEssential', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={activity.grossNonEssential}
                        onChange={(e) => handleBusinessActivityChange(index, 'grossNonEssential', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border p-2">
                      {formData.businessActivities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBusinessActivity(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>  
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={addBusinessActivity}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Business Activity
            </button>
          </div>
        </section>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
    <UFooter/>
    </div>
  );
}