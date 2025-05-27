import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">A-List Home Pros</h3>
            <p className="text-gray-400 dark:text-gray-400 mb-4">
              Connecting homeowners with top-rated professional contractors for all your home service needs.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                <FaLinkedin size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Find a Pro</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Services</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white dark:hover:text-blue-400">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Contact Us</Link>
              </li>
              <li>
                <Link to="/register?type=pro" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Join as a Pro</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Blog</Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Help Center</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white dark:hover:text-blue-400">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Refund Policy</Link>
              </li>
              <li>
                <Link to="/licensing" className="text-gray-400 hover:text-white dark:hover:text-blue-400">Licensing</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-blue-500 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">
                  1234 Main Street,<br />
                  Suite 500,<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
                <a href="tel:+1-800-123-4567" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                  (800) 123-4567
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
                <a href="mailto:info@alisthomepros.com" className="text-gray-400 hover:text-white dark:hover:text-blue-400">
                  info@alisthomepros.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-medium mb-2">Subscribe to our newsletter</h4>
              <p className="text-gray-400">Stay updated with the latest news and special offers</p>
            </div>
            <div className="w-full md:w-1/3">
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright and Additional Links */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} A-List Home Pros. All rights reserved.</p>
          <div className="mt-2">
            <span>Designed and developed with ❤️ by Your Company</span>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link to="/sitemap" className="hover:text-white dark:hover:text-blue-400">Sitemap</Link>
            <Link to="/accessibility" className="hover:text-white dark:hover:text-blue-400">Accessibility</Link>
            <Link to="/careers" className="hover:text-white dark:hover:text-blue-400">Careers</Link>
            <Link to="/api-docs" className="hover:text-white dark:hover:text-blue-400">API</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 