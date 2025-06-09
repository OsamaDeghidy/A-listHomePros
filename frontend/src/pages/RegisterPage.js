import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { register } from '../services/auth';

const RegisterPage = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    password2: '',
    role: 'client', // Default role is client
    agree_terms: false,
    // Additional fields for professionals
    profession: '',
    years_experience: '',
    services_provided: '',
    about: ''
  });
  
  const [formError, setFormError] = useState('');
  const [formStep, setFormStep] = useState(1); // 1: Basic information, 2: Professional information (if applicable)
  const { register: authRegister, error, loading, authState } = useAuth();
  const navigate = useNavigate();
  
  // Animation variables
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const validateForm = () => {
    // Validate basic information (Step 1)
    if (formStep === 1) {
      if (!formData.name.trim()) {
        setFormError(language === 'ar' ? 'الاسم مطلوب' : 'Name is required');
        return false;
      }
      
      if (!formData.email.trim()) {
        setFormError(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
        return false;
      }
      
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setFormError(language === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح' : 'Please enter a valid email address');
        return false;
      }
      
      if (!formData.phone_number.trim()) {
        setFormError(language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required');
        return false;
      }
      
      if (!formData.password) {
        setFormError(language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required');
        return false;
      }
      
      if (formData.password.length < 8) {
        setFormError(language === 'ar' ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
        return false;
      }
      
      if (formData.password !== formData.password2) {
        setFormError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return false;
      }
      
      if (!formData.agree_terms) {
        setFormError(language === 'ar' ? 'يجب عليك الموافقة على الشروط والأحكام' : 'You must agree to the terms and conditions');
        return false;
      }
      
      // If the user is a professional, go to step 2
      if (formData.role === 'contractor' || formData.role === 'specialist' || formData.role === 'crew') {
        setFormStep(2);
        return false;
      }
      
      return true;
    }
    
    // Validate professional information (Step 2)
    if (formStep === 2) {
      if (!formData.profession.trim()) {
        setFormError(language === 'ar' ? 'المهنة مطلوبة' : 'Profession is required');
        return false;
      }
      
      if (!formData.services_provided.trim()) {
        setFormError(language === 'ar' ? 'الخدمات المقدمة مطلوبة' : 'Services provided are required');
        return false;
      }
      
      return true;
    }
    
    return false;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Include password2 in the registration data
      const { agree_terms, ...registrationData } = formData;
      
      // Register user
      const response = await register(registrationData);
      
      // Handle successful registration
      navigate('/verify-email', {
        state: { 
          email: formData.email,
          userId: response.user_id 
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(error.detail || (language === 'ar' ? 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.' : 'An error occurred during registration. Please try again.'));
    }
  };
  
  const handlePrevStep = () => {
    setFormStep(1);
  };
  
  // Handle redirect after successful registration
  useEffect(() => {
    if (authState === 'success') {
      navigate('/verify-email', {
        state: { email: formData.email }
      });
    }
  }, [authState, formData.email, navigate]);
  
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-md w-full space-y-8">
        <motion.div variants={itemVariants}>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {language === 'ar' ? 'أو' : 'Or'}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
              {language === 'ar' ? 'تسجيل الدخول إلى حسابك الحالي' : 'Sign in to your existing account'}
            </Link>
          </p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.form 
            key={`form-step-${formStep}`}
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {(formError || error) && (
              <motion.div 
                className="bg-red-50 border-l-4 border-red-500 p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {formError || error}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step indicator */}
            {(formData.role === 'contractor' || formData.role === 'specialist' || formData.role === 'crew') && (
              <motion.div 
                className="flex justify-center mb-4"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    formStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    1
                  </div>
                  <div className="w-16 h-1 bg-gray-200">
                    <div className={`h-full ${formStep > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    formStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    2
                  </div>
                </div>
              </motion.div>
            )}
            
            {formStep === 1 && (
              <>
                <motion.div className="rounded-md shadow-sm -space-y-px" variants={itemVariants}>
                  <div>
                    <label htmlFor="name" className="sr-only">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone_number" className="sr-only">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'رقم الهاتف (مثال: +201012345678)' : 'Phone Number (e.g. +201012345678)'}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'كلمة المرور (8 أحرف على الأقل)' : 'Password (at least 8 characters)'}
                    />
                  </div>
                  <div>
                    <label htmlFor="password2" className="sr-only">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                    <input
                      id="password2"
                      name="password2"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password2}
                      onChange={handleChange}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    />
                  </div>
                </motion.div>
    
                <motion.div className="mt-6" variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Client Role */}
                    <div>
                      <label className={`
                        flex w-full justify-between items-center py-3 px-4 border rounded-lg shadow-sm text-sm
                        transition-all duration-200 cursor-pointer
                        ${formData.role === 'client' 
                          ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                      `}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="client"
                            checked={formData.role === 'client'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {language === 'ar' ? '🏠 عميل' : '🏠 Client'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {language === 'ar' ? 'أحتاج لخدمات منزلية' : 'I need home services'}
                            </span>
                          </div>
                        </div>
                        {formData.role === 'client' && (
                          <div className="text-blue-500">✓</div>
                        )}
                      </label>
                    </div>

                    {/* A-List Specialist Role */}
                    <div>
                      <label className={`
                        flex w-full justify-between items-center py-3 px-4 border rounded-lg shadow-sm text-sm
                        transition-all duration-200 cursor-pointer
                        ${formData.role === 'specialist' 
                          ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                      `}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="specialist"
                            checked={formData.role === 'specialist'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {language === 'ar' ? '⭐ أخصائي A-List' : '⭐ A-List Specialist'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {language === 'ar' ? 'خبير استشاري معتمد' : 'Certified expert consultant'}
                            </span>
                          </div>
                        </div>
                        {formData.role === 'specialist' && (
                          <div className="text-purple-500">✓</div>
                        )}
                      </label>
                    </div>

                    {/* A-List Crew Role */}
                    <div>
                      <label className={`
                        flex w-full justify-between items-center py-3 px-4 border rounded-lg shadow-sm text-sm
                        transition-all duration-200 cursor-pointer
                        ${formData.role === 'crew' 
                          ? 'bg-green-50 text-green-700 border-green-300 ring-2 ring-green-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                      `}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="crew"
                            checked={formData.role === 'crew'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {language === 'ar' ? '👥 طاقم A-List' : '👥 A-List Crew'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {language === 'ar' ? 'عضو فريق عمل متخصص' : 'Specialized team member'}
                            </span>
                          </div>
                        </div>
                        {formData.role === 'crew' && (
                          <div className="text-green-500">✓</div>
                        )}
                      </label>
                    </div>

                    {/* Home Pro Role */}
                    <div>
                      <label className={`
                        flex w-full justify-between items-center py-3 px-4 border rounded-lg shadow-sm text-sm
                        transition-all duration-200 cursor-pointer
                        ${formData.role === 'contractor' 
                          ? 'bg-orange-50 text-orange-700 border-orange-300 ring-2 ring-orange-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                      `}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="contractor"
                            checked={formData.role === 'contractor'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {language === 'ar' ? '🔧 محترف منزلي' : '🔧 Home Pro'}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {language === 'ar' ? 'مقاول معتمد ومرخص' : 'Licensed contractor'}
                            </span>
                          </div>
                        </div>
                        {formData.role === 'contractor' && (
                          <div className="text-orange-500">✓</div>
                        )}
                      </label>
                    </div>
                  </div>
                </motion.div>
    
                <motion.div className="flex items-center" variants={itemVariants}>
                  <input
                    id="agree_terms"
                    name="agree_terms"
                    type="checkbox"
                    required
                    checked={formData.agree_terms}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree_terms" className="ml-2 block text-sm text-gray-900">
                    {language === 'ar' ? 'أوافق على' : 'I agree to the'}{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                      {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                    </Link>{' '}
                    {language === 'ar' ? 'و' : 'and'}{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                      {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                    </Link>
                  </label>
                </motion.div>
    
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white
                    transition-colors duration-200 ${
                      loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    {formData.role === 'contractor' 
                      ? (language === 'ar' ? 'متابعة' : 'Continue') 
                      : (loading 
                          ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') 
                          : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')
                        )
                    }
                  </button>
                </motion.div>
              </>
            )}
            
            {formStep === 2 && (
              <>
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {language === 'ar' ? 'التفاصيل المهنية' : 'Professional Details'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {language === 'ar' 
                      ? 'أخبرنا المزيد عن خدماتك المهنية حتى نتمكن من مساعدة العملاء في العثور عليك.' 
                      : 'Tell us more about your professional services so we can help clients find you.'}
                  </p>
                </motion.div>
                
                <motion.div className="space-y-4" variants={itemVariants}>
                  <div>
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'المهنة' : 'Profession'}
                    </label>
                    <input
                      id="profession"
                      name="profession"
                      type="text"
                      required
                      value={formData.profession}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'مثال: سباك، كهربائي، نجار' : 'e.g. Plumber, Electrician, Carpenter'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                    </label>
                    <input
                      id="years_experience"
                      name="years_experience"
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'مثال: 5' : 'e.g. 5'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="services_provided" className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'الخدمات المقدمة' : 'Services Provided'}
                    </label>
                    <textarea
                      id="services_provided"
                      name="services_provided"
                      rows="3"
                      required
                      value={formData.services_provided}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'اذكر الخدمات التي تقدمها، مفصولة بفواصل' : 'List the services you provide, separated by commas'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'نبذة عنك' : 'About You'}
                    </label>
                    <textarea
                      id="about"
                      name="about"
                      rows="4"
                      value={formData.about}
                      onChange={handleChange}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder={language === 'ar' ? 'أخبر العملاء المحتملين عن خبرتك ومؤهلاتك (اختياري)' : 'Tell potential clients about your experience and qualifications (optional)'}
                    />
                  </div>
                </motion.div>
                
                <motion.div className="flex space-x-4 pt-4" variants={itemVariants}>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="group relative flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </span>
                    {language === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                      loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                        <svg className="h-5 w-5 text-blue-400 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
                    {loading ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') : (language === 'ar' ? 'إنشاء حساب' : 'Create account')}
                  </button>
                </motion.div>
              </>
            )}
          </motion.form>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RegisterPage; 