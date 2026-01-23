// src/Component/Employee/newemployeedash.js
import React, { useState, useEffect } from "react";
import { Search, Bell, User, FileText } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Header/Sidebar";
import { BusinessPermitModalContent } from "../modals/NewModalContents";

const API_BASE_URL = "http://localhost:8081";

// Only 4 buckets for this dashboard
const makeInitialBuckets = () => ({
  pending: [],
  inReview: [],
  onHold: [],
  approved: [],
});

export default function NewEmployeeDashboard() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeRowKey, setActiveRowKey] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // One permit type only: Business Permit
  const [applications, setApplications] = useState(makeInitialBuckets);

  // confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // on-hold modal
  const [onHoldModalOpen, setOnHoldModalOpen] = useState(false);
  const [onHoldModalApp, setOnHoldModalApp] = useState(null);

  const navigate = useNavigate();

  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  const toggleExpandApplication = (id) => {
    setExpandedApplication((prev) => (prev === id ? null : id));
  };

  const getApplicationKey = (app) => {
    const id = app.id || app.BusinessP_id;
    return `business-${id}`;
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setActiveRowKey(null);
  };

  /* ================= SESSION + USER ================= */

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
        await fetchApplications(); // only business
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

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/logout`,
        {},
        { withCredentials: true }
      );
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

  /* ================= FETCH LIST (Business only) ================= */

  const bucketByStatus = (statusRaw, buckets, app) => {
    const s = String(statusRaw || "").toLowerCase();
    switch (s) {
      case "pending":
        buckets.pending.push(app);
        break;
      case "in-review":
        buckets.inReview.push(app);
        break;
      case "on-hold":
        buckets.onHold.push(app);
        break;
      case "approved":
        buckets.approved.push(app);
        break;
      default:
        break;
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/new-employee/applications`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const buckets = makeInitialBuckets();
        response.data.applications.forEach((app) => {
          const appWithType = { ...app, type: "Business Permit" };
          bucketByStatus(appWithType.status, buckets, appWithType);
        });
        setApplications(buckets);
      }
    } catch (error) {
      console.error("Error fetching business applications:", error);
    }
  };

  const refreshAllLists = async () => {
    await fetchApplications();
  };

  const getCurrentApplications = () => {
    return [...applications[selectedTab]];
  };

  /* ================= VIEW HANDLER (Business only) ================= */

  const handleViewApplication = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/new-employee/applications/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSelectedApplication({
          ...response.data.application,
          type: "Business Permit",
        });
      } else {
        alert("Application not found.");
      }
    } catch (error) {
      console.error("Failed to fetch business application info:", error);
    }
  };

  /* ================= ACTIONS: ACCEPT / ON-HOLD / APPROVE ================= */

  const handleAccept = async (application) => {
    const appId = application.id || application.BusinessP_id;
    if (!appId) {
      alert("Missing application ID.");
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/new-employee/applications/${appId}/accept`;

      const res = await axios.put(
        url,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        await refreshAllLists();
        alert("Moved to In Review.");
      } else {
        alert(res.data.message || "Failed to accept application.");
      }
    } catch (err) {
      console.error("Accept error:", err);
      alert("Server error while accepting.");
    }
  };

  const handleMoveToOnHold = async (application) => {
    const appId = application.id || application.BusinessP_id;
    if (!appId) {
      alert("Missing application ID.");
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/new-employee/applications/${appId}/move-to-onhold`;

      const res = await axios.put(
        url,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        await refreshAllLists();
        alert("Moved to On Hold.");
      } else {
        alert(res.data.message || "Failed to move to On Hold.");
      }
    } catch (err) {
      console.error("Move-to-onhold error:", err);
      alert("Server error while moving to On Hold.");
    }
  };

  const handleApprove = async (application) => {
    const appId = application.id || application.BusinessP_id;
    if (!appId) {
      alert("Missing application ID.");
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/new-employee/applications/${appId}/move-to-approved`;

      const res = await axios.put(
        url,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        await refreshAllLists();
        alert("Application approved.");
      } else {
        alert(res.data.message || "Failed to approve application.");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Server error while approving.");
    }
  };

  const handleChangeStatusFromOnHold = async (application, targetStatus) => {
    const appId = application.id || application.BusinessP_id;
    if (!appId) {
      alert("Missing application ID.");
      return;
    }

    // Only three valid targets from On Hold
    if (targetStatus === "pending") {
      try {
        const url = `${API_BASE_URL}/api/new-employee/applications/${appId}/move-to-pending`;

        const res = await axios.put(
          url,
          {},
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        if (res.data.success) {
          await refreshAllLists();
          alert("Moved back to Pending.");
        } else {
          alert(res.data.message || "Failed to move to Pending.");
        }
      } catch (err) {
        console.error("Move-from-onhold->pending error:", err);
        alert("Server error.");
      }
      return;
    }

    if (targetStatus === "in-review") {
      await handleAccept(application);
      return;
    }

    if (targetStatus === "approved") {
      await handleApprove(application);
      return;
    }

    alert("Unsupported target status.");
  };

  /* ================= DETAIL PANEL ================= */

  const renderSelectedDetails = () => {
    if (!selectedApplication) {
      return (
        <div className="h-fullEnterprise flex items-center justify-center text-gray-400 text-sm px-4 py-8">
          Select an application to view its full details here.
        </div>
      );
    }

    const rawStatus =
      selectedApplication.status ||
      selectedApplication.application_status ||
      "pending";

    const statusClass =
      rawStatus === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : rawStatus === "approved"
        ? "bg-green-100 text-green-800"
        : rawStatus === "on-hold"
        ? "bg-gray-100 text-gray-800"
        : "bg-blue-100 text-blue-800"; // in-review or others

    const appTypeValue = (
      selectedApplication.applicationType ||
      selectedApplication.application_type ||
      ""
    )
      .toString()
      .toLowerCase();

    let headerTitle;
    if (appTypeValue === "new") {
      headerTitle = "Business Permit New";
    } else if (appTypeValue === "renewal") {
      headerTitle = "Business Permit Renewal";
    } else {
      headerTitle = "Business Permit Application";
    }

    return (
      <div className="flex flex-col">
        {/* Blue header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FileText size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{headerTitle}</h2>
                <p className="text-blue-100 text-sm">
                  Application Details &amp; Information
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-sm text-blue-100 truncate max-w-xs text-right">
              {selectedApplication.applicant_name ||
                selectedApplication.owner_full_name ||
                selectedApplication.owner_name ||
                selectedApplication.full_name ||
                selectedApplication.name ||
                "Applicant"}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-gray-50 space-y-4">
          <div className="flex justify-center">
            <span
              className={`px-4 py-2 rounded-full text-xs font-semibold ${statusClass}`}
            >
              Status: {String(rawStatus).toUpperCase()}
            </span>
          </div>

          <BusinessPermitModalContent
            selectedApplication={selectedApplication}
          />
        </div>
      </div>
    );
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case "pending":
        return "Pending";
      case "inReview":
        return "InReview";
      case "onHold":
        return "OnHold";
      case "approved":
        return "Approved";
      default:
        return tab;
    }
  };

  // Count badge per tab
  const getTabCount = (tab) => {
    return (applications[tab] || []).length;
  };

  const getTypeLabelForRow = (application) => {
    const appTypeRaw =
      application.applicationType ||
      application.application_type ||
      application.application_type_of_business ||
      "";
    const appType = String(appTypeRaw).toLowerCase();

    if (appType === "new") return "Business Permit New";
    if (appType === "renewal") return "Business Permit Renewal";

    return "Business Permit";
  };

  /* ================= RENDER ================= */

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        userData={userData}
        onLogout={handleLogout}
        isLoading={isLoading}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">New Employee Dashboard</h2>
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
                  0
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
          <div className="px-6 border-t">
            <div className="flex overflow-x-auto pb-2 gap-1">
              {["pending", "inReview", "onHold", "approved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-3 font-medium text-sm focus:outline-none whitespace-nowrap ${
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
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {getTabCount(tab)}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-gray-400 opacity-60 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* Main body */}
        <main className="flex-1 overflow-hidden p-6 bg-gray-50">
          <div className="h-full">
            <div className="space-y-4 overflow-y-auto pr-1 h-full">
              {getCurrentApplications().length > 0 ? (
                getCurrentApplications().map((application) => {
                  const rowKey = getApplicationKey(application);
                  const statusValue =
                    application.status ||
                    application.application_status ||
                    "pending";

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
                              {application.name ||
                                application.applicant_name ||
                                application.business_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                {getTypeLabelForRow(application)}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs">
                                Submitted on{" "}
                                {new Date(
                                  application.submitted ||
                                    application.created_at
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-wrap justify-end gap-2">
                          {/* View Info */}
                          <button
                            onClick={() => {
                              const appId =
                                application.id || application.BusinessP_id;
                              setActiveRowKey(rowKey);
                              setDetailsModalOpen(true);
                              handleViewApplication(appId);
                            }}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            View Info
                          </button>

                          {/* PENDING: Accept / On Hold / Approve */}
                          {statusValue === "pending" && (
  <>
    <button
      onClick={() =>
        openConfirmDialog(
          "Move to In Review",
          "Move this application to In Review?",
          async () => {
            await handleAccept(application);
          }
        )
      }
      className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
    >
      Accept
    </button>

    <button
      onClick={() =>
        openConfirmDialog(
          "Move to On Hold",
          "Move this application to On Hold?",
          async () => {
            await handleMoveToOnHold(application);
          }
        )
      }
      className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-gray-50 text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
    >
      Put On Hold
    </button>
  </>
)}

                          {/* IN-REVIEW: On Hold / Approve */}
                          {statusValue === "in-review" && (
                            <>
                              <button
                                onClick={() =>
                                  openConfirmDialog(
                                    "Move to On Hold",
                                    "Move this application to On Hold?",
                                    async () => {
                                      await handleMoveToOnHold(application);
                                    }
                                  )
                                }
                                className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-gray-50 text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                              >
                                Put On Hold
                              </button>
                              <button
                                onClick={() =>
                                  openConfirmDialog(
                                    "Approve Application",
                                    "Approve this application?",
                                    async () => {
                                      await handleApprove(application);
                                    }
                                  )
                                }
                                className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-green-50 text-green-800 ring-1 ring-green-100 hover:bg-green-100"
                              >
                                Approve
                              </button>
                            </>
                          )}

                          {/* ON-HOLD: Move From On Hold */}
                          {statusValue === "on-hold" && (
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

                          {/* APPROVED: optional Put On Hold */}
                          {statusValue === "approved" && (
                            <button
                              onClick={() =>
                                openConfirmDialog(
                                  "Move to On Hold",
                                  "Move this approved application to On Hold?",
                                  async () => {
                                    await handleMoveToOnHold(application);
                                  }
                                )
                              }
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold shadow-sm bg-gray-50 text-gray-800 ring-1 ring-gray-200 hover:bg-gray-100"
                            >
                              Put On Hold
                            </button>
                          )}
                        </div>
                      </div>

                      {expandedApplication === application.id && (
                        <div className="border-t border-gray-100 bg-white/60 backdrop-blur px-6 py-4 text-sm text-gray-600">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <p>
                              <strong>Type:</strong>{" "}
                              {getTypeLabelForRow(application)}
                            </p>
                            <p>
                              <strong>Submitted:</strong>{" "}
                              {new Date(
                                application.submitted ||
                                  application.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              {statusValue || "pending"}
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
          </div>

          {/* DETAILS MODAL */}
          {detailsModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              {/* overlay */}
              <div
                className="absolute inset-0 bg-black bg-opacity-30"
                onClick={closeDetailsModal}
              />
              {/* modal content */}
              <div className="relative z-50 w-full max-w-7xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col mx-4 overflow-hidden">
                {/* Top bar with Back button */}
                <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
                  <button
                    type="button"
                    onClick={closeDetailsModal}
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    <span className="mr-2 text-lg leading-none">←</span>
                    Back to applications
                  </button>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {selectedApplication
                      ? selectedApplication.applicant_name ||
                        selectedApplication.owner_full_name ||
                        selectedApplication.owner_name ||
                        selectedApplication.full_name ||
                        selectedApplication.name ||
                        "Application details"
                      : "Application details"}
                  </div>
                </div>

                {/* Detail layout inside (scrollable) */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {renderSelectedDetails()}
                </div>
              </div>
            </div>
          )}

          {/* Move-From-On-Hold Modal */}
          {onHoldModalOpen && onHoldModalApp && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-3">
                  Move From On Hold
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Where do you want to move this on-hold application?
                </p>

                <div className="space-y-2">
                  {[
                    { key: "pending", label: "Pending" },
                    { key: "in-review", label: "In Review" },
                    { key: "approved", label: "Approved" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        const app = onHoldModalApp;
                        setOnHoldModalOpen(false);
                        setOnHoldModalApp(null);
                        openConfirmDialog(
                          "Move Application",
                          `Move this on-hold application to "${opt.label}"?`,
                          async () => {
                            await handleChangeStatusFromOnHold(app, opt.key);
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

          {/* Generic confirmation dialog */}
          {confirmDialog.open && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-lg font-semibold mb-2">
                  {confirmDialog.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {confirmDialog.message}
                </p>
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
