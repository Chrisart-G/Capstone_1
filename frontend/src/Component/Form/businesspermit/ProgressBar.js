import React from 'react';

const ProgressBar = ({ steps, currentStep }) => (
  <div className="mb-8">
    <div className="flex justify-between mb-2">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`text-xs md:text-sm text-center ${currentStep >= index ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          style={{ width: `${100 / steps.length}%` }}
        >
          {step}
        </div>
      ))}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
      ></div>
    </div>
  </div>
);

export default ProgressBar;