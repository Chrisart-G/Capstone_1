import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, FileText, Filter, Download, Upload } from 'lucide-react';
import AdminSidebar from '../Header/Adminsidebar';

const DocumentRequirementsManager = () => {
  // Sample data for document requirements
  const [requirements, setRequirements] = useState([
    {
      id: 1,
      name: 'Valid ID',
      category: 'Business Permits',
      department: 'Business Affairs',
      instructions: 'Submit a clear photocopy of any government-issued ID',
      applicationsCount: 45,
      hasTemplate: true,
      createdDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Barangay Clearance',
      category: 'Residency Certificates',
      department: 'Civil Registry',
      instructions: 'Obtain from your respective barangay office',
      applicationsCount: 32,
      hasTemplate: false,
      createdDate: '2024-01-20'
    },
    {
      id: 3,
      name: 'Building Plan',
      category: 'Building Permits',
      department: 'Engineering',
      instructions: 'Architectural plans signed by a licensed architect',
      applicationsCount: 18,
      hasTemplate: true,
      createdDate: '2024-02-01'
    },
    {
      id: 4,
      name: 'Business Registration',
      category: 'Business Permits',
      department: 'Business Affairs',
      instructions: 'DTI or SEC registration certificate',
      applicationsCount: 28,
      hasTemplate: false,
      createdDate: '2024-01-25'
    },
    {
      id: 5,
      name: 'Tax Declaration',
      category: 'Building Permits',
      department: 'Assessor',
      instructions: 'Current tax declaration of the property',
      applicationsCount: 12,
      hasTemplate: true,
      createdDate: '2024-02-10'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'list'

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department: '',
    instructions: '',
    hasTemplate: false
  });

  // Get unique categories and departments for filters
  const categories = [...new Set(requirements.map(req => req.category))];
  const departments = [...new Set(requirements.map(req => req.department))];

  // Filter requirements based on search and filters
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.instructions.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || req.category === selectedCategory;
      const matchesDepartment = !selectedDepartment || req.department === selectedDepartment;
      
      return matchesSearch && matchesCategory && matchesDepartment;
    });
  }, [requirements, searchTerm, selectedCategory, selectedDepartment]);

  const handleAdd = () => {
    const newRequirement = {
      id: Math.max(...requirements.map(r => r.id)) + 1,
      ...formData,
      applicationsCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setRequirements([...requirements, newRequirement]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (requirement) => {
    setEditingRequirement(requirement);
    setFormData({
      name: requirement.name,
      category: requirement.category,
      department: requirement.department,
      instructions: requirement.instructions,
      hasTemplate: requirement.hasTemplate
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    setRequirements(requirements.map(req => 
      req.id === editingRequirement.id 
        ? { ...req, ...formData }
        : req
    ));
    setShowEditModal(false);
    resetForm();
    setEditingRequirement(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      setRequirements(requirements.filter(req => req.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      department: '',
      instructions: '',
      hasTemplate: false
    });
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const RequirementForm = ({ onSubmit, submitLabel }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter requirement name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select category</option>
          <option value="Business Permits">Business Permits</option>
          <option value="Building Permits">Building Permits</option>
          <option value="Residency Certificates">Residency Certificates</option>
          <option value="Health Permits">Health Permits</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select department</option>
          <option value="Business Affairs">Business Affairs</option>
          <option value="Engineering">Engineering</option>
          <option value="Civil Registry">Civil Registry</option>
          <option value="Health">Health</option>
          <option value="Assessor">Assessor</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({...formData, instructions: e.target.value})}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Enter detailed instructions"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="hasTemplate"
          checked={formData.hasTemplate}
          onChange={(e) => setFormData({...formData, hasTemplate: e.target.checked})}
          className="mr-2"
        />
        <label htmlFor="hasTemplate" className="text-sm text-gray-700">Has template/sample form</label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <button
          onClick={onSubmit}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          {submitLabel}
        </button>
        <button
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Document Requirements</h1>
        <p className="text-gray-600">View, edit, and organize document requirements for your system</p>
      </div>
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* View Toggle & Add Button */}
          <div className="flex gap-2 ">
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                List
              </button>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Requirement
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredRequirements.length} of {requirements.length} requirements
        </p>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="">
          <div className="flex min-h-screen">
            <table className="w-full flex-1 ml-64">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequirements.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{req.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{req.instructions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {req.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {req.applicationsCount} apps
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.hasTemplate ? (
                        <FileText className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(req)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredRequirements.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{req.name}</h3>
                    {req.hasTemplate && <FileText className="w-4 h-4 text-green-600" />}
                  </div>
                  <p className="text-gray-600 mb-3">{req.instructions}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {req.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {req.department}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {req.applicationsCount} applications
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(req)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      )}

      {/* Empty State */}
      {filteredRequirements.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedDepartment 
              ? "Try adjusting your search or filters" 
              : "Get started by adding your first document requirement"}
          </p>
          {!searchTerm && !selectedCategory && !selectedDepartment && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add First Requirement
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Requirement"
      >
        <RequirementForm onSubmit={handleAdd} submitLabel="Add Requirement" />
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Requirement"
      >
        <RequirementForm onSubmit={handleUpdate} submitLabel="Update Requirement" />
      </Modal>
    </div>
    
  );
};

export default DocumentRequirementsManager;