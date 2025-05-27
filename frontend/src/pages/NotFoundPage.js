import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          We're sorry, the page you requested could not be found. It may have been moved, 
          deleted, or might never have existed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/"
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            <FaHome /> Back to Home
          </Link>
          
          <Link 
            to="/search"
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FaSearch /> Search Services
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-gray-500">
        <p>Need help? <Link to="/help" className="text-primary-600 hover:underline">Visit our Help Center</Link> or <Link to="/contact" className="text-primary-600 hover:underline">Contact Support</Link></p>
      </div>
    </div>
  );
};

export default NotFoundPage; 