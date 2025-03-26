import React from 'react';
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
  Instagram 
} from 'lucide-react';

const MunicipalLandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header (Navbar) */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/api/placeholder/50/50" 
              alt="Municipal Seal" 
              className="h-12 w-12 rounded-full"
            />
            <span className="text-xl font-bold">Municipal Services</span>
          </div>
          <nav className="space-x-6">
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
      </header>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
        Online Municipal Document Processing Municipality of Hinigaran 
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Request and track municipal documents from the comfort of your home.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg 
          hover:bg-blue-700 transition duration-300 shadow-lg">
          Get Started
        </button>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FileText className="mx-auto mb-4 text-blue-600" size={50} />
            <h3 className="text-xl font-semibold mb-2">Easy Requests</h3>
            <p className="text-gray-600">Simple and intuitive document request process</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Shield className="mx-auto mb-4 text-green-600" size={50} />
            <h3 className="text-xl font-semibold mb-2">Secure Processing</h3>
            <p className="text-gray-600">Your data is protected with advanced security</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Clock className="mx-auto mb-4 text-purple-600" size={50} />
            <h3 className="text-xl font-semibold mb-2">Quick Approvals</h3>
            <p className="text-gray-600">Fast processing and document delivery</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4">Contact Information</h4>
            <div className="space-y-2">
              <p className="flex items-center">
                <MapPin className="mr-2" size={20} /> 
                123 Municipal Plaza, City, State 12345
              </p>
              <p className="flex items-center">
                <Phone className="mr-2" size={20} /> 
                (555) 123-4567
              </p>
              <p className="flex items-center">
                <Mail className="mr-2" size={20} /> 
                contact@municipality.gov
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#" className="hover:text-blue-300">Home</a>
              <a href="#" className="block hover:text-blue-300">Request Document</a>
              <a href="#" className="block hover:text-blue-300">Track Status</a>
              <a href="#" className="block hover:text-blue-300">Login</a>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-300">
                <Facebook size={30} />
              </a>
              <a href="#" className="hover:text-blue-300">
                <Twitter size={30} />
              </a>
              <a href="#" className="hover:text-blue-300">
                <Instagram size={30} />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 border-t border-gray-700 pt-4">
          © 2024 Municipality Services. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default MunicipalLandingPage;