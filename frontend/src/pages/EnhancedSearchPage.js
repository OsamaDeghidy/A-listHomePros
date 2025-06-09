import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaList, 
  FaMapMarkerAlt, 
  FaFilter, 
  FaSearch, 
  FaUserTie, 
  FaToolbox, 
  FaUsers,
  FaSortAmountDown,
  FaSpinner
} from 'react-icons/fa';
import { useLanguage } from '../hooks/useLanguage';
import professionalService from '../services/professionalService';
import ProfessionalProfileCard from '../components/search/ProfessionalProfileCard';
import EnhancedSearchFilters from '../components/search/EnhancedSearchFilters';

const EnhancedSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, isRTL } = useLanguage();

  // State
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'map'
  const [sortBy, setSortBy] = useState('-average_rating,-total_jobs');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Parse initial filters from URL
  const initialFilters = {
    searchTerm: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    role: searchParams.get('role') || '',
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    minRating: parseFloat(searchParams.get('min_rating')) || 0,
    minExperience: parseInt(searchParams.get('min_experience')) || 0,
    maxExperience: parseInt(searchParams.get('max_experience')) || 20,
    minRate: parseInt(searchParams.get('min_rate')) || 0,
    maxRate: parseInt(searchParams.get('max_rate')) || 500,
    radius: parseInt(searchParams.get('radius')) || 25,
    isVerified: searchParams.get('verified') === 'true',
    hasLicense: searchParams.get('licensed') === 'true',
    isFeatured: searchParams.get('featured') === 'true',
    isAvailable: searchParams.get('available') === 'true',
    page: parseInt(searchParams.get('page')) || 1,
    ordering: searchParams.get('sort') || '-average_rating,-total_jobs'
  };

  // Load professionals on mount and when filters change
  useEffect(() => {
    handleSearch(initialFilters);
  }, []);

  const handleSearch = async (filters = initialFilters) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching with filters:', filters);
      
      const response = await professionalService.advancedSearch({
        ...filters,
        ordering: sortBy
      });

      if (response?.data) {
        const data = response.data;
        const results = data.results || data;
        
        setProfessionals(Array.isArray(results) ? results : []);
        setTotalResults(data.count || (Array.isArray(results) ? results.length : 0));
        setCurrentPage(filters.page || 1);
        
        console.log(`✅ Found ${Array.isArray(results) ? results.length : 0} professionals`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message || 'Failed to search professionals');
      setProfessionals([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filter change:', newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0 && value !== false) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (typeof value === 'string' || typeof value === 'number') {
          params.set(key, value.toString());
        } else if (typeof value === 'boolean' && value) {
          params.set(key, 'true');
        }
      }
    });

    // Update URL without reload
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });

    // Perform search
    handleSearch(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    handleSearch({ ...initialFilters, ordering: newSort });
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...initialFilters, page: newPage };
    handleFilterChange(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactProfessional = (professional) => {
    // Navigate to contact/message page
    navigate(`/messages/new?professional=${professional.user_id}`);
  };

  const handleViewProfile = (professional) => {
    navigate(`/professionals/${professional.user_id}`);
  };

  const handleAddToFavorites = (professional) => {
    // Implement add to favorites functionality
    console.log('Adding to favorites:', professional);
  };

  const getRoleStats = () => {
    const stats = {
      total: professionals.length,
      specialist: professionals.filter(p => p.role === 'specialist').length,
      contractor: professionals.filter(p => p.role === 'contractor').length,
      crew: professionals.filter(p => p.role === 'crew').length
    };
    return stats;
  };

  const roleStats = getRoleStats();

  const sortOptions = [
    { value: '-average_rating,-total_jobs', label: language === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated' },
    { value: '-total_jobs', label: language === 'ar' ? 'الأكثر خبرة' : 'Most Experienced' },
    { value: 'hourly_rate', label: language === 'ar' ? 'الأقل سعراً' : 'Lowest Price' },
    { value: '-hourly_rate', label: language === 'ar' ? 'الأعلى سعراً' : 'Highest Price' },
    { value: '-created_at', label: language === 'ar' ? 'الأحدث' : 'Newest' },
    { value: 'response_time_hours', label: language === 'ar' ? 'الأسرع استجابة' : 'Fastest Response' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'ar' ? 'العثور على محترفين' : 'Find Professionals'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {language === 'ar' 
                  ? 'اعثر على أفضل المحترفين لمشروعك القادم'
                  : 'Discover the best professionals for your next project'
                }
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
              >
                <FaFilter className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'الفلاتر' : 'Filters'}
              </button>
            </div>
          </motion.div>

          {/* Role Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <FaUsers className="w-6 h-6 mx-auto text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{roleStats.total}</div>
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'إجمالي المحترفين' : 'Total Professionals'}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <FaUserTie className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-900">{roleStats.specialist}</div>
              <div className="text-sm text-purple-600">
                {language === 'ar' ? 'متخصصين' : 'Specialists'}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <FaToolbox className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{roleStats.contractor}</div>
              <div className="text-sm text-blue-600">
                {language === 'ar' ? 'مقدمي خدمة' : 'Home Pros'}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <FaUsers className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-900">{roleStats.crew}</div>
              <div className="text-sm text-green-600">
                {language === 'ar' ? 'أعضاء طاقم' : 'Crew Members'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.div 
            className={`lg:w-1/4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EnhancedSearchFilters
              initialFilters={initialFilters}
              onFilterChange={handleFilterChange}
              showRoleFilter={true}
              showAdvancedFilters={true}
            />
          </motion.div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Controls Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Results Count */}
                <div>
                  <p className="text-sm text-gray-600">
                    {loading ? (
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                        {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
                      </span>
                    ) : (
                      <>
                        {totalResults > 0 ? (
                          <>
                            {language === 'ar' ? 'وُجد' : 'Found'} <span className="font-semibold">{totalResults}</span>{' '}
                            {language === 'ar' ? 'محترف' : 'professionals'}
                          </>
                        ) : (
                          <span className="text-red-600">
                            {language === 'ar' ? 'لم يتم العثور على محترفين' : 'No professionals found'}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* Sort & View Controls */}
                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center">
                    <FaSortAmountDown className="w-4 h-4 text-gray-400 mr-2" />
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex rounded-md overflow-hidden border border-gray-300">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 text-sm ${
                        viewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-1 w-4 h-4">
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                        <div className="bg-current rounded-sm"></div>
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 text-sm ${
                        viewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FaList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <FaSpinner className="animate-spin w-8 h-8 text-blue-600 mr-3" />
                  <span className="text-gray-600">
                    {language === 'ar' ? 'جاري تحميل المحترفين...' : 'Loading professionals...'}
                  </span>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                >
                  <div className="text-red-600 mb-2">
                    {language === 'ar' ? 'حدث خطأ' : 'Error occurred'}
                  </div>
                  <p className="text-red-800 mb-4">{error}</p>
                  <button
                    onClick={() => handleSearch(initialFilters)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                  </button>
                </motion.div>
              ) : professionals.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg p-12 text-center"
                >
                  <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {language === 'ar' ? 'لم يتم العثور على محترفين' : 'No professionals found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'ar' 
                      ? 'حاول تعديل معايير البحث أو الفلاتر للحصول على نتائج أفضل'
                      : 'Try adjusting your search criteria or filters for better results'
                    }
                  </p>
                  <button
                    onClick={() => handleFilterChange({})}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {language === 'ar' ? 'إعادة تعيين البحث' : 'Reset Search'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {professionals.map((professional, index) => (
                        <motion.div
                          key={professional.user_id || professional.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProfessionalProfileCard
                            professional={professional}
                            onViewProfile={handleViewProfile}
                            onContactProfessional={handleContactProfessional}
                            onAddToFavorites={handleAddToFavorites}
                            size="medium"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-4">
                      {professionals.map((professional, index) => (
                        <motion.div
                          key={professional.user_id || professional.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProfessionalProfileCard
                            professional={professional}
                            onViewProfile={handleViewProfile}
                            onContactProfessional={handleContactProfessional}
                            onAddToFavorites={handleAddToFavorites}
                            size="large"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalResults > 12 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 flex justify-center"
                    >
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {language === 'ar' ? 'السابق' : 'Previous'}
                        </button>

                        {Array.from({ length: Math.min(5, Math.ceil(totalResults / 12)) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-2 rounded-md text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(totalResults / 12)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            currentPage >= Math.ceil(totalResults / 12)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {language === 'ar' ? 'التالي' : 'Next'}
                        </button>
                      </nav>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearchPage; 