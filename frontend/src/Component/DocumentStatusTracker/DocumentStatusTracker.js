import React, { useState, useEffect } from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  Loader,
  FileText,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  User,
  Pencil,
  CreditCard,
  DollarSign,
  ExternalLink,
  Filter
} from 'lucide-react';
import FencingInlineForm from "../User/FencingInlineForm";
import ElectricalInlineForm, { InlineModal } from "../User/ElectricalInlineForm";
import BusinessAssessmentPaymentModal from '../DocumentStatusTracker/BusinessAssessmentPaymentModal';
import ElectronicsInlineForm from "../User/ElectronicsInlineForm";
import PlumbingInlineForms from "../User/PlumbingInlineForms";
import BusinessinlineForms from "../User/BusinessinlineForms";
import UserUpdateModal from "../modals/userupdatemodal";
import { useNavigate } from 'react-router-dom';
import Uheader from '../Header/User_header';
import UFooter from '../Footer/User_Footer';

function DocumentStatusTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openElectricalForm, setOpenElectricalForm] = useState(false);
  const [electricalContext, setElectricalContext] = useState(null); 
  const [openElectronicsForm, setOpenElectronicsForm] = useState(false);
  const [electronicsContext, setElectronicsContext] = useState(null);
  const [openFencingForm, setOpenFencingForm] = useState(false);
  const [fencingContext, setFencingContext] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [viewFilter, setViewFilter] = useState('all'); // 'all' | 'applications' | 'payments'
  const navigate = useNavigate();
  const [openBusinessForm, setOpenBusinessForm] = useState(false);
  const [businessContext, setBusinessContext] = useState(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [updateContext, setUpdateContext] = useState(null);
  const [openPlumbingForm, setOpenPlumbingForm] = useState(false);
  const [plumbingContext, setPlumbingContext] = useState(null);
// Add this state to your component
const [assessmentsByApp, setAssessmentsByApp] = useState({}); // { [application.id]: { loading, data } }
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [selectedAssessment, setSelectedAssessment] = useState(null);
const [selectedBusinessId, setSelectedBusinessId] = useState(null);
const [paymentStatusByApp, setPaymentStatusByApp] = useState({});
  const includesCI = (haystack, needle) =>
    String(haystack || '').toLowerCase().includes(String(needle || '').toLowerCase());

  const openEditModal = (application) => {
    const appType = TYPE_TO_APP[application.type] || application.applicationType || "";
    const appId = parseAppId(application.id);

    if (!appType || !appId) {
      alert("Unable to determine application type/id for editing.");
      return;
    }

    setUpdateContext({
      application,
      appType,
      appId,
    });
    setOpenUpdateModal(true);
  };

  // ---------- NEW: requirements state + helpers ----------
  const [requirementsByApp, setRequirementsByApp] = useState({}); // { [application.id]: { loading, items } }

  // ---------- NEW: comments state + helpers ----------
  const [commentsByApp, setCommentsByApp] = useState({}); // { [application.id]: { loading, items } }

  // ---------- NEW: user comment input + sending state ----------
  const [userCommentText, setUserCommentText] = useState({}); // { [appId_stageKey]: string }
  const [sendingComment, setSendingComment] = useState({}); // { [appId_stageKey]: boolean }

  // ---------- NEW: notification flags (red dot) ----------
  const [newFlags, setNewFlags] = useState({}); // { [application.id]: boolean }
  const SEEN_STORAGE_KEY = 'docTrackerSeen_v1';

  const TYPE_TO_APP = {
    'Business Permit': 'business',
    'Electrical Permit': 'electrical',
    'Plumbing Permit': 'plumbing',
    'Electronics Permit': 'electronics',
    'Building Permit': 'building',
    'Fencing Permit': 'fencing',
    'Cedula': 'cedula',
    'Zoning Permit': 'zoning'
  };

  function parseAppId(str) {
    const parts = String(str || '').split('_');
    const n = parts.length > 1 ? Number(parts[1]) : NaN;
    return Number.isFinite(n) ? n : null;
  }
async function loadAssessmentForApplication(application) {
  // Only for business permits
  if (application.type !== 'Business Permit') return;

  const appType = TYPE_TO_APP[application.type] || application.applicationType || '';
  const appId = parseAppId(application.id);

  if (!appType || !appId) {
    console.warn('loadAssessmentForApplication: missing appType/appId', application);
    return;
  }

  setAssessmentsByApp((prev) => ({
    ...prev,
    [application.id]: {
      loading: true,
      data: prev[application.id]?.data || null,
    },
  }));

  try {
    const q = new URLSearchParams({
      application_type: appType,
      application_id: String(appId),
    });

    const r = await fetch(
      `http://localhost:8081/api/user/assessment?${q.toString()}`,
      { credentials: 'include' }
    );
    const j = await r.json();

    setAssessmentsByApp((prev) => ({
      ...prev,
      [application.id]: {
        loading: false,
        data: j.success && j.hasAssessment ? j.assessment : null,
      },
    }));
  } catch (e) {
    console.error('loadAssessmentForApplication error:', e);
    setAssessmentsByApp((prev) => ({
      ...prev,
      [application.id]: { loading: false, data: null },
    }));
  }
}

  // --- helpers for localStorage seen-map ---
  function loadSeenMap() {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveSeenMap(map) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  async function checkPaymentStatus(application) {
  if (application.type !== 'Business Permit') return;

  const appType = TYPE_TO_APP[application.type] || application.applicationType || '';
  const appId = parseAppId(application.id);

  if (!appType || !appId) return;

  try {
    const response = await fetch(
      `http://localhost:8081/api/payments/check?application_type=${appType}&application_id=${appId}`,
      { credentials: 'include' }
    );
    const data = await response.json();

    if (data.success && data.hasPayment) {
      setPaymentStatusByApp(prev => ({
        ...prev,
        [application.id]: data.payment
      }));
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
} 
  async function loadRequirementsForApplication(application) {
    const appType =
      TYPE_TO_APP[application.type] || application.applicationType || '';
    const appId = parseAppId(application.id);

    // ❗ If we can't derive appType/appId, don't leave the UI stuck
    if (!appType || !appId) {
      console.warn('loadRequirementsForApplication: missing appType/appId', {
        id: application.id,
        type: application.type,
        applicationType: application.applicationType,
        appType,
        appId,
      });

      // mark as "no requirements" so UI shows a proper message
      setRequirementsByApp((prev) => ({
        ...prev,
        [application.id]: { loading: false, items: [] },
      }));
      return;
    }

    // normal case
    setRequirementsByApp((prev) => ({
      ...prev,
      [application.id]: {
        loading: true,
        items: prev[application.id]?.items || [],
      },
    }));

    try {
      const q = new URLSearchParams({
        application_type: appType,
        application_id: String(appId),
      });

      const r = await fetch(
        `http://localhost:8081/api/user/requirements?${q.toString()}`,
        { credentials: 'include' }
      );
      const j = await r.json();

      setRequirementsByApp((prev) => ({
        ...prev,
        [application.id]: {
          loading: false,
          items: j.success ? j.items : [],
        },
      }));
    } catch (e) {
      console.error('loadRequirementsForApplication error:', e);
      setRequirementsByApp((prev) => ({
        ...prev,
        [application.id]: { loading: false, items: [] },
      }));
    }
  }

  async function uploadUserRequirement(application, requirement_id, file) {
    const appType = TYPE_TO_APP[application.type] || application.applicationType || '';
    const appId = parseAppId(application.id);
    if (!appType || !appId || !file) return;

    const fd = new FormData();
    fd.append('application_type', appType);
    fd.append('application_id', String(appId));
    fd.append('requirement_id', String(requirement_id));
    fd.append('file', file);

    try {
      const r = await fetch('http://localhost:8081/api/user/requirements/upload', {
        method: 'POST',
        body: fd,
        credentials: 'include'
      });
      const j = await r.json();
      if (j.success) {
        await loadRequirementsForApplication(application);
        alert('File uploaded.');
      } else {
        alert(j.message || 'Upload failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Server error.');
    }
  }

  function normalizeStageKey(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, "")  // remove spaces
      .replace(/-/g, "");   // remove hyphens
  }

  // ---------- NEW: load comments for user side ----------
  async function loadCommentsForApplication(application) {
    const appType =
      TYPE_TO_APP[application.type] || application.applicationType || '';
    const appId = parseAppId(application.id);

    if (!appType || !appId) {
      console.warn('loadCommentsForApplication: missing appType/appId', {
        id: application.id,
        type: application.type,
        applicationType: application.applicationType,
        appType,
        appId,
      });

      setCommentsByApp((prev) => ({
        ...prev,
        [application.id]: { loading: false, items: [] },
      }));
      return;
    }

    setCommentsByApp((prev) => ({
      ...prev,
      [application.id]: {
        loading: true,
        items: prev[application.id]?.items || [],
      },
    }));

    try {
      const q = new URLSearchParams({
        application_type: appType,
        application_id: String(appId),
      });

      const r = await fetch(
        `http://localhost:8081/api/user/comments?${q.toString()}`,
        { credentials: 'include' }
      );
      const j = await r.json();

      setCommentsByApp((prev) => ({
        ...prev,
        [application.id]: {
          loading: false,
          items: j.success ? j.items : [],
        },
      }));
    } catch (e) {
      console.error('loadCommentsForApplication error:', e);
      setCommentsByApp((prev) => ({
        ...prev,
        [application.id]: { loading: false, items: [] },
      }));
    }
  }

  // ---------- NEW: send user comment ----------
  async function handleSendComment(application, stageKey, inputKey) {
    const raw = (userCommentText[inputKey] || '').trim();
    if (!raw) return;

    const appType =
      TYPE_TO_APP[application.type] || application.applicationType || '';
    const appId = parseAppId(application.id);

    if (!appType || !appId) {
      alert('Unable to determine which application this message is for.');
      return;
    }

    const payload = {
      application_type: appType,
      application_id: String(appId),
      comment: raw,
      status_at_post: application.status || stageKey || '',
    };

    try {
      setSendingComment((prev) => ({ ...prev, [inputKey]: true }));

      const r = await fetch('http://localhost:8081/api/user/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const j = await r.json();
      if (!j.success) {
        alert(j.message || 'Failed to send message.');
        return;
      }

      // Clear input & refresh comments
      setUserCommentText((prev) => ({ ...prev, [inputKey]: '' }));
      await loadCommentsForApplication(application);
    } catch (e) {
      console.error('handleSendComment error:', e);
      alert('Server error while sending your message.');
    } finally {
      setSendingComment((prev) => ({ ...prev, [inputKey]: false }));
    }
  }
  // ---------- END NEW ----------

  const fetchAllPermitData = async () => {
    try {
      console.log('Fetching all permit data...');

      // Fetch all data types (added 4 new permit endpoints)
      const [
        businessResponse,
        electricalResponse,
        cedulaResponse,
        paymentResponse,

        // NEW:
        plumbingResponse,
        electronicsResponse,
        buildingResponse,
        fencingResponse,
        zoningResponse,
      ] = await Promise.all([
        fetch('http://localhost:8081/api/businesspermits', { credentials: 'include' }),
        fetch('http://localhost:8081/api/getelectrical-permits', { credentials: 'include' }),
        fetch('http://localhost:8081/api/cedulas-tracking', { credentials: 'include' }),
        fetch('http://localhost:8081/api/payments/tracking', { credentials: 'include' }),
        fetch('http://localhost:8081/api/zoning-permits-tracking', { credentials: 'include' }), 

        // NEW endpoints:
        fetch('http://localhost:8081/api/plumbing-permits-tracking',   { credentials: 'include' }),
        fetch('http://localhost:8081/api/electronics-permits-tracking',{ credentials: 'include' }),
        fetch('http://localhost:8081/api/building-permits-tracking',   { credentials: 'include' }),
        fetch('http://localhost:8081/api/fencing-permits-tracking',    { credentials: 'include' }),
      ]);

      // Parse responses
      const businessData    = await businessResponse.json();
      const electricalData  = await electricalResponse.json();
      const cedulaData      = await cedulaResponse.json();
      const paymentData     = await paymentResponse.json();

      // NEW parsed data
      const plumbingData    = await plumbingResponse.json();
      const electronicsData = await electronicsResponse.json();
      const buildingData    = await buildingResponse.json();
      const fencingData     = await fencingResponse.json();

      console.log('Business Response:', businessData);
      console.log('Electrical Response:', electricalData);
      console.log('Cedula Response:', cedulaData);
      console.log('Payment Response:', paymentData);
      console.log('Plumbing Response:', plumbingData);
      console.log('Electronics Response:', electronicsData);
      console.log('Building Response:', buildingData);
      console.log('Fencing Response:', fencingData);

      let allApplications = [];

      // Transform business permits
      if (businessData.permits && businessData.permits.length > 0) {
        const transformedBusinessPermits = businessData.permits.map(permit => ({
          id: `business_${permit.BusinessP_id}`,
          title: `${permit.application_type} - ${permit.business_name}`,
          type: 'Business Permit',
          status: permit.status,
          email: permit.business_email || permit.owner_email || '',
          applicationDate: new Date(permit.application_date).toLocaleString(),
          createdAt: new Date(permit.created_at).toLocaleString(),
          steps: transformStatusToSteps(permit.status)
        }));
        allApplications = [...allApplications, ...transformedBusinessPermits];
      }

      // Transform electrical permits
      if (electricalData.success && electricalData.permits && electricalData.permits.length > 0) {
        const transformedElectricalPermits = electricalData.permits.map(permit => ({
          id: `electrical_${permit.id}`,
          title: `Electrical Permit - ${permit.first_name} ${permit.last_name}`,
          type: 'Electrical Permit',
          status: permit.status,
          email: permit.email || '',
          applicationDate: new Date(permit.created_at).toLocaleString(),
          createdAt: new Date(permit.created_at).toLocaleString(),
          applicationNo: permit.application_no,
          epNo: permit.ep_no,
          scopeOfWork: permit.scope_of_work,
          steps: transformStatusToSteps(permit.status)
        }));
        allApplications = [...allApplications, ...transformedElectricalPermits];
      }

      // Transform cedula records
      if (cedulaData.success && cedulaData.cedulas && cedulaData.cedulas.length > 0) {
        const transformedCedulas = cedulaData.cedulas.map(cedula => ({
          id: `cedula_${cedula.id}`,
          title: `Cedula - ${cedula.name}`,
          type: 'Cedula',
          status: cedula.application_status || 'pending',
          email: '',
          applicationDate: new Date(cedula.created_at).toLocaleString(),
          createdAt: new Date(cedula.created_at).toLocaleString(),
          address: cedula.address,
          placeOfBirth: cedula.place_of_birth,
          dateOfBirth: new Date(cedula.date_of_birth).toLocaleDateString(),
          profession: cedula.profession,
          yearlyIncome: parseFloat(cedula.yearly_income),
          purpose: cedula.purpose,
          sex: cedula.sex,
          maritalStatus: cedula.status,
          tin: cedula.tin,
          steps: transformStatusToSteps(cedula.application_status || 'pending')
        }));
        allApplications = [...allApplications, ...transformedCedulas];
      }

      // Transform payment receipts
      console.log('Processing payment data:', paymentData);

      if (paymentData && paymentData.success && paymentData.data && Array.isArray(paymentData.data) && paymentData.data.length > 0) {
        console.log('Payment data found, transforming...');
        const transformedPayments = paymentData.data.map(payment => {
          console.log('Processing payment:', payment);
          return {
            id: `payment_${payment.receipt_id}`,
            title: `Payment Receipt - ${payment.permit_name}`,
            type: 'Payment Receipt',
            status: payment.payment_status,
            email: payment.email || '',
            applicationDate: payment.formatted_created_at || new Date(payment.created_at).toLocaleString(),
            createdAt: payment.formatted_created_at || new Date(payment.created_at).toLocaleString(),
            applicationType: payment.application_type,
            paymentMethod: payment.payment_method,
            paymentAmount: payment.payment_amount,
            totalDocumentPrice: payment.total_document_price,
            remainingAmount: payment.remaining_amount || (payment.total_document_price - payment.payment_amount),
            paymentPercentage: payment.payment_percentage,
            adminNotes: payment.admin_notes,
            formAccessGranted: payment.form_access_granted,
            formAccessUsed: payment.form_access_used,
            formAccessUsedAt: payment.form_access_used_at,
            approvedBy: payment.approved_by_email,
            receiptId: payment.receipt_id,
            steps: transformPaymentStatusToSteps(
              payment.payment_status,
              payment.formatted_created_at || new Date(payment.created_at).toLocaleString(),
              payment.formatted_approved_at || (payment.approved_at ? new Date(payment.approved_at).toLocaleString() : null),
              payment.admin_notes
            )
          };
        });
        allApplications = [...allApplications, ...transformedPayments];
        console.log('Transformed payments:', transformedPayments);
      } else {
        console.log('No payment data found or invalid structure:', paymentData);
        if (paymentData && !paymentData.success) {
          console.log('Payment API error:', paymentData.message);
        }
      }
const zoningData = await zoningResponse.json();

// Transform zoning permits
if (zoningData && zoningData.success && Array.isArray(zoningData.permits) && zoningData.permits.length > 0) {
  const transformedZoning = zoningData.permits.map(p => ({
    id: `zoning_${p.id}`,
    title: `Zoning Permit - ${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Zoning Permit',
    type: 'Zoning Permit',
    status: p.status || 'pending',
    email: '',
    applicationDate: new Date(p.created_at).toLocaleString(),
    createdAt: new Date(p.created_at).toLocaleString(),
    applicationNo: p.application_no,
    applicationType: 'zoning',
    scopeOfWork: p.scope_of_work,
    steps: transformStatusToSteps(p.status || 'pending')
  }));
  allApplications = [...allApplications, ...transformedZoning];
}
      // NEW: Transform plumbing permits
      if (plumbingData && plumbingData.success && Array.isArray(plumbingData.permits) && plumbingData.permits.length > 0) {
        const transformedPlumbing = plumbingData.permits.map(p => ({
          id: `plumbing_${p.id}`,
          title: `Plumbing Permit - ${p.first_name} ${p.last_name}`,
          type: 'Plumbing Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          ppNo: p.pp_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'plumbing',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedPlumbing];
      }

      // NEW: Transform electronics permits
      if (electronicsData && electronicsData.success && Array.isArray(electronicsData.permits) && electronicsData.permits.length > 0) {
        const transformedElectronics = electronicsData.permits.map(p => ({
          id: `electronics_${p.id}`,
          title: `Electronics Permit - ${p.first_name} ${p.last_name}`,
          type: 'Electronics Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          epNo: p.ep_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'electronics',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedElectronics];
      }

      // NEW: Transform building permits
      if (buildingData && buildingData.success && Array.isArray(buildingData.permits) && buildingData.permits.length > 0) {
        const transformedBuilding = buildingData.permits.map(p => ({
          id: `building_${p.id}`,
          title: `Building Permit - ${p.first_name} ${p.last_name}`,
          type: 'Building Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          bpNo: p.bp_no,
          buildingPermitNo: p.building_permit_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'building',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedBuilding];
      }

      // NEW: Transform fencing permits
      if (fencingData && fencingData.success && Array.isArray(fencingData.permits) && fencingData.permits.length > 0) {
        const transformedFencing = fencingData.permits.map(p => ({
          id: `fencing_${p.id}`,
          title: `Fencing Permit - ${p.first_name} ${p.last_name}`,
          type: 'Fencing Permit',
          status: p.status,
          email: '',
          applicationDate: new Date(p.created_at).toLocaleString(),
          createdAt: new Date(p.created_at).toLocaleString(),
          applicationNo: p.application_no,
          fpNo: p.fp_no,
          scopeOfWork: p.scope_of_work,
          applicationType: 'fencing',
          steps: transformStatusToSteps(p.status)
        }));
        allApplications = [...allApplications, ...transformedFencing];
      }

      // Sort all applications by creation date (most recent first)
      allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // ---------- NEW: compute "new / updated" flags ----------
      const seenMap = loadSeenMap();
      const flags = {};
      allApplications.forEach((app) => {
        const prev = seenMap[app.id];
        if (!prev) {
          // brand new application/receipt
          flags[app.id] = true;
        } else if (prev.status !== app.status) {
          // status changed since last time user opened it
          flags[app.id] = true;
        } else {
          flags[app.id] = false;
        }
      });
      setNewFlags(flags);
      // -------------------------------------

      console.log('All applications:', allApplications);
      setApplications(allApplications);

      // Auto-expand the first (most recent) application
      if (allApplications.length > 0) {
        setExpandedCards({ [allApplications[0].id]: true });

        // also mark latest as seen if it auto-opens
        const latest = allApplications[0];
        const updatedSeen = { ...seenMap, [latest.id]: { status: latest.status } };
        saveSeenMap(updatedSeen);
        setNewFlags((prev) => ({ ...prev, [latest.id]: false }));

        // load requirements & comments for the first opened one
        loadRequirementsForApplication(latest);
        loadCommentsForApplication(latest);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching permit data:", err);
      setError("Failed to load your application status. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPermitData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to handle form access (external refresh)
  const handleFormAccess = () => {
    fetchAllPermitData();
  };

  // Function to get form route based on application type
  // Function to get form route based on application type
const getFormRoute = (applicationType) => {
  const routes = {
    'business': '/BusinessPermitForm',
    'electrical': '/ElectricalPermitForm',
    'plumbing': '/PlumbingPermitForm',
    'cedula': '/CedulaPermitForm',
    'fencing': '/FencingPermitForm',
    'electronics': '/ElectronicsPermitForm',
    'building': '/BuildingPermitForm',
    'renewal_business': '/RenewalBusinessPermit',
    'mayors': '/MayorsPermitForm',
    'zoning': '/ZoningPermitForm'  // ← ADD THIS LINE
  };
  return routes[applicationType] || null;
};

  // Do NOT mark form access used here; just guard and navigate
  const handleAccessForm = (application) => {
    const formRoute = getFormRoute(application.applicationType);

    if (!formRoute) {
      alert('Form route not found for this application type');
      return;
    }

    // For payment receipts, still enforce that payment is approved & access granted
    if (application.type === 'Payment Receipt') {
      if (application.status !== 'approved' || !application.formAccessGranted) {
        alert(
          'You can only open the form once your payment has been approved and access has been granted.'
        );
        return;
      }
    }

    // Just go to the form; user can come back and reopen as many times as needed
    navigate(formRoute);
  };

  // Cancel application with terms & conditions confirmation
  const handleCancelApplication = async (application) => {
    try {
      const appType =
        TYPE_TO_APP[application.type] || application.applicationType || "";
      const appId = parseAppId(application.id);

      if (!appType || !appId) {
        alert("Unable to determine which application to cancel.");
        return;
      }

      const normStatus = String(application.status || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/-/g, "");

      // Front-end guard (same idea as backend)
      if (["approved", "readyforpickup", "rejected"].includes(normStatus)) {
        alert("This application can no longer be cancelled.");
        return;
      }

      const ok = window.confirm(
        "Are you sure you want to cancel this application?\n\n" +
          "By proceeding, you confirm that you understand and agree that any " +
          "payments and processing expenses already incurred are NON-REFUNDABLE " +
          "as stated in the municipal terms and conditions."
      );
      if (!ok) return;

      const r = await fetch(
        `http://localhost:8081/api/user/cancel/${appType}/${appId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const j = await r.json();

      if (!j.success) {
        alert(j.message || "Failed to cancel application.");
        return;
      }

      alert(
        "Your application has been cancelled.\n\n" +
          "Please note that any payments and expenses already incurred " +
          "are NON-REFUNDABLE as per the terms and conditions."
      );

      // Refresh tracker so status changes to 'rejected'
      fetchAllPermitData();
    } catch (err) {
      console.error("handleCancelApplication error:", err);
      alert("Server error while cancelling the application.");
    }
  };

  // Helpers
  function transformStatusToSteps(status) {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');

    const steps = [
      { name: "Pending",                message: "Your application has been submitted and is waiting to be reviewed.", icon: FileText },
      { name: "InReview",               message: "Your application is currently under initial review.",               icon: Clock },
      { name: "InProgress",             message: "Please complete the required documents for verification.",          icon: Loader },
      { name: "RequirementsCompleted",  message: "All required documents have been submitted and verified.",          icon: Check },
      { name: "Approved",               message: "Your application has been approved.",                               icon: Check },
      { name: "ReadyForPickup",         message: "Your document is ready for pickup at the municipal office.",        icon: Check },
      { name: "Rejected",               message: "Your application has been rejected. Please check your email for details.", icon: AlertCircle }
    ];

    const statusOrder = {
      "pending": 0,
      "inreview": 1,
      "inprogress": 2,
      "requirementscompleted": 3,
      "approved": 4,
      "readyforpickup": 5,
      "rejected": 6
    };

    const currentIndex = statusOrder[normalizedStatus] ?? 0;

    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex && currentIndex !== 6,
      current: index === currentIndex && currentIndex !== 6,
      rejected: currentIndex === 6,
      date: index <= currentIndex && currentIndex !== 6 ? new Date().toLocaleString() : ""
    }));
  }

  function transformPaymentStatusToSteps(status, createdAt, approvedAt, adminNotes) {
    const steps = [
      {
        name: "PaymentSubmitted",
        message: "Payment receipt has been submitted for review.",
        icon: FileText,
        completed: true,
        current: false,
        date: createdAt || new Date().toLocaleString()
      }
    ];

    if (status === 'pending') {
      steps.push({
        name: "PaymentUnderReview",
        message: "Your payment is being reviewed by our staff.",
        icon: Clock,
        completed: false,
        current: true,
        date: null
      });
    } else if (status === 'approved') {
      steps.push(
        {
          name: "PaymentUnderReview",
          message: "Your payment was reviewed by our staff.",
          icon: Clock,
          completed: true,
          current: false,
          date: approvedAt || createdAt
        },
        {
          name: "PaymentApproved",
          message: "Payment has been approved. You can now access the application form.",
          icon: Check,
          completed: true,
          current: false,
          date: approvedAt || new Date().toLocaleString()
        }
      );
    } else if (status === 'rejected') {
      steps.push(
        {
          name: "PaymentUnderReview",
          message: "Your payment was reviewed by our staff.",
          icon: Clock,
          completed: true,
          current: false,
          date: approvedAt || createdAt
        },
        {
          name: "PaymentRejected",
          message: adminNotes || "Payment was rejected. Please check your payment details and resubmit.",
          icon: AlertCircle,
          completed: false,
          current: false,
          rejected: true,
          date: approvedAt || new Date().toLocaleString()
        }
      );
    }

    return steps;
  }

  function getStatusColor(step) {
    if (step.rejected) return "bg-red-500";
    if (step.completed) return "bg-green-500";
    if (step.current) return "bg-blue-500";
    return "bg-gray-300";
  }

  function getStatusBadgeColor(status) {
    switch(status?.toLowerCase()) {
      case 'approved': return "bg-green-100 text-green-800";
      case 'rejected': return "bg-red-100 text-red-800";
      case 'in-review': return "bg-yellow-100 text-yellow-800";
      case 'pending': return "bg-gray-100 text-gray-800";
      case 'ready for pickup': return "bg-purple-100 text-purple-800";
      default: return "bg-blue-100 text-blue-800";
    }
  }

  function getPermitTypeBadgeColor(type) {
    switch(type) {
      case 'Business Permit':    return "bg-blue-100 text-blue-800";
      case 'Electrical Permit':  return "bg-orange-100 text-orange-800";
      case 'Electronics Permit': return "bg-teal-100 text-teal-800";
      case 'Building Permit':    return "bg-amber-100 text-amber-800";
      case 'Plumbing Permit':    return "bg-cyan-100 text-cyan-800";
      case 'Fencing Permit':     return "bg-lime-100 text-lime-800";
      case 'Zoning Permit':      return "bg-violet-100 text-violet-800";
      case 'Cedula':             return "bg-green-100 text-green-800";
      case 'Payment Receipt':    return "bg-purple-100 text-purple-800";
      default:                   return "bg-gray-100 text-gray-800";
    }
  }

  const toggleCard = (applicationId) => {
  setExpandedCards(prev => {
    const opening = !prev[applicationId];
    const next = { ...prev, [applicationId]: opening };

    if (opening) {
      const app = applications.find(a => a.id === applicationId);

      if (app) {
        // Load requirements, comments, AND assessments on first open
        if (!requirementsByApp[applicationId]) {
          loadRequirementsForApplication(app);
        }
        if (!commentsByApp[applicationId]) {
          loadCommentsForApplication(app);
        }
        // 🔥 NEW: Load assessment for business permits
        if (app.type === 'Business Permit' && !assessmentsByApp[applicationId]) {
          loadAssessmentForApplication(app);
        }
      }

      // mark notification as seen
      if (app) {
        setNewFlags((prevFlags) => ({
          ...prevFlags,
          [applicationId]: false,
        }));
        const seen = loadSeenMap();
        seen[applicationId] = { status: app.status };
        saveSeenMap(seen);
      }
    }

    return next;
  });
};

  // ---------- NEW: filtering logic ----------
  const isApplicationType = (item) => item.type !== 'Payment Receipt';
  const counts = {
    all: applications.length,
    applications: applications.filter(isApplicationType).length,
    payments: applications.filter(a => a.type === 'Payment Receipt').length,
  };
  const visibleApps = applications.filter(a => {
    if (viewFilter === 'payments') return a.type === 'Payment Receipt';
    if (viewFilter === 'applications') return isApplicationType(a);
    return true; // 'all'
  });
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <RefreshCcw className="animate-spin mr-2" />
          <span>Loading your application status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">Error</h3>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">No Applications Found</h3>
              <p>You don't have any active permit applications or payment receipts. Please submit a new application.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function replaceUserRequirement(application, requirement_id, file) {
    const appType = TYPE_TO_APP[application.type] || application.applicationType || '';
    const appId = parseAppId(application.id);
    if (!appType || !appId || !file) return;

    const fd = new FormData();
    fd.append('application_type', appType);
    fd.append('application_id', String(appId));
    fd.append('requirement_id', String(requirement_id));
    fd.append('file', file);

    try {
      const r = await fetch('http://localhost:8081/api/user/requirements/replace-upload', {
        method: 'POST',
        body: fd,
        credentials: 'include'
      });
      const j = await r.json();
      if (j.success) {
        await loadRequirementsForApplication(application);
        alert('File replaced successfully.');
      } else {
        alert(j.message || 'Replace upload failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Server error while replacing file.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Uheader />
      <div className="max-w-4xl mx-auto p-6 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Application Status Tracker</h1>
          <p className="text-gray-600 mt-2">Track the progress of your permit applications, cedula records, and payment receipts</p>

          {/* ---------- NEW: Filter bar ---------- */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center text-sm text-gray-500 mr-1">
              <Filter className="h-4 w-4 mr-1" /> Filter:
            </span>

            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                viewFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All <span className="ml-1 text-xs opacity-80">({counts.all})</span>
            </button>

            <button
              onClick={() => setViewFilter('applications')}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                viewFilter === 'applications' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Applications
              </span>
              <span className="ml-1 text-xs opacity-80">({counts.applications})</span>
            </button>

            <button
              onClick={() => setViewFilter('payments')}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                viewFilter === 'payments' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                Payment Receipts
              </span>
              <span className="ml-1 text-xs opacity-80">({counts.payments})</span>
            </button>
          </div>
          {/* ---------- END Filter bar ---------- */}
        </div>

        <div className="space-y-4">
          
          {visibleApps.map((application, appIndex) => (
            <div key={application.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Application Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCard(application.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 relative">
                    {/* NEW: tiny red dot notification (top-left of card content) */}
                    {newFlags[application.id] && (
                      <span className="absolute -left-3 -top-2 inline-flex h-3 w-3 rounded-full bg-red-500 shadow" />
                    )}

                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      {application.title}
                      {appIndex === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Latest
                        </span>
                      )}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermitTypeBadgeColor(application.type)}`}>
                        {application.type}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>ID: {application.id.replace(/^(business_|electrical_|cedula_|payment_|plumbing_|electronics_|building_|fencing_)/, '')}</span>
                      {application.applicationNo && <span>App No: {application.applicationNo}</span>}
                      {application.epNo && <span>EP No: {application.epNo}</span>}
                      {application.bpNo && <span>BP No: {application.bpNo}</span>}
                      {application.ppNo && <span>PP No: {application.ppNo}</span>}
                      {application.fpNo && <span>FP No: {application.fpNo}</span>}
                      {application.buildingPermitNo && <span>Building Permit No: {application.buildingPermitNo}</span>}
                      {application.applicationType && <span>Type: {application.applicationType}</span>}
                      {application.receiptId && <span>Receipt ID: {application.receiptId}</span>}
                      <span>Applied: {application.applicationDate}</span>
                      {application.email && <span>Email: {application.email}</span>}
                    </div>
                    {application.status && (
                      <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                        Status: {application.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {application.type !== 'Payment Receipt' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(application);
                          }}
                          className="flex items-center text-sm px-2 py-1 rounded-md text-indigo-600 hover:bg-indigo-100 transition"
                        >
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelApplication(application);
                          }}
                          className="flex items-center text-sm px-2 py-1 rounded-md text-red-600 hover:bg-red-100 transition"
                        >
                          <AlertCircle size={16} className="mr-1" />
                          Cancel
                        </button>

                      </>
                    )}

                    {expandedCards[application.id] ? (
                      <ChevronUp className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedCards[application.id] && (
                <div className="px-6 pb-6 border-t border-gray-200">

                  {/* Enhanced Payment Receipt Details */}
                  {application.type === 'Payment Receipt' && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-medium text-purple-800 mb-3 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Application Type:</span> {application.applicationType}</div>
                        <div><span className="font-medium">Payment Method:</span> {application.paymentMethod}</div>

                        {/* Payment Breakdown (updated for full payment) */}
                        <div className="col-span-2 bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-800 mb-2 flex items:center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Payment Breakdown
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {/* Total price */}
                            <div>
                              <span className="text-gray-600">Total Document Price:</span>
                              <div className="font-semibold text-lg text-blue-600">
                                ₱{parseFloat(application.totalDocumentPrice || 0).toLocaleString()}
                              </div>
                            </div>

                            {/* Payment amount – show “Full Payment” when 100% */}
                            <div>
                              <span className="text-gray-600">
                                Payment Amount{" "}
                                {application.paymentPercentage === 100
                                  ? "(Full Payment)"
                                  : `(${application.paymentPercentage}%)`}
                                :
                              </span>
                              <div className="font-semibold text-lg text-green-600">
                                ₱{parseFloat(application.paymentAmount || 0).toLocaleString()}
                              </div>
                            </div>

                            {/* Remaining balance – only show if > 0 */}
                            {parseFloat(application.remainingAmount || 0) > 0 && (
                              <div>
                                <span className="text-gray-600">Remaining Balance:</span>
                                <div className="font-semibold text-lg text-orange-600">
                                  ₱{parseFloat(application.remainingAmount || 0).toLocaleString()}
                                </div>
                              </div>
                            )}

                            {/* Progress bar + label */}
                            <div>
                              <span className="text-gray-600">Payment Progress:</span>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      ((application.paymentAmount || 0) /
                                        (application.totalDocumentPrice || 1)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {(() => {
  const paymentStatus = paymentStatusByApp[application.id];
  const hasPayment = paymentStatus && paymentStatus.payment_status;
  
  if (hasPayment) {
    return (
      <div className="mb-4 p-3 bg-gray-50 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium text-gray-700">Payment Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              paymentStatus.payment_status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : paymentStatus.payment_status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {paymentStatus.payment_status.charAt(0).toUpperCase() + paymentStatus.payment_status.slice(1)}
            </span>
          </div>
          {paymentStatus.payment_status === 'approved' && (
            <span className="text-sm text-green-600">
              <Check className="h-4 w-4 inline mr-1" />
              Paid
            </span>
          )}
        </div>
        {paymentStatus.payment_amount && (
          <div className="mt-2 text-sm text-gray-600">
            Amount Paid: ₱{parseFloat(paymentStatus.payment_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>
    );
  }
  
  return null;
})()}
                              </span>
                            </div>
                          </div>
                        </div>


                        <div><span className="font-medium">Form Access:</span>
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${application.formAccessGranted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {application.formAccessGranted ? 'Granted' : 'Not Granted'}
                          </span>
                        </div>
                        <div><span className="font-medium">Access Used:</span>
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${application.formAccessUsed ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                            {application.formAccessUsed ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {application.approvedBy && (
                          <div className="col-span-2"><span className="font-medium">Approved By:</span> {application.approvedBy}</div>
                        )}
                        {application.adminNotes && (
                          <div className="col-span-2">
                            <span className="font-medium">Admin Notes:</span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-sm">{application.adminNotes}</div>
                          </div>
                        )}
                      </div>

                      {/* Form Access Button Section */}
                      {getFormRoute(application.applicationType) && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Application Form Access
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {application.status === 'approved' && application.formAccessGranted
                                  ? 'Your payment has been approved. You can now access the application form.'
                                  : !application.formAccessGranted
                                  ? 'Form access will be available once your payment is approved.'
                                  : 'Form access not available yet.'
                                }
                              </p>
                            </div>

                            {application.status === 'approved' && application.formAccessGranted && (
                              <button
                                onClick={() => handleAccessForm(application)}
                                className="flex items-center px-4 py-2 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Access Form
                              </button>
                            )}

                            {!application.formAccessGranted && (
                              <div className="flex items-center text-orange-500">
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="text-sm">Pending Approval</span>
                              </div>
                            )}
                          </div>

                          {application.formAccessUsed && application.formAccessUsedAt && (
                            <div className="mt-2 text-xs text-gray-500">
                              Form previously accessed on: {new Date(application.formAccessUsedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cedula Details Section */}
                  {application.type === 'Cedula' && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Full Name:</span> {application.title.replace('Cedula - ', '')}</div>
                        <div><span className="font-medium">Date of Birth:</span> {application.dateOfBirth}</div>
                        <div><span className="font-medium">Place of Birth:</span> {application.placeOfBirth}</div>
                        <div><span className="font-medium">Sex:</span> {application.sex}</div>
                        <div><span className="font-medium">Civil Status:</span> {application.maritalStatus}</div>
                        <div><span className="font-medium">Profession:</span> {application.profession}</div>
                        <div><span className="font-medium">Yearly Income:</span> ₱{application.yearlyIncome?.toLocaleString()}</div>
                        <div><span className="font-medium">TIN:</span> {application.tin}</div>
                        <div className="col-span-2"><span className="font-medium">Address:</span> {application.address}</div>
                        <div className="col-span-2"><span className="font-medium">Purpose:</span> {application.purpose}</div>
                      </div>
                    </div>
                  )}

                  {/* Timeline Steps */}
                  <div className="relative mt-6">
                    {application.steps.map((step, index) => (
                      <div key={step.name} className="mb-8 flex items-start">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(step)} text-white shrink-0`}>
                          {step.name.includes('Payment') ?
                            React.createElement(DollarSign, { size: 20 }) :
                            React.createElement(step.icon, { size: 20 })
                          }
                        </div>

                        {/* Vertical Line */}
                        {index < application.steps.length - 1 && (
                          <div
                            className={`absolute left-5 w-0.5 ${step.completed ? "bg-green-500" : step.rejected ? "bg-red-500" : "bg-gray-300"}`}
                            style={{
                              top: 40,
                              height: "calc(100% - 80px)",
                              transform: "translateX(-50%)"
                            }}
                          ></div>
                        )}

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <h3 className={`font-medium ${
                            step.rejected ? "text-red-600" :
                            step.current ? "text-blue-600" :
                            step.completed ? "text-green-600" : "text-gray-500"
                          }`}>
                            {step.name.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>

                          {step.date && (
                            <p className="text-sm text-gray-500 mt-1">{step.date}</p>
                          )}

                          {step.message && (
                            <div className={`mt-2 p-3 rounded-lg text-sm ${
                              step.rejected ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                            }`}>
                              {step.message}
                            </div>
                          )}

                          {!step.completed && !step.current && !step.rejected && (
                            <p className="text-sm text-gray-400 mt-1">Pending</p>
                          )}

                          {/* NEW: Requirements block moved under "In Progress" step (applications only) */}
                          {step.name === 'InProgress' && application.type !== 'Payment Receipt' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Requirements
                              </h3>
                              {(() => {
                                const reqState = requirementsByApp[application.id];

                                // Might happen when opening first time
                                if (!reqState) {
                                  loadRequirementsForApplication(application);
                                  return (
                                    <div className="text-sm text-gray-500">
                                      Loading requirements…
                                    </div>
                                  );
                                }

                                if (reqState.loading) {
                                  return (
                                    <div className="text-sm text-gray-500">
                                      Loading requirements…
                                    </div>
                                  );
                                }

                                if (!reqState.items || reqState.items.length === 0) {
                                  return (
                                    <div className="text-sm text-gray-500">
                                      No requirements have been attached yet.
                                    </div>
                                  );
                                }

                                return (
                                  <div className="bg-white border rounded">
                                    <div className="grid grid-cols-12 bg-gray-100 text-xs text-gray-600 font-semibold px-3 py-2">
                                      <div className="col-span-5">Name</div>
                                      <div className="col-span-3">Template</div>
                                      <div className="col-span-4">Your Upload</div>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                      {reqState.items.map((item) => (
                                        <div
                                          key={item.requirement_id}
                                          className="grid grid-cols-12 items-center px-3 py-2 border-t text-sm"
                                        >
                                          <div className="col-span-5">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500">
                                              Attached{' '}
                                              {item.uploaded_at
                                                ? new Date(item.uploaded_at).toLocaleString()
                                                : ''}
                                            </div>
                                          </div>
                                          <div className="col-span-3 flex items-center gap-2">
                                            {item.template_url ? (
                                              <a
                                                href={item.template_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                Download template
                                              </a>
                                            ) : (
                                              <span className="text-gray-400">—</span>
                                            )}

                                            {/* Show inline fill button when this requirement is the Electrical Filled Form */}
                                            {String(item.name).toLowerCase().includes("electrical permit filled form") && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const appId = parseAppId(application.id);
                                                  setElectricalContext({
                                                    applicationId: appId,
                                                    requirementId: item.requirement_id,
                                                    templateUrl: item.template_url || null,
                                                  });
                                                  setOpenElectricalForm(true);
                                                }}
                                                className="ml-2 px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                                              >
                                                Fill online
                                              </button>
                                            )}
                                          </div>
                                          <div className="col-span-3 flex items-center gap-2">
                                            {item.template_url ? (
                                              <a
                                                href={item.template_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                Download template
                                              </a>
                                            ) : (
                                              <span className="text-gray-400">—</span>
                                            )}
                                            {/* Electrical: open inline form */}
                                            {includesCI(item.name, "Electrical Permit Filled Form") && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const appId = parseAppId(application.id);
                                                  setElectricalContext({
                                                    applicationId: appId,
                                                    requirementId: item.requirement_id,
                                                    templateUrl: item.template_url || null,
                                                  });
                                                  setOpenElectricalForm(true);
                                                }}
                                                className="ml-2 px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                                              >
                                                Fill online
                                              </button>
                                            )}

                                            {/* Electronics: open inline form */}
                                            {includesCI(item.name, "Electronics Permit Filled Form") && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const appId = parseAppId(application.id);
                                                  setElectronicsContext({
                                                    applicationId: appId,
                                                    requirementId: item.requirement_id,
                                                    templateUrl: item.template_url || null,
                                                  });
                                                  setOpenElectronicsForm(true);
                                                }}
                                                className="ml-2 px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                                              >
                                                Fill online
                                              </button>
                                            )}
                                            {includesCI(item.name, "Fencing Permit Filled Form") && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const appId = parseAppId(application.id);
                                                  setFencingContext({
                                                    applicationId: appId,
                                                    requirementId: item.requirement_id,
                                                    templateUrl: item.template_url || null,
                                                  });
                                                  setOpenFencingForm(true);
                                                }}
                                                className="ml-2 px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                                              >
                                                Fill online
                                              </button>
                                            )}
                                            
                                            {includesCI(item.name, "Plumbing Permit Filled Form") && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const appId = parseAppId(application.id);
                                                  setPlumbingContext({
                                                    applicationId: appId,
                                                    requirementId: item.requirement_id,
                                                    templateUrl: item.template_url || null,
                                                  });
                                                  setOpenPlumbingForm(true);
                                                }}
                                                className="ml-2 px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                                              >
                                                Fill online
                                              </button>
                                            )}
                                            {/* Business Permit: open inline form */}
                                            {(
                                              includesCI(item.name, "business permit") &&
                                              (
                                                includesCI(item.name, "lgu") ||
                                                includesCI(item.name, "verification") ||
                                                includesCI(item.name, "filled") ||
                                                includesCI(item.name, "final")
                                              )
                                            ) && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const appId = parseAppId(application.id);
                                                  setBusinessContext({
                                                    applicationId: appId,
                                                    templateUrl: item.template_url || null,
                                                  });
                                                  setOpenBusinessForm(true);
                                                }}
                                                className="ml-2 px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                                              >
                                                {/* Fill online */}
                                              </button>
                                            )}
                                          </div>

                                          <div className="col-span-4">
                                            {item.user_file_url ? (
                                              <div className="flex flex-col gap-1">
                                                {/* Existing view link + timestamp */}
                                                <div className="flex items-center gap-2">
                                                  <a
                                                    href={item.user_file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-green-600 hover:underline"
                                                  >
                                                    View your file
                                                  </a>
                                                  <span className="text-xs text-gray-500">
                                                    (
                                                    {item.user_uploaded_at
                                                      ? new Date(item.user_uploaded_at).toLocaleString()
                                                      : ''}
                                                    )
                                                  </span>
                                                </div>

                                                {/* 🔥 NEW: Change / Re-upload button */}
                                                <div className="flex items-center gap-2">
                                                  <label className="inline-flex items-center px-2 py-1 text-xs border rounded cursor-pointer text-indigo-600 hover:bg-indigo-50">
                                                    <input
                                                      type="file"
                                                      className="hidden"
                                                      onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                          replaceUserRequirement(
                                                            application,
                                                            item.requirement_id,
                                                            file
                                                          );
                                                        }
                                                        e.target.value = '';
                                                      }}
                                                    />
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Change / Re-upload file
                                                  </label>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="file"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      uploadUserRequirement(
                                                        application,
                                                        item.requirement_id,
                                                        file
                                                      );
                                                    }
                                                    e.target.value = '';
                                                  }}
                                                />
                                                <span className="text-xs text-gray-500">
                                                  PDF/JPG/PNG
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* NEW: Comments block – show comments for THIS step + user replies */}
                          {application.type !== 'Payment Receipt' && (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                              <h3 className="font-medium text-indigo-800 mb-3 flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Messages from the Municipal Office
                              </h3>

                              {(() => {
                                const cState = commentsByApp[application.id];

                                if (!cState) {
                                  loadCommentsForApplication(application);
                                  return (
                                    <div className="text-sm text-gray-500">Loading messages…</div>
                                  );
                                }

                                if (cState.loading) {
                                  return (
                                    <div className="text-sm text-gray-500">Loading messages…</div>
                                  );
                                }

                                // 🔥 FILTER COMMENTS MATCHING THE CURRENT STEP NAME
                                const stepKey = normalizeStageKey(step.name);

                                // figure out the "current" step for this application (fallback to first)
                                const currentStep =
                                  application.steps?.find((st) => st.current) || application.steps?.[0];
                                const currentKey = currentStep ? normalizeStageKey(currentStep.name) : stepKey;

                                const filtered = cState.items.filter((c) => {
                                  const commentKey = normalizeStageKey(c.status_at_post);

                                  // If no status was stored (older Cedula comments), show them on the CURRENT stage
                                  if (!commentKey) {
                                    return stepKey === currentKey;
                                  }

                                  // Normal case: match exact stage
                                  return commentKey === stepKey;
                                });

                                const inputKey = `${application.id}_${currentKey}`;
                                const textValue = userCommentText[inputKey] || "";
                                const isCurrentStage = stepKey === currentKey;
                                const sending = !!sendingComment[inputKey];

                                if (!filtered.length && !isCurrentStage) {
                                  return (
                                    <div className="text-sm text-gray-500">
                                      No messages for this stage of your application.
                                    </div>
                                  );
                                }

                                return (
                                  <>
                                    {filtered.length > 0 && (
                                      <div className="space-y-3">
                                        {filtered.map((c) => (
                                          <div key={c.id} className="bg-white border rounded-md p-3">
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                              {c.comment}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-500">
                                              {c.author_role === 'employee'
                                                ? 'Municipal staff'
                                                : c.author_role === 'user'
                                                  ? 'You'
                                                  : (c.author_role || 'Staff')}
                                              {' • '}
                                              {c.created_at
                                                ? new Date(c.created_at).toLocaleString()
                                                : ''}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Comment composer – only on current stage */}
                                    {isCurrentStage && (
                                      <div className="mt-4 border-t border-indigo-100 pt-3">
                                        <label className="block text-xs font-medium text-indigo-900 mb-1">
                                          Ask a question or reply
                                        </label>
                                        <textarea
                                          className="w-full border border-indigo-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                                          rows={3}
                                          placeholder="Type your message here…"
                                          value={textValue}
                                          onChange={(e) =>
                                            setUserCommentText((prev) => ({
                                              ...prev,
                                              [inputKey]: e.target.value,
                                            }))
                                          }
                                        />
                                        <div className="mt-2 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => handleSendComment(application, currentKey, inputKey)}
                                            disabled={sending || !textValue.trim()}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition ${
                                              sending || !textValue.trim()
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                          >
                                            {sending && (
                                              <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                                            )}
                                            Send
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {!filtered.length && isCurrentStage && (
                                      <div className="mt-1 text-xs text-gray-500">
                                        No messages yet for this stage. You can send a message above.
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>

{application.type === 'Business Permit' && expandedCards[application.id] && (
  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
    <h3 className="font-medium text-amber-800 mb-3 flex items-center">
      <DollarSign className="h-4 w-4 mr-2" />
      Business Permit Assessment & Fees
    </h3>
    
    {(() => {
      const assessmentState = assessmentsByApp[application.id];
      
      if (!assessmentState) {
        // Trigger load if not already loaded
        loadAssessmentForApplication(application);
        return (
          <div className="text-sm text-gray-500">
            Loading assessment information...
          </div>
        );
      }

      if (assessmentState.loading) {
        return (
          <div className="text-sm text-gray-500 flex items-center">
            <RefreshCcw className="h-3 w-3 mr-2 animate-spin" />
            Loading assessment information...
          </div>
        );
      }

      if (!assessmentState.data) {
        return (
          <div className="text-sm text-gray-500">
            No fee assessment has been created yet. Please wait for municipal office assessment.
          </div>
        );
      }

      const assessment = assessmentState.data;
      const fees = assessment.fees;
      const items = assessment.items || {};

      // Check if items is an array or object
      const itemArray = Array.isArray(items) ? items : Object.entries(items);

      return (
        <div className="space-y-4">
          {/* Assessment Summary */}
          <div className="bg-white rounded border p-4">
            <h4 className="font-medium text-gray-800 mb-3">Fee Assessment Summary</h4>
            
            {/* Assessment Items Table */}
            {itemArray.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left font-medium text-gray-700">Description</th>
                      <th className="py-2 px-3 text-left font-medium text-gray-700">Amount</th>
                      <th className="py-2 px-3 text-left font-medium text-gray-700">Penalty/Surcharge</th>
                      <th className="py-2 px-3 text-left font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {itemArray.map((item, index) => {
                      const isArray = Array.isArray(items);
                      const description = isArray ? item.Description || item.description : item[0];
                      const amount = isArray ? item.Amount || item.amount || 0 : item[1]?.Amount || item[1]?.amount || 0;
                      const penalty = isArray ? item.Penalty || item.penalty || 0 : item[1]?.Penalty || item[1]?.penalty || 0;
                      const total = parseFloat(amount) + parseFloat(penalty);

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-gray-700">{description}</td>
                          <td className="py-2 px-3 text-gray-700">₱{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 text-gray-700">₱{parseFloat(penalty || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">
                            ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No detailed items in assessment
              </div>
            )}

            {/* Totals Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Total LGU Fees:</span>
                <span className="font-medium text-lg text-blue-600">
                  ₱{fees.total_fees_lgu.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Fire Safety Inspection Fee (15%):</span>
                <span className="font-medium text-lg text-orange-600">
                  ₱{fees.fsif_15.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-2">
                <span className="font-bold text-gray-800">Grand Total Amount Due:</span>
                <span className="font-bold text-2xl text-green-600">
                  ₱{fees.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Assessment Metadata */}
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Assessment created: {new Date(assessment.created_at).toLocaleString()}</span>
                <span>Status: {assessment.status || 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Instructions
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              Please proceed to the municipal treasurer's office to pay the assessed fees.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Present this assessment summary at the payment counter</li>
              <li>• Payment can be made via cash, check, or online payment</li>
              <li>• Keep the official receipt for your records</li>
              <li>• Submit the payment receipt to complete your application</li>
            </ul>
            
            {/* Payment Status Indicator */}
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">Not yet paid</span>
                </div>
              <button
  onClick={() => {
    const assessmentState = assessmentsByApp[application.id];
    if (assessmentState?.data) {
      setSelectedAssessment(assessmentState.data);
      setSelectedBusinessId(parseAppId(application.id));
      setShowPaymentModal(true);
    }
  }}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
>
  Make Payment
</button>
              </div>
            </div>
          </div>

          {/* Assessment Note */}
          <div className="text-xs text-gray-500 italic">
            Note: This assessment was generated by the municipal office. Fees are subject to verification.
            For questions about this assessment, please contact the municipal business permit and licensing office.
          </div>
        </div>
      );
    })()}
  </div>
)}
{showPaymentModal && selectedAssessment && (
  <BusinessAssessmentPaymentModal
    isOpen={showPaymentModal}
    onClose={() => {
      setShowPaymentModal(false);
      setSelectedAssessment(null);
      setSelectedBusinessId(null);
    }}
    assessment={selectedAssessment}
    businessPermitId={selectedBusinessId}
    onPaymentSuccess={(paymentResult) => {
      // Refresh assessments and applications
      const app = applications.find(a => parseAppId(a.id) === selectedBusinessId);
      if (app) {
        loadAssessmentForApplication(app);
        fetchAllPermitData(); // Refresh the entire list to show new payment
      }
    }}
  />
)}
                  {/* Requirements info for Payment Receipts (no uploads) */}
                  {application.type === 'Payment Receipt' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Requirements
                      </h3>
                      <div className="text-sm text-gray-500">
                        Payment receipts do not have document requirements.
                      </div>
                    </div>
                  )}


                  {/* Additional Information Section */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Need Help?</h3>
                    <p className="text-sm text-blue-700">
                      If you have any questions about your application, please contact the municipal office at (555) 123-4567 or email support@municipality.gov
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {openElectricalForm && electricalContext && (
          <ElectricalInlineForm
            applicationId={electricalContext.applicationId}
            requirementId={electricalContext.requirementId}
            templateUrl={electricalContext.templateUrl}
            onClose={() => setOpenElectricalForm(false)}
            onSubmitted={() => {
              // refresh requirements for that card so the uploaded/attached PDF appears
              const app = applications.find(a => parseAppId(a.id) === electricalContext.applicationId && a.type === "Electrical Permit");
              if (app) loadRequirementsForApplication(app);
            }}
          />
        )}
        {openElectronicsForm && electronicsContext && (
          <ElectronicsInlineForm
            applicationId={electronicsContext.applicationId}
            requirementId={electronicsContext.requirement_id}
            templateUrl={electronicsContext.templateUrl}
            onClose={() => setOpenElectronicsForm(false)}
            onSubmitted={() => {
              const app = applications.find(
                a => parseAppId(a.id) === electronicsContext.applicationId && a.type === "Electronics Permit"
              );
              if (app) loadRequirementsForApplication(app);
            }}
          />
        )}
        {openFencingForm && fencingContext && (
          <FencingInlineForm
            applicationId={fencingContext.applicationId}
            requirementId={fencingContext.requirementId}
            templateUrl={fencingContext.templateUrl}
            onClose={() => setOpenFencingForm(false)}
            onSubmitted={() => {
              const app = applications.find(
                a => parseAppId(a.id) === fencingContext.applicationId && a.type === "Fencing Permit"
              );
              if (app) loadRequirementsForApplication(app);
            }}
          />
        )}
        {openPlumbingForm && plumbingContext && (
          <PlumbingInlineForms
            applicationId={plumbingContext.applicationId}
            onClose={() => setOpenPlumbingForm(false)}
            onSubmitted={() => {
              const app = applications.find(
                a => parseAppId(a.id) === plumbingContext.applicationId && a.type === "Plumbing Permit"
              );
              if (app) loadRequirementsForApplication(app);
            }}
          />
        )}
        {openBusinessForm && businessContext && (
          <BusinessinlineForms
            applicationId={businessContext.applicationId}
            templateUrl={businessContext.templateUrl}
            onClose={() => setOpenBusinessForm(false)}
            onSubmitted={() => {
              const app = applications.find(
                a => parseAppId(a.id) === businessContext.applicationId && a.type === "Business Permit"
              );
              if (app) loadRequirementsForApplication(app);
            }}
          />
        )}
        {openUpdateModal && updateContext && (
          <UserUpdateModal
            open={openUpdateModal}
            applicationType={updateContext.appType}
            applicationId={updateContext.appId}
            displayTitle={updateContext.application.title}
            currentStatus={updateContext.application.status}
            onClose={() => {
              setOpenUpdateModal(false);
              setUpdateContext(null);
            }}
            onUpdated={() => {
              setOpenUpdateModal(false);
              setUpdateContext(null);
              fetchAllPermitData(); // refresh list + show updated values
            }}
          />
        )}

      </div>
      <UFooter />
    </div>
  );
}

export default DocumentStatusTracker;
