import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceService, proService } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { FaStar, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch service details
        const serviceResponse = await serviceService.getServiceById(id);
        setService(serviceResponse.data);
        
        // Fetch professionals offering this service
        const prosResponse = await proService.searchPros({ service: id, limit: 10 });
        setProfessionals(prosResponse.data.results || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError(isArabic ? 'حدث خطأ أثناء تحميل تفاصيل الخدمة' : 'Error loading service details');
        setLoading(false);
        
        // Fallback data in case API fails
        if (!service) {
          setService({
            id,
            name: isArabic ? 'خدمة الصيانة' : 'Maintenance Service',
            description: isArabic 
              ? 'خدمات صيانة احترافية لمنزلك بأسعار معقولة وجودة عالية.'
              : 'Professional maintenance services for your home at reasonable prices and high quality.',
            image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          });
        }
        
        // Fallback professionals data
        if (professionals.length === 0) {
          setProfessionals([
            {
              id: 1,
              user: { first_name: 'Ahmed', last_name: 'Mohamed' },
              business_name: isArabic ? 'خدمات أحمد للصيانة' : 'Ahmed Maintenance Services',
              average_rating: 4.8,
              review_count: 24,
              profile_image: 'https://randomuser.me/api/portraits/men/32.jpg',
              location: isArabic ? 'القاهرة، مصر' : 'Cairo, Egypt',
              verified: true,
              services_offered: 5,
              phone: '+201012345678'
            },
            {
              id: 2,
              user: { first_name: 'Sara', last_name: 'Ahmed' },
              business_name: isArabic ? 'سارة للخدمات المنزلية' : 'Sara Home Services',
              average_rating: 4.5,
              review_count: 18,
              profile_image: 'https://randomuser.me/api/portraits/women/44.jpg',
              location: isArabic ? 'الإسكندرية، مصر' : 'Alexandria, Egypt',
              verified: true,
              services_offered: 3,
              phone: '+201123456789'
            }
          ]);
        }
      }
    };
    
    fetchServiceDetails();
  }, [id, isArabic, service, professionals.length]);
  
  // Helper function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="relative">
          <FaStar className="text-gray-300" />
          <span className="absolute top-0 left-0 overflow-hidden w-1/2">
            <FaStar className="text-yellow-400" />
          </span>
        </span>
      );
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-star-${i}`} className="text-gray-300" />);
    }
    
    return <div className="flex">{stars}</div>;
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col justify-center items-center h-72">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{isArabic ? 'جاري تحميل تفاصيل الخدمة...' : 'Loading service details...'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error && !service) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-block p-4 rounded-lg bg-red-50 border border-red-100 mb-4">
              <svg className="w-6 h-6 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
            <Link to="/" className="text-blue-600 flex items-center justify-center">
              <FaArrowLeft className={`${isArabic ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Service Header */}
        <div className="relative h-64 md:h-80 bg-blue-600 overflow-hidden">
          <img 
            src={service?.image_url || `https://via.placeholder.com/1200x400?text=${service?.name}`} 
            alt={service?.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/70"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
            <div className="flex items-center mb-4">
              <Link to="/" className="text-blue-100 hover:text-white flex items-center">
                <FaArrowLeft className={`${isArabic ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {isArabic ? 'الرئيسية' : 'Home'}
              </Link>
              <span className="mx-2 text-blue-200">/</span>
              <Link to="/services" className="text-blue-100 hover:text-white">
                {isArabic ? 'الخدمات' : 'Services'}
              </Link>
              <span className="mx-2 text-blue-200">/</span>
              <span className="text-white">{service?.name}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{service?.name}</h1>
            <p className="text-blue-100 max-w-2xl">{service?.description}</p>
          </div>
        </div>
        
        {/* Service Professionals */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {isArabic 
              ? `محترفين ${service?.name}`
              : `${service?.name} Professionals`}
          </h2>
          
          {professionals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {professionals.map((pro) => (
                <div key={pro.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden transform hover:-translate-y-1">
                  <Link to={`/pros/${pro.id}`}>
                    <div className="relative h-48 bg-blue-100">
                      <img 
                        src={pro.profile_image || pro.profile_picture || `https://ui-avatars.com/api/?name=${pro.user?.first_name}+${pro.user?.last_name}&background=0D8ABC&color=fff`} 
                        alt={pro.business_name || `${pro.user?.first_name} ${pro.user?.last_name}`} 
                        className="w-full h-full object-cover"
                      />
                      {pro.verified && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <FaCheckCircle className="mr-1" />
                          {isArabic ? 'موثق' : 'Verified'}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {pro.business_name || `${pro.user?.first_name} ${pro.user?.last_name}`}
                      </h3>
                      
                      <div className="flex items-center mb-3">
                        {renderStars(pro.average_rating || 0)}
                        <span className="ml-2 text-gray-600">
                          ({pro.review_count || 0} {isArabic ? 'تقييم' : 'reviews'})
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        <span>{pro.location || (isArabic ? 'غير محدد' : 'Not specified')}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <FaPhone className="mr-2 text-blue-500" />
                        <span>{pro.phone || (isArabic ? 'غير متاح' : 'Not available')}</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {pro.services_offered 
                            ? isArabic 
                              ? `${pro.services_offered} خدمات متاحة` 
                              : `${pro.services_offered} services offered`
                            : isArabic ? 'خدمات متعددة' : 'Multiple services'}
                        </span>
                        <span className="text-blue-600 font-medium">
                          {isArabic ? 'عرض الملف الشخصي' : 'View Profile'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-blue-50 rounded-lg p-8 max-w-lg mx-auto">
                <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {isArabic ? 'لا يوجد محترفين متاحين حاليًا' : 'No professionals available yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isArabic 
                    ? 'لم نتمكن من العثور على محترفين يقدمون هذه الخدمة حاليًا. يرجى التحقق مرة أخرى لاحقًا.'
                    : 'We couldn\'t find any professionals offering this service at the moment. Please check back later.'}
                </p>
                <Link 
                  to="/services" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isArabic ? 'استكشاف خدمات أخرى' : 'Explore other services'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ServiceDetailsPage;
