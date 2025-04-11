
import React, { useState, useEffect } from 'react';
import { Bell, Users, Building, ChevronDown, ChevronRight, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8081";
const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [expanded, setExpanded] = useState({
    employees: false,
    offices: false,
    notifications: false
  });

  const toggleExpand = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };
  useEffect(() => {
    // Check session status when component mounts
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true
      });
      
      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUserEmail(response.data.user.email);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { 
        withCredentials: true 
      });
      
      setIsLoggedIn(false);
      setUserEmail('');
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  

  // Placeholder content for the main area
  const renderContent = () => {
    switch (activePage) {
      case 'manageEmployees':
        return <h2 className="text-2xl font-bold">Manage Employees</h2>;
      case 'createOffice':
        return <h2 className="text-2xl font-bold">Create Office</h2>;
      case 'notifications':
        return <h2 className="text-2xl font-bold">Notifications</h2>;
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            <p className="text-gray-600 mb-4">Welcome to your admin dashboard. Use the sidebar to navigate to different sections.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Total Employees</h3>
                  <Users size={20} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold">248</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Office Locations</h3>
                  <Building size={20} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">New Notifications</h3>
                  <Bell size={20} className="text-red-500" />
                </div>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
  {/* Sidebar */}
  <div className="w-64 bg-blue-700 text-white flex flex-col">
  <img src="/img/logo.png" alt="Company Logo" className="h-50 w-50 " />
    <div className="p-4 border-b border-gray-700 flex items-center">
      <h1 className="text-xl font-bold">Hinigaran Municipality</h1>
    </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            <div 
              className={`flex items-center p-3 rounded-lg cursor-pointer ${activePage === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              onClick={() => setActivePage('dashboard')}
            >
              <LayoutDashboard size={18} className="mr-2" />
              <span>Dashboard</span>
            </div>
            
            {/* Manage Employees Section */}
            <div className="mt-2">
              <div 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => toggleExpand('employees')}
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-2" />
                  <span>Manage Employees</span>
                </div>
                {expanded.employees ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              
              {expanded.employees && (
                <div className="ml-6 mt-1">
                  <div 
                    className={`p-2 rounded-lg cursor-pointer ${activePage === 'manageEmployees' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActivePage('manageEmployees')}
                  >
                    View All Employees
                  </div>
                  <div 
                    className="p-2 rounded-lg cursor-pointer hover:bg-gray-700"
                  >
                    Add New Employee
                  </div>
                </div>
              )}
            </div>
            
            {/* Create Office Section */}
            <div className="mt-2">
              <div 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => toggleExpand('offices')}
              >
                <div className="flex items-center">
                  <Building size={18} className="mr-2" />
                  <span>Create Office</span>
                </div>
                {expanded.offices ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              
              {expanded.offices && (
                <div className="ml-6 mt-1">
                  <div 
                    className={`p-2 rounded-lg cursor-pointer ${activePage === 'createOffice' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActivePage('createOffice')}
                  >
                    New Office
                  </div>
                  <div 
                    className="p-2 rounded-lg cursor-pointer hover:bg-gray-700"
                  >
                    Manage Locations
                  </div>
                </div>
              )}
            </div>
            
            {/* Notifications Section */}
            <div className="mt-2">
              <div 
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => toggleExpand('notifications')}
              >
                <div className="flex items-center">
                  <Bell size={18} className="mr-2" />
                  <span>Notifications</span>
                </div>
                {expanded.notifications ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              
              {expanded.notifications && (
                <div className="ml-6 mt-1">
                  <div 
                    className={`p-2 rounded-lg cursor-pointer ${activePage === 'notifications' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                    onClick={() => setActivePage('notifications')}
                  >
                    All Notifications
                  </div>
                  <div 
                    className="p-2 rounded-lg cursor-pointer hover:bg-gray-700"
                  >
                    Create Announcement
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700">
            <Settings size={18} className="mr-2" />
            <span>Settings</span>
          </div>
          <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700">
          <button
                onClick={handleLogout}
                disabled={isLoading}
                className="hover:text-blue-200 flex items-center"
              >
                Log Out
              </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold"></h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <Bell size={20} className="cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">5</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                <span>Admin User</span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;