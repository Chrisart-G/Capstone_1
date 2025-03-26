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

const MunicipalLandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header (Navbar) */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/api/placeholder/50/50" 
              alt="Municipal Seal" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-full"
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

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
          Online Municipal Document Processing Municipality of Hinigaran 
        </h1>
        <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
          Request and track municipal documents from the comfort of your home.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg 
          hover:bg-blue-700 transition duration-300 shadow-lg">
          Get Started
        </button>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <FileText className="mx-auto mb-3 md:mb-4 text-blue-600" size={40} md={50} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Easy Requests</h3>
            <p className="text-sm md:text-base text-gray-600">Simple and intuitive document request process</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <Shield className="mx-auto mb-3 md:mb-4 text-green-600" size={40} md={50} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Secure Processing</h3>
            <p className="text-sm md:text-base text-gray-600">Your data is protected with advanced security</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <Clock className="mx-auto mb-3 md:mb-4 text-purple-600" size={40} md={50} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Quick Approvals</h3>
            <p className="text-sm md:text-base text-gray-600">Fast processing and document delivery</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 md:py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg md:text-xl font-bold mb-4">Contact Information</h4>
            <div className="space-y-2">
              <p className="flex items-center text-sm md:text-base">
                <MapPin className="mr-2" size={18} /> 
                123 Municipal Plaza, City, State 12345
              </p>
              <p className="flex items-center text-sm md:text-base">
                <Phone className="mr-2" size={18} /> 
                (555) 123-4567
              </p>
              <p className="flex items-center text-sm md:text-base">
                <Mail className="mr-2" size={18} /> 
                contact@municipality.gov
              </p>
            </div>
          </div>
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg md:text-xl font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Home</a>
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Request Document</a>
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Track Status</a>
              <a href="#" className="text-sm md:text-base hover:text-blue-300 block">Login</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-300">
                <Facebook size={24} md={30} />
              </a>
              <a href="#" className="hover:text-blue-300">
                <Twitter size={24} md={30} />
              </a>
              <a href="#" className="hover:text-blue-300">
                <Instagram size={24} md={30} />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-6 md:mt-8 border-t border-gray-700 pt-4 text-sm md:text-base">
          © 2024 Municipality Services. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default MunicipalLandingPage;