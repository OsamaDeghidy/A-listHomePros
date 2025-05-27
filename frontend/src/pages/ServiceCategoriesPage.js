import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaArrowRight } from 'react-icons/fa';

const ServiceCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Simulating API call with timeout
        setTimeout(() => {
          const dummyCategories = [
            {
              id: 1,
              name: "Plumbing",
              description: "Professional plumbing services for repairs, installations, and maintenance",
              imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/plumbing.svg", // In a real app, this would be a path to an icon
              proCount: 48,
              popularServices: [
                "Leak Repair",
                "Pipe Installation",
                "Drain Cleaning",
                "Water Heater Installation"
              ]
            },
            {
              id: 2,
              name: "Electrical",
              description: "Licensed electricians for all your electrical needs, from repairs to installations",
              imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/electrical.svg",
              proCount: 37,
              popularServices: [
                "Circuit Installation",
                "Lighting Installation",
                "Electrical Repairs",
                "Panel Upgrades"
              ]
            },
            {
              id: 3,
              name: "Carpentry",
              description: "Skilled carpenters for furniture building, repairs, and custom woodwork",
              imageUrl: "https://images.unsplash.com/photo-1567604136338-d891178eea10?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/carpentry.svg",
              proCount: 29,
              popularServices: [
                "Custom Furniture",
                "Cabinet Installation",
                "Wood Repairs",
                "Deck Building"
              ]
            },
            {
              id: 4,
              name: "Painting",
              description: "Professional painters for interior and exterior painting services",
              imageUrl: "https://images.unsplash.com/photo-1562183241-840b8af0721e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/painting.svg",
              proCount: 42,
              popularServices: [
                "Interior Painting",
                "Exterior Painting",
                "Wallpaper Installation",
                "Texture Application"
              ]
            },
            {
              id: 5,
              name: "Cleaning",
              description: "Professional cleaning services for homes and offices",
              imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/cleaning.svg",
              proCount: 56,
              popularServices: [
                "Deep Cleaning",
                "Regular Maintenance",
                "Move-in/Move-out Cleaning",
                "Window Cleaning"
              ]
            },
            {
              id: 6,
              name: "HVAC",
              description: "Heating, ventilation, and air conditioning services for installation and repair",
              imageUrl: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/hvac.svg",
              proCount: 33,
              popularServices: [
                "AC Installation",
                "Heating Repair",
                "Duct Cleaning",
                "System Maintenance"
              ]
            },
            {
              id: 7,
              name: "Landscaping",
              description: "Professional landscaping for lawn care, gardening, and outdoor space design",
              imageUrl: "https://images.unsplash.com/photo-1600699260196-78886c7346b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/landscaping.svg",
              proCount: 39,
              popularServices: [
                "Lawn Maintenance",
                "Garden Design",
                "Tree Trimming",
                "Irrigation Installation"
              ]
            },
            {
              id: 8,
              name: "Appliance Repair",
              description: "Expert technicians to repair and maintain your home appliances",
              imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/appliance.svg",
              proCount: 27,
              popularServices: [
                "Refrigerator Repair",
                "Washing Machine Repair",
                "Dryer Repair",
                "Dishwasher Repair"
              ]
            },
            {
              id: 9,
              name: "Roofing",
              description: "Professional roofers for installation, repair, and maintenance",
              imageUrl: "https://images.unsplash.com/photo-1598252897945-c1b24c61aece?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/roofing.svg",
              proCount: 25,
              popularServices: [
                "Roof Installation",
                "Roof Repair",
                "Gutter Installation",
                "Leak Detection"
              ]
            },
            {
              id: 10,
              name: "Flooring",
              description: "Expert flooring installation and repair for all floor types",
              imageUrl: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/flooring.svg",
              proCount: 31,
              popularServices: [
                "Hardwood Installation",
                "Tile Installation",
                "Carpet Installation",
                "Floor Refinishing"
              ]
            },
            {
              id: 11,
              name: "Home Security",
              description: "Installation and maintenance of security systems to keep your home safe",
              imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/security.svg",
              proCount: 18,
              popularServices: [
                "Security System Installation",
                "Camera Installation",
                "Smart Lock Installation",
                "System Monitoring"
              ]
            },
            {
              id: 12,
              name: "Moving Services",
              description: "Professional movers to help with relocations, large or small",
              imageUrl: "https://images.unsplash.com/photo-1600518464441-9306b00c4fe2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              iconUrl: "/icons/moving.svg",
              proCount: 22,
              popularServices: [
                "Local Moving",
                "Long Distance Moving",
                "Packing Services",
                "Furniture Assembly"
              ]
            }
          ];
          
          setCategories(dummyCategories);
          setFilteredCategories(dummyCategories);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load service categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.popularServices.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Service Categories | A-List Home Pros</title>
        <meta name="description" content="Browse our comprehensive list of home service categories. Find professionals for plumbing, electrical, carpentry, cleaning, and more." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Home Service Categories</h1>
            <p className="text-xl text-blue-100">
              Find the right professionals for all your home service needs
            </p>
          </div>
        </div>
      </section>

      {/* Search & Categories Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a service..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </div>
          
          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any services matching your search criteria
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:underline font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                        <p className="text-white text-sm opacity-90">{category.proCount} professionals available</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Popular Services:</h4>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {category.popularServices.map((service, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link 
                      to={`/services/${category.id}`} 
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                    >
                      View Details
                      <FaArrowRight className="ml-2 text-sm" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">
              Connect with top-rated professionals for your home service needs. Get quotes, compare profiles, and book appointments all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/search" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Find a Professional
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition duration-300"
              >
                Join as a Professional
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceCategoriesPage; 