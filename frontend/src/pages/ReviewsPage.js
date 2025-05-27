import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaStar, FaStarHalfAlt, FaRegStar, FaCalendarAlt, FaThumbsUp, FaFlag } from 'react-icons/fa';

const ReviewsPage = () => {
  const { proId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filterRating, setFilterRating] = useState(0);
  const [sort, setSort] = useState('newest');
  const [userReview, setUserReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    service: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  
  // Mock professional data - wrapped in useMemo to prevent recreation on each render
  const professionalsData = useMemo(() => ({
    "1": {
      id: "1",
      name: "John Smith",
      profession: "Plumber",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.8,
      reviewsCount: 127,
      services: ["Pipe Repair", "Drain Cleaning", "Fixture Installation"]
    },
    "2": {
      id: "2",
      name: "Robert Johnson",
      profession: "Electrician",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 4.6,
      reviewsCount: 98,
      services: ["Wiring", "Electrical Repairs", "Light Installation"]
    }
  }), []);
  
  // Mock reviews data - wrapped in useMemo to prevent recreation on each render
  const mockReviews = useMemo(() => [
    {
      id: 1,
      proId: "1",
      userId: "user123",
      userName: "Michael Brown",
      userAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 5,
      title: "Excellent service, fixed my leaky pipe quickly",
      comment: "John arrived on time and quickly diagnosed the issue with my leaking pipe. He fixed it within an hour and cleaned up afterward. Very professional and knowledgeable. Would definitely recommend!",
      service: "Pipe Repair",
      date: "2023-05-15",
      helpfulCount: 12,
      verified: true
    },
    {
      id: 2,
      proId: "1",
      userId: "user456",
      userName: "Sarah Wilson",
      userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
      rating: 4,
      title: "Good job installing new fixtures",
      comment: "John did a good job installing my new bathroom fixtures. He was professional and completed the work in a reasonable amount of time. Only giving 4 stars because there was a small issue with one fixture that he had to come back to fix, but he did resolve it promptly.",
      service: "Fixture Installation",
      date: "2023-04-22",
      helpfulCount: 8,
      verified: true
    },
    {
      id: 3,
      proId: "1",
      userId: "user789",
      userName: "David Miller",
      userAvatar: "https://randomuser.me/api/portraits/men/52.jpg",
      rating: 5,
      title: "Very thorough drain cleaning",
      comment: "My kitchen sink was completely clogged and John came to the rescue! He was very thorough in his work and explained what caused the clog and how to prevent it in the future. My sink is now draining perfectly. Highly recommend his services.",
      service: "Drain Cleaning",
      date: "2023-03-10",
      helpfulCount: 15,
      verified: true
    },
    {
      id: 4,
      proId: "1",
      userId: "user101",
      userName: "Jessica Adams",
      userAvatar: "https://randomuser.me/api/portraits/women/42.jpg",
      rating: 3,
      title: "Fixed the issue but arrived late",
      comment: "John did fix my plumbing issue successfully, but he arrived almost an hour late with minimal communication about the delay. The quality of work was good, but the punctuality needs improvement.",
      service: "Pipe Repair",
      date: "2023-02-05",
      helpfulCount: 5,
      verified: true
    },
    {
      id: 5,
      proId: "2",
      userId: "user202",
      userName: "Thomas Jackson",
      userAvatar: "https://randomuser.me/api/portraits/men/62.jpg",
      rating: 5,
      title: "Perfect electrical work",
      comment: "Robert did an amazing job rewiring my living room. He was punctual, professional, and very knowledgeable. The work was completed faster than expected and everything works perfectly. Will definitely use his services again!",
      service: "Wiring",
      date: "2023-05-20",
      helpfulCount: 10,
      verified: true
    }
  ], []);
  
  // Fetch professional and reviews data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API fetch with timeout
    setTimeout(() => {
      try {
        // If proId exists in our mock data, use it
        if (proId && professionalsData[proId]) {
          setProfessional(professionalsData[proId]);
          
          // Filter reviews for this professional
          const proReviews = mockReviews.filter(review => review.proId === proId);
          setReviews(proReviews);
          setFilteredReviews(proReviews);
          
          setLoading(false);
        } else {
          setError("Professional not found");
          setLoading(false);
        }
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    }, 800);
  }, [proId, professionalsData, mockReviews]);
  
  // Filter and sort reviews when criteria change
  useEffect(() => {
    let result = [...reviews];
    
    // Apply rating filter
    if (filterRating > 0) {
      result = result.filter(review => review.rating === filterRating);
    }
    
    // Apply sorting
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sort === 'helpful') {
      result.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }
    
    setFilteredReviews(result);
  }, [reviews, filterRating, sort]);
  
  // Generate rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };
  
  // Handle rating click for user review
  const handleRatingClick = (rating) => {
    setUserReview({...userReview, rating});
    setFormErrors({...formErrors, rating: null});
  };
  
  // Handle input change for user review form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserReview({...userReview, [name]: value});
    setFormErrors({...formErrors, [name]: null});
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (userReview.rating === 0) {
      errors.rating = "Please select a rating";
    }
    
    if (!userReview.title.trim()) {
      errors.title = "Please enter a title for your review";
    }
    
    if (!userReview.comment.trim()) {
      errors.comment = "Please enter your review";
    } else if (userReview.comment.trim().length < 10) {
      errors.comment = "Review comment should be at least 10 characters";
    }
    
    if (!userReview.service) {
      errors.service = "Please select the service you received";
    }
    
    return errors;
  };
  
  // Submit review
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create new review with generated ID
      const newReview = {
        id: reviews.length + 1,
        proId: professional.id,
        userId: "currentUser", // In a real app, this would be the logged-in user's ID
        userName: "You", // In a real app, this would be the logged-in user's name
        userAvatar: "https://randomuser.me/api/portraits/women/65.jpg", // Example avatar
        rating: userReview.rating,
        title: userReview.title,
        comment: userReview.comment,
        service: userReview.service,
        date: new Date().toISOString().split('T')[0], // Today's date
        helpfulCount: 0,
        verified: true
      };
      
      // Add new review to the list
      setReviews([newReview, ...reviews]);
      
      // Reset form
      setUserReview({
        rating: 0,
        title: '',
        comment: '',
        service: ''
      });
      
      setIsSubmitting(false);
      setShowForm(false);
      
      // Show success message (in a real app, you might use a toast notification)
      alert("Thank you for your review!");
    }, 1000);
  };
  
  // Calculate rating distribution for the bar chart
  const calculateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // For 5, 4, 3, 2, 1 stars
    
    reviews.forEach(review => {
      distribution[5 - review.rating]++;
    });
    
    return distribution;
  };
  
  // Calculate percentage for each rating
  const calculateRatingPercentage = (ratingCount) => {
    return reviews.length > 0 ? (ratingCount / reviews.length) * 100 : 0;
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
  
  const ratingDistribution = calculateRatingDistribution();
  
  return (
    <>
      <Helmet>
        <title>Reviews for {professional.name} | Service Platform</title>
        <meta name="description" content={`Read reviews for ${professional.name}, ${professional.profession} with ${professional.reviewsCount} reviews and ${professional.rating} rating.`} />
      </Helmet>
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Professional Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                <img 
                  src={professional.avatar} 
                  alt={professional.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold">{professional.name}</h1>
                  <p className="text-gray-600">{professional.profession}</p>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="flex mr-2">
                    {renderStars(professional.rating)}
                  </div>
                  <span className="text-lg font-semibold">{professional.rating}</span>
                  <span className="mx-2 text-gray-500">|</span>
                  <span>{professional.reviewsCount} reviews</span>
                </div>
                
                <Link 
                  to={`/pro/${professional.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Rating Summary</h2>
                
                <div className="flex items-center mb-6">
                  <div className="text-5xl font-bold mr-4">{professional.rating}</div>
                  <div>
                    <div className="flex mb-1">
                      {renderStars(professional.rating)}
                    </div>
                    <p className="text-gray-600">{professional.reviewsCount} reviews</p>
                  </div>
                </div>
                
                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <div className="w-12 text-sm">{star} stars</div>
                      <div className="flex-1 mx-2">
                        <div className="bg-gray-200 h-2 rounded-full">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${calculateRatingPercentage(ratingDistribution[5-star])}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-10 text-right text-sm text-gray-600">
                        {ratingDistribution[5-star]}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Write Review Button */}
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {showForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>
            </div>
            
            {/* Right Column - Reviews List and Form */}
            <div className="lg:col-span-2">
              {/* Review Form */}
              {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
                  
                  <form onSubmit={handleSubmitReview}>
                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Your Rating*</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            className="text-2xl focus:outline-none"
                          >
                            {star <= userReview.rating ? (
                              <FaStar className="text-yellow-400" />
                            ) : (
                              <FaRegStar className="text-yellow-400" />
                            )}
                          </button>
                        ))}
                      </div>
                      {formErrors.rating && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>
                      )}
                    </div>
                    
                    {/* Service */}
                    <div className="mb-4">
                      <label htmlFor="service" className="block text-gray-700 mb-2">
                        Service Received*
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={userReview.service}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a service</option>
                        {professional.services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                      {formErrors.service && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.service}</p>
                      )}
                    </div>
                    
                    {/* Title */}
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-gray-700 mb-2">
                        Review Title*
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={userReview.title}
                        onChange={handleInputChange}
                        placeholder="Summarize your experience"
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formErrors.title && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                      )}
                    </div>
                    
                    {/* Comment */}
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-gray-700 mb-2">
                        Your Review*
                      </label>
                      <textarea
                        id="comment"
                        name="comment"
                        value={userReview.comment}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Describe your experience with this professional"
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      ></textarea>
                      {formErrors.comment && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.comment}</p>
                      )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
              
              {/* Reviews Filter */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold mb-2 sm:mb-0">
                    {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Filter by rating */}
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(Number(e.target.value))}
                      className="px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                    
                    {/* Sort reviews */}
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Reviews List */}
              <div className="space-y-4">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between mb-3">
                        <div className="flex">
                          <div className="mr-2 flex">
                            {renderStars(review.rating)}
                          </div>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        Service: <span className="font-medium">{review.service}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            src={review.userAvatar} 
                            alt={review.userName}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span className="font-medium">{review.userName}</span>
                        </div>
                        
                        <div className="flex space-x-4">
                          <button className="text-gray-500 hover:text-blue-600 flex items-center">
                            <FaThumbsUp className="mr-1" /> 
                            <span>{review.helpfulCount}</span>
                          </button>
                          <button className="text-gray-500 hover:text-red-600 flex items-center">
                            <FaFlag className="mr-1" /> 
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">No reviews match your current filters.</p>
                    {filterRating > 0 && (
                      <button 
                        onClick={() => setFilterRating(0)}
                        className="text-blue-600 hover:underline mt-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewsPage; 