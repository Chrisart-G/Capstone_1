import React, { useState } from 'react';
import Uheader from '../Header/User_header';
const MayorsPermitForm = () => {
  const [formData, setFormData] = useState({
    permitNo: '',
    dateOfIssuance: new Date().toISOString().split('T')[0],
    nameOfPermittee: '',
    businessName: '',
    businessAddress: '',
    kindOfBusiness: '',
    businessStatus: 'RENEWAL',
    businessPlateNo: '',
    modeOfPayment: 'ANNUALLY',
    orNo: '',
    amountPaid: '',
    datePaid: new Date().toISOString().split('T')[0],
    expirationDate: '2025-12-31'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form Submitted:\n' + JSON.stringify(formData, null, 2));
  };

  return (
    <main>
    <Uheader/>
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 border border-gray-300 shadow-md relative">
      <div className="relative mb-4">
        <div className="absolute top-0 left-0 w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
            <div className="text-center leading-tight">
              <div>OFFICIAL</div>
              <div>SEAL</div>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-2">
          <div className="text-sm mb-1">Republic of the Philippines</div>
          <div className="text-sm mb-1">Province of Negros Occidental</div>
          <div className="text-sm font-bold mb-1">MUNICIPALITY OF HINIGARAN</div>
          <div className="text-sm mb-1">OFFICE OF THE MAYOR</div>
          <div className="text-sm font-bold">BUSINESS PERMIT AND LICENSING OFFICE</div>
        </div>
        
        <div className="absolute top-0 right-0 bg-blue-500 p-2 rounded-bl-lg text-white">
          <div className="text-xs">ANNUAL BUSINESS TAX</div>
          <div className="text-xl font-bold text-yellow-300">2025</div>
        </div>
      </div>

      {/* Permit Title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">MAYOR'S PERMIT</h1>
      </div>

      {/* Permit Description */}
      <div className="text-xs mb-4 text-justify">
        This is to certify that in accordance with the application filed by the applicant, PERMIT IS HEREBY 
        GRANTED to him/her to operate, conduct, undertake and/or exercise his/her business, trade, occupation and/or 
        profession pursuant to the requirement and provisions of existing Municipal Ordinances and other applicable laws, 
        subject to the payment of the necessary Municipal License Tax, Permit Fees and other charges as prescribed by the 
        Local Tax Code.
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">PERMIT NO.:</div>
        </div>
        <div className="border border-gray-400 p-1">
          <input
            type="text"
            name="permitNo"
            value={formData.permitNo}
            onChange={handleChange}
            placeholder="B25 - 0263"
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        <div className="border border-gray-400 p-1 bg-red-100 flex items-center justify-center">
          <div className="text-2xl font-bold text-red-600">2025</div>
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">DATE OF ISSUANCE:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="date"
            name="dateOfIssuance"
            value={formData.dateOfIssuance}
            onChange={handleChange}
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">NAME OF PERMITTEE:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="text"
            name="nameOfPermittee"
            value={formData.nameOfPermittee}
            onChange={handleChange}
            placeholder="DIANE S. GEALOLO"
            className="w-full text-xs p-0 border-none focus:ring-0 uppercase"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">BUSINESS NAME:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="A & A V2O WATER REFILLING STATION"
            className="w-full text-xs p-0 border-none focus:ring-0 uppercase"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">BUSINESS ADDRESS:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="text"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            placeholder="Kahilwayan, Village, Brgy. Gargato, Hinigaran, Neg. Occ."
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">KIND OF BUSINESS:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="text"
            name="kindOfBusiness"
            value={formData.kindOfBusiness}
            onChange={handleChange}
            placeholder="WATER REFILLING STATION"
            className="w-full text-xs p-0 border-none focus:ring-0 uppercase"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">Business Status:</div>
        </div>
        <div className="border border-gray-400 p-1">
          <select
            name="businessStatus"
            value={formData.businessStatus}
            onChange={handleChange}
            className="w-full text-xs p-0 border-none focus:ring-0"
          >
            <option value="NEW">NEW</option>
            <option value="RENEWAL">RENEWAL</option>
          </select>
        </div>
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">Business Plate No.</div>
          <input
            type="text"
            name="businessPlateNo"
            value={formData.businessPlateNo}
            onChange={handleChange}
            placeholder="1195"
            className="w-full text-lg font-bold text-red-600 text-center p-0 border-none focus:ring-0"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">Mode of Payment:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <select
            name="modeOfPayment"
            value={formData.modeOfPayment}
            onChange={handleChange}
            className="w-full text-xs p-0 border-none focus:ring-0"
          >
            <option value="ANNUALLY">ANNUALLY</option>
            <option value="QUARTERLY">QUARTERLY</option>
            <option value="SEMI-ANNUALLY">SEMI-ANNUALLY</option>
          </select>
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">O.R. NO.:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="text"
            name="orNo"
            value={formData.orNo}
            onChange={handleChange}
            placeholder="7012498"
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">Amount Paid:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="text"
            name="amountPaid"
            value={formData.amountPaid}
            onChange={handleChange}
            placeholder="P 9,086.79"
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        
        <div className="border border-gray-400 p-1">
          <div className="text-xs font-bold">Date Paid:</div>
        </div>
        <div className="border border-gray-400 p-1 col-span-2">
          <input
            type="date"
            name="datePaid"
            value={formData.datePaid}
            onChange={handleChange}
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        
        <div className="border border-gray-400 p-1 col-span-2">
          <div className="text-xs font-bold">Date of Expiration:</div>
          <input
            type="date"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            className="w-full text-xs p-0 border-none focus:ring-0"
          />
        </div>
        <div className="border border-gray-400 p-1">
          <div className="text-center text-xs">
            <div className="font-bold">HON. JOSE NADIE P. ARCEO</div>
            <div>MUNICIPAL MAYOR</div>
            <div className="border-t border-black mt-4 pt-1">Signature</div>
          </div>
        </div>
      </div>
      
      {/* Emergency Section */}
      <div className="mb-4">
        <div className="bg-red-100 inline-block px-2 py-1 text-red-600 font-bold text-sm">
          IN CASE OF EMERGENCY
        </div>
        <div className="text-center mt-2">
          <div className="text-xl font-bold text-red-600">PLEASE CALL</div>
        </div>
      </div>
      
      {/* Contact Numbers */}
      <div className="grid grid-cols-4 gap-2 text-xs mb-6">
        <div className="border border-gray-400 p-1">
          <div className="font-bold">MDRRMO</div>
          <div>(034) - 740-7575</div>
          <div className="text-red-600">0985-987-4053</div>
        </div>
        <div className="border border-gray-400 p-1">
          <div className="font-bold">PNP</div>
          <div className="text-blue-600">0998-5987-424</div>
        </div>
        <div className="border border-gray-400 p-1">
          <div className="font-bold">BFP</div>
          <div className="text-red-600">0981-514-0278</div>
          <div className="text-red-600">0954-328-9473</div>
          <div>(034) - 469-5897</div>
        </div>
        <div className="border border-gray-400 p-1">
          <div className="font-bold">HOSPITAL</div>
          <div className="text-blue-600">0905-528-1740</div>
          <div>(ER)</div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="text-center">
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-bold"
        >
          Submit Permit Application
        </button>
      </div>
      
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="transform rotate-45 text-6xl font-bold text-gray-500">OFFICIAL SEAL</div>
      </div>
    </form>
    </main>
  );
};

export default MayorsPermitForm;