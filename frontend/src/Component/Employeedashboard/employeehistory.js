// src/Employee/EmployeeHistoryDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  RotateCcw,
  Archive,
} from "lucide-react";
import Sidebar from "../Header/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* --------------------- small helpers --------------------- */

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

function formatProcessingTime(days) {
  if (days == null) return "N/A";
  const n = Number(days);
  if (!Number.isFinite(n)) return "N/A";
  if (n <= 0) return "0 days";
  return `${n} day${n === 1 ? "" : "s"}`;
}

/* ========================== Filters ========================== */

function HistoryFilters({
  searchTerm,
  statusFilter,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onDateChange,
  onClearFilters,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
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

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Date Filter (still simple – you can extend later) */}
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
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Clear Filters */}
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

/* ========================== Stats cards ========================== */

function HistoryStats({ stats }) {
  const statItems = [
    {
      icon: FileText,
      label: "Total Processed",
      value: stats.totalProcessed,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: CheckCircle,
      label: "Approved",
      value: stats.approved,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: XCircle,
      label: "Rejected",
      value: stats.rejected,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Clock,
      label: "Avg Processing Time",
      value: stats.avgTime,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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

/* ========================== List items ========================== */

function HistoryItem({ item, onView, onDownload }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: "text-green-700 bg-green-100 border-green-200",
      rejected: "text-red-700 bg-red-100 border-red-200",
    };
    return colors[status] || "text-gray-700 bg-gray-100 border-gray-200";
  };

  const getPriorityDot = (priority) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[priority] || "bg-gray-500";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon(item.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.documentType}
              </h3>
              <p className="text-sm text-gray-500">ID: {item.id}</p>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${getPriorityDot(item.priority)}`}
              title={`${item.priority} priority`}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">
                <User className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Applicant:</span>{" "}
                {item.applicant}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Submitted:</span>{" "}
                {item.submittedDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <Clock className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Processed:</span>{" "}
                {item.processedDate}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Processing Time:</span>{" "}
                {item.processingTime}
              </p>
            </div>
          </div>

          {item.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {item.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                item.status
              )}`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(item)}
                className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye size={16} />
                <span>View</span>
              </button>
              <button
                onClick={() => onDownload(item)}
                className="flex items-center space-x-1 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryList({ historyItems, onView, onDownload, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No History Found
        </h3>
        <p className="text-gray-600">No documents match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {historyItems.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          onView={onView}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

/* ========================== Main Page ========================== */

function EmployeeHistoryDashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [stats, setStats] = useState({
    totalProcessed: 0,
    approved: 0,
    rejected: 0,
    avgTime: "0 days",
  });

  const [historyRaw, setHistoryRaw] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedTab, setSelectedTab] = useState("history");

  /* ------------ session / user ------------ */

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

  const handleNavigate = (tab) => {
    setSelectedTab(tab);
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/userinfo`,
        {
          withCredentials: true,
        }
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

  const fetchHistoryStats = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/history-stats`,
        { withCredentials: true }
      );
      if (res.data.success && res.data.stats) {
        setStats({
          totalProcessed: res.data.stats.totalProcessed || 0,
          approved: res.data.stats.approved || 0,
          rejected: res.data.stats.rejected || 0,
          avgTime: res.data.stats.avgTime || "0 days",
        });
      }
    } catch (err) {
      console.error("Error fetching history stats:", err);
    }
  };

  const fetchHistoryList = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/history-list`,
        { withCredentials: true }
      );
      if (res.data.success && Array.isArray(res.data.items)) {
        setHistoryRaw(res.data.items);
      } else {
        setHistoryRaw([]);
      }
    } catch (err) {
      console.error("Error fetching history list:", err);
      setHistoryRaw([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/check-session`,
        {
          withCredentials: true,
        }
      );

      if (response.data.loggedIn) {
        await Promise.all([
          fetchUserData(),
          fetchHistoryStats(),
          fetchHistoryList(),
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

  /* ------------ Transform + filter history ------------ */

  const historyItems = useMemo(() => {
    const mapped = historyRaw.map((row) => {
      // Example ID like BUS-84, ELE-10, etc.
      const prefix = (row.application_type || "DOC").substring(0, 3).toUpperCase();
      const displayId = `${prefix}-${row.receipt_id}`;

      return {
        id: displayId,
        documentType: row.document_type || "Document",
        applicant: row.applicant_name || "N/A",
        status: (row.status || "").toLowerCase(), // 'approved' or 'rejected'
        priority: row.priority || "medium",
        submittedDate: formatDate(row.submitted_at),
        processedDate: formatDate(row.processed_at),
        processingTime: formatProcessingTime(row.processing_days),
        notes: row.notes || "",
      };
    });

    return mapped.filter((item) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        item.documentType.toLowerCase().includes(term) ||
        item.applicant.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Date filtering still simplified – all time
      const matchesDate = dateFilter === "all";

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [historyRaw, searchTerm, statusFilter, dateFilter]);

  /* ------------ actions ------------ */

  const handleSearchChange = (value) => setSearchTerm(value);
  const handleStatusChange = (value) => setStatusFilter(value);
  const handleDateChange = (value) => setDateFilter(value);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const handleView = (item) => {
    console.log("View document:", item);
    // TODO: integrate with specific view modal / PDF viewer
  };

  const handleDownload = (item) => {
    console.log("Download document:", item);
    // TODO: integrate with download endpoint per application type
  };

  /* ------------ render ------------ */

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
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Document Processing History
              </h1>
              <p className="text-gray-600 mt-2">
                Track and review all processed documents
              </p>
            </div>

            {/* Statistics */}
            <HistoryStats stats={stats} />

            {/* Filters */}
            <HistoryFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
              onDateChange={handleDateChange}
              onClearFilters={handleClearFilters}
            />

            {/* History List */}
            <HistoryList
              historyItems={historyItems}
              onView={handleView}
              onDownload={handleDownload}
              isLoading={isLoadingHistory}
            />

            {/* Results count */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Showing {historyItems.length} of {historyRaw.length} documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeHistoryDashboard;
