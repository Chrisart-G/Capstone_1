// src/AdminDashboard/AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Inbox, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';

const API_BASE_URL = 'http://localhost:8081';

const statusBadgeClass = {
  unread: 'bg-blue-100 text-blue-800',
  read: 'bg-slate-100 text-slate-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const AdminNotifications = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // for logout
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUserEmail(response.data.user.email);
        fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/notifications`,
        { withCredentials: true }
      );
      setNotifications(res.data.notifications || []);
      setNotifError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifError('Failed to load notifications.');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        { withCredentials: true }
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

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      alert('Failed to update notification.');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  };

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
        {/* Header */}
        <header className="bg-white/90 border-b border-slate-200 backdrop-blur sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-3 sm:gap-0 items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
                Notifications Center
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-1">
                View requests and important notifications sent by employees.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
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
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bell className="text-slate-600" size={18} />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-semibold">
                    All Notifications
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Track employee requests such as account updates and other alerts.
                  </p>
                </div>
              </div>

              <button
                onClick={fetchNotifications}
                disabled={notifLoading}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>

            {notifError && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertCircle size={14} />
                <span>{notifError}</span>
              </div>
            )}

            {notifLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mb-3" />
                <p className="text-xs sm:text-sm">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Inbox size={32} className="mb-3" />
                <p className="text-xs sm:text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm"
                  >
                    <div className="mt-0.5">
                      {notif.status === 'unread' ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs">
                          !
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600">
                          <CheckCircle size={16} />
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {notif.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            statusBadgeClass[notif.status] ||
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {notif.status.charAt(0).toUpperCase() +
                            notif.status.slice(1)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs sm:text-sm text-slate-600 whitespace-pre-line">
                        {notif.message || 'No additional details.'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400">
                        <span>
                          Type:{' '}
                          <span className="font-medium text-slate-500">
                            {notif.type}
                          </span>
                        </span>
                        <span>Created: {formatDate(notif.created_at)}</span>
                      </div>
                    </div>

                    {notif.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="self-start text-[11px] sm:text-xs mt-1 px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;
