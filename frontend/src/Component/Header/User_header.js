// components/Uheader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Home, FileText, Clock, Menu, X, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const Dot = ({ show }) =>
  show ? (
    <span
      className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-red-500"
      aria-label="new"
      title="New activity"
    />
  ) : null;

function Uheader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [badges, setBadges] = useState({ requestDocument: 0, trackStatus: 0 });
  const [loadingBadges, setLoadingBadges] = useState(true);

  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  };
  const toggleProfileDropdown = () =>
    setProfileDropdownOpen(!profileDropdownOpen);

  useEffect(() => {
    function handleClickOutside(e) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target))
        setMobileMenuOpen(false);
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      )
        setProfileDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true,
      });
      if (data.loggedIn) {
        setIsLoggedIn(true);
        setUserEmail(data.user.email);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setIsLoggedIn(false);
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

  // ---- badges loader + polling ----
  useEffect(() => {
    let alive = true;
    let timer;

    const loadBadges = async () => {
      try {
        setLoadingBadges(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/api/user/nav/badges`,
          { withCredentials: true }
        );
        if (!alive) return;
        setBadges(data?.badges || { requestDocument: 0, trackStatus: 0 });
      } catch (err) {
        if (alive) setBadges({ requestDocument: 0, trackStatus: 0 });
      } finally {
        if (alive) setLoadingBadges(false);
      }
    };

    loadBadges();
    timer = setInterval(loadBadges, 15000);
    const onVis = () =>
      document.visibilityState === 'visible' && loadBadges();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // ---- mark-as-seen + navigate handlers ----
  const goPermits = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/user/nav/mark/request-doc-viewed`,
        {},
        { withCredentials: true }
      );
      setBadges((b) => ({ ...b, requestDocument: 0 })); // optimistic clear
    } catch {}
    window.location.href = '/Permits';
  };

  const goTrack = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/user/nav/mark/track-status-viewed`,
        {},
        { withCredentials: true }
      );
      setBadges((b) => ({ ...b, trackStatus: 0 })); // optimistic clear
    } catch {}
    window.location.href = '/Docutracker';
  };

  return (
    <div className="header relative z-50">
      {/* Top bar – darker slate palette to blend with Home.js */}
      <header className="bg-slate-900/85 backdrop-blur-md border-b border-white/10 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          {/* Left side: title only (logo removed) */}
          <div className="flex flex-col">
            <span className="text-base md:text-lg lg:text-xl font-semibold leading-tight">
              ODPMH Services
            </span>

          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <a
              href="/Chome"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-slate-100 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Home size={18} />
              <span>Home</span>
            </a>

            <a
              href="/Permits"
              onClick={goPermits}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-slate-100 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <FileText size={18} />
              <span>Request Document</span>
              {!loadingBadges && <Dot show={badges.requestDocument > 0} />}
            </a>

            <a
              href="/Docutracker"
              onClick={goTrack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-slate-100 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Clock size={18} />
              <span>Track Status</span>
              {!loadingBadges && <Dot show={badges.trackStatus > 0} />}
            </a>

            {/* Profile Dropdown */}
            <div className="relative ml-1" ref={profileDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-slate-100 hover:bg-slate-800/80 hover:text-white transition-colors focus:outline-none"
              >
                <User size={18} />
                <span>Profile</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-1 z-50 border border-slate-100">
                  <a
                    href="/Userprofile"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50"
                  >
                    My Profile
                  </a>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isLoading ? 'Logging out...' : 'Log Out'}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="focus:outline-none p-2 rounded-full hover:bg-slate-800/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed top-[64px] left-0 w-full h-auto bg-slate-900/95 backdrop-blur-md shadow-lg z-40 transform transition-transform duration-300 ease-in-out"
        >
          <nav className="flex flex-col items-start py-3">
            <a
              href="/Chome"
              className="w-full px-6 py-3 hover:bg-slate-800 flex items-center text-sm font-medium text-slate-100"
            >
              <Home className="mr-3" size={20} /> Home
            </a>

            <a
              href="/Permits"
              onClick={goPermits}
              className="w-full px-6 py-3 hover:bg-slate-800 flex items-center text-sm font-medium text-slate-100"
            >
              <FileText className="mr-3" size={20} /> Request Document
              {!loadingBadges && <Dot show={badges.requestDocument > 0} />}
            </a>

            <a
              href="/Docutracker"
              onClick={goTrack}
              className="w-full px-6 py-3 hover:bg-slate-800 flex items-center text-sm font-medium text-slate-100"
            >
              <Clock className="mr-3" size={20} /> Track Status
              {!loadingBadges && <Dot show={badges.trackStatus > 0} />}
            </a>

            <a
              href="/Userprofile"
              className="w-full px-6 py-3 hover:bg-slate-800 flex items-center text-sm font-medium text-slate-100"
            >
              <User className="mr-3" size={20} /> My Profile
            </a>

            <a
              href="/Usersettings"
              className="w-full px-6 py-3 hover:bg-slate-800 flex items-center text-sm font-medium text-slate-100"
            >
              Settings
            </a>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full text-left px-6 py-3 hover:bg-slate-800 flex items-center text-sm font-medium text-slate-100 disabled:opacity-60"
            >
              {isLoading ? 'Logging out...' : 'Log Out'}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Uheader;
