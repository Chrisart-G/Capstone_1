import React, { useState } from 'react';
import Uheader from '../../Header/User_header';

export default function MayorsPermitForm() {
  // Sample unavailable dates (in a real application, these would come from an API)
  const unavailableDates = [
    "2025-04-15", "2025-04-20", "2025-04-21", "2025-04-25", 
    "2025-05-01", "2025-05-05", "2025-05-10", "2025-05-15"
  ];

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    businessType: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    eventType: '',
    eventDate: '',
    eventLocation: '',
    eventDuration: '',
    attendees: '',
    permitType: 'business', // Default to business permit
    description: '',
    agreeToTerms: false
  });

  // State for calendar visibility
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Permit application submitted successfully! The mayor\'s office will review your application.');
    console.log(formData);
  };

  // Calendar functions
  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const isDateUnavailable = (dateString) => {
    return unavailableDates.includes(dateString);
  };

  const selectDate = (day) => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    if (!isDateUnavailable(dateString)) {
      setFormData(prevState => ({
        ...prevState,
        eventDate: dateString
      }));
      setShowCalendar(false);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    for (let day = 1; day <= daysCount; day++) {
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isUnavailable = isDateUnavailable(dateString);
      const isSelected = dateString === formData.eventDate;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`
            h-8 w-8 flex items-center justify-center rounded-full cursor-pointer mx-auto
            ${isUnavailable ? 'bg-red-100 text-red-500 line-through cursor-not-allowed' : 'hover:bg-blue-100'}
            ${isSelected ? 'bg-blue-500 text-white' : ''}
          `}
          onClick={() => !isUnavailable && selectDate(day)}
          title={isUnavailable ? "Unavailable date" : "Available date"}
        >
          {day}
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 absolute z-10 mt-1 w-64">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded hover:bg-gray-200"
            type="button"
          >
            &lt;
          </button>
          <div className="font-semibold">{monthName} {year}</div>
          <button 
            onClick={nextMonth}
            className="p-1 rounded hover:bg-gray-200"
            type="button"
          >
            &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-700 mb-1">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        <div className="mt-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 mr-1 rounded-full"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 mr-1 rounded-full"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
        <Uheader/>
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-700 p-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v1H3V3zm1 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm12 8a1 1 0 01-1 1H5a1 1 0 01-1-1V8h12v7z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mayor's Permit Application</h1>
          <p className="text-blue-100 mt-2">City of Springfield</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Permit Type Selection */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Select Permit Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer bg-white shadow-sm">
                <input
                  type="radio"
                  name="permitType"
                  value="business"
                  checked={formData.permitType === 'business'}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <div>
                  <p className="font-medium">Business Permit</p>
                  <p className="text-sm text-gray-500">For opening or operating a business</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer bg-white shadow-sm">
                <input
                  type="radio"
                  name="permitType"
                  value="event"
                  checked={formData.permitType === 'event'}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <div>
                  <p className="font-medium">Event Permit</p>
                  <p className="text-sm text-gray-500">For organizing a public event</p>
                </div>
              </label>
            </div>
          </div>

          {/* Applicant Information Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Applicant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Applicant Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Permit Section */}
          {formData.permitType === 'business' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    id="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'business'}
                  />
                </div>
                
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    id="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'business'}
                  >
                    <option value="">Select Type</option>
                    <option value="retail">Retail</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="service">Service</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ID / Business License Number
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    id="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'business'}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'business'}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Event Permit Section */}
          {formData.permitType === 'event' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Event Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    id="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'event'}
                  >
                    <option value="">Select Type</option>
                    <option value="festival">Festival</option>
                    <option value="parade">Parade</option>
                    <option value="concert">Concert</option>
                    <option value="market">Market/Fair</option>
                    <option value="sports">Sports Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="relative">
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="eventDate"
                      id="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                      required={formData.permitType === 'event'}
                      placeholder="YYYY-MM-DD"
                      onClick={() => setShowCalendar(!showCalendar)}
                      readOnly
                    />
                    <button
                      type="button"
                      className="bg-blue-100 border border-l-0 border-blue-300 p-2 rounded-r-md"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                  {showCalendar && renderCalendar()}
                </div>
                
                <div>
                  <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Location
                  </label>
                  <input
                    type="text"
                    name="eventLocation"
                    id="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'event'}
                  />
                </div>
                
                <div>
                  <label htmlFor="eventDuration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="eventDuration"
                    id="eventDuration"
                    value={formData.eventDuration}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'event'}
                  />
                </div>
                
                <div>
                  <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    name="attendees"
                    id="attendees"
                    value={formData.attendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'event'}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.permitType === 'event'}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Terms and Submission */}
          <div className="border-t pt-6">
            <div className="flex items-start mb-6">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                  I certify that the information provided is true and accurate
                </label>
                <p className="text-gray-500">By submitting this form, I agree to comply with all city ordinances and regulations.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setFormData({
                  businessName: '',
                  ownerName: '',
                  businessType: '',
                  address: '',
                  phone: '',
                  email: '',
                  taxId: '',
                  eventType: '',
                  eventDate: '',
                  eventLocation: '',
                  eventDuration: '',
                  attendees: '',
                  permitType: 'business',
                  description: '',
                  agreeToTerms: false
                })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Application
              </button>
            </div>
          </div>
        </form>

        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p>Mayor's Office - City Hall, 123 Main Street, Springfield</p>
          <p>For inquiries: (555) 123-4567 or permits@springfield.gov</p>
        </div>
      </div>
    </div>
    </div>
  );
}