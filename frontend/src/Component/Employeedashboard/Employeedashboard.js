import React, { useState } from 'react';
import { Search, Bell, User, FileText, CheckSquare, Clock, Archive, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function EmployeeDashboard() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [expandedApplication, setExpandedApplication] = useState(null);
  
  // Sample application data
  const applications = {
    pending: [
      { id: 1, name: 'John Smith', type: 'Loan Application', submitted: '2025-04-15', documents: 5, status: 'pending' },
      { id: 2, name: 'Sarah Johnson', type: 'Insurance Claim', submitted: '2025-04-14', documents: 3, status: 'pending' },
      { id: 3, name: 'Michael Brown', type: 'Mortgage Request', submitted: '2025-04-12', documents: 7, status: 'pending' },
    ],
    inReview: [
      { id: 4, name: 'Emma Davis', type: 'Credit Application', submitted: '2025-04-10', documents: 4, status: 'in-review' },
      { id: 5, name: 'Robert Wilson', type: 'Loan Application', submitted: '2025-04-09', documents: 6, status: 'in-review' },
    ],
    approved: [
      { id: 6, name: 'Lisa Taylor', type: 'Insurance Claim', submitted: '2025-04-08', documents: 3, status: 'approved' },
      { id: 7, name: 'Thomas Garcia', type: 'Mortgage Request', submitted: '2025-04-05', documents: 8, status: 'approved' },
    ],
    rejected: [
      { id: 8, name: 'Daniel Lee', type: 'Credit Application', submitted: '2025-04-03', documents: 2, status: 'rejected' },
    ],
  };

  // Handler for approving applications
  const approveApplication = (id) => {
    alert(`Application #${id} has been approved!`);
    // In a real app, this would update the status in the database
  };

  // Handler for rejecting applications
  const rejectApplication = (id) => {
    alert(`Application #${id} has been rejected!`);
    // In a real app, this would update the status in the database
  };

  // Handler for requesting more documents
  const requestDocuments = (id) => {
    alert(`Request for additional documents sent for application #${id}`);
    // In a real app, this would send notifications to the applicant
  };

  // Toggle expanded application details
  const toggleExpandApplication = (id) => {
    if (expandedApplication === id) {
      setExpandedApplication(null);
    } else {
      setExpandedApplication(id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white">
        <div className="p-4">
        <div class="flex justify-center items-center">
          <img src="img/logo.png" alt="" class="w-40 h-30"/>
      </div>
          <h1 className="text-2xl font-bold">EmployeeDashboard</h1>
          <p className="text-indigo-200 text-sm">Hinigaran Municipality</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-3 bg-indigo-900 flex items-center">
            <FileText size={20} className="mr-3" />
            <span className="font-medium">Applications</span>
          </div>
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <CheckSquare size={20} className="mr-3" />
            <span>Verifications</span>
          </div>
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <Clock size={20} className="mr-3" />
            <span>History</span>
          </div>
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <Archive size={20} className="mr-3" />
            <span>Archives</span>
          </div>
          <div className="px-4 py-3 hover:bg-indigo-700 cursor-pointer flex items-center">
            <Settings size={20} className="mr-3" />
            <span>Settings</span>
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="ml-3">
              <p className="font-medium">Alex Morgan</p>
              <p className="text-xs text-indigo-300">Senior Approver</p>
            </div>
            <LogOut size={16} className="ml-auto cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Application Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search applications..." 
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Bell size={20} className="text-gray-600 cursor-pointer" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
          </div>
          <div className="px-6 border-t flex">
            <button 
              onClick={() => setSelectedTab('pending')}
              className={`px-4 py-3 font-medium text-sm focus:outline-none ${selectedTab === 'pending' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Pending
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">{applications.pending.length}</span>
            </button>
            <button 
              onClick={() => setSelectedTab('inReview')}
              className={`px-4 py-3 font-medium text-sm focus:outline-none ${selectedTab === 'inReview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              In Review
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{applications.inReview.length}</span>
            </button>
            <button 
              onClick={() => setSelectedTab('approved')}
              className={`px-4 py-3 font-medium text-sm focus:outline-none ${selectedTab === 'approved' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Approved
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{applications.approved.length}</span>
            </button>
            <button 
              onClick={() => setSelectedTab('rejected')}
              className={`px-4 py-3 font-medium text-sm focus:outline-none ${selectedTab === 'rejected' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Rejected
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">{applications.rejected.length}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 gap-4">
            {applications[selectedTab].map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpandApplication(application.id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{application.name}</h3>
                      <p className="text-sm text-gray-500">{application.type} • Submitted on {application.submitted}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-4">{application.documents} Documents</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'in-review' ? 'bg-blue-100 text-blue-800' :
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status === 'in-review' ? 'In Review' : 
                       application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`ml-4 text-gray-400 transition-transform ${expandedApplication === application.id ? 'transform rotate-180' : ''}`} 
                    />
                  </div>
                </div>
                
                {expandedApplication === application.id && (
                  <div className="px-4 pb-4 border-t">
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Application Details</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm"><span className="font-medium">ID:</span> APP-{application.id.toString().padStart(6, '0')}</p>
                          <p className="text-sm"><span className="font-medium">Type:</span> {application.type}</p>
                          <p className="text-sm"><span className="font-medium">Submission Date:</span> {application.submitted}</p>
                          <p className="text-sm"><span className="font-medium">Status:</span> {application.status.charAt(0).toUpperCase() + application.status.slice(1)}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Applicant Information</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm"><span className="font-medium">Name:</span> {application.name}</p>
                          <p className="text-sm"><span className="font-medium">Email:</span> {application.name.toLowerCase().replace(' ', '.')}@example.com</p>
                          <p className="text-sm"><span className="font-medium">Phone:</span> (555) 123-4567</p>
                          <p className="text-sm"><span className="font-medium">Documents:</span> {application.documents} submitted</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Documents</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: application.documents }).map((_, i) => (
                          <div key={i} className="bg-gray-50 p-2 rounded flex items-center text-sm">
                            <FileText size={14} className="mr-2 text-gray-500" />
                            Document {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                    {application.status === 'pending' || application.status === 'in-review' ? (
                      <div className="mt-4 flex justify-end space-x-3">
                        <button 
                          onClick={() => requestDocuments(application.id)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          Request Documents
                        </button>
                        <button 
                          onClick={() => rejectApplication(application.id)}
                          className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => approveApplication(application.id)}
                          className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          Approve
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}