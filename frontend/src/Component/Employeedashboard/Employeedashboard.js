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
        await fetchUserData(); // Get user data after confirming login
        await fetchApplications(); // Get applications data
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
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
              <User size={16} />
            </div>
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
                {applications[tab].length}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Application Cards */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="grid grid-cols-1 gap-4">
          {applications[selectedTab].length > 0 ? (
            applications[selectedTab].map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center cursor-pointer" onClick={() => toggleExpandApplication(application.id)}>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{application.name}</h3>
                      <p className="text-sm text-gray-500">
                        {application.type} • Submitted on {new Date(application.submitted).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-x-2">
                   <button
                       onClick={() => handleViewApplication(application.id)}
                       className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                       View Info
                        </button>

                    {application.status === "pending" && (
                      <button
                        onClick={() => handleAcceptApplication(application.id)}
                        className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
                {expandedApplication === application.id && (
                  <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
                    <p><strong>Type:</strong> {application.type}</p>
                    <p><strong>Submitted:</strong> {new Date(application.submitted).toLocaleDateString()}</p>
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
                      <h2 className="text-2xl font-bold">Business Permit Application</h2>
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
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-black">Business Name</label>
                            <p className="text-gray-800 font-medium">{selectedApplication.business_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Trade Name</label>
                            <p className="text-gray-900">{selectedApplication.trade_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Business Type</label>
                            <p className="text-gray-900">{selectedApplication.business_type || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Application Type</label>
                            <p className="text-gray-900">{selectedApplication.application_type || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-black">Business Address</label>
                            <p className="text-gray-900">{selectedApplication.business_address || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Postal Code</label>
                            <p className="text-gray-900">{selectedApplication.business_postal_code || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Email</label>
                            <p className="text-gray-900">{selectedApplication.business_email || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Phone Number</label>
                            <p className="text-gray-900">{selectedApplication.business_telephone || 'N/A'}</p>
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
                        Owner Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-black">Full Name</label>
                            <p className="text-gray-800 font-medium">
                              {`${selectedApplication.first_name || ''} ${selectedApplication.middle_name || ''} ${selectedApplication.last_name || ''}`.trim() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Owner Address</label>
                            <p className="text-gray-900">{selectedApplication.owner_address || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Postal Code</label>
                            <p className="text-gray-900">{selectedApplication.owner_postal_code || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-black">Email</label>
                            <p className="text-gray-900">{selectedApplication.owner_email || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Phone Number</label>
                            <p className="text-gray-900">{selectedApplication.owner_telephone || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">Mobile Number</label>
                            <p className="text-gray-900">{selectedApplication.owner_mobile || 'N/A'}</p>
                          </div>
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