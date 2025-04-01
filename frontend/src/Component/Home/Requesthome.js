import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import { permits, categories } from '../data/permitsData';



const PermitsHomepage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const navigate = useNavigate();

  // Define routes for permits dynamically
  const permitRoutes = {
    "Business Permit": "/Uform",
    "Mayor's Permit": "/Chome",
  };

  // Function to handle application button clicks
  const handleApplyNow = (permitName) => {
    if (permitRoutes[permitName]) {
      navigate(permitRoutes[permitName]);
    } else {
      console.log("No route assigned for this permit.");
    }
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
    </div>
  );
};

export default PermitsHomepage;
