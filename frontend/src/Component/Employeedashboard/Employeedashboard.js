import React, { useState, useEffect } from 'react';
import {
  Search, Bell, User, FileText
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Header/Sidebar';

const API_BASE_URL = "http://localhost:8081";

export default function EmployeeDashboard() { 
  const [selectedTab, setSelectedTab] = useState('pending');
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);
   const [electricalApplications, setElectricalApplications] = useState({
  pending: [],
  inReview: [],
  approved: [],
  rejected: []
});
const [cedulaApplications, setCedulaApplications] = useState({
  pending: [],
  inReview: [],
  approved: [],
  rejected: []
});

  const [applications, setApplications] = useState({
    pending: [],
    inReview: [],
    approved: [],
    rejected: []
  });
  const navigate = useNavigate();
  

  const toggleExpandApplication = (id) => {
    setExpandedApplication(prev => (prev === id ? null : id));
  };

  // Fetch user data from database
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/userinfo`, {
        withCredentials: true
      });
      
      // Debug response
      console.log("User data API response:", response.data);
      
      if (response.data.success) {
        // Store the userData rather than user property
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch applications data
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Organize applications by status
        const organizedData = {
          pending: [],
          inReview: [],
          approved: [],
          rejected: []
        };
        
        response.data.applications.forEach(app => {
          switch(app.status) {
            case 'pending':
              organizedData.pending.push(app);
              break;
            case 'in-review':
              organizedData.inReview.push(app);
              break;
            case 'approved':
              organizedData.approved.push(app);
              break;
            case 'rejected':
              organizedData.rejected.push(app);
              break;
            default:
              organizedData.pending.push(app);
          }
        });
        
        setApplications(organizedData);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

const checkSession = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
      withCredentials: true
    });

    if (response.data.loggedIn) {
      setIsLoggedIn(true);
      await fetchUserData();
      await fetchApplications();
      await fetchElectricalApplications();
      await fetchCedulaApplications(); 
    } else {
      navigate('/');
    }
  } catch (error) {
    console.error("Session check error:", error);
    navigate('/');
  }
};


  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNavigate = (tab) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    checkSession();
  }, []);
const getCurrentApplications = () => {
  return [
    ...applications[selectedTab],
    ...electricalApplications[selectedTab],
    ...cedulaApplications[selectedTab]
  ];
};
const handleViewApplication = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/applications/${id}`, {
      withCredentials: true,
    });

    if (response.data.success) {
      setSelectedApplication(response.data.application);
      setModalVisible(true);
    } else {
      alert("Application not found.");
    }
  } catch (error) {
    console.error("Failed to fetch application info:", error);
  }
};
const handleAcceptApplication = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/applications/${id}/accept`, {}, {
      withCredentials: true,
    });

    if (response.data.success) {
      await fetchApplications(); // Refresh the list after status update
    } else {
      alert("Failed to accept the application.");
    }
  } catch (err) {
    console.error("Accept error:", err);
  }
};

const handleAcceptElectricalApplication = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/electrical-applications/${id}/accept`, 
      { status: 'approved' }, // Add status in request body
      { withCredentials: true }
    );

    if (response.data.success) {
      await fetchElectricalApplications(); // Refresh electrical applications
    } else {
      alert("Failed to accept the electrical permit application.");
    }
  } catch (err) {
    console.error("Accept electrical application error:", err);
  }
};

