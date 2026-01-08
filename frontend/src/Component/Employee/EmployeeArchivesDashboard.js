// src/Employee/EmployeeArchivesDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Archive,
  Search,
  Calendar,
  RotateCcw,
  User,
} from "lucide-react";
import Sidebar from "../Header/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8081";

function formatDate(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/* --------------------- Filters --------------------- */

function ArchiveFilters({
  searchTerm,
  dateFilter,
  onSearchChange,
  onDateChange,
  onClearFilters,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by document type, applicant, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date filter */}
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-500" />
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="last30">Last 30 Days</option>
          </select>
        </div>

        {/* Clear */}
        <button
          onClick={onClearFilters}
          className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={16} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}

/* --------------------- Stats --------------------- */

function ArchiveStats({ stats }) {
  const statItems = [
    {
      icon: Archive,
      label: "Total Archived",
      value: stats.totalArchived,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FileText,
      label: "Business Permits",
      value: stats.business,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: FileText,
      label: "Last 30 Days",
      value: stats.last30Days,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: FileText,
      label: "Picked Up Today",
      value: stats.today,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statItems.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 ${stat.color} bg-white rounded-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------- List --------------------- */

function ArchiveItem({ item }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <Archive className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.documentType}
              </h3>
              <p className="text-sm text-gray-500">ID: {item.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">
                <User className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Applicant:</span>{" "}
                {item.applicant}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <Calendar className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Picked Up:</span>{" "}
                {item.pickedUpDate}
              </p>
            </div>
          </div>

          {item.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchiveList({ archiveItems, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-600">Loading archives...</p>
      </div>
    );
  }

  if (!archiveItems.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Archived Documents
        </h3>
        <p className="text-gray-600">
          Documents moved here after pickup will appear in this list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {archiveItems.map((item) => (
        <ArchiveItem key={item.id} item={item} />
      ))}
    </div>
  );
}

/* --------------------- Main Page --------------------- */

export default function EmployeeArchivesDashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [stats, setStats] = useState({
    totalArchived: 0,
    business: 0,
    last30Days: 0,
    today: 0,
  });

  const [archiveRaw, setArchiveRaw] = useState([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  /* ---------- session / user ---------- */

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  const handleNavigate = () => {
    // Sidebar already handles route navigation via <Link> or navigate
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/userinfo`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const fetchArchiveStats = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/archive-stats`,
        { withCredentials: true }
      );
      if (res.data.success && res.data.stats) {
        setStats({
          totalArchived: res.data.stats.totalArchived || 0,
          business: res.data.stats.business || 0,
          last30Days: res.data.stats.last30Days || 0,
          today: res.data.stats.today || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching archive stats:", err);
    }
  };

  const fetchArchiveList = async () => {
    try {
      setIsLoadingArchives(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/archive-list`,
        { withCredentials: true }
      );
      if (res.data.success && Array.isArray(res.data.items)) {
        setArchiveRaw(res.data.items);
      } else {
        setArchiveRaw([]);
      }
    } catch (err) {
      console.error("Error fetching archive list:", err);
      setArchiveRaw([]);
    } finally {
      setIsLoadingArchives(false);
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/check-session`,
        { withCredentials: true }
      );

      if (response.data.loggedIn) {
        await Promise.all([
          fetchUserData(),
          fetchArchiveStats(),
          fetchArchiveList(),
        ]);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- transform archive list ---------- */

  const archiveItems = useMemo(() => {
    const term = searchTerm.toLowerCase();

    const filtered = archiveRaw
      .map((row) => {
        const prefix = (row.application_type || "DOC")
          .substring(0, 3)
          .toUpperCase();
        const displayId = `${prefix}-${row.application_id}`;

        return {
          id: displayId,
          documentType: row.document_type || "Document",
          applicant: row.applicant_name || "N/A",
          pickedUpDate: formatDate(row.archived_at),
          notes: row.notes || "",
          archived_at: row.archived_at,
        };
      })
      .filter((item) => {
        const matchesSearch =
          item.documentType.toLowerCase().includes(term) ||
          item.applicant.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (dateFilter === "all") return true;

        const d = new Date(item.archived_at);
        if (Number.isNaN(d.getTime())) return true;

        const today = new Date();
        const diffMs = today - d;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === "today") {
          return (
            d.toDateString() === today.toDateString()
          );
        }
        if (dateFilter === "week") {
          return diffDays <= 7;
        }
        if (dateFilter === "month") {
          return diffDays <= 30;
        }
        if (dateFilter === "last30") {
          return diffDays <= 30;
        }

        return true;
      });

    return filtered;
  }, [archiveRaw, searchTerm, dateFilter]);



  
  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
  };

  /* ---------- render ---------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          userData={userData}
          onLogout={handleLogout}
          isLoading={isLoadingUser}
          onNavigate={handleNavigate}
        />

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Archived Documents
              </h1>
              <p className="text-gray-600 mt-2">
                View all documents that have been picked up and archived.
              </p>
            </div>

            {/* Stats */}
            <ArchiveStats stats={stats} />

            {/* Filters */}
            <ArchiveFilters
              searchTerm={searchTerm}
              dateFilter={dateFilter}
              onSearchChange={setSearchTerm}
              onDateChange={setDateFilter}
              onClearFilters={handleClearFilters}
            />

            {/* List */}
            <ArchiveList
              archiveItems={archiveItems}
              isLoading={isLoadingArchives}
            />

            {/* Count */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Showing {archiveItems.length} of {archiveRaw.length} archived
                documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
