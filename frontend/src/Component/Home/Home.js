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
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
const MunicipalLandingPage = () => {
  

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header (Navbar) */}
      <Uheader></Uheader>


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
      <UFooter></UFooter>
      
    </div>
  );
};

export default MunicipalLandingPage;