import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import { permits, categories } from '../data/permitsData';

const PermitsHomepage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const navigate = useNavigate();

  // Define routes for permits dynamically
  const permitRoutes = {
    "Business Permit": "/Uform",
    "Mayor's Permit": "/MayorsPermitForm",
    "Building Permit": "/BuildingPermitForm",
    "Electrical Permit": "/ElectricalPermitForm",
    "Plumbing Permit": "/PlumbingPermitForm",
    "Cedula Permit": "/CedulaPermitForm",
    "Fencing Permit": "/FencingPermitForm",
    "Electronics Permit": "/ElectronicsPermitForm",
  };

  // Function to handle application button clicks
  const handleApplyNow = (permitName) => {
    setSelectedPermit(permitName);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (permitRoutes[selectedPermit]) {
      navigate(permitRoutes[selectedPermit]);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold">Confirm Application</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to apply for the {selectedPermit}?
            </p>
            {selectedPermit === "Business Permit" && (
  <div className="mt-4 p-4 bg-gray-100 rounded-md">
    <h3 className="text-lg font-semibold">This is the Requirements:</h3>
    <div className="text-black" style={{ fontFamily: 'Arial', textAlign: 'justify-center' }}>
      <p>1. FILLED-UP UNIFIED FORM (2 COPIES)</p>
      <p>2. SEC/DTI/CDA CERTIFICATE (IF ANY) - PHOTOCOPY</p>
      <p>3. LOCATION SKETCH OF THE NEW BUSINESS</p>
      <p>4. SWORN STATEMENT OF CAPITAL</p>
      <p>5. TAX CLEARANCE SHOWING THAT THE OPERATOR HAS PAID ALL TAX OBLIGATION IN THE MUNICIPALITY</p>
      <p>6. BRGY. BUSINESS CLEARANCE 2025 - PHOTOCOPY</p>
      <p>7. CEDULA 2025 - PHOTOCOPY</p>
    </div>
  </div>
)}
            <div className="flex justify-center">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleConfirm}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermitsHomepage;