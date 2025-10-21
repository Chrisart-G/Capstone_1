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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="bg-gray-100 border-b-2 border-gray-800 p-6 text-center">
          <h1 className="text-lg font-bold">REPUBLIC OF THE PHILIPPINES</h1>
          <h2 className="text-base font-semibold">OFFICE OF THE ZONING ADMINISTRATOR</h2>
          <h3 className="text-sm">Hinigaran, Negros Occidental</h3>
          <p className="text-sm mt-2">-oOo-</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Application Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Application No.</label>
              <input
                type="text"
                name="applicationNo"
                value={formData.applicationNo}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Date Received</label>
              <input
                type="date"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">PIN No./ OR No.</label>
              <input
                type="text"
                name="pin"
                value={formData.pin}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Date Issued</label>
              <input
                type="date"
                name="dateIssued"
                value={formData.dateIssued}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1">Loc. Clearance No.</label>
              <input
                type="text"
                name="locClearance"
                value={formData.locClearance}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Title */}
          <div className="bg-gray-200 p-2 text-center">
            <h3 className="text-sm font-bold">APPLICATION FOR LOCATIONAL CLEARANCE/CERTIFICATE OF ZONING COMPLIANCE</h3>
          </div>

          {/* Applicant Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1">
                1. NAME OF APPLICANT (Last Name) (First Name) (M.I.)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="applicantLastName"
                  placeholder="Last Name"
                  value={formData.applicantLastName}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  name="applicantFirstName"
                  placeholder="First Name"
                  value={formData.applicantFirstName}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  name="applicantMiddleInitial"
                  placeholder="M.I."
                  value={formData.applicantMiddleInitial}
                  onChange={handleInputChange}
                  className="border border-gray-300 px-2 py-1 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">2. NAME OF CORPORATION</label>
              <input
                type="text"
                name="corporationName"
                value={formData.corporationName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">3. ADDRESS OF APPLICANT</label>
              <input
                type="text"
                name="applicantAddress"
                value={formData.applicantAddress}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">4. ADDRESS CORPORATION</label>
              <input
                type="text"
                name="corporationAddress"
                value={formData.corporationAddress}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">5. NAME OF AUTHORIZED REPRESENTATIVE</label>
              <input
                type="text"
                name="authorizedRep"
                value={formData.authorizedRep}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">6. PROJECT NATURE</label>
              <select
                name="projectNature"
                value={formData.projectNature}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="">Select Project Nature</option>
                <option value="new">New Development</option>
                <option value="expansion">Expansion</option>
                <option value="other">Other (Specify)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">7. PROJECT TYPE</label>
              <input
                type="text"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">8. PROJECT AREA (e.g. sq. m.)</label>
              <input
                type="text"
                name="projectArea"
                value={formData.projectArea}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">9. PROJECT LOCATION</label>
              <input
                type="text"
                name="projectLocation"
                value={formData.projectLocation}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">10. PROJECT USE</label>
              <select
                name="projectUse"
                value={formData.projectUse}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="">Select Project Use</option>
                <option value="improvement">(a) Improvement</option>
                <option value="tenure">(b) PROJECT TENURE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">11. RIGHT OVER LAND</label>
            <select
              name="rightOverLand"
              value={formData.rightOverLand}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-2 py-1 text-sm"
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
                className="w-full border border-gray-300 px-2 py-1 text-sm mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2">12. PRESENT AND USES OF PROJECT SITE</label>
            <select
              name="projectSite"
              value={formData.projectSite}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-2 py-1 text-sm"
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
                className="w-full border border-gray-300 px-2 py-1 text-sm mt-2"
              />
            )}
            {formData.projectSite === 'other' && (
              <input
                type="text"
                name="otherSpecify"
                placeholder="Please specify other type"
                value={formData.otherSpecify}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">13. PROJECT COST/ CAPITALIZATION (in Pesos, write in words and figure)</label>
            <input
              type="text"
              name="projectCost"
              value={formData.projectCost}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          {/* Requirements Section */}
          <div className="border border-gray-300 p-4">
            <p className="text-xs mb-2">
              <strong>14.</strong> Is the project applied for the subject of written notice: (a) from this commission and/ or designated zoning
              administrator that the effect regarding the following, (b) locational clearance certificate issued in compliance LC/ZC:
            </p>
            <div className="space-y-2">
              <label className="flex items-center text-xs">
                <input type="checkbox" name="writtenNotice" checked={formData.writtenNotice} onChange={handleInputChange} className="mr-2" />
                (a) written notice
              </label>
              <label className="flex items-center text-xs">
                <input type="checkbox" name="locationalClearance" checked={formData.locationalClearance} onChange={handleInputChange} className="mr-2" />
                (b.1) Date (s) Blvd_____ 16, c.) Action
              </label>
              <label className="flex items-center text-xs">
                <input type="checkbox" name="certificateOfZoning" checked={formData.certificateOfZoning} onChange={handleInputChange} className="mr-2" />
                (b) blue(s) by official / mention in lic. a.)
              </label>
              <label className="flex items-center text-xs">
                <input type="checkbox" name="bluePrint" checked={formData.bluePrint} onChange={handleInputChange} className="mr-2" />
                Date (s) (b) Pick-up
              </label>
            </div>
            <textarea
              name="actionTaken"
              placeholder="Action Taken"
              value={formData.actionTaken}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-2 py-1 text-sm mt-2"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">15. RETURNED AND REASON, if any</label>
              <textarea
                name="returnedReason"
                value={formData.returnedReason}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">16. NAME OF APPLICANT/AUTHORIZED REPRESENTATIVE</label>
              <input
                type="text"
                name="submittedBy"
                placeholder="Applicant"
                value={formData.submittedBy}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm mb-2"
              />
              <input
                type="text"
                name="receivedBy"
                placeholder="Authorized Representative"
                value={formData.receivedBy}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Footer Section */}
          <div className="border-t-2 border-gray-300 pt-4 mt-6">
            <p className="text-xs font-semibold">REPUBLIC OF THE PHILIPPINES</p>
            <p className="text-xs">PROVINCE OF NEGROS OCCIDENTAL  S. S.</p>
            <p className="text-xs">MUNICIPALITY OF HINIGARAN</p>
            
            <div className="mt-4 space-y-2">
              <p className="text-xs">SUBSCRIBED AND SWORN TO, before me this _______ day of _______, at</p>
              <p className="text-xs">Municipality of HINIGARAN, Province of Negros Occidental established to me his/her Residence</p>
              <p className="text-xs">Certificate No. _______ issued on _______ at HINIGARAN, Negros Occidental, Philippines.</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs mb-1">Doc. No.</label>
                  <input type="text" className="w-full border border-gray-300 px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-right">NOTARY PUBLIC</label>
                  <input type="text" className="w-full border border-gray-300 px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Page No.</label>
                  <input type="text" className="w-full border border-gray-300 px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Book No.</label>
                  <input type="text" className="w-full border border-gray-300 px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Series of 2013</label>
                  <input type="text" className="w-full border border-gray-300 px-2 py-1 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded"
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