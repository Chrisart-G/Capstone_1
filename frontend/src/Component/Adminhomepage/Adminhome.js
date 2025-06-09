import React, { useState, useEffect } from 'react';
import { Bell, Users, Building } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';

const API_BASE_URL = "http://localhost:8081";

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        // Redirect to login if not logged in
        navigate('/');
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsLoggedIn(false);
      // Redirect to login on error
      navigate('/');
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        handleLogout={handleLogout}
        isLoading={isLoading}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Dashboard Overview</h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <Bell size={20} className="cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">5</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                <span>{userEmail || 'Admin User'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;