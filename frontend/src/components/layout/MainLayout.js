import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { useLayout } from './LayoutProvider';
import PageHeader from './PageHeader';

const MainLayout = ({ children, showPageHeader = false, pageHeaderProps = {} }) => {
  const { isRTL, layoutLoading } = useLayout();

  return (
    <div className={`flex flex-col min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Main Header */}
      <Header />
      
      {/* Page Header (optional) */}
      {showPageHeader && (
        <PageHeader {...pageHeaderProps} />
      )}
      
      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-grow ${layoutLoading ? 'pointer-events-none' : ''}`}
      >
        {children || <Outlet />}
      </motion.main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout; 