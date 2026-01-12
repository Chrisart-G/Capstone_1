// src/Component/Form/buildingpermit/BuildingPermitForm.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Uheader from "../../Header/User_header";
import UFooter from "../../Footer/User_Footer";

export default function BuildingPermitForm() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    appliesAlsoFor: "",
    lastName: "",
    firstName: "",
    middleInitial: "",
    tin: "",
    forConstructionOwned: "",
    formOfOwnership: "",
    no: "",
    street: "",
    barangay: "",
    cityMunicipality: "",
    zipCode: "",
    telephoneNo: "",
    lotNo: "",
    blkNo: "",
    tctNo: "",
    currentTaxDecNo: "",
    constructionStreet: "",
    constructionBarangay: "",
    constructionCity: "",
    scopeOfWork: "",
    groupA: "",
    groupG: "",
    groupB: "",
    groupH: "",
    groupC: "",
    groupI: "",
    groupD: "",
    groupJ1: "",
    groupE: "",
    groupJ2: "",
    groupF: "",
  });

  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [autoFillError, setAutoFillError] = useState("");

  // NEW: review + confirm + status state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "middleInitial" ? value.slice(0, 1) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // NEW: load draft from localStorage (if any)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("buildingPermitDraft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
        setDraftStatus("Loaded saved draft.");
      }
    } catch (err) {
      console.error("Error loading building permit draft:", err);
    }
  }, []);

  // Fetch user info for auto-fill (same fields as before)
  useEffect(() => {
    const fetchUserInfoForBuilding = async () => {
      setIsLoadingUserInfo(true);
      setAutoFillError("");

      try {
        const response = await fetch(
          "http://localhost:8081/api/user-info-building",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.userInfo) {
            const ui = data.userInfo;

            setFormData((prev) => ({
              ...prev,
              lastName: ui.lastName || prev.lastName,
              firstName: ui.firstName || prev.firstName,
              middleInitial: ui.middleInitial || prev.middleInitial,
              street: ui.street || prev.street,
              // barangay manual
              cityMunicipality: ui.cityMunicipality || prev.cityMunicipality,
              telephoneNo: ui.telephoneNo || prev.telephoneNo,
            }));
          } else {
            setAutoFillError(
              data.message || "Could not auto-fill your information."
            );
          }
        } else if (response.status === 401) {
          setAutoFillError("Please log in to auto-fill your information.");
        } else {
          setAutoFillError(
            "Failed to load your profile information for auto-fill."
          );
        }
      } catch (err) {
        console.error("Error fetching user info for building:", err);
        setAutoFillError(
          "Unable to auto-fill your information. You can still fill the form manually."
        );
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfoForBuilding();
  }, []);

  // NEW: validation before opening review modal
  const validateForReview = () => {
    if (!formData.lastName || !formData.firstName || !formData.scopeOfWork) {
      setSubmitMessage(
        "Please fill in all required fields: Last Name, First Name, and Scope of Work."
      );
      setSubmitSuccess(false);
      return false;
    }
    return true;
  };

  // NEW: open review modal
  const handleReviewClick = () => {
    if (!validateForReview()) return;
    setSubmitMessage("");
    setIsReviewOpen(true);
  };

  // NEW: Save as Draft
  const handleSaveDraft = () => {
    try {
      localStorage.setItem("buildingPermitDraft", JSON.stringify(formData));
      setDraftStatus("Draft saved locally on this device.");
      setSubmitMessage("");
    } catch (err) {
      console.error("Error saving building permit draft:", err);
      setDraftStatus(
        "Failed to save draft. Please check your browser storage settings."
      );
    }
  };

  // Actual submit to backend (called after final confirmation)
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitSuccess(false);

    try {
      const response = await fetch(
        "http://localhost:8081/api/building-permits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setIsModalOpen(true);
        setSubmitMessage(
          `Building permit application submitted successfully! Application No: ${data.data.applicationNo}, BP No: ${data.data.bpNo}, Building Permit No: ${data.data.buildingPermitNo}`
        );

        // Clear draft on successful submission
        localStorage.removeItem("buildingPermitDraft");
        setDraftStatus("");
      } else {
        setSubmitMessage(
          data.message || "Failed to submit building permit application."
        );
      }
    } catch (error) {
      console.error("Error submitting building permit:", error);
      setSubmitMessage(
        "An error occurred while submitting the application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called when user confirms in the Confirm Submission modal
  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    await handleSubmit();
  };

  // Success modal (redirect to Docutracker on OK)
  const renderFormStatus = () => {
    if (submitSuccess && isModalOpen) {
      return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-700 mb-4">
              Your building permit application has been submitted successfully.
            </p>
            <div className="flex justify-end">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsModalOpen(false);
                  setSubmitSuccess(false);
                  navigate("/Docutracker");
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const scopeOfWorkOptions = [
    "New Construction",
    "Addition",
    "Alteration",
    "Renovation",
    "Repair",
    "Demolition",
    "Change of Occupancy",
    "Others",
  ];

  const occupancyGroups = {
    groupA: [
      "Single Family Dwelling",
      "Duplex",
      "Townhouse",
      "Apartment Building",
    ],
    groupG: ["Light Manufacturing", "Processing Plant", "Warehouse", "Storage Facility"],
    groupB: ["Boarding House", "Hotel", "Dormitory", "Condominium"],
    groupH: ["Factory", "Heavy Industrial Plant", "Manufacturing Facility"],
    groupC: ["School", "Library", "Museum", "Community Center"],
    groupI: ["Hospital", "Clinic", "Laboratory", "Assembly Hall"],
    groupD: ["Government Building", "Office Building", "Bank", "Municipal Hall"],
    groupJ1: ["Farm Building", "Agricultural Storage", "Greenhouse"],
    groupE: ["Store", "Shopping Center", "Market", "Commercial Building"],
    groupJ2: ["Garage", "Carport", "Tool Shed", "Storage Shed"],
    groupF: ["Workshop", "Small Manufacturing", "Service Shop"],
  };

  return (
    <div>
      <Uheader />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center">
                <img src="img/logo.png" alt="" className="w-40 h-30" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                BUILDING PERMIT FORM
              </h1>
            </div>

            {(isLoadingUserInfo || autoFillError) && (
              <div className="mb-4">
                {isLoadingUserInfo && (
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    <span>Loading your profile information...</span>
                  </div>
                )}
                {autoFillError && !isLoadingUserInfo && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mt-1">
                    {autoFillError}
                  </div>
                )}
              </div>
            )}

            {/* Prevent default submit – we submit via modals */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              {/* This Applies Also For */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  THIS APPLIES ALSO FOR:
                </label>
                <select
                  name="appliesAlsoFor"
                  value={formData.appliesAlsoFor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="electrical">Electrical Permit</option>
                  <option value="plumbing">Plumbing Permit</option>
                  <option value="mechanical">Mechanical Permit</option>
                  <option value="sanitary">Sanitary Permit</option>
                </select>
              </div>

              {/* Owner/Applicant Section */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                  <h2 className="font-semibold">OWNER / APPLICANT</h2>
                </div>
                <div className="border border-gray-300 border-t-0 p-4 rounded-b-md">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* LAST NAME (auto-fill, read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LAST NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        title="Auto-filled from your account information"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Auto-filled from your account information
                      </p>
                    </div>
                    {/* FIRST NAME (auto-fill, read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FIRST NAME <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        title="Auto-filled from your account information"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Auto-filled from your account information
                      </p>
                    </div>
                    {/* M.I (auto-fill, read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        M.I
                      </label>
                      <input
                        type="text"
                        name="middleInitial"
                        value={formData.middleInitial}
                        onChange={handleInputChange}
                        placeholder="M"
                        maxLength={1}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        title="Auto-filled from your account information"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Auto-filled from your account information
                      </p>
                    </div>
                    {/* TIN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TIN
                      </label>
                      <input
                        type="text"
                        name="tin"
                        value={formData.tin}
                        onChange={handleInputChange}
                        placeholder="TIN #"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FOR CONSTRUCTION OWNED
                      </label>
                      <input
                        type="text"
                        name="forConstructionOwned"
                        value={formData.forConstructionOwned}
                        onChange={handleInputChange}
                        placeholder="For Construction Owned"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FORM OF OWNERSHIP
                      </label>
                      <input
                        type="text"
                        name="formOfOwnership"
                        value={formData.formOfOwnership}
                        onChange={handleInputChange}
                        placeholder="Form Of Ownership"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NO.
                      </label>
                      <input
                        type="text"
                        name="no"
                        value={formData.no}
                        onChange={handleInputChange}
                        placeholder="No."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* STREET auto-filled */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        STREET
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Street"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        title="Auto-filled from your account information"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Auto-filled from your account information
                      </p>
                    </div>
                    {/* BARANGAY manual again */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BARANGAY
                      </label>
                      <input
                        type="text"
                        name="barangay"
                        value={formData.barangay}
                        onChange={handleInputChange}
                        placeholder="Barangay"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* CITY auto-filled */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CITY / MUNICIPALITY
                      </label>
                      <input
                        type="text"
                        name="cityMunicipality"
                        value={formData.cityMunicipality}
                        onChange={handleInputChange}
                        placeholder="City/Municipality"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        title="Auto-filled from your account information"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Auto-filled from your account information
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP CODE
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Zipcode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-start-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TELEPHONE NO.
                      </label>
                      <input
                        type="text"
                        name="telephoneNo"
                        value={formData.telephoneNo}
                        onChange={handleInputChange}
                        placeholder="Telephone no."
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                        title="Auto-filled from your account information"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        * Auto-filled from your account information
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location of Construction */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                  <h2 className="font-semibold">LOCATION OF CONSTRUCTION:</h2>
                </div>
                <div className="border border-gray-300 border-t-0 p-4 rounded-b-md">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LOT NO.
                      </label>
                      <input
                        type="text"
                        name="lotNo"
                        value={formData.lotNo}
                        onChange={handleInputChange}
                        placeholder="Lot no."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BLK NO.
                      </label>
                      <input
                        type="text"
                        name="blkNo"
                        value={formData.blkNo}
                        onChange={handleInputChange}
                        placeholder="Blk no."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TCT NO.
                      </label>
                      <input
                        type="text"
                        name="tctNo"
                        value={formData.tctNo}
                        onChange={handleInputChange}
                        placeholder="Tct no."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CURRENT TAX DEC. NO.
                      </label>
                      <input
                        type="text"
                        name="currentTaxDecNo"
                        value={formData.currentTaxDecNo}
                        onChange={handleInputChange}
                        placeholder="Current tax dec. no."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        STREET
                      </label>
                      <input
                        type="text"
                        name="constructionStreet"
                        value={formData.constructionStreet}
                        onChange={handleInputChange}
                        placeholder="Street"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BARANGAY
                      </label>
                      <input
                        type="text"
                        name="constructionBarangay"
                        value={formData.constructionBarangay}
                        onChange={handleInputChange}
                        placeholder="Barangay"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CITY / MUNICIPALITY
                      </label>
                      <input
                        type="text"
                        name="constructionCity"
                        value={formData.constructionCity}
                        onChange={handleInputChange}
                        placeholder="City/Municipality"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                  <h2 className="font-semibold">SCOPE OF WORK</h2>
                </div>
                <div className="border border-gray-300 border-t-0 p-4 rounded-b-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SELECT SCOPE OF WORK{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="scopeOfWork"
                    value={formData.scopeOfWork}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select an Option --</option>
                    {scopeOfWorkOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Use or Character of Occupancy */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                  <h2 className="font-semibold">
                    USE OR CHARACTER OF OCCUPANCY
                  </h2>
                </div>
                <div className="border border-gray-300 border-t-0 p-4 rounded-b-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP A: RESIDENTIAL (DWELLINGS)
                        </label>
                        <select
                          name="groupA"
                          value={formData.groupA}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupA.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP B: RESIDENTIAL
                        </label>
                        <select
                          name="groupB"
                          value={formData.groupB}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupB.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP C: EDUCATIONAL & RECREATIONAL
                        </label>
                        <select
                          name="groupC"
                          value={formData.groupC}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupC.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP D: INSTITUTIONAL
                        </label>
                        <select
                          name="groupD"
                          value={formData.groupD}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupD.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP E: COMMERCIAL
                        </label>
                        <select
                          name="groupE"
                          value={formData.groupE}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupE.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP F: LIGHT INDUSTRIAL
                        </label>
                        <select
                          name="groupF"
                          value={formData.groupF}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupF.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP G: MEDIUM INDUSTRIAL
                        </label>
                        <select
                          name="groupG"
                          value={formData.groupG}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupG.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP H: ASSEMBLY (OCCUPANT LOAD LESS THAN 1,000)
                        </label>
                        <select
                          name="groupH"
                          value={formData.groupH}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupH.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP I: ASSEMBLY (OCCUPANT LOAD 1,000 OR MORE)
                        </label>
                        <select
                          name="groupI"
                          value={formData.groupI}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupI.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP J: (J-1) AGRICULTURAL
                        </label>
                        <select
                          name="groupJ1"
                          value={formData.groupJ1}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupJ1.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-600 mb-2">
                          GROUP J: (J-2) ACCESSORIES
                        </label>
                        <select
                          name="groupJ2"
                          value={formData.groupJ2}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          {occupancyGroups.groupJ2.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline status message */}
              {submitMessage && !isModalOpen && (
                <div className="mt-4 p-3 rounded bg-yellow-50 text-gray-800 text-sm">
                  {submitMessage}
                </div>
              )}

              {/* Draft status */}
              {draftStatus && (
                <p className="mt-2 text-xs text-gray-600 text-right">
                  {draftStatus}
                </p>
              )}

              {/* Buttons: Save Draft + Review & Submit */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={handleReviewClick}
                  disabled={isSubmitting || isLoadingUserInfo}
                  className={`px-6 py-2 rounded text-white ${
                    isSubmitting || isLoadingUserInfo
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Review & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SUCCESS MODAL */}
        {renderFormStatus()}

        {/* REVIEW MODAL */}
        {isReviewOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Review Building Permit Application
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Applicant Name</p>
                  <p className="font-semibold">
                    {formData.lastName}, {formData.firstName}{" "}
                    {formData.middleInitial}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TIN</p>
                  <p className="font-semibold">{formData.tin || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">For Construction Owned</p>
                  <p className="font-semibold">
                    {formData.forConstructionOwned || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Form of Ownership</p>
                  <p className="font-semibold">
                    {formData.formOfOwnership || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scope of Work</p>
                  <p className="font-semibold">
                    {formData.scopeOfWork || "—"}
                  </p>
                </div>
              </div>

              <h3 className="font-bold mt-4 mb-2">Owner Address</h3>
              <p className="text-sm mb-2">
                {[
                  formData.no,
                  formData.street,
                  formData.barangay,
                  formData.cityMunicipality,
                  formData.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>

              <h3 className="font-bold mt-4 mb-2">Location of Construction</h3>
              <p className="text-sm mb-1">
                <span className="font-semibold">Lot / Blk:</span>{" "}
                {formData.lotNo || "—"} / {formData.blkNo || "—"}
              </p>
              <p className="text-sm mb-1">
                <span className="font-semibold">TCT / Current Tax Dec:</span>{" "}
                {formData.tctNo || "—"} / {formData.currentTaxDecNo || "—"}
              </p>
              <p className="text-sm mb-1">
                <span className="font-semibold">Street:</span>{" "}
                {formData.constructionStreet || "—"}
              </p>
              <p className="text-sm mb-1">
                <span className="font-semibold">Barangay / City:</span>{" "}
                {formData.constructionBarangay || "—"} /{" "}
                {formData.constructionCity || "—"}
              </p>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsReviewOpen(false)}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded text-white ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM SUBMISSION MODAL */}
        {isConfirmOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-3 text-center">
                Confirm Submission
              </h3>
              <p className="text-sm text-gray-700 mb-6 text-center leading-relaxed">
                Are you sure you want to submit this building permit application?
                Once submitted, changes can only be made by coordinating with
                the municipal office.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded text-white ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Yes, Submit Application"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <UFooter />
    </div>
  );
}
