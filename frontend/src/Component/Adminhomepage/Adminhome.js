// src/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Building, FileText } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';

const API_BASE_URL = 'http://localhost:8081';

// map DB status values -> display label + badge colors
const STATUS_CONFIG = [
  { key: 'pending', label: 'Pending', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { key: 'in-review', label: 'InReview', badgeClass: 'bg-blue-100 text-blue-800' },
  { key: 'in-progress', label: 'InProgress', badgeClass: 'bg-orange-100 text-orange-800' },
  {
    key: 'requirements-completed',
    label: 'RequirementsCompleted',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  { key: 'approved', label: 'Approved', badgeClass: 'bg-green-100 text-green-800' },
  {
    key: 'ready-for-pickup',
    label: 'ReadyForPickup',
    badgeClass: 'bg-pink-100 text-pink-800',
  },
  { key: 'rejected', label: 'Rejected', badgeClass: 'bg-red-100 text-red-800' },
  { key: 'completed', label: 'Completed', badgeClass: 'bg-gray-100 text-gray-800' }, // used by building
];

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // for logout button
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin-dashboard/stats`, {
        withCredentials: true,
      });
      setDashboardStats(res.data);
      setStatsError(null);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStatsError('Failed to load dashboard statistics.');
    } finally {
      setStatsLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUserEmail(response.data.user.email);
        fetchDashboardStats();
      } else {
        setIsLoggedIn(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      setIsLoggedIn(false);
      setUserEmail('');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = dashboardStats?.totals || {};
  const statusCounts = dashboardStats?.statusCounts || {};

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar handleLogout={handleLogout} isLoading={isLoading} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Dashboard Overview</h1>
            <div className="flex items-center">
              {/* Notification icon removed for now */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                <span>{userEmail || 'Admin User'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-gray-600 mb-6">
              Overview of employees, offices, and citizen applications.
            </p>

            {/* Cards: employees / offices / total apps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Total Employees</h3>
                  <Users size={20} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? '…' : totals.totalEmployees ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Total Offices</h3>
                  <Building size={20} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? '…' : totals.totalOffices ?? 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Total Applications</h3>
                  <FileText size={20} className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? '…' : totals.totalApplications ?? 0}
                </p>
              </div>
            </div>

            {/* Applications by status */}
            <div className="mt-8 bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Applications by Status</h3>
                {statsLoading && (
                  <span className="text-xs text-gray-400">Loading…</span>
                )}
              </div>

              {statsError && (
                <p className="text-sm text-red-500 mb-2">{statsError}</p>
              )}

              <div className="flex flex-wrap gap-4">
                {STATUS_CONFIG.map(status => (
                  <div
                    key={status.key}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <span>{status.label}</span>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-semibold ${status.badgeClass}`}
                    >
                      {statusCounts[status.key] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
