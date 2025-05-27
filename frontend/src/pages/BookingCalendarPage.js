import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, 
  isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { 
  FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, 
  FaUserAlt, FaEllipsisH, FaSpinner, FaExclamationCircle, FaFilter, 
  FaSearch, FaTimesCircle, FaRegCalendarCheck, FaRegCalendarTimes, FaRegEdit 
} from 'react-icons/fa';

const BookingCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('month'); // 'month', 'week', 'day'
  const [activeFilters, setActiveFilters] = useState({
    status: 'all', // 'all', 'upcoming', 'completed', 'canceled'
    serviceType: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilters, searchQuery]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would fetch from your API
      // For now, we'll use mock data
      const mockData = generateMockAppointments();
      
      setTimeout(() => {
        setAppointments(mockData);
        setFilteredAppointments(mockData);
        setIsLoading(false);
      }, 800);
    } catch (err) {
      setError("Failed to load appointments. Please try again later.");
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(appt => appt.status === activeFilters.status);
    }

    // Filter by service type
    if (activeFilters.serviceType !== 'all') {
      filtered = filtered.filter(appt => appt.serviceType === activeFilters.serviceType);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appt => 
        appt.proName.toLowerCase().includes(query) ||
        appt.serviceName.toLowerCase().includes(query) ||
        appt.location.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      serviceType: 'all'
    });
    setSearchQuery('');
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onDateClick = (day) => {
    setCurrentDate(day);
    // If on month view, switch to day view when clicking a date
    if (selectedView === 'month') {
      setSelectedView('day');
    }
  };

  const getDayAppointments = (day) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(parseISO(appointment.date), day)
    );
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Previous month"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold mx-4">
            {format(currentDate, dateFormat)}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Next month"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedView('month')}
            className={`px-3 py-1.5 rounded-md ${
              selectedView === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedView('week')}
            className={`px-3 py-1.5 rounded-md ${
              selectedView === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedView('day')}
            className={`px-3 py-1.5 rounded-md ${
              selectedView === 'day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div className="text-center text-sm font-medium text-gray-500 py-2" key={i}>
          {format(day, dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const dayAppointments = getDayAppointments(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div
            key={day.toString()}
            className={`h-32 p-1 border border-gray-200 overflow-hidden ${
              !isCurrentMonth ? "bg-gray-50" : ""
            } ${
              isSameDay(day, new Date()) ? "bg-blue-50" : ""
            }`}
            onClick={() => onDateClick(day)}
          >
            <div className={`text-right ${
              isCurrentMonth ? "text-gray-700" : "text-gray-400"
            } ${
              isSameDay(day, new Date()) ? "font-bold" : ""
            }`}>
              {formattedDate}
            </div>
            <div className="overflow-y-auto h-24 mt-1">
              {dayAppointments.map((appointment, idx) => (
                <div 
                  key={idx}
                  className={`
                    p-1 mb-1 text-xs rounded truncate cursor-pointer
                    ${appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAppointment(appointment);
                  }}
                >
                  {format(parseISO(appointment.time), 'h:mm a')} - {appointment.serviceName}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderDayView = () => {
    const dayAppointments = getDayAppointments(currentDate);
    return (
      <div className="border rounded-lg shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
        <div className="divide-y">
          {dayAppointments.length > 0 ? (
            dayAppointments.map((appointment, idx) => (
              <AppointmentItem 
                key={idx} 
                appointment={appointment} 
                onSelect={() => setSelectedAppointment(appointment)}
              />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No appointments scheduled for this day
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayAppointments = getDayAppointments(day);
      
      weekDays.push(
        <div key={i} className="border-r last:border-r-0">
          <div className={`p-2 text-center border-b ${
            isSameDay(day, new Date()) ? "bg-blue-50 font-medium" : "bg-gray-50"
          }`}>
            <div className="text-sm text-gray-500">{format(day, "EEE")}</div>
            <div className="text-md">{format(day, "d")}</div>
          </div>
          <div className="divide-y">
            {dayAppointments.length > 0 ? (
              dayAppointments.map((appointment, idx) => (
                <div 
                  key={idx}
                  className="p-2 text-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="font-medium">{format(parseISO(appointment.time), 'h:mm a')}</div>
                  <div className="truncate">{appointment.serviceName}</div>
                  <div className="text-gray-500 truncate">{appointment.proName}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No appointments</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="border rounded-lg shadow-sm grid grid-cols-7">
        {weekDays}
      </div>
    );
  };

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-gray-900">
                Appointment Details
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedAppointment(null)}
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Service</h4>
                  <p className="mt-1 text-base font-medium">{selectedAppointment.serviceName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUserAlt className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Professional</h4>
                  <p className="mt-1 text-base font-medium">{selectedAppointment.proName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaClock className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                  <p className="mt-1 text-base font-medium">
                    {format(parseISO(selectedAppointment.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-base font-medium">
                    {format(parseISO(selectedAppointment.time), "h:mm a")} - 
                    {format(parseISO(selectedAppointment.endTime), "h:mm a")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="mt-1 text-base font-medium">{selectedAppointment.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaRegCalendarCheck className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span className={`
                    mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedAppointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                      selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            {selectedAppointment.status === 'upcoming' && (
              <div className="mt-8 flex space-x-4">
                <button
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                  onClick={() => setShowRescheduleModal(true)}
                >
                  <FaRegEdit className="mr-2" />
                  Reschedule
                </button>
                <button
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  <FaRegCalendarTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRescheduleModal = () => {
    if (!showRescheduleModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-gray-900">
                Reschedule Appointment
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowRescheduleModal(false)}
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700">
                  New Date
                </label>
                <input
                  type="date"
                  id="reschedule-date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={rescheduleDate || ''}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="reschedule-time" className="block text-sm font-medium text-gray-700">
                  New Time
                </label>
                <input
                  type="time"
                  id="reschedule-time"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={rescheduleTime || ''}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // In a real app, you would send the reschedule request to your API
                  alert('Appointment rescheduled successfully!');
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                }}
                disabled={!rescheduleDate || !rescheduleTime}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCancelModal = () => {
    if (!showCancelModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold text-gray-900">
                Cancel Appointment
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCancelModal(false)}
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              
              <div className="mt-4">
                <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  id="cancel-reason"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </button>
              <button
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                onClick={() => {
                  // In a real app, you would send the cancellation request to your API
                  alert('Appointment cancelled successfully!');
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AppointmentItem = ({ appointment, onSelect }) => {
    return (
      <div 
        className="p-4 hover:bg-gray-50 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`
                w-3 h-3 rounded-full mr-2
                ${appointment.status === 'upcoming' ? 'bg-blue-500' : 
                  appointment.status === 'completed' ? 'bg-green-500' : 
                  'bg-gray-500'}
              `}></div>
              <h4 className="text-lg font-medium">{appointment.serviceName}</h4>
            </div>
            <div className="mt-1 text-sm text-gray-500">with {appointment.proName}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {format(parseISO(appointment.time), 'h:mm a')} - 
              {format(parseISO(appointment.endTime), 'h:mm a')}
            </div>
            <div className="text-sm text-gray-500">
              {appointment.duration} minutes
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generate mock data for demonstration
  const generateMockAppointments = () => {
    const today = new Date();
    const mockData = [];
    const statuses = ['upcoming', 'completed', 'canceled'];
    const serviceTypes = ['Cleaning', 'Plumbing', 'Electrical', 'HVAC', 'Landscaping'];
    const professionals = [
      'John Smith', 'Sarah Johnson', 'Mike Williams', 'Emma Davis', 
      'Robert Jones', 'Jennifer Brown', 'David Miller', 'Lisa Garcia'
    ];
    const locations = [
      '123 Main St, New York, NY', '456 Oak Ave, Los Angeles, CA',
      '789 Pine Rd, Chicago, IL', '321 Elm St, Houston, TX',
      '654 Maple Dr, Phoenix, AZ'
    ];
    
    // Generate appointments for current month +/- 15 days
    const startDate = subMonths(today, 1);
    const endDate = addMonths(today, 1);
    
    for (let i = 0; i < 30; i++) {
      // Random date between startDate and endDate
      const date = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );
      
      // Random time between 8am and 6pm
      const hours = Math.floor(Math.random() * 10) + 8;
      const minutes = Math.random() > 0.5 ? 0 : 30;
      date.setHours(hours, minutes, 0, 0);
      
      const serviceName = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const proName = professionals[Math.floor(Math.random() * professionals.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
      
      // For past dates, status should be completed or canceled
      // For future dates, status should be upcoming
      let status;
      if (date < today) {
        status = Math.random() > 0.2 ? 'completed' : 'canceled';
      } else {
        status = 'upcoming';
      }
      
      const appointment = {
        id: `appt-${i + 1}`,
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endTime: format(new Date(date.getTime() + duration * 60000), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        duration,
        serviceName: `${serviceName} Service`,
        serviceType: serviceName,
        proName,
        location,
        status
      };
      
      mockData.push(appointment);
    }
    
    return mockData;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Booking Calendar | A-List Home Pros</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Calendar</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            aria-label="Filter appointments"
          >
            <FaFilter className="text-gray-600" />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isFilterVisible && (
        <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Filter Appointments</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={activeFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={activeFilters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="Landscaping">Landscaping</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <FaExclamationCircle className="text-red-600 text-4xl mb-4" />
          <p className="text-gray-800 font-medium mb-2">Error Loading Appointments</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAppointments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm">
          {renderHeader()}
          
          {selectedView === 'month' && (
            <>
              {renderDays()}
              {renderCells()}
            </>
          )}
          
          {selectedView === 'week' && renderWeekView()}
          
          {selectedView === 'day' && renderDayView()}
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {renderAppointmentDetails()}
      
      {/* Reschedule Modal */}
      {renderRescheduleModal()}
      
      {/* Cancel Modal */}
      {renderCancelModal()}
    </div>
  );
};

export default BookingCalendarPage; 