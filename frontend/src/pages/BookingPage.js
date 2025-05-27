import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useProfessionalDetails from '../hooks/useProfessionalDetails';
import useBooking from '../hooks/useBooking';
import { useAuth } from '../hooks/useAuth';

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service');
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { professional, availability, loading: loadingPro, error: errorPro } = useProfessionalDetails(id);
  const { createBooking, confirmBooking, loading: loadingBooking, error: errorBooking } = useBooking();
  const [step, setStep] = useState(1);
  
  // Form state
  const [selectedService, setSelectedService] = useState(initialServiceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isUrgent, setIsUrgent] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Set initial service if available from URL params
  useEffect(() => {
    if (initialServiceId) {
      setSelectedService(initialServiceId);
    }
  }, [initialServiceId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loadingPro) {
      navigate(`/login?redirect=/booking/${id}${initialServiceId ? `?service=${initialServiceId}` : ''}`);
    }
  }, [isAuthenticated, loadingPro, navigate, id, initialServiceId]);

  if (loadingPro) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errorPro || !professional) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{errorPro || 'Professional not found'}</p>
          <Link to="/search" className="font-medium text-red-800 hover:underline mt-2 inline-block">
            Return to search
          </Link>
        </div>
      </div>
    );
  }

  // While integrating with backend, use this as fallback data
  const pro = {
    id: professional.id || id,
    name: professional.name || 'John Smith',
    profession: professional.profession || 'Plumber',
    avatar: professional.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: professional.rating || 4.9,
    reviews: professional.reviews_count || 87,
    hourlyRate: professional.hourly_rate || 85,
    services: professional.services || [
      { id: 1, name: 'Leak Detection & Repair', price: 120 },
      { id: 2, name: 'Pipe Installation', price: 200 },
      { id: 3, name: 'Fixture Installation', price: 150 },
      { id: 4, name: 'Drain Cleaning', price: 100 }
    ],
    availableDates: availability || [
      { date: '2023-12-20', times: ['09:00', '11:00', '13:00', '15:00'] },
      { date: '2023-12-21', times: ['09:00', '11:00', '14:00', '16:00'] },
      { date: '2023-12-22', times: ['10:00', '12:00', '15:00'] }
    ]
  };

  // Get times for selected date
  const getAvailableTimes = () => {
    const dateObj = pro.availableDates.find(d => d.date === selectedDate);
    return dateObj ? dateObj.times : [];
  };

  // Get selected service details
  const getSelectedServiceDetails = () => {
    return pro.services.find(s => s.id === parseInt(selectedService));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        // Create booking data object
        const bookingData = {
          professional_id: pro.id,
          service_id: parseInt(selectedService),
          date: selectedDate,
          time: selectedTime,
          description,
          address,
          phone,
          is_urgent: isUrgent,
          price: getSelectedServiceDetails()?.price || 0
        };
        
        // Submit booking to API
        const appointmentId = await createBooking(bookingData);
        setBookingId(appointmentId);
        
        // Confirm booking
        await confirmBooking(appointmentId);
        setBookingComplete(true);
        
        // Navigate to confirmation page
        navigate('/booking-confirmation');
      } catch (err) {
        console.error('Booking error:', err);
        // Error is handled by the hook and will be displayed
      }
    }
  };
  
  // Function to go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Generate date options
  const getDateOptions = () => {
    return pro.availableDates.map(d => {
      const date = new Date(d.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      return { value: d.date, label: formattedDate };
    });
  };

  return (
    <>
      <Helmet>
        <title>Book {pro.name} - {pro.profession} | A-List Home Pros</title>
        <meta name="description" content={`Schedule an appointment with ${pro.name}, professional ${pro.profession}.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Link to={`/pros/${id}`} className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <h1 className="text-2xl font-bold">Book an Appointment with {pro.name}</h1>
              <p className="mt-2">Complete the form below to schedule your {pro.profession.toLowerCase()} service</p>
            </div>
            
            {/* Progress Steps */}
            <div className="px-6 pt-6">
              <div className="flex mb-8">
                <div className="flex-1">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    1
                  </div>
                  <p className="text-center mt-2 text-sm">Service Details</p>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200">
                    <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center relative z-10 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    2
                  </div>
                  <p className="text-center mt-2 text-sm">Date & Time</p>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200">
                    <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center relative z-10 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    3
                  </div>
                  <p className="text-center mt-2 text-sm">Your Info</p>
                </div>
              </div>
            </div>
            
            {/* Error message if any */}
            {errorBooking && (
              <div className="mx-6 my-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p>{errorBooking}</p>
              </div>
            )}
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Step 1: Service Details */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="service">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select 
                      id="service" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    >
                      <option value="">Select a service</option>
                      {pro.services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="description">
                      Describe your issue
                    </label>
                    <textarea 
                      id="description" 
                      rows="4" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide details about the service you need..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="urgent" 
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                      />
                      <label htmlFor="urgent" className="ml-2 block text-gray-700">
                        This is an urgent request (additional fees may apply)
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="date">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <select 
                      id="date" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }}
                      required
                    >
                      <option value="">Select a date</option>
                      {getDateOptions().map((date) => (
                        <option key={date.value} value={date.value}>
                          {date.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="time">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedDate ? (
                        getAvailableTimes().length > 0 ? (
                          getAvailableTimes().map((time) => (
                            <div key={time}>
                              <input 
                                type="radio" 
                                id={`time-${time}`} 
                                name="time" 
                                value={time}
                                className="sr-only"
                                checked={selectedTime === time}
                                onChange={() => setSelectedTime(time)}
                                required
                              />
                              <label 
                                htmlFor={`time-${time}`} 
                                className={`block text-center py-3 px-4 border ${selectedTime === time ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-blue-300'} rounded-md cursor-pointer transition duration-200`}
                              >
                                {time}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="col-span-4 text-gray-500">No available times for selected date</p>
                        )
                      ) : (
                        <p className="col-span-4 text-gray-500">Select a date to see available times</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Your Information */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="address">
                      Service Address <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      id="address" 
                      rows="3" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the complete address where the service will be performed"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(123) 456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">
                          {getSelectedServiceDetails()?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTime || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold">
                          ${getSelectedServiceDetails()?.price || 0}
                          {isUrgent && ' + Urgent Fee'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 ? (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300"
                    disabled={loadingBooking}
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                  disabled={loadingBooking}
                >
                  {loadingBooking ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Processing...
                    </>
                  ) : (
                    step === 3 ? 'Confirm Booking' : 'Continue'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage; 