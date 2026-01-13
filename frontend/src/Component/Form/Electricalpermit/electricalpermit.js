// src/Component/Form/electricalpermit/ElectricalPermitForm.js
import { useState, useEffect, useMemo } from "react";
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

  // review + draft + confirm state
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

  const scopeLabelMap = useMemo(
    () => ({
      none: "-- Select an option --",
      newInstallation: "NEW INSTALLATION",
      annualInspection: "ANNUAL INSPECTION",
      temporary: "TEMPORARY",
      reconnection: "RECONNECTION OF SERVICE ENTRANCE",
      separationOfService: "SEPARATION OF SERVICE ENTRANCE",
      upgradingOfService: "UPGRADING OF SERVICE ENTRANCE",
      relocation: "RELOCATION OF SERVICE ENTRANCE",
      others: "OTHERS",
    }),
    []
  );

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-green-700 mb-2">
                Success!
              </h2>
              <p className="text-gray-700 mb-4">
                Your electrical permit application has been submitted
                successfully.
              </p>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                {submitMessage}
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <button
                className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 font-medium"
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

  // UI helper components (UI only)
  const SectionTitle = ({ children }) => (
    <div className="w-full rounded-lg bg-gray-100 border border-gray-200 px-4 py-3">
      <p className="text-center font-semibold tracking-wide text-gray-800 uppercase text-sm">
        {children}
      </p>
    </div>
  );

  const Field = ({ label, required, hint, children }) => (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">
          {label} {required ? <span className="text-red-600">*</span> : null}
        </label>
        {hint ? <span className="text-[11px] text-gray-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className={[
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400",
        props.readOnly
          ? "bg-gray-100 cursor-not-allowed text-gray-700"
          : "bg-white",
        props.className || "",
      ].join(" ")}
    />
  );

  const Select = (props) => (
    <select
      {...props}
      className={[
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400",
        props.className || "",
      ].join(" ")}
    />
  );

  const messageTone = submitSuccess ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800";

  return (
    <div className="min-h-screen bg-gray-100">
      <Uheader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Main Card */}
        <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
          {/* Header area (video-like) */}
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-[10px] text-gray-700 text-center leading-tight">
                  Official
                  <br />
                  Seal
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-gray-900">
              ELECTRICAL PERMIT APPLICATION
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Republic of the Philippines · Municipality of Hinigaran · Province
              of Negros Occidental
            </p>

            <div className="mt-5 flex justify-center">
              <div className="max-w-3xl w-full">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700">
                  APPLICATION NO., EP NO., and BUILDING PERMIT NO. will be
                  generated automatically
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8">
            {/* Loading indicator */}
            {isLoadingUserInfo && (
              <div className="mb-6 flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <span className="text-sm text-gray-700">
                  Loading user information...
                </span>
              </div>
            )}

            {/* BASIC INFORMATION */}
            <SectionTitle>BASIC INFORMATION</SectionTitle>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Field label="Last Name" required hint="Auto-filled">
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    readOnly
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                </Field>
              </div>

              <div className="md:col-span-1">
                <Field label="First Name" required hint="Auto-filled">
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    readOnly
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                </Field>
              </div>

              <div className="md:col-span-1 grid grid-cols-2 gap-3">
                <Field label="M.I." hint="Auto-filled">
                  <Input
                    type="text"
                    name="middleInitial"
                    value={formData.middleInitial}
                    readOnly
                    maxLength="5"
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                </Field>

                <Field label="TIN">
                  <Input
                    type="text"
                    name="tin"
                    value={formData.tin}
                    onChange={handleChange}
                    placeholder="Enter TIN (optional)"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="For Construction Owned">
                <Input
                  type="text"
                  name="constructionOwned"
                  value={formData.constructionOwned}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                />
              </Field>

              <Field label="Form of Ownership">
                <Input
                  type="text"
                  name="formOfOwnership"
                  value={formData.formOfOwnership}
                  onChange={handleChange}
                  placeholder="e.g., Owned / Rented"
                />
              </Field>

              <Field label="Use or Character of Occupancy">
                <Input
                  type="text"
                  name="useOrCharacter"
                  value={formData.useOrCharacter}
                  onChange={handleChange}
                  placeholder="e.g., Residential / Commercial"
                />
              </Field>
            </div>

            {/* OWNER ADDRESS */}
            <div className="mt-8">
              <SectionTitle>OWNER ADDRESS</SectionTitle>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-1">
                  <Field label="No.">
                    <Input
                      type="text"
                      name="addressNo"
                      value={formData.addressNo}
                      onChange={handleChange}
                      placeholder="No."
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Street" hint="Auto-filled">
                    <Input
                      type="text"
                      name="addressStreet"
                      value={formData.addressStreet}
                      readOnly
                      title="This field is auto-filled from your account information and cannot be edited"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="Barangay" hint="Auto-filled">
                    <Input
                      type="text"
                      name="addressBarangay"
                      value={formData.addressBarangay}
                      readOnly
                      title="This field is auto-filled from your account information and cannot be edited"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="City/Municipality" hint="Auto-filled">
                    <Input
                      type="text"
                      name="addressCity"
                      value={formData.addressCity}
                      readOnly
                      title="This field is auto-filled from your account information and cannot be edited"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="Zip Code">
                    <Input
                      type="text"
                      name="addressZipCode"
                      value={formData.addressZipCode}
                      onChange={handleChange}
                      placeholder="Zip"
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-4">
                <Field label="Telephone No." hint="Auto-filled from account">
                  <Input
                    type="text"
                    name="telephoneNo"
                    value={formData.telephoneNo}
                    readOnly
                    className="text-center"
                    title="This field is auto-filled from your account information and cannot be edited"
                  />
                </Field>
              </div>
            </div>

            {/* LOCATION OF CONSTRUCTION */}
            <div className="mt-8">
              <SectionTitle>LOCATION OF CONSTRUCTION</SectionTitle>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Field label="Street">
                    <Input
                      type="text"
                      name="locationStreet"
                      value={formData.locationStreet}
                      onChange={handleChange}
                      placeholder="Street"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="Lot No.">
                    <Input
                      type="text"
                      name="locationLotNo"
                      value={formData.locationLotNo}
                      onChange={handleChange}
                      placeholder="Lot"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="Blk No.">
                    <Input
                      type="text"
                      name="locationBlkNo"
                      value={formData.locationBlkNo}
                      onChange={handleChange}
                      placeholder="Block"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="TCT No.">
                    <Input
                      type="text"
                      name="locationTctNo"
                      value={formData.locationTctNo}
                      onChange={handleChange}
                      placeholder="TCT"
                    />
                  </Field>
                </div>

                <div className="md:col-span-1">
                  <Field label="Tax Dec. No.">
                    <Input
                      type="text"
                      name="locationTaxDecNo"
                      value={formData.locationTaxDecNo}
                      onChange={handleChange}
                      placeholder="Tax Dec."
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Barangay">
                  <Input
                    type="text"
                    name="locationBarangay"
                    value={formData.locationBarangay}
                    onChange={handleChange}
                    placeholder="Barangay"
                  />
                </Field>

                <Field label="City/Municipality">
                  <Input
                    type="text"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleChange}
                    placeholder="City/Municipality"
                  />
                </Field>
              </div>
            </div>

            {/* SCOPE OF WORK */}
            <div className="mt-8">
              <SectionTitle>SCOPE OF WORK</SectionTitle>

              <div className="mt-5">
                <Field label="Select Scope of Work" required>
                  <Select
                    name="scopeOfWork"
                    value={formData.scopeOfWork}
                    onChange={handleChange}
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
                    <option value="relocation">RELOCATION OF SERVICE ENTRANCE</option>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Status Message */}
            {submitMessage && !isModalOpen && (
              <div className={`mt-6 rounded-lg border px-4 py-3 text-sm ${messageTone}`}>
                {submitMessage}
              </div>
            )}

            {/* Draft status */}
            {draftStatus && (
              <p className="mt-3 text-xs text-gray-600 text-right">
                {draftStatus}
              </p>
            )}

            {/* Bottom action bar (video-like) */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 font-medium"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 font-medium"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={handleReviewClick}
                  disabled={isSubmitting || isLoadingUserInfo}
                  className={[
                    "rounded-lg px-6 py-2.5 font-medium text-white",
                    isSubmitting || isLoadingUserInfo
                      ? "bg-green-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700",
                  ].join(" ")}
                >
                  {isSubmitting ? "Submitting..." : "Review & Submit"}
                </button>
              </div>
            </div>

            {/* Success Modal */}
            {renderFormStatus()}

            {/* REVIEW MODAL */}
            {isReviewOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-100">
                  <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Review Electrical Permit Application
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Please verify all details before submitting.
                    </p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Applicant Name
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formData.lastName}, {formData.firstName}{" "}
                          {formData.middleInitial}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Scope of Work
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {scopeLabelMap[formData.scopeOfWork] ||
                            formData.scopeOfWork ||
                            "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          TIN
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formData.tin || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Use/Character of Occupancy
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formData.useOrCharacter || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Construction Owned
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formData.constructionOwned || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Form of Ownership
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formData.formOfOwnership || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Owner Address
                        </p>
                        <p className="mt-2 text-sm text-gray-800">
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
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Location of Construction
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-gray-800">
                          <p>
                            <span className="font-semibold">Street:</span>{" "}
                            {formData.locationStreet || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Lot/Blk:</span>{" "}
                            {formData.locationLotNo || "—"} /{" "}
                            {formData.locationBlkNo || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">TCT / Tax Dec:</span>{" "}
                            {formData.locationTctNo || "—"} /{" "}
                            {formData.locationTaxDecNo || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">Barangay / City:</span>{" "}
                            {formData.locationBarangay || "—"} /{" "}
                            {formData.locationCity || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                        onClick={() => setIsReviewOpen(false)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmOpen(true)}
                        disabled={isSubmitting}
                        className={[
                          "px-6 py-2.5 rounded-lg font-medium text-white",
                          isSubmitting
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700",
                        ].join(" ")}
                      >
                        Submit Application
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMATION MODAL */}
            {isConfirmOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Confirm Submission
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                      Are you sure you want to submit this electrical permit
                      application? Once submitted, changes can only be made by
                      coordinating with the municipal office.
                    </p>
                  </div>

                  <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmSubmit}
                      className={[
                        "px-5 py-2.5 rounded-lg font-medium text-white",
                        isSubmitting
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700",
                      ].join(" ")}
                    >
                      {isSubmitting ? "Submitting..." : "Yes, Submit Application"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <UFooter />
    </div>
  );
}
