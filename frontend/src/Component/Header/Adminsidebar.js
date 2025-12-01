import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Users, Building, ChevronDown, ChevronRight, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const AdminSidebar = ({ handleLogout, isLoading }) => {
  const [expanded, setExpanded] = useState({
    employees: false,
    offices: false,
    notifications: false
  });

  const toggleExpand = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section]
    });
  };

  return (
    <div className="w-64 bg-blue-600 text-white flex flex-col justify-between">
      <div>
        <div className="p-4 text-center">
          <img src="/img/logo.png" alt="Logo" className="w-15 h-18 mx-auto" />
          <h1 className="text-2xl font-bold mt-2">Admin Dashboard</h1>
          <p className="text-indigo-200 text-sm">Hinigaran Municipality</p>
        </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          <Link to="/AdminDash" className="block">
            <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700">
              <LayoutDashboard size={18} className="mr-2" />
              <span>Dashboard</span>
            </div>
          </Link>
          
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
                <Link to="/viewemploy" className="block">
                  <div className="p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                    View All Employees
                  </div>
                </Link>
                <Link to="/addemploy" className="block">
                  <div className="p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                    Add New Employee
                  </div>
                </Link>
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
                <Link to="/AddOffice" className="block">
                  <div className="p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                    New Office
                  </div>
                </Link>
                <Link to="/ManageOffice" className="block">
                  <div className="p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                    Manage Office
                  </div>
                </Link>
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
                <a href="/" className="block">
                          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
                           <span>All Notifications</span>
                            </div>
                              </a>
                <a href="/AdminDocumentRequirments" className="block">
                          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
                           <span>Create Announcement</span>
                            </div>
                              </a>
              </div>
            )}

          </div>
          <div className="mt-2">
            <div 
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-700"
              onClick={() => toggleExpand('requirments')}
            >
              <div className="flex items-center">
                <span>Documents Requirments</span>
              </div>
              {expanded.requirments ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {expanded.requirments && (
              <div className="ml-6 mt-1">
                <Link to="/AdminDocumentRequirments" className="block">
                  <div className="p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                    Manage Document Requirements
                  </div>
                </Link>
                <Link to="/Documentprice" className="block">
                  <div className="p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                    Manage Document Prices
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <Link to="/admin/settings" className="block">
          <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700">
            <Settings size={18} className="mr-2" />
            <span>Settings</span>
          </div>
        </Link>
        <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700">
          <LogOut size={18} className="mr-2" />
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="hover:text-blue-200"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminSidebar;