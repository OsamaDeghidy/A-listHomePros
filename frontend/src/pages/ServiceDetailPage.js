import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import useServiceDetails from '../hooks/useServiceDetails';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { service, professionals, loading, error } = useServiceDetails(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error || 'Service not found'}</p>
          <Link to="/services" className="font-medium text-red-800 hover:underline mt-2 inline-block">
            View all services
          </Link>
        </div>
      </div>
    );
  }

  // While waiting for real data, use mock data for UI demonstration
  const mockDetails = {
    id: id,
    name: service.name || "Plumbing",
    description: service.description || "Professional plumbing services for all your home needs. Our plumbers can handle everything from simple repairs to complex installations.",
    icon: service.icon || "🔧",
    color: service.color || "bg-blue-100",
    textColor: service.textColor || "text-blue-700",
    benefits: service.benefits || [
      "Fast response times for emergencies",
      "Upfront pricing with no hidden fees",
      "Licensed and insured professionals",
      "Satisfaction guaranteed on all work",
      "Clean and respectful of your home"
    ],
    faqs: service.faqs || [
      {
        question: "How quickly can a plumber arrive?",
        answer: "For emergencies, we can typically have a plumber at your home within 1-2 hours. For non-emergency services, we can usually schedule an appointment within 24-48 hours."
      },
      {
        question: "Do you offer warranties on your work?",
        answer: "Yes, all of our work comes with a minimum 90-day warranty on labor, and many parts carry manufacturer warranties of 1 year or more."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, cash, and checks. Payment is typically collected after the service is completed to your satisfaction."
      },
      {
        question: "Are your plumbers licensed and insured?",
        answer: "Yes, all our plumbers are fully licensed, bonded, and insured for your protection and peace of mind."
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{service.name} Services | A-List Home Pros</title>
        <meta name="description" content={`Book trusted ${service.name.toLowerCase()} professionals for your home needs. Qualified experts, upfront pricing, satisfaction guaranteed.`} />
      </Helmet>

      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center space-x-4">
            <span className="text-5xl bg-white rounded-full p-4 shadow-lg">{mockDetails.icon}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{service.name} Services</h1>
              <p className="mt-2 text-lg text-blue-100">Professional {service.name.toLowerCase()} services for your home</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'professionals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('professionals')}
              >
                Professionals ({professionals.length})
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'faqs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('faqs')}
              >
                FAQs
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">About {service.name} Services</h2>
                <p className="text-gray-700 mb-6">{mockDetails.description}</p>
                
                <h3 className="text-xl font-semibold mb-3">Benefits of Our {service.name} Service</h3>
                <ul className="space-y-2 mb-6">
                  {mockDetails.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Looking for {service.name} Help?</h3>
                  <p className="text-gray-700 mb-4">Our verified professionals are ready to assist you with your {service.name.toLowerCase()} needs.</p>
                  <Link 
                    to="/search" 
                    className="inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Find a {service.name} Pro
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'professionals' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Top {service.name} Professionals</h2>
                <p className="text-gray-700 mb-6">Browse and connect with our highly-rated {service.name.toLowerCase()} professionals.</p>
                
                {professionals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map((pro) => (
                      <div key={pro.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-300">
                        <div className="p-4">
                          <div className="flex items-center mb-4">
                            <img 
                              src={pro.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} 
                              alt={pro.name} 
                              className="w-16 h-16 rounded-full object-cover mr-4"
                            />
                            <div>
                              <h3 className="font-bold text-lg">{pro.name}</h3>
                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{pro.rating || 4.9} ({pro.reviews_count || 87} reviews)</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-2">{pro.bio || `Experienced ${service.name.toLowerCase()} professional with over 10 years of expertise in residential and commercial services.`}</p>
                          <div className="flex space-x-2">
                            <Link 
                              to={`/pros/${pro.id}`}
                              className="flex-1 bg-gray-100 text-gray-800 text-center py-2 rounded-md hover:bg-gray-200 transition duration-300 text-sm"
                            >
                              View Profile
                            </Link>
                            <Link 
                              to={`/booking/${pro.id}`}
                              className="flex-1 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No professionals available for this service at the moment.</p>
                    <Link 
                      to="/search" 
                      className="inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      Browse Other Services
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faqs' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-700 mb-6">Common questions about our {service.name.toLowerCase()} services.</p>
                
                <div className="space-y-4">
                  {mockDetails.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Have more questions?</h3>
                  <p className="text-gray-700 mb-4">Our customer support team is here to help.</p>
                  <a 
                    href="#contact"
                    className="inline-block bg-gray-800 text-white font-medium px-4 py-2 rounded-md hover:bg-gray-900 transition duration-300"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Related Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Electrical", "Carpentry", "Painting", "Cleaning"].map((relatedService) => (
              <Link 
                key={relatedService}
                to={`/services/${relatedService.toLowerCase()}`}
                className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition duration-300 text-center"
              >
                {relatedService}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetailPage; 