import { useState, useEffect } from 'react';
import AdminSidebar from '../Header/Adminsidebar'; // Adjust path as needed
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
      
      // Redirect to login page
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
        // Refresh employee list
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
    
    // Only validate password if it's being changed
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
      
      // Only include password if it's being changed
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        handleLogout={handleLogout}
        isLoading={isLoading}
      />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Manage Employee</h1>
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Employee List</h2>
              <button
                onClick={() => navigate('/addemploy')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add New Employee
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <tr key={employee.employee_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.employee_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.first_name} {employee.last_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(employee.employee_id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={isDeleting}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">Edit Employee</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.first_name && <p className="mt-1 text-sm text-red-500">{formErrors.first_name}</p>}
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.last_name && <p className="mt-1 text-sm text-red-500">{formErrors.last_name}</p>}
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.position ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.position && <p className="mt-1 text-sm text-red-500">{formErrors.position}</p>}
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.department ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Department</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Customer Service">Customer Service</option>
                  </select>
                  {formErrors.department && <p className="mt-1 text-sm text-red-500">{formErrors.department}</p>}
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
                
                <div className="col-span-2">
                  <div className="border-t border-gray-200 my-4"></div>
                  <p className="text-sm text-gray-600 mb-2">Change Password (leave blank to keep current password)</p>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.password && <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>}
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
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