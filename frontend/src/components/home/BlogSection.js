import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const BlogSection = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const locale = isArabic ? ar : enUS;

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await blogService.getFeaturedPosts(3);
        
        console.log('Blog Posts API Response:', response.data);
        
        if (response.data.results && response.data.results.length > 0) {
          setBlogPosts(response.data.results);
        } else if (response.data && Array.isArray(response.data)) {
          setBlogPosts(response.data);
        } else {
          // If no results or unexpected format, throw error to use fallback data
          throw new Error('No blog posts found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(isArabic ? 'فشل في تحميل مقالات المدونة' : 'Failed to load blog posts');
        setLoading(false);
        
        // بيانات احتياطية في حالة فشل API
        setBlogPosts([
          {
            id: 1,
            title: isArabic 
              ? "كيفية اختيار السباك المناسب لمنزلك" 
              : "How to Choose the Right Plumber for Your Home",
            excerpt: isArabic 
              ? "نصائح مهمة لاختيار سباك محترف وموثوق لإصلاح مشاكل السباكة دون إضاعة المال والوقت." 
              : "Important tips for choosing a professional and reliable plumber to fix your plumbing issues without wasting money and time.",
            imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            category: isArabic ? "نصائح منزلية" : "Home Tips",
            date: new Date("2023-05-10").toISOString(),
            readTime: isArabic ? "7 دقائق" : "7 min"
          },
          {
            id: 2,
            title: isArabic 
              ? "10 مشكلات كهربائية شائعة وكيفية إصلاحها" 
              : "10 Common Electrical Faults and How to Fix Them",
            excerpt: isArabic 
              ? "تعرف على أكثر المشكلات الكهربائية شيوعًا في المنازل وكيفية التعامل معها بأمان قبل وصول الكهربائي." 
              : "Learn about the most common electrical problems in homes and how to safely handle them before the electrician arrives.",
            imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            category: isArabic ? "صيانة" : "Maintenance",
            date: new Date("2023-06-02").toISOString(),
            readTime: isArabic ? "5 دقائق" : "5 min"
          },
          {
            id: 3,
            title: isArabic 
              ? "نصائح لتجديد منزلك بميزانية محدودة" 
              : "Tips for Renovating Your Home on a Budget",
            excerpt: isArabic 
              ? "أفكار إبداعية لتغيير ديكور منزلك ومنحه مظهرًا جديدًا دون إنفاق الكثير من المال." 
              : "Creative ideas to change your home decor and give it a new look without spending a lot of money.",
            imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            category: isArabic ? "ديكور" : "Decor",
            date: new Date("2023-07-17").toISOString(),
            readTime: isArabic ? "8 دقائق" : "8 min"
          }
        ]);
      }
    };
    
    fetchBlogPosts();
  }, [isArabic]);
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PP', { locale });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center items-center h-72">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">{isArabic ? 'جاري تحميل المقالات...' : 'Loading blog posts...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && blogPosts.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block p-4 rounded-lg bg-red-50 border border-red-100 mb-4">
              <svg className="w-6 h-6 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" viewBox="0 0 800 800">
          <path fill="#4B5563" d="M400,100 C500,100 600,150 600,250 C600,350 550,400 500,450 C450,500 400,550 400,650 C400,750 450,800 400,800 C350,800 300,750 300,650 C300,550 250,500 200,450 C150,400 100,350 100,250 C100,150 200,100 300,100 L400,100 Z" />
        </svg>
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 relative inline-block">
            {isArabic ? 'مدونتنا' : 'Our Blog'}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"></span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isArabic 
              ? 'تصفح أحدث مقالاتنا ونصائحنا المفيدة للحفاظ على منزلك في أفضل حالة'
              : 'Browse our latest articles and helpful tips to keep your home in the best condition'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md transition duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-102">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.imageUrl || post.image_url || `https://via.placeholder.com/600x400?text=${post.title}`} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{post.category}</span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(post.date || post.created_at)}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition-colors duration-300">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt || post.summary}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.readTime || (isArabic ? '5 دقائق للقراءة' : '5 min read')}
                  </span>
                  <Link 
                    to={`/blog/${post.id}`} 
                    className="text-blue-600 font-medium flex items-center hover:text-blue-800 group"
                  >
                    {isArabic ? 'قراءة المزيد' : 'Read More'}
                    <svg className={`w-4 h-4 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'} transition-transform duration-300 group-hover:${isArabic ? 'translate-x-[-3px]' : 'translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/blog" 
            className="inline-flex items-center justify-center bg-white text-blue-600 border border-blue-600 font-medium px-6 py-3 rounded-md hover:bg-blue-50 transition duration-300 shadow-md hover:shadow-lg group"
          >
            {isArabic ? 'زيارة مدونتنا' : 'Visit Our Blog'}
            <svg className={`w-5 h-5 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'} transition-transform duration-300 group-hover:${isArabic ? 'translate-x-[-3px]' : 'translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection; 