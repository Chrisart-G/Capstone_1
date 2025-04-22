import React from 'react';
import { Bell, Users, Building, ChevronDown, ChevronRight, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const AdminSidebar = ({ 
  activePage, 
  setActivePage, 
  expanded, 
  toggleExpand, 
  handleLogout, 
  isLoading 
}) => {
  return (
    <div className="w-64 bg-blue-700 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-center">
        <img src="/img/logo.png" alt="Company Logo" className="h-16 w-16 mr-2" />
        <h1 className="text-lg font-bold">Hinigaran Municipality</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          <div 
            className={`flex items-center p-3 rounded-lg cursor-pointer ${activePage === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            onClick={() => setActivePage('dashboard')}
          >
            <LayoutDashboard size={18} className="mr-2" />
            <span>Dashboard</span>
          </div>
          
          {/* Manage Employees Section */}
          <div className="mt-2">
            <div 
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => toggleExpand('employees')}
            >
              <div className="flex items-center">
                <Users size={18} className="mr-2" />
                <span>Manage Employees</span>
              </div>
              {expanded.employees ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {expanded.employees && (
              <div className="ml-6 mt-1">
                <div 
                  className={`p-2 rounded-lg cursor-pointer ${activePage === 'manageEmployees' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setActivePage('manageEmployees')}
                >
                  View All Employees
                </div>
                <div 
                  className={`p-2 rounded-lg cursor-pointer ${activePage === 'addEmployee' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setActivePage('addEmployee')}
                >
                  Add New Employee
                </div>
              </div>
            )}
          </div>
          
          {/* Create Office Section */}
          <div className="mt-2">
            <div 
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => toggleExpand('offices')}
            >
              <div className="flex items-center">
                <Building size={18} className="mr-2" />
                <span>Create Office</span>
              </div>
              {expanded.offices ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {expanded.offices && (
              <div className="ml-6 mt-1">
                <div 
                  className={`p-2 rounded-lg cursor-pointer ${activePage === 'createOffice' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setActivePage('createOffice')}
                >
                  New Office
                </div>
                <div 
                  className={`p-2 rounded-lg cursor-pointer ${activePage === 'manageLocations' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setActivePage('manageLocations')}
                >
                  Manage Locations
                </div>
              </div>
            )}
          </div>
          
          {/* Notifications Section */}
          <div className="mt-2">
            <div 
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => toggleExpand('notifications')}
            >
              <div className="flex items-center">
                <Bell size={18} className="mr-2" />
                <span>Notifications</span>
              </div>
              {expanded.notifications ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {expanded.notifications && (
              <div className="ml-6 mt-1">
                <div 
                  className={`p-2 rounded-lg cursor-pointer ${activePage === 'notifications' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setActivePage('notifications')}
                >
                  All Notifications
                </div>
                <div 
                  className={`p-2 rounded-lg cursor-pointer ${activePage === 'createAnnouncement' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                  onClick={() => setActivePage('createAnnouncement')}
                >
                  Create Announcement
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div 
          className={`flex items-center p-3 rounded-lg cursor-pointer ${activePage === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActivePage('settings')}
        >
          <Settings size={18} className="mr-2" />
          <span>Settings</span>
        </div>
        <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700">
          <LogOut size={18} className="mr-2" />
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="hover:text-blue-200 flex items-center"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;