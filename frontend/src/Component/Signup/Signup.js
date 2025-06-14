import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, UserPlus, Lock, Mail } from "lucide-react";
import axios from "axios";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:8081/api/signup", {
          email,
          password,
          fullName,
          address,
          phoneNumber,
      });
      setSuccess("Account created successfully!");
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Signup failed");
      setSuccess("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl flex rounded-xl overflow-hidden shadow-xl">
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
            <source src="/img/municipality2.mp4" type="video/mp4" />
            <source src="/videos/municipality2.mp4" type="video/mp4" />
            <source src="/municipality2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-20 z-20"></div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-6 flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <img src="/img/logo.png" alt="Official Seal" className="h-20" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
            Create Account
          </h2>
          
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

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
    <label className="text-sm font-medium text-gray-700">Full Name</label>
    <input
      type="text"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="Enter your full name"
    />
  </div>

  {/* Address */}
  <div>
    <label className="text-sm font-medium text-gray-700">Address</label>
    <input
      type="text"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="Enter your address"
    />
  </div>

  {/* Phone Number */}
  <div>
    <label className="text-sm font-medium text-gray-700">Phone Number</label>
    <input
      type="tel"
      value={phoneNumber}
      onChange={(e) => setPhoneNumber(e.target.value)}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="+63XXXXXXXXXX"
    />
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
                  placeholder="Create password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/Login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
