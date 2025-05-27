import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaBook, FaCode, FaLock, FaInfoCircle } from 'react-icons/fa';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiDocsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  
  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real application, fetch the Swagger JSON from the backend
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/swagger.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch API documentation: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setSwaggerSpec(data);
      } catch (err) {
        console.error('Error fetching Swagger spec:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSwaggerSpec();
  }, []);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>API Documentation | A-List Home Pros</title>
        <meta name="description" content="Developer documentation for the A-List Home Pros API" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaBook className="mr-2 text-blue-600" />
            API Documentation
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore and learn about the A-List Home Pros API
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 bg-blue-700 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <FaInfoCircle className="mr-2" />
              Overview
            </h2>
          </div>
          <div className="p-6">
            <p className="mb-4">
              The A-List Home Pros API is a RESTful interface that allows you to access platform data and functionality through HTTP requests.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FaCode className="mr-2 text-blue-500" />
                  Available Endpoints
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li><span className="font-medium">/api/users/</span> - User management</li>
                  <li><span className="font-medium">/api/alistpros/</span> - Contractor profile management</li>
                  <li><span className="font-medium">/api/scheduling/</span> - Appointment scheduling</li>
                  <li><span className="font-medium">/api/payments/</span> - Payment processing</li>
                  <li><span className="font-medium">/api/messaging/</span> - In-platform messaging</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FaLock className="mr-2 text-blue-500" />
                  Authentication
                </h3>
                <p className="text-gray-600">
                  All API endpoints use JWT authentication. Obtain your access token from the <span className="font-mono text-sm bg-gray-100 rounded px-1 py-0.5">/api/users/token/</span> endpoint.
                </p>
                <div className="mt-2 text-sm bg-gray-100 p-2 rounded font-mono">
                  Authorization: Bearer YOUR_ACCESS_TOKEN
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-700 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <FaCode className="mr-2" />
              Interactive API Documentation
            </h2>
          </div>
          
          <div className="swaggerContainer">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-opacity-50 border-t-blue-500 mb-2"></div>
                <p className="text-gray-600">Loading API documentation...</p>
              </div>
            ) : error ? (
              <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <h3 className="text-lg font-medium mb-1">Error Loading Documentation</h3>
                  <p>{error}</p>
                  <p className="mt-2 text-sm">
                    To view documentation, please ensure the backend server is running and the Swagger endpoint is available.
                  </p>
                </div>
                
                {/* Fallback to use Swagger Petstore */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Showing Sample Swagger Documentation</h3>
                  <p className="mb-4">
                    Since the A-List Home Pros API documentation is not available, we're showing a sample Swagger documentation for Petstore:
                  </p>
                  <SwaggerUI url="https://petstore.swagger.io/v2/swagger.json" />
                </div>
              </div>
            ) : swaggerSpec ? (
              <SwaggerUI spec={swaggerSpec} />
            ) : (
              <div className="p-8 text-center text-gray-600">
                Unable to load API documentation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage; 