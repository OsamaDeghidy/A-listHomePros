import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Search for a Service",
      description: "Browse through our wide range of home services or use the search feature to find exactly what you need.",
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Compare Professionals",
      description: "Review profiles, ratings, reviews, and pricing of qualified professionals to make the best choice.",
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Book an Appointment",
      description: "Schedule a convenient time for the service, pay securely, and get confirmation instantly.",
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Get the Job Done",
      description: "The professional arrives at your home, performs the service, and ensures your complete satisfaction.",
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            How It <span className="text-blue-600">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We make finding and booking qualified home service professionals simple and hassle-free with our streamlined process
          </p>
        </div>

        {/* Steps for desktop and tablet */}
        <div className="hidden md:block mb-16">
          <div className="relative">
            {/* Enhanced progress line with gradient */}
            <div className="absolute left-0 right-0 top-32 h-2 bg-gray-200 rounded-full">
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full shadow-lg"></div>
            </div>

            {/* Steps with enhanced styling */}
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={step.id} className="text-center group">
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-blue-600 mb-4 relative z-10 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.id}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps for mobile with enhanced styling */}
        <div className="md:hidden mb-12">
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0 relative mr-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {step.id}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="flex -space-x-2">
                <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-white"></div>
                <div className="w-12 h-12 bg-green-500 rounded-full border-4 border-white"></div>
                <div className="w-12 h-12 bg-purple-500 rounded-full border-4 border-white"></div>
                <div className="w-12 h-12 bg-yellow-500 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-sm">
                  +5K
                </div>
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Join 5,000+ Satisfied Homeowners
            </h3>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover why thousands of homeowners trust us to connect them with reliable, vetted professionals for all their home service needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/search" 
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find a Professional
              </Link>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;