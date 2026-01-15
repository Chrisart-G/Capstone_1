import { useState } from 'react';
import AdminSidebar from '../Header/Adminsidebar'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';

const API_BASE_URL = "http://localhost:8081";

export default function AddEmployeeForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    department: '',
    startDate: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    
    return newErrors;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    setErrorMessage('');
    
    const newErrors = validate();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/addemployee`, 
          formData,
          { withCredentials: true }
        );
        
        setIsSuccess(true);
        
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          position: '',
          department: '',
          startDate: '',
        });
        
        setTimeout(() => setIsSuccess(false), 3000);
        
      } catch (error) {
        console.error("Error adding employee:", error);
        setIsError(true);
        setErrorMessage(
          error.response?.data?.message || 
          "Failed to add employee. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { 
        withCredentials: true 
      });
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      className="flex min-h-screen bg-white text-slate-900 overflow-x-hidden"
      style={{
        fontFamily: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Sidebar */}
      <AdminSidebar 
        handleLogout={handleLogout}
        isLoading={isLoading}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 border-b border-slate-200 backdrop-blur sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
                Add New Employee
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-1">
                Create a new employee account and assign them to a department.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Notification icon */}
              <button className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                <Bell size={16} className="text-slate-500 sm:size-[18px]" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                  5
                </span>
              </button>

              {/* User info */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 flex items-center justify-center text-[11px] sm:text-xs font-semibold text-slate-700">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs sm:text-sm font-medium leading-tight">
                    {userEmail || 'Admin User'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    System Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Form Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
              <div className="mb-4 sm:mb-5">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
                  Employee Details
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Fill in the required information to register a new employee.
                </p>
              </div>

              {isSuccess && (
                <div className="mb-4 sm:mb-5 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs sm:text-sm text-emerald-700">
                  Employee added successfully!
                </div>
              )}
              
              {isError && (
                <div className="mb-4 sm:mb-5 p-3 rounded-xl border border-red-200 bg-red-50 text-xs sm:text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* Email */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="email"
                    >
                      Email Address<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.email ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Password */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="password"
                    >
                      Password<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.password ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>
                  
                  {/* First Name */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="firstName"
                    >
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.firstName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="lastName"
                    >
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.lastName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="phone"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </div>
                  
                  {/* Position */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="position"
                    >
                      Position<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.position ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.position && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.position}</p>
                    )}
                  </div>
                  
                  {/* Department */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="department"
                    >
                      Department<span className="text-red-500">*</span>
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.department ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="BLPO">Business And Licensing Office</option>
                      <option value="MPDO">Municipal Planning and Development Office</option>
                      <option value="HMO">Municipal Health Office</option>
                    </select>
                    {errors.department && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.department}</p>
                    )}
                  </div>
                  
                  {/* Start Date */}
                  <div>
                    <label
                      className="block text-[11px] sm:text-xs font-medium text-slate-600 mb-1.5"
                      htmlFor="startDate"
                    >
                      Start Date<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                        errors.startDate ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="text-[11px] sm:text-xs text-red-500 mt-1">{errors.startDate}</p>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    onClick={() => navigate('/admin/employees')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
