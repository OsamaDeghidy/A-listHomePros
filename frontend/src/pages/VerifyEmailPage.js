import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/auth';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaSpinner, FaEnvelope, FaRedoAlt, FaArrowLeft } from 'react-icons/fa';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error, info
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const { token, userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    const verify = async () => {
      try {
        if (token && userId) {
          setStatus('verifying');
          setMessage('جارٍ التحقق من بريدك الإلكتروني...');
          
          await verifyEmail(token, userId);
          setStatus('success');
          setMessage('🎉 تم التحقق من بريدك الإلكتروني بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول خلال 3 ثوانٍ...');
          
          // Countdown timer
          let timer = 3;
          const interval = setInterval(() => {
            setCountdown(timer);
            timer--;
            if (timer < 0) {
              clearInterval(interval);
              navigate('/login', { state: { message: 'تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.' } });
            }
          }, 1000);
          
          return () => clearInterval(interval);
        } else {
          setStatus('info');
          setMessage('تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها.');
        }
      } catch (error) {
        setStatus('error');
        console.error('Email verification error:', error);
        
        if (error.detail) {
          setMessage(error.detail);
        } else if (error.message) {
          setMessage(error.message);
        } else if (error.non_field_errors && error.non_field_errors.length > 0) {
          setMessage(error.non_field_errors[0]);
        } else {
          setMessage('فشل التحقق من البريد الإلكتروني. قد يكون الرابط منتهي الصلاحية أو غير صحيح.');
        }
      }
    };

    verify();
  }, [token, userId, navigate]);

  const handleResendVerification = async () => {
    if (resendCount >= 3) {
      setMessage('لقد وصلت إلى الحد الأقصى لإعادة الإرسال. يرجى المحاولة مرة أخرى لاحقاً.');
      return;
    }

    setResendLoading(true);
    try {
      const userEmail = email || prompt('يرجى إدخال بريدك الإلكتروني:');
      if (!userEmail) {
        setResendLoading(false);
        return;
      }

      await api.post('/users/resend-verification/', { email: userEmail });
      setResendCount(prev => prev + 1);
      setMessage(`تم إعادة إرسال رابط التحقق إلى ${userEmail}. يرجى التحقق من صندوق الوارد الخاص بك.`);
      setStatus('info');
      
      // Start cooldown
      let cooldown = 60;
      setCountdown(cooldown);
      const interval = setInterval(() => {
        cooldown--;
        setCountdown(cooldown);
        if (cooldown <= 0) {
          clearInterval(interval);
          setCountdown(0);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error.response?.data?.detail || 'فشل في إعادة إرسال رابط التحقق. يرجى المحاولة مرة أخرى.');
      setStatus('error');
    }
    setResendLoading(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="h-8 w-8 text-green-400" />;
      case 'error':
        return <FaExclamationCircle className="h-8 w-8 text-red-400" />;
      case 'verifying':
        return <FaSpinner className="h-8 w-8 text-blue-400 animate-spin" />;
      default:
        return <FaInfoCircle className="h-8 w-8 text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-400 to-green-600';
      case 'error':
        return 'from-red-400 to-red-600';
      case 'verifying':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div 
            className={`mx-auto h-16 w-16 bg-gradient-to-r ${getStatusColor()} rounded-full flex items-center justify-center mb-6`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FaEnvelope className="h-8 w-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            التحقق من البريد الإلكتروني
          </h2>
          
          {email && (
            <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
              📧 {email}
            </p>
          )}
        </div>

        {/* Status Card */}
        <motion.div 
          className={`rounded-xl shadow-lg p-6 ${
            status === 'success' ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200' :
            status === 'error' ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200' :
            status === 'verifying' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' :
            'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                status === 'success' ? 'text-green-800' :
                status === 'error' ? 'text-red-800' :
                status === 'verifying' ? 'text-blue-800' :
                'text-blue-800'
              }`}>
                {message}
              </p>
              
              {status === 'success' && countdown > 0 && (
                <p className="text-green-600 text-xs mt-2">
                  التوجيه خلال {countdown} ثانية...
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        {(status === 'info' || status === 'error') && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                لم يصلك البريد الإلكتروني؟
              </p>
              
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || countdown > 0 || resendCount >= 3}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white transition-all duration-200 ${
                  resendLoading || countdown > 0 || resendCount >= 3
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {resendLoading ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    جارٍ الإرسال...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <FaRedoAlt className="-ml-1 mr-2 h-4 w-4" />
                    إعادة الإرسال خلال {countdown}s
                  </>
                ) : resendCount >= 3 ? (
                  'وصلت للحد الأقصى'
                ) : (
                  <>
                    <FaRedoAlt className="-ml-1 mr-2 h-4 w-4" />
                    إعادة إرسال رابط التحقق
                  </>
                )}
              </button>
              
              {resendCount > 0 && resendCount < 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  المحاولات المتبقية: {3 - resendCount}
                </p>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                💡 نصائح مفيدة:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</li>
                <li>• تأكد من كتابة عنوان البريد الإلكتروني بشكل صحيح</li>
                <li>• قد يستغرق وصول البريد بضع دقائق</li>
                <li>• تأكد من اتصالك بالإنترنت</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Back to Login */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <FaArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى تسجيل الدخول
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p>
            هل تحتاج مساعدة؟{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800">
              تواصل معنا
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage; 