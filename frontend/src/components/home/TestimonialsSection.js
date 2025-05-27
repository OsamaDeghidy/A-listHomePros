import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      profession: "Homeowner",
      image: "https://randomuser.me/api/portraits/women/11.jpg",
      text: "I've used A-List Home Pros for both plumbing and electrical work. The professionals arrived on time, were courteous, and completed the job perfectly. Highly recommended!",
      rating: 5,
      service: "Plumbing & Electrical"
    },
    {
      id: 2,
      name: "Michael Thompson",
      profession: "Real Estate Agent",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "As a real estate agent, I regularly recommend A-List Home Pros to my clients. Their reliable service and quality workmanship have never disappointed. A trustworthy platform for home services.",
      rating: 5,
      service: "Multiple Services"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      profession: "Apartment Manager",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Managing multiple properties requires dependable contractors. A-List Home Pros has simplified my work by connecting me with skilled professionals who deliver quality service every time.",
      rating: 4,
      service: "Maintenance"
    },
    {
      id: 4,
      name: "David Chen",
      profession: "Homeowner",
      image: "https://randomuser.me/api/portraits/men/46.jpg",
      text: "The carpenter I hired through this platform did an outstanding job on my custom bookshelves. Fair pricing, excellent craftsmanship, and professional service from start to finish.",
      rating: 5,
      service: "Carpentry"
    }
  ];

  // Function to render the stars based on rating
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

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read testimonials from satisfied customers who have found reliable professionals through our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <blockquote className="text-gray-700 mb-6 flex-grow">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center mt-auto">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600 mr-2">{testimonial.profession}</p>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {testimonial.service}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 font-medium mb-6">
            Join thousands of satisfied customers who have found reliable home service professionals.
          </p>
          <button className="bg-blue-600 text-white font-medium px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300">
            Find Your Pro Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 