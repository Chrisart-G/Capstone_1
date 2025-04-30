import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Loader, FileText, RefreshCcw } from 'lucide-react';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import axios from 'axios';

function DocumentStatusTracker() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPermitData = async () => {
      try {

        const response = await axios.get('http://localhost:8081/api/businesspermits', {
          withCredentials: true
        });
        
        if (response.data.permits && response.data.permits.length > 0) {
          // Get the most recent application
          const latestPermit = response.data.permits[0];
          
          // Transform the data to fit our timeline structure
          const applicationData = {
            id: latestPermit.id,
            title: `${latestPermit.application_type} - ${latestPermit.business_name}`,
            status: latestPermit.status,
            email: latestPermit.email,
            applicationDate: new Date(latestPermit.application_date).toLocaleString(),
            createdAt: new Date(latestPermit.created_at).toLocaleString(),
            steps: transformStatusToSteps(latestPermit.status)
          };
          
          setApplication(applicationData);
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
    // Define all possible steps
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
        name: "Verified",
        message: "Your application information has been verified.",
        icon: Loader
      },
      {
        name: "Approved/Rejected",
        message: "",
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
    switch(status?.toLowerCase()) {
      case 'submitted':
        currentStepIndex = 0;
        break;
      case 'under review':
        currentStepIndex = 1;
        break;
      case 'verified':
        currentStepIndex = 2;
        break;
      case 'approved':
      case 'rejected':
        currentStepIndex = 3;
        allSteps[3].name = status; // Update name to exactly match status
        allSteps[3].message = status === 'Approved' ? 
          "Your application has been approved." : 
          "Your application has been rejected. Please check your email for details.";
        break;
      case 'ready for pickup':
        currentStepIndex = 4;
        break;
      default:
        currentStepIndex = 0; // Default to submitted
    }
    
    // Update steps with completed and current flags
    return allSteps.map((step, index) => ({
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

  if (loading) {
    return (
      <div>
        <Uheader/>
        <div className="flex justify-center items-center h-64">
          <RefreshCcw className="animate-spin mr-2" />
          <span>Loading your application status...</span>
        </div>
        <UFooter/>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Uheader/>
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
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
        <UFooter/>
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <Uheader/>
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">No Applications Found</h3>
            <p>You don't have any active permit applications. Please submit a new application.</p>
          </div>
        </div>
        <UFooter/>
      </div>
    );
  }

  return (
    <div>
      <Uheader/>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{application.title}</h1>
          <p className="text-gray-600">Application ID: {application.id}</p>
          <p className="text-gray-600">Email: {application.email}</p>
          <p className="text-gray-600">Applied on: {application.applicationDate}</p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Status: {application.status}
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          {application.steps.map((step, index) => (
            <div key={step.name} className="mb-8 flex items-start">
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(step)} text-white shrink-0`}>
                {React.createElement(step.icon, { size: 20 })}
              </div>

              {/* Vertical Line */}
              {index < application.steps.length - 1 && (
                <div 
                  className={`absolute left-5 ml-0 h-full w-0.5 ${index === 0 || step.completed ? "bg-green-500" : "bg-gray-300"}`} 
                  style={{ 
                    top: 40, 
                    height: "calc(100% - 40px)", 
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
      <UFooter/>
    </div>
  );
}

export default DocumentStatusTracker;