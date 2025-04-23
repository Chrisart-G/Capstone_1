import React, { useState, useEffect } from 'react';
import {
  Search, Bell, User, FileText, CheckSquare,
  Clock, Archive, Settings, LogOut
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8081";

export default function EmployeeDashboard() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const applications = {
    pending: [
      { id: 1, name: 'John Smith', type: 'Loan Application', submitted: '2025-04-15', documents: 5, status: 'pending' },
      { id: 2, name: 'Sarah Johnson', type: 'Insurance Claim', submitted: '2025-04-14', documents: 3, status: 'pending' },
      { id: 3, name: 'Michael Brown', type: 'Mortgage Request', submitted: '2025-04-12', documents: 7, status: 'pending' },
    ],
    inReview: [
      { id: 4, name: 'Emma Davis', type: 'Credit Application', submitted: '2025-04-10', documents: 4, status: 'in-review' },
      { id: 5, name: 'Robert Wilson', type: 'Loan Application', submitted: '2025-04-09', documents: 6, status: 'in-review' },
    ],
    approved: [
      { id: 6, name: 'Lisa Taylor', type: 'Insurance Claim', submitted: '2025-04-08', documents: 3, status: 'approved' },
      { id: 7, name: 'Thomas Garcia', type: 'Mortgage Request', submitted: '2025-04-05', documents: 8, status: 'approved' },
    ],
    rejected: [
      { id: 8, name: 'Daniel Lee', type: 'Credit Application', submitted: '2025-04-03', documents: 2, status: 'rejected' },
    ],
  };

  const toggleExpandApplication = (id) => {
    setExpandedApplication(prev => (prev === id ? null : id));
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
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

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white flex flex-col justify-between">
        <div>
          <div className="p-4 text-center">
            <img src="img/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
            <h1 className="text-2xl font-bold mt-2">Employee Dashboard</h1>
            <p className="text-indigo-200 text-sm">Hinigaran Municipality</p>
          </div>
          <nav className="mt-6">
            <div className="px-4 py-3 bg-indigo-900 flex items-center">
              <FileText size={20} className="mr-3" />
              <span className="font-medium">Applications</span>
            </div>
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <CheckSquare size={20} className="mr-3" />
              <span>Verifications</span>
            </div>
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <Clock size={20} className="mr-3" />
              <span>History</span>
            </div>
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <Archive size={20} className="mr-3" />
              <span>Archives</span>
            </div>
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-indigo-500">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="ml-3">
              <p className="font-medium">Alex Morgan</p>
              <p className="text-xs text-indigo-300">Senior Approver</p>
            </div>
          </div>
          <div className="mt-3 flex items-center cursor-pointer hover:text-indigo-200">
            <LogOut size={18} className="mr-2" />
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="hover:text-indigo-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

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
            {applications[selectedTab].map((application) => (
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
                        {application.type} • Submitted on {application.submitted}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {application.documents} Documents
                  </span>
                </div>
                {expandedApplication === application.id && (
                  <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
                    <p><strong>Type:</strong> {application.type}</p>
                    <p><strong>Submitted:</strong> {application.submitted}</p>
                    <p><strong>Status:</strong> {application.status}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
