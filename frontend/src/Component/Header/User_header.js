import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  FileText, 
  Clock, 
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = "http://localhost:8081";

function Uheader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const mobileMenuRef = useRef(null);
    const profileDropdownRef = useRef(null);
    const navigate = useNavigate();
    
    // Toggle mobile menu
    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
      // Close profile dropdown if open
      if (profileDropdownOpen) setProfileDropdownOpen(false);
    };
    
    // Toggle profile dropdown
    const toggleProfileDropdown = () => {
      setProfileDropdownOpen(!profileDropdownOpen);
    };

    // Close menus when clicking outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
          setMobileMenuOpen(false);
        }
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
          setProfileDropdownOpen(false);
        }
      }
      
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

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

    
  return (
    <div className="header relative z-50">
        <header className="bg-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-3">
            <img 
              src="/img/logo.png" 
              alt="Municipal Seal" 
              className="h-15 sm:h-16 md:h-20 rounded-full"
            />
            <span className="text-lg md:text-xl font-bold">Municipal Services</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <a href="/Chome" className="hover:text-blue-200 flex items-center">
              <Home className="mr-2" size={20} /> Home
            </a>
            <a href="/Permits" className="hover:text-blue-200 flex items-center">
              <FileText className="mr-2" size={20} /> Request Document
            </a>
            <a href="Docutracker" className="hover:text-blue-200 flex items-center">
              <Clock className="mr-2" size={20} /> Track Status
            </a>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={toggleProfileDropdown}
                className="flex items-center hover:text-blue-200 focus:outline-none"
              >
                <User className="mr-1" size={20} />
                <span className="mr-1">Profile</span>
                <ChevronDown size={16} />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="/Userprofile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <button 
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu - Outside the header for better positioning */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed top-[88px] left-0 w-full h-auto bg-blue-600 shadow-lg z-40 transform transition-transform duration-300 ease-in-out"
        >
          <nav className="flex flex-col items-start py-4">
            <a href="/Chome" className="w-full px-6 py-3 hover:bg-blue-700 flex items-center">
              <Home className="mr-3" size={20} /> Home
            </a>
            <a href="/Permits" className="w-full px-6 py-3 hover:bg-blue-700 flex items-center">
              <FileText className="mr-3" size={20} /> Request Document
            </a>
            <a href="Docutracker" className="w-full px-6 py-3 hover:bg-blue-700 flex items-center">
              <Clock className="mr-3" size={20} /> Track Status
            </a>
            <a href="/Userprofile" className="w-full px-6 py-3 hover:bg-blue-700 flex items-center">
              <User className="mr-3" size={20} /> My Profile
            </a>
            <a href="/Usersettings" className="w-full px-6 py-3 hover:bg-blue-700 flex items-center">
              Settings
            </a>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full text-left px-6 py-3 hover:bg-blue-700 flex items-center"
            >
              {isLoading ? "Logging out..." : "Log Out"}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Uheader;