import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  LogOut,
  KeyRound,
  Phone,
  Loader2, // spinner icon
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// API base URL constant
const API_BASE_URL = "http://localhost:8081";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ----- Forgot Password state -----
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1=request, 2=verify, 3=reset
  const [fpIdentifier, setFpIdentifier] = useState(""); // email or phone
  const [fpUserId, setFpUserId] = useState(null);
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpNewPass2, setFpNewPass2] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
          withCredentials: true,
        });
        if (response.data.loggedIn) {
          setIsLoggedIn(true);
          const role = response.data.user.role;
          if (role === "admin") navigate("/AdminDash");
          else if (role === "employee") navigate("/EmployeeDash");
          else navigate("/Chome");
        }
      } catch (e) {
        console.error("Session check error:", e);
        setError("Failed to check login status. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (!forgotOpen || cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [forgotOpen, cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      setIsLoggedIn(true);
      const role = res.data.user.role;
      if (role === "admin") navigate("/AdminDash");
      else if (role === "employee") navigate("/EmployDash");
      else navigate("/Chome");
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(
            `Error: ${err.response.data.message || "Something went wrong"}`
          );
        }
      } else {
        setError("Failed to connect to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      navigate("/");
    } catch (e) {
      console.error("Logout error:", e);
      setError("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ====== Forgot Password handlers ======
  const fpRequest = async () => {
    setFpMsg("");
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/forgot/request`,
        { identifier: fpIdentifier },
        { withCredentials: true }
      );
      await axios.post(
        `${API_BASE_URL}/api/auth/forgot/resend`,
        { userId: data.userId },
        { withCredentials: true }
      );

      setFpUserId(data.userId);
      setFpStep(2);
      setFpMsg("A verification code has been sent to your contact.");
      if (data.dev_otp) setFpOtp(data.dev_otp); // when SMS disabled
      setCooldown(30);
    } catch (err) {
      setFpMsg(
        err.response?.data?.message || "Unable to start password reset."
      );
    }
  };

  const fpResend = async () => {
    if (!fpUserId) return;
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/forgot/resend`,
        { userId: fpUserId },
        { withCredentials: true }
      );
      setFpMsg("A new code has been sent.");
      if (data.dev_otp) setFpOtp(data.dev_otp);
      setCooldown(30);
    } catch (err) {
      setFpMsg(err.response?.data?.message || "Resend failed.");
    }
  };

  const fpVerify = async () => {
    setFpMsg("");
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/forgot/verify`,
        { userId: fpUserId, code: fpOtp },
        { withCredentials: true }
      );
      setFpStep(3);
      setFpMsg("Code verified. You can now set a new password.");
    } catch (err) {
      setFpMsg(err.response?.data?.message || "Invalid or expired code.");
    }
  };

  const fpReset = async () => {
    setFpMsg("");
    if (fpNewPass !== fpNewPass2) {
      setFpMsg("Passwords do not match.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/forgot/reset`,
        { userId: fpUserId, newPassword: fpNewPass },
        { withCredentials: true }
      );
      setFpMsg("Password updated successfully. You can now log in.");
      setTimeout(() => {
        setForgotOpen(false);
        setFpStep(1);
        setFpIdentifier("");
        setFpOtp("");
        setFpNewPass("");
        setFpNewPass2("");
      }, 600);
    } catch (err) {
      setFpMsg(err.response?.data?.message || "Password reset failed.");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-0 md:px-0"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Full-screen card */}
      <div className="w-full h-screen grid md:grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-none md:rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - background + transparent logo */}
        <div className="relative hidden md:block">
          {/* Background image */}
          <img
            src=""
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-slate-900" />

          {/* Centered transparent logo + text */}
          <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-white">
            <img
              src="/img/logo.png"
              alt="Municipality of Hinigaran Seal"
              className="h-60 w-30 "
            />
            <div className="mt-4 text-center">
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-slate-200/90">
                Municipality of Hinigaran
              </p>
              <p className="text-[11px] md:text-xs text-slate-200/80 mt-1">
                Province of Negros Occidental, Philippines
              </p>
            </div>

            <p className="mt-6 max-w-sm text-[11px] md:text-xs text-slate-100/80 text-center leading-relaxed">
              Access the Online Municipal Document Processing System to manage
              permits, licenses, and official records in a secure and
              transparent way.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white px-6 py-8 md:px-8 md:py-10 flex flex-col justify-center max-h-screen overflow-y-auto">
          {/* Logo for mobile */}
          <div className="md:hidden flex flex-col items-center mb-4">
            <img
              src="/img/logo.png"
              alt="Municipality of Hinigaran Seal"
              className="h-20 w-20 opacity-80"
            />
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500 text-center">
              Municipality of Hinigaran
            </p>
          </div>

          <div className="mb-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase text-center md:text-left">
              Account Access
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 text-center md:text-left mt-1">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 mt-1 text-center md:text-left">
              Use your registered email and password to access municipal
              services.
            </p>
          </div>

          {error && (
            <div className="mt-4 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isLoggedIn ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-slate-700 flex items-center justify-between"
                >
                  <span>Email Address</span>
                  <span className="text-[11px] text-slate-400">
                    Example: user@municipality.gov
                  </span>
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-700 flex items-center justify-between"
                >
                  <span>Password</span>
                  <span className="text-[11px] text-slate-400">
                    Keep your password private.
                  </span>
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-100"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1`}
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setFpStep(1);
                    setFpMsg("");
                  }}
                  className="inline-flex items-center justify-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline mt-1 sm:mt-0"
                >
                  <KeyRound className="h-4 w-4 mr-1" />
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                You are currently logged in
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                If this is not you, please log out and sign in with the correct
                account.
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`w-full inline-flex justify-center items-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition ${
                  isLoading
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                } focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1`}
              >
                {isLoading ? (
                  "Logging out..."
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                )}
              </button>
            </div>
          )}

          {/* Sign up link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <a
              href="/sign-up"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create an account
            </a>
          </p>

          {/* Small footer */}
          <p className="mt-3 text-[10px] text-center text-slate-400">
            By signing in, you agree to comply with municipal policies and data
            privacy guidelines.
          </p>

          {/* Forgot Password Modal */}
          {forgotOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 flex items-center">
                      <KeyRound className="h-4 w-4 mr-2 text-blue-600" />
                      Reset Password
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Follow the steps below to securely recover your account.
                    </p>
                  </div>
                  <button
                    className="text-slate-400 hover:text-slate-600 text-lg"
                    onClick={() => setForgotOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                {fpMsg && (
                  <div className="mb-3 text-[11px] rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700">
                    {fpMsg}
                  </div>
                )}

                {fpStep === 1 && (
                  <>
                    <label className="text-xs font-medium text-slate-700">
                      Email or Mobile Number
                    </label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="email@example.com or +63xxxxxxxxxx"
                        value={fpIdentifier}
                        onChange={(e) => setFpIdentifier(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={fpRequest}
                      className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white shadow-md hover:shadow-lg transition"
                    >
                      Send verification code
                    </button>
                  </>
                )}

                {fpStep === 2 && (
                  <>
                    <label className="text-xs font-medium text-slate-700">
                      Enter the 6-digit code
                    </label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 text-center tracking-[0.4em] text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      maxLength={6}
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={fpVerify}
                        className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white shadow-md hover:shadow-lg transition"
                      >
                        Verify code
                      </button>
                      <button
                        onClick={fpResend}
                        disabled={cooldown > 0}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "Resend code"}
                      </button>
                    </div>
                  </>
                )}

                {fpStep === 3 && (
                  <>
                    <label className="text-xs font-medium text-slate-700">
                      New Password
                    </label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      type="password"
                      value={fpNewPass}
                      onChange={(e) => setFpNewPass(e.target.value)}
                    />
                    <label className="text-xs font-medium text-slate-700 mt-3 block">
                      Confirm Password
                    </label>
                    <input
                      className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      type="password"
                      value={fpNewPass2}
                      onChange={(e) => setFpNewPass2(e.target.value)}
                    />
                    <button
                      onClick={fpReset}
                      className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white shadow-md hover:shadow-lg transition"
                    >
                      Update password
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Spinner Modal (UI only) */}
      {isLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              Processing, please wait...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
