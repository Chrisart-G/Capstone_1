import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Loader, FileText, RefreshCcw, ChevronDown, ChevronUp, User, Pencil } from 'lucide-react';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import { useNavigate } from 'react-router-dom';
function DocumentStatusTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  
  useEffect(() => {
    const fetchAllPermitData = async () => {
      try {
        // Fetch business permits, electrical permits, and cedulas
        const [businessResponse, electricalResponse, cedulaResponse] = await Promise.all([
          fetch('http://localhost:8081/api/businesspermits', {
            credentials: 'include'
          }),
          fetch('http://localhost:8081/api/getelectrical-permits', {
            credentials: 'include'
          }),
          fetch('http://localhost:8081/api/cedulas-tracking', {
            credentials: 'include'
          })
        ]);
        
        const businessData = await businessResponse.json();
        const electricalData = await electricalResponse.json();
        const cedulaData = await cedulaResponse.json();
        
        let allApplications = [];
        
        // Transform business permits
        if (businessData.permits && businessData.permits.length > 0) {
          const transformedBusinessPermits = businessData.permits.map(permit => ({
            id: `business_${permit.BusinessP_id}`,
            title: `${permit.application_type} - ${permit.business_name}`,
            type: 'Business Permit',
            status: permit.status,
            email: permit.email,
            applicationDate: new Date(permit.application_date).toLocaleString(),
            createdAt: new Date(permit.created_at).toLocaleString(),
            steps: transformStatusToSteps(permit.status)
          }));
          allApplications = [...allApplications, ...transformedBusinessPermits];
        }
        
        // Transform electrical permits
        if (electricalData.success && electricalData.permits && electricalData.permits.length > 0) {
          const transformedElectricalPermits = electricalData.permits.map(permit => ({
            id: `electrical_${permit.id}`,
            title: `Electrical Permit - ${permit.first_name} ${permit.last_name}`,
            type: 'Electrical Permit',
            status: permit.status,
            email: permit.email,
            applicationDate: new Date(permit.created_at).toLocaleString(),
            createdAt: new Date(permit.created_at).toLocaleString(),
            applicationNo: permit.application_no,
            epNo: permit.ep_no,
            scopeOfWork: permit.scope_of_work,
            steps: transformStatusToSteps(permit.status)
          }));
          allApplications = [...allApplications, ...transformedElectricalPermits];
        }

// ✅ Transform cedula records correctly - FIXED THE STATUS MAPPING
if (cedulaData.success && cedulaData.cedulas && cedulaData.cedulas.length > 0) {
  const transformedCedulas = cedulaData.cedulas.map(cedula => ({
    id: `cedula_${cedula.id}`,
    title: `Cedula - ${cedula.name}`,
    type: 'Cedula',
    status: cedula.application_status || 'pending', // ✅ This should be the APPLICATION status
    email: '',
    applicationDate: new Date(cedula.created_at).toLocaleString(),
    createdAt: new Date(cedula.created_at).toLocaleString(),
    address: cedula.address,
    placeOfBirth: cedula.place_of_birth,
    dateOfBirth: new Date(cedula.date_of_birth).toLocaleDateString(),
    profession: cedula.profession,
    yearlyIncome: parseFloat(cedula.yearly_income),
    purpose: cedula.purpose,
    sex: cedula.sex,
    maritalStatus: cedula.status, // ✅ This is the CIVIL/MARITAL status
    tin: cedula.tin,
    steps: transformStatusToSteps(cedula.application_status || 'pending')
  }));
  allApplications = [...allApplications, ...transformedCedulas];
}
        // Sort all applications by creation date (most recent first)
        allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setApplications(allApplications);
        
        // Auto-expand the first (most recent) application
        if (allApplications.length > 0) {
          setExpandedCards({ [allApplications[0].id]: true });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching permit data:", err);
        setError("Failed to load your application status. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchAllPermitData();
  }, []);

  // Function to transform the status into a steps array
function transformStatusToSteps(status) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');

  const steps = [
    {
      name: "Pending",
      message: "Your application has been submitted and is waiting to be reviewed.",
      icon: FileText
    },
    {
      name: "InReview",
      message: "Your application is currently under initial review.",
      icon: Clock
    },
    {
      name: "InProgress",
      message: "Please complete the required documents for verification.",
      icon: Loader
    },
    {
      name: "RequirementsCompleted",
      message: "All required documents have been submitted and verified.",
      icon: Check
    },
    {
      name: "Approved",
      message: "Your application has been approved.",
      icon: Check
    },
    {
      name: "ReadyForPickup",
      message: "Your document is ready for pickup at the municipal office.",
      icon: Check
    },
    {
      name: "Rejected",
      message: "Your application has been rejected. Please check your email for details.",
      icon: AlertCircle
    }
  ];

  const statusOrder = {
    "pending": 0,
    "inreview": 1,
    "inprogress": 2,
    "requirementscompleted": 3,
    "approved": 4,
    "readyforpickup": 5,
    "rejected": 6
  };

  const currentIndex = statusOrder[normalizedStatus] ?? 0;

  return steps.map((step, index) => ({
    ...step,
    completed: index < currentIndex && currentIndex !== 6,
    current: index === currentIndex && currentIndex !== 6,
    rejected: currentIndex === 6,
    date: index <= currentIndex && currentIndex !== 6 ? new Date().toLocaleString() : ""
  }));
}




  function getStatusColor(step) {
    if (step.completed) return "bg-green-500";
    if (step.current) return "bg-blue-500";
    return "bg-gray-300";
  }

  function getStatusBadgeColor(status) {
    switch(status?.toLowerCase()) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'in-review':
        return "bg-yellow-100 text-yellow-800";
      case 'pending':
        return "bg-gray-100 text-gray-800";
      case 'ready for pickup':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  }

  function getPermitTypeBadgeColor(type) {
    switch(type) {
      case 'Business Permit':
        return "bg-blue-100 text-blue-800";
      case 'Electrical Permit':
        return "bg-orange-100 text-orange-800";
      case 'Cedula':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const toggleCard = (applicationId) => {
    setExpandedCards(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <RefreshCcw className="animate-spin mr-2" />
          <span>Loading your application status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Error</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Uheader/>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">No Applications Found</h3>
              <p>You don't have any active permit applications. Please submit a new application.</p>
            </div>
          </div>
        </div>
        <UFooter/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Uheader/>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Application Status Tracker</h1>
          <p className="text-gray-600 mt-2">Track the progress of your permit applications and cedula records</p>
        </div>

        <div className="space-y-4">
          {applications.map((application, appIndex) => (
            <div key={application.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Application Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCard(application.id)}
              >
<div className="flex items-start justify-between">
  <div className="flex-1">
    <h2 className="text-xl font-bold text-gray-800 flex items-center">
      {application.title}
      {appIndex === 0 && (
        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          Latest
        </span>
      )}
    </h2>
    <div className="mt-2 flex flex-wrap gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermitTypeBadgeColor(application.type)}`}>
        {application.type}
      </span>
    </div>
    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
      <span>ID: {application.id.replace(/^(business_|electrical_|cedula_)/, '')}</span>
      {application.applicationNo && <span>App No: {application.applicationNo}</span>}
      {application.epNo && <span>EP No: {application.epNo}</span>}
      <span>Applied: {application.applicationDate}</span>
      {application.email && <span>Email: {application.email}</span>}
    </div>
    {application.status && (
      <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
        Application Status: {application.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </div>
    )}
  </div>

  {/* Action buttons (Edit + Cancel + Expand) */}
  <div className="flex flex-col items-end space-y-2 ml-4">
    {/* Edit Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        // navigation logic will go here
      }}
      className="flex items-center text-sm px-2 py-1 rounded-md text-indigo-600 hover:bg-indigo-100 transition"
    >
      <Pencil size={16} className="mr-1" />
      Edit
    </button>

    {/* Cancel Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        // cancellation logic can go here
      }}
      className="flex items-center text-sm px-2 py-1 rounded-md text-red-600 hover:bg-red-100 transition"
    >
      <AlertCircle size={16} className="mr-1" />
      Cancel
    </button>

    {/* Chevron */}
    {expandedCards[application.id] ? (
      <ChevronUp className="h-6 w-6 text-gray-400" />
    ) : (
      <ChevronDown className="h-6 w-6 text-gray-400" />
    )}
  </div>
</div>

              </div>

              {/* Expandable Timeline */}
              {expandedCards[application.id] && (
                <div className="px-6 pb-6 border-t border-gray-200">
                  
                  {/* Cedula Details Section */}
                  {application.type === 'Cedula' && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Full Name:</span> {application.title.replace('Cedula - ', '')}</div>
                        <div><span className="font-medium">Date of Birth:</span> {application.dateOfBirth}</div>
                        <div><span className="font-medium">Place of Birth:</span> {application.placeOfBirth}</div>
                        <div><span className="font-medium">Sex:</span> {application.sex}</div>
                        {/* ✅ FIXED: Now correctly shows CIVIL/MARITAL status */}
                        <div><span className="font-medium">Civil Status:</span> {application.maritalStatus}</div>
                        <div><span className="font-medium">Profession:</span> {application.profession}</div>
                        <div><span className="font-medium">Yearly Income:</span> ₱{application.yearlyIncome?.toLocaleString()}</div>
                        <div><span className="font-medium">TIN:</span> {application.tin}</div>
                        <div className="col-span-2"><span className="font-medium">Address:</span> {application.address}</div>
                        <div className="col-span-2"><span className="font-medium">Purpose:</span> {application.purpose}</div>
                      </div>
                    </div>
                  )}

                  {/* Timeline Steps */}
                  <div className="relative mt-6">
                    {application.steps.map((step, index) => (
                      <div key={step.name} className="mb-8 flex items-start">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(step)} text-white shrink-0`}>
                          {React.createElement(step.icon, { size: 20 })}
                        </div>

                        {/* Vertical Line */}
                        {index < application.steps.length - 1 && (
                          <div 
                            className={`absolute left-5 w-0.5 ${step.completed ? "bg-green-500" : "bg-gray-300"}`} 
                            style={{ 
                              top: 40, 
                              height: "calc(100% - 80px)", 
                              transform: "translateX(-50%)" 
                            }}
                          ></div>
                        )}

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <h3 className={`font-medium ${step.current ? "text-blue-600" : step.completed ? "text-green-600" : "text-gray-500"}`}>
                            {step.name}
                          </h3>

                          {step.date && (
                            <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                          )}

                          {step.message && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                              {step.message}
                            </div>
                          )}

                          {!step.completed && !step.current && (
                            <p className="text-sm text-gray-400 mt-1">Pending</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Information Section */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Need Help?</h3>
                    <p className="text-sm text-blue-700">
                      If you have any questions about your application, please contact the municipal office at (555) 123-4567 or email support@municipality.gov
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <UFooter/>
    </div>
  );
}

export default DocumentStatusTracker;