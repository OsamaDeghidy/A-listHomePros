import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import useProfessionalDetails from '../hooks/useProfessionalDetails';
import Layout from '../components/layout/Layout';

const ProProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useNotifications();
  const { professional, reviews, availability, loading, error, startConversation, messageLoading } = useProfessionalDetails(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error || 'Professional not found'}</p>
          <Link to="/search" className="font-medium text-red-800 hover:underline mt-2 inline-block">
            Return to search
          </Link>
        </div>
      </div>
    );
  }

  // Fallback for rendering while we integrate with real data
  const pro = {
    id: professional.id || id,
    name: professional.name || professional.business_name || 'John Smith',
    profession: professional.profession || 'Plumber',
    avatar: professional.avatar || professional.profile_image || 'https://randomuser.me/api/portraits/men/32.jpg',
    coverPhoto: professional.cover_photo || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: professional.rating || professional.average_rating || 4.9,
    reviews: reviews || [],
    reviewsCount: professional.reviews_count || professional.review_count || 87,
    completedJobs: professional.completed_jobs || 134,
    location: professional.location?.address || professional.location || 'New York, NY',
    availability: professional.availability || 'Available today',
    hourlyRate: professional.hourly_rate || professional.rate || 85,
    bio: professional.bio || professional.business_description || 'Professional plumber with over 15 years of experience in residential and commercial plumbing. Specializing in leak detection, pipe installation, and fixture replacements.',
    services: professional.services || [
      {
        id: 1,
        name: 'Leak Detection & Repair',
        description: 'Finding and fixing leaks in pipes, faucets, and fixtures',
        price: 120,
        duration: '1-2 hours'
      },
      {
        id: 2,
        name: 'Pipe Installation',
        description: 'Installing new pipes or replacing old ones',
        price: 200,
        duration: '2-4 hours'
      },
      {
        id: 3,
        name: 'Fixture Installation',
        description: 'Installing sinks, toilets, showers, and other fixtures',
        price: 150,
        duration: '1-3 hours'
      },
      {
        id: 4,
        name: 'Drain Cleaning',
        description: 'Removing clogs and cleaning drains',
        price: 100,
        duration: '1 hour'
      }
    ],
    certifications: professional.certifications || [
      'Licensed Master Plumber',
      'Certified Backflow Tester',
      'EPA Certified'
    ],
    gallery: professional.gallery || professional.portfolio_images || [
      'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    phone: professional.phone || professional.contact_phone || '+1234567890',
    email: professional.email || professional.contact_email || 'contact@example.com'
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor" 
          viewBox="0 0 20 20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  // وظيفة لفتح نافذة التواصل مع المحترف
  const openMessageModal = () => {
    if (!isAuthenticated) {
      addToast('Please login to send messages', 'info');
      navigate('/login', { state: { from: `/pros/${id}` } });
      return;
    }
    setIsMessageModalOpen(true);
  };

  // وظيفة لإرسال رسالة للمحترف
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await startConversation(message);
      setIsMessageModalOpen(false);
      setMessage('');
      addToast('Message sent successfully!', 'success');
      navigate('/messages');
    } catch (error) {
      addToast(error.message || 'Failed to send message', 'error');
    }
  };

  // نافذة إرسال رسالة
  const MessageModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isMessageModalOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsMessageModalOpen(false)}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <h3 className="text-xl font-bold mb-4">Send Message to {pro.name}</h3>
        <form onSubmit={handleSendMessage}>
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 mb-4 h-32 focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder={`Write your message to ${pro.name}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setIsMessageModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={messageLoading || !message.trim()}
            >
              {messageLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{pro.name} - {pro.profession} | A-List Home Pros</title>
        <meta name="description" content={`Book ${pro.name}, professional ${pro.profession.toLowerCase()} with a ${pro.rating} rating and ${pro.reviewsCount} reviews.`} />
      </Helmet>

      <div className="relative h-64 md:h-80 bg-gray-300">
        <img 
          src={pro.coverPhoto} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 -mt-16 mb-16">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 p-6">
              <div className="flex flex-col items-center md:items-start">
                <img 
                  src={pro.avatar} 
                  alt={pro.name} 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4 -mt-20"
                />
                <h1 className="text-2xl font-bold text-gray-900">{pro.name}</h1>
                <p className="text-blue-600 font-medium">{pro.profession}</p>
                
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {renderStars(pro.rating)}
                  </div>
                  <span className="ml-2 text-gray-600">{pro.rating} ({pro.reviewsCount} reviews)</span>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-6 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">Jobs Completed</p>
                    <p className="font-bold text-lg">{pro.completedJobs}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm">Hourly Rate</p>
                    <p className="font-bold text-lg">${pro.hourlyRate}</p>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{pro.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{pro.availability}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{pro.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{pro.email}</span>
                  </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                  <Link 
                    to={`/booking/${pro.id}`}
                    className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 block"
                  >
                    Book Now
                  </Link>
                  <button 
                    onClick={openMessageModal}
                    className="w-full border border-blue-600 text-blue-600 text-center py-3 px-4 rounded-md hover:bg-blue-50 transition duration-300"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200">
              <div className="p-6">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px space-x-8">
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      Overview
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('services')}
                    >
                      Services
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      Reviews
                    </button>
                    <button
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'gallery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      onClick={() => setActiveTab('gallery')}
                    >
                      Gallery
                    </button>
                  </nav>
                </div>
                
                <div className="py-6">
                  {activeTab === 'overview' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">About {pro.name}</h2>
                      <p className="text-gray-700 mb-6">{pro.bio}</p>
                      
                      <h3 className="text-lg font-semibold mb-3">Certifications</h3>
                      <ul className="mb-6 space-y-1">
                        {pro.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {activeTab === 'services' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Services Offered</h2>
                      <p className="text-gray-700 mb-6">
                        Browse through the range of professional services offered by {pro.name}.
                      </p>
                      
                      <div className="space-y-4">
                        {pro.services.map((service) => (
                          <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{service.name}</h3>
                                <p className="text-gray-600 mt-1">{service.description}</p>
                                <p className="text-gray-500 text-sm mt-2">Duration: {service.duration}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">${service.price}</p>
                                <Link 
                                  to={`/booking/${pro.id}?service=${service.id}`}
                                  className="mt-2 inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition duration-300"
                                >
                                  Book
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Customer Reviews</h2>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {renderStars(pro.rating)}
                          </div>
                          <span className="font-semibold">{pro.rating} out of 5</span>
                        </div>
                      </div>
                      
                      {reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-6">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                  <img 
                                    src={review.user_avatar || "https://randomuser.me/api/portraits/women/44.jpg"} 
                                    alt={review.user_name} 
                                    className="w-10 h-10 rounded-full mr-3"
                                  />
                                  <div>
                                    <p className="font-semibold">{review.user_name}</p>
                                    <p className="text-gray-500 text-sm">{new Date(review.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              <p className="mt-3 text-gray-700">{review.comment}</p>
                              {review.response && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm font-semibold">Response from {pro.name}:</p>
                                  <p className="text-sm text-gray-700 mt-1">{review.response}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">No reviews yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'gallery' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Work Gallery</h2>
                      <p className="text-gray-700 mb-6">
                        Browse through photos of {pro.name}'s past work and completed projects.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {pro.gallery.map((image, index) => (
                          <div key={index} className="rounded-lg overflow-hidden h-40 bg-gray-200">
                            <img 
                              src={image} 
                              alt={`Project ${index + 1}`} 
                              className="w-full h-full object-cover hover:opacity-90 transition duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة التواصل مع المحترف */}
      <MessageModal />
    </>
  );
};

export default ProProfilePage; 