const handleViewElectricalApplication = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/electrical-applications/${id}`, {
      withCredentials: true,
    });

    if (response.data.success) {
      setSelectedApplication(response.data.application);
      setModalVisible(true);
    } else {
      alert("Electrical permit application not found.");
    }
  } catch (error) {
    console.error("Failed to fetch electrical application info:", error);
  }
};

const fetchElectricalApplications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/electrical-applications`, {
      withCredentials: true
    });
    
    if (response.data.success) {
      // Organize electrical applications by status
      const organizedElectricalData = {
        pending: [],
        inReview: [],
        approved: [],
        rejected: []
      };
      
      response.data.applications.forEach(app => {
  // Add type field to distinguish electrical permits
  const appWithType = { ...app, type: 'Electrical Permit' };
  
  switch(app.status) {
    case 'pending':
      organizedElectricalData.pending.push(appWithType);
      break;
    case 'in-review':
      organizedElectricalData.inReview.push(appWithType);
      break;
    case 'approved':
      organizedElectricalData.approved.push(appWithType);
      break;
    case 'rejected':
      organizedElectricalData.rejected.push(appWithType);
      break;
    default:
      organizedElectricalData.pending.push(appWithType);
  }
});
      
      setElectricalApplications(organizedElectricalData);
    }
  } catch (error) {
    console.error("Error fetching electrical applications:", error);
  }
};
// Fetch all cedula applications and organize by status
const fetchCedulaApplications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cedula-applications`, {
      withCredentials: true
    });
    
    if (response.data.success) {
      // Organize cedula applications by status
      const organizedCedulaData = {
        pending: [],
        inReview: [],
        approved: [],
        rejected: []
      };
      
      response.data.applications.forEach(app => {
        // Add type field to distinguish cedula applications
        const appWithType = { ...app, type: 'Cedula' };
        
        switch(app.status) {
          case 'pending':
            organizedCedulaData.pending.push(appWithType);
            break;
          case 'in-review':
            organizedCedulaData.inReview.push(appWithType);
            break;
          case 'approved':
            organizedCedulaData.approved.push(appWithType);
            break;
          case 'rejected':
            organizedCedulaData.rejected.push(appWithType);
            break;
          default:
            organizedCedulaData.pending.push(appWithType);
        }
      });
      
      setCedulaApplications(organizedCedulaData);
    }
  } catch (error) {
    console.error("Error fetching cedula applications:", error);
  }
};

// View specific cedula application by ID
const handleViewCedulaApplication = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cedula-applications/${id}`, {
      withCredentials: true,
    });

    if (response.data.success) {
      setSelectedApplication(response.data.application);
      setModalVisible(true);
    } else {
      alert("Cedula application not found.");
    }
  } catch (error) {
    console.error("Failed to fetch cedula application info:", error);
  }
};

// Accept cedula application
const handleAcceptCedulaApplication = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/cedula-applications/${id}/accept`, 
      { status: 'approved' }, // Add status in request body
      { withCredentials: true }
    );

    if (response.data.success) {
      await fetchCedulaApplications(); // Refresh cedula applications
    } else {
      alert("Failed to accept the cedula application.");
    }
  } catch (err) {
    console.error("Accept cedula application error:", err);
  }
};

  return (
  <div className="flex h-screen bg-gray-100">
    {/* Sidebar Component */}
    <Sidebar 
      userData={userData} 
      onLogout={handleLogout} 
      isLoading={isLoading}
      onNavigate={handleNavigate}
    />

    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Application Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <Bell size={20} className="text-gray-600 cursor-pointer" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </div>
            <a 
              href="/Employeeprofile" 
              className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors"
            >
              <User size={16} />
              </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-t flex">
          {['pending', 'inReview', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium text-sm focus:outline-none ${
                selectedTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
  tab === 'pending' ? 'bg-yellow-100 text-yellow-800' :
  tab === 'inReview' ? 'bg-blue-100 text-blue-800' :
  tab === 'approved' ? 'bg-green-100 text-green-800' :
  'bg-red-100 text-red-800'
}`}>
  {applications[tab].length + electricalApplications[tab].length + cedulaApplications[tab].length}
