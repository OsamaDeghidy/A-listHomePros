import React from 'react';
import { Helmet } from 'react-helmet';
import { FaCheckCircle, FaUsers, FaShieldAlt, FaStar } from 'react-icons/fa';

const AboutPage = () => {
  // Core values of the company
  const coreValues = [
    {
      id: 1,
      title: 'Quality Service',
      description: 'We connect you with top-rated professionals who are vetted, background-checked, and committed to excellence.',
      icon: <FaStar className="w-10 h-10 text-blue-600" />
    },
    {
      id: 2,
      title: 'Trust & Safety',
      description: 'Your safety is our priority. All our professionals undergo thorough background checks and are continuously monitored for quality.',
      icon: <FaShieldAlt className="w-10 h-10 text-blue-600" />
    },
    {
      id: 3,
      title: 'Customer Satisfaction',
      description: 'We\'re committed to ensuring complete customer satisfaction with every service, backed by our service guarantee.',
      icon: <FaCheckCircle className="w-10 h-10 text-blue-600" />
    },
    {
      id: 4,
      title: 'Community Impact',
      description: 'We empower local professionals to grow their businesses while helping homeowners maintain their most valuable assets.',
      icon: <FaUsers className="w-10 h-10 text-blue-600" />
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | A-List Home Pros</title>
        <meta name="description" content="Learn about A-List Home Pros - our mission, values, and the team behind the platform connecting homeowners with top-quality service professionals." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About A-List Home Pros</h1>
            <p className="text-xl text-blue-100">
              Connecting homeowners with trusted professionals since 2020
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600">
              At A-List Home Pros, we're on a mission to transform how homeowners find, book, and manage home services. We believe that maintaining your home should be simple, transparent, and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">For Homeowners</h3>
              <p className="text-gray-700">
                We provide access to a network of vetted, reliable professionals who can handle all your home maintenance and improvement needs. With transparent pricing, secure booking, and guaranteed quality, we take the stress out of home services.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">For Professionals</h3>
              <p className="text-gray-700">
                We offer a platform for skilled professionals to connect with clients, grow their business, and showcase their expertise. We handle marketing, booking, and customer support so you can focus on what you do best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">
              These principles guide everything we do as we work to create the best platform for home services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {coreValues.map((value) => (
              <div key={value.id} className="bg-white p-6 rounded-lg shadow-md flex">
                <div className="flex-shrink-0 mr-4">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            </div>
            
            <div className="prose prose-lg mx-auto">
              <p>
                A-List Home Pros was founded in 2020 when our CEO, after struggling to find reliable contractors for home renovations, recognized the need for a better solution. What started as a small directory of trusted local professionals has grown into a comprehensive platform serving homeowners nationwide.
              </p>
              <p>
                Our team combines expertise in technology, customer service, and the home services industry to create a platform that truly understands the needs of both homeowners and service providers. We've helped thousands of homeowners complete projects with confidence, and enabled hundreds of quality professionals to grow their businesses.
              </p>
              <p>
                Today, we continue to innovate and improve our platform based on feedback from our community of users and professionals, always staying true to our mission of making home services simple and reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-lg text-gray-600">
              Meet the dedicated team behind A-List Home Pros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Team members */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Michael Anderson" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Michael Anderson</h3>
                <p className="text-blue-600 mb-3">Founder & CEO</p>
                <p className="text-gray-600">Former contractor with 15+ years experience in home services, passionate about improving the industry for everyone.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Sarah Johnson" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Sarah Johnson</h3>
                <p className="text-blue-600 mb-3">Chief Operations Officer</p>
                <p className="text-gray-600">Tech industry veteran focused on creating seamless experiences for both homeowners and service providers.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="David Williams" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">David Williams</h3>
                <p className="text-blue-600 mb-3">CTO</p>
                <p className="text-gray-600">Software engineer and product designer with a focus on creating intuitive, reliable technology solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join the A-List Home Pros Community</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Whether you're a homeowner looking for quality services or a professional looking to grow your business, we'd love to have you join our community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/search" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium transition duration-300">
              Find a Professional
            </a>
            <a href="/register" className="bg-blue-800 text-white hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition duration-300">
              Become a Pro
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage; 