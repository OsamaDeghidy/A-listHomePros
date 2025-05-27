import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ContactPage = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'homeowner' // Default value
  });
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // State for form validation
  const [errors, setErrors] = useState({});
  
  // State for FAQ accordion
  const [openQuestionId, setOpenQuestionId] = useState(1);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Check name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Check email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Check subject
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    // Check message
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        userType: 'homeowner'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };
  
  // Toggle FAQ accordion
  const toggleQuestion = (questionId) => {
    setOpenQuestionId(openQuestionId === questionId ? null : questionId);
  };
  
  // Frequently asked questions
  const faqs = [
    {
      id: 1,
      question: 'How do I book a professional through your platform?',
      answer: 'Booking a professional is simple. Just search for the service you need, browse through available pros, select one based on their profile and reviews, choose a convenient time slot, and confirm your booking. You\'ll receive immediate confirmation and can manage all your appointments through your dashboard.'
    },
    {
      id: 2,
      question: 'Are the professionals on your platform vetted?',
      answer: 'Yes, all professionals on our platform undergo a thorough vetting process. This includes background checks, verification of licenses and certifications, and review of previous work. We also continuously monitor reviews and ratings to ensure ongoing quality.'
    },
    {
      id: 3,
      question: 'What if I\'m not satisfied with the service?',
      answer: 'Your satisfaction is our priority. If you\'re not completely satisfied with the service provided, please contact our customer support team within 48 hours of service completion. We offer a satisfaction guarantee and will work with you to make things right.'
    },
    {
      id: 4,
      question: 'How can I become a service provider on your platform?',
      answer: 'To become a service provider, click on "Become a Pro" in the navigation menu and complete the registration process. You\'ll need to provide details about your services, experience, licenses, and complete our verification process. Our team will review your application and get back to you within 3-5 business days.'
    },
    {
      id: 5,
      question: 'What areas do you currently serve?',
      answer: 'We currently operate in over 50 major cities across the United States. You can check if we serve your area by entering your zip code in the search bar on our homepage.'
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>Contact Us | A-List Home Pros</title>
        <meta name="description" content="Get in touch with the A-List Home Pros team. We're here to answer your questions and provide support." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-blue-100">
              We're here to help. Reach out with any questions or feedback.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Phone */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <FaPhoneAlt className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">Mon-Fri, 9am-6pm ET</p>
              <a href="tel:+15551234567" className="text-blue-600 font-medium text-lg">
                (555) 123-4567
              </a>
            </div>
            
            {/* Email */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <FaEnvelope className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">We'll respond within 24 hours</p>
              <a href="mailto:support@alisthomepros.com" className="text-blue-600 font-medium">
                support@alisthomepros.com
              </a>
            </div>
            
            {/* Office */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <FaMapMarkerAlt className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">Headquarters</p>
              <p className="text-blue-600 font-medium">
                123 Main Street, Suite 500<br />
                Boston, MA 02108
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-gray-600">
                Fill out the form below and our team will get back to you as soon as possible.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 mb-6">
                  <p className="font-medium">Thank you for your message!</p>
                  <p>We've received your inquiry and will respond shortly.</p>
                </div>
              ) : null}
              
              {submitError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6">
                  <p className="font-medium">Error submitting form</p>
                  <p>{submitError}</p>
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit}>
                {/* User Type */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">I am a:</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="userType" 
                        value="homeowner" 
                        checked={formData.userType === 'homeowner'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Homeowner
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="userType" 
                        value="professional" 
                        checked={formData.userType === 'professional'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Service Professional
                    </label>
                  </div>
                </div>
                
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name*</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
                
                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject*</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="What is your message about?"
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                  </div>
                </div>
                
                {/* Message */}
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message*</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="How can we help you?"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Find answers to common questions about our platform and services.
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    className="flex justify-between items-center w-full p-4 text-left font-medium focus:outline-none"
                    onClick={() => toggleQuestion(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <span>
                      {openQuestionId === faq.id ? (
                        <FaChevronUp className="text-blue-600" />
                      ) : (
                        <FaChevronDown className="text-gray-600" />
                      )}
                    </span>
                  </button>
                  {openQuestionId === faq.id && (
                    <div className="p-4 pt-0 text-gray-700 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <p className="text-gray-700 mb-4">
                Still have questions? We're here to help.
              </p>
              <a 
                href="mailto:support@alisthomepros.com" 
                className="text-blue-600 font-medium hover:underline"
              >
                Contact our support team
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage; 