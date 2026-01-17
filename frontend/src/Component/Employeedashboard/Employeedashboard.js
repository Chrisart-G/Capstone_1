import React, { useState, useEffect } from "react";
import { Search, Bell, User, FileText } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Header/Sidebar";
import {
  CedulaModalContent,
  ElectricalPermitModalContent,
  BusinessPermitModalContent,
  PlumbingPermitModalContent,
  ElectronicsPermitModalContent,
  BuildingPermitModalContent,
  FencingPermitModalContent,
} from "../modals/ModalContents";
import AttachRequirementFromLibraryModal from "../modals/AttachRequirementFromLibraryModal";

const API_BASE_URL = "http://localhost:8081";

const makeInitialBuckets = () => ({
  pending: [],
  inReview: [],
  onHold: [],
  inProgress: [],
  requirementsCompleted: [],
  approved: [],
  pickupDocument: [],
  readyForPickup: [],
  rejected: [],
});

export default function EmployeeDashboard() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeRowKey, setActiveRowKey] = useState(null);

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupFile, setPickupFile] = useState(null);
  const [pickupTarget, setPickupTarget] = useState(null);
  const [pickupSchedule, setPickupSchedule] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachTarget, setAttachTarget] = useState({
    applicationType: "",
    applicationId: null,
  });

  // confirmation dialog state (replaces window.confirm)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // NEW: modal for “Move From On Hold”
  const [onHoldModalOpen, setOnHoldModalOpen] = useState(false);
  const [onHoldModalApp, setOnHoldModalApp] = useState(null);

  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  // includes business permits
  const [applications, setApplications] = useState(makeInitialBuckets);
  const [electricalApplications, setElectricalApplications] =
    useState(makeInitialBuckets);
  const [cedulaApplications, setCedulaApplications] =
    useState(makeInitialBuckets);

  // 4 additional buckets
  const [plumbingApplications, setPlumbingApplications] =
    useState(makeInitialBuckets);
  const [electronicsApplications, setElectronicsApplications] =
    useState(makeInitialBuckets);
  const [buildingApplications, setBuildingApplications] =
    useState(makeInitialBuckets);
  const [fencingApplications, setFencingApplications] =
    useState(makeInitialBuckets);

  const navigate = useNavigate();

  const toggleExpandApplication = (id) => {
    setExpandedApplication((prev) => (prev === id ? null : id));
  };

  const typeToArchiveSlug = (typeLabel = "") => {
    const t = (typeLabel || "").toLowerCase();
    if (t.includes("business")) return "business";
    if (t.includes("electrical")) return "electrical";
    if (t.includes("plumbing")) return "plumbing";
    if (t.includes("electronics")) return "electronics";
    if (t.includes("building")) return "building";
    if (t.includes("fencing")) return "fencing";
    if (t.includes("cedula")) return "cedula";
    return "other";
  };

  const getApplicationKey = (app) => {
    const type = (app.type || "Electrical Permit").toLowerCase().replace(/\s+/g, "-");
    const id = app.id || app.cedula_id;
    return `${type}-${id}`;
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/userinfo`, {
        withCredentials: true,
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

  // Fetch business applications
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const organizedData = makeInitialBuckets();

        response.data.applications.forEach((app) => {
          switch (app.status) {
            case "pending":
              organizedData.pending.push(app);
              break;
            case "in-review":
              organizedData.inReview.push(app);
              break;
            case "on-hold":
              organizedData.onHold.push(app);
              break;
            case "in-progress":
              organizedData.inProgress.push(app);
              break;
            case "requirements-completed":
              organizedData.requirementsCompleted.push(app);
              break;
            case "approved":
              organizedData.approved.push(app);
              break;
            case "pickup-document":
              organizedData.pickupDocument.push(app);
              break;
            case "ready-for-pickup":
              organizedData.readyForPickup.push(app);
              break;
            case "rejected":
              organizedData.rejected.push(app);
              break;
            default:
              organizedData.pending.push(app);
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
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        await fetchUserData();
        await fetchApplications();
        await fetchElectricalApplications();
        await fetchCedulaApplications();
        await fetchPlumbingApplications();
        await fetchElectronicsApplications();
        await fetchBuildingApplications();
        await fetchFencingApplications();
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      navigate("/");
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

  const getCurrentApplications = () => {
    return [
      ...applications[selectedTab],
      ...electricalApplications[selectedTab],
      ...cedulaApplications[selectedTab],
      ...plumbingApplications[selectedTab],
      ...electronicsApplications[selectedTab],
      ...buildingApplications[selectedTab],
      ...fencingApplications[selectedTab],
    ];
  };

  //for electrical permits
  const fetchElectricalApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/electrical-applications`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const organizedElectricalData = makeInitialBuckets();

        response.data.applications.forEach((app) => {
          const appWithType = { ...app, type: "Electrical Permit" };
          switch (app.status) {
            case "pending":
              organizedElectricalData.pending.push(appWithType);
              break;
            case "in-review":
              organizedElectricalData.inReview.push(appWithType);
              break;
            case "on-hold":
              organizedElectricalData.onHold.push(appWithType);
              break;
            case "in-progress":
              organizedElectricalData.inProgress.push(appWithType);
              break;
            case "requirements-completed":
              organizedElectricalData.requirementsCompleted.push(appWithType);
              break;
            case "approved":
              organizedElectricalData.approved.push(appWithType);
              break;
            case "pickup-document":
              organizedElectricalData.pickupDocument.push(appWithType);
              break;
            case "ready-for-pickup":
              organizedElectricalData.readyForPickup.push(appWithType);
              break;
            case "rejected":
              organizedElectricalData.rejected.push(appWithType);
              break;
            default:
              organizedElectricalData.pending.push(appWithType);
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
        withCredentials: true,
      });

      if (response.data.success) {
        const organizedCedulaData = makeInitialBuckets();

        response.data.applications.forEach((app) => {
          const appWithType = {
            ...app,
            id: app.id || app.cedula_id,
            type: "Cedula",
          };

          switch (app.application_status) {
            case "pending":
              organizedCedulaData.pending.push(appWithType);
              break;
            case "in-review":
              organizedCedulaData.inReview.push(appWithType);
              break;
            case "on-hold":
              organizedCedulaData.onHold.push(appWithType);
              break;
            case "in-progress":
              organizedCedulaData.inProgress.push(appWithType);
              break;
            case "requirements-completed":
              organizedCedulaData.requirementsCompleted.push(appWithType);
              break;
            case "approved":
              organizedCedulaData.approved.push(appWithType);
              break;
            case "pickup-document":
              organizedCedulaData.pickupDocument.push(appWithType);
              break;
            case "ready-for-pickup":
              organizedCedulaData.readyForPickup.push(appWithType);
              break;
            case "rejected":
              organizedCedulaData.rejected.push(appWithType);
              break;
            default:
              organizedCedulaData.pending.push(appWithType);
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
      const res = await axios.get(`${API_BASE_URL}/api/plumbing-applications`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const data = makeInitialBuckets();
        res.data.applications.forEach((app) => {
          const item = { ...app, type: "Plumbing Permit" };
          switch (app.status) {
            case "pending":
              data.pending.push(item);
              break;
            case "in-review":
              data.inReview.push(item);
              break;
            case "on-hold":
              data.onHold.push(item);
              break;
            case "in-progress":
              data.inProgress.push(item);
              break;
            case "requirements-completed":
              data.requirementsCompleted.push(item);
              break;
            case "approved":
              data.approved.push(item);
              break;
            case "pickup-document":
              data.pickupDocument.push(item);
              break;
            case "ready-for-pickup":
              data.readyForPickup.push(item);
              break;
            case "rejected":
              data.rejected.push(item);
              break;
            default:
              data.pending.push(item);
          }
        });
        setPlumbingApplications(data);
      }
    } catch (e) {
      console.error("Error fetching plumbing applications:", e);
    }
  };

  // NEW: Fetch Electronics Applications
  const fetchElectronicsApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/electronics-applications`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const data = makeInitialBuckets();
        res.data.applications.forEach((app) => {
          const item = { ...app, type: "Electronics Permit" };
          switch (app.status) {
            case "pending":
              data.pending.push(item);
              break;
            case "in-review":
              data.inReview.push(item);
              break;
            case "on-hold":
              data.onHold.push(item);
              break;
            case "in-progress":
              data.inProgress.push(item);
              break;
            case "requirements-completed":
              data.requirementsCompleted.push(item);
              break;
            case "approved":
              data.approved.push(item);
              break;
            case "pickup-document":
              data.pickupDocument.push(item);
              break;
            case "ready-for-pickup":
              data.readyForPickup.push(item);
              break;
            case "rejected":
              data.rejected.push(item);
              break;
            default:
              data.pending.push(item);
          }
        });
        setElectronicsApplications(data);
      }
    } catch (e) {
      console.error("Error fetching electronics applications:", e);
    }
  };

  // NEW: Fetch Building Applications
  const fetchBuildingApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/building-applications`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const data = makeInitialBuckets();
        res.data.applications.forEach((app) => {
          const item = { ...app, type: "Building Permit" };
          switch (app.status) {
            case "pending":
              data.pending.push(item);
              break;
            case "in-review":
              data.inReview.push(item);
              break;
            case "on-hold":
              data.onHold.push(item);
              break;
            case "in-progress":
              data.inProgress.push(item);
              break;
            case "requirements-completed":
              data.requirementsCompleted.push(item);
              break;
            case "approved":
              data.approved.push(item);
              break;
            case "pickup-document":
              data.pickupDocument.push(item);
              break;
            case "ready-for-pickup":
              data.readyForPickup.push(item);
              break;
            case "rejected":
              data.rejected.push(item);
              break;
            default:
              data.pending.push(item);
          }
        });
        setBuildingApplications(data);
      }
    } catch (e) {
      console.error("Error fetching building applications:", e);
    }
  };

  // NEW: Fetch Fencing Applications
  const fetchFencingApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/fencing-applications`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const data = makeInitialBuckets();
        res.data.applications.forEach((app) => {
          const item = { ...app, type: "Fencing Permit" };
          switch (app.status) {
            case "pending":
              data.pending.push(item);
              break;
            case "in-review":
              data.inReview.push(item);
              break;
            case "on-hold":
              data.onHold.push(item);
              break;
            case "in-progress":
              data.inProgress.push(item);
              break;
            case "requirements-completed":
              data.requirementsCompleted.push(item);
              break;
            case "approved":
              data.approved.push(item);
              break;
            case "pickup-document":
              data.pickupDocument.push(item);
              break;
            case "ready-for-pickup":
              data.readyForPickup.push(item);
              break;
            case "rejected":
              data.rejected.push(item);
              break;
            default:
              data.pending.push(item);
          }
        });
        setFencingApplications(data);
      }
    } catch (e) {
      console.error("Error fetching fencing applications:", e);
    }
  };

  //-----------------------------------------
  // VIEW handlers – set selectedApplication (no modal)
  // business permits
  const handleViewApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/applications/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSelectedApplication(response.data.application);
      } else {
        alert("Application not found.");
      }
    } catch (error) {
      console.error("Failed to fetch application info:", error);
    }
  };

  // electrical
  const handleViewElectricalApplication = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/electrical-applications/${id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSelectedApplication({
          ...response.data.application,
          type: "Electrical Permit",
        });
      } else {
        alert("Electrical permit application not found.");
      }
    } catch (error) {
      console.error("Failed to fetch electrical application info:", error);
    }
  };

  // cedula
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
          email: cedula.email,
        };

        setSelectedApplication(applicationData);
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
      const res = await axios.get(`${API_BASE_URL}/api/plumbing-applications/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSelectedApplication({
          ...res.data.application,
          type: "Plumbing Permit",
        });
      } else {
        alert("Plumbing permit not found.");
      }
    } catch (e) {
      console.error("Failed to fetch plumbing application:", e);
    }
  };

  const handleViewElectronicsApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/electronics-applications/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSelectedApplication({
          ...res.data.application,
          type: "Electronics Permit",
        });
      } else {
        alert("Electronics permit not found.");
      }
    } catch (e) {
      console.error("Failed to fetch electronics application:", e);
    }
  };

  const handleViewBuildingApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/building-applications/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSelectedApplication({
          ...res.data.application,
          type: "Building Permit",
        });
      } else {
        alert("Building permit not found.");
      }
    } catch (e) {
      console.error("Failed to fetch building application:", e);
    }
  };

  const handleViewFencingApplication = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/fencing-applications/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setSelectedApplication({
          ...res.data.application,
          type: "Fencing Permit",
        });
      } else {
        alert("Fencing permit not found.");
      }
    } catch (e) {
      console.error("Failed to fetch fencing application:", e);
    }
  };

  //----------------------------------------------------------
  // ACTION handlers (from old code)

  const handleAcceptElectricalApplication = async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/electrical-applications/${id}/accept`,
        { status: "in-review" },
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
      const response = await axios.put(
        `${API_BASE_URL}/api/applications/${id}/accept`,
        {},
        { withCredentials: true }
      );

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
        { status: "in-review" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
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
      const r = await axios.put(
        `${API_BASE_URL}/api/plumbing-applications/${id}/accept`,
        { status: "in-review" },
        { withCredentials: true }
      );
      if (r.data.success) await fetchPlumbingApplications();
      else alert("Failed to accept plumbing.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptElectronics = async (id) => {
    try {
      const r = await axios.put(
        `${API_BASE_URL}/api/electronics-applications/${id}/accept`,
        { status: "in-review" },
        { withCredentials: true }
      );
      if (r.data.success) await fetchElectronicsApplications();
      else alert("Failed to accept electronics.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptBuilding = async (id) => {
    try {
      const r = await axios.put(
        `${API_BASE_URL}/api/building-applications/${id}/accept`,
        { status: "in-review" },
        { withCredentials: true }
      );
      if (r.data.success) await fetchBuildingApplications();
      else alert("Failed to accept building.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptFencing = async (id) => {
    try {
      const r = await axios.put(
        `${API_BASE_URL}/api/fencing-applications/${id}/accept`,
        { status: "in-review" },
        { withCredentials: true }
      );
      if (r.data.success) await fetchFencingApplications();
      else alert("Failed to accept fencing.");
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickupScheduleBusiness = async (applicationId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("applicationId", applicationId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const response = await axios.put(`${API_BASE_URL}/api/applications/set-pickup`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        await fetchApplications();
        alert("Business Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (err) {
      console.error("Business Pickup Error:", err);
      alert("Server error while scheduling pickup.");
    }
  };

  const handlePickupScheduleElectrical = async (applicationId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("applicationId", applicationId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const response = await axios.put(
        `${API_BASE_URL}/api/electrical-applications/set-pickup`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        await fetchElectricalApplications();
        alert("Electrical Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (err) {
      console.error("Electrical Pickup Error:", err);
      alert("Server error while scheduling pickup.");
    }
  };

  const handlePickupScheduleCedula = async (cedulaId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("cedulaId", cedulaId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const response = await axios.put(`${API_BASE_URL}/api/cedula/set-pickup`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        await fetchCedulaApplications();
        alert("Cedula moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (err) {
      console.error("Cedula Pickup Error:", err);
      alert("Server error while scheduling pickup.");
    }
  };

  // NEW pickup schedulers
  const handlePickupSchedulePlumbing = async (applicationId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("applicationId", applicationId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const r = await axios.put(`${API_BASE_URL}/api/plumbing-applications/set-pickup`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (r.data.success) {
        await fetchPlumbingApplications();
        alert("Plumbing Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (e) {
      console.error("Plumbing Pickup Error:", e);
      alert("Server error while scheduling pickup.");
    }
  };

  const handlePickupScheduleElectronics = async (applicationId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("applicationId", applicationId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const r = await axios.put(`${API_BASE_URL}/api/electronics-applications/set-pickup`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (r.data.success) {
        await fetchElectronicsApplications();
        alert("Electronics Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (e) {
      console.error("Electronics Pickup Error:", e);
      alert("Server error while scheduling pickup.");
    }
  };

  const handlePickupScheduleBuilding = async (applicationId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("applicationId", applicationId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const r = await axios.put(`${API_BASE_URL}/api/building-applications/set-pickup`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (r.data.success) {
        await fetchBuildingApplications();
        alert("Building Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (e) {
      console.error("Building Pickup Error:", e);
      alert("Server error while scheduling pickup.");
    }
  };

  const handlePickupScheduleFencing = async (applicationId, schedule, file) => {
    try {
      const form = new FormData();
      form.append("applicationId", applicationId);
      form.append("schedule", schedule);
      if (file) form.append("pickup_file", file);

      const r = await axios.put(`${API_BASE_URL}/api/fencing-applications/set-pickup`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (r.data.success) {
        await fetchFencingApplications();
        alert("Fencing Permit moved to Ready for Pickup.");
      } else {
        alert("Failed to schedule pickup.");
      }
    } catch (e) {
      console.error("Fencing Pickup Error:", e);
      alert("Server error while scheduling pickup.");
    }
  };

  const handleMarkAsPickedUp = async (application) => {
    try {
      const appId = application.id || application.cedula_id;
      if (!appId) {
        alert("Missing application ID.");
        return;
      }

      const label = application.type || "Document";
      const slug = typeToArchiveSlug(label);
      const applicantName = application.name || application.applicant_name || "N/A";

      const res = await axios.post(
        `${API_BASE_URL}/api/employee/archive/mark-picked-up`,
        {
          applicationType: slug,
          applicationId: appId,
          documentType: label,
          applicantName,
        },
        { withCredentials: true }
      );

      if (res.data && res.data.success) {
        alert("Marked as picked up and moved to Archives.");

        await Promise.all([
          fetchApplications(),
          fetchElectricalApplications(),
          fetchCedulaApplications(),
          fetchPlumbingApplications(),
          fetchElectronicsApplications(),
          fetchBuildingApplications(),
          fetchFencingApplications(),
        ]);
      } else {
        alert(res.data.message || "Failed to archive application.");
      }
    } catch (err) {
      console.error("Mark-as-picked-up error:", err);
      alert("Server error while moving to archive.");
    }
  };

  const handleMoveToOnHold = async (application) => {
    try {
      const appId = application.id || application.cedula_id;
      if (!appId) {
        alert("Missing application ID.");
        return;
      }

      let url = "";
      let payload = {};

      if (application.type === "Electrical Permit") {
        url = `${API_BASE_URL}/api/electrical-applications/move-to-onhold`;
        payload = { applicationId: appId };
      } else if (application.type === "Cedula") {
        url = `${API_BASE_URL}/api/cedula-applications/${appId}/accept`;
        payload = { status: "on-hold" };
      } else if (application.type === "Plumbing Permit") {
        url = `${API_BASE_URL}/api/plumbing-applications/move-to-onhold`;
        payload = { applicationId: appId };
      } else if (application.type === "Electronics Permit") {
        url = `${API_BASE_URL}/api/electronics-applications/move-to-onhold`;
        payload = { applicationId: appId };
      } else if (application.type === "Building Permit") {
        url = `${API_BASE_URL}/api/building-applications/move-to-onhold`;
        payload = { applicationId: appId };
      } else if (application.type === "Fencing Permit") {
        url = `${API_BASE_URL}/api/fencing-applications/move-to-onhold`;
        payload = { applicationId: appId };
      } else {
        url = `${API_BASE_URL}/api/applications/move-to-onhold`;
        payload = { applicationId: appId };
      }

      const res = await axios.put(url, payload, { withCredentials: true });
      if (res.data && res.data.success) {
        await Promise.all([
          fetchApplications(),
          fetchElectricalApplications(),
          fetchCedulaApplications(),
          fetchPlumbingApplications(),
          fetchElectronicsApplications(),
          fetchBuildingApplications(),
          fetchFencingApplications(),
        ]);
        alert("Application moved to On Hold.");
      } else {
        alert(res.data.message || "Failed to move application to On Hold.");
      }
    } catch (err) {
      console.error("Move-to-on-hold error:", err);
      alert("Server error while moving to On Hold.");
    }
  };

  // NEW: Move to PICKUP-DOCUMENT for any application type
  const handleMoveToPickupDocument = async (application) => {
    try {
      const appId = application.id || application.cedula_id;
      if (!appId) {
        alert("Missing application ID.");
        return;
      }

      let url = "";
      let payload = {};

      if (application.type === "Electrical Permit") {
        url = `${API_BASE_URL}/api/electrical-applications/move-to-pickup-document`;
        payload = { applicationId: appId };
      } else if (application.type === "Cedula") {
        url = `${API_BASE_URL}/api/cedula-applications/${appId}/accept`;
        payload = { status: "pickup-document" };
      } else if (application.type === "Plumbing Permit") {
        url = `${API_BASE_URL}/api/plumbing-applications/move-to-pickup-document`;
        payload = { applicationId: appId };
      } else if (application.type === "Electronics Permit") {
        url = `${API_BASE_URL}/api/electronics-applications/move-to-pickup-document`;
        payload = { applicationId: appId };
      } else if (application.type === "Building Permit") {
        url = `${API_BASE_URL}/api/building-applications/move-to-pickup-document`;
        payload = { applicationId: appId };
      } else if (application.type === "Fencing Permit") {
        url = `${API_BASE_URL}/api/fencing-applications/move-to-pickup-document`;
        payload = { applicationId: appId };
      } else {
        url = `${API_BASE_URL}/api/applications/move-to-pickup-document`;
        payload = { applicationId: appId };
      }

      const res = await axios.put(url, payload, { withCredentials: true });
      if (res.data && res.data.success) {
        await Promise.all([
          fetchApplications(),
          fetchElectricalApplications(),
          fetchCedulaApplications(),
          fetchPlumbingApplications(),
          fetchElectronicsApplications(),
          fetchBuildingApplications(),
          fetchFencingApplications(),
        ]);
        alert("Application moved to Pickup Document status.");
      } else {
        alert(res.data.message || "Failed to move application to Pickup Document status.");
      }
    } catch (err) {
      console.error("Move-to-pickup-document error:", err);
      alert("Server error while moving to Pickup Document.");
    }
  };

  // NEW: generic changer from ON-HOLD to any target status
  const handleChangeStatusFromOnHold = async (application, targetStatus) => {
    const appId = application.id || application.cedula_id;
    if (!appId) {
      alert("Missing application ID.");
      return;
    }

    try {
      // If target is in-review, re-use existing Accept logic
      if (targetStatus === "in-review") {
        if (application.type === "Electrical Permit") {
          await handleAcceptElectricalApplication(appId);
        } else if (application.type === "Cedula") {
          await handleAcceptCedulaApplication(appId);
        } else if (application.type === "Plumbing Permit") {
          await handleAcceptPlumbing(appId);
        } else if (application.type === "Electronics Permit") {
          await handleAcceptElectronics(appId);
        } else if (application.type === "Building Permit") {
          await handleAcceptBuilding(appId);
        } else if (application.type === "Fencing Permit") {
          await handleAcceptFencing(appId);
        } else {
          await handleAcceptApplication(appId);
        }
        return;
      }

      let response;

      if (targetStatus === "in-progress") {
        if (application.type === "Electrical Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/electrical-applications/move-to-inprogress`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Cedula") {
          response = await axios.put(
            `${API_BASE_URL}/api/cedula/move-to-inprogress`,
            { id: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Plumbing Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/plumbing-applications/move-to-inprogress`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Electronics Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/electronics-applications/move-to-inprogress`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Building Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/building-applications/move-to-inprogress`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Fencing Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/fencing-applications/move-to-inprogress`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else {
          response = await axios.put(
            `${API_BASE_URL}/api/applications/move-to-inprogress`,
            { applicationId: appId },
            { withCredentials: true }
          );
        }
      } else if (targetStatus === "requirements-completed") {
        if (application.type === "Electrical Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/electrical-applications/move-to-requirements-completed`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Cedula") {
          response = await axios.put(
            `${API_BASE_URL}/api/cedula/move-to-requirements-completed`,
            { id: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Plumbing Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/plumbing-applications/move-to-requirements-completed`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Electronics Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/electronics-applications/move-to-requirements-completed`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Building Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/building-applications/move-to-requirements-completed`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Fencing Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/fencing-applications/move-to-requirements-completed`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else {
          response = await axios.put(
            `${API_BASE_URL}/api/applications/move-to-requirements-completed`,
            { applicationId: appId },
            { withCredentials: true }
          );
        }
      } else if (targetStatus === "approved") {
        if (application.type === "Electrical Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/electrical-applications/move-to-approved`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Cedula") {
          response = await axios.put(
            `${API_BASE_URL}/api/cedula/move-to-approved`,
            { id: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Plumbing Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/plumbing-applications/move-to-approved`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Electronics Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/electronics-applications/move-to-approved`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Building Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/building-applications/move-to-approved`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else if (application.type === "Fencing Permit") {
          response = await axios.put(
            `${API_BASE_URL}/api/fencing-applications/move-to-approved`,
            { applicationId: appId },
            { withCredentials: true }
          );
        } else {
          response = await axios.put(
            `${API_BASE_URL}/api/applications/move-to-approved`,
            { applicationId: appId },
            { withCredentials: true }
          );
        }
      } else if (targetStatus === "pickup-document") {
        await handleMoveToPickupDocument(application);
        return;
      } else {
        alert("Unsupported target status.");
        return;
      }

      if (response && response.data && response.data.success) {
        await Promise.all([
          fetchApplications(),
          fetchElectricalApplications(),
          fetchCedulaApplications(),
          fetchPlumbingApplications(),
          fetchElectronicsApplications(),
          fetchBuildingApplications(),
          fetchFencingApplications(),
        ]);

        let msg = "";
        switch (targetStatus) {
          case "in-progress":
            msg = "Moved to in-progress successfully.";
            break;
          case "requirements-completed":
            msg = "Moved to requirements-completed successfully.";
            break;
          case "approved":
            msg = "Application approved successfully.";
            break;
          default:
            break;
        }
        if (msg) alert(msg);
      } else if (response) {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("On-hold move error:", err);
      alert("Server error.");
    }
  };

  // ---------- DETAIL PANEL RENDERER ----------
  const renderSelectedDetails = () => {
    if (!selectedApplication) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm px-4 py-8">
          Select an application from the left to view its full details here.
        </div>
      );
    }

    const rawStatus =
      selectedApplication.status || selectedApplication.application_status || "pending";

    const statusClass =
      rawStatus === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : rawStatus === "approved"
        ? "bg-green-100 text-green-800"
        : rawStatus === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-blue-100 text-blue-800";

    const headerTitle =
      selectedApplication.type === "Electrical Permit"
        ? "Electrical Permit Application"
        : selectedApplication.type === "Cedula"
        ? "Cedula Application"
        : selectedApplication.type === "Plumbing Permit"
        ? "Plumbing Permit Application"
        : selectedApplication.type === "Electronics Permit"
        ? "Electronics Permit Application"
        : selectedApplication.type === "Building Permit"
        ? "Building Permit Application"
        : selectedApplication.type === "Fencing Permit"
        ? "Fencing Permit Application"
        : "Business Permit Application";

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{headerTitle}</h2>
              <p className="text-blue-100 text-sm">Application Details &amp; Information</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          <div className="flex justify-center">
            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${statusClass}`}>
              Status: {String(rawStatus).toUpperCase()}
            </span>
          </div>

          {selectedApplication.type === "Cedula" ? (
            <CedulaModalContent selectedApplication={selectedApplication} />
          ) : selectedApplication.type === "Electrical Permit" ? (
            <ElectricalPermitModalContent selectedApplication={selectedApplication} />
          ) : selectedApplication.type === "Plumbing Permit" ? (
            <PlumbingPermitModalContent selectedApplication={selectedApplication} />
          ) : selectedApplication.type === "Electronics Permit" ? (
            <ElectronicsPermitModalContent selectedApplication={selectedApplication} />
          ) : selectedApplication.type === "Building Permit" ? (
            <BuildingPermitModalContent selectedApplication={selectedApplication} />
          ) : selectedApplication.type === "Fencing Permit" ? (
            <FencingPermitModalContent selectedApplication={selectedApplication} />
          ) : (
            <BusinessPermitModalContent selectedApplication={selectedApplication} />
          )}
        </div>
      </div>
    );
  };

  // helper for tab labels (no spaces, same style as before)
  const getTabLabel = (tab) => {
    switch (tab) {
      case "pending":
        return "Pending";
      case "inReview":
        return "InReview";
      case "onHold":
        return "OnHold";
      case "inProgress":
        return "InProgress";
      case "requirementsCompleted":
        return "RequirementsCompleted";
      case "approved":
        return "Approved";
      case "readyForPickup":
        return "ReadyForPickup";
      case "pickupDocument":
        return "PickupDocument";
      case "rejected":
        return "Rejected";
      default:
        return tab;
    }
  };

  // ------------------------------- JSX -------------------------------
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
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Application Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Bell size={20} className="text-gray-600 cursor-pointer" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
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
            {[
              "pending",
              "inReview",
              "onHold",
              "inProgress",
              "requirementsCompleted",
              "approved",
              "readyForPickup",
              "pickupDocument",
              "rejected",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-3 font-medium text-sm focus:outline-none ${
                  selectedTab === tab
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                {getTabLabel(tab)}
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    tab === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : tab === "inReview"
                      ? "bg-blue-100 text-blue-800"
                      : tab === "onHold"
                      ? "bg-gray-100 text-gray-800"
                      : tab === "inProgress"
                      ? "bg-orange-100 text-orange-800"
                      : tab === "requirementsCompleted"
                      ? "bg-purple-100 text-purple-800"
                      : tab === "approved"
                      ? "bg-green-100 text-green-800"
                      : tab === "pickupDocument"
                      ? "bg-indigo-100 text-indigo-800"
                      : tab === "readyForPickup"
                      ? "bg-pink-100 text-pink-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {applications[tab].length +
                    electricalApplications[tab].length +
                    cedulaApplications[tab].length +
                    plumbingApplications[tab].length +
                    electronicsApplications[tab].length +
                    buildingApplications[tab].length +
                    fencingApplications[tab].length}
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* Main body: list + details */}
        <main className="flex-1 overflow-hidden p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* LEFT: application cards */}
            <div className="space-y-4 overflow-y-auto pr-1">
              {getCurrentApplications().length > 0 ? (
                getCurrentApplications().map((application) => {
                  const rowKey = getApplicationKey(application);

                  return (
                    <div
                      key={rowKey}
                      className={`rounded-2xl border bg-white/80 backdrop-blur shadow-sm transition-all hover:shadow-lg hover:-translate-y-[1px] ${
                        activeRowKey === rowKey
                          ? "border-indigo-400 ring-2 ring-indigo-100"
                          : "border-gray-100 hover:border-indigo-200"
                      }`}
                    >
                      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                        <div
                          className="flex items-center cursor-pointer min-w-0"
                          onClick={() => toggleExpandApplication(application.id)}
                        >
                          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100 shadow-sm">
                            <FileText size={20} />
                          </div>
                          <div className="ml-4 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {application.name || application.applicant_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                {application.type || "Electrical Permit"}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs">
                                Submitted on{" "}
                                {new Date(
                                  application.submitted || application.created_at
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS (STYLE UPDATED ONLY) */}
                        <div className="flex flex-wrap justify-end gap-2">
                          {/* View Info button */}
                          <button
                            onClick={() => {
                              const appId = application.id || application.cedula_id;
                              setActiveRowKey(rowKey);

                              if (application.type === "Electrical Permit") {
                                handleViewElectricalApplication(appId);
                              } else if (application.type === "Cedula") {
                                handleViewCedulaApplication(appId);
                              } else if (application.type === "Plumbing Permit") {
                                handleViewPlumbingApplication(appId);
                              } else if (application.type === "Electronics Permit") {
                                handleViewElectronicsApplication(appId);
                              } else if (application.type === "Building Permit") {
                                handleViewBuildingApplication(appId);
                              } else if (application.type === "Fencing Permit") {
                                handleViewFencingApplication(appId);
                              } else {
                                handleViewApplication(appId);
                              }
                            }}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            View Info
                          </button>

                          {/* PENDING → IN-REVIEW (ACCEPT) */}
                          {(application.status === "pending" ||
                            application.application_status === "pending") && (
                            <button
                              onClick={() => {
                                const appId = application.id || application.cedula_id;

                                openConfirmDialog(
                                  "Move to In Review",
                                  "Move this application to In Review?",
                                  async () => {
                                    if (application.type === "Electrical Permit") {
                                      await handleAcceptElectricalApplication(appId);
                                    } else if (application.type === "Cedula") {
                                      await handleAcceptCedulaApplication(appId);
                                    } else if (application.type === "Plumbing Permit") {
                                      await handleAcceptPlumbing(appId);
                                    } else if (application.type === "Electronics Permit") {
                                      await handleAcceptElectronics(appId);
                                    } else if (application.type === "Building Permit") {
                                      await handleAcceptBuilding(appId);
                                    } else if (application.type === "Fencing Permit") {
                                      await handleAcceptFencing(appId);
                                    } else {
                                      await handleAcceptApplication(appId);
                                    }
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                            >
                              Accept
                            </button>
                          )}

                          {/* Attach Requirements – only for IN-REVIEW */}
                          {(application.status === "in-review" ||
                            application.application_status === "in-review") && (
                            <button
                              onClick={() => {
                                const appId = application.id || application.cedula_id;
                                setAttachTarget({
                                  applicationType: application.type || "Electrical Permit",
                                  applicationId: appId,
                                });
                                setAttachOpen(true);
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-blue-50 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                            >
                              Attach Requirements
                            </button>
                          )}

                          {/* IN-REVIEW → IN-PROGRESS (DONE ATTACHED REQUIREMENTS) */}
                          {(application.status === "in-review" ||
                            application.application_status === "in-review") && (
                            <button
                              onClick={() => {
                                const appId = application.id || application.cedula_id;

                                openConfirmDialog(
                                  "Move to In Progress",
                                  "Move this application to In Progress?",
                                  async () => {
                                    try {
                                      let response;
                                      if (application.type === "Electrical Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/electrical-applications/move-to-inprogress`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Cedula") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/cedula/move-to-inprogress`,
                                          { id: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Plumbing Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/plumbing-applications/move-to-inprogress`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Electronics Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/electronics-applications/move-to-inprogress`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Building Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/building-applications/move-to-inprogress`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Fencing Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/fencing-applications/move-to-inprogress`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/applications/move-to-inprogress`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
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
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                            >
                              Done Attached Requirements
                            </button>
                          )}

                          {/* IN-PROGRESS → REQUIREMENTS-COMPLETED */}
                          {(application.status === "in-progress" ||
                            application.application_status === "in-progress") && (
                            <button
                              onClick={() => {
                                const appId = application.id || application.cedula_id;

                                openConfirmDialog(
                                  "Complete Requirements",
                                  "Mark requirements as completed for this application?",
                                  async () => {
                                    try {
                                      let response;
                                      if (application.type === "Electrical Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/electrical-applications/move-to-requirements-completed`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Cedula") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/cedula/move-to-requirements-completed`,
                                          { id: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Plumbing Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/plumbing-applications/move-to-requirements-completed`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Electronics Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/electronics-applications/move-to-requirements-completed`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Building Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/building-applications/move-to-requirements-completed`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Fencing Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/fencing-applications/move-to-requirements-completed`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/applications/move-to-requirements-completed`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
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
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-purple-50 text-purple-700 ring-1 ring-purple-100 hover:bg-purple-100"
                            >
                              Complete Requirements
                            </button>
                          )}

                          {/* ON-HOLD → MOVE VIA MODAL */}
                          {(application.status === "on-hold" ||
                            application.application_status === "on-hold") && (
                            <button
                              type="button"
                              onClick={() => {
                                setOnHoldModalApp(application);
                                setOnHoldModalOpen(true);
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-blue-50 text-blue-800 ring-1 ring-blue-100 hover:bg-blue-100"
                            >
                              Move From On Hold
                            </button>
                          )}

                          {/* REQUIREMENTS-COMPLETED → APPROVED */}
                          {(application.status === "requirements-completed" ||
                            application.application_status === "requirements-completed") && (
                            <button
                              onClick={() => {
                                const appId = application.id || application.cedula_id;

                                openConfirmDialog(
                                  "Approve Application",
                                  "Approve this application?",
                                  async () => {
                                    try {
                                      let response;
                                      if (application.type === "Electrical Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/electrical-applications/move-to-approved`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Cedula") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/cedula/move-to-approved`,
                                          { id: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Plumbing Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/plumbing-applications/move-to-approved`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Electronics Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/electronics-applications/move-to-approved`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Building Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/building-applications/move-to-approved`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else if (application.type === "Fencing Permit") {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/fencing-applications/move-to-approved`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
                                      } else {
                                        response = await axios.put(
                                          `${API_BASE_URL}/api/applications/move-to-approved`,
                                          { applicationId: appId },
                                          { withCredentials: true }
                                        );
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
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 hover:bg-emerald-100"
                            >
                              Approve
                            </button>
                          )}

                          {/* ANY STATUS → ON-HOLD (except already on-hold / rejected / ready-for-pickup) */}
                          {(application.status !== "on-hold" &&
                            application.application_status !== "on-hold" &&
                            application.status !== "ready-for-pickup" &&
                            application.application_status !== "ready-for-pickup" &&
                            application.status !== "rejected" &&
                            application.application_status !== "rejected") && (
                            <button
                              onClick={() => {
                                openConfirmDialog(
                                  "Move to On Hold",
                                  "Move this application to On Hold?",
                                  async () => {
                                    await handleMoveToOnHold(application);
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-gray-50 text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                            >
                              Put On Hold
                            </button>
                          )}

                          {/* APPROVED → PICKUP-DOCUMENT */}
                          {(application.status === "approved" ||
                            application.application_status === "approved") && (
                            <button
                              onClick={() => {
                                openConfirmDialog(
                                  "Tag as Pickup Document",
                                  'Move this application to "Pickup Document" status?',
                                  async () => {
                                    await handleMoveToPickupDocument(application);
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100 hover:bg-indigo-100"
                            >
                              Tag as Pickup Document
                            </button>
                          )}

                          {/* APPROVED or PICKUP-DOCUMENT → SET PICKUP SCHEDULE */}
                          {(application.status === "approved" ||
                            application.application_status === "approved" ||
                            application.status === "pickup-document" ||
                            application.application_status === "pickup-document") && (
                            <button
                              onClick={() => {
                                setPickupTarget(application);
                                setShowPickupModal(true);
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-pink-50 text-pink-700 ring-1 ring-pink-100 hover:bg-pink-100"
                            >
                              Set Pickup Schedule
                            </button>
                          )}

                          {/* READY-FOR-PICKUP → PICKUP-DOCUMENT (not archive) */}
                          {(application.status === "ready-for-pickup" ||
                            application.application_status === "ready-for-pickup") && (
                            <button
                              onClick={() => {
                                openConfirmDialog(
                                  "Mark as Picked Up",
                                  "Mark this application as picked up and move it to Pickup Document?",
                                  async () => {
                                    await handleMoveToPickupDocument(application);
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-gray-50 text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                            >
                              Mark as Picked Up
                            </button>
                          )}

                          {/* PICKUP-DOCUMENT → ARCHIVE */}
                          {(application.status === "pickup-document" ||
                            application.application_status === "pickup-document") && (
                            <button
                              onClick={() => {
                                openConfirmDialog(
                                  "Move to Archive",
                                  "Mark this application as released and move it to Archives?",
                                  async () => {
                                    await handleMarkAsPickedUp(application);
                                  }
                                );
                              }}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-gray-50 text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                            >
                              Move to Archive
                            </button>
                          )}
                        </div>
                      </div>

                      {expandedApplication === application.id && (
                        <div className="border-t border-gray-100 bg-white/60 backdrop-blur px-6 py-4 text-sm text-gray-600">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <p>
                              <strong>Type:</strong> {application.type || "Electrical Permit"}
                            </p>
                            <p>
                              <strong>Submitted:</strong>{" "}
                              {new Date(
                                application.submitted || application.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              {application.status || application.application_status}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                  No applications found in this category.
                </div>
              )}
            </div>

            {/* RIGHT: details panel (desktop) */}
            <div className="hidden lg:flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
              {renderSelectedDetails()}
            </div>
          </div>

          {/* Details panel for mobile (below list) */}
          <div className="mt-4 lg:hidden bg-white rounded-lg shadow-sm overflow-hidden">
            {renderSelectedDetails()}
          </div>

          {/* Pickup Schedule Modal */}
          {showPickupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-40">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Set Pickup Schedule</h2>

                <label className="block text-sm font-medium mb-1">Pickup Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={pickupSchedule}
                  onChange={(e) => setPickupSchedule(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                />

                <label className="block text-sm font-medium mb-1">
                  Attach Final Document (PDF / Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setPickupFile(file || null);
                  }}
                  className="w-full border p-2 rounded mb-4"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowPickupModal(false);
                      setPickupTarget(null);
                      setPickupSchedule("");
                      setPickupFile(null);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!pickupSchedule) {
                        alert("Please select a schedule");
                        return;
                      }

                      openConfirmDialog(
                        "Confirm Pickup Schedule",
                        "Confirm this pickup schedule and notify the applicant?",
                        async () => {
                          try {
                            if (pickupTarget.type === "Electrical Permit") {
                              await handlePickupScheduleElectrical(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            } else if (pickupTarget.type === "Cedula") {
                              await handlePickupScheduleCedula(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            } else if (pickupTarget.type === "Plumbing Permit") {
                              await handlePickupSchedulePlumbing(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            } else if (pickupTarget.type === "Electronics Permit") {
                              await handlePickupScheduleElectronics(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            } else if (pickupTarget.type === "Building Permit") {
                              await handlePickupScheduleBuilding(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            } else if (pickupTarget.type === "Fencing Permit") {
                              await handlePickupScheduleFencing(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            } else {
                              await handlePickupScheduleBusiness(
                                pickupTarget.id,
                                pickupSchedule,
                                pickupFile
                              );
                            }

                            setShowPickupModal(false);
                            setPickupTarget(null);
                            setPickupSchedule("");
                            setPickupFile(null);
                          } catch (err) {
                            console.error("Pickup confirm error:", err);
                            alert("Failed to schedule pickup.");
                          }
                        }
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Move-From-On-Hold Modal */}
          {onHoldModalOpen && onHoldModalApp && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-3">Move From On Hold</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Where do you want to move this on-hold application?
                </p>

                <div className="space-y-2">
                  {[
                    { key: "in-review", label: "In Review" },
                    { key: "in-progress", label: "In Progress" },
                    { key: "requirements-completed", label: "Requirements Completed" },
                    { key: "approved", label: "Approved" },
                    { key: "pickup-document", label: "Pickup Document" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setOnHoldModalOpen(false);
                        setOnHoldModalApp(null);
                        openConfirmDialog(
                          "Move Application",
                          `Move this on-hold application to "${opt.label}"?`,
                          async () => {
                            await handleChangeStatusFromOnHold(onHoldModalApp, opt.key);
                          }
                        );
                      }}
                      className="w-full text-left px-4 py-2 text-sm rounded border border-gray-200 hover:bg-gray-100"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setOnHoldModalOpen(false);
                      setOnHoldModalApp(null);
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attach-from-library modal */}
          <AttachRequirementFromLibraryModal
            open={attachOpen}
            onClose={() => setAttachOpen(false)}
            applicationType={attachTarget.applicationType}
            applicationId={attachTarget.applicationId}
            onAttached={() => {
              fetchApplications();
              fetchElectricalApplications();
              fetchCedulaApplications();
              fetchPlumbingApplications();
              fetchElectronicsApplications();
              fetchBuildingApplications();
              fetchFencingApplications();
            }}
          />

          {/* Generic confirmation dialog (replaces window.confirm) */}
          {confirmDialog.open && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-2">{confirmDialog.title}</h2>
                <p className="text-sm text-gray-600 mb-4">{confirmDialog.message}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() =>
                      setConfirmDialog((prev) => ({
                        ...prev,
                        open: false,
                        onConfirm: null,
                      }))
                    }
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const fn = confirmDialog.onConfirm;
                      setConfirmDialog((prev) => ({
                        ...prev,
                        open: false,
                        onConfirm: null,
                      }));
                      if (fn) {
                        await fn();
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
