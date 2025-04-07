import React, { useState } from 'react';
import { Bell, Search, FileText, Upload, Calendar, Users, PieChart, Settings, Home, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample application data
  const applications = [
    { id: 'APP-2025-0042', applicant: 'Maria Santos', type: 'Business Permit', date: '2025-04-07', status: 'Pending Verification' },
    { id: 'APP-2025-0041', applicant: 'Juan Dela Cruz', type: 'Barangay Clearance', date: '2025-04-07', status: 'Awaiting Approval' },
    { id: 'APP-2025-0040', applicant: 'Ana Reyes', type: 'Building Permit', date: '2025-04-06', status: 'Request More Info' },
    { id: 'APP-2025-0039', applicant: 'Roberto Lim', type: 'Certificate of Residency', date: '2025-04-06', status: 'Approved' },
    { id: 'APP-2025-0038', applicant: 'Elena Magtanggol', type: 'Business Permit', date: '2025-04-05', status: 'Rejected' }
  ];
  
  // Statistics for overview widgets
  const stats = {
    totalToday: 12,
    pendingReviews: 28,
    approved: 63,
    rejected: 7,
    avgProcessingTime: '2.4 days',
    newMessages: 5
  };
  
  // Component for dashboard overview widgets
  const OverviewWidgets = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-blue-500 font-medium">Today's Apps</span>
          <FileText size={20} className="text-blue-500" />
        </div>
        <p className="text-2xl font-bold mt-2">{stats.totalToday}</p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-amber-500 font-medium">Pending</span>
          <AlertCircle size={20} className="text-amber-500" />
        </div>
        <p className="text-2xl font-bold mt-2">{stats.pendingReviews}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-green-500 font-medium">Approved</span>
          <CheckCircle size={20} className="text-green-500" />
        </div>
        <p className="text-2xl font-bold mt-2">{stats.approved}</p>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-red-500 font-medium">Rejected</span>
          <XCircle size={20} className="text-red-500" />
        </div>
        <p className="text-2xl font-bold mt-2">{stats.rejected}</p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-purple-500 font-medium">Avg Time</span>
          <Clock size={20} className="text-purple-500" />
        </div>
        <p className="text-2xl font-bold mt-2">{stats.avgProcessingTime}</p>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-indigo-500 font-medium">Messages</span>
          <MessageSquare size={20} className="text-indigo-500" />
        </div>
        <p className="text-2xl font-bold mt-2">{stats.newMessages}</p>
      </div>
    </div>
  );
  
  // Component for application queue/inbox
  const ApplicationQueue = () => (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Application Queue</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-8 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search size={16} className="absolute left-2 top-3 text-gray-400" />
          </div>
          <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-md text-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.applicant}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    app.status === 'Request More Info' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Review</button>
                    {app.status !== 'Approved' && app.status !== 'Rejected' && (
                      <>
                        <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <span className="text-sm text-gray-700">Showing 5 of 28 applications</span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
          <button className="px-3 py-1 border rounded text-sm bg-blue-500 text-white">1</button>
          <button className="px-3 py-1 border rounded text-sm">2</button>
          <button className="px-3 py-1 border rounded text-sm">3</button>
          <button className="px-3 py-1 border rounded text-sm">Next</button>
        </div>
      </div>
    </div>
  );
  
  // Component for quick actions
  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
          <Search size={24} className="mb-2 text-blue-500" />
          <span className="text-sm">Search Application</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
          <FileText size={24} className="mb-2 text-blue-500" />
          <span className="text-sm">View Document Archive</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
          <Upload size={24} className="mb-2 text-blue-500" />
          <span className="text-sm">Upload Supporting Docs</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
          <Calendar size={24} className="mb-2 text-blue-500" />
          <span className="text-sm">Schedule Physical Pickup</span>
        </button>
      </div>
    </div>
  );
  
  // Component for notifications & alerts
  const Notifications = () => (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button className="text-sm text-blue-500">Mark all as read</button>
      </div>
      
      <div className="divide-y">
        <div className="p-4 hover:bg-gray-50">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FileText size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium">New Business Permit Application</p>
              <p className="text-sm text-gray-500">Maria Santos submitted a new application</p>
              <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 hover:bg-gray-50">
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <AlertCircle size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="font-medium">Application Awaiting Review</p>
              <p className="text-sm text-gray-500">Juan Dela Cruz's application needs your approval</p>
              <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 hover:bg-gray-50">
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <MessageSquare size={16} className="text-purple-500" />
            </div>
            <div>
              <p className="font-medium">New Message from Applicant</p>
              <p className="text-sm text-gray-500">Ana Reyes responded to your request for more information</p>
              <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t text-center">
        <button className="text-sm text-blue-500">View all notifications</button>
      </div>
    </div>
  );
  
  // Main dashboard layout
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-20 bg-blue-800 flex flex-col items-center py-6">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-8">
          <span className="text-blue-800 font-bold text-lg">M</span>
        </div>
        
        <nav className="flex flex-col items-center space-y-6 flex-grow">
          <button 
            className={`p-3 rounded-xl ${activeTab === 'overview' ? 'bg-blue-700 text-white' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('overview')}
          >
            <Home size={24} />
          </button>
          <button 
            className={`p-3 rounded-xl ${activeTab === 'applications' ? 'bg-blue-700 text-white' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('applications')}
          >
            <FileText size={24} />
          </button>
          <button 
            className={`p-3 rounded-xl ${activeTab === 'messages' ? 'bg-blue-700 text-white' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={24} />
          </button>
          <button 
            className={`p-3 rounded-xl ${activeTab === 'reports' ? 'bg-blue-700 text-white' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('reports')}
          >
            <PieChart size={24} />
          </button>
          <button 
            className={`p-3 rounded-xl ${activeTab === 'staff' ? 'bg-blue-700 text-white' : 'text-blue-300 hover:text-white'}`}
            onClick={() => setActiveTab('staff')}
          >
            <Users size={24} />
          </button>
        </nav>
        
        <button className="p-3 text-blue-300 hover:text-white">
          <Settings size={24} />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold">Employee Dashboard</h1>
              <p className="text-sm text-gray-500">Monday, April 7, 2025</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="relative">
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-blue-800">JS</span>
                </div>
                <div>
                  <p className="font-medium">Jose Santos</p>
                  <p className="text-xs text-gray-500">Document Processing Officer</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="p-8">
          <OverviewWidgets />
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <ApplicationQueue />
              <QuickActions />
            </div>
            
            <div className="w-full lg:w-1/3">
              <Notifications />
              
              {/* Municipal Resources shortcuts */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Municipal Resources</h2>
                <div className="space-y-3">
                  <a href="#" className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <FileText size={18} className="mr-3 text-blue-500" />
                    <span>Processing Policies & Guidelines</span>
                  </a>
                  <a href="#" className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <FileText size={18} className="mr-3 text-blue-500" />
                    <span>Document Templates</span>
                  </a>
                  <a href="#" className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <Users size={18} className="mr-3 text-blue-500" />
                    <span>Staff Directory</span>
                  </a>
                  <a href="#" className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <FileText size={18} className="mr-3 text-blue-500" />
                    <span>Processing Steps Guide</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;