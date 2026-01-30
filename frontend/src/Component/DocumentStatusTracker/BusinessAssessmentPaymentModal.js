import React, { useState, useRef, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  X,
  Upload,
  Check,
  Loader,
  Smartphone,
  QrCode,
  ArrowLeft,
  Info,
  Building,
  CircleCheck,
  Clock
} from 'lucide-react';

const BusinessAssessmentPaymentModal = ({
  isOpen,
  onClose,
  assessment,
  businessPermitId,
  onPaymentSuccess
}) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [existingPayment, setExistingPayment] = useState(null);
  const [showExistingPaymentModal, setShowExistingPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const fileInputRef = useRef(null);

  const grandTotal = assessment?.fees?.grand_total || 0;

  const checkExistingPayment = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/user/assessment/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          business_id: businessPermitId
        })
      });

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error checking existing payment:', err);
      return { success: false, hasPayment: false };
    }
  };

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (isOpen && businessPermitId) {
        const result = await checkExistingPayment();
        
        if (result.success && result.hasPayment) {
          setExistingPayment(result);
          setShowExistingPaymentModal(true);
        } else {
          setExistingPayment(null);
          setShowExistingPaymentModal(false);
        }
      }
    };

    verifyPaymentStatus();
  }, [isOpen, businessPermitId]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPaymentMethod('');
      setReceiptFile(null);
      setAcceptedTerms(false);
      setError('');
      setSuccess('');
      setExistingPayment(null);
      setShowExistingPaymentModal(false);
      setShowSuccessModal(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Maximum size is 5MB');
        return;
      }

      setReceiptFile(file);
      setError('');
    }
  };

  const handlePaymentMethodSelect = (method) => {
    if (existingPayment?.hasPayment) {
      setShowExistingPaymentModal(true);
      return;
    }
    
    setPaymentMethod(method);
    setStep(3);
  };

  const handleShowQRCode = () => {
    setShowQRModal(true);
  };

  const handleShowApp = () => {
    setShowAppModal(true);
  };
