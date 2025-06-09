import React, { useState, useEffect } from 'react';
import { FaSearch, FaHandshake, FaCreditCard, FaStar, FaArrowRight, FaCheck, FaPlay, FaUser, FaCog, FaShieldAlt } from 'react-icons/fa';

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      icon: <FaSearch className="text-4xl text-blue-600" />,
      title: "Search & Discover",
      description: "Browse through hundreds of verified home professionals in your area. Filter by service type, ratings, and availability.",
      features: [
        "Verified professionals",
        "Real-time availability",
        "Detailed profiles & reviews"
      ]
    },
    {
      id: 2,
      icon: <FaHandshake className="text-4xl text-green-600" />,
      title: "Book & Connect",
      description: "Schedule your service at a convenient time. Chat directly with your professional before they arrive.",
      features: [
        "Instant booking confirmation",
        "Direct messaging",
        "Flexible scheduling"
      ]
    },
    {
      id: 3,
      icon: <FaCreditCard className="text-4xl text-purple-600" />,
      title: "Pay Securely",
      description: "Your payment is held securely until the job is completed to your satisfaction. Multiple payment options available.",
      features: [
        "Escrow protection",
        "Multiple payment methods",
        "Satisfaction guarantee"
      ]
    },
    {
      id: 4,
      icon: <FaStar className="text-4xl text-yellow-600" />,
      title: "Review & Rate",
      description: "Share your experience and help other homeowners make informed decisions. Build trust in our community.",
      features: [
        "Honest feedback system",
        "Photo sharing",
        "Community building"
      ]
    }
  ];

  const benefits = [
    {
      icon: <FaShieldAlt className="text-3xl text-blue-600" />,
      title: "Verified Professionals",
      description: "All professionals are background-checked, licensed, and insured"
    },
    {
      icon: <FaCog className="text-3xl text-green-600" />,
      title: "Quality Guarantee",
      description: "100% satisfaction guaranteed or your money back"
    },
    {
      icon: <FaUser className="text-3xl text-purple-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for any questions or issues"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Customers" },
    { number: "5,000+", label: "Verified Pros" },
    { number: "100,000+", label: "Jobs Completed" },
    { number: "4.8/5", label: "Average Rating" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            How A-List Home Pros Works
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your trusted platform to find the best home professionals and book their services easily and securely
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center mx-auto">
            <FaPlay className="mr-2" />
            Watch Demo Video
          </button>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Just Four Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From finding the right professional to completing the job, we make the process easy and comfortable
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`relative p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                  activeStep === index 
                    ? 'bg-white shadow-2xl transform scale-105 border-2 border-blue-500' 
                    : 'bg-white shadow-lg hover:shadow-xl'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-4 bg-gray-50 rounded-full">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <FaCheck className="text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                {index < steps.length - 1 && (
                  <FaArrowRight className="hidden md:block absolute top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl -right-12" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              We guarantee you the best experience in home services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Our Achievements in Numbers
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-xl">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and get high-quality home services today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors duration-300">
              Find a Service
            </button>
            <button className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-700 transition-colors duration-300">
              Join as a Pro
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage; 