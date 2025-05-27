import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || "You don't have permission to access this page.";

  return (
    <>
      <Helmet>
        <title>Unauthorized Access | A-List Home Pros</title>
        <meta name="description" content="Unauthorized access to this resource" />
      </Helmet>

      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-yellow-500 p-4 flex items-center justify-center">
            <FaExclamationTriangle className="text-white text-4xl" />
          </div>
          
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Unauthorized Access</h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FaArrowLeft /> Go Back
              </button>
              
              <Link
                to="/"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaHome /> Home Page
              </Link>
            </div>
            
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              If you believe this is an error, please <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact support</Link>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnauthorizedPage; 