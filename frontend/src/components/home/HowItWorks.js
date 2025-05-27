import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Search for a Service",
      description: "Browse through our wide range of home services or use the search feature to find exactly what you need.",
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Compare Professionals",
      description: "Review profiles, ratings, reviews, and pricing of qualified professionals to make the best choice.",
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Book an Appointment",
      description: "Schedule a convenient time for the service, pay securely, and get confirmation instantly.",
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Get the Job Done",
      description: "The professional arrives at your home, performs the service, and ensures your complete satisfaction.",
      icon: (
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We make finding and booking qualified home service professionals simple and hassle-free
          </p>
        </div>

        {/* Steps for desktop and tablet */}
        <div className="hidden md:block mb-12">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-24 h-1 bg-gray-200">
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-blue-600 mb-4 relative z-10">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps for mobile */}
        <div className="md:hidden">
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mr-4">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
            Join thousands of satisfied homeowners who have found reliable professionals for their home service needs.
          </p>
          <Link 
            to="/services" 
            className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Find a Professional
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 