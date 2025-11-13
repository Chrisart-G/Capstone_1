import React, { useState } from 'react';

const ZoningApplicationForm = () => {
  const [formData, setFormData] = useState({
    applicationNo: '',
    dateReceived: '',
    pin: '',
    dateIssued: '',
    locClearance: '',
    applicantLastName: '',
    applicantFirstName: '',
    applicantMiddleInitial: '',
    corporationName: '',
    applicantAddress: '',
    corporationAddress: '',
    authorizedRep: '',
    projectNature: '',
    projectType: '',
    projectArea: '',
    projectUse: '',
    projectLocation: '',
    projectTenure: '',
    rightOverLand: '',
    ownerSpecify: '',
    projectSite: '',
    vacantIdle: false,
    industrial: false,
    agricultural: false,
    residential: false,
    other: false,
    agriculturalSpecify: '',
    commercial: false,
    otherSpecify: '',
    projectCost: '',
    writtenNotice: false,
    locationalClearance: false,
    certificateOfZoning: false,
    bluePrint: false,
    actionTaken: '',
    returnedReason: '',
    submittedBy: '',
    receivedBy: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted successfully! Check console for data.');
  };

  // ---- UI helpers (classes only) ----
  const card = "rounded-2xl border border-gray-200 bg-white shadow-lg";
  const section = "rounded-xl border border-gray-100 bg-white/60 p-5";
  const heading = "mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700";
  const label = "block text-[11px] font-semibold tracking-wide text-gray-600 mb-1";
  const input =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm";
  const select = input;
  const textarea =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm";
  const checkbox =
    "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4">
      <div className={`max-w-5xl mx-auto ${card}`}>
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-slate-100 to-slate-50 border-b p-8 text-center">
          <p className="text-xs font-medium tracking-wider text-gray-500">REPUBLIC OF THE PHILIPPINES</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-wide text-gray-900">OFFICE OF THE ZONING ADMINISTRATOR</h2>
          <p className="text-xs text-gray-600">Hinigaran, Negros Occidental</p>
          <div className="mx-auto mt-4 h-px w-24 bg-gray-300" />
          <p className="text-xs mt-2 text-gray-500">— oOo —</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Application Details */}
          <div className={section}>
            <h3 className={heading}>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>Application No.</label>
                <input
                  type="text"
                  name="applicationNo"
                  value={formData.applicationNo}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Date Received</label>
                <input
                  type="date"
                  name="dateReceived"
                  value={formData.dateReceived}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>PIN No./ OR No.</label>
                <input
                  type="text"
                  name="pin"
                  value={formData.pin}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Date Issued</label>
                <input
                  type="date"
                  name="dateIssued"
                  value={formData.dateIssued}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Loc. Clearance No.</label>
                <input
                  type="text"
                  name="locClearance"
                  value={formData.locClearance}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
            <h3 className="text-[13px] font-bold text-blue-700">
              APPLICATION FOR LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE
            </h3>
          </div>

          {/* Applicant Information */}
          <div className={section}>
            <h3 className={heading}>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Applicant Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-2">
                <label className={label}>
                  1. NAME OF APPLICANT (Last Name) (First Name) (M.I.)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="applicantLastName"
                    placeholder="Last Name"
                    value={formData.applicantLastName}
                    onChange={handleInputChange}
                    className={input}
                  />
                  <input
                    type="text"
                    name="applicantFirstName"
                    placeholder="First Name"
                    value={formData.applicantFirstName}
                    onChange={handleInputChange}
                    className={input}
                  />
                  <input
                    type="text"
                    name="applicantMiddleInitial"
                    placeholder="M.I."
                    value={formData.applicantMiddleInitial}
                    onChange={handleInputChange}
                    className={input}
                  />
                </div>
              </div>

              <div>
                <label className={label}>2. NAME OF CORPORATION</label>
                <input
                  type="text"
                  name="corporationName"
                  value={formData.corporationName}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>3. ADDRESS OF APPLICANT</label>
                <input
                  type="text"
                  name="applicantAddress"
                  value={formData.applicantAddress}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>4. ADDRESS CORPORATION</label>
                <input
                  type="text"
                  name="corporationAddress"
                  value={formData.corporationAddress}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>5. NAME OF AUTHORIZED REPRESENTATIVE</label>
                <input
                  type="text"
                  name="authorizedRep"
                  value={formData.authorizedRep}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>6. PROJECT NATURE</label>
                <select
                  name="projectNature"
                  value={formData.projectNature}
                  onChange={handleInputChange}
                  className={select}
                >
                  <option value="">Select Project Nature</option>
                  <option value="new">New Development</option>
                  <option value="expansion">Expansion</option>
                  <option value="other">Other (Specify)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className={section}>
            <h3 className={heading}>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Project Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>7. PROJECT TYPE</label>
                <input
                  type="text"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>8. PROJECT AREA (e.g. sq. m.)</label>
                <input
                  type="text"
                  name="projectArea"
                  value={formData.projectArea}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>9. PROJECT LOCATION</label>
                <input
                  type="text"
                  name="projectLocation"
                  value={formData.projectLocation}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>10. PROJECT USE</label>
                <select
                  name="projectUse"
                  value={formData.projectUse}
                  onChange={handleInputChange}
                  className={select}
                >
                  <option value="">Select Project Use</option>
                  <option value="improvement">(a) Improvement</option>
                  <option value="tenure">(b) PROJECT TENURE</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className={label}>11. RIGHT OVER LAND</label>
              <select
                name="rightOverLand"
                value={formData.rightOverLand}
                onChange={handleInputChange}
                className={select}
              >
                <option value="">Select Right Over Land</option>
                <option value="owner">Owner</option>
                <option value="lessee">Lessee</option>
                <option value="other">Other Specify</option>
              </select>
              {formData.rightOverLand === 'other' && (
                <input
                  type="text"
                  name="ownerSpecify"
                  placeholder="Please specify"
                  value={formData.ownerSpecify}
                  onChange={handleInputChange}
                  className={`${input} mt-2`}
                />
              )}
            </div>

            <div className="mt-4">
              <label className={label}>12. PRESENT AND USES OF PROJECT SITE</label>
              <select
                name="projectSite"
                value={formData.projectSite}
                onChange={handleInputChange}
                className={select}
              >
                <option value="">Select Project Site Use</option>
                <option value="residential">Residential</option>
                <option value="industrial">Industrial</option>
                <option value="vacantIdle">Vacant, Idle</option>
                <option value="agricultural">Agricultural (Specify)</option>
                <option value="commercial">Commercial</option>
                <option value="other">Other</option>
              </select>
              {formData.projectSite === 'agricultural' && (
                <input
                  type="text"
                  name="agriculturalSpecify"
                  placeholder="Please specify agricultural type"
                  value={formData.agriculturalSpecify}
                  onChange={handleInputChange}
                  className={`${input} mt-2`}
                />
              )}
              {formData.projectSite === 'other' && (
                <input
                  type="text"
                  name="otherSpecify"
                  placeholder="Please specify other type"
                  value={formData.otherSpecify}
                  onChange={handleInputChange}
                  className={`${input} mt-2`}
                />
              )}
            </div>

            <div className="mt-4">
              <label className={label}>13. PROJECT COST/ CAPITALIZATION (in Pesos, write in words and figure)</label>
              <input
                type="text"
                name="projectCost"
                value={formData.projectCost}
                onChange={handleInputChange}
                className={input}
              />
            </div>
          </div>

          {/* Requirements Section */}
          <div className={section}>
            <h3 className={heading}>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Requirements & Notes
            </h3>

            <p className="text-xs text-gray-600 mb-3">
              <strong>14.</strong> Is the project applied for the subject of written notice: (a) from this commission and/or designated zoning
              administrator… (b) locational clearance certificate issued in compliance LC/ZC:
            </p>

            <div className="grid gap-2 text-xs">
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" name="writtenNotice" checked={formData.writtenNotice} onChange={handleInputChange} className={checkbox} />
                (a) written notice
              </label>
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" name="locationalClearance" checked={formData.locationalClearance} onChange={handleInputChange} className={checkbox} />
                (b.1) Date (s) Blvd_____ 16, c.) Action
              </label>
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" name="certificateOfZoning" checked={formData.certificateOfZoning} onChange={handleInputChange} className={checkbox} />
                (b) blue(s) by official / mention in lic. a.)
              </label>
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" name="bluePrint" checked={formData.bluePrint} onChange={handleInputChange} className={checkbox} />
                Date (s) (b) Pick-up
              </label>
            </div>

            <textarea
              name="actionTaken"
              placeholder="Action Taken"
              value={formData.actionTaken}
              onChange={handleInputChange}
              className={`${textarea} mt-3`}
              rows="2"
            />
          </div>

          {/* Final Section */}
          <div className={section}>
            <h3 className={heading}>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Submission & Acknowledgment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>15. RETURNED AND REASON, if any</label>
                <textarea
                  name="returnedReason"
                  value={formData.returnedReason}
                  onChange={handleInputChange}
                  className={textarea}
                  rows="2"
                />
              </div>
              <div>
                <label className={label}>16. NAME OF APPLICANT/AUTHORIZED REPRESENTATIVE</label>
                <input
                  type="text"
                  name="submittedBy"
                  placeholder="Applicant"
                  value={formData.submittedBy}
                  onChange={handleInputChange}
                  className={`${input} mb-2`}
                />
                <input
                  type="text"
                  name="receivedBy"
                  placeholder="Authorized Representative"
                  value={formData.receivedBy}
                  onChange={handleInputChange}
                  className={input}
                />
              </div>
            </div>
          </div>

          {/* Footer / Notary */}
          <div className={`${section} border-t`}>
            <h3 className={heading}>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Notary Details
            </h3>

            <p className="text-[11px] font-semibold text-gray-700">REPUBLIC OF THE PHILIPPINES</p>
            <p className="text-[11px] text-gray-700">PROVINCE OF NEGROS OCCIDENTAL  S. S.</p>
            <p className="text-[11px] text-gray-700">MUNICIPALITY OF HINIGARAN</p>

            <div className="mt-3 space-y-1 text-[11px] text-gray-700">
              <p>SUBSCRIBED AND SWORN TO, before me this _______ day of _______, at</p>
              <p>Municipality of HINIGARAN, Province of Negros Occidental established to me his/her Residence</p>
              <p>Certificate No. _______ issued on _______ at HINIGARAN, Negros Occidental, Philippines.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={`${label} mb-1`}>Doc. No.</label>
                <input type="text" className={input} />
              </div>
              <div>
                <label className={`${label} mb-1 md:text-right`}>NOTARY PUBLIC</label>
                <input type="text" className={input} />
              </div>
              <div>
                <label className={`${label} mb-1`}>Page No.</label>
                <input type="text" className={input} />
              </div>
              <div>
                <label className={`${label} mb-1`}>Book No.</label>
                <input type="text" className={input} />
              </div>
              <div>
                <label className={`${label} mb-1`}>Series of 2013</label>
                <input type="text" className={input} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoningApplicationForm;
