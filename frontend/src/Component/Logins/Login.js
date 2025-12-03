import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, LogIn, Mail, Lock, LogOut, KeyRound, Phone } from "lucide-react";
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
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // ----- Forgot Password state -----
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1);           // 1=request, 2=verify, 3=reset
  const [fpIdentifier, setFpIdentifier] = useState(""); // email or phone
  const [fpUserId, setFpUserId] = useState(null);
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpNewPass2, setFpNewPass2] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (videoRef.current) videoRef.current.load();

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
          setError(`Error: ${err.response.data.message || "Something went wrong"}`);
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
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
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
      // kick off actual OTP send (server logs will show it)
      await axios.post(
        `${API_BASE_URL}/api/auth/forgot/resend`,
        { userId: data.userId },
        { withCredentials: true }
      );

      setFpUserId(data.userId);
      setFpStep(2);
      setFpMsg("Code sent via SMS (or dev_otp if SMS disabled).");
      if (data.dev_otp) setFpOtp(data.dev_otp); // when SMS disabled
      setCooldown(30);
    } catch (err) {
      setFpMsg(err.response?.data?.message || "Unable to start reset.");
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
      setFpMsg("Code re-sent.");
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
      setFpMsg("Verified. Set a new password.");
    } catch (err) {
      setFpMsg(err.response?.data?.message || "Invalid code.");
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
      setFpMsg("Password updated. You can now log in.");
      // cleanup + close
      setTimeout(() => {
        setForgotOpen(false);
        setFpStep(1);
        setFpIdentifier("");
        setFpOtp("");
        setFpNewPass("");
        setFpNewPass2("");
      }, 600);
    } catch (err) {
      setFpMsg(err.response?.data?.message || "Reset failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl flex rounded-xl overflow-hidden shadow-xl">
        {/* Left Side - Video */}
        <div className="w-1/2 hidden md:flex md:items-center md:justify-center bg-gray-200 relative">
          <img 
            src="/img/Logpic.png" 
            alt="Fallback " 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-10"
            autoPlay 
            muted 
            loop
            playsInline
          >
            <source src="/img/municipality2.mp4" type="video/mp4" />
            <source src="/videos/municipality2.mp4" type="video/mp4" />
            <source src="/municipality2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-20 z-20"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 bg-white p-6 flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <img src="/img/logo.png" alt="Official Seal" className="h-20" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
            Account Login
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {!isLoggedIn ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 mr-2 flex justify-center items-center py-2 px-4 rounded-lg text-white ${
                    isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  onClick={() => { setForgotOpen(true); setFpStep(1); setFpMsg(""); }}
                  className="ml-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <KeyRound className="h-4 w-4 mr-1" />
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">You are logged in!</h3>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 rounded-lg text-white ${
                  isLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
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
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up now
            </a>
          </p>

          {/* Forgot Password Modal */}
          {forgotOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-4 w-full max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                  </h3>
                  <button className="text-gray-500" onClick={() => setForgotOpen(false)}>✕</button>
                </div>

                {fpMsg && <div className="text-sm mb-2">{fpMsg}</div>}

                {fpStep === 1 && (
                  <>
                    <label className="text-sm">Email or Phone</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="email@example.com or +63xxxxxxxxxx"
                        value={fpIdentifier}
                        onChange={(e) => setFpIdentifier(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={fpRequest}
                      className="w-full mt-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send Code
                    </button>
                  </>
                )}

                {fpStep === 2 && (
                  <>
                    <label className="text-sm">Enter the 6-digit code</label>
                    <input
                      className="w-full mt-1 px-3 py-2 border rounded-lg tracking-widest text-center"
                      maxLength={6}
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={fpVerify}
                        className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Verify
                      </button>
                      <button
                        onClick={fpResend}
                        disabled={cooldown > 0}
                        className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                      >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                      </button>
                    </div>
                  </>
                )}

                {fpStep === 3 && (
                  <>
                    <label className="text-sm">New Password</label>
                    <input
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      type="password"
                      value={fpNewPass}
                      onChange={(e) => setFpNewPass(e.target.value)}
                    />
                    <label className="text-sm mt-2 block">Confirm Password</label>
                    <input
                      className="w-full mt-1 px-3 py-2 border rounded-lg"
                      type="password"
                      value={fpNewPass2}
                      onChange={(e) => setFpNewPass2(e.target.value)}
                    />
                    <button
                      onClick={fpReset}
                      className="w-full mt-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Update Password
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
