import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/api';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Animation variants
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
  
  // Extract token from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setFormError('الرابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.');
    }
  }, [location]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!password) {
      setFormError('كلمة المرور مطلوبة');
      return;
    }
    
    if (password.length < 8) {
      setFormError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('كلمات المرور غير متطابقة');
      return;
    }
    
    if (!token) {
      setFormError('الرمز غير صالح');
      return;
    }
    
    setLoading(true);
    
    try {
      // ارسال طلب إعادة تعيين كلمة المرور
      await userService.resetPassword({
        token: token,
        password: password,
        password_confirm: confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setFormError(
        err.response?.data?.message || 
        'حدث خطأ أثناء إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية أو غير صالح.'
      );
    } finally {
      setLoading(false);
    }
  };
  
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
            {success ? 'تم إعادة تعيين كلمة المرور' : 'إعادة تعيين كلمة المرور'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {success 
              ? 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' 
              : 'أدخل كلمة المرور الجديدة لحسابك'
            }
          </p>
        </motion.div>
        
        {success ? (
          <motion.div 
            className="bg-green-50 border-l-4 border-green-500 p-4 my-8"
            variants={itemVariants}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  تم إعادة تعيين كلمة المرور بنجاح.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Link 
                to="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                تسجيل الدخول الآن
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            variants={itemVariants}
          >
            {formError && (
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
                      {formError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">كلمة المرور الجديدة</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">تأكيد كلمة المرور</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="تأكيد كلمة المرور"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading || !token ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
              </button>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </div>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage; 