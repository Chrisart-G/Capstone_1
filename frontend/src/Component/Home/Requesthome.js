// pages/PermitsHomepage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';
import { permits, categories } from '../data/permitsData';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

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
  const [paymentOptionsOpen, setPaymentOptionsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pricing state
  const [priceInfo, setPriceInfo] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');

  // NEW: Renewal business state (multiple permits)
  const [renewalBusinesses, setRenewalBusinesses] = useState([]);
  const [selectedRenewalBusinessId, setSelectedRenewalBusinessId] =
    useState(null);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalError, setRenewalError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
          withCredentials: true,
        });

        setIsAuthenticated(response.data.loggedIn);

        if (response.data.loggedIn && response.data.user) {
          setUserInfo(response.data.user);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const permitRoutes = {
    'Business Permit': '/Uform',
    "Mayor's Permit": '/MayorsPermitForm',
    'Building Permit': '/BuildingPermitForm',
    'Electrical Permit': '/ElectricalPermitForm',
    'Plumbing Permit': '/PlumbingPermitForm',
    'Cedula Permit': '/CedulaPermitForm',
    'Fencing Permit': '/FencingPermitForm',
    'Electronics Permit': '/ElectronicsPermitForm',
    'Renewal Business Permit': '/RenewalBusinessPermit',
  };

 // pages/PermitsHomepage.jsx
const applicationTypeMapping = {
  'Business Permit': 'business',
  "Mayor's Permit": 'mayors',
  'Building Permit': 'building',
  'Electrical Permit': 'electrical',
  'Plumbing Permit': 'plumbing',
  'Cedula Permit': 'cedula',
  'Fencing Permit': 'fencing',
  'Electronics Permit': 'electronics',
  'Renewal Business Permit': 'renewal_business',
  'Zoning Permit': 'zoning',  // ← ADD THIS LINE
};

  // Fetch price from /api/document-prices/public/:application_type
  const fetchPermitPrice = async (permitName) => {
    const applicationType = applicationTypeMapping[permitName];
    if (!applicationType) {
      setPriceInfo(null);
      setPriceError('');
      return;
    }

    try {
      setPriceLoading(true);
      setPriceError('');
      setPriceInfo(null);

      const res = await axios.get(
        `${API_BASE_URL}/api/document-prices/public/${applicationType}`
      );

      if (res.data && res.data.success && res.data.data) {
        const data = res.data.data;
        setPriceInfo({
          ...data,
          default_price: Number(data.default_price ?? 0),
          current_price: Number(data.current_price ?? 0),
          payment_percentage: Number(data.payment_percentage ?? 100),
        });
      } else {
        setPriceInfo(null);
        setPriceError(res.data?.message || 'Failed to load permit fee.');
      }
    } catch (err) {
      console.error('Error fetching permit price:', err);
      setPriceInfo(null);
      setPriceError('Failed to load permit fee.');
    } finally {
      setPriceLoading(false);
    }
  };

  // NEW: fetch ALL business permits for this user (for renewal)
  const fetchRenewalBusinesses = async (userId) => {
    if (!userId) return;

    try {
      setRenewalLoading(true);
      setRenewalError('');
      setRenewalBusinesses([]);
      setSelectedRenewalBusinessId(null);

      // NOTE: use the LIST endpoint so we get *all* permits, not just latest
      const res = await axios.get(
        `${API_BASE_URL}/api/renewal-business-permit/list/${userId}`,
        { withCredentials: true }
      );

      if (res.data && res.data.success && res.data.data) {
        const raw = res.data.data;
        const list = Array.isArray(raw) ? raw : [raw];

        setRenewalBusinesses(list);
        if (list.length > 0) {
          setSelectedRenewalBusinessId(list[0].id);
        }
      } else {
        setRenewalBusinesses([]);
        setRenewalError(
          res.data?.message || 'No existing business permit found for renewal.'
        );
      }
    } catch (err) {
      console.error('Error fetching renewal businesses:', err);
      setRenewalBusinesses([]);
      setRenewalError('Failed to load your existing business permits.');
    } finally {
      setRenewalLoading(false);
    }
  };

  const handleApplyNow = async (permitName) => {
    if (!userInfo?.user_id) {
      setErrorMessage('Please log in to apply for permits');
      return;
    }

    const applicationType = applicationTypeMapping[permitName];

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/check-access/${userInfo.user_id}/${applicationType}`,
        { withCredentials: true }
      );

      const result = response.data;

      // If user already has access (payment approved), go straight to form
      if (result.success && result.hasAccess) {
        if (permitRoutes[permitName]) {
          // 🔹 Use the receipt_id returned by check-access and call
          //     POST /api/payments/use-access/:receiptId
          if (result.receipt_id) {
            await axios.post(
              `${API_BASE_URL}/api/payments/use-access/${result.receipt_id}`,
              null,
              { withCredentials: true }
            );
          }

          navigate(permitRoutes[permitName]);
          return;
        }
      }

      // Otherwise, open the payment modal
      setSelectedPermit(permitName);
      setErrorMessage('');
      setSuccessMessage('');

      fetchPermitPrice(permitName);

      // NEW: for Renewal Business Permit, also load the businesses list
      if (permitName === 'Renewal Business Permit') {
        fetchRenewalBusinesses(userInfo.user_id);
      } else {
        setRenewalBusinesses([]);
        setRenewalError('');
        setSelectedRenewalBusinessId(null);
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error checking form access:', error);
      setSelectedPermit(permitName);
      setErrorMessage('');
      setSuccessMessage('');

      fetchPermitPrice(permitName);

      if (permitName === 'Renewal Business Permit') {
        fetchRenewalBusinesses(userInfo.user_id);
      } else {
        setRenewalBusinesses([]);
        setRenewalError('');
        setSelectedRenewalBusinessId(null);
      }

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
    setIsSubmitting(false);
    setErrorMessage('');
    setSuccessMessage('');
    setPriceInfo(null);
    setPriceError('');

    // NEW: reset renewal state
    setRenewalBusinesses([]);
    setRenewalError('');
    setSelectedRenewalBusinessId(null);
    setRenewalLoading(false);
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
      gcash: {
        android:
          'https://play.google.com/store/apps/details?id=com.globe.gcash.android',
        ios: 'https://apps.apple.com/ph/app/gcash/id520948884',
        web: 'https://www.gcash.com/',
      },
      maya: {
        android:
          'https://play.google.com/store/apps/details?id=com.paymaya.wallet',
        ios: 'https://apps.apple.com/ph/app/maya/id1076232290',
        web: 'https://www.maya.ph/',
      },
    };

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

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

  const handleSubmitPayment = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Extra validation for renewal: must choose a business to renew
    if (selectedPermit === 'Renewal Business Permit') {
      if (!renewalBusinesses.length) {
        setErrorMessage(
          'You do not have any existing business permits to renew.'
        );
        return;
      }
      if (!selectedRenewalBusinessId) {
        setErrorMessage('Please select which business you want to renew.');
        return;
      }
    }

    if (!receiptImage || !acceptedTerms || !userInfo?.user_id) {
      setErrorMessage('Please fill all required fields and accept the terms');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('user_id', userInfo.user_id);
      formData.append(
        'application_type',
        applicationTypeMapping[selectedPermit]
      );
      formData.append('permit_name', selectedPermit);
      formData.append('payment_method', selectedPaymentMethod || 'other');
      formData.append('receipt_image', receiptImage);

      // NEW: for renewal, send the selected business_permit id
      if (selectedPermit === 'Renewal Business Permit') {
        formData.append(
          'previous_business_permit_id',
          selectedRenewalBusinessId
        );
      }

      console.log('Submitting payment with data:', {
        user_id: userInfo.user_id,
        application_type: applicationTypeMapping[selectedPermit],
        permit_name: selectedPermit,
        payment_method: selectedPaymentMethod || 'other',
        previous_business_permit_id:
          selectedPermit === 'Renewal Business Permit'
            ? selectedRenewalBusinessId
            : undefined,
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/payments/submit`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      const result = response.data;
      console.log('Payment submission response:', result);

      if (result.success) {
        setSuccessMessage(
          result.message || 'Payment submitted successfully!'
        );
        setIsModalOpen(false);
        setIsConfirmationOpen(true);

        setReceiptImage(null);
        setAcceptedTerms(false);
        setSelectedPaymentMethod(null);
        setErrorMessage('');
      } else {
        setErrorMessage(
          result.message || 'Failed to submit payment. Please try again.'
        );
      }
    } catch (error) {
      console.error('Payment submission error:', error);

      let errorMsg =
        'An unexpected error occurred. Please try again.';

      if (error.response) {
        const serverMessage = error.response.data?.message;
        if (serverMessage) {
          errorMsg = serverMessage;
        } else {
          errorMsg = `Server error (${error.response.status}). Please try again.`;
        }

        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        errorMsg =
          'No response from server. Please check your connection and try again.';
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceed = () => {
    setIsConfirmationOpen(false);
    setSuccessMessage('');
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl px-6 py-4 text-sm text-slate-900">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const computedCollectedAmount =
    priceInfo && !Number.isNaN(priceInfo.current_price)
      ? (priceInfo.current_price * (priceInfo.payment_percentage || 100)) /
        100
      : null;

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <Uheader />

      <main className="container mx-auto py-8 px-4 flex-1">
        <div className="bg-white/95 rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b">
            {categories
              .filter(
                (category) =>
                  ![
                    'Environmental',
                    'Event & Public Gathering',
                    'Transportation & Vehicle',
                  ].includes(category.name)
              )
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-4 py-3 font-medium text-sm focus:outline-none transition-colors duration-200
                  ${
                    activeTab === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {category.name} Permits
                </button>
              ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {categories.find((cat) => cat.id === activeTab)?.name}{' '}
              Permits
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {permits[activeTab].map((permit, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-blue-700">
                    {permit.name}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {permit.description}
                  </p>
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
            <h2 className="text-xl font-bold mb-2">
              Confirm Application
            </h2>

            {/* NEW: Show current business list for renewal */}
            {selectedPermit === 'Renewal Business Permit' && (
              <div className="mb-3 p-3 rounded-md bg-blue-50 border border-blue-100 text-sm">
                <p className="text-xs font-semibold text-blue-800 mb-2">
                  Select Business to Renew
                </p>

                {renewalLoading && (
                  <p className="text-xs text-gray-600">
                    Loading your existing business permits...
                  </p>
                )}

                {!renewalLoading && renewalError && (
                  <p className="text-xs text-red-500">
                    {renewalError}
                  </p>
                )}

                {!renewalLoading &&
                  !renewalError &&
                  renewalBusinesses.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {renewalBusinesses.map((biz) => (
                        <button
                          key={biz.id}
                          type="button"
                          onClick={() =>
                            setSelectedRenewalBusinessId(biz.id)
                          }
                          className={`w-full text-left p-2 rounded-md border flex items-start gap-2 ${
                            selectedRenewalBusinessId === biz.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
                          }`}
                        >
                          <input
                            type="radio"
                            className="mt-1"
                            checked={
                              selectedRenewalBusinessId === biz.id
                            }
                            onChange={() =>
                              setSelectedRenewalBusinessId(biz.id)
                            }
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900">
                              {biz.business_name}
                            </p>
                            {biz.trade_name && (
                              <p className="text-xs text-gray-700">
                                Trade Name: {biz.trade_name}
                              </p>
                            )}
                            {biz.permit_no && (
                              <p className="text-xs text-gray-700">
                                Permit No:{' '}
                                <span className="font-medium">
                                  {biz.permit_no}
                                </span>
                              </p>
                            )}
                            {biz.business_address && (
                              <p className="text-xs text-gray-700">
                                Address:{' '}
                                <span className="font-medium">
                                  {biz.business_address}
                                </span>
                              </p>
                            )}
                            {biz.valid_until && (
                              <p className="text-xs text-gray-700">
                                Valid Until:{' '}
                                <span className="font-medium">
                                  {new Date(
                                    biz.valid_until
                                  ).toLocaleDateString('en-PH')}
                                </span>
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                {!renewalLoading &&
                  !renewalError &&
                  renewalBusinesses.length === 0 && (
                    <p className="text-xs text-gray-600">
                      We could not find any existing business permit
                      linked to your account. If this is incorrect,
                      please contact the municipal office.
                    </p>
                  )}
              </div>
            )}

            {/* UPDATED TO SHOW PRICE */}
            <p className="text-gray-700 mb-2">
              To apply for the{' '}
              <span className="font-semibold">
                {selectedPermit}
              </span>
              , you are required to pay the{' '}
              <span className="text-blue-600 font-semibold">
                processing fee
                {priceInfo &&
                  !Number.isNaN(priceInfo.current_price) &&
                  ` of ₱${priceInfo.current_price.toFixed(2)}`}
              </span>{' '}
              before proceeding.
            </p>

            {priceLoading && (
              <p className="text-xs text-gray-500 mb-2">
                Loading permit fee...
              </p>
            )}

            {!priceLoading && priceError && (
              <p className="text-xs text-red-500 mb-2">
                {priceError}
              </p>
            )}

            {!priceLoading && priceInfo && (
              <div className="text-xs text-gray-700 mb-3">
                <p>
                  Standard permit fee:{' '}
                  <span className="font-semibold">
                    ₱{priceInfo.current_price.toFixed(2)}
                  </span>
                </p>
                <p>
                  Payment collected now:{' '}
                  <span className="font-semibold">
                    {priceInfo.payment_percentage.toFixed(0)}%
                  </span>{' '}
                  {computedCollectedAmount !== null && (
                    <>
                      (
                      <span className="font-semibold">
                        ₱{computedCollectedAmount.toFixed(2)}
                      </span>
                      )
                    </>
                  )}
                </p>
              </div>
            )}

            {selectedPermit === 'Business Permit' && (
              <div className="mt-2 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold mb-2">
                  Requirements:
                </h3>
                <div
                  className="text-black text-sm"
                  style={{
                    fontFamily: 'Arial',
                    textAlign: 'left',
                  }}
                >
                  <p>1. FILLED-UP UNIFIED FORM (2 COPIES)</p>
                  <p>
                    2. SEC/DTI/CDA CERTIFICATE (IF ANY) - PHOTOCOPY
                  </p>
                  <p>3. LOCATION SKETCH OF THE NEW BUSINESS</p>
                  <p>4. SWORN STATEMENT OF CAPITAL</p>
                  <p>5. TAX CLEARANCE</p>
                  <p>
                    6. BRGY. BUSINESS CLEARANCE 2025 - PHOTOCOPY
                  </p>
                  <p>7. CEDULA 2025 - PHOTOCOPY</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-800 text-sm font-medium">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-green-800 text-sm font-medium">
                    {successMessage}
                  </p>
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
                  setErrorMessage('');
                }}
              />

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Choose Payment Method:
                </p>
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
                  setErrorMessage('');
                }}
              />
              <label htmlFor="terms">
                I understand and agree to pay the full permit fee
                as part of the application process. This is
                non-refundable and required before final
                processing.
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
                disabled={
                  !acceptedTerms || !receiptImage || isSubmitting
                }
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

      {/* Payment Options Modal */}
      {paymentOptionsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-blue-600">
              {selectedPaymentMethod === 'gcash'
                ? 'GCash'
                : 'Maya'}{' '}
              Payment Options
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Choose how you would like to make your payment:
            </p>

            <div className="space-y-3">
              <button
                onClick={handleQRCodeOption}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M12 8h4.01"
                  />
                </svg>
                Scan QR Code
              </button>

              <button
                onClick={handleGoToAppOption}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Go to{' '}
                {selectedPaymentMethod === 'gcash'
                  ? 'GCash'
                  : 'Maya'}{' '}
                App
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
              {selectedPaymentMethod === 'gcash'
                ? 'GCash'
                : 'Maya'}{' '}
              QR Code
            </h2>

            <div className="mb-4">
              <img
                src="/img/QR.png"
                alt={`${
                  selectedPaymentMethod === 'gcash'
                    ? 'GCash'
                    : 'Maya'
                } QR Code`}
                className="w-48 h-48 object-contain mx-auto border border-gray-200 rounded-lg cursor-zoom-in hover:border-blue-300 transition-all"
                onClick={handleQrImageClick}
              />
              <p className="text-xs text-gray-500 mt-2">
                Click to zoom
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your{' '}
              {selectedPaymentMethod === 'gcash'
                ? 'GCash'
                : 'Maya'}{' '}
              app to make the payment
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> After payment, take a
                screenshot of the receipt and upload it above.
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
              <svg
                className="w-16 h-16 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4 text-green-600">
              Payment Submitted!
            </h2>

            <p className="text-gray-700 mb-3">
              Your full payment receipt has been successfully
              submitted for review.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Our staff will review your payment within 24-48
              hours. Once approved, you will be able to access
              and fill out the official application form.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-blue-800">
                <strong>Next Steps:</strong> Check your application
                status regularly. You'll receive access to the
                form once your payment is verified and approved.
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
