import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import { permits, categories } from '../data/permitsData';

const PermitsHomepage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

  const permitRoutes = {
    "Business Permit": "/Uform",
    "Mayor's Permit": "/MayorsPermitForm",
    "Building Permit": "/BuildingPermitForm",
    "Electrical Permit": "/ElectricalPermitForm",
    "Plumbing Permit": "/PlumbingPermitForm",
    "Cedula Permit": "/CedulaPermitForm",
    "Fencing Permit": "/FencingPermitForm",
    "Electronics Permit": "/ElectronicsPermitForm",
    "Renewal Business Permit": "/RenewalBusinessPermit",

  };

  const handleApplyNow = (permitName) => {
    setSelectedPermit(permitName);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setReceiptImage(null);
    setAcceptedTerms(false);
  };

  const handleSubmitPayment = () => {
    // Simulate payment submission
    setIsModalOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleProceed = () => {
    if (permitRoutes[selectedPermit]) {
      navigate(permitRoutes[selectedPermit]);
    }
    setIsConfirmationOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Uheader />

      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-3 font-medium text-sm focus:outline-none transition-colors duration-200
                  ${activeTab === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {category.name} Permits
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {categories.find(cat => cat.id === activeTab)?.name} Permits
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {permits[activeTab].map((permit, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-blue-700">{permit.name}</h3>
                  <p className="text-gray-600 mt-2">{permit.description}</p>
                  <button
                    onClick={() => handleApplyNow(permit.name)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <UFooter />

      {/* Step 1: Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Confirm Application</h2>

            <p className="text-gray-700 mb-4">
              To apply for the <span className="font-semibold">{selectedPermit}</span>, you are required to pay a <span className="text-blue-600 font-semibold">20% advance payment</span> before proceeding.
            </p>

            {selectedPermit === "Business Permit" && (
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Requirements:</h3>
                <div className="text-black text-sm" style={{ fontFamily: 'Arial', textAlign: 'left' }}>
                  <p>1. FILLED-UP UNIFIED FORM (2 COPIES)</p>
                  <p>2. SEC/DTI/CDA CERTIFICATE (IF ANY) - PHOTOCOPY</p>
                  <p>3. LOCATION SKETCH OF THE NEW BUSINESS</p>
                  <p>4. SWORN STATEMENT OF CAPITAL</p>
                  <p>5. TAX CLEARANCE</p>
                  <p>6. BRGY. BUSINESS CLEARANCE 2025 - PHOTOCOPY</p>
                  <p>7. CEDULA 2025 - PHOTOCOPY</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block mb-1 font-medium text-sm">
                Upload Receipt/Screenshot (Gcash, Maya, etc.):
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 rounded p-2 text-sm"
                onChange={(e) => setReceiptImage(e.target.files[0])}
              />
            </div>

            <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-50 text-sm text-gray-700">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I understand and agree to pay a 20% advance fee as part of the application process. This is non-refundable and required before final processing.
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!acceptedTerms || !receiptImage}
              >
                Submit Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Confirmation Modal */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-green-600">Payment Submitted!</h2>
            <p className="text-gray-700 mb-3">
              Your 20% payment has been successfully submitted. Please wait while our staff reviews and approves your application.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Once approved, you can proceed to fill out the official form for your selected permit.
            </p>
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Proceed to Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermitsHomepage;
