import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';

const CtaSection = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Are You a Home Service Professional?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Join our network of trusted professionals and grow your business. Get connected with customers looking for your services and manage your bookings all in one place.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Expand Your Customer Base</h3>
                  <p className="text-gray-400 text-sm">Reach more customers in your area looking for your specific skills</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Zero Upfront Costs</h3>
                  <p className="text-gray-400 text-sm">No subscription fees - pay only for leads you receive</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Simple Booking Management</h3>
                  <p className="text-gray-400 text-sm">Manage your schedule, appointments and client communications</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Build Your Reputation</h3>
                  <p className="text-gray-400 text-sm">Collect reviews and showcase your quality work</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/pro-signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-300 text-center"
              >
                {isArabic ? 'انضم كمحترف' : 'Join as a Pro'}
              </Link>
              <Link 
                to="/pricing" 
                className="bg-transparent border border-gray-300 hover:border-gray-100 text-white font-medium py-3 px-6 rounded-md transition duration-300 text-center"
              >
                {isArabic ? 'عرض باقات الأسعار' : 'View Pricing Plans'}
              </Link>
            </div>
          </div>
          
          <div className="lg:w-2/5">
            <div className="bg-gray-800 rounded-lg p-8 relative">
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
                <div className="bg-blue-600 text-white text-xs py-1 px-3 rounded-full">
                  Professional Benefits
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-6">Professionals Who Join Get:</h3>
              
              <ul className="space-y-4">
                <li className="flex">
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Verified Pro Badge on your profile</span>
                </li>
                <li className="flex">
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority placement in search results</span>
                </li>
                <li className="flex">
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Direct messaging with potential clients</span>
                </li>
                <li className="flex">
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Online payment processing</span>
                </li>
                <li className="flex">
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Calendar integration for booking</span>
                </li>
              </ul>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/men/34.jpg" 
                    alt="Professional" 
                    className="w-12 h-12 rounded-full mr-4" 
                  />
                  <div>
                    <p className="italic text-gray-300 text-sm">"Since joining, my business has grown by 40%. The platform makes it easy to connect with new clients and manage my schedule."</p>
                    <p className="mt-2 font-medium">- Robert Wilson, Electrician</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection; 