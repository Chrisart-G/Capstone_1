import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, LogIn, Mail, Lock, LogOut } from "lucide-react";
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }

    // Check if the user is already logged in on mount
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/check-session`, { 
          withCredentials: true 
        });
        
        if (response.data.loggedIn) {
          setIsLoggedIn(true);
          // Optionally redirect based on user role
          if (response.data.user.email === "admin@gmail.com") {
            navigate("/admin");
          } else {
            navigate("/Chome");
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        setError("Failed to check login status. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      // Use the correct API endpoint
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`, // Assuming your login route is under authRoutes
        { email, password },
        { withCredentials: true }
      );
  
      setIsLoggedIn(true);
      
      // Navigate based on user role
      if (res.data.user.email === "admin@gmail.com") {
        navigate("/AdminDash");
      } else {
        navigate("/Chome");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(`Error: ${error.response.data.message || "Something went wrong"}`);
        }
      } else {
        console.error("Login error:", error);
        setError("Failed to connect to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl flex rounded-xl overflow-hidden shadow-xl">
        {/* Left Side - Video */}
        <div className="w-1/2 hidden md:flex md:items-center md:justify-center bg-gray-200 relative">
          <img 
            src="/img/Logpic.png" 
            alt="Fallback Image" 
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
          
          {/* Display errors */}
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
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white ${
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
            </form>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">You are logged in!</h3>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white ${
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
            Don't have an account? {" "}
            <a href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;