const checkCanMakePayment = async () => {
  try {
    const response = await fetch(`http://localhost:8081/api/user/assessment/can-make-payment?business_id=${businessPermitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Error checking if can make payment:', err);
    return { 
      success: false, 
      canMakePayment: true, // Default to allowing payment
      reason: 'Unable to check payment status'
    };
  }
};
// Update the useEffect that checks for existing payments:
useEffect(() => {
  const verifyPaymentStatus = async () => {
    if (isOpen && businessPermitId) {
      // Check if user can make payment based on existing payments only
      const result = await checkCanMakePayment();
      
      if (result.success && !result.canMakePayment) {
        // User cannot make payment
        if (result.reason === "A payment is already pending review") {
          setExistingPayment({
            hasPayment: true,
            paymentStatus: 'pending',
            source: 'payment_receipts',
            message: result.reason
          });
          setShowExistingPaymentModal(true);
        } else if (result.reason === "Payment has already been approved") {
          setExistingPayment({
            hasPayment: true,
            paymentStatus: 'approved',
            source: 'payment_receipts',
            message: result.reason
          });
          setShowExistingPaymentModal(true);
        }
      } else {
        // User can make payment or check failed
        setExistingPayment(null);
        setShowExistingPaymentModal(false);
      }
    }
  };

  if (isOpen) {
    verifyPaymentStatus();
  }
}, [isOpen, businessPermitId]);
const handleSubmitPayment = async () => {
  // Check if user can make payment
  const canPayResult = await checkCanMakePayment();
  
  if (canPayResult.success && !canPayResult.canMakePayment) {
    setError(canPayResult.reason);
    
    if (canPayResult.reason === "A payment is already pending review") {
      setExistingPayment({
        hasPayment: true,
        paymentStatus: 'pending',
        source: 'payment_receipts',
        message: canPayResult.reason
      });
      setShowExistingPaymentModal(true);
    }
    return;
  }

  if (!receiptFile) {
    setError('Please upload your payment receipt');
    return;
  }

  if (!acceptedTerms) {
    setError('Please accept the terms and conditions');
    return;
  }

  setIsSubmitting(true);
  setIsUploading(true);
  setError('');

  try {
    // Step 1: Upload receipt image
    const formData = new FormData();
    formData.append('receipt_image', receiptFile);

    const uploadResponse = await fetch('http://localhost:8081/api/user/assessment/upload-receipt', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success) {
      throw new Error(uploadResult.message || 'Failed to upload receipt');
    }

    // Step 2: Create payment record
    setIsUploading(false);
    
    const paymentResponse = await fetch('http://localhost:8081/api/user/assessment/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        business_id: businessPermitId,
        payment_method: paymentMethod,
        receipt_image: uploadResult.file_path
      })
    });

    const paymentResult = await paymentResponse.json();

    if (!paymentResult.success) {
      if (paymentResult.message && paymentResult.message.includes('already')) {
        // Payment already exists
        setError(paymentResult.message);
        
        if (paymentResult.message.includes('pending')) {
          setExistingPayment({
            hasPayment: true,
            paymentStatus: 'pending',
            source: 'payment_receipts',
            message: paymentResult.message
          });
        } else if (paymentResult.message.includes('approved')) {
          setExistingPayment({
            hasPayment: true,
            paymentStatus: 'approved',
            source: 'payment_receipts',
            message: paymentResult.message
          });
        }
        setShowExistingPaymentModal(true);
      } else {
        throw new Error(paymentResult.message || 'Failed to submit payment');
      }
      
      setIsSubmitting(false);
      setIsUploading(false);
      return;
    }

    // Success! Payment submitted
    const refNumber = `BP-${businessPermitId}-${Date.now().toString().slice(-6)}`;
    setPaymentReference(refNumber);
    setShowSuccessModal(true);
    setSuccess('Payment submitted successfully!');

    // Call success callback if provided
    if (onPaymentSuccess) {
      onPaymentSuccess({
        ...paymentResult,
        reference_number: refNumber
      });
    }

  } catch (err) {
    console.error('Payment submission error:', err);
    setError(err.message || 'Failed to submit payment. Please try again.');
  } finally {
    setIsSubmitting(false);
    setIsUploading(false);
  }
};
  const handleClose = () => {
    if (step === 4 || existingPayment?.hasPayment || showSuccessModal) {
      window.location.reload();
    }
    onClose();
  };

const handleProceedAnyway = () => {
  setShowExistingPaymentModal(false);
  setExistingPayment(null);
  setError('');
  // Allow user to continue to payment steps
  if (step === 1) {
    setStep(2); // Go to payment method selection
  }
};
  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setStep(1)}
            className="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Select Payment Method</h2>
        </div>
        <p className="text-gray-600">
          Total Amount: <span className="font-bold text-green-600">
            ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button
            onClick={() => handlePaymentMethodSelect('gcash')}
            className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group cursor-pointer"
            type="button"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">GCash</h3>
                <p className="text-sm text-gray-600">Pay via GCash app or QR code</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handlePaymentMethodSelect('maya')}
            className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group cursor-pointer"
            type="button"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">Maya</h3>
                <p className="text-sm text-gray-600">Pay via Maya app or QR code</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handlePaymentMethodSelect('municipal')}
            className="p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left group cursor-pointer"
            type="button"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-green-600">Pay at Municipal Office</h3>
                <p className="text-sm text-gray-600">Walk-in payment at Treasurer's Office</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              After payment, upload the receipt/screenshot to complete your application.
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <button
            onClick={() => setStep(2)}
            className="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Upload Receipt</h2>
            <p className="text-sm text-gray-600">
              Payment Method: <span className="font-semibold capitalize">
                {paymentMethod === 'municipal' ? 'Municipal Office' : paymentMethod}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {paymentMethod === 'municipal' ? (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start mb-3">
                <Building className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Municipal Office Payment Instructions</h3>
                  <p className="text-sm text-green-700">
                    Please proceed to the Municipal Treasurer's Office to make your payment.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="h-5 w-5 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    1
                  </div>
                  <span className="text-green-700">Go to Municipal Treasurer's Office</span>
                </div>
                <div className="flex items-start">
                  <div className="h-5 w-5 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    2
                  </div>
                  <span className="text-green-700">Present your assessment details</span>
                </div>
                <div className="flex items-start">
                  <div className="h-5 w-5 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    3
                  </div>
                  <span className="text-green-700">Pay the amount: <strong className="text-green-800">₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                </div>
                <div className="flex items-start">
                  <div className="h-5 w-5 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    4
                  </div>
                  <span className="text-green-700">Get the official receipt from the cashier</span>
                </div>
                <div className="flex items-start">
                  <div className="h-5 w-5 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    5
                  </div>
                  <span className="text-green-700">Take a clear photo or scan of the receipt</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  <strong>Office Hours:</strong> Monday to Friday, 8:00 AM to 5:00 PM<br />
                  <strong>Location:</strong> Municipal Hall, Ground Floor, Treasurer's Office
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex justify-center gap-3 mb-6">
              <button
                onClick={handleShowQRCode}
                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors cursor-pointer"
                type="button"
              >
                <QrCode className="h-4 w-4" />
                Show QR Code
              </button>
              <button
                onClick={handleShowApp}
                className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2 transition-colors cursor-pointer"
                type="button"
              >
                <Smartphone className="h-4 w-4" />
                Go to {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} App
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {paymentMethod === 'municipal' 
              ? 'Upload Official Receipt from Municipal Office' 
              : 'Upload Payment Receipt/Screenshot'}
          </label>
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            {receiptFile ? (
              <div className="flex flex-col items-center">
                <Check className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">{receiptFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(receiptFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptFile(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                  type="button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {paymentMethod === 'municipal'
                    ? 'Click to upload official receipt photo/scan'
                    : 'Click to upload payment receipt screenshot'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="mb-6 p-3 border border-gray-200 rounded bg-gray-50">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 mt-1 flex-shrink-0"
            />
            <span className="text-sm text-gray-700">
              I understand and agree to pay the assessed fees as part of the application process. 
              This payment is required before final processing and is non-refundable.
            </span>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            type="button"
          >
            Back
          </button>
          <button
            onClick={handleSubmitPayment}
            disabled={!receiptFile || !acceptedTerms || isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Payment Required
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">Assessment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total LGU Fees:</span>
              <span className="font-medium">₱{assessment?.fees?.total_fees_lgu?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fire Safety Inspection Fee:</span>
              <span className="font-medium">₱{assessment?.fees?.fsif_15?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="font-bold text-gray-800">Total Amount Due:</span>
              <span className="font-bold text-lg text-green-600">
                ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-6">
          To proceed with your Business Permit application, you need to pay the assessed fees of{' '}
          <span className="font-bold text-green-600">₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>.
        </p>

        <div className="mb-6 p-3 border border-gray-200 rounded bg-gray-50">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 mt-1 flex-shrink-0"
            />
            <span className="text-sm text-gray-700">
              I understand and agree to pay the assessed fees as part of the application process. 
              This payment is required before final processing and is non-refundable.
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (acceptedTerms) {
                if (existingPayment?.hasPayment) {
                  setShowExistingPaymentModal(true);
                } else {
                  setStep(2);
                }
              }
            }}
            disabled={!acceptedTerms}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted!</h2>
          <p className="text-gray-600">
            Your payment of <span className="font-bold text-green-600">₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> has been submitted for review.
          </p>
          {paymentMethod === 'municipal' && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                Thank you for paying at the Municipal Office. Your receipt will be verified by our staff.
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Our staff will review your payment within 24-48 hours</li>
            <li>• You'll receive a notification once payment is approved</li>
            <li>• After approval, you can complete the application form</li>
            <li>• Check your application status regularly</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Reference Number:</strong> BP-{businessPermitId}-{Date.now().toString().slice(-6)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Save this reference number for future inquiries
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderExistingPaymentModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`h-16 w-16 ${existingPayment?.paymentStatus === 'approved' ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {existingPayment?.paymentStatus === 'approved' ? (
                <Check className="h-8 w-8 text-green-600" />
              ) : (
                <Info className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Payment Already {existingPayment?.paymentStatus === 'approved' ? 'Approved' : 'Submitted'}
            </h2>
            
            <div className={`mb-4 p-4 rounded-lg ${existingPayment?.paymentStatus === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${existingPayment?.paymentStatus === 'approved' ? 'text-green-700' : 'text-yellow-700'}`}>
                {existingPayment?.paymentStatus === 'approved' 
                  ? 'Your payment has been approved. You cannot submit another payment for this assessment.'
                  : 'Your payment is already pending review. Please wait for our staff to verify your payment before submitting another one.'}
              </p>
            </div>

            {existingPayment?.paymentStatus === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Current Status:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Payment submitted and pending review</li>
                  <li>• Usually reviewed within 24-48 hours</li>
                  <li>• You'll be notified when approved</li>
                  <li>• Check your application tracker for updates</li>
                </ul>
              </div>
            )}

            {existingPayment?.paymentStatus === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Payment Approved!</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your payment has been verified</li>
                  <li>• You can now proceed with your application</li>
                  <li>• Check your email for confirmation</li>
                  <li>• Visit the application form to continue</li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              type="button"
            >
              Close
            </button>
            {existingPayment?.paymentStatus === 'pending' && (
              <button
                onClick={handleProceedAnyway}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
              >
                Try Anyway
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Loading Modal */}
      {(isSubmitting || isUploading) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 border-4 border-blue-100 rounded-full mx-auto"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-24 w-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <Loader className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {isUploading ? 'Uploading Receipt...' : 'Processing Payment...'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {isUploading 
                  ? 'Please wait while we upload your receipt image...'
                  : 'Please wait while we process your payment submission...'
                }
              </p>

              <div className="mb-6">
                <div className="flex items-center justify-center gap-8 mb-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                      isUploading ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-600'
                    }`}>
                      {isUploading ? <Upload className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs ${isUploading ? 'text-blue-600 font-medium' : 'text-green-600'}`}>
                      Uploading
                    </span>
                  </div>
                  
                  <div className="w-12 h-0.5 bg-gray-200"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                      isUploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white'
                    }`}>
                      {isUploading ? <Clock className="h-5 w-5" /> : <Loader className="h-5 w-5 animate-spin" />}
                    </div>
                    <span className={`text-xs ${isUploading ? 'text-gray-400' : 'text-blue-600 font-medium'}`}>
                      Processing
                    </span>
                  </div>
                  
                  <div className="w-12 h-0.5 bg-gray-200"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
                      <CircleCheck className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-400">Complete</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Please don't close this window or refresh the page while processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-fadeIn">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <div className="h-16 w-16 bg-green-200 rounded-full flex items-center justify-center animate-ping">
                    <CircleCheck className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div className="absolute top-0 left-1/4 h-3 w-3 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute top-0 right-1/4 h-3 w-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute top-4 left-0 h-3 w-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute top-4 right-0 h-3 w-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted Successfully!</h3>
              
              <p className="text-gray-600 mb-6">
                Your payment of <span className="font-bold text-green-600">
                  ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span> has been submitted for review.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800">Payment Reference Number</h4>
                </div>
                <p className="text-lg font-mono font-bold text-green-700 bg-green-100 py-2 px-4 rounded border border-green-300">
                  {paymentReference || `BP-${businessPermitId}-${Date.now().toString().slice(-6)}`}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Save this number for future inquiries
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start mb-3">
                  <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">What Happens Next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li className="flex items-start">
                        <div className="h-2 w-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        <span>Our staff will review your payment within 24-48 hours</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        <span>You'll receive a notification once payment is approved</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        <span>After approval, you can complete the application form</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] font-medium shadow-lg"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  Done - View Application Status
                </div>
              </button>

              <p className="text-xs text-gray-500 mt-4">
                This window will close automatically in a few seconds...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Payment Modal */}
      {showExistingPaymentModal && !isSubmitting && !isUploading && !showSuccessModal && renderExistingPaymentModal()}
      
      {/* Normal Steps */}
      {!showExistingPaymentModal && !isSubmitting && !isUploading && !showSuccessModal && (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </>
      )}

      {/* QR Code Modal */}
      {showQRModal && !showExistingPaymentModal && !isSubmitting && !isUploading && !showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} QR Code
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <img
                src="/img/QR.png"
                alt={`${paymentMethod} QR Code`}
                className="w-64 h-64 mx-auto object-contain border border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Scan this QR code with your {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} app
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Important:</strong> Take a screenshot of your payment confirmation
                and upload it as your receipt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* App Modal */}
      {showAppModal && !showExistingPaymentModal && !isSubmitting && !isUploading && !showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Open {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} App
              </h3>
              <button
                onClick={() => setShowAppModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <Smartphone className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">
                Open your {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} app and make a payment of:
              </p>
              <div className="text-2xl font-bold text-green-600 mb-4">
                ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-600">
                To: Municipal Business Permit Office
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> After completing the payment, take a screenshot
                of the confirmation and upload it as your receipt.
              </p>
            </div>
            <button
              onClick={() => setShowAppModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              type="button"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAssessmentPaymentModal;