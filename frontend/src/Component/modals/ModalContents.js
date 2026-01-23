// src/modals/ModalContents.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AttachRequirementFromLibraryModal from "./AttachRequirementFromLibraryModal";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:8081";

/* ----------------------------- helpers ----------------------------- */

function typeToApiSlug(typeLabel = "") {
  const t = (typeLabel || "").toLowerCase();
  if (t.includes("business")) return "business";
  if (t.includes("electrical")) return "electrical";
  if (t.includes("plumbing")) return "plumbing";
  if (t.includes("electronics")) return "electronics";
  if (t.includes("building")) return "building";
  if (t.includes("fencing")) return "fencing";
  if (t.includes("cedula")) return "cedula";
  if (t.includes("mayor")) return "mayors";
  if (t.includes("renewal")) return "renewal_business";
  return t.replace(/\s+/g, "");
}

function appIdFromSelected(selectedApplication) {
  return (  
    selectedApplication?.cedula_id ??
    selectedApplication?.BusinessP_id ??
    selectedApplication?.application_id ??
    selectedApplication?.applicationId ??
    selectedApplication?.id ??
    null
  );
}


// Pretty label for status strings like "in-review" → "In Review"
function niceStatusLabel(raw = "") {
  if (!raw) return "Unknown";
  return String(raw)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/* ------------------ shared panel: attached requirements ------------------ */

function AttachedRequirementsPanel({ selectedApplication }) {
   const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [refreshTick, setRefreshTick] = useState(0);
  const [attachOpen, setAttachOpen] = useState(false);
  const [openMayors, setOpenMayors] = useState(false);
  const [openCedulaFinal, setOpenCedulaFinal] = useState(false);
  
  // Add these state variables after the existing ones:
  const [showInlineForms, setShowInlineForms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 6 sections for inline forms - can be declared here
  const emptySec = { action: "", deficiencies: {}, remarks: "" };
  const [zoning, setZoning] = useState(emptySec);
  const [fitness, setFitness] = useState(emptySec);
  const [environment, setEnvironment] = useState(emptySec);
  const [sanitation, setSanitation] = useState(emptySec);
  const [market, setMarket] = useState(emptySec);
  const [agriculture, setAgriculture] = useState(emptySec);

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

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-session`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        await fetchUserData();
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Session check error:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DECLARE departmentRaw FIRST
  const departmentRaw = (
    userData?.department ||
    userData?.dept_name ||
    userData?.department_name ||
    userData?.office ||
    ""
  )
    .toString()
    .toLowerCase();

  // THEN declare department checks that depend on departmentRaw
  const isMPDO = departmentRaw.includes("mpdo");
  const isMEO = departmentRaw.includes("meo") || departmentRaw.includes("environment") || departmentRaw.includes("solid waste");
  const isMHO = departmentRaw.includes("mho") || departmentRaw.includes("health") || departmentRaw.includes("sanitation");
  const isMAO = departmentRaw.includes("mao") || departmentRaw.includes("agriculture");

  // Check if user has any department access for LGU verification
  const hasDepartmentAccess = isMPDO || isMEO || isMHO || isMAO;

  const rawStatus = (
    selectedApplication?.application_status ??
    selectedApplication?.status ??
    ""
  )
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const isApproved = ["approved", "ready-for-pickup", "released"].includes(
    rawStatus
  );


  // Optional default “Kind of Business” from record if you store it
  const defaultKindOfBiz =
    selectedApplication?.primary_business_line ||
    selectedApplication?.line_of_business ||
    "";

  const applicationType = useMemo(
    () => typeToApiSlug(selectedApplication?.type),
    [selectedApplication]
  );
  const applicationId = useMemo(
    () => appIdFromSelected(selectedApplication),
    [selectedApplication]
  );

  // ---------- helpers ----------
  const safeOrigin =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.origin) ||
    "http://localhost:8081";

  const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

  // turn "uploads/..." or "/uploads/..." into absolute http url
  const toAbsoluteURL = (maybeUrlOrPath) => {
    if (!maybeUrlOrPath) return null;
    const s = String(maybeUrlOrPath).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s; // already absolute
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${baseURL}${path}`;
  };

  // comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentFilter, setCommentFilter] = useState("all");

  const isBusinessApp =
    applicationType === "business" ||
    applicationType === "renewal_business" ||
    applicationType === "special_sales";

  const isBuildingApp = applicationType === "building";

  // ===================== BUILDING DOC CHECKLIST =====================
  const BUILDING_DOC_ROWS = [
    [
      "unified_form",
      "Five (5) copies of filled up Unified Form for Building Permit and FSEC",
    ],
    [
      "locational_clearance",
      "Filled up Application Form for Locational Clearance",
    ],
    [
      "rpt_and_taxdec",
      "Current Real Property Tax Receipt & Tax Declaration (5 Copies)",
    ],
    [
      "oct_tct_deed",
      "OCT / TCT / Deed of Sale / Contract of Sale / Contract of Lease (5 Copies)",
    ],
    ["lot_vicinity_map", "Lot Plan / Vicinity Map (5 Copies)"],
    [
      "survey_plan",
      "Five (5) Sets of Survey Plan, Design Plans and Documents such as:",
    ],
    ["arch", "Architectural"],
    ["specs", "Specifications (5 Copies)"],
    ["civil_structural", "Civil / Structural"],
    ["voltage_drop", "Voltage Drop (5 Copies)"],
    ["electrical", "Electrical"],
    ["mechanical", "Mechanical"],
    ["sanitary", "Sanitary"],
    ["plumbing", "Plumbing"],
    ["electronics", "Electronics"],
    ["geodetic", "Geodetic"],
    ["fire_protection_plan", "Fire Protection Plan (if applicable)"],
    [
      "prc_license",
      "Four (4) photocopies of Valid License (PRC ID) of Signing Professionals",
    ],
    [
      "estimated_value",
      "Notarized Estimated Value of the Building/Structure (5 Copies)",
    ],
    [
      "csafety_program",
      "Construction Safety and Health Program (if applicable)",
    ],
    ["affidavit", "Affidavit of Undertaking"],
    ["soil_test", "Soil Test (for 3-storey and above) (5 Copies)"],
    [
      "structural_analysis",
      "Structural Analysis (for 2-storey and above) (5 Copies)",
    ],
    ["ctc_owner", "CTC of Owner (5 Copies)"],
  ];

  const [buildingChecks, setBuildingChecks] = useState(() =>
    Object.fromEntries(BUILDING_DOC_ROWS.map(([k]) => [k, false]))
  );
  const [buildingRemarks, setBuildingRemarks] = useState("complete"); // "complete" or "incomplete"

  const toggleBuildingDoc = (key) =>
    setBuildingChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  // ===================== BUSINESS: LGU VERIFICATION ROWS =====================
  // extended to include office/agency (for context) but still use only the key for state
  const LGU_ROWS = [
    [
      "occupancy_permit",
      "Occupancy Permit (For New)",
      "Office of the Building Official",
    ],
    [
      "zoning_clearance",
      "Zoning (New and Renewal)",
      "Municipal Planning & Dev't. Office",
    ],
    ["barangay_clearance", "Barangay Clearance (For Renewal)", "Barangay"],
    [
      "sanitary_clearance",
      "Sanitary Permit / Health Clearance",
      "Municipal Health Office",
    ],
    [
      "environment_certificate",
      "Municipal Environmental Certificate",
      "Municipal Environment Office",
    ],
    [
      "market_clearance",
      "Market Clearance (For Stall Holders)",
      "Office of the Market Supervisor",
    ],
    [
      "fire_safety_certificate",
      "Valid Fire Safety Inspection Certificate",
      "Bureau of Fire Protection",
    ],
    [
      "river_floating_fish",
      "Registration/Verification (River Tanab, Oyster Culture, Floating Fish Cage Operator)",
      "Municipal Agriculture Office",
    ],
  ];

  // yes / no / not_needed
  const [checks, setChecks] = useState(() =>
    Object.fromEntries(LGU_ROWS.map(([k]) => [k, "not_needed"]))
  );

  // NEW: status per row (how other offices acted) – pending/approved/declined
  const [lguStatus, setLguStatus] = useState(() =>
    Object.fromEntries(LGU_ROWS.map(([k]) => [k, "pending"]))
  );

  const updateCheck = (key, value) =>
    setChecks((prev) =>
      prev[key] === value ? prev : { ...prev, [key]: value }
    );

  const [generating, setGenerating] = useState(false);

  // --------- Assessment (Business only) ---------
  const ASSESS_ROWS = [
    { code: "gross_sales_tax", label: "Gross Sales Tax" },
    { code: "delivery_vans_trucks_tax", label: "Tax on Delivery Vans/Trucks" },
    {
      code: "combustible_storage_tax",
      label:
        "Tax on Storage for Combustible/Flammable or Explosive Substances",
    },
    {
      code: "signboard_billboards_tax",
      label: "Tax on Signboard/Billboards",
    },
    { code: "mayors_permit_fee", label: "Mayor’s Permit Fee" },
    { code: "garbage_charges", label: "Garbage Charges" },
    {
      code: "trucks_vans_permit_fee",
      label: "Delivery Trucks/Vans Permit Fee",
    },
    { code: "sanitary_inspection_fee", label: "Sanitary Inspection Fee" },
    { code: "building_inspection_fee", label: "Building Inspection Fee" },
    { code: "electrical_inspection_fee", label: "Electrical Inspection Fee" },
    { code: "mechanical_inspection_fee", label: "Mechanical Inspection Fee" },
    { code: "plumbing_inspection_fee", label: "Plumbing Inspection Fee" },
    {
      code: "signboard_renewal_fee",
      label: "Signboard/Billboard Renewal Fee",
    },
    {
      code: "combustible_sale_storage_fee",
      label:
        "Storage & Sale of Combustible/Flammable or Explosive Substance",
    },
    { code: "others_fee", label: "Others" },
  ];
  const sanitizeNum = (v) => String(v || "").replace(/[^\d.]/g, "");
  const [assessment, setAssessment] = useState(() =>
    Object.fromEntries(
      ASSESS_ROWS.map((r) => [r.code, { amount: "", penalty: "" }])
    )
  );
  const setAssessCell = (code, field, val) =>
    setAssessment((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: sanitizeNum(val) },
    }));
  const computedAssessment = useMemo(() => {
    let lgu = 0;
    const rows = {};
    for (const r of ASSESS_ROWS) {
      const amt = Number(assessment[r.code]?.amount || 0);
      const pen = Number(assessment[r.code]?.penalty || 0);
      const tot = +(amt + pen).toFixed(2);
      rows[r.code] = { amount: amt, penalty: pen, total: tot };
      lgu += tot;
    }
    const fsif15 = +(lgu * 0.15).toFixed(2);
    return { rows, totalFeesLgu: +lgu.toFixed(2), fsif15 };
  }, [assessment]);

  const handleSaveAssessment = async () => {
    if (!applicationId) return;
    await axios.post(
      `${baseURL}/api/business-permit/assessment/save`,
      { application_id: applicationId, items: computedAssessment.rows },
      { withCredentials: true }
    );
    alert("Assessment saved.");
  };
