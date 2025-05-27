import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const BookingConfirmationPage = () => {
  // In a real application, this data would come from the booking API or state management
  // This is mock data for demonstration
  const bookingDetails = {
    bookingId: "BK" + Math.floor(100000 + Math.random() * 900000),
    service: "Pipe Repair",
    professional: {
      id: "1",
      name: "John Smith",
      profession: "Plumber",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    date: new Date().toISOString().split('T')[0], // Today's date
    time: "10:00 AM",
    location: "123 Main Street, Anytown, USA",
    price: 55.00
  };

  return (
    <>
      <Helmet>
        <title>Booking Confirmation | Service Platform</title>
        <meta name="description" content="Your service booking has been confirmed." />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-600 p-6 text-white text-center">
              <FaCheckCircle className="mx-auto text-5xl mb-4" />
              <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
              <p className="mt-2">Your appointment has been successfully scheduled</p>
            </div>
            
            {/* Booking Details */}
            <div className="p-6">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
                <p className="text-gray-500 mb-2">Booking ID: <span className="text-gray-700 font-medium">{bookingDetails.bookingId}</span></p>
                
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <div className="flex items-start mb-4">
                    <FaUser className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Professional</p>
                      <div className="flex items-center mt-1">
                        <img 
                          src={bookingDetails.professional.avatar} 
                          alt={bookingDetails.professional.name}
                          className="w-10 h-10 rounded-full mr-2"
                        />
                        <div>
                          <p className="font-medium">{bookingDetails.professional.name}</p>
                          <p className="text-sm text-gray-600">{bookingDetails.professional.profession}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <FaCalendarAlt className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p>
                        {new Date(bookingDetails.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <FaClock className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p>{bookingDetails.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <FaMapMarkerAlt className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p>{bookingDetails.location}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Service</p>
                      <p>{bookingDetails.service}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-medium">Total Price</p>
                      <p className="text-lg font-bold">${bookingDetails.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You'll receive a confirmation email with booking details shortly.</li>
                  <li>The professional will contact you before the appointment to confirm.</li>
                  <li>You can reschedule or cancel this booking up to 24 hours before the scheduled time.</li>
                  <li>Payment will be collected after the service is completed.</li>
                </ul>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link 
                  to="/user-dashboard/bookings" 
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View My Bookings
                </Link>
                <Link 
                  to="/" 
                  className="flex-1 bg-gray-200 text-gray-800 text-center py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
              
              {/* Contact Support */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  Need help with your booking? <Link to="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmationPage; 