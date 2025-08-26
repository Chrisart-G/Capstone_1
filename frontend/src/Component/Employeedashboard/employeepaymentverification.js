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
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

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
        setSelectedReceipt(null);
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
    setShowModal(true);
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        userData={userData} 
        onLogout={handleLogout} 
        isLoading={isLoading}
        onNavigate={handleNavigate}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
              <p className="text-sm text-gray-600">Review and approve payment receipts from applicants</p>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.pending.count}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.approved.count}</div>
                <div className="text-xs text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.rejected.count}</div>
                <div className="text-xs text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Tabs and Search */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      selectedTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, permit type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts Grid */}
          <div className="grid gap-6">
            {filteredReceipts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payment receipts</h3>
                <p className="mt-1 text-sm text-gray-500">No payment receipts found for the selected filter.</p>
              </div>
            ) : (
              filteredReceipts.map((receipt) => (
                <div key={receipt.receipt_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {receipt.user_first_name} {receipt.user_last_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(receipt.payment_status)}`}>
                          {receipt.payment_status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadge(receipt.payment_method)}`}>
                          {receipt.payment_method}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Permit Type</p>
                          <p className="font-medium">{receipt.permit_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount Paid</p>
                          <p className="font-medium text-green-600">{formatCurrency(receipt.payment_amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Fee</p>
                          <p className="font-medium">{formatCurrency(receipt.total_document_price)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{receipt.user_email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Submitted</p>
                          <p className="font-medium">{formatDate(receipt.created_at)}</p>
                        </div>
                      </div>

                      {receipt.admin_notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Admin Notes</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{receipt.admin_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      {receipt.receipt_image && (
                        <div className="mb-4">
                          <img
                            src={`${API_BASE_URL}${receipt.receipt_image}`}
                            alt="Payment Receipt"
                            className="w-32 h-40 object-cover rounded border cursor-pointer hover:opacity-75"
                            onClick={() => window.open(`${API_BASE_URL}${receipt.receipt_image}`, '_blank')}
                          />
                        </div>
                      )}
                      
                      {receipt.payment_status === 'pending' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => openModal(receipt, 'approve')}
                            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openModal(receipt, 'reject')}
                            className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {receipt.payment_status === 'approved' && (
                        <div className="text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ Approved
                          </div>
                          {receipt.approved_by_first_name && (
                            <p className="text-xs text-gray-500 mt-2">
                              By: {receipt.approved_by_first_name} {receipt.approved_by_last_name}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {receipt.payment_status === 'rejected' && (
                        <div className="text-center">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            ✗ Rejected
                          </div>
                          {receipt.approved_by_first_name && (
                            <p className="text-xs text-gray-500 mt-2">
                              By: {receipt.approved_by_first_name} {receipt.approved_by_last_name}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => fetchPaymentReceipts(selectedTab, currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => fetchPaymentReceipts(selectedTab, index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => fetchPaymentReceipts(selectedTab, currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Approve/Reject */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Applicant: <span className="font-medium">{selectedReceipt.user_first_name} {selectedReceipt.user_last_name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Permit: <span className="font-medium">{selectedReceipt.permit_name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Amount: <span className="font-medium text-green-600">{formatCurrency(selectedReceipt.payment_amount)}</span>
              </p>

              {selectedReceipt.receipt_image && (
                <div className="mb-4">
                  <img
                    src={`${API_BASE_URL}${selectedReceipt.receipt_image}`}
                    alt="Payment Receipt"
                    className="w-full h-48 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Reason for Rejection (Required)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  actionType === 'approve' 
                    ? 'Optional notes about the approval...' 
                    : 'Please provide a reason for rejecting this payment...'
                }
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveReject}
                disabled={actionType === 'reject' && !adminNotes.trim()}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;