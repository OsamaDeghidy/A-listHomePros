import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { alistProsService } from '../../services/api';

const SearchFilters = ({ onFilterChange, initialLocation = '', initialCategory = '' }) => {
  const [filters, setFilters] = useState({
    location: initialLocation,
    category: initialCategory,
    rating: 0,
    priceRange: [0, 1000],
    availability: []
  });
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Animation variants
  const filterItemVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      marginBottom: 16,
      transition: { duration: 0.3 } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      marginBottom: 0,
      transition: { duration: 0.3 } 
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching service categories...');
        const response = await alistProsService.getCategories();
        
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            setCategories(response.data);
            console.log(`Successfully fetched ${response.data.length} categories`);
          } else if (response.data.results && Array.isArray(response.data.results)) {
            // API might return data wrapped in a results property
            setCategories(response.data.results);
            console.log(`Successfully fetched ${response.data.results.length} categories`);
          } else {
            console.warn('API returned unexpected format for categories, using fallback data');
            setCategories(fallbackCategories);
          }
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Use fallback categories in case of error
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Apply initial filters on component mount
  useEffect(() => {
    if (initialLocation || initialCategory) {
      const initialFilters = { ...filters };
      if (initialLocation) initialFilters.location = initialLocation;
      if (initialCategory) initialFilters.category = initialCategory;
      setFilters(initialFilters);
    }
  }, [initialLocation, initialCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating // Toggle rating if clicking the same one
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    setFilters(prev => {
      if (checked) {
        return {
          ...prev,
          availability: [...prev.availability, name]
        };
      } else {
        return {
          ...prev,
          availability: prev.availability.filter(day => day !== name)
        };
      }
    });
  };

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0;
    const index = name === 'minPrice' ? 0 : 1;
    
    setFilters(prev => {
      const newPriceRange = [...prev.priceRange];
      newPriceRange[index] = numValue;
      
      // Ensure min doesn't exceed max
      if (index === 0 && numValue > newPriceRange[1]) {
        newPriceRange[1] = numValue;
      }
      // Ensure max isn't less than min
      if (index === 1 && numValue < newPriceRange[0]) {
        newPriceRange[0] = numValue;
      }
      
      return {
        ...prev,
        priceRange: newPriceRange
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      location: '',
      category: '',
      rating: 0,
      priceRange: [0, 1000],
      availability: []
    };
    
    setFilters(resetFilters);
    
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  const toggleFiltersExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Fallback categories in case API fails
  const fallbackCategories = [
    { id: "plumbing", name: "Plumbing" },
    { id: "electrical", name: "Electrical" },
    { id: "carpentry", name: "Carpentry" },
    { id: "painting", name: "Painting" },
    { id: "cleaning", name: "Cleaning" },
    { id: "landscaping", name: "Landscaping" },
    { id: "hvac", name: "HVAC" },
    { id: "roofing", name: "Roofing" },
  ];

  // Days of the week for availability filter
  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  return (
    <>
      {/* Mobile filter button - visible on smaller screens */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleMobileFilters}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Filter sidebar - always visible on large screens, conditionally on mobile */}
      <AnimatePresence>
        {(isExpanded || window.innerWidth >= 768) && (
          <motion.div 
            className={`bg-white p-6 rounded-lg shadow-md ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filter Results</h3>
              <button
                onClick={toggleFiltersExpanded}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Location Filter */}
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleInputChange}
                  placeholder="Enter ZIP code or city"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              
              {/* Service Category Filter */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <option value="">All Categories</option>
                  {isLoading ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <>
                    {/* Rating Filter */}
                    <motion.div 
                      className="mb-4"
                      variants={filterItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none transition-transform duration-200 hover:scale-110"
                          >
                            <svg
                              className={`w-8 h-8 ${star <= filters.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        {filters.rating > 0 && (
                          <motion.span 
                            className="ml-2 text-sm font-medium text-blue-600"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                          >
                            {filters.rating}+ stars
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Price Range Filter */}
                    <motion.div 
                      className="mb-4"
                      variants={filterItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Range (per hour)
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <label htmlFor="minPrice" className="block text-xs text-gray-500">
                            Min ($)
                          </label>
                          <input
                            type="number"
                            id="minPrice"
                            name="minPrice"
                            min="0"
                            max="1000"
                            value={filters.priceRange[0]}
                            onChange={handlePriceRangeChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="maxPrice" className="block text-xs text-gray-500">
                            Max ($)
                          </label>
                          <input
                            type="number"
                            id="maxPrice"
                            name="maxPrice"
                            min="0"
                            max="10000"
                            value={filters.priceRange[1]}
                            onChange={handlePriceRangeChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>
                      
                      {/* Price range slider visual indicator */}
                      <div className="mt-2 px-2">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (filters.priceRange[1] - filters.priceRange[0]) / 10)}%`,
                              marginLeft: `${Math.min(100, filters.priceRange[0] / 10)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>$0</span>
                          <span>$500</span>
                          <span>$1000+</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Availability Filter */}
                    <motion.div 
                      className="mb-6"
                      variants={filterItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeek.map((day) => (
                          <div key={day.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={day.id}
                              name={day.id}
                              checked={filters.availability.includes(day.id)}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                            />
                            <label htmlFor={day.id} className="ml-2 text-sm text-gray-700">
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              
              {/* Expand/Collapse Button for mobile */}
              <div className="mb-4 md:hidden">
                <button
                  type="button"
                  onClick={toggleFiltersExpanded}
                  className="w-full text-center text-blue-600 text-sm font-medium flex items-center justify-center"
                >
                  {isExpanded ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show More Filters
                    </>
                  )}
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchFilters; 