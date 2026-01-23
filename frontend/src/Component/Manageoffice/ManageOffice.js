// src/Component/Manageoffice/ManageOffice.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../Header/Adminsidebar';
import axios from 'axios';
import {
  Bell,
  Edit,
  Trash2,
  User,
  UserPlus,
  Plus,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

// ▶ LEVEL OPTIONS FOR POSITIONS
const POSITION_LEVELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'mid', label: 'Mid' },
  { value: 'max', label: 'Max' },
];

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
  const [actionSuccess, setActionSuccess] = useState({
    message: '',
    show: false,
  });
  const [actionError, setActionError] = useState({
    message: '',
    show: false,
  });

  // ─────────────────────────────────────────────
  // Assign employees modal state
  // ─────────────────────────────────────────────
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    assignment_date: new Date().toISOString().split('T')[0],
    is_primary: false,
    status: 'active',
  });

  // For each selected employee: which position (string) in this office
  const [assignmentPositionsByEmployee, setAssignmentPositionsByEmployee] =
    useState({});

  // ─────────────────────────────────────────────
  // Office positions (used BOTH in Edit modal and Assign modal)
  // ─────────────────────────────────────────────
  const [officePositions, setOfficePositions] = useState([]);
  const [newPositionName, setNewPositionName] = useState('');
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  const navigate = useNavigate();

  // Fetch employees (for assignment)
  const fetchAvailableEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employees`, {
        withCredentials: true,
      });

      if (Array.isArray(response.data)) {
        setAvailableEmployees(response.data);
      } else {
        console.warn('Unexpected employee data format:', response.data);
        setAvailableEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setActionError({
        message: 'Failed to load employees. Please try again.',
        show: true,
      });
    }
  };

  // Fetch positions for a specific office (from tbl_office_positions)
  const fetchOfficePositions = async (officeId) => {
    if (!officeId) {
      setOfficePositions([]);
      return;
    }
    try {
      setIsLoadingPositions(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/offices/${officeId}/positions`,
        { withCredentials: true }
      );

      if (Array.isArray(res.data)) {
        setOfficePositions(res.data);
      } else if (res.data && Array.isArray(res.data.positions)) {
        setOfficePositions(res.data.positions);
      } else {
        setOfficePositions([]);
      }
    } catch (err) {
      console.error('Error fetching office positions:', err);
      setOfficePositions([]);
    } finally {
      setIsLoadingPositions(false);
    }
  };

  const handleShowAssignModal = async (office) => {
    setSelectedOffice(office);
    // Load employees AND this office's positions from DB
    await Promise.all([
      fetchAvailableEmployees(),
      fetchOfficePositions(office.office_id),
    ]);

    setSelectedEmployees([]);
    setAssignmentPositionsByEmployee({});
    setAssignmentData({
      assignment_date: new Date().toISOString().split('T')[0],
      is_primary: false,
      status: 'active',
    });
    setShowAssignModal(true);
  };

  const handleRemoveEmployee = async (officeId, employeeId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/offices/${officeId}/employees/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      setOfficeEmployees((prev) =>
        prev.filter((emp) => emp.employee_id !== employeeId)
      );

      setActionSuccess({
        message: 'Employee removed successfully.',
        show: true,
      });

      setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
    } catch (error) {
      console.error('Error removing employee:', error);
      setActionError({
        message: 'Failed to remove employee. Please try again.',
        show: true,
      });
    }
  };

  // helper: when dropdown changes
  const handleAssignmentPositionChange = (employeeId, value) => {
    setAssignmentPositionsByEmployee((prev) => ({
      ...prev,
      [employeeId]: value,
    }));
  };

  const handleAssignEmployees = async () => {
    if (selectedEmployees.length === 0) {
      setActionError({
        message: 'Please select at least one employee to assign.',
        show: true,
      });
      return;
    }

    // If this office has defined positions, require a position for each selected employee
    if (officePositions.length > 0) {
      for (const empId of selectedEmployees) {
        if (!assignmentPositionsByEmployee[empId]) {
          setActionError({
            message:
              'Please select a position for each selected employee (using the dropdown under their name).',
            show: true,
          });
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);

      // 1) If positions exist for this office, update each employee's position
      if (officePositions.length > 0) {
        const positionUpdatePromises = selectedEmployees.map((employeeId) => {
          const emp = availableEmployees.find(
            (e) => e.employee_id === employeeId
          );
          if (!emp) return null;

          const newPosition =
            assignmentPositionsByEmployee[employeeId] || emp.position;

          const payload = {
            first_name: emp.first_name,
            last_name: emp.last_name,
            phone: emp.phone || '',
            position: newPosition,
            department: emp.department,
            email: emp.email,
          };

          return axios.put(
            `${API_BASE_URL}/api/employees/${employeeId}`,
            payload,
            { withCredentials: true }
          );
        });

        const filteredPromises = positionUpdatePromises.filter(Boolean);
        if (filteredPromises.length > 0) {
          await Promise.all(filteredPromises);
        }
      }

      // 2) Assign employees to office (existing behavior)
      const employee_assignments = selectedEmployees.map((employeeId) => ({
        employee_id: employeeId,
        assignment_date: assignmentData.assignment_date,
        is_primary: assignmentData.is_primary,
        status: assignmentData.status,
        // we COULD also send position info here, backend will just ignore extra fields
        position: assignmentPositionsByEmployee[employeeId] || undefined,
      }));

      await axios.post(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}/assign-employees`,
        { employee_assignments },
        { withCredentials: true }
      );

      setShowAssignModal(false);
      setActionSuccess({
        message: `Employees assigned to ${selectedOffice.office_name} successfully.`,
        show: true,
      });

      setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
    } catch (error) {
      console.error('Error assigning employees:', error);
      setActionError({
        message:
          error.response?.data?.message ||
          'Failed to assign employees. Please try again.',
        show: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prevSelected) => {
      const exists = prevSelected.includes(employeeId);

      if (exists) {
        // Uncheck: remove from list + clear position selection
        const next = prevSelected.filter((id) => id !== employeeId);
        setAssignmentPositionsByEmployee((prev) => {
          const copy = { ...prev };
          delete copy[employeeId];
          return copy;
        });
        return next;
      } else {
        // Check: add to list + set a default position if possible
        setAssignmentPositionsByEmployee((prev) => {
          // if already has a value, keep it
          if (prev[employeeId]) return prev;

          const emp = availableEmployees.find(
            (e) => e.employee_id === employeeId
          );
          let defaultPos = '';

          if (emp && officePositions.length > 0) {
            const match = officePositions.find(
              (p) =>
                p.position_name === emp.position || p.name === emp.position
            );
            if (match) defaultPos = match.position_name;
          }

          // if still empty & there's only 1 position in this office, use that
          if (!defaultPos && officePositions.length === 1) {
            defaultPos = officePositions[0].position_name;
          }

          return {
            ...prev,
            [employeeId]: defaultPos,
          };
        });

        return [...prevSelected, employeeId];
      }
    });
  };

  // ─────────────────────────────────────────────
  // Initial offices + user email
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setIsLoading(true);
        setActionError({ message: '', show: false });

        const response = await axios.get(`${API_BASE_URL}/api/offices`, {
          withCredentials: true,
        });

        if (Array.isArray(response.data)) {
          setOffices(response.data);
        } else if (response.data && response.data.success === false) {
          throw new Error(response.data.message || 'Error loading offices');
        } else {
          console.warn('Unexpected response format:', response.data);
          setOffices([]);
        }
      } catch (error) {
        console.error('Error fetching offices:', error);

        let errorMessage = 'Failed to load offices. Please try again.';
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${
            error.response.data?.message || errorMessage
          }`;
        } else if (error.request) {
          errorMessage =
            'No response from server. Please check your connection.';
        }

        setActionError({
          message: errorMessage,
          show: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffices();

    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserEmail(userData.email || '');
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  // ─────────────────────────────────────────────
  // Auth + simple handlers
  // ─────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
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

  // ─────────────────────────────────────────────
  // Add / delete positions (Edit modal)
  // ─────────────────────────────────────────────
  const handleAddPosition = async () => {
    if (!selectedOffice || !newPositionName.trim()) return;

    try {
      setIsLoadingPositions(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}/positions`,
        { position_name: newPositionName.trim() },
        { withCredentials: true }
      );

      if (res.data && res.data.position) {
        setOfficePositions((prev) => [...prev, res.data.position]);
      } else if (res.data && Array.isArray(res.data.positions)) {
        setOfficePositions(res.data.positions);
      } else {
        await fetchOfficePositions(selectedOffice.office_id);
      }

      setNewPositionName('');
    } catch (err) {
      console.error('Error adding position:', err);
      setActionError({
        message:
          err.response?.data?.message ||
          'Failed to add position. Please try again.',
        show: true,
      });
    } finally {
      setIsLoadingPositions(false);
    }
  };

  const handleDeletePosition = async (positionId) => {
    if (!selectedOffice) return;

    try {
      setIsLoadingPositions(true);
      await axios.delete(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}/positions/${positionId}`,
        { withCredentials: true }
      );

      setOfficePositions((prev) =>
        prev.filter((pos) => pos.position_id !== positionId)
      );
    } catch (err) {
      console.error('Error deleting position:', err);
      setActionError({
        message:
          err.response?.data?.message ||
          'Failed to delete position. Please try again.',
        show: true,
      });
    } finally {
      setIsLoadingPositions(false);
    }
  };

  // ▶ NEW: update a single position's LEVEL (authorization)
  const handleUpdatePositionLevel = async (positionId, newLevel) => {
    if (!selectedOffice) return;

    const valid = ['normal', 'mid', 'max'];
    const safeLevel = valid.includes(newLevel) ? newLevel : 'normal';

    const target = officePositions.find(
      (p) => p.position_id === positionId
    );
    if (!target) return;

    try {
      setIsLoadingPositions(true);

      await axios.put(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}/positions/${positionId}`,
        {
          // send existing data so backend validations stay happy
          position_name: target.position_name || target.name,
          can_approve: target.can_approve ?? 0,
          access_level: safeLevel,
        },
        { withCredentials: true }
      );

      // update local list
      setOfficePositions((prev) =>
        prev.map((pos) =>
          pos.position_id === positionId
            ? { ...pos, access_level: safeLevel }
            : pos
        )
      );
    } catch (err) {
      console.error('Error updating position level:', err);
      setActionError({
        message:
          err.response?.data?.message ||
          'Failed to update position level. Please try again.',
        show: true,
      });
    } finally {
      setIsLoadingPositions(false);
    }
  };

  // ─────────────────────────────────────────────
  // Edit + employees
  // ─────────────────────────────────────────────
  const handleEditClick = (office) => {
    setSelectedOffice(office);
    setEditFormData({
      officeName: office.office_name,
      officeCode: office.office_code,
      location: office.location || office.office_location || '',
      description: office.office_description || office.description || '',
      phone: office.phone || office.phone_number || '',
      email: office.email || '',
      isActive: office.is_active === 1 || office.is_active === true,
    });
    setErrors({});
    setShowEditModal(true);
    fetchOfficePositions(office.office_id);
  };

  const handleShowEmployees = async (office) => {
    setSelectedOffice(office);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/offices/${office.office_id}/employees`,
        { withCredentials: true }
      );

      if (Array.isArray(response.data)) {
        setOfficeEmployees(response.data);
      } else if (response.data && Array.isArray(response.data.employees)) {
        setOfficeEmployees(response.data.employees);
      } else if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Error loading employees');
      } else {
        console.warn('Unexpected employee data format:', response.data);
        setOfficeEmployees([]);
      }

      setShowEmployeesModal(true);
    } catch (error) {
      console.error('Error fetching office employees:', error);

      let errorMessage = 'Failed to load employee data. Please try again.';
      if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${
          error.response.data?.message || errorMessage
        }`;
      } else if (error.request) {
        errorMessage =
          'No response from server. Please check your connection.';
      }

      setActionError({
        message: errorMessage,
        show: true,
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

      setOffices((prev) =>
        prev.filter((office) => office.office_id !== selectedOffice.office_id)
      );
      setShowDeleteModal(false);
      setActionSuccess({
        message: `${selectedOffice.office_name} has been deleted successfully.`,
        show: true,
      });

      setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
    } catch (error) {
      console.error('Delete office error:', error);
      setActionError({
        message: 'Failed to delete office. Please try again.',
        show: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffice) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await axios.put(
        `${API_BASE_URL}/api/offices/${selectedOffice.office_id}`,
        {
          office_name: editFormData.officeName,
          office_code: editFormData.officeCode,
          office_location: editFormData.location,
          description: editFormData.description,
          phone: editFormData.phone,
          email: editFormData.email,
          is_active: editFormData.isActive ? 1 : 0,
        },
        { withCredentials: true }
      );

      // Update offices list in state
      setOffices((prev) =>
        prev.map((office) =>
          office.office_id === selectedOffice.office_id
            ? {
                ...office,
                office_name: editFormData.officeName,
                office_code: editFormData.officeCode,
                location: editFormData.location,
                description: editFormData.description,
                phone: editFormData.phone,
                email: editFormData.email,
                is_active: editFormData.isActive ? 1 : 0,
              }
            : office
        )
      );

      setShowEditModal(false);
      setActionSuccess({
        message: `${editFormData.officeName} has been updated successfully.`,
        show: true,
      });
      setTimeout(() => setActionSuccess({ message: '', show: false }), 3000);
    } catch (error) {
      console.error('Edit office error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update office. Please try again.';
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

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="appointment flex min-h-screen bg-gray-100">
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : filteredOffices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No offices found{searchTerm ? ' matching your search' : ''}.
            </p>
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
                  <tr
                    key={office.office_id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{office.office_name}</td>
                    <td className="px-4 py-2">{office.office_code}</td>
                    <td className="px-4 py-2">
                      {office.location || office.office_location || '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          office.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
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
              <p>
                Are you sure you want to delete &quot;
                {selectedOffice.office_name}&quot;?
              </p>
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
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal (includes positions) */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-[520px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Edit Office</h2>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Office Name
                  </label>
                  <input
                    type="text"
                    placeholder="Office Name"
                    value={editFormData.officeName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        officeName: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Office Code
                  </label>
                  <input
                    type="text"
                    placeholder="Office Code"
                    value={editFormData.officeCode}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        officeCode: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        location: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
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
                      setEditFormData({
                        ...editFormData,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="isActive">Active</label>
                </div>

                {/* Office Positions (NEW SECTION) */}
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Office Positions</h3>
                    {isLoadingPositions && (
                      <span className="text-xs text-gray-500">
                        Loading...
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="e.g. Licensing Officer I"
                      value={newPositionName}
                      onChange={(e) => setNewPositionName(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddPosition}
                      disabled={
                        isLoadingPositions || !newPositionName.trim()
                      }
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>

                  {officePositions.length === 0 ? (
                    <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded px-3 py-2">
                      No custom positions defined for this office yet.
                    </div>
                  ) : (
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                      {officePositions.map((pos) => (
                        <li
                          key={pos.position_id}
                          className="flex items-center justify-between border px-3 py-2 rounded text-sm"
                        >
                          <div className="flex-1 mr-2">
                            <div className="font-medium">
                              {pos.position_name || pos.name || 'Untitled'}
                            </div>

                            {/* LEVEL SELECT FOR THIS POSITION */}
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                              <span className="uppercase tracking-wide text-[10px] text-gray-400">
                                Level
                              </span>
                              <select
                                value={pos.access_level || 'normal'}
                                onChange={(e) =>
                                  handleUpdatePositionLevel(
                                    pos.position_id,
                                    e.target.value
                                  )
                                }
                                className="border px-2 py-1 rounded text-xs"
                              >
                                {POSITION_LEVELS.map((lvl) => (
                                  <option
                                    key={lvl.value}
                                    value={lvl.value}
                                  >
                                    {lvl.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePosition(pos.position_id)
                            }
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-1 text-[11px] text-gray-500">
                    Positions defined here will be available when assigning
                    employees to this office and when editing employee
                    positions.
                  </p>
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
                    {isSubmitting ? 'Updating...' : 'Update'}
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
              <h2 className="text-xl font-semibold mb-4">
                Employees in {selectedOffice.office_name}
              </h2>
              {officeEmployees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No employees found for this office.
                </p>
              ) : (
                <ul className="space-y-2">
                  {officeEmployees.map((employee) => (
                    <li
                      key={employee.employee_id}
                      className="border p-3 rounded hover:bg-gray-50"
                    >
                      <div className="font-semibold">
                        {employee.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.position}
                      </div>
                      {employee.email && (
                        <div className="text-sm text-gray-500">
                          {employee.email}
                        </div>
                      )}
                      <button
                        onClick={() =>
                          handleRemoveEmployee(
                            selectedOffice.office_id,
                            employee.employee_id
                          )
                        }
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
                    <label className="block text-sm text-gray-600 mb-1">
                      Assignment Date
                    </label>
                    <input
                      type="date"
                      value={assignmentData.assignment_date}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          assignment_date: e.target.value,
                        })
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={assignmentData.status}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          status: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          is_primary: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">
                      Set as primary office for selected employees
                    </span>
                  </label>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="mb-4">
                <h3 className="font-medium mb-1">
                  Select Employees ({selectedEmployees.length} selected)
                </h3>
                {officePositions.length > 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Positions below come from this office&apos;s position list.
                    For each checked employee, choose their position in this
                    office.
                  </p>
                )}
                <div className="max-h-60 overflow-y-auto border rounded">
                  {availableEmployees.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No employees available
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {availableEmployees.map((employee) => (
                        <label
                          key={employee.employee_id}
                          className="flex items-start p-3 hover:bg-gray-50 cursor-pointer gap-3"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(
                              employee.employee_id
                            )}
                            onChange={() =>
                              handleEmployeeSelection(employee.employee_id)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {employee.position} - {employee.department}
                            </div>

                            {officePositions.length > 0 &&
                              selectedEmployees.includes(
                                employee.employee_id
                              ) && (
                                <div className="mt-2">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Position in this office
                                  </label>
                                  <select
                                    value={
                                      assignmentPositionsByEmployee[
                                        employee.employee_id
                                      ] || ''
                                    }
                                    onChange={(e) =>
                                      handleAssignmentPositionChange(
                                        employee.employee_id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border px-2 py-1 rounded text-sm"
                                  >
                                    <option value="">
                                      -- Select position --
                                    </option>
                                    {officePositions.map((pos) => (
                                      <option
                                        key={pos.position_id}
                                        value={
                                          pos.position_name || pos.name
                                        }
                                      >
                                        {pos.position_name || pos.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
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
                  disabled={
                    isSubmitting || selectedEmployees.length === 0
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Assigning...'
                    : `Assign ${selectedEmployees.length} Employee(s)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
