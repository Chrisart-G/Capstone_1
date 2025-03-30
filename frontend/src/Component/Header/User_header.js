
import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram,
  Menu,
  X
} from 'lucide-react';

function Uheader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
      const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
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
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-blue-200 flex items-center">
              <Home className="mr-2" size={20} /> Home
            </a>
            <a href="#" className="hover:text-blue-200 flex items-center">
              <FileText className="mr-2" size={20} /> Request Document
            </a>
            <a href="#" className="hover:text-blue-200 flex items-center">
              <Clock className="mr-2" size={20} /> Track Status
            </a>
            <a href="#" className="hover:text-blue-200 flex items-center">
              Login
            </a>
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
              <a href="#" className="hover:text-blue-200 flex items-center">
                <Home className="mr-2" size={20} /> Home
              </a>
              <a href="#" className="hover:text-blue-200 flex items-center">
                <FileText className="mr-2" size={20} /> Request Document
              </a>
              <a href="#" className="hover:text-blue-200 flex items-center">
                <Clock className="mr-2" size={20} /> Track Status
              </a>
              <a href="#" className="hover:text-blue-200 flex items-center">
                Login
              </a>
            </nav>
          </div>
        )}
      </header>
   
    </div>
  );
}

export default Uheader;
