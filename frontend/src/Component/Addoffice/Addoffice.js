import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';
import axios from 'axios';
import { Bell, Plus, Check } from 'lucide-react';

const API_BASE_URL = "http://localhost:8081";

export default function AddOffice() {
  const [formData, setFormData] = useState({
    office_name: '',
    office_code: '',
    office_location: '',
    office_description: '',
    phone_number: '',
    email: '',
    status: 'active',
  });
  
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  
  // Fetch available employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/employees`,
          { withCredentials: true }
        );
        setAvailableEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
    
    // Get current admin email from session if available
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserEmail(userData.email || '');
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.office_name.trim()) {
      newErrors.office_name = 'Office name is required';
    }
    
    if (!formData.office_code.trim()) {
      newErrors.office_code = 'Office code is required';
    } else if (formData.office_code.length > 20) {
      newErrors.office_code = 'Office code must be less than 20 characters';
    }
    
    if (!formData.office_location.trim()) {
      newErrors.office_location = 'Location is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    return newErrors;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value
    });
  };
  
  const handleEmployeeSelect = (e) => {
    const employeeId = parseInt(e.target.value);
    if (employeeId && !employeeAssignments.some(a => a.employeeId === employeeId)) {
      const selectedEmployee = availableEmployees.find(e => e.employee_id === employeeId);
      if (selectedEmployee) {
        setEmployeeAssignments([
          ...employeeAssignments,
          {
            employee_id: selectedEmployee.employee_id,
            employeeName: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
            positionInOffice: selectedEmployee.position,
            is_primary: employeeAssignments.length === 0, // First added is primary
            assignment_date: new Date().toISOString().split('T')[0]
          }
        ]);
      }
    }
  };
  
  const handleRemoveAssignment = (employeeId) => {
    setEmployeeAssignments(employeeAssignments.filter(a => a.employee_id !== employeeId));
  };
  
  const handleSetPrimary = (employeeId) => {
    setEmployeeAssignments(employeeAssignments.map(a => ({
      ...a,
      is_primary: a.employee_id === employeeId
    })));
  };
  
  const handleAssignmentChange = (employeeId, field, value) => {
    setEmployeeAssignments(employeeAssignments.map(a => 
      a.employee_id === employeeId ? { ...a, [field]: value } : a
    ));
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
        // Prepare data with employee assignments
        const data = {
          ...formData,
          employee_assignments: employeeAssignments.map(assignment => ({
            employee_id: assignment.employee_id,
            is_primary: assignment.is_primary,
            assignment_date: assignment.assignment_date
          }))
        };
        
        console.log("Submitting data:", data); // Debug: Log the data being sent
        
        const response = await axios.post(
          `${API_BASE_URL}/api/offices`,
          data,
          { withCredentials: true }
        );
        
        // Handle success
        setIsSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          office_name: '',
          office_code: '',
          office_location: '',
          office_description: '',
          phone_number: '',
          email: '',
          status: 'active',
        });
        setEmployeeAssignments([]);
        
        // Hide success message after 3 seconds and redirect
        setTimeout(() => {
          setIsSuccess(false);
          navigate('/admin/manage-offices');
        }, 3000);
        
      } catch (error) {
        console.error("Error adding office:", error);
        setIsError(true);
        setErrorMessage(
          error.response?.data?.message || 
          "Failed to add office. Please try again."
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
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter employees that are not already assigned
  const unassignedEmployees = availableEmployees.filter(
    employee => !employeeAssignments.some(a => a.employee_id === employee.employee_id)
  );
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        handleLogout={handleLogout}
        isLoading={isLoading}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Add New Office</h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <Bell size={20} className="cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">5</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                <span>{userEmail || 'Admin User'}</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Office Details</h2>
              
              {isSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  Office added successfully! Redirecting to manage offices...
                </div>
              )}
              
              {isError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Office Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="office_name">
                      Office Name*
                    </label>
                    <input
                      type="text"
                      id="office_name"
                      name="office_name"
                      value={formData.office_name}
                      onChange={handleChange}
                      placeholder="e.g. Business Permits and Licensing Office"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.office_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                      }`}
                    />
                    {errors.office_name && <p className="text-red-500 text-sm mt-1">{errors.office_name}</p>}
                  </div>
                  
                  {/* Office Code */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="office_code">
                      Office Code*
                    </label>
                    <input
                      type="text"
                      id="office_code"
                      name="office_code"
                      value={formData.office_code}
                      onChange={handleChange}
                      placeholder="e.g. BPLO"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.office_code ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                      }`}
                    />
                    {errors.office_code && <p className="text-red-500 text-sm mt-1">{errors.office_code}</p>}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="office_location">
                      Location*
                    </label>
                    <input
                      type="text"
                      id="office_location"
                      name="office_location"
                      value={formData.office_location}
                      onChange={handleChange}
                      placeholder="e.g. Municipal Hall, 1st Floor"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.office_location ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                      }`}
                    />
                    {errors.office_location && <p className="text-red-500 text-sm mt-1">{errors.office_location}</p>}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="phone_number">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. office@municipality.gov"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  {/* Status (Active/Inactive) */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="status"
                      name="status"
                      checked={formData.status === 'active'}
                      onChange={(e) => handleChange({
                        target: {
                          name: 'status',
                          type: 'checkbox',
                          checked: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-gray-700 font-medium" htmlFor="status">
                      Office is currently active
                    </label>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mt-6">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="office_description">
                    Description
                  </label>
                  <textarea
                    id="office_description"
                    name="office_description"
                    value={formData.office_description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter a description of this office's function and responsibilities"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  ></textarea>
                </div>
                
                {/* Employee Assignments Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Assign Employees</h3>
                  
                  <div className="flex items-end mb-4">
                    <div className="flex-grow mr-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="employeeSelect">
                        Select Employee
                      </label>
                      <select
                        id="employeeSelect"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        onChange={handleEmployeeSelect}
                        value=""
                      >
                        <option value="">-- Select an employee --</option>
                        {unassignedEmployees.map((employee) => (
                          <option key={employee.employee_id} value={employee.employee_id}>
                            {employee.first_name} {employee.last_name} ({employee.position})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Display assigned employees */}
                  {employeeAssignments.length > 0 ? (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Position in Office
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assignment Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Primary
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employeeAssignments.map((assignment) => (
                            <tr key={assignment.employee_id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{assignment.employeeName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={assignment.positionInOffice}
                                  onChange={(e) => handleAssignmentChange(assignment.employee_id, 'positionInOffice', e.target.value)}
                                  className="text-sm text-gray-900 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-200 w-full"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="date"
                                  value={assignment.assignment_date}
                                  onChange={(e) => handleAssignmentChange(assignment.employee_id, 'assignment_date', e.target.value)}
                                  className="text-sm text-gray-900 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-200"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary(assignment.employee_id)}
                                  className={`inline-flex items-center px-2 py-1 border ${assignment.is_primary ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'} rounded text-xs font-medium`}
                                >
                                  {assignment.is_primary ? (
                                    <>
                                      <Check size={14} className="mr-1" /> Primary
                                    </>
                                  ) : 'Set as Primary'}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAssignment(assignment.employee_id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No employees assigned yet. Select employees from the dropdown above.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    className="px-6 py-2 mr-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    onClick={() => navigate('/admin/manage-offices')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Adding...' : 'Create Office'}
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