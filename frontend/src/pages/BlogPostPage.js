import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaClock, FaUser, FaCalendarAlt, FaFolder, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaPinterest } from 'react-icons/fa';

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, fetch post details from API
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Sample post data based on ID
          const dummyPosts = [
            {
              id: 1,
              title: "How to Choose the Right Plumber for Your Home",
              excerpt: "Important tips for choosing a professional and reliable plumber to fix your plumbing issues without wasting money and time.",
              content: `
                <p>Choosing the right plumber for your home is a critical decision that can impact both the short-term resolution of your plumbing issues and the long-term integrity of your home's plumbing system. A quality plumber not only fixes immediate problems but also helps prevent future issues through proper maintenance and high-quality workmanship.</p>
                
                <h2>Why Selecting the Right Plumber Matters</h2>
                <p>When it comes to your home's plumbing system, professional expertise is non-negotiable. Poor plumbing work can lead to water damage, mold growth, and structural issues that may cost thousands of dollars to repair. Additionally, ongoing plumbing problems can disrupt your daily life and decrease your property value over time.</p>
                
                <h2>Key Factors to Consider When Choosing a Plumber</h2>
                
                <h3>1. Licensing and Certification</h3>
                <p>Always verify that your plumber holds the proper licenses required by your state or local municipality. Licensed plumbers have undergone the necessary training and meet industry standards for quality and safety. Ask to see their license number and validate it through your local licensing board.</p>
                
                <h3>2. Insurance Coverage</h3>
                <p>Ensure your plumber carries both liability insurance and workers' compensation. This protects you from potential liability if accidents or damage occur during the plumbing work.</p>
                
                <h3>3. Experience and Specialization</h3>
                <p>Consider the plumber's experience, particularly with issues similar to yours. Some plumbers specialize in specific areas such as:</p>
                <ul>
                  <li>Residential vs. commercial plumbing</li>
                  <li>New construction installation</li>
                  <li>Repair and maintenance</li>
                  <li>Water heater installation</li>
                  <li>Sewer and drain cleaning</li>
                </ul>
                
                <h3>4. References and Reviews</h3>
                <p>Research online reviews on platforms like Google, Yelp, or the Better Business Bureau. Don't hesitate to ask the plumber for references from previous customers. A reputable plumber will be happy to provide testimonials from satisfied clients.</p>
                
                <h3>5. Cost Transparency</h3>
                <p>Get detailed written estimates from multiple plumbers before making your decision. Be wary of significantly low bids, as they might indicate subpar materials or workmanship. Ask about:</p>
                <ul>
                  <li>Hourly rates vs. flat fees</li>
                  <li>Additional charges for emergency services</li>
                  <li>Cost of parts and materials</li>
                  <li>Payment terms and methods</li>
                </ul>
                
                <h3>6. Warranty and Guarantees</h3>
                <p>Quality plumbers stand behind their work with substantial warranties on both labor and parts. Understand what's covered, for how long, and what the process is if you need to use the warranty.</p>
                
                <h2>Red Flags to Watch For</h2>
                <ul>
                  <li>Reluctance to provide license information</li>
                  <li>No physical business address</li>
                  <li>Requesting full payment upfront</li>
                  <li>Pressuring you to make immediate decisions</li>
                  <li>No written contracts or estimates</li>
                  <li>Poor communication or unprofessional behavior</li>
                </ul>
                
                <h2>Finding Plumbers in Your Area</h2>
                <p>Use the following resources to find reputable plumbers in your area:</p>
                <ul>
                  <li>Recommendations from friends, family, and neighbors</li>
                  <li>Online directories like Angie's List, HomeAdvisor, or Thumbtack</li>
                  <li>Local plumbing supply stores</li>
                  <li>Your home insurance provider's recommended vendors</li>
                  <li>Local trade associations</li>
                </ul>
                
                <h2>Questions to Ask Before Hiring</h2>
                <ol>
                  <li>How long have you been in business?</li>
                  <li>Are you licensed and insured?</li>
                  <li>Do you offer 24/7 emergency services?</li>
                  <li>What warranties do you provide?</li>
                  <li>Will you provide a written estimate before beginning work?</li>
                  <li>Do you clean up after completing the job?</li>
                  <li>What is your timeline for completing this project?</li>
                </ol>
                
                <h2>Conclusion</h2>
                <p>Taking the time to choose the right plumber can save you money, stress, and potential damage to your home in the long run. By considering licensing, insurance, experience, reviews, cost transparency, and warranties, you can make an informed decision that ensures your plumbing needs are met professionally and efficiently.</p>
                
                <p>Remember that the cheapest option isn't always the best value. Investing in quality plumbing services now can prevent costly repairs later and provide peace of mind for years to come.</p>
              `,
              imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
              category: "Home Tips",
              date: "May 10, 2023",
              readTime: "7 min",
              author: {
                name: "John Smith",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                role: "Home Maintenance Expert",
                bio: "John has over 15 years of experience in home maintenance and renovation. He specializes in plumbing, electrical, and HVAC systems."
              },
              tags: ["Plumbing", "Home Maintenance", "Hiring Professionals", "Cost Saving"]
            },
            {
              id: 2,
              title: "10 Common Electrical Faults and How to Fix Them",
              excerpt: "Learn about the most common electrical problems in homes and how to safely handle them before the electrician arrives.",
              content: `<p>This is just placeholder content for the demonstration. In a real application, this would contain the full article content.</p>`,
              imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
              category: "Maintenance",
              date: "June 2, 2023",
              readTime: "5 min",
              author: {
                name: "Emily Johnson",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                role: "Electrical Engineer",
                bio: "Emily is a certified electrical engineer with 10 years of experience in residential and commercial electrical systems."
              },
              tags: ["Electrical", "DIY", "Home Repair", "Safety"]
            }
          ];
          
          const foundPost = dummyPosts.find(p => p.id === parseInt(id, 10));
          
          if (foundPost) {
            setPost(foundPost);
            
            // Get related posts (in real app, would be based on category or tags)
            const related = dummyPosts.filter(p => p.id !== parseInt(id, 10) && p.category === foundPost.category);
            setRelatedPosts(related);
          } else {
            setError('Blog post not found');
          }
          
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load blog post');
        setLoading(false);
      }
    };

    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-lg text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Blog post not found'}</p>
        </div>
        <button 
          onClick={() => navigate('/blog')}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | A-List Home Pros Blog</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">›</span>
              <Link to="/blog" className="hover:text-blue-600">Blog</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{post.title}</span>
            </div>

            {/* Header */}
            <article className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Featured Image */}
              <div className="h-64 md:h-96 w-full overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-10">
                {/* Category and Meta */}
                <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center mr-6 mb-2">
                    <FaFolder className="mr-2 text-blue-600" />
                    <Link to={`/blog?category=${post.category}`} className="text-blue-600 hover:underline">
                      {post.category}
                    </Link>
                  </div>
                  <div className="flex items-center mr-6 mb-2">
                    <FaCalendarAlt className="mr-2 text-gray-500" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center mr-6 mb-2">
                    <FaClock className="mr-2 text-gray-500" />
                    <span>{post.readTime} read</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaUser className="mr-2 text-gray-500" />
                    <span>{post.author.name}</span>
                  </div>
                </div>
                
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
                
                {/* Article Content */}
                <div 
                  className="prose max-w-none prose-lg prose-blue mb-8"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                {/* Tags */}
                <div className="pt-6 border-t border-gray-200 mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Link 
                        key={tag} 
                        to={`/blog?tag=${tag}`} 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full transition duration-300"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Share */}
                <div className="pt-6 border-t border-gray-200 mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <FaShare className="mr-2" /> Share This Article:
                  </h3>
                  <div className="flex space-x-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaFacebook size={20} />
                    </button>
                    <button className="text-blue-400 hover:text-blue-600">
                      <FaTwitter size={20} />
                    </button>
                    <button className="text-blue-700 hover:text-blue-900">
                      <FaLinkedin size={20} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <FaPinterest size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Author Bio */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-20 h-20 rounded-full mb-4 sm:mb-0 sm:mr-6" 
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{post.author.name}</h3>
                      <p className="text-blue-600 text-sm mb-3">{post.author.role}</p>
                      <p className="text-gray-600">{post.author.bio}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedPosts.map(related => (
                    <div 
                      key={related.id} 
                      className="bg-white rounded-xl overflow-hidden shadow-md transition duration-300 hover:shadow-lg flex flex-col"
                    >
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={related.imageUrl} 
                          alt={related.title} 
                          className="w-full h-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="p-6 flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-blue-600">{related.category}</span>
                          <div className="flex items-center text-sm text-gray-500">
                            <FaClock className="mr-1 text-gray-400" size={14} />
                            <span>{related.readTime}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{related.title}</h3>
                        <p className="text-gray-600 mb-4">{related.excerpt}</p>
                        <Link 
                          to={`/blog/${related.id}`} 
                          className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800 mt-auto"
                        >
                          Read More
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* CTA */}
            <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Need Professional Help?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Connect with top-rated home service professionals in your area. Get quotes, compare profiles, and book appointments online.
              </p>
              <Link 
                to="/search" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Find a Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostPage; 