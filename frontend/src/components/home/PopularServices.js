import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';

const PopularServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        setLoading(true);
        // Fetch popular service categories from API
        const response = await axios.get('/api/alistpros/services/categories/', {
          params: { popular: true, limit: 8 }
        });
        
        setServices(response.data.results || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching popular services:', err);
        setError('Failed to load popular services');
        setLoading(false);
        
        // Fallback data in case API fails in development
        setServices([
          {
            id: 1,
            name: 'Plumbing',
            icon: '🔧',
            description: 'Professional plumbing services for your home',
            image_url: 'https://images.unsplash.com/photo-1585704032915-c3400305e979?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 24
          },
          {
            id: 2,
            name: 'Electrical',
            icon: '⚡',
            description: 'Expert electrical repair and installation',
            image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 19
          },
          {
            id: 3,
            name: 'House Cleaning',
            icon: '🧹',
            description: 'Keep your space spotless with our cleaning services',
            image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 31
          },
          {
            id: 4,
            name: 'Carpentry',
            icon: '🔨',
            description: 'Custom woodworking and furniture solutions',
            image_url: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 15
          },
          {
            id: 5,
            name: 'Painting',
            icon: '🖌️',
            description: 'Professional painting services for any surface',
            image_url: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 22
          },
          {
            id: 6,
            name: 'Appliance Repair',
            icon: '🔌',
            description: 'Fix your home appliances quickly and efficiently',
            image_url: 'https://images.unsplash.com/photo-1581092921461-39b9884e8331?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 17
          },
          {
            id: 7,
            name: 'Gardening',
            icon: '🌱',
            description: 'Landscaping and garden maintenance services',
            image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 13
          },
          {
            id: 8,
            name: 'Moving Services',
            icon: '📦',
            description: 'Professional help for your moving needs',
            image_url: 'https://images.unsplash.com/photo-1600518464441-7212cda107e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            service_count: 11
          }
        ]);
      }
    };

    fetchPopularServices();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && services.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most requested services from top-rated professionals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <Link to={`/services/${service.id}`} key={service.id}>
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 hover-lift">
                <div className="h-40 relative overflow-hidden">
                  <img 
                    src={service.image_url || `https://via.placeholder.com/400x250?text=${service.name}`} 
                    alt={service.name} 
                    className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-2xl mr-2">
                      {service.icon}
                    </span>
                    <span className="font-medium">
                      {service.service_count > 0 ? `${service.service_count}+ Pros` : 'Available'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-blue-600 font-medium">View Services</span>
                    <FaArrowRight className="text-blue-600" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/services" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
          >
            Explore All Services
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularServices; 