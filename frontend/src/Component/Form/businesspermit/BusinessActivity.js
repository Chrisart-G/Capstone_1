import React from 'react';

const BusinessActivity = ({ formData, handleBusinessLineChange, addBusinessLine, removeBusinessLine }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-300">Business Activity</h2>
    
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">LINE OF BUSINESS</th>
            <th className="border border-gray-300 p-2 text-left">NO. OF UNITS</th>
            <th className="border border-gray-300 p-2 text-left">CAPITALIZATION</th>
            <th className="border border-gray-300 p-2 text-center" colSpan="2">GROSS/SALES RECEIPTS</th>
            <th className="border border-gray-300 p-2 text-center">ACTIONS</th>
          </tr>
          <tr>
            <th className="border border-gray-300 p-2" colSpan="3"></th>
            <th className="border border-gray-300 p-2 text-center">ESSENTIAL</th>
            <th className="border border-gray-300 p-2 text-center">NON-ESSENTIAL</th>
            <th className="border border-gray-300 p-2"></th>
          </tr>
        </thead>
        <tbody>
          {formData.businessLines.map((line, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={line.line}
                  onChange={(e) => handleBusinessLineChange(index, 'line', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                  required
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={line.units}
                  onChange={(e) => handleBusinessLineChange(index, 'units', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                  required
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={line.capitalization}
                  onChange={(e) => handleBusinessLineChange(index, 'capitalization', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                  required
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={line.essentialGross}
                  onChange={(e) => handleBusinessLineChange(index, 'essentialGross', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                  required
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={line.nonEssentialGross}
                  onChange={(e) => handleBusinessLineChange(index, 'nonEssentialGross', e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                  required
                />
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {formData.businessLines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBusinessLine(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    <div className="flex justify-center">
      <button
        type="button"
        onClick={addBusinessLine}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Business Line
      </button>
    </div>
  </div>
);

export default BusinessActivity;