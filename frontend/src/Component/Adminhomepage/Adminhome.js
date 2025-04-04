import React from 'react';
import { 
  ClipboardList, 
  Users, 
  Settings, 
} from 'lucide-react';
import Aheader from '../Header/Admin_header';
import UFooter from '../Footer/User_Footer';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header (Navbar) */}
      <Aheader/>
      

      {/* Hero Section with Video Background */}
      <div className="relative w-full h-screen flex items-center justify-center text-center text-white">
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
            Admin Dashboard - Municipality of Hinigaran 
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Manage document requests and user activities efficiently.
          </p>
        </div>
      </div>

      {/* Admin Features Section */}
      <main className="container mx-auto px-4 py-12 md:py-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <ClipboardList className="mx-auto mb-3 md:mb-4 text-blue-600" size={40} md={50} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Manage Requests</h3>
            <p className="text-sm md:text-base text-gray-600">View and approve document requests easily</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <Users className="mx-auto mb-3 md:mb-4 text-green-600" size={40} md={50} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">User Management</h3>
            <p className="text-sm md:text-base text-gray-600">Monitor and manage users efficiently</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center">
            <Settings className="mx-auto mb-3 md:mb-4 text-purple-600" size={40} md={50} />
            <h3 className="text-lg md:text-xl font-semibold mb-2">System Settings</h3>
            <p className="text-sm md:text-base text-gray-600">Configure system preferences and settings</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <UFooter />
    </div>
  );
};

export default AdminDashboard;
