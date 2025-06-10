import React from 'react';
import {
  FileText, CheckSquare, Clock, Archive,
  Settings, LogOut, User
} from 'lucide-react';

const Sidebar = ({ userData, onLogout, isLoading, onNavigate }) => {
  // Debug: log the userData to see what's being received
  console.log("Sidebar userData:", userData);
  
  return (
    <div className="w-64 bg-blue-600 text-white flex flex-col justify-between">
      <div>
        <div className="p-4 text-center">
          <img src="/img/logo.png" alt="Logo" className="w-15 h-18 mx-auto" />
          <h1 className="text-2xl font-bold mt-2">Employee Dashboard</h1>
          <p className="text-indigo-200 text-sm">Hinigaran Municipality</p>
        </div>
        <nav className="mt-6">
          <a href="/EmployDash" className="block">
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <FileText size={20} className="mr-3" />
            <span className="font-medium">Applications</span>
          </div>
          </a>
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <CheckSquare size={20} className="mr-3" />
            <span>Verifications</span>
          </div>
          <a href="/Employeehistory" className="block">
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
          <Clock size={20} className="mr-3" />
           <span>History</span>
            </div>
              </a>
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <Archive size={20} className="mr-3" />
            <span>Archives</span>
          </div>
          <div href="/Employeeprofile" className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <Settings size={20} className="mr-3" />
            <span>Settings</span>
          </div>
        </nav>
      </div>
      
      {/* User Info and Logout */}
      <div className="p-4 border-t border-indigo-500">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="ml-3">
            {isLoading ? (
              <p className="text-xs">Loading...</p>
            ) : userData ? (
              <>
                <p className="font-medium">
                  {userData.fullName || 'User'}
                </p>
                <p className="text-xs text-indigo-300">
                  {userData.position || 'Employee'} ({userData.department || 'Department'})
                </p>
              </>
            ) : (
              <p className="text-xs">No user data</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center cursor-pointer hover:text-indigo-200">
          <LogOut size={18} className="mr-2" />
          <button
            onClick={onLogout}
            disabled={isLoading}
            className="hover:text-indigo-200"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;