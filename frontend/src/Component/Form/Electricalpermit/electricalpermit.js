// src/Component/Form/electricalpermit/ElectricalPermitForm.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Uheader from "../../Header/User_header";
import UFooter from "../../Footer/User_Footer";

export default function ElectricalPermitForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    tin: "",
    constructionOwned: "",
    formOfOwnership: "",
    useOrCharacter: "",
    addressNo: "",
    addressStreet: "",
    addressBarangay: "",
    addressCity: "",
    addressZipCode: "",
    telephoneNo: "",
    locationStreet: "",
    locationLotNo: "",
    locationBlkNo: "",
    locationTctNo: "",
    locationTaxDecNo: "",
    locationBarangay: "",
    locationCity: "",
    scopeOfWork: "none",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW: review + draft + confirm state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Auto-fill states
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    fullAddress: "",
    phoneNumber: "",
    email: "",
    addressStreet: "",
    addressBarangay: "",
    addressCity: "",
  });
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // Fetch user info for auto-fill
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUserInfo(true);
      try {
        const response = await fetch(
          "http://localhost:8081/api/user-info-electrical",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const userData = data.userInfo;
            setUserInfo(userData);

            // Auto-fill the form with user data
            setFormData((prevData) => ({
              ...prevData,
              firstName: userData.firstName,
              lastName: userData.lastName,
              middleInitial: userData.middleName
                ? userData.middleName.charAt(0).toUpperCase()
                : "",
              addressStreet: userData.addressStreet,
              addressBarangay: userData.addressBarangay,
              addressCity: userData.addressCity,
              telephoneNo: userData.phoneNumber,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("electricalPermitDraft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
        setDraftStatus("Loaded saved draft.");
      }
    } catch (err) {
      console.error("Error loading electrical draft:", err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Basic validation used before opening review modal
  const validateForReview = () => {
    if (
      !formData.lastName ||
      !formData.firstName ||
      formData.scopeOfWork === "none"
    ) {
      setSubmitMessage(
        "Please fill in all required fields (Last Name, First Name, and Scope of Work)"
      );
      setSubmitSuccess(false);
      return false;
    }
    return true;
  };

  // Open review modal (with validation)
  const handleReviewClick = () => {
    const ok = validateForReview();
    if (!ok) return;
    setSubmitMessage("");
    setIsReviewOpen(true);
  };

  // Save as Draft (localStorage only)
  const handleSaveDraft = () => {
    try {
      localStorage.setItem("electricalPermitDraft", JSON.stringify(formData));
      setDraftStatus("Draft saved locally on this device.");
    } catch (err) {
      console.error("Error saving draft:", err);
      setDraftStatus(
        "Failed to save draft. Please check browser storage settings."
      );
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitSuccess(false);

    try {
      // Validate required fields
      if (
        !formData.lastName ||
        !formData.firstName ||
        formData.scopeOfWork === "none"
      ) {
        setSubmitMessage(
          "Please fill in all required fields (Last Name, First Name, and Scope of Work)"
        );
        setIsSubmitting(false);
        return;
      }

      // Additional validation for "others" option – still blocked
      if (formData.scopeOfWork === "others") {
        setSubmitMessage("Please select a specific scope of work option");
        setIsSubmitting(false);
        return;
      }

      const requestData = {
        ...formData,
      };

      console.log("Submitting data:", requestData);

      const response = await fetch(
        "http://localhost:8081/api/electrical-permits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestData),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        setSubmitSuccess(true);
        setIsModalOpen(true);
        setSubmitMessage(
          `Application submitted successfully! Application No: ${result.data.applicationNo}, EP No: ${result.data.epNo}, Building Permit No: ${result.data.buildingPermitNo}`
        );

        // Clear draft on successful submit
        localStorage.removeItem("electricalPermitDraft");
        setDraftStatus("");

        // Reset form but keep auto-filled data
        setFormData({
          lastName: userInfo.lastName,
          firstName: userInfo.firstName,
          middleInitial: userInfo.middleName
            ? userInfo.middleName.charAt(0).toUpperCase()
            : "",
          tin: "",
          constructionOwned: "",
          formOfOwnership: "",
          useOrCharacter: "",
          addressNo: "",
          addressStreet: userInfo.addressStreet,
          addressBarangay: userInfo.addressBarangay,
          addressCity: userInfo.addressCity,
          addressZipCode: "",
          telephoneNo: userInfo.phoneNumber,
          locationStreet: "",
          locationLotNo: "",
          locationBlkNo: "",
          locationTctNo: "",
          locationTaxDecNo: "",
          locationBarangay: "",
          locationCity: "",
          scopeOfWork: "none",
        });
      } else {
        setSubmitMessage(`Error: ${result.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage(
        `Network error: ${error.message}. Please check your connection and backend server.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called from confirmation modal "Yes, Submit Application"
  const handleConfirmSubmit = async () => {
    setIsReviewOpen(false);
    setIsConfirmOpen(false);
    await handleSubmit();
  };

  const renderFormStatus = () => {
    if (submitSuccess && isModalOpen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-700 mb-4">
              Your electrical permit application has been submitted successfully.
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

  // shared UI classes (design only)
  const inputBase =
    "w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputReadOnly =
    "w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 cursor-not-allowed focus:outline-none";
  const fieldBox = "border border-gray-300 bg-white p-2";
  const fieldBoxSoft = "border border-gray-300 bg-gray-50 p-2";

  const sectionBar =
    "w-full bg-blue-600 text-white text-center font-bold uppercase text-sm py-2 rounded-sm";

  return (
    <div className="min-h-screen bg-gray-100">
      <Uheader />

      {/* page wrapper like fencing */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Header (same content, fencing-like spacing) */}
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-20 h-20 rounded-full border-1 flex items-center justify-center overflow-hidden bg-white">
                <img
                src="/img/logo.png"
                alt="Municipality of Hinigaran Seal"
                className="w-full h-full object-cover"
                />
              </div>
              </div>

              {/* Title style like fencing */}
              <h1 className="text-lg font-extrabold tracking-wide mt-4">
                ELECTRICAL PERMIT FORM
              </h1>
            </div>

            {/* Loading indicator */}
            {isLoadingUserInfo && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading user information...
                </span>
              </div>
            )}

            {/* Note box like fencing */}
            <div className="border border-blue-200 bg-blue-50 rounded px-3 py-2">
              <p className="text-xs font-semibold text-gray-700 text-center">
                Note: APPLICATION NO., EP NO., and BUILDING PERMIT NO. will be
                generated automatically upon successful submission.
              </p>
            </div>

            {/* Section bar like fencing */}
            <div className={sectionBar}>OWNER / APPLICANT</div>

            {/* BOX 1 - Owner/Applicant Information */}
            <div className="space-y-3">
              {/* Name Fields */}
              <div className="grid grid-cols-4 gap-3">
                <div className={`col-span-2 ${fieldBoxSoft} rounded`}>
                  <p className="text-[11px] font-semibold mb-1">
                    LAST NAME <span className="text-red-600">*</span>
                  </p>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    readOnly
                    className={inputReadOnly}
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    * Auto-filled from your account information
                  </p>
                </div>

                <div className={`col-span-1 ${fieldBoxSoft} rounded`}>
                  <p className="text-[11px] font-semibold mb-1">
                    FIRST NAME <span className="text-red-600">*</span>
                  </p>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    readOnly
                    className={inputReadOnly}
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    * Auto-filled from your account information
                  </p>
                </div>

                <div className={`${fieldBox} rounded`}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 border border-gray-200 rounded p-2">
                      <p className="text-[11px] font-semibold">M.I.</p>
                      <input
                        type="text"
                        name="middleInitial"
                        value={formData.middleInitial}
                        readOnly
                        className={inputReadOnly}
                        maxLength="5"
                        title="This field is auto-filled from your account information and cannot be edited"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        * Auto-filled
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded p-2">
                      <p className="text-[11px] font-semibold">TIN</p>
                      <input
                        type="text"
                        name="tin"
                        value={formData.tin}
                        onChange={handleChange}
                        className={inputBase}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Construction Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold mb-1">
                    FOR CONSTRUCTION OWNED
                  </p>
                  <input
                    type="text"
                    name="constructionOwned"
                    value={formData.constructionOwned}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold mb-1">
                    FORM OF OWNERSHIP
                  </p>
                  <input
                    type="text"
                    name="formOfOwnership"
                    value={formData.formOfOwnership}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold mb-1">
                    USE OR CHARACTER OF OCCUPANCY
                  </p>
                  <input
                    type="text"
                    name="useOrCharacter"
                    value={formData.useOrCharacter}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-6 gap-3">
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">NO.</p>
                  <input
                    type="text"
                    name="addressNo"
                    value={formData.addressNo}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>

                <div className={`col-span-2 ${fieldBoxSoft} rounded`}>
                  <p className="text-[11px] font-semibold">STREET</p>
                  <input
                    type="text"
                    name="addressStreet"
                    value={formData.addressStreet}
                    readOnly
                    className={inputReadOnly}
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    * Auto-filled from your account information
                  </p>
                </div>

                <div className={`${fieldBoxSoft} rounded`}>
                  <p className="text-[11px] font-semibold">BARANGAY</p>
                  <input
                    type="text"
                    name="addressBarangay"
                    value={formData.addressBarangay}
                    readOnly
                    className={inputReadOnly}
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    * Auto-filled from your account information
                  </p>
                </div>

                <div className={`${fieldBoxSoft} rounded`}>
                  <p className="text-[11px] font-semibold">CITY / MUNICIPALITY</p>
                  <input
                    type="text"
                    name="addressCity"
                    value={formData.addressCity}
                    readOnly
                    className={inputReadOnly}
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    * Auto-filled from your account information
                  </p>
                </div>

                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">ZIP CODE</p>
                  <input
                    type="text"
                    name="addressZipCode"
                    value={formData.addressZipCode}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className={`${fieldBoxSoft} rounded`}>
                <p className="text-[11px] font-semibold text-center">
                  TELEPHONE NO.
                </p>
                <input
                  type="text"
                  name="telephoneNo"
                  value={formData.telephoneNo}
                  readOnly
                  className="w-1/2 mx-auto block text-center border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 cursor-not-allowed focus:outline-none"
                  title="This field is auto-filled from your account information and cannot be edited"
                />
                <p className="text-[10px] text-gray-500 text-center mt-1">
                  * Auto-filled from your account information (phone number)
                </p>
              </div>

              {/* Location Section Header like fencing */}
              <div className={sectionBar}>LOCATION OF CONSTRUCTION</div>

              <div className="grid grid-cols-6 gap-3">
                <div className={`col-span-2 ${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">STREET</p>
                  <input
                    type="text"
                    name="locationStreet"
                    value={formData.locationStreet}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">LOT NO.</p>
                  <input
                    type="text"
                    name="locationLotNo"
                    value={formData.locationLotNo}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">BLK NO.</p>
                  <input
                    type="text"
                    name="locationBlkNo"
                    value={formData.locationBlkNo}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">TCT NO.</p>
                  <input
                    type="text"
                    name="locationTctNo"
                    value={formData.locationTctNo}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">TAX DEC. NO.</p>
                  <input
                    type="text"
                    name="locationTaxDecNo"
                    value={formData.locationTaxDecNo}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3">
                <div className={`col-span-3 ${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">BARANGAY</p>
                  <input
                    type="text"
                    name="locationBarangay"
                    value={formData.locationBarangay}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
                <div className={`col-span-3 ${fieldBox} rounded`}>
                  <p className="text-[11px] font-semibold">CITY / MUNICIPALITY</p>
                  <input
                    type="text"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>

              {/* Scope Section Header like fencing */}
              <div className={sectionBar}>SCOPE OF WORK</div>

              <div className={`${fieldBox} rounded`}>
                <label className="block text-[11px] font-semibold mb-2">
                  SELECT SCOPE OF WORK <span className="text-red-600">*</span>
                </label>
                <select
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="none">-- Select an option --</option>
                  <option value="newInstallation">NEW INSTALLATION</option>
                  <option value="annualInspection">ANNUAL INSPECTION</option>
                  <option value="temporary">TEMPORARY</option>
                  <option value="reconnection">
                    RECONNECTION OF SERVICE ENTRANCE
                  </option>
                  <option value="separationOfService">
                    SEPARATION OF SERVICE ENTRANCE
                  </option>
                  <option value="upgradingOfService">
                    UPGRADING OF SERVICE ENTRANCE
                  </option>
                  <option value="relocation">
                    RELOCATION OF SERVICE ENTRANCE
                  </option>
                </select>
              </div>
            </div>

            {/* Status Message */}
            {submitMessage && !isModalOpen && (
              <div className="mt-4 p-3 rounded border border-green-200 bg-green-50 text-gray-800">
                {submitMessage}
              </div>
            )}

            {/* Draft status */}
            {draftStatus && (
              <p className="mt-2 text-xs text-gray-600 text-right">
                {draftStatus}
              </p>
            )}

            {/* Buttons row like fencing (yellow + green) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600 font-semibold"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={handleReviewClick}
                disabled={isSubmitting || isLoadingUserInfo}
                className={`px-6 py-2 rounded text-white font-semibold ${
                  isSubmitting || isLoadingUserInfo
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Review & Submit"}
              </button>
            </div>

            {/* Success Modal */}
            {renderFormStatus()}

            {/* REVIEW MODAL */}
            {isReviewOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto border border-gray-200">
                  <h2 className="text-2xl font-bold mb-4">
                    Review Electrical Permit Application
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
                      <p className="text-sm text-gray-500">Construction Owned</p>
                      <p className="font-semibold">
                        {formData.constructionOwned || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Form of Ownership</p>
                      <p className="font-semibold">
                        {formData.formOfOwnership || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Use/Character of Occupancy
                      </p>
                      <p className="font-semibold">
                        {formData.useOrCharacter || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Scope of Work</p>
                      <p className="font-semibold uppercase">
                        {formData.scopeOfWork}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold mt-4 mb-2">Owner Address</h3>
                  <p className="text-sm mb-2">
                    {[
                      formData.addressNo,
                      formData.addressStreet,
                      formData.addressBarangay,
                      formData.addressCity,
                      formData.addressZipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>

                  <h3 className="font-bold mt-4 mb-2">Location of Construction</h3>
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Street:</span>{" "}
                    {formData.locationStreet || "—"}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Lot/Blk:</span>{" "}
                    {formData.locationLotNo || "—"} /{" "}
                    {formData.locationBlkNo || "—"}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-semibold">TCT / Tax Dec:</span>{" "}
                    {formData.locationTctNo || "—"} /{" "}
                    {formData.locationTaxDecNo || "—"}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Barangay / City:</span>{" "}
                    {formData.locationBarangay || "—"} /{" "}
                    {formData.locationCity || "—"}
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
                      className={`px-6 py-2 rounded text-white font-semibold ${
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

            {/* CONFIRMATION MODAL */}
            {isConfirmOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">
                    Confirm Submission
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to submit this electrical permit
                    application? Once submitted, changes can only be made by
                    coordinating with the municipal office.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmSubmit}
                      className={`px-4 py-2 rounded text-white font-semibold ${
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
        </div>
      </div>

      <UFooter />
    </div>
  );
}
