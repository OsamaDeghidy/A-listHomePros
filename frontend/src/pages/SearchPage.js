import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { alistProsService } from '../services/api';
import { FaList, FaMapMarked, FaFilter, FaSearch } from 'react-icons/fa';
import SearchFilters from '../components/search/SearchFilters';
import ProsList from '../components/search/ProsList';
import ProsMap from '../components/search/ProsMap';
import { useLanguage } from '../hooks/useLanguage';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Extract search params from URL if any
  const searchParams = new URLSearchParams(location.search);
  const initialLocation = searchParams.get('location') || '';
  const initialService = searchParams.get('service') || '';
  const initialFilters = {
    location: initialLocation,
    category: initialService,
    rating: parseInt(searchParams.get('rating') || '0', 10),
    priceRange: [
      parseInt(searchParams.get('min_price') || '0', 10),
      parseInt(searchParams.get('max_price') || '1000', 10)
    ],
    availability: searchParams.get('availability') 
      ? searchParams.get('availability').split(',') 
      : []
  };
  
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
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Fetch search results based on URL params on initial load
  useEffect(() => {
    if (initialLocation || initialService) {
      fetchSearchResults(initialFilters);
    }
  }, []);
  
  const fetchSearchResults = async (filters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert filters to API parameters
      const params = {
        location: filters.location,
        service: filters.category,
        page: currentPage,
        page_size: 10
      };
      
      if (filters.rating > 0) {
        params.min_rating = filters.rating;
      }
      
      if (filters.priceRange[0] > 0) {
        params.min_price = filters.priceRange[0];
      }
      
      if (filters.priceRange[1] < 1000) {
        params.max_price = filters.priceRange[1];
      }
      
      if (filters.availability.length > 0) {
        params.availability = filters.availability.join(',');
      }
      
      // Call API
      console.log('Fetching professionals with params:', params);
      const response = await alistProsService.getProfiles(params);
      
      if (response && response.data) {
        setSearchResults(response.data.results || []);
        setTotalResults(response.data.count || 0);
        setSearchPerformed(true);
        
        // Log success for debugging
        console.log(`Successfully fetched ${response.data.count} professionals`);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          'Failed to load search results. Please try again later.';
      
      setError(errorMessage);
      // Reset results on error
      setSearchResults([]);
      setTotalResults(0);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (filters) => {
    // Update URL with filters
    const params = new URLSearchParams();
    
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('service', filters.category);
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.priceRange[0] > 0) params.set('min_price', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 1000) params.set('max_price', filters.priceRange[1].toString());
    if (filters.availability.length > 0) params.set('availability', filters.availability.join(','));
    
    // Update URL
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    // Reset to first page and fetch results
    setCurrentPage(1);
    fetchSearchResults(filters);
    
    // Close mobile filters if open
    setIsMobileFiltersOpen(false);
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
    
    // Update URL with page number
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    // Refetch with new page
    fetchSearchResults({
      ...initialFilters,
      page: newPage
    });
  };

  // Handle reset filters
  const handleReset = () => {
    // Reset all filters to initial state
    const resetFilters = {
      location: '',
      category: '',
      rating: 0,
      priceRange: [0, 1000],
      availability: []
    };
    
    // Update URL - remove all query params
    navigate({
      pathname: location.pathname
    }, { replace: true });
    
    // Reset current page
    setCurrentPage(1);
    
    // Apply reset filters
    fetchSearchResults(resetFilters);
  };

  // Toggle mobile filters visibility
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  // Handle view mode change (list or map)
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle pro click on map
  const handleProClick = (pro) => {
    console.log('Pro clicked:', pro);
    // Implement any additional functionality when a pro marker is clicked
  };
  
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-3xl font-bold mb-8"
        variants={itemVariants}
      >
        {language === 'ar' ? 'البحث عن محترفين خدمات المنزل' : 'Find Home Service Professionals'}
      </motion.h1>
      
      {/* Mobile Controls */}
      <div className="md:hidden mb-6">
        <div className="flex space-x-2">
          <button
            onClick={toggleMobileFilters}
            className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            <FaFilter className="mr-2" />
            {language === 'ar' ? 'الفلاتر' : 'Filters'}
          </button>
          
          <div className="flex-1 flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`flex-1 flex items-center justify-center px-4 py-2 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              <FaList className="mr-1" />
              {language === 'ar' ? 'قائمة' : 'List'}
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`flex-1 flex items-center justify-center px-4 py-2 ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              <FaMapMarked className="mr-1" />
              {language === 'ar' ? 'خريطة' : 'Map'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <motion.div 
          className={`md:w-1/4 md:block ${isMobileFiltersOpen ? 'block' : 'hidden'}`}
          variants={itemVariants}
        >
          <SearchFilters 
            onFilterChange={handleFilterChange}
            initialLocation={initialLocation}
            initialCategory={initialService}
          />
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          className="md:w-3/4"
          variants={itemVariants}
        >
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">
                {language === 'ar' ? 'جاري البحث عن محترفين...' : 'Searching for professionals...'}
              </p>
            </div>
          ) : error ? (
            <motion.div 
              className="bg-red-100 text-red-700 p-4 rounded-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-2">{language === 'ar' ? 'خطأ' : 'Error'}</h3>
              <p>{error}</p>
              <button 
                onClick={() => fetchSearchResults(initialFilters)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
              >
                {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="bg-white p-4 rounded-lg shadow-md mb-6"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {searchPerformed 
                        ? language === 'ar' 
                          ? `تم العثور على ${totalResults} محترف` 
                          : `${totalResults} professionals found`
                        : language === 'ar'
                          ? 'البحث عن محترفين'
                          : 'Search for professionals'
                      }
                      {initialLocation && (language === 'ar' ? ` في ${initialLocation}` : ` in ${initialLocation}`)}
                      {initialService && (language === 'ar' ? ` - ${initialService}` : ` - ${initialService}`)}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {language === 'ar' 
                        ? 'استعرض محترفين مصنفين بتقييمات عالية وجد الشخص المناسب لمشروعك'
                        : 'Browse highly-rated pros and find the perfect match for your project'
                      }
                    </p>
                  </div>
                  
                  {/* Desktop View Toggle */}
                  <div className="hidden md:flex space-x-2 rounded-md overflow-hidden">
                    <button
                      onClick={() => handleViewModeChange('list')}
                      className={`flex items-center px-4 py-2 ${
                        viewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaList className="mr-2" />
                      {language === 'ar' ? 'قائمة' : 'List'}
                    </button>
                    <button
                      onClick={() => handleViewModeChange('map')}
                      className={`flex items-center px-4 py-2 ${
                        viewMode === 'map' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaMapMarked className="mr-2" />
                      {language === 'ar' ? 'خريطة' : 'Map'}
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Conditional rendering based on view mode */}
              {viewMode === 'list' ? (
                <ProsList pros={searchResults} />
              ) : (
                <ProsMap pros={searchResults} onProClick={handleProClick} />
              )}
              
              {/* Pagination */}
              {viewMode === 'list' && totalResults > 10 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center bg-white rounded-md shadow px-2 py-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md mr-2 ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300'
                      }`}
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </button>
                    
                    <div className="flex space-x-1 mx-2">
                      {[...Array(Math.min(5, Math.ceil(totalResults / 10)))].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      {Math.ceil(totalResults / 10) > 5 && (
                        <span className="px-2 self-center">...</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalResults / 10)}
                      className={`px-4 py-2 rounded-md ml-2 ${
                        currentPage >= Math.ceil(totalResults / 10)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300'
                      }`}
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </nav>
                </div>
              )}
              
              {searchResults.length === 0 && !loading && searchPerformed && (
                <motion.div 
                  className="bg-white p-6 rounded-lg shadow-md text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'ar' ? 'لم يتم العثور على محترفين' : 'No professionals found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === 'ar' 
                      ? 'لم نتمكن من العثور على أي محترفين يطابقون معايير البحث الخاصة بك.'
                      : "We couldn't find any professionals matching your search criteria."
                    }
                  </p>
                  <p className="text-gray-600">
                    {language === 'ar'
                      ? 'حاول تعديل الفلاتر أو البحث عن خدمة مختلفة.'
                      : 'Try adjusting your filters or search for a different service.'
                    }
                  </p>
                  <button 
                    onClick={handleReset} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                  >
                    {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchPage; 