// Helper functions for inline forms
function setAction(updater, value) { updater(s => ({ ...s, action: value })); }
function setDef(updater, idx, val) { updater(s => ({ ...s, deficiencies: { ...(s.deficiencies || {}), [idx]: val } })); }
function setRemarks(updater, val)  { updater(s => ({ ...s, remarks: val })); }

const ActionRadios = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-4 text-sm">
    <label className="inline-flex items-center gap-2">
      <input type="radio" checked={value === "approved"} onChange={() => onChange("approved")} />
      Approved
    </label>
    <label className="inline-flex items-center gap-2">
      <input type="radio" checked={value === "approved_with_conditions"} onChange={() => onChange("approved_with_conditions")} />
      Approved with Conditions
    </label>
    <label className="inline-flex items-center gap-2">
      <input type="radio" checked={value === "denied"} onChange={() => onChange("denied")} />
      Denied
    </label>
  </div>
);

const DefInputs = ({ sec, setSec }) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
    {[1,2,3,4,5].map(i => (
      <input 
        key={i} 
        className="border rounded px-2 py-1 text-sm text-center" 
        placeholder={`${i}`}
        value={sec.deficiencies?.[String(i)] || ""} 
        onChange={e => setDef(setSec, String(i), e.target.value)} 
      />
    ))}
  </div>
);

// Define sections with their department access
const sections = [
  { 
    key: "zoning",      
    title: "1. Zoning Ordinance",          
    state: zoning,      
    set: setZoning,
    accessibleBy: ["MPDO"],
    show: isMPDO
  },
  { 
    key: "fitness",     
    title: "2. Fitness for Occupancy",     
    state: fitness,     
    set: setFitness,
    accessibleBy: ["MPDO"],
    show: isMPDO
  },
  { 
    key: "environment", 
    title: "3. Solid Waste / Environment", 
    state: environment, 
    set: setEnvironment,
    accessibleBy: ["MEO"],
    show: isMEO
  },
  { 
    key: "sanitation",  
    title: "4. Sanitation Code",           
    state: sanitation,  
    set: setSanitation,
    accessibleBy: ["MHO"],
    show: isMHO
  },
  { 
    key: "market",      
    title: "5. Public Market",             
    state: market,      
    set: setMarket,
    accessibleBy: ["MEO"],
    show: isMEO
  },
  { 
    key: "agriculture", 
    title: "6. Agriculture Office",        
    state: agriculture, 
    set: setAgriculture,
    accessibleBy: ["MAO"],
    show: isMAO
  },
];
const buildPayload = () => {
  const payload = {};
  
  // Only include sections that the user has access to
  if (isMPDO) {
    payload.zoning = zoning;
    payload.fitness = fitness;
  }
  if (isMEO) {
    payload.environment = environment;
    payload.market = market;
  }
  if (isMHO) {
    payload.sanitation = sanitation;
  }
  if (isMAO) {
    payload.agriculture = agriculture;
  }
  
  return payload;
};

async function saveDraft() {
  if (!applicationId) return;
  
  setSaving(true);
  try {
    const payload = buildPayload();
    const r = await fetch(`${baseURL}/api/user/business/form/save`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: applicationId, data: payload }),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.message || "Failed to save draft.");
    alert("Draft saved.");
  } catch (e) {
    alert(e.message || "Server error while saving.");
  } finally {
    setSaving(false);
  }
}

// Update the submitNow function:
async function submitNow() {
  if (!applicationId) return;
  
  setSubmitting(true);
  try {
    const payload = buildPayload();
    
    // Determine which department is submitting
    let department = '';
    if (isMPDO) department = 'MPDO';
    else if (isMEO) department = 'MEO';
    else if (isMHO) department = 'MHO';
    else if (isMAO) department = 'MAO';
    
    const r = await fetch(`${baseURL}/api/user/business/form/submit`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        application_id: applicationId, 
        data: payload,
        department: department 
      }),
    });
    
    const j = await r.json();
    if (!j.success) throw new Error(j.message || "Failed to submit.");
    
    let message = "Your section has been saved.";
    if (j.is_complete) {
      message += " All departments have completed their sections.";
    }
    
    alert(message);
    setRefreshTick((prev) => prev + 1);
    setShowInlineForms(false);
  } catch (e) {
    alert(e.message || "Server error while submitting.");
  } finally {
    setSubmitting(false);
  }
}

