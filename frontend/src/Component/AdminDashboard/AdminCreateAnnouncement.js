// src/AdminDashboard/AdminCreateAnnouncement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';

const API_BASE_URL = 'http://localhost:8081';

const AdminCreateAnnouncement = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // logout
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // edit mode
  const [editingId, setEditingId] = useState(null);

  // list state
  const [announcements, setAnnouncements] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAnnouncements();
    }
  }, [isLoggedIn]);

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUserEmail(response.data.user.email);
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

  // -------- LIST / LOAD ANNOUNCEMENTS ----------

  const fetchAnnouncements = async () => {
    try {
      setListLoading(true);
      setListError('');

      const res = await axios.get(`${API_BASE_URL}/api/admin/announcements`, {
        withCredentials: true,
      });

      if (res.data && res.data.success && Array.isArray(res.data.announcements)) {
        setAnnouncements(res.data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error loading announcements:', err);
      setListError('Failed to load announcements.');
    } finally {
      setListLoading(false);
    }
  };

  // -------- FORM SUBMIT (CREATE / UPDATE) ----------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title.trim() || !body.trim()) {
      setErrorMsg('Please fill in both the title and content.');
      return;
    }

    const payload = {
      title: title.trim(),
      body,
      isPublished,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        // UPDATE existing
        const res = await axios.put(
          `${API_BASE_URL}/api/admin/announcements/${editingId}`,
          payload,
          { withCredentials: true }
        );

        if (res.data && res.data.success) {
          setSuccessMsg('Announcement updated successfully.');
          await fetchAnnouncements();
          clearForm();
        } else {
          setErrorMsg(
            (res.data && res.data.message) ||
              'Failed to update announcement.'
          );
        }
      } else {
        // CREATE new
        const res = await axios.post(
          `${API_BASE_URL}/api/admin/announcements`,
          payload,
          { withCredentials: true }
        );

        if (res.data && res.data.success) {
          setSuccessMsg('Announcement created successfully.');
          await fetchAnnouncements();
          clearForm();
        } else {
          setErrorMsg(
            (res.data && res.data.message) ||
              'Failed to create announcement.'
          );
        }
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setErrorMsg('Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = () => {
    setTitle('');
    setBody('');
    setIsPublished(true);
    setEditingId(null);
  };

  // -------- EDIT / DELETE HANDLERS ----------

  const handleEditClick = (ann) => {
    setEditingId(ann.id);
    setTitle(ann.title || '');
    setBody(ann.body || '');
    setIsPublished(ann.is_published === 1 || ann.is_published === true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleDeleteClick = async (ann) => {
    const ok = window.confirm(
      `Delete this announcement?\n\n"${ann.title}"`
    );
    if (!ok) return;

    try {
      setSubmitting(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/announcements/${ann.id}`,
        { withCredentials: true }
      );

      if (res.data && res.data.success) {
        setSuccessMsg('Announcement deleted successfully.');
        // if we were editing this one, reset form
        if (editingId === ann.id) {
          clearForm();
        }
        await fetchAnnouncements();
      } else {
        setErrorMsg(
          (res.data && res.data.message) || 'Failed to delete announcement.'
        );
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setErrorMsg('Server error while deleting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '';
    // value is usually like "2025-01-16T10:20:30.000Z" or Date string
    try {
      const dt = new Date(value);
      return dt.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(value);
    }
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
                Create Announcement
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-1">
                Publish municipality announcements that will appear on the citizen home page.
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
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Intro + icon */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <Megaphone className="text-blue-500" size={18} />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-semibold">
                  {editingId ? 'Edit Announcement' : 'New Municipality Announcement'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Use this form to post important updates such as schedules, reminders,
                  or advisories.
                </p>
              </div>
            </div>

            {/* Alerts */}
            {successMsg && (
              <div className="mb-1 flex items-center gap-2 text-xs sm:text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-1 flex items-center gap-2 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                  placeholder="e.g. Document Processing Schedule"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400">
                  Keep it short and clear. Max 255 characters.
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Announcement Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  placeholder="Write the announcement details here..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
                <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400">
                  You can include dates, times, and any special instructions for citizens.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Publish immediately</span>
                </label>

                {editingId && (
                  <span className="text-[11px] sm:text-xs text-slate-500">
                    Editing announcement #{editingId}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-600 hover:bg-slate-50"
                >
                  {editingId ? 'Cancel Edit' : 'Clear'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? editingId
                      ? 'Saving…'
                      : 'Posting…'
                    : editingId
                    ? 'Save Changes'
                    : 'Post Announcement'}
                </button>
              </div>
            </form>

            {/* List of existing announcements */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <FileText className="text-slate-500" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold">
                      Existing Announcements
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      View, edit, or remove announcements currently in the system.
                    </p>
                  </div>
                </div>
                {listLoading && (
                  <span className="text-[11px] sm:text-xs text-slate-400">
                    Loading…
                  </span>
                )}
              </div>

              {listError && (
                <p className="mb-2 text-xs sm:text-sm text-red-500">
                  {listError}
                </p>
              )}

              {!listLoading && announcements.length === 0 && !listError && (
                <p className="text-xs sm:text-sm text-slate-500">
                  No announcements have been posted yet.
                </p>
              )}

              {!listLoading && announcements.length > 0 && (
                <div className="space-y-2">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="border border-slate-200 rounded-xl px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between bg-slate-50/40"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {ann.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              ann.is_published
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {ann.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                          {ann.body}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Posted: {formatDateTime(ann.posted_at)}{' '}
                          {ann.updated_at &&
                            `• Updated: ${formatDateTime(ann.updated_at)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClick(ann)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(ann)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-[11px] text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCreateAnnouncement;
