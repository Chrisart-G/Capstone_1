import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const videoRef = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const res = await axios.post("http://localhost:8081/api/Login", { email, password });

      if (email === "admin@gmail.com" && password === "123") {
        navigate("/admin"); // Redirect to admin page
      } else {
        navigate("/Chome"); // Redirect to home page
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Invalid email or password.");
      } else {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
      }
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
            controls
          >
            <source src="/img/municipality.mp4" type="video/mp4" />
            <source src="/videos/municipality.mp4" type="video/mp4" />
            <source src="/municipality.mp4" type="video/mp4" />
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
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </button>
          </form>
          
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