// Update the saveDraft function:
async function saveDraft() {
  if (!applicationId) return;
  
  setSaving(true);
  try {
    const payload = buildPayload();
    
    // Determine department
    let department = '';
    if (isMPDO) department = 'MPDO';
    else if (isMEO) department = 'MEO';
    else if (isMHO) department = 'MHO';
    else if (isMAO) department = 'MAO';
    
    const r = await fetch(`${baseURL}/api/user/business/form/save`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        application_id: applicationId, 
        data: payload,
        department: department 
      }),
    });
    
    const j = await r.json();
    if (!j.success) throw new Error(j.message || "Failed to save draft.");
    alert("Draft saved.");
  } catch (e) {
    alert(e.message || "Server error while saving.");
  } finally {
    setSaving(false);
  }
}
// Filter sections based on user's department
const filteredSections = sections.filter(section => section.show);
  // NEW: Generate LGU Form WITHOUT assessment (same endpoint, empty assessment)
  const handleGenerateLguOnly = async () => {
    if (!applicationType || !applicationId) return;
    const ok = window.confirm(
      "Generate the LGU form (without Assessment) and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURL}/api/business-permit/generate-form-with-assessment`,
        {
          application_type: applicationType,
          application_id: applicationId,
          checks,
          assessment: {}, // no assessment values
        },
        { withCredentials: true }
      );
      if (data?.success) {
        alert("LGU form generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        alert(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Generate LGU form (no assessment) failed:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate LGU form."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateWithAssessment = async () => {
    if (!applicationType || !applicationId) return;
    const ok = window.confirm(
      "Generate the LGU form including Assessment values?"
    );
    if (!ok) return;
    try {
      setGenerating(true);
      await handleSaveAssessment();
      const { data } = await axios.post(
        `${baseURL}/api/business-permit/generate-form-with-assessment`,
        {
          application_type: applicationType,
          application_id: applicationId,
          checks, // still the same endpoint you already use
          assessment: computedAssessment.rows,
        },
        { withCredentials: true }
      );
      if (data?.success) {
        alert("LGU form (with Assessment) generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        alert(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate with Assessment."
      );
    } finally {
      setGenerating(false);
    }
  };

  // --------- Electrical: generator (no auto-open) ---------
  const handleGenerateElectricalForm = async () => {
    if (!applicationId) return;
    const ok = window.confirm(
      "Generate the Electrical Permit form and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURL}/api/electrical-permit/generate-form`,
        { application_id: applicationId },
        { withCredentials: true }
      );

      if (data?.success) {
        setRefreshTick((n) => n + 1);
        alert("Electrical form generated and attached.");
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Electrical generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Electrical form."
      );
    } finally {
      setGenerating(false);
    }
  };

  // --------- Electronics: generator (no auto-open) ---------
  const handleGenerateElectronicsForm = async () => {
    if (!applicationId) return;
    const ok = window.confirm(
      "Generate the Electronics Permit form and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURL}/api/electronics-permit/generate-form`,
        { application_id: applicationId },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Electronics form generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Electronics generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Electronics form."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateFencingForm = async () => {
    if (!applicationId) return;
    const ok = window.confirm(
      "Generate the Fencing Permit form and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURL}/api/fencing-permit/generate-form`,
        { application_id: applicationId },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Fencing form generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Fencing generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Fencing form."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePlumbingForm = async () => {
    if (!applicationId) return;
    const ok = window.confirm(
      "Generate the Plumbing Permit form and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURL}/api/plumbing-permit/generate-form`,
        { application_id: applicationId },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Plumbing form generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Plumbing generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Plumbing form."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ───────── Mayor's Permit: submit handler (calls backend) ─────────
  const handleGenerateMayorsPermit = async (payload) => {
    if (!applicationId) return;
    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURL}/api/mayors-permit/generate-final`,
        {
          application_id: applicationId,
          permit_no: payload.permit_no,
          kind_of_business: payload.kind_of_business,
          date_of_issuance: payload.date_of_issuance, // server can default if omitted
          mayor_signature_path: payload.mayor_signature_path || null, // <- signature from modal
        },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Final Mayor’s Permit generated and attached.");
        setOpenMayors(false);
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Mayor’s Permit generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Mayor’s Permit."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ───────── Cedula Final: submit handler (calls backend) ─────────
  const handleGenerateCedulaFinal = async (payload) => {
    if (!applicationId) return;

    try {
      setGenerating(true);

      const { data } = await axios.post(
        `${baseURL}/api/cedula/generate-final`,
        {
          application_id: applicationId,
          taxable_amount: payload.taxable_amount,
          tax_due: payload.tax_due,
          interest: payload.interest,
          total_amount: payload.total_amount,
          treasurer_signature_path: payload.treasurer_signature_path || null,
        },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Cedula Final PDF generated and attached.");
        setOpenCedulaFinal(false);
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Cedula Final generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Cedula Final."
      );
    } finally {
      setGenerating(false);
    }
  };

  // --------- Building: generator (no auto-open) ---------
  const handleGenerateBuildingForm = async () => {
    if (!applicationId) return;

    const ok = window.confirm(
      "Generate the Building Permit form (with Page 1 documentary checklist) and attach it to this application?"
    );
    if (!ok) return;

    try {
      setGenerating(true);

      const checksPayload = {
        docs: buildingChecks,
        remarks: buildingRemarks,
      };

      const { data } = await axios.post(
        `${baseURL}/api/building-permit/generate-form`,
        {
          application_id: applicationId,
          checks: checksPayload,
        },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Building form generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Building generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Building form."
      );
    } finally {
      setGenerating(false);
    }
  };
// Add this function near your other handler functions
const handleForceRefreshStatus = async () => {
  if (!applicationId) {
    alert('No application selected');
    return;
  }
  
  try {
    console.log('Force refreshing LGU status for application:', applicationId);
    
    const response = await axios.get(
      `${baseURL}/api/applications/lgu-requirements-status/${applicationId}`,
      { withCredentials: true }
    );
    
    console.log('Refresh response:', response.data);
    
    if (response.data?.success && response.data.statuses) {
      const backendStatuses = response.data.statuses;
      const newLguStatus = {};
      
      LGU_ROWS.forEach(([key]) => {
        if (backendStatuses[key]) {
          newLguStatus[key] = backendStatuses[key].status || 'pending';
        } else {
          newLguStatus[key] = 'pending';
        }
      });
      
      setLguStatus(newLguStatus);
      console.log('LGU status updated to:', newLguStatus);
      alert('LGU status refreshed successfully!');
    } else {
      alert('Failed to refresh LGU status: ' + (response.data?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error refreshing LGU status:', error);
    alert('Error refreshing LGU status: ' + error.message);
  }
};
  const handleGenerateCedulaForm = async () => {
    if (!applicationId) return;
    const ok = window.confirm(
      "Generate the Cedula form and attach it to this application?"
    );
    if (!ok) return;

    const safeOriginInner =
      (typeof window !== "undefined" &&
        window.location &&
        window.location.origin) ||
      "http://localhost:8081";
    const baseURLInner = (API_BASE_URL || safeOriginInner).replace(/\/+$/, "");

    try {
      setGenerating(true);
      const { data } = await axios.post(
        `${baseURLInner}/api/cedula-permit/generate-form`,
        { application_id: applicationId },
        { withCredentials: true }
      );

      if (data?.success) {
        alert("Cedula form generated and attached.");
        setRefreshTick((n) => n + 1);
      } else {
        throw new Error(data?.message || "Generation failed.");
      }
    } catch (e) {
      console.error("Cedula generate error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to generate Cedula form."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ===================== RESET STATE WHEN APP CHANGES =====================
  useEffect(() => {
    // Business LGU rows reset
    setChecks(Object.fromEntries(LGU_ROWS.map(([k]) => [k, "not_needed"])));
    setAssessment(
      Object.fromEntries(
        ASSESS_ROWS.map((r) => [r.code, { amount: "", penalty: "" }])
      )
    );

    // Building checklist reset
    setBuildingChecks(
      Object.fromEntries(BUILDING_DOC_ROWS.map(([k]) => [k, false]))
    );
    setBuildingRemarks("complete");

    // LGU status default back to pending
    setLguStatus(
      Object.fromEntries(LGU_ROWS.map(([k]) => [k, "pending"]))
    );
  }, [applicationType, applicationId]);


// ===================== LOAD ATTACHMENTS + COMMENTS + SAVED LGU STATE + LGU STATUS =====================
// ===================== LOAD ATTACHMENTS + COMMENTS + SAVED LGU STATE + LGU STATUS =====================
useEffect(() => {
  let mounted = true;
  async function load() {
    if (!applicationType || !applicationId) return;
    setLoading(true);
    try {
      console.log(`=== Loading data for application ${applicationId} ===`);
      
      // Fetch all data in parallel
      const [attachmentsResponse, commentsResponse, lguStatusResponse] = await Promise.all([
        axios.get(`${baseURL}/api/attached-requirements`, {
          withCredentials: true,
          params: {
            application_type: applicationType,
            application_id: applicationId,
          },
        }),
        axios.get(`${baseURL}/api/application-comments`, {
          withCredentials: true,
          params: {
            application_type: applicationType,
            application_id: applicationId,
          },
        }),
        // Fetch LGU requirements status
        axios.get(`${baseURL}/api/applications/lgu-requirements-status/${applicationId}`, {
          withCredentials: true,
        }).catch(err => {
          console.warn("LGU status endpoint error:", err.message);
          // Return a mock response for testing
          return { 
            data: { 
              success: true, 
              statuses: {
                occupancy_permit: { status: 'approved' },
                environment_certificate: { status: 'on-hold' }
              },
              message: "Using test data"
            } 
          };
        })
      ]);
      
      if (!mounted) return;

      // Normalize attachments
      const normalizeItems = (arr = []) =>
        arr.map((it) => {
          const fileUrl =
            it.file_url ||
            it.system_file_url ||
            it.pdf_path ||
            it.filepath ||
            it.file_path ||
            null;

          const userUrl =
            it.user_file_url ||
            it.user_pdf_path ||
            it.user_filepath ||
            it.user_file_path ||
            null;

          return { ...it, file_url: fileUrl, user_file_url: userUrl };
        });

      setItems(normalizeItems(attachmentsResponse.data?.items || []));
      setComments(commentsResponse.data?.items || []);

      // Load saved LGU checks from attachments response if available
      const lguState = attachmentsResponse.data?.lgu_state;
      if (lguState?.checks) {
        console.log('Found saved LGU checks:', lguState.checks);
        setChecks((prev) => ({ ...prev, ...lguState.checks }));
      }

      // ========== CRITICAL: Update LGU status with actual backend data ==========
      console.log('LGU Status API Response:', lguStatusResponse.data);
      
      if (lguStatusResponse.data?.success) {
        const backendStatuses = lguStatusResponse.data.statuses || {};
        console.log('Backend LGU Statuses:', backendStatuses);
        
        // Create new status object by mapping each LGU row to backend data
        const newLguStatus = {};
        
        LGU_ROWS.forEach(([key, label, office]) => {
          // Get status from backend, default to 'pending'
          const backendStatus = backendStatuses[key];
          
          if (backendStatus) {
            console.log(`Backend status for ${key}:`, backendStatus);
            newLguStatus[key] = backendStatus.status || 'pending';
          } else {
            console.log(`No backend status for ${key}, using default: pending`);
            newLguStatus[key] = 'pending';
          }
        });
        
        console.log('Final LGU status to set:', newLguStatus);
        setLguStatus(newLguStatus);
        
        // Log what we expect to see for environment_certificate
        const envCertStatus = newLguStatus['environment_certificate'];
        console.log(`Environment Certificate should show: ${envCertStatus}`);
      } else {
        console.warn('LGU status response not successful:', lguStatusResponse.data);
      }
      
    } catch (error) {
      console.error("Load failed:", error);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }
  
  load();
  
  return () => {
    mounted = false;
  };
}, [applicationType, applicationId, refreshTick, baseURL]);

  const hasItems = items?.length > 0;
// Find the Business Permit LGU Form template
const businessLguFormItem = items.find(
  (item) => 
    item.file_path && 
    item.file_path.toLowerCase().includes('business') && 
    item.file_path.toLowerCase().includes('lgu') &&
    item.file_path.toLowerCase().includes('form')
);
  const commentStatusOptions = useMemo(() => {
    const set = new Set();
    comments.forEach((c) => c.status_at_post && set.add(c.status_at_post));
    return [...set];
  }, [comments]);

  const filteredComments = useMemo(() => {
    if (commentFilter === "all") return comments;
    return comments.filter(
      (c) => (c.status_at_post || "") === commentFilter
    );
  }, [comments, commentFilter]);

  const handleRemoveRequirement = async (requirementId) => {
    if (!requirementId) return;
    if (
      !window.confirm(
        "Remove this attached requirement from the application?"
      )
    )
      return;
    try {
      await axios.post(
        `${baseURL}/api/attached-requirements/remove`,
        { requirement_id: requirementId },
        { withCredentials: true }
      );
      setRefreshTick((n) => n + 1);
    } catch (e) {
      console.error("Remove requirement failed:", e);
      alert("Failed to remove attached requirement.");
    }
  };

  const handleGenerateRequirements = async () => {
    if (!applicationType || !applicationId) return;
    if (
      !window.confirm(
        "Generate the 2-page Business Permit form (with applicant info + LGU verification) and attach it to this application?"
      )
    )
      return;

    try {
      setGenerating(true);
      const res = await axios.post(
        `${baseURL}/api/business-permit/generate-form`,
        { application_type: applicationType, application_id: applicationId, checks },
        { withCredentials: true }
      );
      if (res.data?.success) {
        alert("LGU form generated and attached successfully.");
        setRefreshTick((n) => n + 1);
      } else {
        alert("Generation failed: " + (res.data?.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Generate form failed:", e);
      alert("Failed to generate form. Check the console for details.");
    } finally {
      setGenerating(false);
    }
  };

  // ===================== BUSINESS LGU RADIO ROW =====================
  // ===================== BUSINESS LGU RADIO ROW =====================
const RadioRow = ({ fieldKey, label, office }) => {
  const groupName = `lgu-${applicationId ?? "app"}-${fieldKey}`;
  const value = checks[fieldKey];
  const status = (lguStatus[fieldKey] || "pending").toLowerCase();

  // FIXED: Enhanced status handling with all possible values
  const getStatusInfo = (status) => {
    const statusLower = status.toLowerCase();
    
    switch(statusLower) {
      case 'approved':
      case 'approved_with_conditions':
        return {
          color: 'text-green-600 bg-green-50',
          text: statusLower === 'approved_with_conditions' ? 'Approved (with conditions)' : 'Approved',
          icon: '✓',
          subtext: 'Verified'
        };
      case 'in-review':
        return {
          color: 'text-blue-600 bg-blue-50',
          text: 'In Review',
          icon: '⏳',
          subtext: 'Reviewing'
        };
      case 'on-hold':
        return {
          color: 'text-orange-600 bg-orange-50',
          text: 'On Hold',
          icon: '⏸️',
          subtext: 'On Hold'
        };
      case 'denied':
        return {
          color: 'text-red-600 bg-red-50',
          text: 'Denied',
          icon: '✗',
          subtext: 'Denied'
        };
      case 'pending':
      default:
        return {
          color: 'text-yellow-600 bg-yellow-50',
          text: 'Pending',
          icon: '⏳',
          subtext: 'Pending'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <tr>
      <td className="px-2 py-1 border align-top">
        <div className="font-medium">{label}</div>
        {office && (
          <div className="text-[11px] text-gray-500">{office}</div>
        )}
      </td>
      {["yes", "no", "not_needed"].map((option) => (
        <td key={option} className="px-2 py-1 border text-center">
          <label
            className="flex items-center justify-center w-full h-full cursor-pointer select-none"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="radio"
              name={groupName}
              value={option}
              checked={value === option}
              onChange={() => updateCheck(fieldKey, option)}
              className="cursor-pointer"
            />
          </label>
        </td>
      ))}
      {/* FIXED: Status column with proper handling for all status types */}
      <td className="px-2 py-1 border text-center">
        <div className="flex flex-col items-center gap-1 min-h-[40px] justify-center">
          <span
            className={`inline-flex items-center justify-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}
          >
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.text}
          </span>
          {statusInfo.subtext && (
            <span className="text-[9px] text-gray-500">
              {statusInfo.subtext}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};
  // ===================== GATE: are all YES docs approved? =====================
  // ===================== GATE: are all YES docs approved? =====================
const allRequiredDocsApproved = useMemo(() => {
  if (!isBusinessApp) return true;

  for (const [key] of LGU_ROWS) {
    if (checks[key] === "yes") {
      const s = (lguStatus[key] || "pending").toLowerCase();
      // Only allow if status is "approved" or "approved_with_conditions"
      // "on-hold", "in-review", "denied", "pending" should block assessment
      if (s !== "approved" && s !== "approved_with_conditions") {
        console.log(`Document ${key} is not approved. Status: ${s}`);
        return false;
      }
    }
  }
  return true;
}, [checks, lguStatus, isBusinessApp]);

  // ------------------- UI -------------------
  return (
    <div
      className="space-y-5"
      key={`arp-${applicationId}`}
      style={{ isolation: "isolate" }}
    >
      <div className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Attached Requirements
          </h4>
          <div className="flex items-center space-x-2">
            {!isMPDO &&   (
              <button
                onClick={handleGenerateRequirements}
                disabled={generating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Generate Applicant Requirements"}
              </button>
            )}
            {!isMPDO && isApproved  && (
              <button
                onClick={() => setOpenMayors(true)}
                disabled={generating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
                title="Visible only when the application is Approved / Ready for Pickup / Released"
              >
                {generating ? "Generating..." : "Generate Final Mayor’s Permit"}
              </button>
            )}

            {applicationType === "electrical" && (
              <button
                onClick={handleGenerateElectricalForm}
                disabled={generating}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Electrical: Generate Filled Form"}
              </button>
            )}
            {applicationType === "electronics" && (
              <button
                onClick={handleGenerateElectronicsForm}
                disabled={generating}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Electronics: Generate Filled Form"}
              </button>
            )}
            {applicationType === "fencing" && (
              <button
                onClick={handleGenerateFencingForm}
                disabled={generating}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Fencing: Generate Filled Form"}
              </button>
            )}
            {applicationType === "cedula" && (
              <>
                <button
                  onClick={handleGenerateCedulaForm}
                  disabled={generating}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
                >
                  {generating
                    ? "Generating..."
                    : "Cedula: Generate Filled Form"}
                </button>
                <button
                  onClick={() => setOpenCedulaFinal(true)}
                  disabled={generating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
                >
                  {generating
                    ? "Generating..."
                    : "Cedula: Fill Treasurer / Generate Final"}
                </button>
              </>
            )}

            {applicationType === "plumbing" && (
              <button
                onClick={handleGeneratePlumbingForm}
                disabled={generating}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Plumbing: Generate Filled Form"}
              </button>
            )}
            {applicationType === "building" && (
              <button
                onClick={handleGenerateBuildingForm}
                disabled={generating}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : "Building: Generate Filled Form"}
              </button>
            )}
                {!isMPDO && (
            <button
              onClick={() => setAttachOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded"
            >
              Attach From System
            </button>
            )}
            <button
              onClick={() => setRefreshTick((n) => n + 1)}
              className="text-xs px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 mt-3">
            Loading attached requirements…
          </p>
        ) : hasItems ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((it) => (
              <div
                key={`${it.requirement_id}-${it.file_path}-${it.uploaded_at}-${
                  it.user_uploaded_at || "na"
                }`}
                className="bg-gray-50 border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="pr-3 mb-2 md:mb-0">
                  <p className="text-sm font-medium text-gray-800">
                    {it.file_path || "Requirement"}
                  </p>
                  <p className="text-xs text-gray-500">
                    System attached:{" "}
                    {it.uploaded_at
                      ? new Date(it.uploaded_at).toLocaleString()
                      : "N/A"}
                  </p>
                  {it.user_uploaded_at && (
                    <p className="text-xs text-gray-500">
                      User uploaded:{" "}
                      {new Date(it.user_uploaded_at).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  
                  {it.file_url && (
                    <a
                      href={toAbsoluteURL(it.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs md:text-sm"
                    >
                      View Template
                    </a>
                  )}
                  {it.user_file_url && (
                    <a
                      href={toAbsoluteURL(it.user_file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-xs md:text-sm"
                    >
                      View User Upload
                    </a>
                  )}
                  {!it.file_url && !it.user_file_url && (
                    <span className="text-xs text-gray-400 italic">
                      No file
                    </span>
                  )}
                
                  <button
  type="button"
  onClick={() => handleRemoveRequirement(it.requirement_id)}
  disabled={applicationType === "business" && isMPDO} // Disable for Business application if MPDO
  className={`text-xs md:text-sm ${applicationType === "business" && isMPDO ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'} hover:underline ml-1`}
>
  Remove
</button>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            No requirements attached yet.
          </p>
        )}

        {/* Business-only: LGU verification + Assessment */}
        {(isBusinessApp || isBuildingApp) && (
          <div className="mt-5 border-t pt-4 space-y-6">
            {/* ===================== BUILDING: Documentary Requirements (Page 1) ===================== */}
            {isBuildingApp && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Building Permit Documentary Requirements (Page 1)
                </h5>
                <p className="text-xs text-gray-500 mb-3">
                  Check all documents that are required/attached for this
                  application. These will be encoded on Page 1 of the generated
                  Building Permit checklist PDF.
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-2 py-1 border">
                          Description
                        </th>
                        <th className="px-2 py-1 border text-center">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {BUILDING_DOC_ROWS.map(([fieldKey, label]) => (
                        <tr key={fieldKey}>
                          <td className="px-2 py-1 border align-top">
                            {label}
                          </td>
                          <td className="px-2 py-1 border text-center">
                            <input
                              type="checkbox"
                              className="cursor-pointer"
                              checked={!!buildingChecks[fieldKey]}
                              onChange={() => toggleBuildingDoc(fieldKey)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-medium text-gray-600">
                    Remarks:
                  </span>

                  <label className="inline-flex items-center gap-1 text-xs text-gray-700">
                    <input
                      type="radio"
                      name={`bldg-remarks-${applicationId ?? "app"}`}
                      value="complete"
                      checked={buildingRemarks === "complete"}
                      onChange={(e) => setBuildingRemarks(e.target.value)}
                    />
                    Complete Documents
                  </label>

                  <label className="inline-flex items-center gap-1 text-xs text-gray-700">
                    <input
                      type="radio"
                      name={`bldg-remarks-${applicationId ?? "app"}`}
                      value="incomplete"
                      checked={buildingRemarks === "incomplete"}
                      onChange={(e) => setBuildingRemarks(e.target.value)}
                    />
                    Incomplete Documents
                  </label>
                </div>
              </div>
            )}

            {/* ===================== BUSINESS: LGU Verification (Page 2) + Assessment ===================== */}
            {!isMPDO && isBusinessApp && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  LGU Verification of Documents (will appear on Page 2)
                </h5>
                <p className="text-xs text-gray-500 mb-3">
                  Set which documents are required for this application. These
                  choices will be checked/encoded on the second page of the
                  generated PDF. The Status column shows the action taken by the
                  corresponding office.
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-2 py-1 border">
                          Description / Office
                        </th>
                        <th className="px-2 py-1 border">Yes</th>
                        <th className="px-2 py-1 border">No</th>
                        <th className="px-2 py-1 border">Not needed</th>
                        <th className="px-2 py-1 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LGU_ROWS.map(([fieldKey, label, office]) => (
                        <RadioRow
                          key={fieldKey}
                          fieldKey={fieldKey}
                          label={label}
                          office={office}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border rounded-md p-4 mt-5">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Assessment of Applicable Fees
                  </h5>

                  {!allRequiredDocsApproved && (
                    <p className="text-xs text-red-600 mb-2">
                      Assessment is locked. All LGU documents that are marked
                      <span className="font-semibold"> "Yes" </span>
                      must first be{" "}
                      <span className="font-semibold">Approved</span> by the
                      corresponding offices.
                    </p>
                  )}
                  <button
  onClick={handleForceRefreshStatus}
  className="px-3 py-2 text-sm bg-amber-100 text-amber-800 rounded hover:bg-amber-200 border border-amber-300"
  title="Force refresh LGU status from database"
>
  🔄 Refresh LGU Status
</button>

                  {allRequiredDocsApproved && (
                    <>
                      <div className="grid grid-cols-[1fr_140px_160px_160px] gap-2 text-sm">
                        <div className="text-gray-500">Description</div>
                        <div className="text-gray-500">Amount</div>
                        <div className="text-gray-500">
                          Penalty/Surcharge
                        </div>
                        <div className="text-gray-500">Total</div>

                        {ASSESS_ROWS.map((r) => (
                          <React.Fragment key={r.code}>
                            <div className="py-1">{r.label}</div>
                            <input
                              inputMode="decimal"
                              className="border rounded px-2 py-1"
                              value={assessment[r.code].amount}
                              onChange={(e) =>
                                setAssessCell(
                                  r.code,
                                  "amount",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                            />
                            <input
                              inputMode="decimal"
                              className="border rounded px-2 py-1"
                              value={assessment[r.code].penalty}
                              onChange={(e) =>
                                setAssessCell(
                                  r.code,
                                  "penalty",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                            />
                            <div className="py-1 font-medium">
                              {computedAssessment.rows[r.code].total
                                ? computedAssessment.rows[
                                    r.code
                                  ].total.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })
                                : "—"}
                            </div>
                          </React.Fragment>
                        ))}

                        <div className="py-2 font-semibold text-right col-span-3">
                          TOTAL FEES for LGU
                        </div>
                        <div className="py-2 font-semibold">
                          {computedAssessment.totalFeesLgu.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </div>

                        <div className="py-2 font-semibold text-right col-span-3">
                          FIRE SAFETY INSPECTION FEE (15%)
                        </div>
                        <div className="py-2 font-semibold">
                          {computedAssessment.fsif15.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={handleSaveAssessment}
                          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Save Assessment
                        </button>
                        <button
                          disabled={generating}
                          onClick={handleGenerateWithAssessment}
                          className={`px-4 py-2 rounded text-white ${
                            generating
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          {generating
                            ? "Generating…"
                            : "Generate LGU Form (with Assessment)"}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Always-available LGU-only button */}
                  <div className="mt-3 flex justify-end">
                    <button
                      disabled={generating}
                      onClick={handleGenerateLguOnly}
                      className="px-4 py-2 text-sm rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                    >
                      {generating
                        ? "Generating LGU Form…"
                        : "Generate LGU Form (no Assessment)"}
                    </button>
                  </div>
                </div>
                        
              </div>
              
            )}
            {/* ------------------------ LGU Verification Inline Form ------------------------ */}
        {/* Only show for specific departments (MPDO, MEO, MHO, MAO) */}
        {isBusinessApp && hasDepartmentAccess && businessLguFormItem && (
          <div className="mt-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-gray-700">
                Business Permit LGU Verification
              </h5>
              <button
                onClick={() => setShowInlineForms(!showInlineForms)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {showInlineForms ? "Hide Form" : "Fill LGU Verification Form"}
              </button>
            </div>
            <div className="bg-gray-50 border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="pr-3 mb-2 md:mb-0">
                <p className="text-sm font-medium text-gray-800">
                  {businessLguFormItem.file_path || "Business Permit LGU Form"}
                </p>
                <p className="text-xs text-gray-500">
                  System attached:{" "}
                  {businessLguFormItem.uploaded_at
                    ? new Date(businessLguFormItem.uploaded_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {businessLguFormItem.file_url && (
                  <a
                    href={toAbsoluteURL(businessLguFormItem.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs md:text-sm"
                  >
                    View Template
                  </a>
                )}
                {businessLguFormItem.user_file_url && (
                  <a
                    href={toAbsoluteURL(businessLguFormItem.user_file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline text-xs md:text-sm"
                  >
                    View Filled Form
                  </a>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isMPDO && "You can fill sections 1 & 2 (Zoning & Fitness). "}
              {isMEO && "You can fill sections 3 & 5 (Environment & Market). "}
              {isMHO && "You can fill section 4 (Sanitation). "}
              {isMAO && "You can fill section 6 (Agriculture). "}
              Click "Fill LGU Verification Form" to review and submit your assigned sections.
            </p>

            {/* Inline Forms (shown when toggled) */}
            {showInlineForms && (
              <div className="mt-6 bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="text-sm font-semibold text-gray-700">
                    LGU Verification Sections
                  </h6>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {isMPDO && "MPDO Department"}
                    {isMEO && "MEO Department"}
                    {isMHO && "MHO Department"}
                    {isMAO && "MAO Department"}
                  </div>
                </div>
                
                {filteredSections.length > 0 ? (
                  <>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                      {filteredSections.map((sec) => (
                        <section key={sec.key} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800 text-sm">{sec.title}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {sec.accessibleBy.join(", ")}
                            </span>
                          </div>
                          <ActionRadios value={sec.state.action} onChange={val => setAction(sec.set, val)} />
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Conditions / Documentary Deficiency (1–5)</div>
                            <DefInputs sec={sec.state} setSec={sec.set} />
                          </div>
                          <label className="text-xs block">
                            <span className="block text-gray-600">Remarks</span>
                            <input
                              className="mt-1 w-full border rounded px-2 py-1 text-sm"
                              value={sec.state.remarks}
                              onChange={e => setRemarks(sec.set, e.target.value)}
                            />
                          </label>
                          <hr className="mt-2" />
                        </section>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-4 mt-4 border-t">
                      <button 
                        type="button" 
                        onClick={saveDraft} 
                        disabled={saving}
                        className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save Draft"}
                      </button>
                      <button 
                        type="button" 
                        onClick={submitNow} 
                        disabled={submitting}
                        className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {submitting ? "Submitting…" : "Submit"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">You don't have access to any LGU verification sections.</p>
                    <p className="text-xs mt-1">Please contact your administrator for access.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700">Comments</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Filter:</span>
            <select
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              <option value="all">All statuses</option>
              {commentStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {niceStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredComments?.length ? (
          <div className="space-y-3 mb-4">
            {filteredComments.map((c) => (
              <div key={c.id} className="bg-gray-50 border rounded p-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {c.comment}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    {c.author_role ? `${c.author_role} • ` : ""}
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : ""}
                  </div>
                  {c.status_at_post && (
                    <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {niceStatusLabel(c.status_at_post)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
        )}

        <div className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Add a comment for the applicant…"
            className="w-full border rounded p-2 text-sm"
          />
          <div className="flex justify-end">
            <button
              disabled={!commentText.trim() || commentSubmitting}
              onClick={async () => {
                if (!commentText.trim()) return;
                try {
                  setCommentSubmitting(true);
                  const rawStatusAtPost =
                    selectedApplication.application_status ??
                    selectedApplication.status ??
                    "";
                  await axios.post(
                    `${baseURL}/api/application-comments`,
                    {
                      application_type: applicationType,
                      application_id: applicationId,
                      comment: commentText,
                      status_at_post: String(rawStatusAtPost)
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                    },
                    { withCredentials: true }
                  );
                  setCommentText("");
                  setRefreshTick((n) => n + 1);
                } catch (e) {
                  console.error("Add comment failed:", e);
                  alert("Failed to add comment.");
                } finally {
                  setCommentSubmitting(false);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {commentSubmitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      </div>

      <AttachRequirementFromLibraryModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        applicationType={selectedApplication?.type || ""}
        applicationId={applicationId}
        onAttached={() => setRefreshTick((n) => n + 1)}
      />
      <MayorsPermitGenerateModal
        open={openMayors}
        onClose={() => setOpenMayors(false)}
        onSubmit={handleGenerateMayorsPermit}
        defaultKind={defaultKindOfBiz}
      />
      <CedulaFinalGenerateModal
        open={openCedulaFinal}
        onClose={() => setOpenCedulaFinal(false)}
        onSubmit={handleGenerateCedulaFinal}
      />
    </div>
  );
}



/* ---------------- existing simple upload modal (kept) ---------------- */
/* ───────────────────── Mayor’s Permit: small input modal ───────────────────── */
function MayorsPermitGenerateModal({ open, onClose, onSubmit, defaultKind }) {
  const [permitNo, setPermitNo] = useState("");
  const [kindOfBiz, setKindOfBiz] = useState(defaultKind || "");
  const [issuedAt, setIssuedAt] = useState(
    new Date().toISOString().slice(0, 10)
  ); // yyyy-mm-dd
  const [submitting, setSubmitting] = useState(false);

  // NEW: signature upload state
  const [sigFile, setSigFile] = useState(null);
  const [sigUploading, setSigUploading] = useState(false);
  const [sigDbPath, setSigDbPath] = useState("");   // '/uploads/...'
  const [sigPreview, setSigPreview] = useState(""); // http url for preview

  // Util to get baseURL (same pattern as above)
  const safeOrigin =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.origin) ||
    "http://localhost:8081";
  const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

  if (!open) return null;

async function uploadSignature() {
  if (!sigFile) {
    alert("Choose a PNG/JPG signature first.");
    return;
  }

  const safeOrigin =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.origin) ||
    "http://localhost:8081";
  const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

  const fd = new FormData();
  fd.append("signature", sigFile);

  const { data } = await axios.post(
    `${baseURL}/api/cedula/upload-treasurer-signature`,
    fd,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  if (data?.success) setSigDbPath(data.db_path);
  else alert(data?.message || "Upload failed.");
}


  async function handleSubmit() {
    if (!permitNo.trim() || !kindOfBiz.trim()) {
      alert("Permit No. and Kind of Business are required.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        permit_no: permitNo.trim(),
        kind_of_business: kindOfBiz.trim(),
        date_of_issuance: issuedAt,
        mayor_signature_path: sigDbPath || null, // send signature path to handler
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-5">
        <h3 className="text-base font-semibold mb-4">
          Generate Final Mayor’s Permit
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Permit No.
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={permitNo}
              onChange={(e) => setPermitNo(e.target.value)}
              placeholder="e.g., MP-2025-00123"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Kind of Business
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={kindOfBiz}
              onChange={(e) => setKindOfBiz(e.target.value)}
              placeholder="e.g., Retail / Sari-sari Store"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Date of Issuance
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Validity will be set to exactly 1 year from this date.
            </p>
          </div>

          {/* Mayor e-signature upload */}
          <div className="border-t pt-3 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mayor’s E-Signature (PNG/JPG)
            </label>

            {!sigPreview ? (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => setSigFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                <button
                  onClick={uploadSignature}
                  disabled={!sigFile || sigUploading}
                  className="bg-gray-800 hover:bg-black text-white text-xs font-medium py-2 px-3 rounded disabled:opacity-50"
                >
                  {sigUploading ? "Uploading…" : "Upload Signature"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={sigPreview}
                  alt="Mayor signature preview"
                  style={{ width: 140, height: "auto" }}
                  className="border rounded"
                />
                <button
                  onClick={() => {
                    setSigFile(null);
                    setSigDbPath("");
                    setSigPreview("");
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {sigDbPath && (
              <p className="text-xs text-green-700 mt-1">
                Attached: {sigDbPath}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${
              submitting ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {submitting ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CedulaFinalGenerateModal({ open, onClose, onSubmit }) {
  const [taxableAmount, setTaxableAmount] = useState("");
  const [taxDue, setTaxDue] = useState("");
  const [interest, setInterest] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [sigFile, setSigFile] = useState(null);
  const [sigDbPath, setSigDbPath] = useState("");

  if (!open) return null;

  async function uploadSignature() {
    const fd = new FormData();
    fd.append("signature", sigFile);
    const safeOrigin =
  (typeof window !== "undefined" &&
    window.location &&
    window.location.origin) ||
  "http://localhost:8081";
const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

const { data } = await axios.post(
  `${baseURL}/api/cedula/upload-treasurer-signature`,
  fd,
  { withCredentials: true }
);
    setSigDbPath(data.db_path);
  }

  async function handleSubmit() {
    await onSubmit({
      taxable_amount: taxableAmount,
      tax_due: taxDue,
      interest,
      total_amount: totalAmount,
      treasurer_signature_path: sigDbPath,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-5 w-full max-w-md">
        <h3 className="text-base font-semibold mb-4">Cedula Final Form</h3>
        <label className="block text-sm">Taxable Amount (₱)</label>
        <input className="border w-full mb-2 p-2 rounded" value={taxableAmount} onChange={(e)=>setTaxableAmount(e.target.value)} />
        <label className="block text-sm">Community Tax Due (₱)</label>
        <input className="border w-full mb-2 p-2 rounded" value={taxDue} onChange={(e)=>setTaxDue(e.target.value)} />
        <label className="block text-sm">Interest (₱)</label>
        <input className="border w-full mb-2 p-2 rounded" value={interest} onChange={(e)=>setInterest(e.target.value)} />
        <label className="block text-sm">Total Amount Paid (₱)</label>
        <input className="border w-full mb-2 p-2 rounded" value={totalAmount} onChange={(e)=>setTotalAmount(e.target.value)} />
        <div className="mt-3">
          <label className="block text-sm font-medium">Treasurer Signature (PNG/JPG)</label>
          <input type="file" accept="image/png, image/jpeg" onChange={(e)=>setSigFile(e.target.files?.[0])}/>
          <button onClick={uploadSignature} className="mt-2 px-3 py-2 bg-gray-700 text-white rounded">Upload Signature</button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded">Generate</button>
        </div>
      </div>
    </div>
  );
}

export function AttachRequirementsModal({ onClose }) {
  const [requirementPDF, setRequirementPDF] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") {
      setRequirementPDF(file);
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!requirementPDF) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("requirement", requirementPDF);

      const res = await axios.post(
        `${API_BASE_URL}/api/upload-requirement`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        alert("Requirement uploaded successfully.");
        onClose();
      } else {
        alert("Upload failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please check the console.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setRequirementPDF(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Attach Requirement (PDF)</h2>

        <input
          type="file"
          id="requirementUpload"
          accept="application/pdf"
          onChange={handleFileChange}
          hidden
        />
        <label
          htmlFor="requirementUpload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded cursor-pointer"
        >
          Upload PDF
        </label>

        {requirementPDF && (
          <p className="mt-2 text-sm text-gray-700">
            ✅ Attached:{" "}
            <span className="font-semibold">{requirementPDF.name}</span>
          </p>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!requirementPDF || uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Cedula (unchanged + panel) --------------------- */

export function CedulaModalContent({ selectedApplication }) {
  return (
    <div className="bg-indigo-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Cedula Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Full Name:</strong>{" "}
            {selectedApplication.name || "N/A"}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {selectedApplication.address || "N/A"}
          </p>
          <p>
            <strong>Place of Birth:</strong>{" "}
            {selectedApplication.place_of_birth || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {selectedApplication.date_of_birth
              ? new Date(
                  selectedApplication.date_of_birth
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Profession:</strong>{" "}
            {selectedApplication.profession || "N/A"}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Yearly Income:</strong> ₱
            {selectedApplication.yearly_income != null
              ? selectedApplication.yearly_income.toLocaleString()
              : "0.00"}
          </p>
          <p>
            <strong>Purpose:</strong>{" "}
            {selectedApplication.purpose || "N/A"}
          </p>
          <p>
            <strong>Sex:</strong> {selectedApplication.sex || "N/A"}
          </p>
          <p>
            <strong>Civil Status:</strong>{" "}
            {selectedApplication.civil_status || "N/A"}
          </p>
          <p>
            <strong>TIN:</strong> {selectedApplication.tin || "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-purple-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-3 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Submitted by:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.last_name || ""
          }`.trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <div>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{ ...selectedApplication, type: "Cedula" }}
      />
    </div>
  );
}

/* --------------- Electrical (removed local upload UI) ---------------- */

export function ElectricalPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Electrical Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          <p>
            <strong>Use or Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
          <p>
            <strong>Construction Owned:</strong>{" "}
            {selectedApplication.construction_owned}
          </p>
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address Information
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          }, ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}, Lot ${
            selectedApplication.location_lot_no || ""
          }, Blk ${selectedApplication.location_blk_no || ""}, TCT: ${
            selectedApplication.location_tct_no || ""
          }, Tax Dec: ${
            selectedApplication.location_tax_dec_no || ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Electrical Permit",
        }}
      />
    </div>
  );
}

/* ---------------- Business (kept uploads display) + panel ------------- */

export function BusinessPermitModalContent({ selectedApplication }) {
  // ▼▼▼ NEW: e-signature upload state & helpers ▼▼▼
  const [esignFile, setEsignFile] = useState(null);
  const [esignUploading, setEsignUploading] = useState(false);

  const applicationId = appIdFromSelected(selectedApplication);

  const safeOrigin =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.origin) ||
    "http://localhost:8081";
  const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

  const handleEsignChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("E-signed form must be a PDF file.");
      return;
    }
    setEsignFile(file);
  };

  const handleEsignUpload = async () => {
    if (!esignFile || !applicationId) return;

    try {
      setEsignUploading(true);
      const formData = new FormData();
      // backend usually expects both the file and the application id
      formData.append("pdf", esignFile);
      formData.append("application_id", String(applicationId));

      // NOTE: if your old endpoint name is different, adjust this URL only.
      const { data } = await axios.post(
        `${baseURL}/api/business-permit/upload-user-filled`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.success) {
        alert("E-signed Filled-up Form uploaded successfully.");
        setEsignFile(null);
        // parent list won’t auto-refresh selectedApplication,
        // so usually the easiest is to reload or re-open the modal.
        // window.location.reload();
      } else {
        alert(data?.message || "Upload failed.");
      }
    } catch (e) {
      console.error("E-signed form upload error:", e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to upload e-signed form."
      );
    } finally {
      setEsignUploading(false);
    }
  };
  // ▲▲▲ END: e-signature upload helpers ▲▲▲

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Business Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Business Name:</strong>{" "}
            {selectedApplication.business_name}
          </p>
          <p>
            <strong>Trade Name:</strong>{" "}
            {selectedApplication.trade_name}
          </p>
          <p>
            <strong>Application Type:</strong>{" "}
            {selectedApplication.application_type}
          </p>
          <p>
            <strong>Business Address:</strong>{" "}
            {selectedApplication.business_address}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {selectedApplication.business_email}
          </p>
          <p>
            <strong>Phone Number:</strong>{" "}
            {selectedApplication.business_telephone}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>TIN Number:</strong>{" "}
            {selectedApplication.tin_no}
          </p>
          <p>
            <strong>Registration Number:</strong>{" "}
            {selectedApplication.registration_no}
          </p>
          <p>
            <strong>Registration Date:</strong>{" "}
            {selectedApplication.registration_date
              ? new Date(
                  selectedApplication.registration_date
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.application_date
              ? new Date(
                  selectedApplication.application_date
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Payment Mode:</strong>{" "}
            {selectedApplication.payment_mode}
          </p>
          <p>
            <strong>Emergency Contact:</strong>{" "}
            {selectedApplication.emergency_contact}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Owner Information
        </h4>
        <p>
          <strong>Full Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_name || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Address:</strong>{" "}
          {selectedApplication.owner_address || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.owner_email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          {selectedApplication.owner_telephone || "N/A"}
        </p>
        <p>
          <strong>Mobile:</strong>{" "}
          {selectedApplication.owner_mobile || "N/A"}
        </p>
      </div>

      {/* ▼▼▼ UPDATED: header + e-signature upload controls ▼▼▼ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700">
            Uploaded Requirements
          </h4>

          <div className="flex items-center gap-2">
            {/* hidden input for E-signed PDF */}
            <input
              id="business-esign-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleEsignChange}
            />
            <label
              htmlFor="business-esign-upload"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Choose E-signed Form (PDF)
            </label>

            <button
              type="button"
              onClick={handleEsignUpload}
              disabled={!esignFile || esignUploading || !applicationId}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {esignUploading ? "Uploading…" : "Upload E-signed Form"}
            </button>
          </div>
        </div>

        {esignFile && (
          <p className="text-xs text-gray-500 mb-2">
            Selected file: <span className="font-medium">{esignFile.name}</span>
          </p>
        )}
      {/* ▲▲▲ END: e-signature UI ▲▲▲ */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Filled-up Form",
              path: selectedApplication.filled_up_forms,
            },
            {
              label: "SEC/DTI/CDA Certificate",
              path: selectedApplication.sec_dti_cda_certificate,
            },
            {
              label: "Local Sketch",
              path: selectedApplication.local_sketch,
            },
            {
              label: "Sworn Capital Statement",
              path: selectedApplication.sworn_statement_capital,
            },
            {
              label: "Tax Clearance",
              path: selectedApplication.tax_clearance,
            },
            {
              label: "Brgy. Clearance",
              path: selectedApplication.brgy_clearance_business,
            },
            { label: "Cedula", path: selectedApplication.cedula },
          ].map((doc, index) =>
            doc.path ? (
              <div
                key={index}
                className="bg-white border p-3 rounded shadow-sm"
              >
                <p className="font-medium">{doc.label}:</p>
                <a
                  href={`http://localhost:8081${doc.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View / Download
                </a>
              </div>
            ) : (
              <div
                key={index}
                className="text-sm text-gray-500 italic"
              >
                {doc.label}: Not uploaded
              </div>
            )
          )}
        </div>
      </div>
      {/* ▲▲ end requirements section ▲▲ */}

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Business Permit",
        }}
      />
    </div>
  );
}


/* -------------------- New four permit modals + panel ------------------- */

export function PlumbingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Plumbing Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>PP No:</strong> {selectedApplication.pp_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          {selectedApplication.other_scope_specify && (
            <p>
              <strong>Other Scope:</strong>{" "}
              {selectedApplication.other_scope_specify}
            </p>
          )}
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          } ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}, Lot ${
            selectedApplication.location_lot_no || ""
          }, Blk ${selectedApplication.location_blk_no || ""}, TCT ${
            selectedApplication.location_tct_no || ""
          }, Tax Dec ${
            selectedApplication.location_tax_dec_no || ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Plumbing Permit",
        }}
      />
    </div>
  );
}

export function ElectronicsPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Electronics Permit Information
      </h3>

      <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>EP No:</strong> {selectedApplication.ep_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          } ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""} ${
            selectedApplication.location_lot_no
              ? " • Lot " + selectedApplication.location_lot_no
              : ""
          }${
            selectedApplication.location_blk_no
              ? " • Blk " + selectedApplication.location_blk_no
              : ""
          }${
            selectedApplication.location_tct_no
              ? " • TCT " + selectedApplication.location_tct_no
              : ""
          }${
            selectedApplication.location_tax_dec_no
              ? " • Tax Dec " + selectedApplication.location_tax_dec_no
              : ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Electronics Permit",
        }}
      />
    </div>
  );
}

export function BuildingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Building Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
          <p>
            <strong>Form of Ownership:</strong>{" "}
            {selectedApplication.form_of_ownership}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.address_street || ""
          }, Brgy. ${selectedApplication.address_barangay || ""}, ${
            selectedApplication.address_city || ""
          } ${selectedApplication.address_zip_code || ""}`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}${
            selectedApplication.location_lot_no
              ? ", Lot " + selectedApplication.location_lot_no
              : ""
          }${
            selectedApplication.location_blk_no
              ? ", Blk " + selectedApplication.location_blk_no
              : ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Building Permit",
        }}
      />
    </div>
  );
}

export function FencingPermitModalContent({ selectedApplication }) {
  return (
    <div className="bg-yellow-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Fencing Permit Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Application No:</strong>{" "}
            {selectedApplication.application_no}
          </p>
          <p>
            <strong>FP No:</strong> {selectedApplication.fp_no}
          </p>
          <p>
            <strong>Building Permit No:</strong>{" "}
            {selectedApplication.building_permit_no}
          </p>
          <p>
            <strong>Scope of Work:</strong>{" "}
            {selectedApplication.scope_of_work}
          </p>
          <p>
            <strong>Ownership Form:</strong>{" "}
            {selectedApplication.ownership_form ||
              selectedApplication.form_of_ownership}
          </p>
          <p>
            <strong>Use/Character:</strong>{" "}
            {selectedApplication.use_or_character}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {selectedApplication.status}
          </p>
          <p>
            <strong>Email:</strong> {selectedApplication.email}
          </p>
          <p>
            <strong>Telephone:</strong>{" "}
            {selectedApplication.telephone_no}
          </p>
          <p>
            <strong>Application Date:</strong>{" "}
            {selectedApplication.created_at
              ? new Date(
                  selectedApplication.created_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {selectedApplication.updated_at
              ? new Date(
                  selectedApplication.updated_at
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Applicant Information
        </h4>
        <p>
          <strong>Name:</strong>{" "}
          {`${selectedApplication.first_name || ""} ${
            selectedApplication.middle_initial || ""
          } ${selectedApplication.last_name || ""}`
            .replace(/\s+/g, " ")
            .trim() || "N/A"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {selectedApplication.email || "N/A"}
        </p>
        <p>
          <strong>Telephone:</strong>{" "}
          {selectedApplication.telephone_no || "N/A"}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-md">
        <h4 className="text-md font-semibold mb-2 text-gray-700">
          Address/Location
        </h4>
        <p>
          <strong>Address:</strong>{" "}
          {`${selectedApplication.address_no || ""} ${
            selectedApplication.street ||
            selectedApplication.address_street ||
            ""
          }, Brgy. ${
            selectedApplication.barangay ||
            selectedApplication.address_barangay ||
            ""
          }, ${
            selectedApplication.city_municipality ||
            selectedApplication.address_city ||
            ""
          } ${
            selectedApplication.zip_code ||
            selectedApplication.address_zip_code ||
            ""
          }`}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {`${selectedApplication.location_street || ""}${
            selectedApplication.lot_no
              ? ", Lot " + selectedApplication.lot_no
              : ""
          }${
            selectedApplication.block_no1
              ? ", Blk " + selectedApplication.block_no1
              : ""
          }${
            selectedApplication.block_no2
              ? "–" + selectedApplication.block_no2
              : ""
          }${
            selectedApplication.tax_dec_no
              ? ", Tax Dec " + selectedApplication.tax_dec_no
              : ""
          }`}
        </p>
      </div>

      <AttachedRequirementsPanel
        selectedApplication={{
          ...selectedApplication,
          type: "Fencing Permit",
        }}
      />
    </div>
  );
}
