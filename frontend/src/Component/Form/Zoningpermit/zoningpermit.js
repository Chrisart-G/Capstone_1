import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Uheader from "../../Header/User_header";
import UFooter from "../../Footer/User_Footer";

export default function ZoningPermitForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // ---------- OFFICE USE ONLY (fillable) ----------
    applicationNo: "",
    dateOfReceipt: "",
    pmdOrNo: "",
    dateIssued: "",
    amountPaid: "",

    // ---------- 1-5 APPLICANT / CORP ----------
    applicantLastName: "",
    applicantFirstName: "",
    applicantMiddleInitial: "",
    corporationName: "",
    applicantAddress: "",
    corporationAddress: "",
    authorizedRepresentativeName: "",

    // ---------- 6 PROJECT NATURE (dropdown) ----------
    projectNature: "none",
    projectNatureOtherSpecify: "",

    // ---------- 7-8 PROJECT TYPE + PROJECT AREA ----------
    projectType: "",
    projectAreaType: "none",
    projectAreaSqm: "",

    // ---------- 9 PROJECT LOCATION ----------
    projectLocation: "",

    // ---------- 10 PROJECT TENURE (dropdown) ----------
    projectTenure: "none",
    projectTenureOtherSpecify: "",

    // ---------- 11 RIGHT OVER LAND (dropdown) ----------
    rightOverLand: "none",
    rightOverLandOtherSpecify: "",

    // ---------- 12 EXISTING LAND USE (dropdown) ----------
    existingLandUse: "none",
    existingLandUseAgriSpecify: "",
    existingLandUseOtherSpecify: "",
    crop: "",
    commercialSpecify: "",

    // ---------- 13 PROJECT COST ----------
    projectCostWords: "",
    projectCostFigures: "",

    // ---------- 14 WRITTEN NOTICE? ----------
    q14WrittenNotice: "none",
    q16aOfficeFiled: "",
    q14bDatesFiled: "",
    q16cActionsTaken: "",

    // ---------- 15 MODE OF RELEASE ----------
    releaseMode: "none",
    mailAddressTo: "applicant",
    mailAddressedName: "",

    // ---------- SIGNATURES ----------
    signatureApplicant: "",
    signatureAuthorizedRep: "",

    // ---------- PAGE 2 NOTARY SECTION ----------
    notaryDay: "",
    notaryMonth: "",
    notaryYear: "",
    notaryAtMunicipality: "HINIGARAN",
    notaryProvince: "NEGROS OCCIDENTAL",
    residenceCertNo: "",
    residenceCertIssuedOn: "",
    residenceCertIssuedAt: "HINIGARAN, NEGROS OCCIDENTAL PHILIPPINES",
    docNo: "",
    pageNo: "",
    bookNo: "",
    seriesYear: "2015",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");

  // ---------- conditionals ----------
  const showProjectNatureOther = formData.projectNature === "others";
  const showTenureOther = formData.projectTenure === "others";
  const showRightOther = formData.rightOverLand === "others";
  const showLandUseAgri = formData.existingLandUse === "agricultural";
  const showLandUseOther = formData.existingLandUse === "others";
  const showLandUseCommercial = formData.existingLandUse === "commercial";
  const showQ14Details = formData.q14WrittenNotice === "yes";
  const showMailFields = formData.releaseMode === "mail";

  // ---------- handle change ----------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setError("");
    setSuccess("");

    let processedValue = value;
    
    if (name === "applicantMiddleInitial") {
      processedValue = value.slice(0, 1).toUpperCase();
    }
    
    if (type === "number") {
      processedValue = value === "" ? "" : Number(value);
    }

    // Handle dropdown resets
    if (name === "projectNature") {
      setFormData(prev => ({
        ...prev,
        projectNature: processedValue,
        projectNatureOtherSpecify: processedValue === "others" ? prev.projectNatureOtherSpecify : ""
      }));
      return;
    }

    if (name === "projectTenure") {
      setFormData(prev => ({
        ...prev,
        projectTenure: processedValue,
        projectTenureOtherSpecify: processedValue === "others" ? prev.projectTenureOtherSpecify : ""
      }));
      return;
    }

    if (name === "rightOverLand") {
      setFormData(prev => ({
        ...prev,
        rightOverLand: processedValue,
        rightOverLandOtherSpecify: processedValue === "others" ? prev.rightOverLandOtherSpecify : ""
      }));
      return;
    }

    if (name === "existingLandUse") {
      setFormData(prev => ({
        ...prev,
        existingLandUse: processedValue,
        existingLandUseAgriSpecify: processedValue === "agricultural" ? prev.existingLandUseAgriSpecify : "",
        existingLandUseOtherSpecify: processedValue === "others" ? prev.existingLandUseOtherSpecify : "",
        commercialSpecify: processedValue === "commercial" ? prev.commercialSpecify : "",
        crop: processedValue === "agricultural" ? prev.crop : ""
      }));
      return;
    }

    if (name === "q14WrittenNotice") {
      setFormData(prev => ({
        ...prev,
        q14WrittenNotice: processedValue,
        q16aOfficeFiled: processedValue === "yes" ? prev.q16aOfficeFiled : "",
        q14bDatesFiled: processedValue === "yes" ? prev.q14bDatesFiled : "",
        q16cActionsTaken: processedValue === "yes" ? prev.q16cActionsTaken : ""
      }));
      return;
    }

    if (name === "releaseMode") {
      setFormData(prev => ({
        ...prev,
        releaseMode: processedValue,
        mailAddressedName: processedValue === "mail" ? prev.mailAddressedName : "",
        mailAddressTo: processedValue === "mail" ? prev.mailAddressTo : "applicant"
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // ---------- load draft ----------
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("zoningPermitDraft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
        setDraftStatus("Loaded saved draft for Zoning Permit.");
      }
    } catch (err) {
      console.error("Error loading zoning draft:", err);
    }
  }, []);

  // ---------- validation ----------
  const validateForm = () => {
    // Clear previous errors
    setError("");
    
    // Applicant info
    if (!formData.applicantLastName.trim()) {
      setError("Applicant last name is required (Field #1).");
      return false;
    }
    if (!formData.applicantFirstName.trim()) {
      setError("Applicant first name is required (Field #1).");
      return false;
    }
    if (!formData.applicantAddress.trim()) {
      setError("Address of applicant is required (Field #3).");
      return false;
    }

    // Project nature
    if (formData.projectNature === "none") {
      setError("Please select Project Nature (Field #6).");
      return false;
    }
    if (showProjectNatureOther && !formData.projectNatureOtherSpecify.trim()) {
      setError('Please specify Project Nature when selecting "Other" (Field #6).');
      return false;
    }

    // Project type
    if (!formData.projectType.trim()) {
      setError("Project Type is required (Field #7).");
      return false;
    }

    // Project area
    if (formData.projectAreaType === "none") {
      setError("Please select Project Area Type (Field #8).");
      return false;
    }
    if (!formData.projectAreaSqm || formData.projectAreaSqm <= 0) {
      setError("Project Area (sq. m.) must be greater than 0 (Field #8).");
      return false;
    }

    // Project location
    if (!formData.projectLocation.trim()) {
      setError("Project Location is required (Field #9).");
      return false;
    }

    // Project tenure
    if (formData.projectTenure === "none") {
      setError("Please select Project Tenure (Field #10).");
      return false;
    }
    if (showTenureOther && !formData.projectTenureOtherSpecify.trim()) {
      setError('Please specify Project Tenure when selecting "Others" (Field #10).');
      return false;
    }

    // Right over land
    if (formData.rightOverLand === "none") {
      setError("Please select Right Over Land (Field #11).");
      return false;
    }
    if (showRightOther && !formData.rightOverLandOtherSpecify.trim()) {
      setError('Please specify Right Over Land when selecting "Other" (Field #11).');
      return false;
    }

    // Existing land use
    if (formData.existingLandUse === "none") {
      setError("Please select Existing Land Use (Field #12).");
      return false;
    }
    if (showLandUseAgri && !formData.existingLandUseAgriSpecify.trim()) {
      setError("Please specify Agricultural land use (Field #12).");
      return false;
    }
    if (showLandUseOther && !formData.existingLandUseOtherSpecify.trim()) {
      setError('Please specify Other land use (Field #12).');
      return false;
    }
    if (showLandUseCommercial && !formData.commercialSpecify.trim()) {
      setError("Please specify Commercial details (Field #12).");
      return false;
    }

    // Project cost
    if (!formData.projectCostWords.trim()) {
      setError("Project Cost in words is required (Field #13).");
      return false;
    }
    if (!formData.projectCostFigures || formData.projectCostFigures <= 0) {
      setError("Project Cost in figures must be greater than 0 (Field #13).");
      return false;
    }

    // Written notice
    if (formData.q14WrittenNotice === "none") {
      setError("Please answer Question #14 (Written Notice: Yes/No).");
      return false;
    }
    if (showQ14Details) {
      if (!formData.q16aOfficeFiled.trim()) {
        setError("Please fill 16.a Office(s) where filed (Required because Q14 = Yes).");
        return false;
      }
      if (!formData.q14bDatesFiled.trim()) {
        setError("Please fill 14.b Date(s) filed (Required because Q14 = Yes).");
        return false;
      }
      if (!formData.q16cActionsTaken.trim()) {
        setError("Please fill 16.c Action(s) taken (Required because Q14 = Yes).");
        return false;
      }
    }

    // Release mode
    if (formData.releaseMode === "none") {
      setError("Please select Preferred Mode of Release (Field #15).");
      return false;
    }
    if (showMailFields && !formData.mailAddressedName.trim()) {
      setError("Please provide the name to mail the decision to (Field #15).");
      return false;
    }

    // Signature
    if (!formData.signatureApplicant.trim()) {
      setError("Signature of Applicant is required.");
      return false;
    }

    return true;
  };

  // ---------- draft ----------
  const handleSaveDraft = () => {
    try {
      localStorage.setItem("zoningPermitDraft", JSON.stringify(formData));
      setDraftStatus("Draft saved locally on this device.");
      setTimeout(() => setDraftStatus(""), 3000);
    } catch (err) {
      console.error("Error saving zoning draft:", err);
      setDraftStatus("Failed to save draft. Please check browser storage settings.");
    }
  };

  // ---------- review ----------
  const handleReviewClick = () => {
    if (!validateForm()) return;
    setError("");
    setSuccess("");
    setIsReviewOpen(true);
  };

  // ---------- submit ----------
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      console.log("Submitting form data:", formData);
      
      const response = await fetch("http://localhost:8081/api/zoning-permits", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.message || `Failed to submit application (Status: ${response.status})`);
      }

      if (data.success) {
        setSuccess(
          `Application submitted successfully! Your application number is: ${
            data.data?.applicationNo || "—"
          }`
        );

        // Clear draft
        try {
          localStorage.removeItem("zoningPermitDraft");
        } catch (e) {
          console.error("Error clearing zoning draft:", e);
        }
        setDraftStatus("");

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/Docutracker");
        }, 2000);
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting zoning form:", err);
      setError(err.message || "An error occurred while submitting the application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    await handleSubmit();
  };

  return (
    <div>
      <Uheader />

      <div className="max-w-4xl mx-auto p-4 bg-white">
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-xl font-bold mt-2 text-center">
            APPLICATION FOR LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE
          </h1>

          {/* Error / Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {draftStatus && <p className="text-xs text-gray-600 text-right italic">{draftStatus}</p>}

          {/* APPLICANT / CORPORATION INFORMATION */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">APPLICANT / CORPORATION INFORMATION</p>

            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="col-span-2 border border-gray-300 p-1">
                <p className="text-xs mb-1">
                  1. NAME OF APPLICANT (Last Name) <span className="text-red-500">*</span>
                </p>
                <input
                  name="applicantLastName"
                  value={formData.applicantLastName}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm p-1"
                  placeholder="Last Name"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">
                  (First Name) <span className="text-red-500">*</span>
                </p>
                <input
                  name="applicantFirstName"
                  value={formData.applicantFirstName}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm p-1"
                  placeholder="First Name"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">(M.)</p>
                <input
                  name="applicantMiddleInitial"
                  value={formData.applicantMiddleInitial}
                  onChange={handleChange}
                  maxLength={1}
                  className="w-full focus:outline-none text-sm p-1 text-center"
                  placeholder="M"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">2. NAME OF CORPORATION</p>
                <input
                  name="corporationName"
                  value={formData.corporationName}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm p-1"
                  placeholder="Corporation Name (if applicable)"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">5. NAME OF AUTHORIZED REPRESENTATIVE</p>
                <input
                  name="authorizedRepresentativeName"
                  value={formData.authorizedRepresentativeName}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm p-1"
                  placeholder="Representative Name (if applicable)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">
                  3. ADDRESS OF APPLICANT <span className="text-red-500">*</span>
                </p>
                <textarea
                  name="applicantAddress"
                  value={formData.applicantAddress}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm p-1 min-h-[72px]"
                  placeholder="Complete address of applicant"
                />
              </div>
              <div className="border border-gray-300 p-1">
                <p className="text-xs mb-1">4. ADDRESS OF CORPORATION</p>
                <textarea
                  name="corporationAddress"
                  value={formData.corporationAddress}
                  onChange={handleChange}
                  className="w-full focus:outline-none text-sm p-1 min-h-[72px]"
                  placeholder="Complete address of corporation (if applicable)"
                />
              </div>
            </div>
          </div>

          {/* PROJECT DETAILS */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">PROJECT DETAILS</p>

            {/* 6. Project Nature */}
            <div className="border border-gray-300 p-2 mb-2">
              <p className="text-xs font-bold mb-1">
                6. PROJECT NATURE <span className="text-red-500">*</span>
              </p>
              <select
                name="projectNature"
                value={formData.projectNature}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">-- Select an option --</option>
                <option value="newDevelopment">New Development</option>
                <option value="improvement">Improvement</option>
                <option value="others">Other (Specify)</option>
              </select>

              {showProjectNatureOther && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">
                    Specify <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="projectNatureOtherSpecify"
                    value={formData.projectNatureOtherSpecify}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify project nature"
                  />
                </div>
              )}
            </div>

            {/* 7. Project Type & 8. Project Area */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs font-bold mb-1">
                  7. PROJECT TYPE <span className="text-red-500">*</span>
                </p>
                <input
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Residential Building, Commercial Complex, etc."
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs font-bold mb-1">
                  8. PROJECT AREA (in sq. m.) <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="projectAreaType"
                    value={formData.projectAreaType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">-- Select type --</option>
                    <option value="lot">Lot</option>
                    <option value="bldg">Bldg.(s)</option>
                    <option value="improvement">Improvement</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    name="projectAreaSqm"
                    value={formData.projectAreaSqm}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Area in sq. m."
                  />
                </div>
              </div>
            </div>

            {/* 9. Project Location */}
            <div className="border border-gray-300 p-2 mb-2">
              <p className="text-xs font-bold mb-1">
                9. PROJECT LOCATION <span className="text-red-500">*</span>
              </p>
              <textarea
                name="projectLocation"
                value={formData.projectLocation}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Complete project location with landmarks"
              />
            </div>

            {/* 10. Project Tenure */}
            <div className="border border-gray-300 p-2 mb-2">
              <p className="text-xs font-bold mb-1">
                10. PROJECT TENURE <span className="text-red-500">*</span>
              </p>
              <select
                name="projectTenure"
                value={formData.projectTenure}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">-- Select an option --</option>
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
                <option value="others">Others (Specify)</option>
              </select>

              {showTenureOther && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">
                    Specify <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="projectTenureOtherSpecify"
                    value={formData.projectTenureOtherSpecify}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify project tenure"
                  />
                </div>
              )}
            </div>

            {/* 11. Right Over Land */}
            <div className="border border-gray-300 p-2">
              <p className="text-xs font-bold mb-1">
                11. RIGHT OVER LAND <span className="text-red-500">*</span>
              </p>
              <select
                name="rightOverLand"
                value={formData.rightOverLand}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">-- Select an option --</option>
                <option value="owner">Owner</option>
                <option value="lease">Lease</option>
                <option value="others">Other (Specify)</option>
              </select>

              {showRightOther && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">
                    Specify <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="rightOverLandOtherSpecify"
                    value={formData.rightOverLandOtherSpecify}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify right over land"
                  />
                </div>
              )}
            </div>
          </div>

          {/* EXISTING LAND USE */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">EXISTING LAND USES OF PROJECT SITE</p>

            <div className="border border-gray-300 p-2">
              <p className="text-xs font-bold mb-1">
                12. EXISTING LAND USES <span className="text-red-500">*</span>
              </p>

              <select
                name="existingLandUse"
                value={formData.existingLandUse}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">-- Select an option --</option>
                <option value="vacantIdle">Vacant / Idle</option>
                <option value="residential">Residential</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural (Specify)</option>
                <option value="institutional">Institutional</option>
                <option value="commercial">Commercial (Specify)</option>
                <option value="tenanted">Tenanted</option>
                <option value="others">Other (Specify)</option>
              </select>

              {showLandUseAgri && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">
                    Agricultural (Specify) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="existingLandUseAgriSpecify"
                    value={formData.existingLandUseAgriSpecify}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify agricultural use"
                  />
                </div>
              )}

              {showLandUseCommercial && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">
                    Commercial (Specify) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="commercialSpecify"
                    value={formData.commercialSpecify}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify commercial use"
                  />
                </div>
              )}

              {showLandUseOther && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">
                    Other (Specify) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="existingLandUseOtherSpecify"
                    value={formData.existingLandUseOtherSpecify}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify other land use"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="border border-gray-200 p-2">
                  <p className="text-xs mb-1">Crop (if agricultural)</p>
                  <input
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type of crop (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 13. Project Cost */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">
              13. PROJECT COST / CAPITALIZATION (write in words and figure)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">In Words <span className="text-red-500">*</span></p>
                <input
                  name="projectCostWords"
                  value={formData.projectCostWords}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., One Million Pesos"
                />
              </div>
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">In Figures (Pesos) <span className="text-red-500">*</span></p>
                <input
                  type="number"
                  min="1"
                  name="projectCostFigures"
                  value={formData.projectCostFigures}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>

          {/* 14. Written Notice */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">
              14. Written notice(s) requiring L/CZC or to apply L/CZC?
            </p>

            <div className="border border-gray-300 p-2">
              <select
                name="q14WrittenNotice"
                value={formData.q14WrittenNotice}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">-- Select --</option>
                <option value="no">No</option>
                <option value="yes">Yes (If yes, fill the details below)</option>
              </select>

              {showQ14Details && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="border border-gray-200 p-2">
                    <p className="text-xs mb-1">16.a Office(s) where filed</p>
                    <input
                      name="q16aOfficeFiled"
                      value={formData.q16aOfficeFiled}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Office name"
                    />
                  </div>

                  <div className="border border-gray-200 p-2">
                    <p className="text-xs mb-1">14.b Date(s) filed</p>
                    <input
                      name="q14bDatesFiled"
                      value={formData.q14bDatesFiled}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Date(s)"
                    />
                  </div>

                  <div className="border border-gray-200 p-2">
                    <p className="text-xs mb-1">16.c Action(s) taken</p>
                    <input
                      name="q16cActionsTaken"
                      value={formData.q16cActionsTaken}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Action taken"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 15. Preferred Mode */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">
              15. Preferred Mode of release of decision
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs font-bold mb-1">
                  Mode <span className="text-red-500">*</span>
                </p>
                <select
                  name="releaseMode"
                  value={formData.releaseMode}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">-- Select --</option>
                  <option value="pickup">Pick-up</option>
                  <option value="mail">By mail</option>
                </select>
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs font-bold mb-1">Address to</p>
                <select
                  name="mailAddressTo"
                  value={formData.mailAddressTo}
                  onChange={handleChange}
                  disabled={!showMailFields}
                  className={`w-full p-2 border border-gray-300 rounded focus:outline-none ${
                    showMailFields
                      ? "focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                >
                  <option value="applicant">Applicant</option>
                  <option value="authorizedRep">Authorized Representative</option>
                </select>

                <div className="mt-2">
                  <p className="text-xs mb-1">
                    Name (for By Mail){" "}
                    {showMailFields && <span className="text-red-500">*</span>}
                  </p>
                  <input
                    name="mailAddressedName"
                    value={formData.mailAddressedName}
                    onChange={handleChange}
                    disabled={!showMailFields}
                    className={`w-full p-2 border border-gray-300 rounded focus:outline-none ${
                      showMailFields
                        ? "focus:ring-2 focus:ring-blue-500"
                        : "bg-gray-100 cursor-not-allowed"
                    }`}
                    placeholder="Enter name for mailing"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">SIGNATURES</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">
                  SIGNATURE OF APPLICANT <span className="text-red-500">*</span>
                </p>
                <input
                  name="signatureApplicant"
                  value={formData.signatureApplicant}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your full name as signature"
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">SIGNATURE OF AUTHORIZED REPRESENTATIVE</p>
                <input
                  name="signatureAuthorizedRep"
                  value={formData.signatureAuthorizedRep}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type representative's full name (if applicable)"
                />
              </div>
            </div>
          </div>

          {/* PAGE 2 - Notary */}
          <div className="border border-gray-500 p-2">
            <p className="text-sm font-bold mb-2">NOTARY SECTION (Subscribed and Sworn)</p>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Day</p>
                <input
                  type="number"
                  min="1"
                  max="31"
                  name="notaryDay"
                  value={formData.notaryDay}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DD"
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Month</p>
                <input
                  name="notaryMonth"
                  value={formData.notaryMonth}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Month"
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Year</p>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  name="notaryYear"
                  value={formData.notaryYear}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YYYY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Municipality</p>
                <input
                  name="notaryAtMunicipality"
                  value={formData.notaryAtMunicipality}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Province</p>
                <input
                  name="notaryProvince"
                  value={formData.notaryProvince}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Residence Certificate No.</p>
                <input
                  name="residenceCertNo"
                  value={formData.residenceCertNo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Certificate number"
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Issued on</p>
                <input
                  name="residenceCertIssuedOn"
                  value={formData.residenceCertIssuedOn}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Issue date"
                />
              </div>

              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Issued at</p>
                <input
                  name="residenceCertIssuedAt"
                  value={formData.residenceCertIssuedAt}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Doc. No.</p>
                <input
                  name="docNo"
                  value={formData.docNo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Document number"
                />
              </div>
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Page No.</p>
                <input
                  name="pageNo"
                  value={formData.pageNo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Page number"
                />
              </div>
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Book No.</p>
                <input
                  name="bookNo"
                  value={formData.bookNo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Book number"
                />
              </div>
              <div className="border border-gray-300 p-2">
                <p className="text-xs mb-1">Series</p>
                <input
                  type="number"
                  name="seriesYear"
                  value={formData.seriesYear}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Year"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-6 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600 transition"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handleReviewClick}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded text-white transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
            >
              Review Application
            </button>

            <button
              type="button"
              onClick={() => {
                if (!validateForm()) return;
                setIsConfirmOpen(true);
              }}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded text-white transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Review Zoning Permit Application</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Applicant Name</p>
                <p className="font-semibold">
                  {formData.applicantLastName}, {formData.applicantFirstName}{" "}
                  {formData.applicantMiddleInitial}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Applicant Address</p>
                <p className="font-semibold">{formData.applicantAddress || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project Nature</p>
                <p className="font-semibold">
                  {formData.projectNature}
                  {formData.projectNature === "others" && formData.projectNatureOtherSpecify
                    ? ` - ${formData.projectNatureOtherSpecify}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project Type</p>
                <p className="font-semibold">{formData.projectType || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project Area</p>
                <p className="font-semibold">
                  {formData.projectAreaType} - {formData.projectAreaSqm} sq. m.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project Location</p>
                <p className="font-semibold">{formData.projectLocation || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project Tenure</p>
                <p className="font-semibold">
                  {formData.projectTenure}
                  {formData.projectTenure === "others" && formData.projectTenureOtherSpecify
                    ? ` - ${formData.projectTenureOtherSpecify}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Right Over Land</p>
                <p className="font-semibold">
                  {formData.rightOverLand}
                  {formData.rightOverLand === "others" && formData.rightOverLandOtherSpecify
                    ? ` - ${formData.rightOverLandOtherSpecify}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Existing Land Use</p>
                <p className="font-semibold">
                  {formData.existingLandUse}
                  {formData.existingLandUse === "agricultural" &&
                  formData.existingLandUseAgriSpecify
                    ? ` - ${formData.existingLandUseAgriSpecify}`
                    : ""}
                  {formData.existingLandUse === "commercial" && formData.commercialSpecify
                    ? ` - ${formData.commercialSpecify}`
                    : ""}
                  {formData.existingLandUse === "others" && formData.existingLandUseOtherSpecify
                    ? ` - ${formData.existingLandUseOtherSpecify}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Project Cost</p>
                <p className="font-semibold">
                  {formData.projectCostWords} (₱{Number(formData.projectCostFigures).toLocaleString()})
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Release Mode</p>
                <p className="font-semibold">{formData.releaseMode}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setIsReviewOpen(false)}
              >
                Back to Form
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsReviewOpen(false);
                  setIsConfirmOpen(true);
                }}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded text-white transition ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-3 text-center">Confirm Submission</h3>
            <p className="text-sm text-gray-700 mb-4 text-center">
              Are you sure you want to submit this zoning permit application?
            </p>
            <p className="text-xs text-gray-500 mb-6 text-center">
              Once submitted, you cannot edit the application.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded text-white transition ${
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <UFooter />
    </div>
  );
}