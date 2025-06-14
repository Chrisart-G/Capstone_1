import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';
import axios from 'axios';
import { Bell, Edit, Trash2, Eye, Plus, Search, User, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = "http://localhost:8081";

export default function ManageOffice() {
  const [offices, setOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [officeEmployees, setOfficeEmployees] = useState([]);
  const [editFormData, setEditFormData] = useState({
    officeName: '',
    officeCode: '',
    location: '',
    description: '',
    phone: '',
    email: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState({ message: '', show: false });
  const [actionError, setActionError] = useState({ message: '', show: false });
  const [showAssignModal, setShowAssignModal] = useState(false);
const [availableEmployees, setAvailableEmployees] = useState([]);
const [selectedEmployees, setSelectedEmployees] = useState([]);
const [assignmentData, setAssignmentData] = useState({
  assignment_date: new Date().toISOString().split('T')[0],
  is_primary: false,
  status: 'active'
});
  const navigate = useNavigate();
  const fetchAvailableEmployees = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/employees`,
      { withCredentials: true }
    );
    
    if (Array.isArray(response.data)) {
      setAvailableEmployees(response.data);
    } else {
      console.warn("Unexpected employee data format:", response.data);
      setAvailableEmployees([]);
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    setActionError({
      message: "Failed to load employees. Please try again.",
      show: true
    });
  }
};

// 3. ADD THIS FUNCTION to handle showing assign modal
const handleShowAssignModal = async (office) => {
  setSelectedOffice(office);
  await fetchAvailableEmployees();
  setSelectedEmployees([]);
  setAssignmentData({
    assignment_date: new Date().toISOString().split('T')[0],
    is_primary: false,
    status: 'active'
  });
  setShowAssignModal(true);
};
const handleRemoveEmployee = async (officeId, employeeId) => {
  try {
    await axios.delete(`${API_BASE_URL}/api/offices/${officeId}/employees/${employeeId}`, {
      withCredentials: true
    });

    // Update state to reflect removal
    setOfficeEmployees(prev =>
      prev.filter(emp => emp.employee_id !== employeeId)
    );

    setActionSuccess({
      message: 'Employee removed successfully.',
      show: true
    });

    setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
  } catch (error) {
    console.error("Error removing employee:", error);
    setActionError({
      message: "Failed to remove employee. Please try again.",
      show: true
    });
  }
};

// 4. ADD THIS FUNCTION to handle employee assignment
const handleAssignEmployees = async () => {
  if (selectedEmployees.length === 0) {
    setActionError({
      message: "Please select at least one employee to assign.",
      show: true
    });
    return;
  }

  try {
    setIsSubmitting(true);
    
    const employee_assignments = selectedEmployees.map(employeeId => ({
      employee_id: employeeId,
      assignment_date: assignmentData.assignment_date,
      is_primary: assignmentData.is_primary,
      status: assignmentData.status
    }));

    await axios.post(
      `${API_BASE_URL}/api/offices/${selectedOffice.office_id}/assign-employees`,
      { employee_assignments },
      { withCredentials: true }
    );

    setShowAssignModal(false);
    setActionSuccess({
      message: `Employees assigned to ${selectedOffice.office_name} successfully.`,
      show: true
    });
    
    setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
  } catch (error) {
    console.error("Error assigning employees:", error);
    setActionError({
      message: error.response?.data?.message || "Failed to assign employees. Please try again.",
      show: true
    });
  } finally {
    setIsSubmitting(false);
  }
};

// 5. ADD THIS FUNCTION to handle employee selection
const handleEmployeeSelection = (employeeId) => {
  setSelectedEmployees(prev => 
    prev.includes(employeeId) 
      ? prev.filter(id => id !== employeeId)
      : [...prev, employeeId]
  );
};
  // Fetch offices on component mount
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setIsLoading(true);
        
        // Clear any existing error messages
        setActionError({ message: '', show: false });
        
        const response = await axios.get(
          `${API_BASE_URL}/api/offices`,
          { 
            withCredentials: true
          }
        );
        
        // Check if response data is array or has expected structure
        if (Array.isArray(response.data)) {
          setOffices(response.data);
        } else if (response.data && response.data.success === false) {
          // Handle API error response
          throw new Error(response.data.message || "Error loading offices");
        } else {
          console.warn("Unexpected response format:", response.data);
          setOffices([]);
        }
      } catch (error) {
        console.error("Error fetching offices:", error);
        
        // Show more specific error message if available
        let errorMessage = "Failed to load offices. Please try again.";
        if (error.response) {
          // Server responded with an error status
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || errorMessage}`;
        } else if (error.request) {
          // Request was made but no response
          errorMessage = "No response from server. Please check your connection.";
        }
        
        setActionError({
          message: errorMessage,
          show: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffices();
    
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
  
  
  const handleAddOffice = () => {
    navigate('/admin/add-office');
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleShowDelete = (office) => {
    setSelectedOffice(office);
    setShowDeleteModal(true);
  };
  
  const handleEditClick = (office) => {
    setSelectedOffice(office);
    setEditFormData({
      officeName: office.office_name,
      officeCode: office.office_code,
      location: office.location || '',
      description: office.description || '',
      phone: office.phone || '',
      email: office.email || '',
      isActive: office.is_active === 1 || office.is_active === true,
    });
    setShowEditModal(true);
  };
  
  const handleShowEmployees = async (office) => {
    setSelectedOffice(office);
    try {
      // Using office_id as the parameter for the API request
      const response = await axios.get(
        `${API_BASE_URL}/api/offices/${office.office_id}/employees`,
        { withCredentials: true }
      );
      
      // Check if response is an array or has the expected structure
      if (Array.isArray(response.data)) {
        setOfficeEmployees(response.data);
      } else if (response.data && Array.isArray(response.data.employees)) {
        // Handle case where data might be nested in an "employees" property
        setOfficeEmployees(response.data.employees);
      } else if (response.data && response.data.success === false) {
        throw new Error(response.data.message || "Error loading employees");
      } else {
        console.warn("Unexpected employee data format:", response.data);
        setOfficeEmployees([]);
      }
      
      setShowEmployeesModal(true);
    } catch (error) {
      console.error("Error fetching office employees:", error);
      
      // Show detailed error message
      let errorMessage = "Failed to load employee data. Please try again.";
      if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || errorMessage}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      
      setActionError({
        message: errorMessage,
        show: true
      });
    }
  };
  
  const handleDeleteOffice = async () => {
    if (!selectedOffice) return;
    
    try {
      setIsSubmitting(true);
      await axios.delete(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}`,
        { withCredentials: true }
      );
      
      // Remove from state
      setOffices(offices.filter(office => office.office_id !== selectedOffice.office_id));
      setShowDeleteModal(false);
      setActionSuccess({
        message: `${selectedOffice.office_name} has been deleted successfully.`,
        show: true
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
    } catch (error) {
      console.error("Delete office error:", error);
      setActionError({
        message: "Failed to delete office. Please try again.",
        show: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}`,
        {
          office_name: editFormData.officeName,
          office_code: editFormData.officeCode,
          office_location: editFormData.location, // Fixing field name to match API
          description: editFormData.description,
          phone: editFormData.phone,
          email: editFormData.email,
          is_active: editFormData.isActive ? 1 : 0,
        },
        { withCredentials: true }
      );

      // Update the offices list with the updated office
      const updatedOffices = offices.map((office) =>
        office.office_id === selectedOffice.office_id 
          ? { 
              ...office, 
              office_name: editFormData.officeName,
              office_code: editFormData.officeCode,
              location: editFormData.location,
              description: editFormData.description,
              phone: editFormData.phone,
              email: editFormData.email,
              is_active: editFormData.isActive ? 1 : 0
            } 
          : office
      );
      
      setOffices(updatedOffices);
      setShowEditModal(false);
      setActionSuccess({
        message: `${editFormData.officeName} has been updated successfully.`,
        show: true,
      });
      setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
    } catch (error) {
      console.error("Edit office error:", error);
      
      // Check for specific validation errors
      const errorMessage = error.response?.data?.message || "Failed to update office. Please try again.";
      
      setActionError({
        message: errorMessage,
        show: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOffices = offices.filter((office) =>
    office.office_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar onLogout={handleLogout} email={userEmail} />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Offices</h1>
          <button
            onClick={handleAddOffice}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="mr-2" size={20} />
            Add Office
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Office..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {actionSuccess.show && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">
            <CheckCircle className="inline mr-2" size={18} />
            {actionSuccess.message}
          </div>
        )}
        {actionError.show && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
            <XCircle className="inline mr-2" size={18} />
            {actionError.message}
            <button 
              className="ml-2 text-sm underline"
              onClick={() => setActionError({ message: '', show: false })}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOffices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No offices found{searchTerm ? ' matching your search' : ''}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white rounded shadow">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffices.map((office) => (
                  <tr key={office.office_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{office.office_name}</td>
                    <td className="px-4 py-2">{office.office_code}</td>
                    <td className="px-4 py-2">{office.location || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${office.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {office.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditClick(office)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit Office"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleShowDelete(office)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Office"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
  onClick={() => handleShowEmployees(office)}
  className="text-green-500 hover:text-green-700"
  title="View Employees"
>
  <User size={18} />
</button>
<button
  onClick={() => handleShowAssignModal(office)}
  className="text-purple-500 hover:text-purple-700"
  title="Assign Employees"
>
  <UserPlus size={18} />
</button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete "{selectedOffice.office_name}"?</p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOffice}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-[500px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Edit Office</h2>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Office Name</label>
                  <input
                    type="text"
                    placeholder="Office Name"
                    value={editFormData.officeName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, officeName: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Office Code</label>
                  <input
                    type="text"
                    placeholder="Office Code"
                    value={editFormData.officeCode}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, officeCode: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, location: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    placeholder="Description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editFormData.isActive}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, isActive: e.target.checked })
                    }
                  />
                  <label htmlFor="isActive">Active</label>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Employees Modal */}
        {showEmployeesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-[600px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Employees in {selectedOffice.office_name}</h2>
              {officeEmployees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No employees found for this office.</p>
              ) : (
                <ul className="space-y-2">
                  {officeEmployees.map((employee) => (
  <li key={employee.employee_id} className="border p-3 rounded hover:bg-gray-50">
    <div className="font-semibold">{employee.full_name}</div>
    <div className="text-sm text-gray-600">{employee.position}</div>
    {employee.email && <div className="text-sm text-gray-500">{employee.email}</div>}
    <button
      onClick={() => handleRemoveEmployee(selectedOffice.office_id, employee.employee_id)}
      className="mt-2 text-sm text-red-600 hover:text-red-800"
    >
      Remove from Office
    </button>
  </li>
))}
                </ul>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowEmployeesModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Assign Employees Modal */}
{showAssignModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-md w-[700px] max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        Assign Employees to {selectedOffice?.office_name}
      </h2>
      
      {/* Assignment Settings */}
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h3 className="font-medium mb-3">Assignment Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Assignment Date</label>
            <input
              type="date"
              value={assignmentData.assignment_date}
              onChange={(e) => setAssignmentData({...assignmentData, assignment_date: e.target.value})}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={assignmentData.status}
              onChange={(e) => setAssignmentData({...assignmentData, status: e.target.value})}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={assignmentData.is_primary}
              onChange={(e) => setAssignmentData({...assignmentData, is_primary: e.target.checked})}
            />
            <span className="text-sm">Set as primary office for selected employees</span>
          </label>
        </div>
      </div>

      {/* Employee Selection */}
      <div className="mb-4">
        <h3 className="font-medium mb-3">Select Employees ({selectedEmployees.length} selected)</h3>
        <div className="max-h-60 overflow-y-auto border rounded">
          {availableEmployees.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No employees available</p>
          ) : (
            <div className="space-y-1">
              {availableEmployees.map((employee) => (
                <label
                  key={employee.employee_id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.employee_id)}
                    onChange={() => handleEmployeeSelection(employee.employee_id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {employee.position} - {employee.department}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAssignModal(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleAssignEmployees}
          disabled={isSubmitting || selectedEmployees.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? "Assigning..." : `Assign ${selectedEmployees.length} Employee(s)`}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}