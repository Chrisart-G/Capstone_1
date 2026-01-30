// src/modals/NewModalContents.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import {
  // re-use existing modals from the old file
  CedulaModalContent,
  ElectricalPermitModalContent,
  PlumbingPermitModalContent,
  ElectronicsPermitModalContent,
  BuildingPermitModalContent,
  FencingPermitModalContent,
} from "./ModalContents";

const API_BASE_URL = "http://localhost:8081";

/* ----------------------------- helpers ----------------------------- */

// copied from ModalContents.jsx
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

// same mapping as in ModalContents.jsx – we still need this
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

// for comment status label
function niceStatusLabel(raw = "") {
  if (!raw) return "Unknown";
  return String(raw)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*   VIEW-ONLY ATTACHED REQUIREMENTS + COMMENTS + INLINE FORMS        */
/* ------------------------------------------------------------------ */

function BusinessAttachedRequirementsPanelForNewDash({ selectedApplication }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentFilter, setCommentFilter] = useState("all");

  const applicationType = useMemo(
    () => typeToApiSlug(selectedApplication?.type),
    [selectedApplication]
  );
  const applicationId = useMemo(
    () => appIdFromSelected(selectedApplication),
    [selectedApplication]
  );

  const safeOrigin =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.origin) ||
    "http://localhost:8081";
  const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

  // State for inline forms
  const [showInlineForms, setShowInlineForms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch user data for department filtering
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/auth/userinfo`, {
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
      const response = await axios.get(`${baseURL}/api/check-session`, {
        withCredentials: true,
      });

      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        await fetchUserData();
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Get department from user data
  const departmentRaw = (
    userData?.department ||
    userData?.dept_name ||
    userData?.department_name ||
    userData?.office ||
    ""
  )
    .toString()
    .toLowerCase();

  // Department checks
  const isMPDO = departmentRaw.includes("mpdo") || departmentRaw.includes("planning");
  const isMEO = departmentRaw.includes("meo") || departmentRaw.includes("environment") || departmentRaw.includes("solid waste");
  const isMHO = departmentRaw.includes("mho") || departmentRaw.includes("health") || departmentRaw.includes("sanitation");
  const isMAO = departmentRaw.includes("mao") || departmentRaw.includes("agriculture");
  
  // Check if user has any department access
  const hasDepartmentAccess = isMPDO || isMEO || isMHO || isMAO;
const CONDITION_CHOICES = {
    zoning: [
      "Missing barangay clearance for business location",
      "No certified true copy of land title / tax declaration",
      "No lease contract / owner's authorization attached",
      "Missing vicinity map / lot plan signed by GE",
      "Business activity not clearly allowed in this zone",
    ],
    fitness: [
      "Missing approved building permit and signed plans",
      "No structural stability certificate from civil engineer",
      "No electrical inspection report",
      "No fire safety inspection certificate",
      "Emergency exits / pathways not compliant",
    ],
    environment: [
      "No solid waste management plan submitted",
      "No contract with accredited garbage hauler",
      "No segregated trash bins (bio/recyclable/residual)",
      "No DENR/EMB clearance for special waste (if applicable)",
      "Improper waste storage area observed",
    ],
    sanitation: [
      "No sanitary permit for establishment",
      "No health certificates for food handlers",
      "No water potability test submitted",
      "Comfort room not compliant with sanitation standards",
      "No record of pest control services",
    ],
    market: [
      "No stall award/contract attached",
      "Unpaid market stall rental (no OR presented)",
      "No registration/ID as authorized stallholder",
      "No business permit copy for stall",
      "No approved electrical load permit for stall",
    ],
    agriculture: [
      "No veterinary health certificate for animals/meat",
      "No quarantine clearance for agri products",
      "No supplier accreditation/registration",
      "No records of product origin/traceability",
      "No proper storage area for agri products",
    ],
    default: [
      "Incomplete application form",
      "Missing valid government ID",
      "Missing latest tax clearance / OR",
      "No barangay business clearance attached",
      "Other documentary deficiency",
    ],
  };
  // 6 sections for inline forms
  const emptySec = { action: "", deficiencies: {}, remarks: "" };
  const [zoning, setZoning] = useState(emptySec);
  const [fitness, setFitness] = useState(emptySec);
  const [environment, setEnvironment] = useState(emptySec);
  const [sanitation, setSanitation] = useState(emptySec);
  const [market, setMarket] = useState(emptySec);
  const [agriculture, setAgriculture] = useState(emptySec);

  // helper: absolute URL for files
  const toAbsoluteURL = (maybeUrlOrPath) => {
    if (!maybeUrlOrPath) return null;
    const s = String(maybeUrlOrPath).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${baseURL}${path}`;
  };

  // Load saved draft if exists
  useEffect(() => {
    let gone = false;
    async function loadDraft() {
      if (!applicationId) return;
      
      try {
        const q = new URLSearchParams({ application_id: String(applicationId) });
        const r = await fetch(`${baseURL}/api/user/business/form?${q}`, { credentials: "include" });
        const j = await r.json();
        
        if (gone) return;
        if (j?.success && j.draft) {
          setZoning({ ...emptySec, ...j.draft.zoning });
          setFitness({ ...emptySec, ...j.draft.fitness });
          setEnvironment({ ...emptySec, ...j.draft.environment });
          setSanitation({ ...emptySec, ...j.draft.sanitation });
          setMarket({ ...emptySec, ...j.draft.market });
          setAgriculture({ ...emptySec, ...j.draft.agriculture });
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
    
    loadDraft();
    return () => { gone = true; };
  }, [applicationId, baseURL]);

  // load attachments + comments (view-only)
  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!applicationType || !applicationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [r, c] = await Promise.all([
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
        ]);

        if (!mounted) return;

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

        setItems(normalizeItems(r.data?.items || []));
        setComments(c.data?.items || []);
      } catch (e) {
        console.error(
          "[NewModalContents] Failed to load attachments/comments:",
          e
        );
      } finally {
        mounted && setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [applicationType, applicationId, refreshTick, baseURL]);

  const hasItems = items && items.length > 0;

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

  // Find the Business Permit LGU Form template
  const businessLguFormItem = items.find(
    (item) => 
      item.file_path && 
      item.file_path.toLowerCase().includes('business') && 
      item.file_path.toLowerCase().includes('lgu') &&
      item.file_path.toLowerCase().includes('form')
  );

  // Inline forms functions
  function setAction(updater, value) { updater(s => ({ ...s, action: value })); }
  function setDef(updater, idx, val) { updater(s => ({ ...s, deficiencies: { ...(s.deficiencies || {}), [idx]: val } })); }
  function setRemarks(updater, val)  { updater(s => ({ ...s, remarks: val })); }

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

    // 🔹 1–5 fields with dropdown + free typing
  const DefInputs = ({ secKey, sec, setSec }) => {
    const choices = CONDITION_CHOICES[secKey] || CONDITION_CHOICES.default;

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((i) => {
          const idx = String(i);
          const listId = `${secKey}-def-${idx}`;
          return (
            <div key={idx}>
              <input
                list={listId}
                className="border rounded px-2 py-1 text-sm text-center w-full"
                placeholder={idx}
                value={sec.deficiencies?.[idx] || ""}
                onChange={(e) => setDef(setSec, idx, e.target.value)}
              />
              <datalist id={listId}>
                {choices.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
          );
        })}
      </div>
    );
  };


  // Define sections with their department access
  const sections = [
    { 
      key: "zoning",      
      title: "1. Zoning Ordinance",          
      state: zoning,      
      set: setZoning,
      accessibleBy: ["MPDO"], // Only MPDO can access
      show: isMPDO
    },
    { 
      key: "fitness",     
      title: "2. Fitness for Occupancy",     
      state: fitness,     
      set: setFitness,
      accessibleBy: ["MPDO"], // Only MPDO can access
      show: isMPDO
    },
    { 
      key: "environment", 
      title: "3. Solid Waste / Environment", 
      state: environment, 
      set: setEnvironment,
      accessibleBy: ["MEO"], // Only MEO can access
      show: isMEO
    },
    { 
      key: "sanitation",  
      title: "4. Sanitation Code",           
      state: sanitation,  
      set: setSanitation,
      accessibleBy: ["MHO"], // Only MHO can access
      show: isMHO
    },
    { 
      key: "market",      
      title: "5. Public Market",             
      state: market,      
      set: setMarket,
      accessibleBy: ["MEO"], // Only MEO can access
      show: isMEO
    },
    { 
      key: "agriculture", 
      title: "6. Agriculture Office",        
      state: agriculture, 
      set: setAgriculture,
      accessibleBy: ["MAO"], // Only MAO can access
      show: isMAO
    },
  ];

  // Filter sections based on user's department
  const filteredSections = sections.filter(section => section.show);

  return (
    <div
      className="space-y-5 mt-6"
      key={`newdash-arp-${applicationId ?? "na"}`}
      style={{ isolation: "isolate" }}
    >
      {/* ---------------- Attached Requirements (view-only) -------------- */}
      <div className="bg-white border rounded-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-700">
            Attached Requirements
          </h4>
          <p className="text-[11px] text-gray-400">
            View-only in this dashboard
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 mt-3">
            Loading attached requirements…
          </p>
        ) : hasItems ? (
          <>
            {/* LGU Form Section with Toggle Button */}
            {businessLguFormItem && hasDepartmentAccess && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
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
                                <DefInputs secKey={sec.key} sec={sec.state} setSec={sec.set} />

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

            {/* Other Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items
                .filter(item => item !== businessLguFormItem) // Exclude the LGU form from the main list
                .map((it) => (
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
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            No requirements attached yet.
          </p>
        )}
      </div>

      {/* ----------------------------- Comments ---------------------------- */}
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
                if (!commentText.trim() || !applicationType || !applicationId)
                  return;
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
                  console.error("[NewModalContents] add comment failed:", e);
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*      Business Permit Modal for *NEW* Employee Dashboard only       */
/*      (NO LGU VERIFICATION & NO ASSESSMENT SECTIONS HERE)           */
/* ------------------------------------------------------------------ */

export function BusinessPermitModalContent({ selectedApplication }) {
  const [esignFile, setEsignFile] = useState(null);
  const [esignUploading, setEsignUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const applicationId = appIdFromSelected(selectedApplication);

  const safeOrigin =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.origin) ||
    "http://localhost:8081";
  const baseURL = (API_BASE_URL || safeOrigin).replace(/\/+$/, "");

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/auth/userinfo`, {
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

  useEffect(() => {
    fetchUserData();
  }, []);

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
      formData.append("pdf", esignFile);
      formData.append("application_id", String(applicationId));

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

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Business Permit Information
      </h3>

      {/* ---------------------- Basic Info ----------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p>
            <strong>Business Name:</strong>{" "}
            {selectedApplication.business_name}
          </p>
          <p>
            <strong>Trade Name:</strong> {selectedApplication.trade_name}
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
            <strong>Email:</strong> {selectedApplication.business_email}
          </p>
          <p>
            <strong>Phone Number:</strong>{" "}
            {selectedApplication.business_telephone}
          </p>
        </div>
        <div className="space-y-2">
          <p>
            <strong>TIN Number:</strong> {selectedApplication.tin_no}
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

      {/* ------------------- Owner Info ------------------- */}
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

      {/* -------------- Uploaded Requirements + E-signed -------------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-700">
            Uploaded Requirements
          </h4>

          <div className="flex items-center gap-2">
            <input
              id="business-esign-upload-new"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleEsignChange}
            />
            <label
              htmlFor="business-esign-upload-new"
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
              <div key={index} className="text-sm text-gray-500 italic">
                {doc.label}: Not uploaded
              </div>
            )
          )}
        </div>
      </div>

      {/* IMPORTANT: this custom panel has NO LGU table & NO Assessment */}
      <BusinessAttachedRequirementsPanelForNewDash
        selectedApplication={{
          ...selectedApplication,
          type: "Business Permit",
        }}
      />
    </div>
  );
}

// Re-export the other modals directly from the original file
export {
  CedulaModalContent,
  ElectricalPermitModalContent,
  PlumbingPermitModalContent,
  ElectronicsPermitModalContent,
  BuildingPermitModalContent,
  FencingPermitModalContent,
};