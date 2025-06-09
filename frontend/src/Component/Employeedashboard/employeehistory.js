import React, { useState } from 'react';
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
  ChevronDown,
  RotateCcw,
  Archive
} from 'lucide-react';
import Sidebar from '../Header/Sidebar';


// History Filter Component
function HistoryFilters ({ 
  searchTerm, 
  statusFilter, 
  dateFilter, 
  onSearchChange, 
  onStatusChange, 
  onDateChange,
  onClearFilters 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
            <option value="pending">Pending</option>
            <option value="review">Under Review</option>
          </select>
        </div>

        {/* Date Filter */}
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

// History Stats Component
function HistoryStats({ stats }) {
  const statItems = [
    { 
      icon: FileText, 
      label: 'Total Processed', 
      value: stats.totalProcessed, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: CheckCircle, 
      label: 'Approved', 
      value: stats.approved, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: XCircle, 
      label: 'Rejected', 
      value: stats.rejected, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      icon: Clock, 
      label: 'Avg Processing Time', 
      value: stats.avgTime, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
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

// History Item Component
function HistoryItem({ item, onView, onDownload }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'review':
        return <Eye className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'text-green-700 bg-green-100 border-green-200',
      rejected: 'text-red-700 bg-red-100 border-red-200',
      pending: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      review: 'text-blue-700 bg-blue-100 border-blue-200'
    };
    return colors[status] || 'text-gray-700 bg-gray-100 border-gray-200';
  };

  const getPriorityDot = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon(item.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.documentType}</h3>
              <p className="text-sm text-gray-500">ID: {item.id}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${getPriorityDot(item.priority)}`} title={`${item.priority} priority`}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">
                <User className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Applicant:</span> {item.applicant}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Submitted:</span> {item.submittedDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <Clock className="inline w-4 h-4 mr-1" />
                <span className="font-medium">Processed:</span> {item.processedDate}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Processing Time:</span> {item.processingTime}
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
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
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

// History List Component
function HistoryList({ historyItems, onView, onDownload }) {
  if (historyItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Found</h3>
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

// Main History Dashboard Component
function EmployeeHistoryDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock history data
  const historyData = [
    {
      id: 'DOC001',
      documentType: 'Business Permit',
      applicant: 'Juan Dela Cruz',
      status: 'approved',
      priority: 'high',
      submittedDate: '2025-05-25',
      processedDate: '2025-05-30',
      processingTime: '5 days',
      notes: 'All requirements met. Approved without issues.'
    },
    {
      id: 'DOC002',
      documentType: 'Health Certificate',
      applicant: 'Ana Garcia',
      status: 'pending',
      priority: 'medium',
      submittedDate: '2025-05-28',
      processedDate: 'In Progress',
      processingTime: '2 days',
      notes: 'Waiting for medical examination results.'
    },
    {
      id: 'DOC003',
      documentType: 'Building Permit',
      applicant: 'Carlos Rodriguez',
      status: 'rejected',
      priority: 'high',
      submittedDate: '2025-05-20',
      processedDate: '2025-05-27',
      processingTime: '7 days',
      notes: 'Missing structural engineering report. Applicant notified.'
    },
    {
      id: 'DOC004',
      documentType: 'Fire Safety Certificate',
      applicant: 'Elena Martinez',
      status: 'approved',
      priority: 'low',
      submittedDate: '2025-05-22',
      processedDate: '2025-05-28',
      processingTime: '6 days',
      notes: 'Fire safety inspection completed successfully.'
    },
    {
      id: 'DOC005',
      documentType: 'Environmental Permit',
      applicant: 'Ricardo Fernandez',
      status: 'review',
      priority: 'medium',
      submittedDate: '2025-05-26',
      processedDate: 'Under Review',
      processingTime: '4 days',
      notes: 'Environmental impact assessment under review.'
    },
    {
      id: 'DOC006',
      documentType: 'Business License Renewal',
      applicant: 'Sofia Lopez',
      status: 'approved',
      priority: 'high',
      submittedDate: '2025-05-15',
      processedDate: '2025-05-20',
      processingTime: '5 days',
      notes: 'Renewal processed. Valid for 1 year.'
    }
  ];

  // Mock statistics
  const stats = {
    totalProcessed: 156,
    approved: 98,
    rejected: 23,
    avgTime: '4.2 days'
  };

  // Filter functions
  const getFilteredHistory = () => {
    return historyData.filter(item => {
      const matchesSearch = 
        item.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      // For date filtering, you would implement actual date logic here
      const matchesDate = dateFilter === 'all'; // Simplified for demo
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  // Event handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const handleDateChange = (value) => {
    setDateFilter(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const handleView = (item) => {
    console.log('View document:', item);
    // Implement view logic
  };

  const handleDownload = (item) => {
    console.log('Download document:', item);
    // Implement download logic
  };

  const filteredHistory = getFilteredHistory();

  return (

    <div className="min-h-screen bg-gray-50">
       
      {/* Space for your sidebar */}
      <div className="flex">
        <div className="w-50 flex-shrink-0">
          <Sidebar/>
          {/* Your sidebar will go here */}
        </div>
        
        {/* Main content area */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Document Processing History</h1>
              <p className="text-gray-600 mt-2">Track and review all processed documents</p>
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
              historyItems={filteredHistory}
              onView={handleView}
              onDownload={handleDownload}
            />

            {/* Results count */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Showing {filteredHistory.length} of {historyData.length} documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeHistoryDashboard;