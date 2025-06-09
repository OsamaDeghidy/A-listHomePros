import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useDarkMode } from '../../hooks/useDarkMode';
import Logo from '../../assets/Logo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const { language } = useLanguage();
  const { isAuthenticated, isProfessional } = useAuth();
  const { isDarkMode } = useDarkMode();
  
  const currentYear = new Date().getFullYear();
  const isArabic = language === 'ar';

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSubscribeLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubscribeLoading(false);
      setEmail('');
      // You can add toast notification here
    }, 1000);
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const quickLinks = [
    { 
      label: isArabic ? 'البحث عن محترف' : 'Find a Pro', 
      path: '/search' 
    },
    { 
      label: isArabic ? 'الخدمات' : 'Services', 
      path: '/services' 
    },
    { 
      label: isArabic ? 'من نحن' : 'About Us', 
      path: '/about' 
    },
    { 
      label: isArabic ? 'اتصل بنا' : 'Contact Us', 
      path: '/contact' 
    },
    { 
      label: isArabic ? 'انضم كمحترف' : 'Join as a Pro', 
      path: '/register?type=pro' 
    },
    { 
      label: isArabic ? 'المدونة' : 'Blog', 
      path: '/blog' 
    },
    { 
      label: isArabic ? 'مركز المساعدة' : 'Help Center', 
      path: '/help' 
    },
    { 
      label: isArabic ? 'الأسئلة الشائعة' : 'FAQ', 
      path: '/faq' 
    }
  ];

  const legalLinks = [
    { 
      label: isArabic ? 'شروط الخدمة' : 'Terms of Service', 
      path: '/terms' 
    },
    { 
      label: isArabic ? 'سياسة الخصوصية' : 'Privacy Policy', 
      path: '/privacy' 
    },
    { 
      label: isArabic ? 'سياسة ملفات الكوكيز' : 'Cookie Policy', 
      path: '/cookie-policy' 
    },
    { 
      label: isArabic ? 'سياسة الاسترداد' : 'Refund Policy', 
      path: '/refund-policy' 
    },
    { 
      label: isArabic ? 'التراخيص' : 'Licensing', 
      path: '/licensing' 
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' }
  ];

  return (
    <motion.footer 
      className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white ${isArabic ? 'rtl' : 'ltr'}`}
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <motion.div variants={itemVariants}>
            <div className="mb-4">
              <Logo className="h-10 w-auto mb-4" />
            </div>
            <p className="text-gray-400 dark:text-gray-400 mb-4 leading-relaxed">
              {isArabic 
                ? 'نربط أصحاب المنازل بأفضل المقاولين المحترفين لجميع احتياجات الخدمات المنزلية'
                : 'Connecting homeowners with top-rated professional contractors for all your home service needs.'
              }
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon size={20} />
                    <span className="sr-only">{social.label}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {isArabic ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-gradient bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {isArabic ? 'الشؤون القانونية' : 'Legal'}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Quick Actions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-gradient bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start group">
                <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400 mt-1 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 text-sm">
                  {isArabic ? (
                    <>1234 الشارع الرئيسي،<br />جناح 500،<br />نيويورك، نيويورك 10001</>
                  ) : (
                    <>1234 Main Street,<br />Suite 500,<br />New York, NY 10001</>
                  )}
                </span>
              </li>
              <li className="flex items-center group">
                <FaPhone className="text-blue-500 dark:text-blue-400 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a 
                  href="tel:+1-800-123-4567" 
                  className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors"
                >
                  (800) 123-4567
                </a>
              </li>
              <li className="flex items-center group">
                <FaEnvelope className="text-blue-500 dark:text-blue-400 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a 
                  href="mailto:info@alisthomepros.com" 
                  className="text-gray-400 hover:text-white dark:hover:text-blue-400 transition-colors"
                >
                  info@alisthomepros.com
                </a>
              </li>
            </ul>

            {/* Quick Dashboard Access */}
            {isAuthenticated && (
              <div className="mt-4">
                <Link
                  to={isProfessional ? '/pro-dashboard' : '/dashboard'}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {isArabic ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Newsletter Subscription */}
        <motion.div 
          className="border-t border-gray-800 dark:border-gray-800 mt-12 pt-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left rtl:md:text-right">
              <h4 className="text-lg font-medium mb-2">
                {isArabic ? 'اشترك في نشرتنا الإخبارية' : 'Subscribe to our newsletter'}
              </h4>
              <p className="text-gray-400">
                {isArabic ? 'ابق على اطلاع بآخر الأخبار والعروض الخاصة' : 'Stay updated with the latest news and special offers'}
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isArabic ? 'عنوان بريدك الإلكتروني' : 'Your email address'}
                  className={`px-4 py-2 w-full ${isArabic ? 'rounded-r-md' : 'rounded-l-md'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-300`}
                  required
                  disabled={subscribeLoading}
                />
                <motion.button 
                  type="submit"
                  disabled={subscribeLoading}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 ${isArabic ? 'rounded-l-md' : 'rounded-r-md'} transition-all disabled:opacity-50 flex items-center`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {subscribeLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FaPaperPlane />
                  )}
                  <span className="ml-2 rtl:ml-0 rtl:mr-2">
                    {isArabic ? 'اشترك' : 'Subscribe'}
                  </span>
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Copyright and Additional Links */}
        <motion.div 
          className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          <p className="mb-2">
            © {currentYear} {isArabic ? 'قائمة المنزل للمحترفين. جميع الحقوق محفوظة.' : 'A-List Home Pros. All rights reserved.'}
          </p>
          <div className="mb-4">
            <span>
              {isArabic ? 'تم التصميم والتطوير بـ ❤️ من قبل شركتك' : 'Designed and developed with ❤️ by Your Company'}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: isArabic ? 'خريطة الموقع' : 'Sitemap', path: '/sitemap' },
              { label: isArabic ? 'إمكانية الوصول' : 'Accessibility', path: '/accessibility' },
              { label: isArabic ? 'الوظائف' : 'Careers', path: '/careers' },
              { label: isArabic ? 'واجهة برمجة التطبيقات' : 'API', path: '/api-docs' }
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="hover:text-white dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer; 