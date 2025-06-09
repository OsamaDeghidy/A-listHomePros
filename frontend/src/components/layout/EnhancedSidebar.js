import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTachometerAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaUsers,
  FaBriefcase,
  FaClock,
  FaStar,
  FaCreditCard,
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaQuestionCircle,
  FaChartLine,
  FaClipboardList,
  FaDollarSign,
  FaProjectDiagram,
  FaHandshake,
  FaUserTie,
  FaToolbox,
  FaHardHat,
  FaSearch,
  FaFileContract,
  FaTasks,
  FaMapMarkerAlt,
  FaHistory,
  FaShieldAlt,
  FaCertificate,
  FaWallet,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaBuilding,
  FaUserCog
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

const EnhancedSidebar = ({ sidebarOpen, onLogout }) => {
  const { currentUser, userRole } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['main']);
  
  const isArabic = language === 'ar';

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // تحديد نوع المستخدم والأدوار
  const getUserRoleInfo = () => {
    // يمكن تحديد الدور من currentUser.role أو userRole
    const role = currentUser?.role || userRole || 'client';
    
    switch (role) {
      case 'specialist':
        return {
          type: 'specialist',
          name: isArabic ? 'متخصص A-List' : 'A-List Specialist',
          description: isArabic ? 'مستشار ومدير مشاريع' : 'Consultant & Project Manager',
          icon: FaUserTie,
          color: 'from-purple-500 to-purple-700',
          badgeColor: 'bg-purple-100 text-purple-800'
        };
      case 'contractor':
        return {
          type: 'contractor',
          name: isArabic ? 'مقدم خدمة Home Pro' : 'Home Pro',
          description: isArabic ? 'مقدم خدمات منزلية' : 'Home Service Provider',
          icon: FaToolbox,
          color: 'from-blue-500 to-blue-700',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'crew':
        return {
          type: 'crew',
          name: isArabic ? 'عضو طاقم' : 'Crew Member',
          description: isArabic ? 'عامل ماهر' : 'Skilled Worker',
          icon: FaHardHat,
          color: 'from-green-500 to-green-700',
          badgeColor: 'bg-green-100 text-green-800'
        };
      default:
        return {
          type: 'client',
          name: isArabic ? 'عميل' : 'Client',
          description: isArabic ? 'طالب خدمة' : 'Service Seeker',
          icon: FaUser,
          color: 'from-gray-500 to-gray-700',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const roleInfo = getUserRoleInfo();

  // تكوين القوائم حسب الدور
  const getNavigationConfig = () => {
    const baseUrl = roleInfo.type === 'client' ? '/dashboard' : `/${roleInfo.type}-dashboard`;
    
    switch (roleInfo.type) {
      case 'specialist':
        return {
          main: [
            {
              name: isArabic ? 'لوحة التحكم' : 'Dashboard',
              path: `${baseUrl}`,
              icon: FaTachometerAlt,
              color: 'text-blue-600',
              description: isArabic ? 'نظرة عامة على أعمالك' : 'Business overview'
            },
            {
              name: isArabic ? 'طلبات العملاء' : 'Client Requests',
              path: `${baseUrl}/requests`,
              icon: FaClipboardList,
              color: 'text-green-600',
              description: isArabic ? 'طلبات الخدمة الواردة' : 'Incoming service requests'
            },
            {
              name: isArabic ? 'إدارة المشاريع' : 'Project Management',
              path: `${baseUrl}/projects`,
              icon: FaProjectDiagram,
              color: 'text-purple-600',
              description: isArabic ? 'تنسيق وإدارة المشاريع' : 'Coordinate and manage projects'
            },
            {
              name: isArabic ? 'ترشيح المحترفين' : 'Recommend Professionals',
              path: `${baseUrl}/recommendations`,
              icon: FaHandshake,
              color: 'text-orange-600',
              description: isArabic ? 'ترشيح Home Pros والطاقم' : 'Recommend Home Pros and Crew'
            }
          ],
          schedule: [
            {
              name: isArabic ? 'التقويم' : 'Calendar',
              path: `${baseUrl}/calendar`,
              icon: FaCalendarAlt,
              color: 'text-green-600',
              description: isArabic ? 'مواعيد ومهام المشاريع' : 'Project appointments and tasks'
            },
            {
              name: isArabic ? 'الأوقات المتاحة' : 'Availability',
              path: `${baseUrl}/availability`,
              icon: FaClock,
              color: 'text-cyan-600',
              description: isArabic ? 'إدارة أوقات العمل' : 'Manage working hours'
            }
          ],
          communication: [
            {
              name: isArabic ? 'الرسائل' : 'Messages',
              path: `${baseUrl}/messages`,
              icon: FaEnvelope,
              color: 'text-indigo-600',
              description: isArabic ? 'التواصل مع العملاء والمحترفين' : 'Communicate with clients and professionals'
            },
            {
              name: isArabic ? 'الاستشارات' : 'Consultations',
              path: `${baseUrl}/consultations`,
              icon: FaUserCog,
              color: 'text-pink-600',
              description: isArabic ? 'جلسات الاستشارة' : 'Consultation sessions'
            }
          ],
          business: [
            {
              name: isArabic ? 'الأرباح' : 'Earnings',
              path: `${baseUrl}/earnings`,
              icon: FaDollarSign,
              color: 'text-emerald-600',
              description: isArabic ? 'أرباح الاستشارات والمشاريع' : 'Consultation and project earnings'
            },
            {
              name: isArabic ? 'التقييمات' : 'Reviews',
              path: `${baseUrl}/reviews`,
              icon: FaStar,
              color: 'text-yellow-600',
              description: isArabic ? 'تقييمات العملاء' : 'Client reviews'
            },
            {
              name: isArabic ? 'التقارير' : 'Reports',
              path: `${baseUrl}/reports`,
              icon: FaChartLine,
              color: 'text-red-600',
              description: isArabic ? 'تقارير الأداء والإحصائيات' : 'Performance reports and analytics'
            }
          ]
        };

      case 'contractor':
        return {
          main: [
            {
              name: isArabic ? 'لوحة التحكم' : 'Dashboard',
              path: `${baseUrl}`,
              icon: FaTachometerAlt,
              color: 'text-blue-600',
              description: isArabic ? 'نظرة عامة على أعمالك' : 'Business overview'
            },
            {
              name: isArabic ? 'العملاء المحتملين' : 'Leads',
              path: `${baseUrl}/leads`,
              icon: FaUsers,
              color: 'text-green-600',
              description: isArabic ? 'العملاء المحتملين والفرص' : 'Potential clients and opportunities'
            },
            {
              name: isArabic ? 'خدماتي' : 'My Services',
              path: `${baseUrl}/services`,
              icon: FaBriefcase,
              color: 'text-teal-600',
              description: isArabic ? 'إدارة الخدمات المقدمة' : 'Manage offered services'
            },
            {
              name: isArabic ? 'عروض الأسعار' : 'Quotes',
              path: `${baseUrl}/quotes`,
              icon: FaFileContract,
              color: 'text-purple-600',
              description: isArabic ? 'إنشاء وإدارة عروض الأسعار' : 'Create and manage quotes'
            }
          ],
          projects: [
            {
              name: isArabic ? 'المشاريع النشطة' : 'Active Projects',
              path: `${baseUrl}/active-projects`,
              icon: FaTasks,
              color: 'text-orange-600',
              description: isArabic ? 'المشاريع الحالية' : 'Current projects'
            },
            {
              name: isArabic ? 'رسائل المتخصصين' : 'Specialist Messages',
              path: `${baseUrl}/specialist-messages`,
              icon: FaEnvelope,
              color: 'text-indigo-600',
              description: isArabic ? 'رسائل من المتخصصين' : 'Messages from specialists'
            },
            {
              name: isArabic ? 'إدارة الطاقم' : 'Crew Management',
              path: `${baseUrl}/crew`,
              icon: FaUsers,
              color: 'text-green-600',
              description: isArabic ? 'إدارة فريق العمل' : 'Manage work team'
            }
          ],
          financial: [
            {
              name: isArabic ? 'التمويل والدفع' : 'Funding & Payment',
              path: `${baseUrl}/funding`,
              icon: FaWallet,
              color: 'text-emerald-600',
              description: isArabic ? 'حالة التمويل وخيارات الدفع' : 'Funding status and payment options'
            },
            {
              name: isArabic ? 'نظام الضمان' : 'Escrow System',
              path: `${baseUrl}/escrow`,
              icon: FaShieldAlt,
              color: 'text-yellow-600',
              description: isArabic ? 'إدارة نظام الضمان' : 'Manage escrow system'
            }
          ],
          schedule: [
            {
              name: isArabic ? 'التقويم' : 'Calendar',
              path: `${baseUrl}/calendar`,
              icon: FaCalendarAlt,
              color: 'text-green-600',
              description: isArabic ? 'جدولة المواعيد' : 'Schedule appointments'
            },
            {
              name: isArabic ? 'الأوقات المتاحة' : 'Availability',
              path: `${baseUrl}/availability`,
              icon: FaClock,
              color: 'text-cyan-600',
              description: isArabic ? 'إعدادات الأوقات' : 'Time availability settings'
            }
          ]
        };

      case 'crew':
        return {
          main: [
            {
              name: isArabic ? 'لوحة التحكم' : 'Dashboard',
              path: `${baseUrl}`,
              icon: FaTachometerAlt,
              color: 'text-blue-600',
              description: isArabic ? 'نظرة عامة على أعمالك' : 'Work overview'
            },
            {
              name: isArabic ? 'دعوات العمل' : 'Job Invitations',
              path: `${baseUrl}/invitations`,
              icon: FaEnvelope,
              color: 'text-green-600',
              description: isArabic ? 'دعوات العمل الواردة' : 'Incoming job invitations'
            },
            {
              name: isArabic ? 'المهام النشطة' : 'Active Tasks',
              path: `${baseUrl}/tasks`,
              icon: FaTasks,
              color: 'text-orange-600',
              description: isArabic ? 'المهام الحالية' : 'Current tasks'
            }
          ],
          work: [
            {
              name: isArabic ? 'مصدر الطلبات' : 'Request Source',
              path: `${baseUrl}/request-source`,
              icon: FaMapMarkerAlt,
              color: 'text-purple-600',
              description: isArabic ? 'مصدر طلبات العمل' : 'Source of work requests'
            },
            {
              name: isArabic ? 'حالة التمويل' : 'Funding Status',
              path: `${baseUrl}/funding-status`,
              icon: FaWallet,
              color: 'text-emerald-600',
              description: isArabic ? 'حالة تمويل المشاريع' : 'Project funding status'
            },
            {
              name: isArabic ? 'قبول/رفض العمل' : 'Accept/Reject Work',
              path: `${baseUrl}/work-decisions`,
              icon: FaHandshake,
              color: 'text-indigo-600',
              description: isArabic ? 'قرارات قبول أو رفض العمل' : 'Work acceptance decisions'
            }
          ],
          schedule: [
            {
              name: isArabic ? 'التقويم' : 'Calendar',
              path: `${baseUrl}/calendar`,
              icon: FaCalendarAlt,
              color: 'text-green-600',
              description: isArabic ? 'جدول العمل' : 'Work schedule'
            },
            {
              name: isArabic ? 'الأوقات المتاحة' : 'Availability',
              path: `${baseUrl}/availability`,
              icon: FaClock,
              color: 'text-cyan-600',
              description: isArabic ? 'أوقات العمل المتاحة' : 'Available work hours'
            }
          ],
          financial: [
            {
              name: isArabic ? 'الأجور' : 'Wages',
              path: `${baseUrl}/wages`,
              icon: FaDollarSign,
              color: 'text-emerald-600',
              description: isArabic ? 'تتبع الأجور والمدفوعات' : 'Track wages and payments'
            }
          ]
        };

      default: // client
        return {
          main: [
            {
              name: isArabic ? 'لوحة التحكم' : 'Dashboard',
              path: `${baseUrl}`,
              icon: FaTachometerAlt,
              color: 'text-blue-600',
              description: isArabic ? 'نظرة عامة على حسابك' : 'Account overview'
            },
            {
              name: isArabic ? 'البحث عن محترفين' : 'Find Professionals',
              path: '/search',
              icon: FaSearch,
              color: 'text-green-600',
              description: isArabic ? 'البحث عن مقدمي الخدمات' : 'Search for service providers'
            },
            {
              name: isArabic ? 'طلبات الخدمة' : 'Service Requests',
              path: `${baseUrl}/requests`,
              icon: FaClipboardList,
              color: 'text-purple-600',
              description: isArabic ? 'طلبات الخدمة الخاصة بك' : 'Your service requests'
            },
            {
              name: isArabic ? 'عروض الأسعار' : 'Quotes',
              path: `${baseUrl}/quotes`,
              icon: FaFileContract,
              color: 'text-orange-600',
              description: isArabic ? 'عروض الأسعار المستلمة' : 'Received quotes'
            }
          ],
          schedule: [
            {
              name: isArabic ? 'المواعيد' : 'Appointments',
              path: `${baseUrl}/calendar`,
              icon: FaCalendarAlt,
              color: 'text-green-600',
              description: isArabic ? 'إدارة مواعيدك' : 'Manage your appointments'
            }
          ],
          communication: [
            {
              name: isArabic ? 'الرسائل' : 'Messages',
              path: `${baseUrl}/messages`,
              icon: FaEnvelope,
              color: 'text-indigo-600',
              description: isArabic ? 'التواصل مع المحترفين' : 'Chat with professionals'
            }
          ],
          financial: [
            {
              name: isArabic ? 'سجل المدفوعات' : 'Payment History',
              path: `${baseUrl}/payment-history`,
              icon: FaCreditCard,
              color: 'text-emerald-600',
              description: isArabic ? 'تاريخ عمليات الدفع' : 'Payment transactions'
            }
          ],
          reviews: [
            {
              name: isArabic ? 'التقييمات' : 'Reviews',
              path: `${baseUrl}/reviews`,
              icon: FaStar,
              color: 'text-yellow-600',
              description: isArabic ? 'تقييماتك وآرائك' : 'Your reviews and ratings'
            }
          ]
        };
    }
  };

  const navConfig = getNavigationConfig();

  // قوائم مشتركة لجميع الأدوار
  const commonSections = {
    account: [
      {
        name: isArabic ? 'الملف الشخصي' : 'Profile',
        path: roleInfo.type === 'client' ? '/dashboard/profile' : `/${roleInfo.type}-dashboard/profile`,
        icon: FaUser,
        color: 'text-pink-600',
        description: isArabic ? 'معلوماتك الشخصية' : 'Your personal information'
      },
      {
        name: isArabic ? 'الإعدادات' : 'Settings',
        path: roleInfo.type === 'client' ? '/dashboard/settings' : `/${roleInfo.type}-dashboard/settings`,
        icon: FaCog,
        color: 'text-gray-600',
        description: isArabic ? 'إعدادات الحساب' : 'Account settings'
      },
      {
        name: isArabic ? 'الإشعارات' : 'Notifications',
        path: roleInfo.type === 'client' ? '/dashboard/notifications' : `/${roleInfo.type}-dashboard/notifications`,
        icon: FaBell,
        color: 'text-red-600',
        description: isArabic ? 'إشعاراتك الجديدة' : 'Your notifications'
      }
    ],
    support: [
      {
        name: isArabic ? 'مركز المساعدة' : 'Help Center',
        path: '/help',
        icon: FaQuestionCircle,
        color: 'text-orange-600',
        description: isArabic ? 'الحصول على المساعدة' : 'Get help and support'
      },
      {
        name: isArabic ? 'سجل النشاطات' : 'Activity History',
        path: roleInfo.type === 'client' ? '/dashboard/activity' : `/${roleInfo.type}-dashboard/activity`,
        icon: FaHistory,
        color: 'text-gray-600',
        description: isArabic ? 'تاريخ أنشطة الحساب' : 'Account activity history'
      }
    ]
  };

  const renderNavSection = (title, items, sectionId, isCollapsible = true) => {
    const isExpanded = expandedSections.includes(sectionId);
    
    return (
      <div className="mb-6">
        {isCollapsible ? (
          <button
            onClick={() => toggleSection(sectionId)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span>{title}</span>
            {isExpanded ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
        ) : (
          <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </h4>
        )}
        
        <AnimatePresence>
          {(!isCollapsible || isExpanded) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {items.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`group flex items-center ${
                        sidebarOpen ? 'px-4' : 'justify-center px-2'
                      } py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-md ${
                        active ? 'text-white' : item.color
                      }`}>
                        <Icon className="text-lg" />
                      </div>
                      
                      {sidebarOpen && (
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="font-medium">{item.name}</div>
                          <div className={`text-xs mt-0.5 ${
                            active ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      )}
                      
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Info Header */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center`}>
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <roleInfo.icon className="text-white text-xl" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {currentUser?.name || (isArabic ? 'مستخدم' : 'User')}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleInfo.badgeColor} mt-1`}>
                {roleInfo.name}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                {roleInfo.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* الوظائف الرئيسية */}
        {renderNavSection(
          isArabic ? 'الوظائف الرئيسية' : 'Main Functions',
          navConfig.main || [],
          'main',
          false
        )}

        {/* وظائف خاصة بالدور */}
        {navConfig.projects && renderNavSection(
          isArabic ? 'إدارة المشاريع' : 'Project Management',
          navConfig.projects,
          'projects'
        )}

        {navConfig.work && renderNavSection(
          isArabic ? 'إدارة العمل' : 'Work Management',
          navConfig.work,
          'work'
        )}

        {/* الجدولة والمواعيد */}
        {navConfig.schedule && renderNavSection(
          isArabic ? 'الجدولة والمواعيد' : 'Schedule & Appointments',
          navConfig.schedule,
          'schedule'
        )}

        {/* التواصل */}
        {navConfig.communication && renderNavSection(
          isArabic ? 'التواصل' : 'Communication',
          navConfig.communication,
          'communication'
        )}

        {/* الأعمال والأرباح */}
        {navConfig.business && renderNavSection(
          isArabic ? 'الأعمال والأرباح' : 'Business & Earnings',
          navConfig.business,
          'business'
        )}

        {/* المالية */}
        {navConfig.financial && renderNavSection(
          isArabic ? 'الشؤون المالية' : 'Financial',
          navConfig.financial,
          'financial'
        )}

        {/* التقييمات */}
        {navConfig.reviews && renderNavSection(
          isArabic ? 'التقييمات' : 'Reviews',
          navConfig.reviews,
          'reviews'
        )}

        {/* إعدادات الحساب */}
        {renderNavSection(
          isArabic ? 'إعدادات الحساب' : 'Account Settings',
          commonSections.account,
          'account'
        )}

        {/* المساعدة والدعم */}
        {renderNavSection(
          isArabic ? 'المساعدة والدعم' : 'Help & Support',
          commonSections.support,
          'support'
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className={`group flex items-center ${
            sidebarOpen ? 'w-full px-4' : 'justify-center px-2'
          } py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
        >
          <FaSignOutAlt className="text-lg" />
          {sidebarOpen && <span className="ml-3">{isArabic ? 'تسجيل الخروج' : 'Sign Out'}</span>}
        </button>
      </div>
    </div>
  );
};

export default EnhancedSidebar; 