</span>
            </button>
          ))}
        </div>
      </header>

      {/* Application Cards */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="grid grid-cols-1 gap-4">
          {getCurrentApplications().length > 0 ? (
  getCurrentApplications().map((application) => (
    <div key={`${application.type === 'Electrical Permit' ? 'electrical' : 'business'}-${application.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => toggleExpandApplication(application.id)}>
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div className="ml-4">
            <h3 className="font-medium">{application.name || application.applicant_name}</h3>
            <p className="text-sm text-gray-500">
              {application.type || 'Electrical Permit'} • Submitted on {new Date(application.submitted || application.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="space-x-2">
  <button
    onClick={() => {
      if (application.type === 'Electrical Permit') {
        handleViewElectricalApplication(application.id);
      } else if (application.type === 'Cedula') {
        handleViewCedulaApplication(application.id);
      } else {
        handleViewApplication(application.id);
      }
    }}
    className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
    View Info
  </button>

  {application.status === "pending" && (
    <button
      onClick={() => {
        if (application.type === 'Electrical Permit') {
          handleAcceptElectricalApplication(application.id);
        } else if (application.type === 'Cedula') {
          handleAcceptCedulaApplication(application.id);
        } else {
          handleAcceptApplication(application.id);
        }
      }}
      className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
      Accept
    </button>
  )}
</div>
      </div>
      {expandedApplication === application.id && (
        <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
          <p><strong>Type:</strong> {application.type || 'Electrical Permit'}</p>
          <p><strong>Submitted:</strong> {new Date(application.submitted || application.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {application.status}</p>
        </div>
      )}
    </div>
  ))
) : (
  <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
    No applications found in this category.
  </div>
)}
          
          {/* Improved Modal */}
          {modalVisible && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                  <button
                    className="absolute top-4 right-4 text-white hover:text-red-300 text-2xl font-bold transition-colors"
                    onClick={() => setModalVisible(false)}
                  >
                    ×
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
  {selectedApplication?.type === 'Electrical Permit' ? 'Electrical Permit Application' : 'Business Permit Application'}
</h2>
                      <p className="text-blue-100">Application Details & Information</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="p-6 space-y-6">
                    
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Status: {selectedApplication.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>

                  {/* Business Information */}
<div className="bg-gray-50 rounded-lg p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    <div className="bg-blue-100 p-2 rounded-lg mr-3">
      <FileText size={18} className="text-blue-600" />
    </div>
    {selectedApplication?.type === 'Electrical Permit' ? 'Project Information' : 'Business Information'}
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'Scope of Work' : 'Business Name'}
        </label>
        <p className="text-gray-800 font-medium">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.scope_of_work || 'N/A')
            : (selectedApplication.business_name || 'N/A')
          }
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'Use or Character' : 'Trade Name'}
        </label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.use_or_character || 'N/A')
            : (selectedApplication.trade_name || 'N/A')
          }
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'Construction Owned' : 'Business Type'}
        </label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.construction_owned || 'N/A')
            : (selectedApplication.business_type || 'N/A')
          }
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'Form of Ownership' : 'Application Type'}
        </label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.form_of_ownership || 'N/A')
            : (selectedApplication.application_type || 'N/A')
          }
        </p>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'Building Permit No' : 'Business Address'}
        </label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.building_permit_no || 'N/A')
            : (selectedApplication.business_address || 'N/A')
          }
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'EP No' : 'Postal Code'}
        </label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.ep_no || 'N/A')
            : (selectedApplication.business_postal_code || 'N/A')
          }
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-black">Email</label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.email || 'N/A')
            : (selectedApplication.business_email || 'N/A')
          }
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-black">
          {selectedApplication?.type === 'Electrical Permit' ? 'Telephone' : 'Phone Number'}
        </label>
        <p className="text-gray-900">
          {selectedApplication?.type === 'Electrical Permit' 
            ? (selectedApplication.telephone_no || 'N/A')
            : (selectedApplication.business_telephone || 'N/A')
          }
        </p>
      </div>
    </div>
  </div>
</div>


                    {/* Owner Information */}
<div className="bg-green-50 rounded-lg p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    <div className="bg-green-100 p-2 rounded-lg mr-3">
      <User size={18} className="text-green-600" />
    </div>
    {selectedApplication?.type === 'Electrical Permit' ? 'Applicant Information' : 'Owner Information'}
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-black">Full Name</label>
        <p className="text-gray-800 font-medium">
          {selectedApplication?.type === 'Electrical Permit' 
            ? `${selectedApplication.first_name || ''} ${selectedApplication.middle_initial || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'
            : `${selectedApplication.first_name || ''} ${selectedApplication.middle_name || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'
          }
        </p>
      </div>
      {selectedApplication?.type !== 'Electrical Permit' && (
        <>
          <div>
            <label className="text-sm font-medium text-black">Owner Address</label>
            <p className="text-gray-900">{selectedApplication.owner_address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Postal Code</label>
            <p className="text-gray-900">{selectedApplication.owner_postal_code || 'N/A'}</p>
          </div>
        </>
      )}
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-black">Email</label>
        <p className="text-gray-900">{selectedApplication.email || selectedApplication.owner_email || 'N/A'}</p>
      </div>
      {selectedApplication?.type !== 'Electrical Permit' && (
        <>
          <div>
            <label className="text-sm font-medium text-black">Phone Number</label>
            <p className="text-gray-900">{selectedApplication.owner_telephone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Mobile Number</label>
            <p className="text-gray-900">{selectedApplication.owner_mobile || 'N/A'}</p>
          </div>
        </>
      )}
      {selectedApplication?.type === 'Electrical Permit' && (
        <div>
          <label className="text-sm font-medium text-black">Telephone</label>
          <p className="text-gray-900">{selectedApplication.telephone_no || 'N/A'}</p>
        </div>
      )}
    </div>
  </div>
</div>

                   {/* Application Details */}
<div className="bg-purple-50 rounded-lg p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    <div className="bg-purple-100 p-2 rounded-lg mr-3">
      <FileText size={18} className="text-purple-600" />
    </div>
    Application Details
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {selectedApplication?.type === 'Electrical Permit' ? (
      // Electrical Permit Details
      <>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Application No</label>
            <p className="text-gray-900 font-mono">{selectedApplication.application_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">EP No</label>
            <p className="text-gray-900 font-mono">{selectedApplication.ep_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Building Permit No</label>
            <p className="text-gray-900 font-mono">{selectedApplication.building_permit_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">TIN</label>
            <p className="text-gray-900 font-mono">{selectedApplication.tin || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Application Date</label>
            <p className="text-gray-900">{selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Last Updated</label>
            <p className="text-gray-900">{selectedApplication.updated_at ? new Date(selectedApplication.updated_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Construction Owned</label>
            <p className="text-gray-900">{selectedApplication.construction_owned || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Form of Ownership</label>
            <p className="text-gray-900">{selectedApplication.form_of_ownership || 'N/A'}</p>
          </div>
        </div>
      </>
    ) : (
      // Business Permit Details
      <>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Business ID</label>
            <p className="text-gray-900 font-mono">{selectedApplication.business_id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">TIN Number</label>
            <p className="text-gray-900 font-mono">{selectedApplication.tin_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Registration Number</label>
            <p className="text-gray-900 font-mono">{selectedApplication.registration_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Payment Mode</label>
            <p className="text-gray-900">{selectedApplication.payment_mode || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Application Date</label>
            <p className="text-gray-900">{selectedApplication.application_date ? new Date(selectedApplication.application_date).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Registration Date</label>
            <p className="text-gray-900">{selectedApplication.registration_date ? new Date(selectedApplication.registration_date).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Tax Incentive</label>
            <p className="text-gray-900">{selectedApplication.tax_incentive || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Emergency Contact</label>
            <p className="text-gray-900">{selectedApplication.emergency_contact || 'N/A'}</p>
          </div>
        </div>
      </>
    )}
  </div>
</div>

                    {/* Business Activities */}
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <div className="bg-orange-100 p-2 rounded-lg mr-3">
                          <FileText size={18} className="text-orange-600" />
                        </div>
                        Business Activities
                      </h3>
                      
                      {selectedApplication.activities?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Line of Business</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Units</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Capitalization</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-black">Date Added</th>
                              </tr> 
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedApplication.activities.map((activity, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{activity.line_of_business}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{activity.units}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">₱{Number(activity.capitalization).toLocaleString()}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(activity.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                          <p>No business activities recorded</p>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
                {selectedApplication?.type === 'Electrical Permit' && (
  <>
    {/* Electrical Permit Information */}
    <div className="bg-yellow-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
          <FileText size={18} className="text-yellow-600" />
        </div>
        Electrical Permit Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Application No</label>
            <p className="text-gray-800 font-medium">{selectedApplication.application_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">EP No</label>
            <p className="text-gray-900">{selectedApplication.ep_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Building Permit No</label>
            <p className="text-gray-900">{selectedApplication.building_permit_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Scope of Work</label>
            <p className="text-gray-900">{selectedApplication.scope_of_work || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">TIN</label>
            <p className="text-gray-900">{selectedApplication.tin || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Construction Owned</label>
            <p className="text-gray-900">{selectedApplication.construction_owned || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Form of Ownership</label>
            <p className="text-gray-900">{selectedApplication.form_of_ownership || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Use or Character</label>
            <p className="text-gray-900">{selectedApplication.use_or_character || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Telephone No</label>
            <p className="text-gray-900">{selectedApplication.telephone_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Email</label>
            <p className="text-gray-900">{selectedApplication.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Status</label>
            <p className="text-gray-900">{selectedApplication.status || 'Pending'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Application Date</label>
            <p className="text-gray-900">{selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Address Information */}
    <div className="bg-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <FileText size={18} className="text-blue-600" />
        </div>
        Address Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Property Address</h4>
          <div>
            <label className="text-sm font-medium text-black">Address No</label>
            <p className="text-gray-900">{selectedApplication.address_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Street</label>
            <p className="text-gray-900">{selectedApplication.address_street || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Barangay</label>
            <p className="text-gray-900">{selectedApplication.address_barangay || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">City</label>
            <p className="text-gray-900">{selectedApplication.address_city || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Zip Code</label>
            <p className="text-gray-900">{selectedApplication.address_zip_code || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Installation Location</h4>
          <div>
            <label className="text-sm font-medium text-black">Street</label>
            <p className="text-gray-900">{selectedApplication.location_street || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Lot No</label>
            <p className="text-gray-900">{selectedApplication.location_lot_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Block No</label>
            <p className="text-gray-900">{selectedApplication.location_blk_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">TCT No</label>
            <p className="text-gray-900">{selectedApplication.location_tct_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Tax Declaration No</label>
            <p className="text-gray-900">{selectedApplication.location_tax_dec_no || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Barangay</label>
            <p className="text-gray-900">{selectedApplication.location_barangay || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">City</label>
            <p className="text-gray-900">{selectedApplication.location_city || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
{selectedApplication?.type === 'Cedula' && (
  <>
    {/* Cedula Information */}
    <div className="bg-indigo-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
          <FileText size={18} className="text-indigo-600" />
        </div>
        Cedula Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Full Name</label>
            <p className="text-gray-800 font-medium">{selectedApplication.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Address</label>
            <p className="text-gray-900">{selectedApplication.address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Place of Birth</label>
            <p className="text-gray-900">{selectedApplication.place_of_birth || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Date of Birth</label>
            <p className="text-gray-900">{selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Profession</label>
            <p className="text-gray-900">{selectedApplication.profession || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Yearly Income</label>
            <p className="text-gray-900">₱{selectedApplication.yearly_income ? Number(selectedApplication.yearly_income).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Purpose</label>
            <p className="text-gray-900">{selectedApplication.purpose || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Sex</label>
            <p className="text-gray-900">{selectedApplication.sex || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Civil Status</label>
            <p className="text-gray-900">{selectedApplication.marital_status || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">TIN</label>
            <p className="text-gray-900">{selectedApplication.tin || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    <div className="bg-green-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <User size={18} className="text-green-600" />
        </div>
        Contact Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Email</label>
            <p className="text-gray-900">{selectedApplication.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">Application Date</label>
            <p className="text-gray-900">{selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Last Updated</label>
            <p className="text-gray-900">{selectedApplication.updated_at ? new Date(selectedApplication.updated_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-black">User ID</label>
            <p className="text-gray-900">{selectedApplication.user_id || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  </>
)}

  </>
)}

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setModalVisible(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  </div>
);

}