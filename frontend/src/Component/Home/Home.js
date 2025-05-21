import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Clock, 
  Megaphone
} from 'lucide-react';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8081";

const MunicipalLandingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
          withCredentials: true
        });
        
        setIsAuthenticated(response.data.loggedIn);
        

        if (!response.data.loggedIn) {
          navigate('/');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">

      <Uheader />


      <div className="relative w-full h-96 md:h-[70vh] flex items-center justify-center text-center text-white">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/img/municipality2.mp4" type="video/mp4" />
          <source src="/videos/municipality2.mp4" type="video/mp4" />
          <source src="/municipality2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Online Document Processing Municipality of Hinigaran 
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Request municipal documents from the comfort of your home.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition duration-300 shadow-lg">
            Get Started
          </button>
        </div>
      </div>


      <div className="bg-white py-8 border-t border-b border-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">

            <div className="flex items-center mb-6 text-center">
              <Megaphone className="text-black mr-3" size={28} />
              <h2 className="text-2xl font-bold text-black">Municipality Announcements</h2>
            </div>
            

            <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-3/4 lg:w-2/3 border-l-4">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Document Processing Schedule</h3>
                <span className="text-sm text-gray-700">Posted: May 1, 2025</span>
                <p className="mt-2 text-gray-700">The Municipal Office processes online document requests from 7:00 AM to 5:00 PM, Monday to Friday. While our system accepts submissions 24/7, requests submitted after office hours will be processed the following business day.</p>
              </div>
              <div>
                
              </div>
            </div>
          </div>
        </div>
      </div>


      <main className="container mx-auto px-4 py-12 md:py-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <FileText className="mx-auto mb-3 md:mb-4 text-blue-600" size={40} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Easy Requests</h3>
            <p className="text-sm md:text-base text-gray-600">Simple and intuitive document request process</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <Shield className="mx-auto mb-3 md:mb-4 text-green-600" size={40} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Secure Processing</h3>
            <p className="text-sm md:text-base text-gray-600">Your data is protected with advanced security</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <Clock className="mx-auto mb-3 md:mb-4 text-purple-600" size={40} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Quick Approvals</h3>
            <p className="text-sm md:text-base text-gray-600">Fast processing and document delivery</p>
          </div>
        </div>
      </main>


      <UFooter />
    </div>
  );
};

export default MunicipalLandingPage;