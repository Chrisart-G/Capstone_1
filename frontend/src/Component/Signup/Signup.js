import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  Mail,
  User,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

const API = "http://localhost:8081/api/auth";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpPhase, setOtpPhase] = useState(false); // false = details step, true = otp step
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [devOtp, setDevOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.load();
  }, []);

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
    setOtpCode("");
    setUserId(null);
    setDevOtp("");
    setOtpPhase(false);
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

  // Single form submit handler (handles both steps)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // STEP 1: create user + send OTP
    if (!otpPhase) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

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
          }),
        });
        const data = await resp.json();

        if (!resp.ok) {
          setError(data.message || "Signup failed");
          return;
        }

        // backend returns { userId, smsEnabled, ... }
        setUserId(data.userId);
        setOtpPhase(true); // move to OTP step (but keep form fields visible)
        setSuccess(
          "Almost done! We’ve created your account record and sent a verification code to your phone."
        );

        // auto-send OTP
        await handleSendOtp(data.userId);
      } catch (err) {
        console.error(err);
        setError("Network error. Please try again.");
      }
      return;
    }

    // STEP 2: verify OTP and finalize account
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
        setError(j.message || "Verification failed");
      } else {
        setError("");
        setSuccess("Account created successfully! You can now log in.");
        // optional: redirect after a timeout
        clearForm();
      }
    } catch (err) {
      console.error(err);
      setError("Verification error");
    } finally {
      setVerifying(false);
    }
  };

  // disable editing of account fields once we're in OTP phase
  const detailsDisabled = otpPhase;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl flex rounded-xl overflow-hidden shadow-xl">
        {/* left side video */}
        <div className="w-1/2 hidden md:flex md:items-center md:justify-center bg-gray-200 relative">
          <img
            src="/img/Logpic.png"
            alt="Fallback"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-10"
            autoPlay
            muted
            loop
            playsInline
            controls
          >
            <source src="/img/municipality2.mp4" type="video/mp4" />
            <source src="/videos/municipality2.mp4" type="video/mp4" />
            <source src="/municipality2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-20 z-20"></div>
        </div>

        {/* right side form */}
        <div className="w-full md:w-1/2 bg-white p-6 flex flex-col justify-center max-h-screen overflow-y-auto">
          <div className="flex justify-center mb-4">
            <img src="/img/logo.png" alt="Official Seal" className="h-20" />
          </div>

          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            {otpPhase ? "Verify your phone" : "Create Account"}
          </h2>

          {otpPhase && (
            <p className="text-gray-600 text-center mb-2 text-sm">
              We’ve sent a 6-digit code to your mobile number. Enter it below to
              finish creating your account.
            </p>
          )}

          {error && (
            <p className="text-red-500 text-center mb-3 text-sm">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-center mb-3 text-sm">
              {success}
            </p>
          )}

          {/* ONE form handling both steps */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* account details (always shown; disabled in OTP phase) */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={detailsDisabled}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    disabled={detailsDisabled}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    disabled={detailsDisabled}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Middle Name (Optional)
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={middlename}
                  onChange={(e) => setMiddlename(e.target.value)}
                  disabled={detailsDisabled}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Middle name (optional)"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={detailsDisabled}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative mt-1">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={detailsDisabled}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="+63XXXXXXXXXX"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use your active mobile number for OTP.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={detailsDisabled}
                  className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Create password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={detailsDisabled}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={detailsDisabled}
                  className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={detailsDisabled}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* OTP section – only active in otpPhase */}
            {otpPhase && (
              <div className="pt-3 border-t border-gray-200 mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center"
                  placeholder="‒ ‒ ‒ ‒ ‒ ‒"
                  required
                />
                {devOtp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Dev OTP: <span className="font-mono">{devOtp}</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-sm mt-2">
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={sending || resendCooldown > 0}
                    className="text-blue-600 hover:underline disabled:text-gray-400"
                  >
                    {sending
                      ? "Sending…"
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </button>
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Code valid for ~10
                    mins
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={verifying || sending}
                className="w-full flex justify-center items-center py-2 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {otpPhase
                  ? verifying
                    ? "Verifying…"
                    : "Verify & Create Account"
                  : "Create Account"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/Login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
