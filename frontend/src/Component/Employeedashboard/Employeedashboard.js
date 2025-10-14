import React, { useState, useEffect } from 'react';
import {
  Search, Bell, User, FileText
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Header/Sidebar';
import {
  CedulaModalContent,
  ElectricalPermitModalContent,
  BusinessPermitModalContent,
  AttachRequirementsModal,
  // NEW:
  PlumbingPermitModalContent,
  ElectronicsPermitModalContent,
  BuildingPermitModalContent,
  FencingPermitModalContent
} from '../modals/ModalContents';

const API_BASE_URL = "http://localhost:8081";

export default function EmployeeDashboard() { 
  const [selectedTab, setSelectedTab] = useState('pending');
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupTarget, setPickupTarget] = useState(null);
  const [pickupSchedule, setPickupSchedule] = useState("");

  const [applications, setApplications] = useState({
    pending: [],
    inReview: [],
    inProgress: [],              
    requirementsCompleted: [],   
    approved: [],
    readyForPickup: [],
    rejected: []
  });

  const [electricalApplications, setElectricalApplications] = useState({
    pending: [],
    inReview: [],
    inProgress: [],               
    requirementsCompleted: [],    
    approved: [],
    readyForPickup: [],
    rejected: []
  });

  const [cedulaApplications, setCedulaApplications] = useState({
    pending: [],
    inReview: [],
    inProgress: [],              
    requirementsCompleted: [],   
    approved: [],
    readyForPickup: [],
    rejected: []
  });

  // NEW: 4 additional buckets
  const [plumbingApplications, setPlumbingApplications] = useState({
    pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
  });
  const [electronicsApplications, setElectronicsApplications] = useState({
    pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
  });
  const [buildingApplications, setBuildingApplications] = useState({
    pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
  });
  const [fencingApplications, setFencingApplications] = useState({
    pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
  });

  const navigate = useNavigate();
  
  const toggleExpandApplication = (id) => {
    setExpandedApplication(prev => (prev === id ? null : id));
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/userinfo`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch business applications (existing)
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const organizedData = {
          pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
        };
        
        response.data.applications.forEach(app => {
          switch(app.status) {
            case 'pending': organizedData.pending.push(app); break;
            case 'in-review': organizedData.inReview.push(app); break;
            case 'in-progress': organizedData.inProgress.push(app); break;
            case 'requirements-completed': organizedData.requirementsCompleted.push(app); break;
            case 'approved': organizedData.approved.push(app); break;
            case 'ready-for-pickup': organizedData.readyForPickup.push(app); break;
            case 'rejected': organizedData.rejected.push(app); break;
            default: organizedData.pending.push(app);
          }
        });
        setApplications(organizedData);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // for session parts --------------
  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        await fetchUserData();
        await fetchApplications();
        await fetchElectricalApplications();
        await fetchCedulaApplications();
        // NEW fetches:
        await fetchPlumbingApplications();
        await fetchElectronicsApplications();
        await fetchBuildingApplications();
        await fetchFencingApplications();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    } finally {
      setIsLoading(false);
    }
  }; 

  const handleNavigate = (tab) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    checkSession();
  }, []);
  //-----------------------------------

  //this part for fetching the application row records
  const getCurrentApplications = () => {
    return [
      ...applications[selectedTab],
      ...electricalApplications[selectedTab],
      ...cedulaApplications[selectedTab],
      // NEW merges:
      ...plumbingApplications[selectedTab],
      ...electronicsApplications[selectedTab],
      ...buildingApplications[selectedTab],
      ...fencingApplications[selectedTab]
    ];
  };

  //for electrical permits
  const fetchElectricalApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/electrical-applications`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const organizedElectricalData = {
          pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
        };
        
        response.data.applications.forEach(app => {
          const appWithType = { ...app, type: 'Electrical Permit' };
          switch (app.status) {
            case 'pending': organizedElectricalData.pending.push(appWithType); break;
            case 'in-review': organizedElectricalData.inReview.push(appWithType); break;
            case 'in-progress': organizedElectricalData.inProgress.push(appWithType); break;
            case 'requirements-completed': organizedElectricalData.requirementsCompleted.push(appWithType); break;
            case 'approved': organizedElectricalData.approved.push(appWithType); break;
            case 'ready-for-pickup': organizedElectricalData.readyForPickup.push(appWithType); break;
            case 'rejected': organizedElectricalData.rejected.push(appWithType); break;
            default: organizedElectricalData.pending.push(appWithType);
          }
        });
        setElectricalApplications(organizedElectricalData);
      }
    } catch (error) {
      console.error("Error fetching electrical applications:", error);
    }
  };

  // Fetch Cedula Applications
  const fetchCedulaApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cedula-applications`, {
        withCredentials: true
      });

      if (response.data.success) {
        const organizedCedulaData = {
          pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: []
        };

        response.data.applications.forEach(app => {
          const appWithType = {
            ...app,
            id: app.id || app.cedula_id,
            type: 'Cedula'
          };

          switch (app.application_status) {
            case 'pending': organizedCedulaData.pending.push(appWithType); break;
            case 'in-review': organizedCedulaData.inReview.push(appWithType); break;
            case 'in-progress': organizedCedulaData.inProgress.push(appWithType); break;
            case 'requirements-completed': organizedCedulaData.requirementsCompleted.push(appWithType); break;
            case 'approved': organizedCedulaData.approved.push(appWithType); break;
            case 'ready-for-pickup': organizedCedulaData.readyForPickup.push(appWithType); break;
            case 'rejected': organizedCedulaData.rejected.push(appWithType); break;
            default: organizedCedulaData.pending.push(appWithType);
          }
        });
        setCedulaApplications(organizedCedulaData);
      }
    } catch (error) {
      console.error("Error fetching cedula applications:", error);
    }
  };

  // NEW: Fetch Plumbing Applications
  const fetchPlumbingApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/plumbing-applications`, { withCredentials: true });
      if (res.data.success) {
        const data = { pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: [] };
        res.data.applications.forEach(app => {
          const item = { ...app, type: 'Plumbing Permit' };
          switch (app.status) {
            case 'pending': data.pending.push(item); break;
            case 'in-review': data.inReview.push(item); break;
            case 'in-progress': data.inProgress.push(item); break;
            case 'requirements-completed': data.requirementsCompleted.push(item); break;
            case 'approved': data.approved.push(item); break;
            case 'ready-for-pickup': data.readyForPickup.push(item); break;
            case 'rejected': data.rejected.push(item); break;
            default: data.pending.push(item);
          }
        });
        setPlumbingApplications(data);
      }
    } catch (e) {
      console.error('Error fetching plumbing applications:', e);
    }
  };

  // NEW: Fetch Electronics Applications
  const fetchElectronicsApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/electronics-applications`, { withCredentials: true });
      if (res.data.success) {
        const data = { pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: [] };
        res.data.applications.forEach(app => {
          const item = { ...app, type: 'Electronics Permit' };
          switch (app.status) {
            case 'pending': data.pending.push(item); break;
            case 'in-review': data.inReview.push(item); break;
            case 'in-progress': data.inProgress.push(item); break;
            case 'requirements-completed': data.requirementsCompleted.push(item); break;
            case 'approved': data.approved.push(item); break;
            case 'ready-for-pickup': data.readyForPickup.push(item); break;
            case 'rejected': data.rejected.push(item); break;
            default: data.pending.push(item);
          }
        });
        setElectronicsApplications(data);
      }
    } catch (e) {
      console.error('Error fetching electronics applications:', e);
    }
  };

  // NEW: Fetch Building Applications
  const fetchBuildingApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/building-applications`, { withCredentials: true });
      if (res.data.success) {
        const data = { pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: [] };
        res.data.applications.forEach(app => {
          const item = { ...app, type: 'Building Permit' };
          switch (app.status) {
            case 'pending': data.pending.push(item); break;
            case 'in-review': data.inReview.push(item); break;
            case 'in-progress': data.inProgress.push(item); break;
            case 'requirements-completed': data.requirementsCompleted.push(item); break;
            case 'approved': data.approved.push(item); break;
            case 'ready-for-pickup': data.readyForPickup.push(item); break;
            case 'rejected': data.rejected.push(item); break;
            default: data.pending.push(item);
          }
        });
        setBuildingApplications(data);
      }
    } catch (e) {
      console.error('Error fetching building applications:', e);
    }
  };

  // NEW: Fetch Fencing Applications
  const fetchFencingApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/fencing-applications`, { withCredentials: true });
      if (res.data.success) {
        const data = { pending: [], inReview: [], inProgress: [], requirementsCompleted: [], approved: [], readyForPickup: [], rejected: [] };
        res.data.applications.forEach(app => {
          const item = { ...app, type: 'Fencing Permit' };
          switch (app.status) {
            case 'pending': data.pending.push(item); break;
            case 'in-review': data.inReview.push(item); break;
            case 'in-progress': data.inProgress.push(item); break;
            case 'requirements-completed': data.requirementsCompleted.push(item); break;
            case 'approved': data.approved.push(item); break;
            case 'ready-for-pickup': data.readyForPickup.push(item); break;
            case 'rejected': data.rejected.push(item); break;
            default: data.pending.push(item);
          }
        });
        setFencingApplications(data);
      }
    } catch (e) {
      console.error('Error fetching fencing applications:', e);
    }
  };

  //-----------------------------------------

  // this section for open modal fetch data for the application 
  // for business permits
  const handleViewApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSelectedApplication(response.data.application);
        setModalVisible(true);
      } else {
        alert("Application not found.");
      }
    } catch (error) {
      console.error("Failed to fetch application info:", error);
    }
  };

  //for electrical permits
  const handleViewElectricalApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/electrical-applications/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSelectedApplication({ ...response.data.application, type: 'Electrical Permit' });
        setModalVisible(true);
      } else {
        alert("Electrical permit application not found.");
      }
    } catch (error) {
      console.error("Failed to fetch electrical application info:", error);
    }
  };

  // for cedula
  const handleViewCedulaApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cedula-applications/${id}`, {
        withCredentials: true,
      });

      if (response.data.success && response.data.application) {
        const cedula = response.data.application;

        const applicationData = {
          id: cedula.id,
          user_id: cedula.user_id,
          type: "Cedula",
          name: cedula.name,
          address: cedula.address,
          place_of_birth: cedula.place_of_birth,
          date_of_birth: cedula.date_of_birth,
          profession: cedula.profession,
          yearly_income: cedula.yearly_income,
          purpose: cedula.purpose,
          sex: cedula.sex,
          tin: cedula.tin,
          created_at: cedula.created_at,
          updated_at: cedula.updated_at,
          application_status: cedula.application_status,
          civil_status: cedula.status,
          email: cedula.email
        };

        setSelectedApplication(applicationData);
        setModalVisible(true);
      } else {
        alert("Cedula application not found.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch cedula application info:", error);
    }
  };

  // NEW: view handlers for 4 permits
  const handleViewPlumbingApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/plumbing-applications/${id}`, { withCredentials: true });
      if (res.data.success) {
        setSelectedApplication({ ...res.data.application, type: 'Plumbing Permit' });
        setModalVisible(true);
      } else {
        alert('Plumbing permit not found.');
      }
    } catch (e) { console.error('Failed to fetch plumbing application:', e); }
  };

  const handleViewElectronicsApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/electronics-applications/${id}`, { withCredentials: true });
      if (res.data.success) {
        setSelectedApplication({ ...res.data.application, type: 'Electronics Permit' });
        setModalVisible(true);
      } else {
        alert('Electronics permit not found.');
      }
    } catch (e) { console.error('Failed to fetch electronics application:', e); }
  };

  const handleViewBuildingApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/building-applications/${id}`, { withCredentials: true });
      if (res.data.success) {
        setSelectedApplication({ ...res.data.application, type: 'Building Permit' });
        setModalVisible(true);
      } else {
        alert('Building permit not found.');
      }
    } catch (e) { console.error('Failed to fetch building application:', e); }
  };

  const handleViewFencingApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/fencing-applications/${id}`, { withCredentials: true });
      if (res.data.success) {
        setSelectedApplication({ ...res.data.application, type: 'Fencing Permit' });
        setModalVisible(true);
      } else {
        alert('Fencing permit not found.');
      }
    } catch (e) { console.error('Failed to fetch fencing application:', e); }
  };

  //----------------------------------------------------------
  // this section for action on the application 
  const handleAcceptElectricalApplication = async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/electrical-applications/${id}/accept`, 
        { status: 'in-review' },
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchElectricalApplications();
      } else {
        alert("Failed to mark the electrical permit as in-review.");
      }
    } catch (err) {
      console.error("Accept electrical application error:", err);
    }
  };

  const handleAcceptApplication = async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/applications/${id}/accept`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        await fetchApplications();
      } else {
        alert("Failed to accept the application.");
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleAcceptCedulaApplication = async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/cedula-applications/${id}/accept`,
        { status: 'in-review' },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        await fetchCedulaApplications();
      } else {
        alert("Failed to move the cedula application to in-review.");
      }
    } catch (err) {
      console.error("Accept cedula application error:", err);
    }
  };

  // NEW: Accept for 4 permits
  const handleAcceptPlumbing = async (id) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/plumbing-applications/${id}/accept`, { status: 'in-review' }, { withCredentials: true });
      if (r.data.success) await fetchPlumbingApplications(); else alert('Failed to accept plumbing.');
    } catch (e) { console.error(e); }
  };
  const handleAcceptElectronics = async (id) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/electronics-applications/${id}/accept`, { status: 'in-review' }, { withCredentials: true });
      if (r.data.success) await fetchElectronicsApplications(); else alert('Failed to accept electronics.');
    } catch (e) { console.error(e); }
  };
  const handleAcceptBuilding = async (id) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/building-applications/${id}/accept`, { status: 'in-review' }, { withCredentials: true });
      if (r.data.success) await fetchBuildingApplications(); else alert('Failed to accept building.');
    } catch (e) { console.error(e); }
  };
  const handleAcceptFencing = async (id) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/fencing-applications/${id}/accept`, { status: 'in-review' }, { withCredentials: true });
      if (r.data.success) await fetchFencingApplications(); else alert('Failed to accept fencing.');
    } catch (e) { console.error(e); }
  };

  const handlePickupScheduleBusiness = async (applicationId, schedule) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/applications/set-pickup`, {
        applicationId,
        schedule
      }, { withCredentials: true });

      if (response.data.success) {
        await fetchApplications();
        alert("Business Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (err) {
      console.error("Business Pickup Error:", err);
    }
  };

  const handlePickupScheduleElectrical = async (applicationId, schedule) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/electrical-applications/set-pickup`, {
        applicationId,
        schedule
      }, { withCredentials: true });

      if (response.data.success) {
        await fetchElectricalApplications();
        alert("Electrical Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (err) {
      console.error("Electrical Pickup Error:", err);
    }
  };

  const handlePickupScheduleCedula = async (cedulaId, schedule) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/cedula/set-pickup`, {
        cedulaId,
        schedule
      }, { withCredentials: true });

      if (response.data.success) {
        await fetchCedulaApplications();
        alert("Cedula moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (err) {
      console.error("Cedula Pickup Error:", err);
    }
  };

  // NEW pickup schedulers
  const handlePickupSchedulePlumbing = async (applicationId, schedule) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/plumbing-applications/set-pickup`, { applicationId, schedule }, { withCredentials: true });
      if (r.data.success) { await fetchPlumbingApplications(); alert('Plumbing Permit moved to Ready for Pickup.'); } else alert('Failed to schedule pickup.');
    } catch (e) { console.error(e); }
  };
  const handlePickupScheduleElectronics = async (applicationId, schedule) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/electronics-applications/set-pickup`, { applicationId, schedule }, { withCredentials: true });
      if (r.data.success) { await fetchElectronicsApplications(); alert('Electronics Permit moved to Ready for Pickup.'); } else alert('Failed to schedule pickup.');
    } catch (e) { console.error(e); }
  };
  const handlePickupScheduleBuilding = async (applicationId, schedule) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/building-applications/set-pickup`, { applicationId, schedule }, { withCredentials: true });
      if (r.data.success) { await fetchBuildingApplications(); alert('Building Permit moved to Ready for Pickup.'); } else alert('Failed to schedule pickup.');
    } catch (e) { console.error(e); }
  };
  const handlePickupScheduleFencing = async (applicationId, schedule) => {
    try {
      const r = await axios.put(`${API_BASE_URL}/api/fencing-applications/set-pickup`, { applicationId, schedule }, { withCredentials: true });
      if (r.data.success) { await fetchFencingApplications(); alert('Fencing Permit moved to Ready for Pickup.'); } else alert('Failed to schedule pickup.');
    } catch (e) { console.error(e); }
  };

  return (
  <div className="flex h-screen bg-gray-100">
    {/* Sidebar Component */}
    <Sidebar 
      userData={userData} 
      onLogout={handleLogout} 
      isLoading={isLoading}
      onNavigate={handleNavigate}
    />

    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Application Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <Bell size={20} className="text-gray-600 cursor-pointer" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </div>
            <a 
              href="/Employeeprofile" 
              className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors"
            >
              <User size={16} />
              </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-t flex">
          {['pending', 'inReview', 'inProgress', 'requirementsCompleted', 'approved','readyForPickup', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium text-sm focus:outline-none ${
                selectedTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                tab === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                tab === 'inReview' ? 'bg-blue-100 text-blue-800' :
                tab === 'inProgress' ? 'bg-orange-100 text-orange-800' :
                tab === 'requirementsCompleted' ? 'bg-purple-100 text-purple-800' :
                tab === 'approved' ? 'bg-green-100 text-green-800' :
                tab === 'readyForPickup' ? 'bg-pink-100 text-pink-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {applications[tab].length 
                  + electricalApplications[tab].length 
                  + cedulaApplications[tab].length
                  + plumbingApplications[tab].length
                  + electronicsApplications[tab].length
                  + buildingApplications[tab].length
                  + fencingApplications[tab].length}
              </span>

            </button>
          ))}
        </div>
      </header>

      {/* Application Cards */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="grid grid-cols-1 gap-4">
          {getCurrentApplications().length > 0 ? (
            getCurrentApplications().map((application) => (
              <div key={`${(application.type || 'Electrical Permit').toLowerCase().replace(/\s+/g,'-')}-${application.id}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center cursor-pointer" onClick={() => toggleExpandApplication(application.id)}>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{application.name || application.applicant_name}</h3>
                      <p className="text-sm text-gray-500">
                        {application.type || 'Electrical Permit'} • Submitted on {new Date(application.submitted || application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        const appId = application.id || application.cedula_id;
                        if (application.type === 'Electrical Permit') {
                          handleViewElectricalApplication(appId);
                        } else if (application.type === 'Cedula') {
                          handleViewCedulaApplication(appId); 
                        } else if (application.type === 'Plumbing Permit') {
                          handleViewPlumbingApplication(appId);
                        } else if (application.type === 'Electronics Permit') {
                          handleViewElectronicsApplication(appId);
                        } else if (application.type === 'Building Permit') {
                          handleViewBuildingApplication(appId);
                        } else if (application.type === 'Fencing Permit') {
                          handleViewFencingApplication(appId);
                        } else {
                          handleViewApplication(appId);
                        }
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View Info
                    </button>

                    {(application.status === "pending" || application.application_status === "pending") && (
                      <button
                        onClick={() => {
                          if (application.type === 'Electrical Permit') {
                            handleAcceptElectricalApplication(application.id);
                          } else if (application.type === 'Cedula') {
                            handleAcceptCedulaApplication(application.id);
                          } else if (application.type === 'Plumbing Permit') {
                            handleAcceptPlumbing(application.id);
                          } else if (application.type === 'Electronics Permit') {
                            handleAcceptElectronics(application.id);
                          } else if (application.type === 'Building Permit') {
                            handleAcceptBuilding(application.id);
                          } else if (application.type === 'Fencing Permit') {
                            handleAcceptFencing(application.id);
                          } else {
                            handleAcceptApplication(application.id);
                          }
                        }}
                        className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        Accept
                      </button>
                    )}

                    {/* Attach Requirements - only for in-review */}
                    {(application.status === "in-review" || application.application_status === "in-review") && (
                      <button
                        onClick={() => setShowAttachModal(true)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Attach Requirements
                      </button>
                    )}

                    {(application.status === "in-review" || application.application_status === "in-review") && (
                      <button
                        onClick={async () => {
                          const appId = application.id || application.cedula_id;

                          try {
                            let response;
                            if (application.type === 'Electrical Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/electrical-applications/move-to-inprogress`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Cedula') {
                              response = await axios.put(`${API_BASE_URL}/api/cedula/move-to-inprogress`, {
                                id: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Plumbing Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/plumbing-applications/move-to-inprogress`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Electronics Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/electronics-applications/move-to-inprogress`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Building Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/building-applications/move-to-inprogress`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Fencing Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/fencing-applications/move-to-inprogress`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else {
                              response = await axios.put(`${API_BASE_URL}/api/applications/move-to-inprogress`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            }

                            if (response.data.success) {
                              await fetchApplications();
                              await fetchElectricalApplications();
                              await fetchCedulaApplications();
                              await fetchPlumbingApplications();
                              await fetchElectronicsApplications();
                              await fetchBuildingApplications();
                              await fetchFencingApplications();
                              alert("Moved to in-progress successfully.");
                            } else {
                              alert("Failed to update status.");
                            }
                          } catch (err) {
                            console.error("Error:", err);
                            alert("Server error.");
                          }
                        }}
                        className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        Done Attached Requirements
                      </button>
                    )}

                    {(application.status === "in-progress" || application.application_status === "in-progress") && (
                      <button
                        onClick={async () => {
                          const appId = application.id || application.cedula_id;

                          try {
                            let response;
                            if (application.type === 'Electrical Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/electrical-applications/move-to-requirements-completed`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Cedula') {
                              response = await axios.put(`${API_BASE_URL}/api/cedula/move-to-requirements-completed`, {
                                id: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Plumbing Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/plumbing-applications/move-to-requirements-completed`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Electronics Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/electronics-applications/move-to-requirements-completed`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Building Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/building-applications/move-to-requirements-completed`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Fencing Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/fencing-applications/move-to-requirements-completed`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else {
                              response = await axios.put(`${API_BASE_URL}/api/applications/move-to-requirements-completed`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            }

                            if (response.data.success) {
                              await fetchApplications();
                              await fetchElectricalApplications();
                              await fetchCedulaApplications();
                              await fetchPlumbingApplications();
                              await fetchElectronicsApplications();
                              await fetchBuildingApplications();
                              await fetchFencingApplications();
                              alert("Moved to requirements-completed successfully.");
                            } else {
                              alert("Failed to update status.");
                            }
                          } catch (err) {
                            console.error("Error:", err);
                            alert("Server error.");
                          }
                        }}
                        className="text-sm px-3 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                      >
                        Complete Requirements
                      </button>
                    )}

                    {(application.status === "requirements-completed" || application.application_status === "requirements-completed") && (
                      <button
                        onClick={async () => {
                          const appId = application.id || application.cedula_id;

                          try {
                            let response;
                            if (application.type === 'Electrical Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/electrical-applications/move-to-approved`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Cedula') {
                              response = await axios.put(`${API_BASE_URL}/api/cedula/move-to-approved`, {
                                id: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Plumbing Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/plumbing-applications/move-to-approved`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Electronics Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/electronics-applications/move-to-approved`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Building Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/building-applications/move-to-approved`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else if (application.type === 'Fencing Permit') {
                              response = await axios.put(`${API_BASE_URL}/api/fencing-applications/move-to-approved`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            } else {
                              response = await axios.put(`${API_BASE_URL}/api/applications/move-to-approved`, {
                                applicationId: appId
                              }, { withCredentials: true });
                            }

                            if (response.data.success) {
                              await fetchApplications();
                              await fetchElectricalApplications();
                              await fetchCedulaApplications();
                              await fetchPlumbingApplications();
                              await fetchElectronicsApplications();
                              await fetchBuildingApplications();
                              await fetchFencingApplications();
                              alert("Application approved successfully.");
                            } else {
                              alert("Failed to approve application.");
                            }
                          } catch (err) {
                            console.error("Error approving application:", err);
                            alert("Server error.");
                          }
                        }}
                        className="text-sm px-3 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300"
                      >
                        Approve
                      </button>
                    )}

                    {(application.status === "approved" || application.application_status === "approved") && (
                      <button
                        onClick={() => {
                          setPickupTarget(application);
                          setShowPickupModal(true);
                        }}
                        className="text-sm px-3 py-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200"
                      >
                        Set Pickup Schedule
                      </button>
                    )}

                  </div>
                </div>
                {expandedApplication === application.id && (
                  <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
                    <p><strong>Type:</strong> {application.type || 'Electrical Permit'}</p>
                    <p><strong>Submitted:</strong> {new Date(application.submitted || application.created_at).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {application.status}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              No applications found in this category.
            </div>
          )}
          
          {/* Improved Modal */}
          {modalVisible && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                  <button
                    className="absolute top-4 right-4 text-white hover:text-red-300 text-2xl font-bold transition-colors"
                    onClick={() => setModalVisible(false)}
                  >
                    ×
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedApplication?.type === 'Electrical Permit' ? 'Electrical Permit Application' : 
                         selectedApplication?.type === 'Cedula' ? 'Cedula Application' : 
                         selectedApplication?.type === 'Plumbing Permit' ? 'Plumbing Permit Application' :
                         selectedApplication?.type === 'Electronics Permit' ? 'Electronics Permit Application' :
                         selectedApplication?.type === 'Building Permit' ? 'Building Permit Application' :
                         selectedApplication?.type === 'Fencing Permit' ? 'Fencing Permit Application' :
                         'Business Permit Application'}
                      </h2>
                      <p className="text-blue-100">Application Details & Information</p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedApplication.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedApplication.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedApplication.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      Status: {selectedApplication.status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>

                  {/* Dynamic Content */}
                  {selectedApplication?.type === "Cedula" ? (
                    <CedulaModalContent selectedApplication={selectedApplication} />
                  ) : selectedApplication?.type === "Electrical Permit" ? (
                    <ElectricalPermitModalContent selectedApplication={selectedApplication} />
                  ) : selectedApplication?.type === "Plumbing Permit" ? (
                    <PlumbingPermitModalContent selectedApplication={selectedApplication} />
                  ) : selectedApplication?.type === "Electronics Permit" ? (
                    <ElectronicsPermitModalContent selectedApplication={selectedApplication} />
                  ) : selectedApplication?.type === "Building Permit" ? (
                    <BuildingPermitModalContent selectedApplication={selectedApplication} />
                  ) : selectedApplication?.type === "Fencing Permit" ? (
                    <FencingPermitModalContent selectedApplication={selectedApplication} />
                  ) : (
                    <BusinessPermitModalContent selectedApplication={selectedApplication} />
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setModalVisible(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPickupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Set Pickup Schedule</h2>
                <input
                  type="datetime-local"
                  value={pickupSchedule}
                  onChange={(e) => setPickupSchedule(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => {
                    setShowPickupModal(false);
                    setPickupTarget(null);
                    setPickupSchedule("");
                  }} className="px-4 py-2 bg-gray-300 rounded">
                    Cancel
                  </button>
                  <button onClick={async () => {
                    if (!pickupSchedule) return alert("Please select a schedule");

                    if (pickupTarget.type === 'Electrical Permit') {
                      await handlePickupScheduleElectrical(pickupTarget.id, pickupSchedule);
                    } else if (pickupTarget.type === 'Cedula') {
                      await handlePickupScheduleCedula(pickupTarget.id, pickupSchedule);
                    } else if (pickupTarget.type === 'Plumbing Permit') {
                      await handlePickupSchedulePlumbing(pickupTarget.id, pickupSchedule);
                    } else if (pickupTarget.type === 'Electronics Permit') {
                      await handlePickupScheduleElectronics(pickupTarget.id, pickupSchedule);
                    } else if (pickupTarget.type === 'Building Permit') {
                      await handlePickupScheduleBuilding(pickupTarget.id, pickupSchedule);
                    } else if (pickupTarget.type === 'Fencing Permit') {
                      await handlePickupScheduleFencing(pickupTarget.id, pickupSchedule);
                    } else {
                      await handlePickupScheduleBusiness(pickupTarget.id, pickupSchedule);
                    }

                    setShowPickupModal(false);
                    setPickupTarget(null);
                    setPickupSchedule("");
                  }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAttachModal && <AttachRequirementsModal onClose={() => setShowAttachModal(false)} />}
        </div>
      </main>
    </div>
  </div>
  );
}
