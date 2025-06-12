import { useState } from 'react';
import Uheader from '../../Header/User_header';
import UFooter from '../../Footer/User_Footer';

export default function BuildingPermitForm() {
  const [formData, setFormData] = useState({
    appliesAlsoFor: '',
    lastName: '',
    firstName: '',
    middleInitial: '',
    tin: '',
    forConstructionOwned: '',
    formOfOwnership: '',
    no: '',
    street: '',
    barangay: '',
    cityMunicipality: '',
    zipCode: '',
    telephoneNo: '',
    lotNo: '',
    blkNo: '',
    tctNo: '',
    currentTaxDecNo: '',
    constructionStreet: '',
    constructionBarangay: '',
    constructionCity: '',
    scopeOfWork: '',
    groupA: '',
    groupG: '',
    groupB: '',
    groupH: '',
    groupC: '',
    groupI: '',
    groupD: '',
    groupJ1: '',
    groupE: '',
    groupJ2: '',
    groupF: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Building permit application submitted successfully!');
  };

  const scopeOfWorkOptions = [
    'New Construction',
    'Addition',
    'Alteration',
    'Renovation',
    'Repair',
    'Demolition',
    'Change of Occupancy',
    'Others'
  ];

  const occupancyGroups = {
    groupA: ['Single Family Dwelling', 'Duplex', 'Townhouse', 'Apartment Building'],
    groupG: ['Light Manufacturing', 'Processing Plant', 'Warehouse', 'Storage Facility'],
    groupB: ['Boarding House', 'Hotel', 'Dormitory', 'Condominium'],
    groupH: ['Factory', 'Heavy Industrial Plant', 'Manufacturing Facility'],
    groupC: ['School', 'Library', 'Museum', 'Community Center'],
    groupI: ['Hospital', 'Clinic', 'Laboratory', 'Assembly Hall'],
    groupD: ['Government Building', 'Office Building', 'Bank', 'Municipal Hall'],
    groupJ1: ['Farm Building', 'Agricultural Storage', 'Greenhouse'],
    groupE: ['Store', 'Shopping Center', 'Market', 'Commercial Building'],
    groupJ2: ['Garage', 'Carport', 'Tool Shed', 'Storage Shed'],
    groupF: ['Workshop', 'Small Manufacturing', 'Service Shop']
  };

  return (
    <div>
        <Uheader/>
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-8">
             <div class="flex justify-center items-center">
          <img src="img/logo.png" alt="" class="w-40 h-30"/>
      </div>
            <h1 className="text-3xl font-bold text-gray-800">BUILDING PERMIT FORM</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LAST NAME</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FIRST NAME</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">M.I</label>
                    <input
                      type="text"
                      name="middleInitial"
                      value={formData.middleInitial}
                      onChange={handleInputChange}
                      placeholder="Middle Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TIN</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">FOR CONSTRUCTION OWNED</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">FORM OF OWNERSHIP</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">NO.</label>
                    <input
                      type="text"
                      name="no"
                      value={formData.no}
                      onChange={handleInputChange}
                      placeholder="No."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">STREET</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Street"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BARANGAY</label>
                    <input
                      type="text"
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleInputChange}
                      placeholder="Barangay"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CITY / MUNICIPALITY</label>
                    <input
                      type="text"
                      name="cityMunicipality"
                      value={formData.cityMunicipality}
                      onChange={handleInputChange}
                      placeholder="City/Municipality"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP CODE</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">TELEPHONE NO.</label>
                    <input
                      type="text"
                      name="telephoneNo"
                      value={formData.telephoneNo}
                      onChange={handleInputChange}
                      placeholder="Telephone no."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">LOT NO.</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">BLK NO.</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">TCT NO.</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">CURRENT TAX DEC. NO.</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">STREET</label>
                    <input
                      type="text"
                      name="constructionStreet"
                      value={formData.constructionStreet}
                      onChange={handleInputChange}
                      placeholder="Barangay"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BARANGAY</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">CITY / MUNICIPALITY</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">SELECT SCOPE OF WORK</label>
                <select
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select an Option --</option>
                  {scopeOfWorkOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Use or Character of Occupancy */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md">
                <h2 className="font-semibold">USE OR CHARACTER OF OCCUPANCY</h2>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
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
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <UFooter/>
    </div>
  );
}