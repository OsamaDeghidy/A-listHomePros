import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCheck, FaUser, FaBriefcase, FaTools, FaMoneyBillWave, FaImage } from 'react-icons/fa';

const ProOnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    bio: '',
    
    // Professional Info
    businessName: '',
    yearsOfExperience: '',
    licenseNumber: '',
    insuranceInfo: '',
    
    // Services
    primaryCategory: '',
    services: [{ name: '', description: '', price: '' }],
    
    // Payment Info
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    paymentMethods: ['Credit Card', 'Cash'],
    
    // Photos & Portfolio
    profilePhoto: null,
    coverPhoto: null,
    portfolioImages: [],
  });

  const steps = [
    { id: 1, name: 'Personal Info', icon: <FaUser /> },
    { id: 2, name: 'Professional Info', icon: <FaBriefcase /> },
    { id: 3, name: 'Services', icon: <FaTools /> },
    { id: 4, name: 'Payment', icon: <FaMoneyBillWave /> },
    { id: 5, name: 'Photos & Portfolio', icon: <FaImage /> },
  ];

  const serviceCategories = [
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'carpentry', name: 'Carpentry' },
    { id: 'painting', name: 'Painting' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'hvac', name: 'HVAC' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'roofing', name: 'Roofing' },
    { id: 'flooring', name: 'Flooring' },
    { id: 'security', name: 'Home Security' },
    { id: 'moving', name: 'Moving Services' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'portfolioImages') {
      // Handle multiple files for portfolio
      setFormData({
        ...formData,
        [name]: [...formData.portfolioImages, ...files]
      });
    } else {
      // Handle single file uploads
      setFormData({
        ...formData,
        [name]: files[0]
      });
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      services: updatedServices
    });
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', description: '', price: '' }]
    });
  };

  const removeService = (index) => {
    const updatedServices = [...formData.services];
    updatedServices.splice(index, 1);
    
    setFormData({
      ...formData,
      services: updatedServices
    });
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, this would send the form data to the backend
      console.log('Submitting form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to professional dashboard upon successful submission
      navigate('/pro-dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle submission error
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <div>
      <h3 className="text-xl font-semibold mb-6">Tell us about yourself</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">Address *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">ZIP Code *</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">Bio *</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Tell potential clients about yourself, your experience, and why they should hire you."
          required
        ></textarea>
      </div>
    </div>
  );

  const renderProfessionalInfoStep = () => (
    <div>
      <h3 className="text-xl font-semibold mb-6">Professional Information</h3>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">Business Name (if applicable)</label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">Years of Experience *</label>
        <input
          type="number"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">License Number (if applicable)</label>
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">Insurance Information</label>
        <textarea
          name="insuranceInfo"
          value={formData.insuranceInfo}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Provide details about your insurance coverage (liability insurance, etc.)"
        ></textarea>
      </div>
    </div>
  );

  const renderServicesStep = () => (
    <div>
      <h3 className="text-xl font-semibold mb-6">Services You Offer</h3>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-1">Primary Service Category *</label>
        <select
          name="primaryCategory"
          value={formData.primaryCategory}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          {serviceCategories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Your Services</h4>
          <button
            type="button"
            onClick={addService}
            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition"
          >
            + Add Service
          </button>
        </div>
        
        {formData.services.map((service, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-start mb-3">
              <h5 className="font-medium">Service #{index + 1}</h5>
              {formData.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Service Name *</label>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Price ($) *</label>
                <input
                  type="text"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Description *</label>
              <textarea
                value={service.description}
                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                required
              ></textarea>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div>
      <h3 className="text-xl font-semibold mb-6">Payment Information</h3>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700">
          Your payment information is secure and encrypted. This information is required to receive payments from clients.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">Bank Name *</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Routing Number *</label>
          <input
            type="text"
            name="routingNumber"
            value={formData.routingNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Payment Methods You Accept</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.includes('Credit Card')}
              onChange={(e) => {
                const updatedMethods = e.target.checked 
                  ? [...formData.paymentMethods, 'Credit Card'] 
                  : formData.paymentMethods.filter(method => method !== 'Credit Card');
                setFormData({...formData, paymentMethods: updatedMethods});
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Credit Card</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.includes('Cash')}
              onChange={(e) => {
                const updatedMethods = e.target.checked 
                  ? [...formData.paymentMethods, 'Cash'] 
                  : formData.paymentMethods.filter(method => method !== 'Cash');
                setFormData({...formData, paymentMethods: updatedMethods});
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Cash</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.includes('Check')}
              onChange={(e) => {
                const updatedMethods = e.target.checked 
                  ? [...formData.paymentMethods, 'Check'] 
                  : formData.paymentMethods.filter(method => method !== 'Check');
                setFormData({...formData, paymentMethods: updatedMethods});
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Check</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.includes('Bank Transfer')}
              onChange={(e) => {
                const updatedMethods = e.target.checked 
                  ? [...formData.paymentMethods, 'Bank Transfer'] 
                  : formData.paymentMethods.filter(method => method !== 'Bank Transfer');
                setFormData({...formData, paymentMethods: updatedMethods});
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Bank Transfer</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPhotosStep = () => (
    <div>
      <h3 className="text-xl font-semibold mb-6">Photos & Portfolio</h3>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">Profile Photo *</label>
        <div className="flex items-center">
          {formData.profilePhoto ? (
            <div className="relative mr-4">
              <img 
                src={URL.createObjectURL(formData.profilePhoto)} 
                alt="Profile preview" 
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData({...formData, profilePhoto: null})}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mr-4 text-gray-400">
              <FaUser size={24} />
            </div>
          )}
          
          <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md cursor-pointer transition">
            Upload Photo
            <input
              type="file"
              name="profilePhoto"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">Cover Photo</label>
        <div className="flex items-center">
          {formData.coverPhoto ? (
            <div className="relative mr-4">
              <img 
                src={URL.createObjectURL(formData.coverPhoto)} 
                alt="Cover preview" 
                className="w-32 h-24 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData({...formData, coverPhoto: null})}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mr-4 text-gray-400">
              <FaImage size={24} />
            </div>
          )}
          
          <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md cursor-pointer transition">
            Upload Cover
            <input
              type="file"
              name="coverPhoto"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Portfolio Images <span className="text-gray-500">(up to 6 images of your work)</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {formData.portfolioImages.slice(0, 6).map((image, index) => (
            <div key={index} className="relative">
              <img 
                src={URL.createObjectURL(image)} 
                alt={`Portfolio ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedImages = [...formData.portfolioImages];
                  updatedImages.splice(index, 1);
                  setFormData({...formData, portfolioImages: updatedImages});
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
          
          {formData.portfolioImages.length < 6 && (
            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
              <FaImage className="text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-500">Add Image</span>
              <input
                type="file"
                name="portfolioImages"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple={formData.portfolioImages.length < 5}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderProfessionalInfoStep();
      case 3:
        return renderServicesStep();
      case 4:
        return renderPaymentStep();
      case 5:
        return renderPhotosStep();
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Professional Onboarding | A-List Home Pros</title>
        <meta name="description" content="Complete your professional profile and start receiving job requests from homeowners in your area." />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Professional Profile</h1>
              <p className="text-gray-600 mt-2">
                Fill out the information below to start receiving job requests from homeowners in your area
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep > step.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : currentStep === step.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > step.id ? <FaCheck /> : step.icon}
                    </div>
                    <span className="text-xs mt-1 text-center hidden sm:block">{step.name}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8">
              {renderCurrentStep()}
              
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                ) : (
                  <div></div> // Empty div to maintain the spacing
                )}
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition flex items-center"
                    disabled={loading}
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Submit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProOnboardingPage; 