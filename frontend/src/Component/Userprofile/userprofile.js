import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Settings, Bell, Shield, FileText,
  Clock, CheckCircle, AlertCircle, Building, Download, Eye
} from 'lucide-react';
import Uheader from'../Header/User_header'
import UFooter from '../Footer/User_Footer'
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

  // Calculate stats based on permit data
  const [stats, setStats] = useState([
    { label: 'Total Applications', value: '0', icon: FileText, color: 'text-blue-600' },
    { label: 'Approved Permits', value: '0', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending Review', value: '0', icon: Clock, color: 'text-yellow-600' },
    { label: 'Active Permits', value: '0', icon: Building, color: 'text-purple-600' }
  ]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Replace with your actual axios API call
        const response = await fetch("http://localhost:8081/api/user/profile", { 
          credentials: 'include'
        });
        const data = await response.json();
        const { userInfo: fetchedUserInfo, permits, recentActivity: fetchedActivity } = data;

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

        // Process permit history
        const processedPermits = permits.map(p => ({
          permitType: p.permitType,
          applicationDate: p.application_date,
          status: p.status,
          expiryDate: p.expiry_date || '2025-12-31',
          referenceNo: `BP-${String(p.referenceNo).padStart(6, '0')}`
        }));
        setPermitHistory(processedPermits);

        // Process recent activity
        const processedActivity = fetchedActivity.map(a => ({
          action: a.action,
          time: new Date(a.time).toLocaleDateString(),
          type: a.type,
          status: a.status,
          referenceNo: a.referenceNo ? `REF-${String(a.referenceNo).padStart(6, '0')}` : null
        }));
        setRecentActivity(processedActivity);

        // Calculate statistics
        const totalApplications = permits.length;
        const approvedPermits = permits.filter(p => p.status === 'Approved' || p.status === 'Active').length;
        const pendingPermits = permits.filter(p => p.status === 'Pending' || p.status === 'Under Review').length;
        const activePermits = permits.filter(p => p.status === 'Active').length;

        setStats([
          { label: 'Total Applications', value: totalApplications.toString(), icon: FileText, color: 'text-blue-600' },
          { label: 'Approved Permits', value: approvedPermits.toString(), icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending Review', value: pendingPermits.toString(), icon: Clock, color: 'text-yellow-600' },
          { label: 'Active Permits', value: activePermits.toString(), icon: Building, color: 'text-purple-600' }
        ]);

      } catch (err) {
        console.error("Failed to load user profile", err);
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
      // You can add API call here to save the updated user info
      // await axios.put("http://localhost:8081/api/user/profile", tempUserInfo, { withCredentials: true });
      setUserInfo(tempUserInfo);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save user profile", err);
    }
  };

  const handleCancel = () => {
    setTempUserInfo(userInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempUserInfo(prev => ({ ...prev, [field]: value }));
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
          {userInfo.memberSince && (
            <p className="text-blue-100">Member since {userInfo.memberSince}</p>
          )}
        </div>
      </div>
    </div>
  );

  const StatsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
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
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  activity.status === 'approved' || activity.status === 'completed' ? 'bg-green-500' :
                  activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                  {activity.referenceNo && (
                    <p className="text-xs text-blue-600 font-mono">{activity.referenceNo}</p>
                  )}
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-blue-600" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <a href="/Permits" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors duration-200 text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1">
            Apply for New Permit
          </a>
          <a href="/Docutracker" className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors duration-200 text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1">
            Track Application Status
          </a>
        </div>
      </div>
    </div>
  );

  const PersonalInfoTab = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
      <div className="max-w-md mx-auto">
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 border-b pb-2">Personal Details</h4>
          
          <div className="space-y-4">
            {[
              { field: 'name', label: 'Full Name', type: 'text' },
              { field: 'email', label: 'Email Address', type: 'email' },
              { field: 'phone', label: 'Phone Number', type: 'tel' },
              { field: 'address', label: 'Address', type: 'textarea' },
              { field: 'businessName', label: 'Business Name', type: 'text' },
              { field: 'businessType', label: 'Business Type', type: 'text' },
              { field: 'tinNumber', label: 'TIN Number', type: 'text' }
            ].map(({ field, label, type }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                {isEditing ? (
                  type === 'textarea' ? (
                    <textarea
                      value={tempUserInfo[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    />
                  ) : (
                    <input
                      type={type}
                      value={tempUserInfo[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {userInfo[field] || 'Not provided'}
                  </p>
                )}
              </div>
            ))}
          </div>
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
          <div className="text-center py-8">Loading permits...</div>
        ) : permitHistory.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Permit Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Reference No.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Expiry Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permitHistory.map((permit, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{permit.permitType}</div>
                    <div className="text-sm text-gray-500">Applied: {permit.applicationDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {permit.referenceNo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      permit.status === 'Active' || permit.status === 'Approved'
                        ? 'bg-green-100 text-green-800' 
                        : permit.status === 'Pending' || permit.status === 'Under Review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{permit.expiryDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">No permits found</div>
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
          <label className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">Application Status Updates</span>
              <p className="text-sm text-gray-500">Receive notifications when your application status changes</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="text-gray-700 font-medium">Permit Renewal Reminders</span>
              <p className="text-sm text-gray-500">Get reminded before your permits expire</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
          
          <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg text-left transition-colors">
            Change Password
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Account Management</h3>
        <div className="space-y-3">
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-left transition-colors">
            Download My Data
          </button>
          <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-3 rounded-lg text-left transition-colors">
            Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Uheader />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <ProfileHeader />
          <StatsGrid />
          <TabNavigation />
          
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'personal' && <PersonalInfoTab />}
          {activeTab === 'permits' && <PermitsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
      <UFooter />
    </div>
  );
}