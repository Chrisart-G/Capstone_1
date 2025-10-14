import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, Loader, FileText, RefreshCcw, ChevronDown, ChevronUp, User, Pencil, CreditCard, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';

function DocumentStatusTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();

  const fetchAllPermitData = async () => {
    try {
      console.log('Fetching all permit data...');
      
      // Fetch all data types (added 4 new permit endpoints)
      const [
        businessResponse,
        electricalResponse,
        cedulaResponse,
        paymentResponse,

        // NEW:
        plumbingResponse,
        electronicsResponse,
        buildingResponse,
        fencingResponse,
      ] = await Promise.all([
        fetch('http://localhost:8081/api/businesspermits', { credentials: 'include' }),
        fetch('http://localhost:8081/api/getelectrical-permits', { credentials: 'include' }),
        fetch('http://localhost:8081/api/cedulas-tracking', { credentials: 'include' }),
        fetch('http://localhost:8081/api/payments/tracking', { credentials: 'include' }),

        // NEW endpoints:
        fetch('http://localhost:8081/api/plumbing-permits-tracking',   { credentials: 'include' }),
        fetch('http://localhost:8081/api/electronics-permits-tracking',{ credentials: 'include' }),
        fetch('http://localhost:8081/api/building-permits-tracking',   { credentials: 'include' }),
        fetch('http://localhost:8081/api/fencing-permits-tracking',    { credentials: 'include' }),
      ]);
      
      // Parse responses
      const businessData    = await businessResponse.json();
      const electricalData  = await electricalResponse.json();
      const cedulaData      = await cedulaResponse.json();
      const paymentData     = await paymentResponse.json();

      // NEW parsed data
      const plumbingData    = await plumbingResponse.json();
      const electronicsData = await electronicsResponse.json();
      const buildingData    = await buildingResponse.json();
      const fencingData     = await fencingResponse.json();
      
      console.log('Business Response:', businessData);
      console.log('Electrical Response:', electricalData);
      console.log('Cedula Response:', cedulaData);
      console.log('Payment Response:', paymentData);
      console.log('Plumbing Response:', plumbingData);
      console.log('Electronics Response:', electronicsData);
      console.log('Building Response:', buildingData);
      console.log('Fencing Response:', fencingData);
      
      let allApplications = [];
      
      // Transform business permits
      if (businessData.permits && businessData.permits.length > 0) {
        const transformedBusinessPermits = businessData.permits.map(permit => ({
          id: `business_${permit.BusinessP_id}`,
          title: `${permit.application_type} - ${permit.business_name}`,
          type: 'Business Permit',
          status: permit.status,
          email: permit.business_email || permit.owner_email || '',
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
          email: permit.email || '',
          applicationDate: new Date(permit.created_at).toLocaleString(),
          createdAt: new Date(permit.created_at).toLocaleString(),
          applicationNo: permit.application_no,
          epNo: permit.ep_no,
          scopeOfWork: permit.scope_of_work,
          steps: transformStatusToSteps(permit.status)
        }));
        allApplications = [...allApplications, ...transformedElectricalPermits];
      }

      // Transform cedula records
      if (cedulaData.success && cedulaData.cedulas && cedulaData.cedulas.length > 0) {
        const transformedCedulas = cedulaData.cedulas.map(cedula => ({
          id: `cedula_${cedula.id}`,
          title: `Cedula - ${cedula.name}`,
          type: 'Cedula',
          status: cedula.application_status || 'pending',
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
          maritalStatus: cedula.status,
          tin: cedula.tin,
          steps: transformStatusToSteps(cedula.application_status || 'pending')
        }));
        allApplications = [...allApplications, ...transformedCedulas];
      }

      // Transform payment receipts - Enhanced with new payment details
      console.log('Processing payment data:', paymentData);
      
      if (paymentData && paymentData.success && paymentData.data && Array.isArray(paymentData.data) && paymentData.data.length > 0) {
        console.log('Payment data found, transforming...');
        const transformedPayments = paymentData.data.map(payment => {
          console.log('Processing payment:', payment);
          return {
            id: `payment_${payment.receipt_id}`,
            title: `Payment Receipt - ${payment.permit_name}`,
            type: 'Payment Receipt',
            status: payment.payment_status,
            email: payment.email || '',
            applicationDate: payment.formatted_created_at || new Date(payment.created_at).toLocaleString(),
            createdAt: payment.formatted_created_at || new Date(payment.created_at).toLocaleString(),
            applicationType: payment.application_type,
            paymentMethod: payment.payment_method,
            paymentAmount: payment.payment_amount,
            totalDocumentPrice: payment.total_document_price,
            remainingAmount: payment.remaining_amount || (payment.total_document_price - payment.payment_amount),
            paymentPercentage: payment.payment_percentage,
            adminNotes: payment.admin_notes,
            formAccessGranted: payment.form_access_granted,
            formAccessUsed: payment.form_access_used,
            formAccessUsedAt: payment.form_access_used_at,
            approvedBy: payment.approved_by_email,
            receiptId: payment.receipt_id,
            steps: transformPaymentStatusToSteps(
              payment.payment_status, 
              payment.formatted_created_at || new Date(payment.created_at).toLocaleString(), 
              payment.formatted_approved_at || (payment.approved_at ? new Date(payment.approved_at).toLocaleString() : null), 
              payment.admin_notes
            )
          };
        });
        allApplications = [...allApplications, ...transformedPayments];
        console.log('Transformed payments:', transformedPayments);
      } else {
        console.log('No payment data found or invalid structure:', paymentData);
        if (paymentData && !paymentData.success) {
          console.log('Payment API error:', paymentData.message);
        }
      }

      // ---------------------------
      // NEW: Transform plumbing permits
      // ---------------------------
      if (plumbingData && plumbingData.success && Array.isArray(plumbingData.permits) && plumbingData.permits.length > 0) {
        const transformedPlumbing = plumbingData.permits.map(p => ({
          id: `plumbing_${p.id}`,
          title: `Plumbing Permit - ${p.first_name} ${p.last_name}`,
          type: 'Plumbing Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          ppNo: p.pp_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'plumbing',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedPlumbing];
      }

      // ---------------------------
      // NEW: Transform electronics permits
      // ---------------------------
      if (electronicsData && electronicsData.success && Array.isArray(electronicsData.permits) && electronicsData.permits.length > 0) {
        const transformedElectronics = electronicsData.permits.map(p => ({
          id: `electronics_${p.id}`,
          title: `Electronics Permit - ${p.first_name} ${p.last_name}`,
          type: 'Electronics Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          epNo: p.ep_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'electronics',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedElectronics];
      }

      // ---------------------------
      // NEW: Transform building permits
      // ---------------------------
      if (buildingData && buildingData.success && Array.isArray(buildingData.permits) && buildingData.permits.length > 0) {
        const transformedBuilding = buildingData.permits.map(p => ({
          id: `building_${p.id}`,
          title: `Building Permit - ${p.first_name} ${p.last_name}`,
          type: 'Building Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          bpNo: p.bp_no,
          buildingPermitNo: p.building_permit_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'building',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedBuilding];
      }

      // ---------------------------
      // NEW: Transform fencing permits
      // ---------------------------
      if (fencingData && fencingData.success && Array.isArray(fencingData.permits) && fencingData.permits.length > 0) {
        const transformedFencing = fencingData.permits.map(p => ({
          id: `fencing_${p.id}`,
          title: `Fencing Permit - ${p.first_name} ${p.last_name}`,
          type: 'Fencing Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          fpNo: p.fp_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'fencing',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedFencing];
      }
      
      // Sort all applications by creation date (most recent first)
      allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log('All applications:', allApplications);
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
  
  useEffect(() => {
    fetchAllPermitData();
  }, []);

  // Function to handle form access
  const handleFormAccess = () => {
    // Refresh the data to show updated form access status
    fetchAllPermitData();
  };

  // Function to get form route based on application type
  const getFormRoute = (applicationType) => {
    const routes = {
      'business': '/BusinessPermitForm',
      'electrical': '/ElectricalPermitForm',
      'plumbing': '/PlumbingPermitForm',
      'cedula': '/CedulaPermitForm',
      'fencing': '/FencingPermitForm',
      'electronics': '/ElectronicsPermitForm',
      'building': '/BuildingPermitForm',
      'renewal_business': '/RenewalBusinessPermit',
      'mayors': '/MayorsPermitForm'
    };
    return routes[applicationType] || null;
  };

  // Function to handle accessing form
  const handleAccessForm = async (application) => {
    try {
      // Simply navigate to the appropriate form without updating form_access_used
      const formRoute = getFormRoute(application.applicationType);
      if (formRoute) {
        navigate(formRoute);
      } else {
        alert('Form route not found for this application type');
      }
    } catch (error) {
      console.error('Error accessing form:', error);
      alert('Failed to access form. Please try again.');
    }
  };

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

  // Function to transform payment status into steps - Enhanced with payment details
  function transformPaymentStatusToSteps(status, createdAt, approvedAt, adminNotes) {
    const steps = [
      {
        name: "PaymentSubmitted",
        message: "Payment receipt has been submitted for review.",
        icon: FileText,
        completed: true,
        current: false,
        date: createdAt || new Date().toLocaleString()
      }
    ];

    if (status === 'pending') {
      steps.push({
        name: "PaymentUnderReview", 
        message: "Your payment is being reviewed by our staff.",
        icon: Clock,
        completed: false,
        current: true,
        date: null
      });
    } else if (status === 'approved') {
      steps.push(
        {
          name: "PaymentUnderReview", 
          message: "Your payment was reviewed by our staff.",
          icon: Clock,
          completed: true,
          current: false,
          date: approvedAt || createdAt
        },
        {
          name: "PaymentApproved",
          message: "Payment has been approved. You can now access the application form.",
          icon: Check,
          completed: true,
          current: false,
          date: approvedAt || new Date().toLocaleString()
        }
      );
    } else if (status === 'rejected') {
      steps.push(
        {
          name: "PaymentUnderReview", 
          message: "Your payment was reviewed by our staff.",
          icon: Clock,
          completed: true,
          current: false,
          date: approvedAt || createdAt
        },
        {
          name: "PaymentRejected",
          message: adminNotes || "Payment was rejected. Please check your payment details and resubmit.",
          icon: AlertCircle,
          completed: false,
          current: false,
          rejected: true,
          date: approvedAt || new Date().toLocaleString()
        }
      );
    }

    return steps;
  }

  function getStatusColor(step) {
    if (step.rejected) return "bg-red-500";
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

  // Extended with new permit types (kept existing styles)
  function getPermitTypeBadgeColor(type) {
    switch(type) {
      case 'Business Permit':
        return "bg-blue-100 text-blue-800";
      case 'Electrical Permit':
        return "bg-orange-100 text-orange-800";
      case 'Electronics Permit':
        return "bg-teal-100 text-teal-800";
      case 'Building Permit':
        return "bg-amber-100 text-amber-800";
      case 'Plumbing Permit':
        return "bg-cyan-100 text-cyan-800";
      case 'Fencing Permit':
        return "bg-lime-100 text-lime-800";
      case 'Cedula':
        return "bg-green-100 text-green-800";
      case 'Payment Receipt':
        return "bg-purple-100 text-purple-800";
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
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">No Applications Found</h3>
              <p>You don't have any active permit applications or payment receipts. Please submit a new application.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Uheader />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Application Status Tracker</h1>
          <p className="text-gray-600 mt-2">Track the progress of your permit applications, cedula records, and payment receipts</p>
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
                      <span>ID: {application.id.replace(/^(business_|electrical_|cedula_|payment_|plumbing_|electronics_|building_|fencing_)/, '')}</span>
                      {application.applicationNo && <span>App No: {application.applicationNo}</span>}
                      {application.epNo && <span>EP No: {application.epNo}</span>}
                      {application.bpNo && <span>BP No: {application.bpNo}</span>}
                      {application.ppNo && <span>PP No: {application.ppNo}</span>}
                      {application.fpNo && <span>FP No: {application.fpNo}</span>}
                      {application.buildingPermitNo && <span>Building Permit No: {application.buildingPermitNo}</span>}
                      {application.applicationType && <span>Type: {application.applicationType}</span>}
                      {application.receiptId && <span>Receipt ID: {application.receiptId}</span>}
                      <span>Applied: {application.applicationDate}</span>
                      {application.email && <span>Email: {application.email}</span>}
                    </div>
                    {application.status && (
                      <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                        Status: {application.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {application.type !== 'Payment Receipt' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex items-center text-sm px-2 py-1 rounded-md text-indigo-600 hover:bg-indigo-100 transition"
                        >
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex items-center text-sm px-2 py-1 rounded-md text-red-600 hover:bg-red-100 transition"
                        >
                          <AlertCircle size={16} className="mr-1" />
                          Cancel
                        </button>
                      </>
                    )}

                    {expandedCards[application.id] ? (
                      <ChevronUp className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedCards[application.id] && (
                <div className="px-6 pb-6 border-t border-gray-200">
                  
                  {/* Enhanced Payment Receipt Details */}
                  {application.type === 'Payment Receipt' && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-medium text-purple-800 mb-3 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Application Type:</span> {application.applicationType}</div>
                        <div><span className="font-medium">Payment Method:</span> {application.paymentMethod}</div>
                        
                        {/* Enhanced Payment Details */}
                        <div className="col-span-2 bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Payment Breakdown
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Total Document Price:</span>
                              <div className="font-semibold text-lg text-blue-600">
                                ₱{parseFloat(application.totalDocumentPrice || 0).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment Amount ({application.paymentPercentage}%):</span>
                              <div className="font-semibold text-lg text-green-600">
                                ₱{parseFloat(application.paymentAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Remaining Balance:</span>
                              <div className="font-semibold text-lg text-orange-600">
                                ₱{parseFloat(application.remainingAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment Progress:</span>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{
                                    width: `${((application.paymentAmount || 0) / (application.totalDocumentPrice || 1)) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {((application.paymentAmount || 0) / (application.totalDocumentPrice || 1) * 100).toFixed(1)}% paid
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div><span className="font-medium">Form Access:</span> 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${application.formAccessGranted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {application.formAccessGranted ? 'Granted' : 'Not Granted'}
                          </span>
                        </div>
                        <div><span className="font-medium">Access Used:</span> 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${application.formAccessUsed ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                            {application.formAccessUsed ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {application.approvedBy && (
                          <div className="col-span-2"><span className="font-medium">Approved By:</span> {application.approvedBy}</div>
                        )}
                        {application.adminNotes && (
                          <div className="col-span-2">
                            <span className="font-medium">Admin Notes:</span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-sm">{application.adminNotes}</div>
                          </div>
                        )}
                      </div>

                      {/* Form Access Button Section */}
                      {getFormRoute(application.applicationType) && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Application Form Access
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {(application.status === 'approved' && application.formAccessGranted && !application.formAccessUsed) ? 
                                  'Your payment has been approved. You can now access the application form.' :
                                  application.formAccessUsed ? 
                                  'Form access has been used. You can no longer access this form.' :
                                  !application.formAccessGranted ?
                                  'Form access will be available once your payment is approved.' :
                                  'Form access not available.'
                                }
                              </p>
                            </div>
                            
                            {(application.status === 'approved' && application.formAccessGranted && !application.formAccessUsed) && (
                              <button
                                onClick={() => handleAccessForm(application)}
                                className="flex items-center px-4 py-2 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Access Form
                              </button>
                            )}
                            
                            {application.formAccessUsed && (
                              <div className="flex items-center text-gray-500">
                                <Check className="h-4 w-4 mr-2" />
                                <span className="text-sm">Form Accessed</span>
                              </div>
                            )}
                            
                            {!application.formAccessGranted && (
                              <div className="flex items-center text-orange-500">
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="text-sm">Pending Approval</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Show when form access was used */}
                          {application.formAccessUsed && application.formAccessUsedAt && (
                            <div className="mt-2 text-xs text-gray-500">
                              Form accessed on: {new Date(application.formAccessUsedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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
                          {step.name.includes('Payment') ? 
                            React.createElement(DollarSign, { size: 20 }) :
                            React.createElement(step.icon, { size: 20 })
                          }
                        </div>

                        {/* Vertical Line */}
                        {index < application.steps.length - 1 && (
                          <div 
                            className={`absolute left-5 w-0.5 ${step.completed ? "bg-green-500" : step.rejected ? "bg-red-500" : "bg-gray-300"}`} 
                            style={{ 
                              top: 40, 
                              height: "calc(100% - 80px)", 
                              transform: "translateX(-50%)" 
                            }}
                          ></div>
                        )}

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <h3 className={`font-medium ${
                            step.rejected ? "text-red-600" :
                            step.current ? "text-blue-600" : 
                            step.completed ? "text-green-600" : "text-gray-500"
                          }`}>
                            {step.name.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>

                          {step.date && (
                            <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                          )}

                          {step.message && (
                            <div className={`mt-2 p-3 rounded-lg text-sm ${
                              step.rejected ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                            }`}>
                              {step.message}
                            </div>
                          )}

                          {!step.completed && !step.current && !step.rejected && (
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
      <UFooter />
    </div>
  );
}

export default DocumentStatusTracker;
