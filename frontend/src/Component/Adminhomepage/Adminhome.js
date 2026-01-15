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
  <div
    className="flex h-screen bg-white text-slate-900 overflow-hidden"
    style={{
      fontFamily:
        'Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >
    {/* Sidebar */}
    <AdminSidebar handleLogout={handleLogout} isLoading={isLoading} />

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* ...the rest is the same */}
        {/* Header */}
        <header className="bg-white/90 border-b border-slate-200 backdrop-blur sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-3 sm:gap-0 items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-1">
                Quick summary of employees, offices, and citizen applications.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Simple avatar */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 flex items-center justify-center text-[11px] sm:text-xs font-semibold text-slate-700">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium leading-tight">
                  {userEmail || 'Admin User'}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                  System Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 py-4 sm:py-6 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
                Admin Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitor overall activity and status of municipal document processing.
              </p>
            </div>

            {/* Top stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
              {/* Employees */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
                      Total Employees
                    </p>
                    <p className="mt-3 text-2xl sm:text-3xl font-semibold">
                      {statsLoading ? '…' : totals.totalEmployees ?? 0}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users size={18} className="sm:size-[20px] text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Offices */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
                      Total Offices
                    </p>
                    <p className="mt-3 text-2xl sm:text-3xl font-semibold">
                      {statsLoading ? '…' : totals.totalOffices ?? 0}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Building size={18} className="sm:size-[20px] text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Applications */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
                      Total Applications
                    </p>
                    <p className="mt-3 text-2xl sm:text-3xl font-semibold">
                      {statsLoading ? '…' : totals.totalApplications ?? 0}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <FileText size={18} className="sm:size-[20px] text-violet-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Applications by status */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm md:text-base font-semibold">
                    Applications by Status
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                    Track how many applications are in each processing stage.
                  </p>
                </div>
                {statsLoading && (
                  <span className="text-[11px] sm:text-xs text-slate-400">
                    Loading…
                  </span>
                )}
              </div>

              {statsError && (
                <p className="text-xs sm:text-sm text-red-500 mb-3">
                  {statsError}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {STATUS_CONFIG.map((status) => (
                  <div
                    key={status.key}
                    className="flex flex-col gap-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5"
                  >
                    <span className="text-[11px] sm:text-xs font-medium text-slate-600 break-words">
                      {status.label}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${status.badgeClass}`}
                    >
                      {statusCounts[status.key] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
