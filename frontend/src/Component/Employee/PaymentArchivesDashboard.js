// src/Employee/PaymentArchivesDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Archive,
  Search,
  Calendar,
  RotateCcw,
  User,
  Building,
  Filter,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye
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
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCurrency(amount) {
  return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

/* --------------------- Updated Filters --------------------- */

function ArchiveFilters({
  searchTerm,
  dateFilter,
  officeFilter,
  availableOffices,
  onSearchChange,
  onDateChange,
  onOfficeChange,
  onClearFilters,
  userOffice,
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
              placeholder="Search by applicant, permit type, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Office filter - Only show if user has access to multiple offices */}
        {availableOffices.length > 1 && (
          <div className="flex items-center space-x-2">
            <Building size={20} className="text-gray-500" />
            <select
              value={officeFilter}
              onChange={(e) => onOfficeChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Offices</option>
              {availableOffices.map((office) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>
        )}

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

      {/* Current Office Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <Filter size={16} className="mr-2" />
          <span>
            Current office:{" "}
            <span className="font-semibold text-blue-600">{userOffice}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Stats --------------------- */

function ArchiveStats({ stats, officeFilter }) {
  const statItems = [
    {
      icon: Archive,
      label: "Total Archived",
      value: stats.totalArchived,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: DollarSign,
      label: "Business Permits",
      value: stats.businessPermits,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Clock,
      label: "Last 30 Days",
      value: stats.last30Days,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: DollarSign,
      label: "Total Amount",
      value: formatCurrency(stats.totalAmount),
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div>
      {officeFilter && officeFilter !== 'all' && (
        <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center">
            <Building className="w-5 h-5 text-indigo-600 mr-2" />
            <p className="text-sm text-indigo-800">
              Showing archives for: <span className="font-semibold">{officeFilter}</span> office
            </p>
          </div>
        </div>
      )}
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
    </div>
  );
}

/* --------------------- Payment Archive Item --------------------- */

function PaymentArchiveItem({ item, userOffice, onRestore }) {
  // Determine status badge
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine payment method badge
  const getPaymentMethodBadge = (method) => {
    switch (method.toLowerCase()) {
      case 'gcash':
        return 'bg-blue-100 text-blue-800';
      case 'maya':
        return 'bg-purple-100 text-purple-800';
      case 'bank':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine office badge color
  const getOfficeColor = (office) => {
    if (!office) return "bg-gray-100 text-gray-800";
    if (office === userOffice) return "bg-blue-100 text-blue-800";
    if (office.includes("MTO")) return "bg-green-100 text-green-800";
    if (office.includes("BPLO")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Archive className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.permit_name}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getOfficeColor(item.office)}`}>
                    {item.office}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Receipt ID: {item.receipt_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(item.payment_status)}`}>
                {item.payment_status}
              </span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${getPaymentMethodBadge(item.payment_method)}`}>
                {item.payment_method}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">Applicant:</span>
              </p>
              <p className="mt-1 font-medium text-gray-900">{item.applicant_name}</p>
              <p className="text-xs text-gray-500">{item.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="font-medium">Amount:</span>
              </p>
              <p className="mt-1 font-bold text-green-700 text-lg">
                {formatCurrency(item.payment_amount)}
              </p>
              <p className="text-xs text-gray-500">Total: {formatCurrency(item.total_amount)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Archived:</span>
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {formatDate(item.archived_at)}
              </p>
              <p className="text-xs text-gray-500">By: {item.archived_by}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Application Type:</span>
              </p>
              <p className="mt-1 font-medium text-gray-900">{item.application_type}</p>
              <p className="text-xs text-gray-500">Original: {formatDate(item.original_created_at)}</p>
            </div>
          </div>

          {(item.admin_notes || item.archived_reason) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {item.admin_notes && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">Admin Notes:</p>
                  <p className="text-sm text-blue-700 mt-1">{item.admin_notes}</p>
                </div>
              )}
              {item.archived_reason && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800">Archive Reason:</p>
                  <p className="text-sm text-amber-700 mt-1">{item.archived_reason}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {item.receipt_image && (
                <button
                  onClick={() => window.open(`${API_BASE_URL}${item.receipt_image}`, '_blank')}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye size={14} />
                  <span>View Receipt</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRestore(item.id)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Restore</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchiveList({ archiveItems, isLoading, userOffice, onRestore }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading archived payments...</p>
      </div>
    );
  }

  if (!archiveItems.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Archived Payments
        </h3>
        <p className="text-gray-600">
          Archived payments will appear here when moved from payment verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {archiveItems.map((item) => (
        <PaymentArchiveItem 
          key={item.id} 
          item={item} 
          userOffice={userOffice}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}

/* --------------------- Main Page --------------------- */

export default function PaymentArchivesDashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [availableOffices, setAvailableOffices] = useState([]);

  const [stats, setStats] = useState({
    totalArchived: 0,
    businessPermits: 0,
    last30Days: 0,
    today: 0,
    totalAmount: 0
  });

  const [archiveRaw, setArchiveRaw] = useState([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");

  /* ---------- Helper Functions ---------- */

  const getUserOffice = (userData) => {
    if (!userData) return 'Unknown';
    
    if (userData.department) return userData.department;
    if (userData.dept_name) return userData.dept_name;
    if (userData.department_name) return userData.department_name;
    if (userData.office) return userData.office;
    
    return 'Unknown Office';
  };

  /* ---------- API Functions ---------- */

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
    // Sidebar handles navigation
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

  const fetchAvailableOffices = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/archive/payment-archive-offices`,
        { withCredentials: true }
      );
      if (res.data.success && Array.isArray(res.data.offices)) {
        setAvailableOffices(res.data.offices);
      } else {
        const userOffice = getUserOffice(userData);
        setAvailableOffices([userOffice]);
      }
    } catch (err) {
      console.error("Error fetching offices:", err);
      const userOffice = getUserOffice(userData);
      setAvailableOffices([userOffice]);
    }
  };

  const fetchArchiveStats = async () => {
    try {
      const params = {};
      if (officeFilter && officeFilter !== 'all') {
        params.office = officeFilter;
      }
      
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/archive/payment-archive-stats`,
        { params, withCredentials: true }
      );
      if (res.data.success && res.data.stats) {
        setStats({
          totalArchived: res.data.stats.totalArchived || 0,
          businessPermits: res.data.stats.businessPermits || 0,
          last30Days: res.data.stats.last30Days || 0,
          today: res.data.stats.today || 0,
          totalAmount: res.data.stats.totalAmount || 0
        });
      }
    } catch (err) {
      console.error("Error fetching archive stats:", err);
    }
  };

  const fetchArchiveList = async () => {
    try {
      setIsLoadingArchives(true);
      const params = {};
      if (officeFilter && officeFilter !== 'all') {
        params.office = officeFilter;
      }
      
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/archive/payment-archive-list`,
        { params, withCredentials: true }
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

  const handleRestorePayment = async (archiveId) => {
    if (!window.confirm("Are you sure you want to restore this payment? It will be moved back to payment verification.")) {
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/employee/archive/restore-payment/${archiveId}`,
        {},
        { withCredentials: true }
      );
      
      if (res.data.success) {
        alert("Payment restored successfully!");
        // Refresh the list
        fetchArchiveStats();
        fetchArchiveList();
      }
    } catch (err) {
      console.error("Error restoring payment:", err);
      alert("Failed to restore payment: " + (err.response?.data?.message || err.message));
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/check-session`,
        { withCredentials: true }
      );

      if (response.data.loggedIn) {
        await fetchUserData();
        setTimeout(async () => {
          await fetchAvailableOffices();
          const userOffice = getUserOffice(userData);
          setOfficeFilter(userOffice);
          await Promise.all([
            fetchArchiveStats(),
            fetchArchiveList(),
          ]);
        }, 100);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    if (officeFilter) {
      Promise.all([
        fetchArchiveStats(),
        fetchArchiveList(),
      ]);
    }
  }, [officeFilter]);

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Filtered Archive Items ---------- */

  const archiveItems = useMemo(() => {
    const term = searchTerm.toLowerCase();

    const filtered = archiveRaw
      .filter((item) => {
        const matchesSearch =
          item.applicant_name?.toLowerCase().includes(term) ||
          item.permit_name?.toLowerCase().includes(term) ||
          item.application_type?.toLowerCase().includes(term) ||
          item.receipt_id?.toString().includes(term) ||
          item.payment_method?.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (dateFilter === "all") return true;

        const d = new Date(item.archived_at);
        if (Number.isNaN(d.getTime())) return true;

        const today = new Date();
        const diffMs = today - d;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === "today") {
          return d.toDateString() === today.toDateString();
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
    const userOffice = getUserOffice(userData);
    setOfficeFilter(userOffice);
  };

  const userOffice = getUserOffice(userData);

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          userData={userData}
          onLogout={handleLogout}
          isLoading={isLoadingUser}
          onNavigate={handleNavigate}
        />

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Payment Archives
                  </h1>
                  <p className="text-gray-600 mt-2">
                    View archived payment records from payment verification.
                    {userData && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({userOffice})
                      </span>
                    )}
                  </p>
                </div>
                {availableOffices.length > 1 && (
                  <div className="text-sm text-gray-500">
                    {availableOffices.length} offices available
                  </div>
                )}
              </div>
            </div>

            <ArchiveStats stats={stats} officeFilter={officeFilter} />

            <ArchiveFilters
              searchTerm={searchTerm}
              dateFilter={dateFilter}
              officeFilter={officeFilter}
              availableOffices={availableOffices}
              onSearchChange={setSearchTerm}
              onDateChange={setDateFilter}
              onOfficeChange={setOfficeFilter}
              onClearFilters={handleClearFilters}
              userOffice={userOffice}
            />

            <ArchiveList
              archiveItems={archiveItems}
              isLoading={isLoadingArchives}
              userOffice={userOffice}
              onRestore={handleRestorePayment}
            />

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Showing {archiveItems.length} of {archiveRaw.length} archived payments
                {officeFilter && officeFilter !== 'all' && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (Filtered by: {officeFilter})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}