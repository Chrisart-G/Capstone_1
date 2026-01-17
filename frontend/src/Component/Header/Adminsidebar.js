import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Users,
  Building,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
} from 'lucide-react';

const AdminSidebar = ({ handleLogout, isLoading }) => {
  const location = useLocation();

  const isPathActive = (path) => location.pathname === path;
  const isAnyPathActive = (paths) => paths.includes(location.pathname);

  const employeesActive = isAnyPathActive(['/viewemploy', '/addemploy']);
  const officesActive = isAnyPathActive(['/AddOffice', '/ManageOffice']);
  const notificationsActive = isAnyPathActive([
  '/AdminNotifications',
  '/AdminCreateAnnouncement',
]);
  const requirmentsActive = isAnyPathActive([
    '/AdminDocumentRequirments',
    '/Documentprice',
  ]);

  const [expanded, setExpanded] = useState({
    employees: employeesActive,
    offices: officesActive,
    notifications: notificationsActive,
    requirments: requirmentsActive,
  });

  const toggleExpand = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    });
  };

  const mainItemClasses = (active) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-200 ${
      active
        ? 'bg-slate-800/90 text-white shadow-sm shadow-slate-900/60'
        : 'text-slate-200 hover:bg-slate-800/70'
    }`;

  const sectionHeaderClasses = (active) =>
    `flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-200 ${
      active
        ? 'bg-slate-800/90 text-white'
        : 'text-slate-200 hover:bg-slate-800/80'
    }`;

  const subItemClasses = (active) =>
    `px-3 py-2 rounded-lg cursor-pointer text-xs sm:text-sm transition-colors duration-200 ${
      active ? 'bg-slate-800/90 text-white' : 'text-slate-200 hover:bg-slate-800/80'
    }`;

  return (
    <div
      className="
        w-56 sm:w-60 md:w-64
        h-screen
        bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950/95
        backdrop-blur-xl
        border-r border-white/10
        text-slate-100
        flex flex-col
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="px-3 sm:px-4 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-white/10">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* Bigger logo, responsive sizes, no shadow/background/border */}
          <img
            src="/img/logo.png"
            alt="Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
          <div className="text-center">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-300 tracking-wide mt-1">
              Hinigaran Municipality
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          {/* Dashboard */}
          <Link to="/AdminDash" className="block">
            <div className={mainItemClasses(isPathActive('/AdminDash'))}>
              <LayoutDashboard size={16} className="sm:size-[18px] text-slate-300" />
              <span className="font-medium truncate">Dashboard</span>
            </div>
          </Link>

          {/* Manage Employees Section */}
          <div className="mt-0.5 sm:mt-1">
            <div
              className={sectionHeaderClasses(employeesActive)}
              onClick={() => toggleExpand('employees')}
            >
              <div className="flex items-center gap-2">
                <Users size={16} className="sm:size-[18px] text-slate-300" />
                <span className="font-medium truncate">Manage Employees</span>
              </div>
              {expanded.employees ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )}
            </div>

            {expanded.employees && (
              <div className="mt-1 ml-4 sm:ml-6 space-y-1 border-l border-slate-700/60 pl-2 sm:pl-3">
                <Link to="/viewemploy" className="block">
                  <div className={subItemClasses(isPathActive('/viewemploy'))}>
                    View All Employees
                  </div>
                </Link>
                <Link to="/addemploy" className="block">
                  <div className={subItemClasses(isPathActive('/addemploy'))}>
                    Add New Employee
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Create Office Section */}
          <div className="mt-0.5 sm:mt-1">
            <div
              className={sectionHeaderClasses(officesActive)}
              onClick={() => toggleExpand('offices')}
            >
              <div className="flex items-center gap-2">
                <Building size={16} className="sm:size-[18px] text-slate-300" />
                <span className="font-medium truncate">Create Office</span>
              </div>
              {expanded.offices ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )}
            </div>

            {expanded.offices && (
              <div className="mt-1 ml-4 sm:ml-6 space-y-1 border-l border-slate-700/60 pl-2 sm:pl-3">
                <Link to="/AddOffice" className="block">
                  <div className={subItemClasses(isPathActive('/AddOffice'))}>
                    New Office
                  </div>
                </Link>
                <Link to="/ManageOffice" className="block">
                  <div className={subItemClasses(isPathActive('/ManageOffice'))}>
                    Manage Office
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className="mt-0.5 sm:mt-1">
  <div
    className={sectionHeaderClasses(notificationsActive)}
    onClick={() => toggleExpand('notifications')}
  >
    <div className="flex items-center gap-2">
      <Bell size={16} className="sm:size-[18px] text-slate-300" />
      <span className="font-medium truncate">Notifications</span>
    </div>
    {expanded.notifications ? (
      <ChevronDown size={14} className="text-slate-400" />
    ) : (
      <ChevronRight size={14} className="text-slate-400" />
    )}
  </div>

  {expanded.notifications && (
    <div className="mt-1 ml-4 sm:ml-6 space-y-1 border-l border-slate-700/60 pl-2 sm:pl-3">
      <Link to="/AdminNotifications" className="block">
        <div className={subItemClasses(isPathActive('/AdminNotifications'))}>
          <span>All Notifications</span>
        </div>
      </Link>
      <Link to="/AdminCreateAnnouncement" className="block">
        <div
          className={subItemClasses(
            isPathActive('/AdminCreateAnnouncement')
          )}
        >
          <span>Create Announcement</span>
        </div>
      </Link>
    </div>
  )}
</div>

          {/* Document Requirements Section */}
          <div className="mt-0.5 sm:mt-1">
            <div
              className={sectionHeaderClasses(requirmentsActive)}
              onClick={() => toggleExpand('requirments')}
            >
              <div className="flex items-center">
                <span className="font-medium truncate">
                  Documents Requirments
                </span>
              </div>
              {expanded.requirments ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronRight size={14} className="text-slate-400" />
              )}
            </div>

            {expanded.requirments && (
              <div className="mt-1 ml-4 sm:ml-6 space-y-1 border-l border-slate-700/60 pl-2 sm:pl-3">
                <Link to="/AdminDocumentRequirments" className="block">
                  <div
                    className={subItemClasses(
                      isPathActive('/AdminDocumentRequirments')
                    )}
                  >
                    Manage Document Requirements
                  </div>
                </Link>
                <Link to="/Documentprice" className="block">
                  <div className={subItemClasses(isPathActive('/Documentprice'))}>
                    Manage Document Prices
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-2.5 sm:p-3 border-t border-white/10 bg-slate-950/70">
        <Link to="/admin/settings" className="block">
          <div className={mainItemClasses(isPathActive('/admin/settings'))}>
            <Settings size={16} className="sm:size-[18px] text-slate-300" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Settings
            </span>
          </div>
        </Link>

        <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-600/80 hover:text-white transition-colors duration-200">
          <LogOut size={16} className="sm:size-[18px] text-red-400" />
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="text-xs sm:text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
