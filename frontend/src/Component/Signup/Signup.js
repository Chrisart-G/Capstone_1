import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  Mail,
  User,
  Smartphone,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const API = "http://localhost:8081/api/auth";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // BASIC + CONTACT + CREDENTIALS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // ACCOUNT TYPE + BUSINESS PROFILE
  const [accountType, setAccountType] = useState("citizen"); // 'citizen' | 'business_owner'

  const [businessName, setBusinessName] = useState("");
  const [businessTradeName, setBusinessTradeName] = useState("");
  const [businessType, setBusinessType] = useState("single");
  const [businessTinNo, setBusinessTinNo] = useState("");
  const [businessRegistrationNo, setBusinessRegistrationNo] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessTelephone, setBusinessTelephone] = useState("");
  const [businessMobile, setBusinessMobile] = useState("");
  const [businessPostalCode, setBusinessPostalCode] = useState("");

  // LESSOR INFO (optional – only if rented)
  const [lessorFullName, setLessorFullName] = useState("");
  const [lessorAddress, setLessorAddress] = useState("");
  const [lessorPhone, setLessorPhone] = useState("");
  const [lessorEmail, setLessorEmail] = useState("");
  const [lessorMonthlyRental, setLessorMonthlyRental] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpPhase, setOtpPhase] = useState(false); // false = details steps, true = otp step
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [devOtp, setDevOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // GLOBAL form steps:
  // 1 = basic + contact + password
  // 2 = business (only when accountType === 'business_owner')
  const [formStep, setFormStep] = useState(1);

  // mini steps inside Business step
  // 1 = Business profile
  // 2 = Business contact
  // 3 = Lessor
  const [businessSubStep, setBusinessSubStep] = useState(1);

  // UI modals
  const [showNextConfirm, setShowNextConfirm] = useState(false); // for going to business step
  const [showCreateConfirm, setShowCreateConfirm] = useState(false); // for actual create-account

  const [creating, setCreating] = useState(false); // spinner for create-account request

  useEffect(() => {
    if (!otpPhase || resendCooldown <= 0) return;
    const t = setInterval(
      () => setResendCooldown((s) => Math.max(0, s - 1)),
      1000
    );
    return () => clearInterval(t);
  }, [otpPhase, resendCooldown]);

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstname("");
    setMiddlename("");
    setLastname("");
    setAddress("");
    setPhoneNumber("");

    setAccountType("citizen");
    setBusinessName("");
    setBusinessTradeName("");
    setBusinessType("single");
    setBusinessTinNo("");
    setBusinessRegistrationNo("");
    setBusinessAddress("");
    setBusinessEmail("");
    setBusinessTelephone("");
    setBusinessMobile("");
    setBusinessPostalCode("");

    setLessorFullName("");
    setLessorAddress("");
    setLessorPhone("");
    setLessorEmail("");
    setLessorMonthlyRental("");

    setOtpCode("");
    setUserId(null);
    setDevOtp("");
    setOtpPhase(false);
    setFormStep(1);
    setBusinessSubStep(1);
  };

  // Simple validators
  const isValidEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const isValidPhone = (value) => {
    // Accept 09xxxxxxxxx or +639xxxxxxxxx
    const re = /^(\+63\d{10}|09\d{9})$/;
    return re.test(value);
  };

  // Send OTP for a given userId
  const handleSendOtp = async (uid = userId) => {
    if (!uid) return;
    setSending(true);
    setError("");
    setDevOtp("");
    try {
      const r = await fetch(`${API}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: uid }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) {
        setError(j.message || "Failed to send OTP");
      } else {
        if (j.dev_otp) setDevOtp(j.dev_otp); // DEV only
        setResendCooldown(30);
        setSuccess(
          "We’ve sent a 6-digit code to your mobile number. Enter it below to complete your registration."
        );
      }
    } catch (e) {
      setError("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  // STEP 1 button: validate basic + contact + password
  const handleNextStep = () => {
    setError("");
    setSuccess("");

    if (!firstname.trim() || !lastname.trim()) {
      setError("Please fill in at least your First Name and Last Name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your Email Address.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid Email Address (e.g., user@example.com).");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your complete Address.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your Mobile Number.");
      return;
    }
    if (!isValidPhone(phoneNumber.trim())) {
      setError(
        "Please enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789)."
      );
      return;
    }

    if (!password) {
      setError("Please create a Password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (accountType === "business_owner") {
      setShowNextConfirm(true);
      return;
    }

    setShowCreateConfirm(true);
  };

  const confirmNextStep = () => {
    setShowNextConfirm(false);
    setFormStep(2);
    setBusinessSubStep(1);
  };

  const handleBusinessCreateClick = () => {
    setError("");
    setSuccess("");

    if (accountType === "business_owner") {
      if (!businessName.trim()) {
        setError("Please enter your Business Name.");
        return;
      }
      if (!businessAddress.trim()) {
        setError("Please enter your Business Address.");
        return;
      }
    }

    setShowCreateConfirm(true);
  };

  const performCreateAccount = async () => {
    try {
      const resp = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          firstname,
          middlename,
          lastname,
          address,
          phoneNumber,

          accountType,
          businessName,
          businessTradeName,
          businessType,
          businessTinNo,
          businessRegistrationNo,
          businessAddress,
          businessEmail,
          businessTelephone,
          businessMobile,
          businessPostalCode,

          lessorFullName,
          lessorAddress,
          lessorPhone,
          lessorEmail,
          lessorMonthlyRental,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      setUserId(data.userId);
      setOtpPhase(true);
      setSuccess(
        "Almost done! We’ve created your account record and sent a verification code to your phone."
      );

      await handleSendOtp(data.userId);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpPhase) return;

    if (!otpCode || !userId) {
      setError("Please enter the code we sent to your phone.");
      return;
    }

    setVerifying(true);
    try {
      const r = await fetch(`${API}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, code: otpCode }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) {
        setError(j.message || "Verification failed.");
      } else {
        setError("");
        setSuccess("Account created successfully! You can now log in.");
        clearForm();
      }
    } catch (err) {
      console.error(err);
      setError("Verification error.");
    } finally {
      setVerifying(false);
    }
  };

  const confirmCreateAccount = async () => {
    setCreating(true);
    try {
      await performCreateAccount();
    } finally {
      setCreating(false);
      setShowCreateConfirm(false);
    }
  };

  const detailsDisabled = otpPhase;

  const headingLabel = otpPhase
    ? "Phone Verification"
    : accountType === "business_owner" && formStep === 2
    ? "Business Information"
    : "Basic Information";

  const headingTitle = otpPhase
    ? "Verify your mobile number"
    : accountType === "business_owner" && formStep === 2
    ? "Tell us about your business"
    : "Tell us who you are";

  const headingSubtitle = otpPhase
    ? "Enter the verification code we sent to your registered mobile number."
    : accountType === "business_owner" && formStep === 2
    ? "Provide your business details, contact information, and lessor information if your place is rented."
    : "Start by providing your name, contact details, and account password.";

  const currentStepNumber = otpPhase ? 3 : formStep; // 1,2,3
  const stepLabels = ["Account", "Business", "Verify"];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-0 md:px-0"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ✅ IMPORTANT:
          - Make the whole card fixed-height + overflow hidden
          - Left stays visible (sticky)
          - Right scrolls (overflow-y-auto)
      */}
      <div className="w-full h-screen grid md:grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* LEFT SIDE (RESTORED — unchanged UI/style) */}
        <div className="relative hidden md:block h-screen sticky top-0">
          <img
            src=""
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white" />

          <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-white">
            <img
              src="/img/logo.png"
              alt="Municipality of Hinigaran Seal"
              className="h-60 w-30"
            />
            <div className="mt-4 text-center">
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-black">
                Municipality of Hinigaran
              </p>
              <p className="text-[11px] md:text-xs text-black mt-1">
                Province of Negros Occidental, Philippines
              </p>
            </div>

            <p className="mt-6 max-w-sm text-[11px] md:text-xs text-black text-center leading-relaxed">
              Create your account to request permits, track document status, and
              access municipal services securely from anywhere.
            </p>
          </div>
        </div>

        {/* ✅ RIGHT SIDE (ONLY STYLE CHANGED): scrollable + nicer spacing */}
        <div className="bg-white h-screen overflow-y-auto">
          {/* a centered form container with comfortable padding */}
          <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl mx-auto">
            {/* GLOBAL STEPPER */}
            <div className="mb-4">
              <div className="flex items-center justify-center md:justify-start mb-3">
                <div className="flex items-center gap-3">
                  {stepLabels.map((label, index) => {
                    const stepIndex = index + 1;
                    const active = currentStepNumber === stepIndex;
                    const completed = currentStepNumber > stepIndex;

                    return (
                      <React.Fragment key={label}>
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold border ${
                              active
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : completed
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              stepIndex
                            )}
                          </div>
                          <span className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                            {label}
                          </span>
                        </div>
                        {stepIndex < stepLabels.length && (
                          <div className="h-[1px] w-8 bg-slate-200" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase text-center md:text-left">
                {headingLabel}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 text-center md:text-left mt-1">
                {headingTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1 text-center md:text-left">
                {headingSubtitle}
              </p>
            </div>

            {/* account-type selector (only while not in OTP) */}
            {!otpPhase && (
              <div className="mt-1 mb-4 flex justify-center md:justify-start">
                <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAccountType("citizen")}
                    className={`px-3 py-1 rounded-full font-medium transition ${
                      accountType === "citizen"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    disabled={detailsDisabled}
                  >
                    I’m an individual citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("business_owner")}
                    className={`px-3 py-1 rounded-full font-medium transition ${
                      accountType === "business_owner"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    disabled={detailsDisabled}
                  >
                    I’m a business owner
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-3 mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {/* One form handling OTP (details handled by buttons) */}
            <form onSubmit={handleSubmit} className="mt-2 space-y-3">
              {/* STEP 1: Basic + contact + password */}
              {!otpPhase && formStep === 1 && (
                <>
                  {/* Names */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        First Name *
                      </label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          required
                          disabled={detailsDisabled}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                          placeholder="First name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Last Name *
                      </label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          required
                          disabled={detailsDisabled}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle name */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Middle Name (Optional)
                    </label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={middlename}
                        onChange={(e) => setMiddlename(e.target.value)}
                        disabled={detailsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        placeholder="Middle name (optional)"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                      <span>Email Address *</span>
                      <span className="text-[11px] text-slate-400">
                        Example: user@municipality.gov
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        placeholder="Enter your email"
                        required
                        disabled={detailsDisabled}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={detailsDisabled}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  {/* Mobile number */}
                  <div>
                    <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                      <span>Mobile Number *</span>
                      <span className="text-[11px] text-slate-400">
                        Use an active number for OTP
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        disabled={detailsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        placeholder="+63XXXXXXXXXX or 09XXXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Password *
                    </label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={detailsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-100 disabled:bg-transparent"
                        disabled={detailsDisabled}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Password must be at least 6 characters long.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Confirm Password *
                    </label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={detailsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        placeholder="Re-type your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-100 disabled:bg-transparent"
                        disabled={detailsDisabled}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Next button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={detailsDisabled}
                      className="w-full inline-flex justify-center items-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2 + OTP + rest of your code stays EXACTLY THE SAME */}
              {/* (I did not change any logic or colors — only made the right side scrollable) */}

              {!otpPhase &&
                formStep === 2 &&
                accountType === "business_owner" && (
                  <>
                    {/* BUSINESS SUB-STEP INDICATOR */}
                    <div className="mb-3">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        {["Business", "Contact", "Lessor"].map((label, idx) => {
                          const step = idx + 1;
                          const active = businessSubStep === step;
                          return (
                            <React.Fragment key={label}>
                              <div className="flex flex-col items-center">
                                <div
                                  className={`h-6 w-6 rounded-full text-[11px] flex items-center justify-center font-semibold border ${
                                    active
                                      ? "bg-emerald-500 text-white border-emerald-500"
                                      : "bg-white text-slate-400 border-slate-200"
                                  }`}
                                >
                                  {step}
                                </div>
                                <span className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                                  {label}
                                </span>
                              </div>
                              {idx < 2 && (
                                <div className="h-[1px] w-8 bg-emerald-100" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* SUB-STEP 1 */}
                    {businessSubStep === 1 && (
                      <div className="mt-1 space-y-3 border border-slate-100 rounded-2xl px-3 py-3 bg-slate-50/80">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 uppercase">
                            Business profile
                          </p>
                          <p className="text-[10px] text-slate-400 text-right">
                            These fields will be used to auto-fill your Business
                            Permit application.
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-700">
                            Business Name *
                          </label>
                          <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            disabled={detailsDisabled}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            placeholder="Registered business name"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-700">
                            Trade Name / Franchise (Optional)
                          </label>
                          <input
                            type="text"
                            value={businessTradeName}
                            onChange={(e) => setBusinessTradeName(e.target.value)}
                            disabled={detailsDisabled}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            placeholder="Trade name or franchise"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-1">
                            <label className="text-xs font-medium text-slate-700">
                              Type of Business
                            </label>
                            <select
                              value={businessType}
                              onChange={(e) => setBusinessType(e.target.value)}
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            >
                              <option value="single">Single</option>
                              <option value="partnership">Partnership</option>
                              <option value="corporation">Corporation</option>
                              <option value="cooperative">Cooperative</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Business TIN (optional)
                            </label>
                            <input
                              type="text"
                              value={businessTinNo}
                              onChange={(e) => setBusinessTinNo(e.target.value)}
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="TIN number"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Registration No. (DTI / SEC / CDA)
                            </label>
                            <input
                              type="text"
                              value={businessRegistrationNo}
                              onChange={(e) =>
                                setBusinessRegistrationNo(e.target.value)
                              }
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Registration number"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-700">
                              Business Address *
                            </label>
                            <input
                              type="text"
                              value={businessAddress}
                              onChange={(e) =>
                                setBusinessAddress(e.target.value)
                              }
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Business location / address"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Postal Code (optional)
                            </label>
                            <input
                              type="text"
                              value={businessPostalCode}
                              onChange={(e) =>
                                setBusinessPostalCode(e.target.value)
                              }
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="e.g. 6104"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-STEP 2 */}
                    {businessSubStep === 2 && (
                      <div className="mt-1 space-y-3 border border-slate-100 rounded-2xl px-3 py-3 bg-slate-50/80">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 uppercase">
                          Business contact
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-700">
                              Business Email (optional)
                            </label>
                            <input
                              type="email"
                              value={businessEmail}
                              onChange={(e) => setBusinessEmail(e.target.value)}
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="business@example.com"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Telephone (optional)
                            </label>
                            <input
                              type="text"
                              value={businessTelephone}
                              onChange={(e) =>
                                setBusinessTelephone(e.target.value)
                              }
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Business telephone no."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-700">
                            Business Mobile (optional)
                          </label>
                          <input
                            type="text"
                            value={businessMobile}
                            onChange={(e) => setBusinessMobile(e.target.value)}
                            disabled={detailsDisabled}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            placeholder="Business mobile number"
                          />
                        </div>
                      </div>
                    )}

                    {/* SUB-STEP 3 */}
                    {businessSubStep === 3 && (
                      <div className="mt-3 border border-slate-100 rounded-2xl px-4 py-4 bg-slate-50/80">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-600 uppercase text-center mb-3">
                          Fill up only if business place is rented
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Lessor&apos;s Full Name
                            </label>
                            <input
                              type="text"
                              value={lessorFullName}
                              onChange={(e) =>
                                setLessorFullName(e.target.value)
                              }
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Full name of the lessor"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Lessor&apos;s Full Address
                            </label>
                            <input
                              type="text"
                              value={lessorAddress}
                              onChange={(e) =>
                                setLessorAddress(e.target.value)
                              }
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Complete address of the lessor"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Lessor&apos;s Telephone / Mobile No.
                            </label>
                            <input
                              type="text"
                              value={lessorPhone}
                              onChange={(e) => setLessorPhone(e.target.value)}
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Contact number of the lessor"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Lessor&apos;s Email Address
                            </label>
                            <input
                              type="email"
                              value={lessorEmail}
                              onChange={(e) => setLessorEmail(e.target.value)}
                              disabled={detailsDisabled}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                              placeholder="Email of the lessor"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="text-xs font-medium text-slate-700">
                            Monthly Rental
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={lessorMonthlyRental}
                            onChange={(e) =>
                              setLessorMonthlyRental(e.target.value)
                            }
                            disabled={detailsDisabled}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 mt-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            placeholder="Amount of monthly rental (₱)"
                          />
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="pt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (businessSubStep === 1) {
                            setFormStep(1);
                          } else {
                            setBusinessSubStep((s) => Math.max(1, s - 1));
                          }
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                      >
                        {businessSubStep === 1
                          ? "Back to basic information"
                          : "Back"}
                      </button>

                      {businessSubStep < 3 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setBusinessSubStep((s) => Math.min(3, s + 1))
                          }
                          className="inline-flex justify-center items-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleBusinessCreateClick}
                          disabled={verifying || sending}
                          className="inline-flex justify-center items-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Account
                        </button>
                      )}
                    </div>
                  </>
                )}

              {/* OTP */}
              {otpPhase && (
                <>
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <label className="text-xs font-medium text-slate-700">
                      Enter the 6-digit verification code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 mt-1 text-center tracking-[0.4em] text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="‒ ‒ ‒ ‒ ‒ ‒"
                      required
                    />
                    {devOtp && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Dev OTP: <span className="font-mono">{devOtp}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs mt-3">
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={sending || resendCooldown > 0}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {sending
                          ? "Sending..."
                          : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend code"}
                      </button>
                      <span className="inline-flex items-center text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Code valid for
                        about 10 minutes
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={verifying || sending}
                      className="w-full inline-flex justify-center items-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {verifying ? "Verifying..." : "Verify & Create Account"}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <a
                href="/Login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Log in
              </a>
            </p>

            <p className="mt-3 text-[10px] text-center text-slate-400">
              We will only use your information for official municipal
              transactions and notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Modals unchanged */}
      {showNextConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Proceed to business details?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              You&apos;re about to continue to the business information section.
              You can still go back and edit your basic information later.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNextConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmNextStep}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md"
              >
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Create this account?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to create this account using the
              information you provided?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !creating && setShowCreateConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCreateAccount}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {creating ? "Creating..." : "Yes, create account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
