import { useState, useEffect } from 'react';
import AdminSidebar from '../Header/Adminsidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Edit, Trash2, X, Save } from 'lucide-react';

const API_BASE_URL = "http://localhost:8081";

export default function Viewemployee() {
  const [userEmail, setUserEmail] = useState('');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    position: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/employees`, { 
        withCredentials: true 
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees. Please try again.");
    } finally {
      setIsLoading(false);
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

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setIsDeleting(true);
        await axios.delete(`${API_BASE_URL}/api/employees/${employeeId}`, {
          withCredentials: true
        });
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (employee) => {
    setEditEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name) errors.first_name = "First name is required";
    if (!formData.last_name) errors.last_name = "Last name is required";
    if (!formData.position) errors.position = "Position is required";
    if (!formData.department) errors.department = "Department is required";
    if (!formData.email) errors.email = "Email is required";
    
    if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        email: formData.email
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await axios.put(`${API_BASE_URL}/api/employees/${editEmployee.employee_id}`, updateData, {
        withCredentials: true
      });
      
      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen bg-white text-slate-900"
      style={{
        fontFamily: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Sidebar */}
      <AdminSidebar 
        handleLogout={handleLogout}
        isLoading={isLoading}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 border-b border-slate-200 backdrop-blur sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Manage Employee
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                View, edit, and manage municipal staff accounts.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification icon */}
              <button className="relative flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
                <Bell size={18} className="text-slate-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  5
                </span>
              </button>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium leading-tight">
                    {userEmail || 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-400 leading-tight">
                    System Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="px-6 py-6 md:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-7">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight">
                    Employee List
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage registered employees assigned to different municipal departments.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/addemploy')}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  + Add New Employee
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {employees.length > 0 ? (
                        employees.map((employee) => (
                          <tr
                            key={employee.employee_id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                              {employee.employee_id}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-700">
                              {employee.first_name} {employee.last_name}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                              {employee.email}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                              {employee.phone}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                              {employee.position}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                              {employee.department}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEdit(employee)}
                                className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 mr-3"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(employee.employee_id)}
                                className="inline-flex items-center justify-center text-red-600 hover:text-red-800 disabled:opacity-60"
                                disabled={isDeleting}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-6 text-center text-sm text-slate-500"
                          >
                            No employees found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold tracking-tight">
                  Edit Employee
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Update employee details or change credentials.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="px-5 py-4 md:py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.first_name ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.last_name ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500/60"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.position ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.position && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.position}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.department ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="BLPO">Business And Licensing Office</option>
                    <option value="MDO">Municipal Planning and Development Office</option>
                    <option value="MHO">Municipal Health Office</option>
                  </select>
                  {formErrors.department && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.department}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <div className="border-t border-slate-200 my-3"></div>
                  <p className="text-xs text-slate-500 mb-2">
                    Change Password <span className="text-slate-400">(leave blank to keep current password)</span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-blue-500/60 ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-1" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
