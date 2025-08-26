import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import { permits, categories } from '../data/permitsData';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8081";

const PermitsHomepage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [qrZoomOpen, setQrZoomOpen] = useState(false);
<<<<<<< HEAD
  const [paymentOptionsOpen, setPaymentOptionsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // New state for error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
=======
  const [paymentOptionsOpen, setPaymentOptionsOpen] = useState(false); // New state for payment options modal
>>>>>>> 6b4526162a998d0973d7af3cfe777829e9c9239e

  const navigate = useNavigate();

  // Check authentication and get user info using session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
          withCredentials: true
        });
        
        setIsAuthenticated(response.data.loggedIn);

        if (response.data.loggedIn && response.data.user) {
          setUserInfo(response.data.user);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const permitRoutes = {
    "Business Permit": "/Uform",
    "Mayor's Permit": "/MayorsPermitForm",
    "Building Permit": "/BuildingPermitForm",
    "Electrical Permit": "/ElectricalPermitForm",
    "Plumbing Permit": "/PlumbingPermitForm",
    "Cedula Permit": "/CedulaPermitForm",
    "Fencing Permit": "/FencingPermitForm",
    "Electronics Permit": "/ElectronicsPermitForm",
    "Renewal Business Permit": "/RenewalBusinessPermit",
  };

  // Map permit names to application types
  const applicationTypeMapping = {
    "Business Permit": "business",
    "Mayor's Permit": "mayors",
    "Building Permit": "building",
    "Electrical Permit": "electrical",
    "Plumbing Permit": "plumbing",
    "Cedula Permit": "cedula",
    "Fencing Permit": "fencing",
    "Electronics Permit": "electronics",
    "Renewal Business Permit": "renewal_business",
  };

  // Check if user has form access before opening modal
  const handleApplyNow = async (permitName) => {
    if (!userInfo?.user_id) {
      setErrorMessage('Please log in to apply for permits');
      return;
    }

    const applicationType = applicationTypeMapping[permitName];
    
    try {
      // Check if user has existing approved payment
      const response = await axios.get(`${API_BASE_URL}/api/payments/check-access/${userInfo.user_id}/${applicationType}`, {
        withCredentials: true
      });

      const result = response.data;

      if (result.success && result.hasAccess) {
        // User has approved payment and can access form directly
        if (permitRoutes[permitName]) {
          // Mark form access as used
          await axios.post(`${API_BASE_URL}/api/payments/use-access`, {
            user_id: userInfo.user_id,
            application_type: applicationType
          }, {
            withCredentials: true
          });
          
          navigate(permitRoutes[permitName]);
          return;
        }
      }

      // No access or access already used, show payment modal
      setSelectedPermit(permitName);
      setErrorMessage(''); // Clear any previous errors
      setSuccessMessage(''); // Clear any previous success messages
      setIsModalOpen(true);

    } catch (error) {
      console.error('Error checking form access:', error);
      // If error, show payment modal as fallback
      setSelectedPermit(permitName);
      setErrorMessage(''); // Clear any previous errors
      setSuccessMessage(''); // Clear any previous success messages
      setIsModalOpen(true);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setReceiptImage(null);
    setAcceptedTerms(false);
    setQrModalOpen(false);
    setPaymentOptionsOpen(false);
    setSelectedPaymentMethod(null);
    setQrZoomOpen(false);
<<<<<<< HEAD
    setIsSubmitting(false);
    setErrorMessage(''); // Clear error message
    setSuccessMessage(''); // Clear success message
=======
  };

  const handlePaymentMethodClick = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentOptionsOpen(true); // Open payment options modal instead of QR modal directly
  };

  const handleQRCodeOption = () => {
    setPaymentOptionsOpen(false);
    setQrModalOpen(true);
  };

  const handleGoToAppOption = () => {
    const paymentLinks = {
      'gcash': {
        android: 'https://play.google.com/store/apps/details?id=com.globe.gcash.android',
        ios: 'https://apps.apple.com/ph/app/gcash/id520948884',
        web: 'https://www.gcash.com/'
      },
      'maya': {
        android: 'https://play.google.com/store/apps/details?id=com.paymaya.wallet',
        ios: 'https://apps.apple.com/ph/app/maya/id1076232290',
        web: 'https://www.maya.ph/'
      }
    };

    // Try to open the mobile app first, fallback to web
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    let linkToOpen;
    if (isAndroid) {
      linkToOpen = paymentLinks[selectedPaymentMethod].android;
    } else if (isIOS) {
      linkToOpen = paymentLinks[selectedPaymentMethod].ios;
    } else {
      linkToOpen = paymentLinks[selectedPaymentMethod].web;
    }

    window.open(linkToOpen, '_blank');
    setPaymentOptionsOpen(false);
  };

  const handleClosePaymentOptions = () => {
    setPaymentOptionsOpen(false);
    setSelectedPaymentMethod(null);
  };

  const handleCloseQr = () => {
    setQrModalOpen(false);
    setSelectedPaymentMethod(null);
    setQrZoomOpen(false);
  };

  const handleQrImageClick = () => {
    setQrZoomOpen(true);
  };

  const handleCloseZoom = () => {
    setQrZoomOpen(false);
>>>>>>> 6b4526162a998d0973d7af3cfe777829e9c9239e
  };

  const handlePaymentMethodClick = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentOptionsOpen(true);
  };

  const handleQRCodeOption = () => {
    setPaymentOptionsOpen(false);
    setQrModalOpen(true);
  };

  const handleGoToAppOption = () => {
    const paymentLinks = {
      'gcash': {
        android: 'https://play.google.com/store/apps/details?id=com.globe.gcash.android',
        ios: 'https://apps.apple.com/ph/app/gcash/id520948884',
        web: 'https://www.gcash.com/'
      },
      'maya': {
        android: 'https://play.google.com/store/apps/details?id=com.paymaya.wallet',
        ios: 'https://apps.apple.com/ph/app/maya/id1076232290',
        web: 'https://www.maya.ph/'
      }
    };

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    let linkToOpen;
    if (isAndroid) {
      linkToOpen = paymentLinks[selectedPaymentMethod].android;
    } else if (isIOS) {
      linkToOpen = paymentLinks[selectedPaymentMethod].ios;
    } else {
      linkToOpen = paymentLinks[selectedPaymentMethod].web;
    }

    window.open(linkToOpen, '_blank');
    setPaymentOptionsOpen(false);
  };

  const handleClosePaymentOptions = () => {
    setPaymentOptionsOpen(false);
    setSelectedPaymentMethod(null);
  };

  const handleCloseQr = () => {
    setQrModalOpen(false);
    setSelectedPaymentMethod(null);
    setQrZoomOpen(false);
  };

  const handleQrImageClick = () => {
    setQrZoomOpen(true);
  };

  const handleCloseZoom = () => {
    setQrZoomOpen(false);
  };

  // FIXED: Enhanced error handling for payment submission
  const handleSubmitPayment = async () => {
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    if (!receiptImage || !acceptedTerms || !userInfo?.user_id) {
      setErrorMessage('Please fill all required fields and accept the terms');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('user_id', userInfo.user_id);
      formData.append('application_type', applicationTypeMapping[selectedPermit]);
      formData.append('permit_name', selectedPermit);
      formData.append('payment_method', selectedPaymentMethod || 'other');
      formData.append('receipt_image', receiptImage);

      console.log('Submitting payment with data:', {
        user_id: userInfo.user_id,
        application_type: applicationTypeMapping[selectedPermit],
        permit_name: selectedPermit,
        payment_method: selectedPaymentMethod || 'other'
      });

      const response = await axios.post(`${API_BASE_URL}/api/payments/submit`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      });

      const result = response.data;
      console.log('Payment submission response:', result);

      if (result.success) {
        setSuccessMessage(result.message || 'Payment submitted successfully!');
        setIsModalOpen(false);
        setIsConfirmationOpen(true);
        
        // Reset form
        setReceiptImage(null);
        setAcceptedTerms(false);
        setSelectedPaymentMethod(null);
        setErrorMessage(''); // Clear any error messages
      } else {
        setErrorMessage(result.message || 'Failed to submit payment. Please try again.');
      }

    } catch (error) {
      console.error('Payment submission error:', error);
      
      let errorMsg = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
          errorMsg = serverMessage;
        } else {
          errorMsg = `Server error (${error.response.status}). Please try again.`;
        }
        
        // Log detailed error info for debugging
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = 'No response from server. Please check your connection and try again.';
        console.error('No response received:', error.request);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceed = () => {
    setIsConfirmationOpen(false);
    setSuccessMessage(''); // Clear success message
    // Don't navigate to form immediately - wait for admin approval
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Don't render the component if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Uheader />

      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-3 font-medium text-sm focus:outline-none transition-colors duration-200
                  ${activeTab === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {category.name} Permits
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {categories.find(cat => cat.id === activeTab)?.name} Permits
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {permits[activeTab].map((permit, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-blue-700">{permit.name}</h3>
                  <p className="text-gray-600 mt-2">{permit.description}</p>
                  <button
                    onClick={() => handleApplyNow(permit.name)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <UFooter />

      {/* Step 1: Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Confirm Application</h2>

            <p className="text-gray-700 mb-4">
              To apply for the <span className="font-semibold">{selectedPermit}</span>, you are required to pay a <span className="text-blue-600 font-semibold">20% advance payment</span> before proceeding.
            </p>

            {selectedPermit === "Business Permit" && (
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Requirements:</h3>
                <div className="text-black text-sm" style={{ fontFamily: 'Arial', textAlign: 'left' }}>
                  <p>1. FILLED-UP UNIFIED FORM (2 COPIES)</p>
                  <p>2. SEC/DTI/CDA CERTIFICATE (IF ANY) - PHOTOCOPY</p>
                  <p>3. LOCATION SKETCH OF THE NEW BUSINESS</p>
                  <p>4. SWORN STATEMENT OF CAPITAL</p>
                  <p>5. TAX CLEARANCE</p>
                  <p>6. BRGY. BUSINESS CLEARANCE 2025 - PHOTOCOPY</p>
                  <p>7. CEDULA 2025 - PHOTOCOPY</p>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Success Message Display */}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block mb-1 font-medium text-sm">
                Upload Receipt/Screenshot (Gcash, Maya, etc.):
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 rounded p-2 text-sm"
                onChange={(e) => {
                  setReceiptImage(e.target.files[0]);
                  setErrorMessage(''); // Clear error when user selects file
                }}
              />
              
              {/* Payment Method Options */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3 text-center">Choose Payment Method:</p>
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => handlePaymentMethodClick('gcash')}
                    className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Pay with GCash
                  </button>
                  
                  <button
                    onClick={() => handlePaymentMethodClick('maya')}
                    className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Pay with Maya
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 border border-gray-200 rounded bg-gray-50 text-sm text-gray-700">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setErrorMessage(''); // Clear error when user accepts terms
                }}
              />
              <label htmlFor="terms">
                I understand and agree to pay a 20% advance fee as part of the application process. This is non-refundable and required before final processing.
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                disabled={!acceptedTerms || !receiptImage || isSubmitting}
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Payment Options Modal */}
      {paymentOptionsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-blue-600">
              {selectedPaymentMethod === 'gcash' ? 'GCash' : 'Maya'} Payment Options
            </h2>
            
            <p className="text-sm text-gray-600 mb-6">
              Choose how you would like to make your payment:
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleQRCodeOption}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M12 8h4.01" />
                </svg>
                Scan QR Code
              </button>
              
              <button
                onClick={handleGoToAppOption}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Go to {selectedPaymentMethod === 'gcash' ? 'GCash' : 'Maya'} App
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleClosePaymentOptions}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-blue-600">
              {selectedPaymentMethod === 'gcash' ? 'GCash' : 'Maya'} QR Code
            </h2>
            
            <div className="mb-4">
              <img 
                src="/img/QR.png"
                alt={`${selectedPaymentMethod === 'gcash' ? 'GCash' : 'Maya'} QR Code`} 
                className="w-48 h-48 object-contain mx-auto border border-gray-200 rounded-lg cursor-zoom-in hover:border-blue-300 transition-all"
                onClick={handleQrImageClick}
              />
              <p className="text-xs text-gray-500 mt-2">Click to zoom</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your {selectedPaymentMethod === 'gcash' ? 'GCash' : 'Maya'} app to make the payment
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> After payment, take a screenshot of the receipt and upload it above.
              </p>
            </div>
            
            <button
              onClick={handleCloseQr}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Zoom Modal */}
      {qrZoomOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative">
            <img 
              src="/img/QR.png"
              alt="QR Code Zoomed"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={handleCloseZoom}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirmation Modal */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-600">Payment Submitted!</h2>
            <p className="text-gray-700 mb-3">
              Your 20% advance payment receipt has been successfully submitted for review.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Our staff will review your payment within 24-48 hours. Once approved, you will be able to access and fill out the official application form.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-blue-800">
                <strong>Next Steps:</strong> Check your application status regularly. You'll receive access to the form once your payment is verified and approved.
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermitsHomepage;