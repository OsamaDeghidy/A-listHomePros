import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaFilter, FaClock, FaTag } from 'react-icons/fa';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // In a real app, fetch blog posts from API
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        // Simulating API call with timeout
        setTimeout(() => {
          const dummyPosts = [
            {
              id: 1,
              title: "How to Choose the Right Plumber for Your Home",
              excerpt: "Important tips for choosing a professional and reliable plumber to fix your plumbing issues without wasting money and time.",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl.",
              imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              category: "Home Tips",
              date: "May 10, 2023",
              readTime: "7 min",
              author: {
                name: "John Smith",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                role: "Home Maintenance Expert"
              }
            },
            {
              id: 2,
              title: "10 Common Electrical Faults and How to Fix Them",
              excerpt: "Learn about the most common electrical problems in homes and how to safely handle them before the electrician arrives.",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl.",
              imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              category: "Maintenance",
              date: "June 2, 2023",
              readTime: "5 min",
              author: {
                name: "Emily Johnson",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                role: "Electrical Engineer"
              }
            },
            {
              id: 3,
              title: "Tips for Renovating Your Home on a Budget",
              excerpt: "Creative ideas to change your home decor and give it a new look without spending a lot of money.",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl.",
              imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              category: "Decor",
              date: "July 17, 2023",
              readTime: "8 min",
              author: {
                name: "Sarah Wilson",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                role: "Interior Designer"
              }
            },
            {
              id: 4,
              title: "How to Maintain Your HVAC System Year-Round",
              excerpt: "Proper maintenance tips to extend the life of your heating and cooling systems and improve energy efficiency.",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl.",
              imageUrl: "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              category: "Maintenance",
              date: "August 5, 2023",
              readTime: "6 min",
              author: {
                name: "Michael Brown",
                avatar: "https://randomuser.me/api/portraits/men/45.jpg",
                role: "HVAC Specialist"
              }
            },
            {
              id: 5,
              title: "The Ultimate Guide to Smart Home Devices",
              excerpt: "Explore the best smart home technologies that can make your life easier and more comfortable.",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl.",
              imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              category: "Smart Home",
              date: "September 10, 2023",
              readTime: "10 min",
              author: {
                name: "David Chen",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
                role: "Tech Consultant"
              }
            },
            {
              id: 6,
              title: "Essential Tools Every Homeowner Should Have",
              excerpt: "A comprehensive list of tools that will help you handle most common home repairs and maintenance tasks.",
              content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl. Sed euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl, nec ultricies nisl nisl sit amet nisl.",
              imageUrl: "https://images.unsplash.com/photo-1540104247507-43c3cafdf178?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
              category: "DIY",
              date: "October 3, 2023",
              readTime: "9 min",
              author: {
                name: "Robert Wilson",
                avatar: "https://randomuser.me/api/portraits/men/78.jpg",
                role: "DIY Expert"
              }
            }
          ];

          // Extract unique categories
          const uniqueCategories = [...new Set(dummyPosts.map(post => post.category))];
          setCategories(uniqueCategories);
          
          setBlogPosts(dummyPosts);
          setFilteredPosts(dummyPosts);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load blog posts');
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  // Filter posts based on search term and category
  useEffect(() => {
    let results = blogPosts;
    
    if (searchTerm) {
      results = results.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      results = results.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(results);
  }, [searchTerm, selectedCategory, blogPosts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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
        <title>Blog | A-List Home Pros</title>
        <meta name="description" content="Read our latest articles and guides about home maintenance, repair tips, and finding the right professionals for your home projects." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-blue-100">
              Expert advice, tips, and insights for your home
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-2/3 relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="w-full md:w-auto flex items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-300"
                >
                  <FaFilter className="text-gray-500" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Blog Posts Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory === 'all' ? 'Latest Articles' : `${selectedCategory} Articles`}
              {searchTerm && ` matching "${searchTerm}"`}
            </h2>

            {filteredPosts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-xl overflow-hidden shadow-md transition duration-300 hover:shadow-lg flex flex-col"
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-blue-600">{post.category}</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="mr-1 text-gray-400" size={14} />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{post.title}</h3>
                      <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center">
                          <img 
                            src={post.author.avatar} 
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{post.author.name}</p>
                            <p className="text-gray-500">{post.date}</p>
                          </div>
                        </div>
                        <Link 
                          to={`/blog/${post.id}`} 
                          className="text-blue-600 font-medium flex items-center hover:text-blue-800"
                        >
                          Read More
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get the latest home maintenance tips, DIY guides, and professional advice delivered to your inbox
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                By subscribing you agree to our Privacy Policy. You can unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage; 