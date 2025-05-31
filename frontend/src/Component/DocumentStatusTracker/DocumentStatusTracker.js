import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Loader, FileText, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import Uheader from '../Header/User_header';

function DocumentStatusTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  
  useEffect(() => {
    const fetchPermitData = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/businesspermits', {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.permits && data.permits.length > 0) {
          // Transform ALL permits, not just the first one
          const transformedApplications = data.permits.map(permit => ({
            id: permit.BusinessP_id,
            title: `${permit.application_type} - ${permit.business_name}`,
            status: permit.status,
            email: permit.email,
            applicationDate: new Date(permit.application_date).toLocaleString(),
            createdAt: new Date(permit.created_at).toLocaleString(),
            steps: transformStatusToSteps(permit.status)
          }));
          
          setApplications(transformedApplications);
          
          // Auto-expand the first (most recent) application
          if (transformedApplications.length > 0) {
            setExpandedCards({ [transformedApplications[0].id]: true });
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching permit data:", err);
        setError("Failed to load your application status. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchPermitData();
  }, []);

  // Function to transform the status into a steps array
  function transformStatusToSteps(status) {
    const allSteps = [
      {
        name: "Submitted",
        message: "Your application has been successfully submitted. We'll begin processing it shortly.",
        icon: FileText
      },
      {
        name: "Under Review",
        message: "Your application is currently being reviewed by our planning department.",
        icon: Clock
      },
      {
        name: "In Review",
        message: "Your application is currently being reviewed by our planning department.",
        icon: Clock
      },
      {
        name: "Verified",
        message: "Your application information has been verified.",
        icon: Loader
      },
      {
        name: "Approved",
        message: "Your application has been approved.",
        icon: Check
      },
      {
        name: "Rejected",
        message: "Your application has been rejected. Please check your email for details.",
        icon: AlertCircle
      },
      {
        name: "Ready for Pickup",
        message: "Your permit is ready for pickup at the municipal office.",
        icon: Check
      }
    ];
    
    // Determine the current step based on status
    let currentStepIndex;
    let relevantSteps = [];
    
    switch(status?.toLowerCase()) {
      case 'pending':
        currentStepIndex = 0;
        relevantSteps = [allSteps[0], allSteps[1], allSteps[3], allSteps[4], allSteps[6]];
        break;
      case 'in-review':
      case 'under review':
        currentStepIndex = 1;
        relevantSteps = [allSteps[0], allSteps[2], allSteps[3], allSteps[4], allSteps[6]];
        break;
      case 'verified':
        currentStepIndex = 2;
        relevantSteps = [allSteps[0], allSteps[2], allSteps[3], allSteps[4], allSteps[6]];
        break;
      case 'approved':
        currentStepIndex = 3;
        relevantSteps = [allSteps[0], allSteps[2], allSteps[3], allSteps[4], allSteps[6]];
        break;
      case 'rejected':
        currentStepIndex = 3;
        relevantSteps = [allSteps[0], allSteps[2], allSteps[3], allSteps[5]];
        break;
      case 'ready for pickup':
        currentStepIndex = 4;
        relevantSteps = [allSteps[0], allSteps[2], allSteps[3], allSteps[4], allSteps[6]];
        break;
      default:
        currentStepIndex = 0;
        relevantSteps = [allSteps[0], allSteps[1], allSteps[3], allSteps[4], allSteps[6]];
    }
    
    // Update steps with completed and current flags
    return relevantSteps.map((step, index) => ({
      ...step,
      completed: index < currentStepIndex,
      current: index === currentStepIndex,
      date: index <= currentStepIndex ? new Date().toLocaleString() : ""
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
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">No Applications Found</h3>
              <p>You don't have any active permit applications. Please submit a new application.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50">
       <Uheader/>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Application Status Tracker</h1>
          <p className="text-gray-600 mt-2">Track the progress of your permit applications</p>
        </div>

        <div className="space-y-4">
          {applications.map((application, appIndex) => (
            <div key={application.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Application Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCard(application.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      {application.title}
                      {appIndex === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Latest
                        </span>
                      )}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>ID: {application.id}</span>
                      <span>Applied: {application.applicationDate}</span>
                      <span>Email: {application.email}</span>
                    </div>
                    <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                      Status: {application.status}
                    </div>
                  </div>
                  <div className="ml-4">
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
    </div>
  );
}

export default DocumentStatusTracker;