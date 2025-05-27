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
        setBlogPosts(response.data.results || []);
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
          <div className="flex justify-center items-center h-72">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && blogPosts.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isArabic ? 'مدونتنا' : 'Our Blog'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {isArabic 
              ? 'تصفح أحدث مقالاتنا ونصائحنا المفيدة للحفاظ على منزلك في أفضل حالة'
              : 'Browse our latest articles and helpful tips to keep your home in the best condition'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md transition duration-300 hover:shadow-lg">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.imageUrl || post.image_url || `https://via.placeholder.com/600x400?text=${post.title}`} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600">{post.category}</span>
                  <span className="text-sm text-gray-500">{formatDate(post.date || post.created_at)}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt || post.summary}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{post.readTime || (isArabic ? '5 دقائق للقراءة' : '5 min read')}</span>
                  <Link 
                    to={`/blog/${post.id}`} 
                    className="text-blue-600 font-medium flex items-center hover:text-blue-800"
                  >
                    {isArabic ? 'قراءة المزيد' : 'Read More'}
                    <svg className={`w-4 h-4 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            className="inline-flex items-center justify-center bg-white text-blue-600 border border-blue-600 font-medium px-6 py-3 rounded-md hover:bg-blue-50 transition duration-300"
          >
            {isArabic ? 'زيارة مدونتنا' : 'Visit Our Blog'}
            <svg className={`w-5 h-5 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection; 