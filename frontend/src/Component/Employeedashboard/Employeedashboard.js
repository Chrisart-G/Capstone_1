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
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleExpandApplication(application.id)}
                  >
                    <div className="flex items-center">
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
                    <span className="text-sm text-gray-500">
                      {application.documentCount || 0} Activities
                    </span>
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
          </div>
        </main>
      </div>
    </div>
  );
}