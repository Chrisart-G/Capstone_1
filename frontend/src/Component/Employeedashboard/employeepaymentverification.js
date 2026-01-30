import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Header/Sidebar';

const PaymentVerification = () => {
  const API_BASE_URL = "http://localhost:8081";
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Payment verification specific state
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [statistics, setStatistics] = useState({
    pending: { count: 0, total_amount: 0 },
    approved: { count: 0, total_amount: 0 },
    rejected: { count: 0, total_amount: 0 }
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [assessmentData, setAssessmentData] = useState(null); // NEW: For assessment data
  const [businessPermitData, setBusinessPermitData] = useState(null); // NEW: For business permit details

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (tab) => {
    setSelectedTab(tab);
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/userinfo`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        await fetchUserData();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate('/');
    }
  };

  // NEW: Fetch assessment data
  const fetchAssessmentData = async (receiptId, userId) => {
    try {
      // You'll need to adjust this endpoint based on your API
          const response = await axios.get(`${API_BASE_URL}/api/payments/get-assessment`, {
        params: { receipt_id: receiptId, user_id: userId },
        withCredentials: true
      });

      if (response.data.success) {
        setAssessmentData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    }
  };

  // NEW: Fetch business permit application details
  const fetchBusinessPermitData = async (userId) => {
    try {
      // You'll need to adjust this endpoint based on your API
        const response = await axios.get(`${API_BASE_URL}/api/payments/business-permit/${userId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setBusinessPermitData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching business permit data:", error);
    }
  };

  const fetchPaymentReceipts = async (status = selectedTab, page = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/payment-receipts`, {
        params: { 
          status: status === 'all' ? 'all' : status,
          page: page,
          limit: 10 
        },
        withCredentials: true
      });

      if (response.data.success) {
        setPaymentReceipts(response.data.data.receipts);
        setCurrentPage(response.data.data.pagination.currentPage);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching payment receipts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment-statistics`, {
        withCredentials: true
      });

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

const handleApproveReject = async () => {
  if (!selectedReceipt) return;

  try {
    setIsLoading(true);
    const endpoint = actionType === 'approve' ? 'approve' : 'reject';
    const response = await axios.put(
      `${API_BASE_URL}/api/payment-receipts/${selectedReceipt.receipt_id}/${endpoint}`,
      { admin_notes: adminNotes },
      { withCredentials: true }
    );

    if (response.data.success) {
      alert(`Payment ${actionType}d successfully!`);
      setShowModal(false);
      setShowConfirmModal(false); // Close confirmation modal
      setSelectedReceipt(null);
      setAssessmentData(null);
      setBusinessPermitData(null);
      setAdminNotes('');
      setActionType('');
      await fetchPaymentReceipts();
      await fetchStatistics();
    }
  } catch (error) {
    console.error(`Error ${actionType}ing payment:`, error);
    alert(`Failed to ${actionType} payment.`);
  } finally {
    setIsLoading(false);
  }
};
 const openModal = (receipt, action) => {
  setSelectedReceipt(receipt);
  setActionType(action);
  setAdminNotes('');
  setShowConfirmModal(true); // Show confirmation modal first
  
  // Fetch assessment and business permit data
  if (receipt.user_id) {
    fetchAssessmentData(receipt.receipt_id, receipt.user_id);
    fetchBusinessPermitData(receipt.user_id);
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      gcash: 'bg-blue-100 text-blue-800',
      maya: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return badges[method] || 'bg-gray-100 text-gray-800';
  };

  const filteredReceipts = paymentReceipts.filter(receipt =>
    receipt.user_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.user_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.permit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.application_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPaymentReceipts();
      fetchStatistics();
    }
  }, [selectedTab, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="m-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading payment receipts…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar 
        userData={userData} 
        onLogout={handleLogout} 
        isLoading={isLoading}
        onNavigate={handleNavigate}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (sticky) */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                  Payment Desk
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  Payment Verification
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Review and approve payment receipts from applicants
                </p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                  <div className="text-xs text-gray-500">Pending</div>
                  <div className="mt-1 text-2xl font-bold text-yellow-600">
                    {statistics.pending.count}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                  <div className="text-xs text-gray-500">Approved</div>
                  <div className="mt-1 text-2xl font-bold text-green-600">
                    {statistics.approved.count}
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
                  <div className="text-xs text-gray-500">Rejected</div>
                  <div className="mt-1 text-2xl font-bold text-red-600">
                    {statistics.rejected.count}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + Search (sticky under header) */}
          <div className="px-6 pb-5">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100">
                <nav className="flex flex-wrap gap-2 px-4 py-3">
                  {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 transition ${
                        selectedTab === tab
                          ? 'bg-blue-50 text-blue-700 ring-blue-100'
                          : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, permit type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-11 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                      type="button"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 pb-10 pt-6">
          {/* Payment Receipts List */}
          <div className="grid gap-4">
            {filteredReceipts.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No payment receipts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payment receipts found for the selected filter.
                </p>
              </div>
            ) : (
              filteredReceipts.map((receipt) => {
                const total = parseFloat(receipt.total_document_price || 0);
                const paid = parseFloat(receipt.payment_amount || 0);
                const remaining = Math.max(total - paid, 0);
                const percentage =
                  total > 0 ? Math.min((paid / total) * 100, 100) : 0;

                return (
                  <div
                    key={receipt.receipt_id}
                    className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition"
                  >
                    {/* Top row */}
                    <div className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Left: Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {receipt.user_first_name} {receipt.user_last_name}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                getStatusBadge(receipt.payment_status)
                              } ${
                                receipt.payment_status === 'pending'
                                  ? 'ring-yellow-200'
                                  : receipt.payment_status === 'approved'
                                  ? 'ring-green-200'
                                  : receipt.payment_status === 'rejected'
                                  ? 'ring-red-200'
                                  : 'ring-gray-200'
                              }`}
                            >
                              {receipt.payment_status}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                getPaymentMethodBadge(receipt.payment_method)
                              } ${
                                receipt.payment_method === 'gcash'
                                  ? 'ring-blue-200'
                                  : receipt.payment_method === 'maya'
                                  ? 'ring-purple-200'
                                  : 'ring-gray-200'
                              }`}
                            >
                              {receipt.payment_method}
                            </span>
                          </div>

                          {/* Details grid */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                              <p className="text-xs text-gray-500">Permit Type</p>
                              <p className="mt-1 font-semibold text-gray-900 truncate">
                                {receipt.permit_name}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                              <p className="text-xs text-gray-500">Amount Paid</p>
                              <p className="mt-1 font-semibold text-green-700">
                                {formatCurrency(paid)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {percentage >= 100
                                  ? 'Full payment (100%)'
                                  : `${percentage.toFixed(1)}% of total fee`}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                              <p className="text-xs text-gray-500">Total Fee</p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {formatCurrency(total)}
                              </p>
                              {remaining > 0 && (
                                <p className="mt-1 text-xs text-orange-600">
                                  Remaining: {formatCurrency(remaining)}
                                </p>
                              )}
                            </div>

                            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                              <p className="text-xs text-gray-500">Submitted</p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {formatDate(receipt.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-4">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="mt-1 font-medium text-gray-900 break-words">
                                {receipt.user_email}
                              </p>
                            </div>

                            {receipt.admin_notes && (
                              <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-4">
                                <p className="text-xs text-gray-500">Admin Notes</p>
                                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                                  {receipt.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Receipt image + actions */}
                        <div className="lg:ml-6 w-full lg:w-[280px] shrink-0">
                          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
                            {receipt.receipt_image ? (
                              <div className="space-y-3">
                                <button
                                  type="button"
                                  className="group block w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
                                  onClick={() =>
                                    window.open(
                                      `${API_BASE_URL}${receipt.receipt_image}`,
                                      '_blank'
                                    )
                                  }
                                >
                                  <img
                                    src={`${API_BASE_URL}${receipt.receipt_image}`}
                                    alt="Payment Receipt"
                                    className="h-52 w-full object-cover transition group-hover:opacity-90"
                                  />
                                </button>
                                <p className="text-xs text-gray-500 text-center">
                                  Click image to open in new tab
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-6 text-center text-sm text-gray-500">
                                No receipt image uploaded
                              </div>
                            )}

                            <div className="mt-4">
                              {receipt.payment_status === 'pending' && (
  <div className="flex flex-col gap-2">
    <button
      onClick={() => openModal(receipt, 'approve')}
      className="w-full rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100 transition"
    >
      Approve
    </button>
    <button
      onClick={() => openModal(receipt, 'reject')}
      className="w-full rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100 transition"
    >
      Reject
    </button>
  </div>
)}
                              {receipt.payment_status === 'approved' && (
                                <div className="text-center">
                                  <div className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                                    ✓ Approved
                                  </div>
                                  {receipt.approved_by_first_name && (
                                    <p className="mt-2 text-xs text-gray-500">
                                      By: {receipt.approved_by_first_name}{' '}
                                      {receipt.approved_by_last_name}
                                    </p>
                                  )}
                                </div>
                              )}

                              {receipt.payment_status === 'rejected' && (
                                <div className="text-center">
                                  <div className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                                    ✗ Rejected
                                  </div>
                                  {receipt.approved_by_first_name && (
                                    <p className="mt-2 text-xs text-gray-500">
                                      By: {receipt.approved_by_first_name}{' '}
                                      {receipt.approved_by_last_name}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle bottom accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-b-2xl" />
                  </div>
                );
              })
            )}
          </div>
{showConfirmModal && selectedReceipt && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      {/* Modal Header */}
      <div
        className={`px-6 py-4 ${
          actionType === 'approve'
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
            : 'bg-gradient-to-r from-rose-600 to-rose-700'
        } text-white`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">
              Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
            </h3>
            <p className="text-xs text-white/80">
              Are you sure you want to {actionType} this payment?
            </p>
          </div>

          <button
            onClick={() => setShowConfirmModal(false)}
            className="rounded-full bg-white/15 p-2 hover:bg-white/25 transition"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-4">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            {actionType === 'approve' ? (
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          
          <p className="font-medium text-gray-900">
            {actionType === 'approve' ? 'Approve payment for' : 'Reject payment for'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">{selectedReceipt.user_first_name} {selectedReceipt.user_last_name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Permit: {selectedReceipt.permit_name}
          </p>
          <p className="text-sm font-semibold text-green-700 mt-2">
            Amount: {formatCurrency(selectedReceipt.payment_amount)}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-amber-800">
                {actionType === 'approve' 
                  ? 'Once approved, the applicant will gain access to the application form.'
                  : 'Rejected payments cannot be undone. Please provide a reason in the next step.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 transition"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              setShowConfirmModal(false);
              setShowModal(true); // Show the main modal with notes
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold text-white ring-1 transition ${
              actionType === 'approve'
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-500/30'
                : 'bg-rose-600 hover:bg-rose-700 ring-rose-500/30'
            }`}
            type="button"
          >
            Yes, Continue
          </button>
        </div>
      </div>
    </div>
  </div>
)}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-2">
                <nav className="inline-flex items-center gap-2">
                  <button
                    onClick={() => fetchPaymentReceipts(selectedTab, currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex flex-wrap items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => fetchPaymentReceipts(selectedTab, index + 1)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 transition ${
                          currentPage === index + 1
                            ? 'bg-blue-50 ring-blue-100 text-blue-700'
                            : 'bg-white ring-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchPaymentReceipts(selectedTab, currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
        
      </div>

      {/* Modal for Approve/Reject - UPDATED WITH ASSESSMENT AND BUSINESS PERMIT INFO */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div
              className={`px-6 py-4 sticky top-0 z-10 ${
                actionType === 'approve'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700'
              } text-white`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                  </h3>
                  <p className="text-xs text-white/80">
                    Confirm the receipt details before submitting.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full bg-white/15 p-2 hover:bg-white/25 transition"
                  type="button"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - UPDATED LAYOUT */}
            <div className="p-6 space-y-6">
              {/* Business Permit Information Section */}
              {businessPermitData && (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
                    <h4 className="font-semibold text-blue-800">Business Permit Application Details</h4>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Business Name</p>
                        <p className="font-medium text-gray-900">{businessPermitData.business_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Trade Name</p>
                        <p className="font-medium text-gray-900">{businessPermitData.trade_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Application Type</p>
                        <p className="font-medium text-gray-900">{businessPermitData.application_type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Business Address</p>
                        <p className="font-medium text-gray-900">{businessPermitData.business_address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">TIN Number</p>
                        <p className="font-medium text-gray-900">{businessPermitData.tin_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registration Number</p>
                        <p className="font-medium text-gray-900">{businessPermitData.registration_number || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Fee Section */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-100">
                  
                </div>
                <div className="p-6">
                  {assessmentData ? (
                    <div className="space-y-4">
                      {/* Assessment Fee Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-gray-700">Description</th>
                              <th className="px-4 py-2 text-right text-gray-700">Amount</th>
                              <th className="px-4 py-2 text-right text-gray-700">Penalty/Surcharge</th>
                              <th className="px-4 py-2 text-right text-gray-700">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {/* Render assessment items here */}
                            {assessmentData.feeItems && assessmentData.feeItems.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-gray-800">{item.description}</td>
                                <td className="px-4 py-2 text-right text-gray-800">{formatCurrency(item.amount)}</td>
                                <td className="px-4 py-2 text-right text-gray-800">{formatCurrency(item.penalty)}</td>
                                <td className="px-4 py-2 text-right font-medium text-gray-900">
                                  {formatCurrency(item.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                                Total LGU Fees:
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-blue-700">
                                {formatCurrency(assessmentData.total_lgu_fees || 0)}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                                Fire Safety Inspection Fee (15%):
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-blue-700">
                                {formatCurrency(assessmentData.fire_safety_fee || 0)}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">
                                Grand Total Amount Due:
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">
                                {formatCurrency(assessmentData.grand_total || 0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Assessment created: {assessmentData.created_at || 'N/A'}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          assessmentData.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Status: {assessmentData.status || 'pending'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No assessment data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800">Payment Details</h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                      <p className="text-xs text-gray-500">Applicant</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedReceipt.user_first_name} {selectedReceipt.user_last_name}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                      <p className="text-xs text-gray-500">Permit</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedReceipt.permit_name}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                      <p className="text-xs text-gray-500">Amount Paid</p>
                      <p className="mt-1 font-semibold text-green-700">
                        {formatCurrency(selectedReceipt.payment_amount)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedReceipt.payment_method}
                      </p>
                    </div>
                  </div>

                  {/* Receipt Image */}
                  {selectedReceipt.receipt_image && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Payment Receipt</p>
                      <div className="rounded-2xl border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          className="block w-full"
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}${selectedReceipt.receipt_image}`,
                              '_blank'
                            )
                          }
                        >
                          <img
                            src={`${API_BASE_URL}${selectedReceipt.receipt_image}`}
                            alt="Payment Receipt"
                            className="w-full h-56 object-contain bg-gray-50"
                          />
                        </button>
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
                          <p className="text-xs text-gray-500">Click image to open in new tab</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800">Admin Action</h4>
                </div>
                <div className="p-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Reason for Rejection (Required)'}
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder={
                        actionType === 'approve' 
                          ? 'Optional notes about the approval...' 
                          : 'Please provide a reason for rejecting this payment...'
                      }
                    />
                    {actionType === 'reject' && (
                      <p className="mt-2 text-xs text-gray-500">
                        Note: Rejection requires a short reason.
                      </p>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-2 pt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"
                      type="button"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleApproveReject}
                      disabled={actionType === 'reject' && !adminNotes.trim()}
                      className={`rounded-full px-4 py-2 text-xs font-semibold text-white ring-1 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        actionType === 'approve'
                          ? 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-500/30'
                          : 'bg-rose-600 hover:bg-rose-700 ring-rose-500/30'
                      }`}
                      type="button"
                    >
                      {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PaymentVerification;