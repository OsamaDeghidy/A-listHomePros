import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/auth';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { token, userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    const verify = async () => {
      try {
        if (token && userId) {
          await verifyEmail(token, userId);
          setStatus('success');
          setMessage('تم التحقق من بريدك الإلكتروني بنجاح!');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('info');
          setMessage('تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.detail || 'فشل التحقق من البريد الإلكتروني. يرجى المحاولة مرة أخرى.');
      }
    };

    verify();
  }, [token, userId, navigate]);

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            التحقق من البريد الإلكتروني
          </h2>
          {email && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {email}
            </p>
          )}
        </div>

        <div className={`rounded-md p-4 ${
          status === 'success' ? 'bg-green-50' :
          status === 'error' ? 'bg-red-50' :
          'bg-blue-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {status === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : status === 'error' ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="mr-3">
              <p className={`text-sm font-medium ${
                status === 'success' ? 'text-green-800' :
                status === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        </div>

        {status === 'info' && (
          <div className="text-center text-sm text-gray-600">
            <p>لم يصلك البريد الإلكتروني؟</p>
            <button
              type="button"
              className="mt-2 text-blue-600 hover:text-blue-500 transition-colors duration-200"
              onClick={() => {/* Add resend verification email logic */}}
            >
              إعادة إرسال رابط التحقق
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyEmailPage; 