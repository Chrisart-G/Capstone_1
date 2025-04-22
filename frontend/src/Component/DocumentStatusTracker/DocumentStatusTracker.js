import React from 'react';
import { Check, Clock, AlertCircle, Loader, FileText } from 'lucide-react';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';

function Documentstatusracker() {
  // Sample application data
  const application = {
    id: "APP-2025-04-07-001",
    title: "Building Permit Application",
    status: "Under Review",
    steps: [
      {
        name: "Submitted",
        date: "April 3, 2025 - 10:15 AM",
        message: "Your application has been successfully submitted. We'll begin processing it shortly.",
        completed: true,
        current: false,
        icon: FileText
      },
      {
        name: "Under Review",
        date: "April 5, 2025 - 2:30 PM",
        message: "Your application is currently being reviewed by our planning department.",
        completed: false,
        current: true,
        icon: Clock
      },
      {
        name: "Verified",
        date: "",
        message: "",
        completed: false,
        current: false,
        icon: Loader
      },
      {
        name: "Approved/Rejected",
        date: "",
        message: "",
        completed: false,
        current: false,
        icon: AlertCircle
      },
      {
        name: "Ready for Pickup",
        date: "",
        message: "",
        completed: false,
        current: false,
        icon: Check
      }
    ]
  };

  function getStatusColor(step) {
    if (step.completed) return "bg-green-500";
    if (step.current) return "bg-blue-500";
    return "bg-gray-300";
  }

  return (
    <div>
        <Uheader/>
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{application.title}</h1>
        <p className="text-gray-600">Application ID: {application.id}</p>
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
              <div className={`absolute left-5 ml-0 h-full w-0.5 ${index === 0 || step.completed ? "bg-green-500" : "bg-gray-300"}`} style={{ top: 40, height: "calc(100% - 40px)", transform: "translateX(-50%)" }}></div>
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

export default Documentstatusracker;