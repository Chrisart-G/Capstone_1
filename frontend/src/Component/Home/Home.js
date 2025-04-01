// import React, { useState } from 'react';
import { 
  FileText, 
  Shield, 
  Clock, 
} from 'lucide-react';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';

const MunicipalLandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header (Navbar) */}
      <Uheader />

      {/* Hero Section with Video Background */}
      <div className="relative w-full h-screen flex items-center justify-center text-center text-white">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/img/municipality.mp4" type="video/mp4" />
          <source src="/videos/municipality.mp4" type="video/mp4" />
          <source src="/municipality.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Online Municipal Document Processing Municipality of Hinigaran 
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Request and track municipal documents from the comfort of your home.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition duration-300 shadow-lg">
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <main className="container mx-auto px-4 py-12 md:py-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
      <UFooter />
    </div>
  );
};

export default MunicipalLandingPage;
