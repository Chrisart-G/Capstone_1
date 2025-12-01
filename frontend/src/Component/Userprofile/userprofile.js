import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Settings, Bell, Shield, FileText,
  Clock, CheckCircle, AlertCircle, Building, Download, Eye
} from 'lucide-react';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';

export default function MunicipalUserProfileDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState('public');
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    businessType: '',
    tinNumber: '',
    memberSince: '',
    avatar: null
  });
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);
  const [recentActivity, setRecentActivity] = useState([]);
  const [permitHistory, setPermitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Applications', value: '0', icon: FileText, color: 'text-blue-600' },
    { label: 'Approved Permits', value: '0', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending Review', value: '0', icon: Clock, color: 'text-yellow-600' },
    { label: 'Active Permits', value: '0', icon: Building, color: 'text-purple-600' }
  ]);

  // ===== NEW: modal state for viewing documents =====
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState('');
  const [viewDocumentTitle, setViewDocumentTitle] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8081/api/profile", {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        console.log('Profile data received:', data);

        const { userInfo: fetchedUserInfo, permits, recentActivity: fetchedActivity, statistics } = data;

        // Set user info
        const userData = {
          name: fetchedUserInfo.full_name || '',
          email: localStorage.getItem('email') || '',
          phone: fetchedUserInfo.phone_number || '',
          address: fetchedUserInfo.address || '',
          businessName: fetchedUserInfo.business_name || '',
          businessType: fetchedUserInfo.business_type || '',
          tinNumber: fetchedUserInfo.tin_number || '',
          memberSince: fetchedUserInfo.member_since || 'N/A',
          avatar: null
        };
        setUserInfo(userData);
        setTempUserInfo(userData);

        // Process permit history  (✅ includes pickupFileUrl from backend)
        const processedPermits = permits.map(p => ({
          permitType: p.permitType,
          applicationDate: p.application_date,
          status: p.status,
          expiryDate: p.expiry_date || '2025-12-31',
          referenceNo: `${p.permit_category.toUpperCase()}-${String(p.referenceNo).toString().padStart(6, '0')}`,
          businessName: p.business_name,
          pickupFileUrl: p.pickup_file_url || null, // <— used for view/download
        }));
        setPermitHistory(processedPermits);

        // Process recent activity
        const processedActivity = fetchedActivity.map(a => ({
          action: a.action,
          time: new Date(a.time).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: a.type,
          status: a.status,
          referenceNo: a.referenceNo ? `REC-${String(a.referenceNo).toString().padStart(6, '0')}` : null
        }));
        setRecentActivity(processedActivity);

        // Set statistics from backend
        setStats([
          { label: 'Total Applications', value: statistics.totalApplications.toString(), icon: FileText, color: 'text-blue-600' },
          { label: 'Approved Permits', value: statistics.approvedPermits.toString(), icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending Review', value: statistics.pendingPermits.toString(), icon: Clock, color: 'text-yellow-600' },
          { label: 'Active Permits', value: statistics.activePermits.toString(), icon: Building, color: 'text-purple-600' }
        ]);

      } catch (err) {
        console.error("Failed to load user profile", err);
        alert("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempUserInfo(userInfo);
  };

  const handleSave = async () => {
    try {
      // You can add API call here to update user info
      // const response = await fetch("http://localhost:8081/api/user/profile", {
      //   method: 'PUT',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tempUserInfo)
      // });

      setUserInfo(tempUserInfo);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error("Failed to save user profile", err);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setTempUserInfo(userInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempUserInfo(prev => ({ ...prev, [field]: value }));
  };

  // ===== NEW: view + download handlers =====
  const handleViewPermit = (permit) => {
    if (!permit.pickupFileUrl) {
      alert('No final document is available yet for this application. It will appear here once the office uploads it.');
      return;
    }
    setViewDocumentUrl(permit.pickupFileUrl);
    setViewDocumentTitle(`${permit.permitType} – ${permit.referenceNo}`);
    setViewModalOpen(true);
  };

  const handleDownloadPermit = (permitOrUrl) => {
    const url = typeof permitOrUrl === 'string'
      ? permitOrUrl
      : permitOrUrl?.pickupFileUrl;

    if (!url) {
      alert('No downloadable document is available yet for this application.');
      return;
    }

    // Simple: open in new tab; user can download from browser
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (['approved', 'active', 'completed', 'ready-for-pickup'].includes(statusLower)) {
      return 'bg-green-100 text-green-800';
    } else if (['pending', 'in-review', 'in-progress', 'requirements-completed'].includes(statusLower)) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'rejected') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (['approved', 'active', 'completed', 'ready-for-pickup'].includes(statusLower)) {
      return 'bg-green-500';
    } else if (['pending', 'in-review', 'in-progress', 'requirements-completed'].includes(statusLower)) {
      return 'bg-yellow-500';
    } else if (statusLower === 'rejected') {
      return 'bg-red-500';
    }
    return 'bg-blue-500';
  };

  const ProfileHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Settings size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <User size={32} className="text-white" />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1">{userInfo.name || 'Loading...'}</h2>
          {userInfo.memberSince && userInfo.memberSince !== 'N/A' && (
            <p className="text-blue-100">Member since {userInfo.memberSince}</p>
          )}
        </div>
      </div>
    </div>
  );

  const StatsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-gray-50`}>
              <stat.icon className={`${stat.color} w-6 h-6`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TabNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
      {[
        { id: 'overview', label: 'Overview' },
        { id: 'personal', label: 'Personal Info' },
        { id: 'permits', label: 'My Permits' },
        { id: 'settings', label: 'Settings' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const OverviewTab = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} />
          Recent Activity
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getStatusIcon(activity.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                  {activity.referenceNo && (
                    <p className="text-xs text-blue-600 font-mono mt-1">{activity.referenceNo}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-blue-600" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <a
            href="/Permits"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-all duration-200 text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Apply for New Permit
          </a>
          <a
            href="/Docutracker"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-all duration-200 text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Clock size={20} />
            Track Application Status
          </a>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
          <p className="text-sm text-blue-700 mb-3">
            Contact our support team for assistance with your applications.
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );

  const PersonalInfoTab = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 border-b pb-2">Personal Details</h4>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { field: 'name', label: 'Full Name', type: 'text', icon: User },
              { field: 'email', label: 'Email Address', type: 'email', icon: Mail },
              { field: 'phone', label: 'Phone Number', type: 'tel', icon: Phone },
              { field: 'address', label: 'Address', type: 'textarea', icon: MapPin, fullWidth: true }
            ].map(({ field, label, type, icon: Icon, fullWidth }) => (
              <div key={field} className={fullWidth ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Icon size={16} className="text-gray-500" />
                  {label}
                </label>
                {isEditing ? (
                  type === 'textarea' ? (
                    <textarea
                      value={tempUserInfo[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                      placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={type}
                      value={tempUserInfo[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                  )
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[42px] flex items-center">
                    {userInfo[field] || <span className="text-gray-400">Not provided</span>}
                  </p>
                )}
              </div>
            ))}
          </div>

          {(userInfo.businessName || isEditing) && (
            <>
              <h4 className="font-medium text-gray-900 border-b pb-2 mt-6">Business Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { field: 'businessName', label: 'Business Name', type: 'text', icon: Building },
                  { field: 'businessType', label: 'Business Type', type: 'text', icon: FileText },
                  { field: 'tinNumber', label: 'TIN Number', type: 'text', icon: FileText }
                ].map(({ field, label, type, icon: Icon }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Icon size={16} className="text-gray-500" />
                      {label}
                    </label>
                    {isEditing ? (
                      <input
                        type={type}
                        value={tempUserInfo[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[42px] flex items-center">
                        {userInfo[field] || <span className="text-gray-400">Not provided</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const PermitsTab = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Building className="text-blue-600" size={20} />
        My Permits & Applications
      </h3>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading permits...</p>
          </div>
        ) : permitHistory.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Permit Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference No.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Applied Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permitHistory.map((permit, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{permit.permitType}</div>
                    {permit.businessName && (
                      <div className="text-xs text-gray-500 mt-1">{permit.businessName}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      {permit.referenceNo}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(permit.status)}`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{permit.applicationDate}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                        onClick={() => handleViewPermit(permit)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                        title="Download"
                        onClick={() => handleDownloadPermit(permit)}
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-300 mb-3" size={64} />
            <p className="text-gray-500 text-lg font-medium">No permits found</p>
            <p className="text-gray-400 text-sm mt-2">Apply for your first permit to get started</p>
            <a
              href="/Permits"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Apply Now
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <div>
              <span className="text-gray-700 font-medium">Application Status Updates</span>
              <p className="text-sm text-gray-500">Receive notifications when your application status changes</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <div>
              <span className="text-gray-700 font-medium">Permit Renewal Reminders</span>
              <p className="text-sm text-gray-500">Get reminded before your permits expire</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <div>
              <span className="text-gray-700 font-medium">Email Notifications</span>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Privacy & Security
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Visible to municipal staff</option>
              <option value="private">Private - Only visible to you</option>
            </select>
          </div>

          <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg text-left transition-colors font-medium">
            🔒 Change Password
          </button>

          <button className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-3 rounded-lg text-left transition-colors font-medium">
            🔐 Enable Two-Factor Authentication
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Account Management</h3>
        <div className="space-y-3">
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-left transition-colors font-medium">
            📥 Download My Data
          </button>
          <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-3 rounded-lg text-left transition-colors font-medium">
            📧 Export Application History
          </button>
          <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg text-left transition-colors font-medium">
            🗑️ Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Uheader />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <ProfileHeader />
          <StatsGrid />
          <TabNavigation />

          <div className="transition-all duration-300">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'personal' && <PersonalInfoTab />}
            {activeTab === 'permits' && <PermitsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>

      {/* ===== NEW: View Document Modal ===== */}
      {viewModalOpen && viewDocumentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                  {viewDocumentTitle || 'Permit Document'}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Preview of your final document
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-2 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              {viewDocumentUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={viewDocumentUrl}
                  title="Permit Document"
                  className="w-full h-[70vh]"
                />
              ) : (
                <img
                  src={viewDocumentUrl}
                  alt="Permit Document"
                  className="max-h-[70vh] w-full object-contain bg-black"
                />
              )}
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button
                onClick={() => handleDownloadPermit(viewDocumentUrl)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <UFooter />
    </div>
  );
}
