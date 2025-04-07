import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Clock, 
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';

function Uheader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    
    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };
    
    const toggleProfileDropdown = () => {
      setProfileDropdownOpen(!profileDropdownOpen);
    };
    
  return (
    <div className="header">
        <header className="bg-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/img/logo.png" 
              alt="Municipal Seal" 
              className="h-20 rounded-full"
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
            <a href="#" className="hover:text-blue-200 flex items-center">
              <Clock className="mr-2" size={20} /> Track Status
            </a>
            
            {/* Profile Dropdown */}
            <div className="relative">
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
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <a href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Log Out
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu} 
              className="focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-blue-700 z-50">
            <nav className="flex flex-col items-center space-y-4 p-4">
              <a href="/Chome" className="hover:text-blue-200 flex items-center">
                <Home className="mr-2" size={20} /> Home
              </a>
              <a href="/Permits" className="hover:text-blue-200 flex items-center">
                <FileText className="mr-2" size={20} /> Request Document
              </a>
              <a href="#" className="hover:text-blue-200 flex items-center">
                <Clock className="mr-2" size={20} /> Track Status
              </a>
              <a href="/profile" className="hover:text-blue-200 flex items-center">
                <User className="mr-2" size={20} /> My Profile
              </a>
              <a href="/settings" className="hover:text-blue-200 flex items-center">
                Settings
              </a>
              <a href="/login" className="hover:text-blue-200 flex items-center">
                Log Out
              </a>
            </nav>
          </div>
        )}
      </header>
   
    </div>
  );
}

export default Uheader;