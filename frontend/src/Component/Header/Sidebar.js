// components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckSquare,
  Clock,
  Archive,
  Settings,
  LogOut,
  User,
} from "lucide-react";

/** Small red dot indicator */
const Dot = ({ show }) =>
  show ? (
    <span
      className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-red-500"
      aria-label="new notifications"
      title="New items"
    />
  ) : null;

/**
 * Employee Sidebar (frontend)
 * - Fetches /api/employee/sidebar/badges with credentials (cookies)
 * - Polls every 15s and when tab becomes visible
 * - Shows red dot on Applications and Payment Verifications
 *
 * Props:
 *  - userData: { fullName, position, department }
 *  - onLogout: () => void
 *  - isLoading: boolean
 */
const Sidebar = ({ userData, onLogout, isLoading }) => {
  const [badges, setBadges] = useState({ applications: 0, payments: 0 });
  const [loadingBadges, setLoadingBadges] = useState(true);

  useEffect(() => {
    let timer;
    let alive = true;

    const load = () => {
      setLoadingBadges(true);
      fetch("http://localhost:8081/api/employee/sidebar/badges", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          if (!alive) return;
          setBadges(data?.badges || { applications: 0, payments: 0 });
        })
        .catch(() => {
          if (alive) setBadges({ applications: 0, payments: 0 });
        })
        .finally(() => {
          if (alive) setLoadingBadges(false);
        });
    };

    load(); // initial
    timer = setInterval(load, 15000); // poll every 15s

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="w-64 bg-blue-600 text-white flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="p-4 text-center">
          <img src="/img/logo.png" alt="Logo" className="w-15 h-18 mx-auto" />
          <h1 className="text-2xl font-bold mt-2">Employee Dashboard</h1>
          <p className="text-indigo-200 text-sm">Hinigaran Municipality</p>
        </div>

        {/* Nav */}
        <nav className="mt-6">
          {/* Applications */}
          <a href="/EmployDash" className="block">
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <FileText size={20} className="mr-3" />
              <span className="font-medium">Applications</span>
              {!loadingBadges && <Dot show={badges.applications > 0} />}
            </div>
          </a>

          {/* Payment Verifications */}
          <a href="/employeepayment" className="block">
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <CheckSquare size={20} className="mr-3" />
              <span>Payment Verifications</span>
              {!loadingBadges && <Dot show={badges.payments > 0} />}
            </div>
          </a>

          {/* History */}
          <a href="/Employeehistory" className="block">
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <Clock size={20} className="mr-3" />
              <span>History</span>
            </div>
          </a>

          {/* Archives */}
          <a href="/Employeearchives" className="block">
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <Archive size={20} className="mr-3" />
              <span>Archives</span>
            </div>
          </a>

          {/* Settings */}
          <a href="/Employeeprofile" className="block">
            <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
              <Settings size={20} className="mr-3" />
              <span>Settings</span>
            </div>
          </a>
        </nav>
      </div>

      {/* Footer: user + logout */}
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
                <p className="font-medium">{userData.fullName || "User"}</p>
                <p className="text-xs text-indigo-300">
                  {userData.position || "Employee"} (
                  {userData.department || "Department"})
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
