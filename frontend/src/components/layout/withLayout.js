import React, { useEffect } from 'react';
import { useLayout } from './LayoutProvider';
import PageHeader from './PageHeader';

/**
 * Higher Order Component that wraps components with layout functionality
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} layoutConfig - Layout configuration
 * @returns {React.Component} - Wrapped component with layout
 */
const withLayout = (WrappedComponent, layoutConfig = {}) => {
  const WithLayoutComponent = (props) => {
    const {
      updatePageInfo,
      showLayoutLoading,
      hideLayoutLoading,
      setCustomBreadcrumbs,
      isArabic
    } = useLayout();

    const {
      title,
      subtitle,
      actions = [],
      breadcrumbs = null,
      showPageHeader = true,
      pageHeaderVariant = 'default',
      loading = false,
      meta = {}
    } = layoutConfig;

    // Update page info on mount
    useEffect(() => {
      if (title) {
        updatePageInfo(
          typeof title === 'function' ? title({ isArabic, ...props }) : title,
          typeof actions === 'function' ? actions({ isArabic, ...props }) : actions
        );
      }

      // Set custom breadcrumbs if provided
      if (breadcrumbs) {
        setCustomBreadcrumbs(
          typeof breadcrumbs === 'function' ? breadcrumbs({ isArabic, ...props }) : breadcrumbs
        );
      }

      // Set loading state
      if (loading) {
        showLayoutLoading();
      } else {
        hideLayoutLoading();
      }

      // Cleanup
      return () => {
        hideLayoutLoading();
      };
    }, [title, actions, breadcrumbs, loading, isArabic, props]);

    // Update document title
    useEffect(() => {
      if (meta.title) {
        const pageTitle = typeof meta.title === 'function' 
          ? meta.title({ isArabic, ...props }) 
          : meta.title;
        document.title = `${pageTitle} | ${isArabic ? 'قائمة المنزل للمحترفين' : 'A-List Home Pros'}`;
      }

      // Set meta description
      if (meta.description) {
        const description = typeof meta.description === 'function'
          ? meta.description({ isArabic, ...props })
          : meta.description;
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = description;
      }
    }, [meta, isArabic, props]);

    return (
      <>
        {showPageHeader && (
          <PageHeader
            title={typeof title === 'function' ? title({ isArabic, ...props }) : title}
            subtitle={typeof subtitle === 'function' ? subtitle({ isArabic, ...props }) : subtitle}
            actions={typeof actions === 'function' ? actions({ isArabic, ...props }) : actions}
            variant={pageHeaderVariant}
          />
        )}
        <WrappedComponent {...props} />
      </>
    );
  };

  WithLayoutComponent.displayName = `withLayout(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithLayoutComponent;
};

/**
 * Hook version of withLayout for functional components
 * @param {Object} layoutConfig - Layout configuration
 */
export const usePageLayout = (layoutConfig = {}) => {
  const {
    updatePageInfo,
    showLayoutLoading,
    hideLayoutLoading,
    setCustomBreadcrumbs,
    isArabic
  } = useLayout();

  const setPageConfig = (config) => {
    const {
      title,
      subtitle,
      actions = [],
      breadcrumbs = null,
      loading = false,
      meta = {}
    } = config;

    // Update page info
    if (title) {
      updatePageInfo(
        typeof title === 'function' ? title({ isArabic }) : title,
        typeof actions === 'function' ? actions({ isArabic }) : actions
      );
    }

    // Set custom breadcrumbs
    if (breadcrumbs) {
      setCustomBreadcrumbs(
        typeof breadcrumbs === 'function' ? breadcrumbs({ isArabic }) : breadcrumbs
      );
    }

    // Set loading state
    if (loading) {
      showLayoutLoading();
    } else {
      hideLayoutLoading();
    }

    // Update document title
    if (meta.title) {
      const pageTitle = typeof meta.title === 'function' 
        ? meta.title({ isArabic }) 
        : meta.title;
      document.title = `${pageTitle} | ${isArabic ? 'قائمة المنزل للمحترفين' : 'A-List Home Pros'}`;
    }

    // Set meta description
    if (meta.description) {
      const description = typeof meta.description === 'function'
        ? meta.description({ isArabic })
        : meta.description;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    }
  };

  return { setPageConfig };
};

export default withLayout; 