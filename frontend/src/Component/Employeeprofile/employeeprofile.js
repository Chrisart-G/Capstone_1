import React, { useState, useEffect } from 'react';
import Sidebar from '../Header/Sidebar';
import { 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download, 
  Edit,
  Bell,
  Settings,
  LogOut,
  Filter,
  Search,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Menu,
  Archive,
  History,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Employee Profile Header Component
function EmployeeProfileHeader({ employee, onEditProfile }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {employee.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
          <p className="text-lg text-gray-600">{employee.position}</p>
          <p className="text-sm text-gray-500">{employee.department} • ID: {employee.id}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm text-gray-600">{employee.email}</span>
            <span className="text-sm text-gray-600">{employee.phone}</span>
            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
              {employee.status}
            </span>
          </div>
        </div>
        <button 
          onClick={onEditProfile}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit size={16} />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

// Statistics Card Component
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Statistics Grid Component
function StatisticsGrid({ stats }) {
  const statItems = [
    { icon: FileText, value: stats.totalProcessed, label: 'Total Processed', color: 'text-blue-600' },
    { icon: Clock, value: stats.pending, label: 'Pending', color: 'text-yellow-600' },
    { icon: CheckCircle, value: stats.approved, label: 'Approved', color: 'text-green-600' },
    { icon: XCircle, value: stats.rejected, label: 'Rejected', color: 'text-red-600' },
    { icon: TrendingUp, value: stats.avgProcessingTime, label: 'Avg Time', color: 'text-purple-600' },
    { icon: Award, value: stats.accuracy, label: 'Accuracy', color: 'text-orange-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      {statItems.map((stat, index) => (
        <StatCard 
          key={index}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          color={stat.color}
        />
      ))}
    </div>
  );
}

// Tab Navigation Component
function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'documents', label: 'Recent Documents', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: Clock }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  const performanceMetrics = [
    { label: 'Documents Processed Today', value: '15' },
    { label: 'This Week', value: '78' },
    { label: 'This Month', value: '342' }
  ];

  const quickActions = [
    { icon: FileText, label: 'Process New Document', bgColor: 'bg-blue-50', textColor: 'text-blue-700', hoverColor: 'hover:bg-blue-100' },
    { icon: Search, label: 'Search Documents', bgColor: 'bg-green-50', textColor: 'text-green-700', hoverColor: 'hover:bg-green-100' },
    { icon: Calendar, label: 'View Schedule', bgColor: 'bg-purple-50', textColor: 'text-purple-700', hoverColor: 'hover:bg-purple-100' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">{metric.label}</span>
                <span className="font-semibold text-gray-900">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                className={`w-full flex items-center space-x-3 p-4 ${action.bgColor} ${action.textColor} rounded-lg ${action.hoverColor} transition-colors`}
              >
                <action.icon size={20} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Document Search and Filter Component
function DocumentFilters({ searchTerm, filterStatus, onSearchChange, onFilterChange }) {
  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search documents or applicants..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Filter size={20} className="text-gray-500" />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="review">Under Review</option>
        </select>
      </div>
    </div>
  );
}

// Documents Table Component
function DocumentsTable({ documents, getStatusColor, getPriorityColor }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{doc.type}</div>
                    <div className="text-sm text-gray-500">{doc.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.applicant}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-medium ${getPriorityColor(doc.priority)}`}>
                  {doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye size={16} />
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Download size={16} />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Edit size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Documents Tab Component
function DocumentsTab({ searchTerm, filterStatus, onSearchChange, onFilterChange, filteredDocuments, getStatusColor, getPriorityColor }) {
  return (
    <div className="space-y-6">
      <DocumentFilters 
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />
      <DocumentsTable 
        documents={filteredDocuments}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
      />
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ activityLog }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <div className="space-y-4">
        {activityLog.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{activity.action}</div>
              <div className="text-sm text-gray-600">Document: {activity.document}</div>
              <div className="text-xs text-gray-500 mt-1">{activity.date} at {activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
function EmployeeProfileDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock employee data
  const employee = {
    id: 'EMP001',
    name: 'Maria Santos',
    position: 'Document Processing Specialist',
    department: 'Operations',
    email: 'maria.santos@company.com',
    phone: '+63 912 345 6789',
    joinDate: '2023-01-15',
    avatar: '/api/placeholder/150/150',
    status: 'Active'
  };

  // Mock statistics
  const stats = {
    totalProcessed: 1247,
    pending: 23,
    approved: 1156,
    rejected: 68,
    avgProcessingTime: '2.3 hours',
    accuracy: '98.5%'
  };

  // Mock recent documents
  const recentDocuments = [
    { id: 'DOC001', type: 'Business Permit', applicant: 'Juan Dela Cruz', status: 'approved', date: '2025-05-30', priority: 'high' },
    { id: 'DOC002', type: 'Health Certificate', applicant: 'Ana Garcia', status: 'pending', date: '2025-05-29', priority: 'medium' },
    { id: 'DOC003', type: 'Building Permit', applicant: 'Carlos Rodriguez', status: 'review', date: '2025-05-29', priority: 'high' },
    { id: 'DOC004', type: 'Fire Safety Certificate', applicant: 'Elena Martinez', status: 'approved', date: '2025-05-28', priority: 'low' },
    { id: 'DOC005', type: 'Environmental Permit', applicant: 'Ricardo Fernandez', status: 'rejected', date: '2025-05-27', priority: 'medium' },
    { id: 'DOC006', type: 'Business License', applicant: 'Sofia Lopez', status: 'pending', date: '2025-05-27', priority: 'high' }
  ];

  // Mock activity log
  const activityLog = [
    { id: 1, action: 'Approved Business Permit', document: 'DOC001', time: '10:30 AM', date: '2025-05-30' },
    { id: 2, action: 'Reviewed Health Certificate', document: 'DOC002', time: '09:15 AM', date: '2025-05-30' },
    { id: 3, action: 'Rejected Environmental Permit', document: 'DOC003', time: '04:45 PM', date: '2025-05-29' },
    { id: 4, action: 'Started review of Building Permit', document: 'DOC004', time: '02:20 PM', date: '2025-05-29' },
    { id: 5, action: 'Completed Fire Safety Certificate', document: 'DOC005', time: '11:10 AM', date: '2025-05-29' }
  ];

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      approved: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      rejected: 'text-red-600 bg-red-100',
      review: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  // Filter documents based on search and status
  const filteredDocuments = recentDocuments.filter(doc => {
    const matchesSearch = doc.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.applicant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Event handlers
  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };
  const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
      const navigate = useNavigate();
        const [selectedTab, setSelectedTab] = useState('pending');
      const [isLoggedIn, setIsLoggedIn] = useState(false);
const API_BASE_URL = "http://localhost:8081";
const checkSession = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
      withCredentials: true
    });

    if (response.data.loggedIn) {
      setIsLoggedIn(true);
      await fetchUserData();
    } else {
      navigate('/');
    }
  } catch (error) {
    console.error("Session check error:", error);
    navigate('/');
  }
};
    useEffect(() => {
      checkSession();
    }, []);
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/userinfo`, {
        withCredentials: true
      });
      
      // Debug response
      console.log("User data API response:", response.data);
      
      if (response.data.success) {
        // Store the userData rather than user property
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
    const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    } finally {
      setIsLoading(false);
    }
  };
    const handleNavigate = (tab) => {
    setSelectedTab(tab);
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
          <Sidebar 
      userData={userData} 
      onLogout={handleLogout} 
      isLoading={isLoading}
      onNavigate={handleNavigate}
    />

      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmployeeProfileHeader 
            employee={employee}
            onEditProfile={handleEditProfile}
          />

          <StatisticsGrid stats={stats} />

          <div className="bg-white rounded-xl shadow-lg mb-8">
            <TabNavigation 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab />}
              
              {activeTab === 'documents' && (
                <DocumentsTab 
                  searchTerm={searchTerm}
                  filterStatus={filterStatus}
                  onSearchChange={handleSearchChange}
                  onFilterChange={handleFilterChange}
                  filteredDocuments={filteredDocuments}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              )}
              
              {activeTab === 'activity' && (
                <ActivityTab activityLog={activityLog} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfileDashboard;