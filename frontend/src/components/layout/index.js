// Layout Components
export { default as DashboardLayout } from './DashboardLayout';
export { default as MainLayout } from './MainLayout';
export { default as Layout } from './Layout';

// Core Layout Components
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as Sidebar } from './Sidebar';
export { default as Navbar } from './Navbar';
export { default as Navigation } from './Navigation';

// Layout System Components
export { default as LayoutProvider, useLayout } from './LayoutProvider';
export { default as PageHeader } from './PageHeader';
export { default as Breadcrumb } from './Breadcrumb';
export { default as withLayout } from './withLayout';

// Notification Components
export { default as NotificationCenter } from '../notifications/NotificationCenter';
export { default as NotificationsMenu } from './NotificationsMenu';

// Common Components
export { default as DarkModeToggle } from '../common/DarkModeToggle';
export { default as LanguageSelector } from '../common/LanguageSelector';

// Layout Utilities
export const LayoutUtils = {
  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Common layout classes
  classes: {
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 lg:py-12',
    card: 'bg-white dark:bg-gray-800 rounded-lg shadow-md',
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors',
      danger: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
    }
  },
  
  // RTL support utilities
  rtl: {
    marginLeft: (value) => ({ marginLeft: value, marginRight: 0 }),
    marginRight: (value) => ({ marginRight: value, marginLeft: 0 }),
    paddingLeft: (value) => ({ paddingLeft: value, paddingRight: 0 }),
    paddingRight: (value) => ({ paddingRight: value, paddingLeft: 0 }),
    textAlign: (isRTL) => isRTL ? 'right' : 'left',
    direction: (isRTL) => isRTL ? 'rtl' : 'ltr'
  }
};

// Export all at once for convenience
export * from './DashboardLayout';
export * from './MainLayout';
export * from './Layout';
export * from './Header';
export * from './Footer';
export * from './Sidebar';
export * from './Navbar';
export * from './Navigation';
export * from './LayoutProvider';
export * from './PageHeader';
export * from './Breadcrumb';
export * from './withLayout'; 