import api from './api';

const subscriptionService = {
  // Get all subscription plans
  getPlans: async (planType = null) => {
    const params = planType ? { plan_type: planType } : {};
    return await api.get('/payments/subscription-plans/', { params });
  },

  // Get plan comparison data
  getPlanComparison: async () => {
    return await api.get('/payments/plan-comparison/');
  },

  // Get current user's subscription
  getCurrentSubscription: async () => {
    return await api.get('/payments/subscriptions/current/');
  },

  // Get detailed plan info for current user
  getPlanInfo: async () => {
    return await api.get('/payments/subscriptions/plan_info/');
  },

  // Check single feature access
  checkFeature: async (featureKey) => {
    return await api.post('/payments/subscriptions/check_feature/', {
      feature_key: featureKey
    });
  },

  // Check multiple features at once
  checkMultipleFeatures: async (features) => {
    return await api.post('/payments/feature-access/', {
      features: features
    });
  },

  // Get all available features for current user
  getAvailableFeatures: async () => {
    return await api.get('/payments/subscriptions/available_features/');
  },

  // Create checkout session for subscription
  createCheckoutSession: async (planId, successUrl, cancelUrl) => {
    return await api.post('/payments/subscriptions/create_checkout_session/', {
      plan_id: planId,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
  },

  // Change subscription plan
  changePlan: async (newPlanId) => {
    return await api.post('/payments/subscriptions/change_plan/', {
      new_plan_id: newPlanId
    });
  },

  // Cancel subscription
  cancelSubscription: async () => {
    return await api.post('/payments/subscriptions/cancel_subscription/');
  },

  // Get subscription invoices
  getInvoices: async () => {
    return await api.get('/payments/subscriptions/invoices/');
  },

  // Enhanced feature access check with caching
  hasFeatureAccess: async (featureKey, useCache = true) => {
    // Simple cache implementation
    const cacheKey = `feature_${featureKey}`;
    const cached = useCache ? sessionStorage.getItem(cacheKey) : null;
    
    if (cached) {
      const { result, timestamp } = JSON.parse(cached);
      // Cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return result;
      }
    }

    try {
      const response = await this.checkFeature(featureKey);
      const result = response.data.has_access;
      
      if (useCache) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          result,
          timestamp: Date.now()
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  },

  // Clear feature cache
  clearFeatureCache: () => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('feature_')) {
        sessionStorage.removeItem(key);
      }
    });
  },

  // Get upgrade suggestions for a feature
  getUpgradeSuggestions: async (featureKey) => {
    try {
      const response = await this.checkFeature(featureKey);
      return response.data.upgrade_suggestions || [];
    } catch (error) {
      console.error('Error getting upgrade suggestions:', error);
      return [];
    }
  },

  // Check if user has premium access
  hasPremiumAccess: async () => {
    try {
      const planInfo = await this.getPlanInfo();
      return planInfo.data.tier === 'premium' && planInfo.data.is_active;
    } catch (error) {
      return false;
    }
  },

  // Get project fee rate for current user
  getProjectFeeRate: async () => {
    try {
      const planInfo = await this.getPlanInfo();
      return planInfo.data.project_fee_rate || 10; // Default 10%
    } catch (error) {
      return 10;
    }
  },

  // Feature access helpers for React components
  useFeatureAccess: (featureKey) => {
    const [hasAccess, setHasAccess] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const checkAccess = async () => {
        try {
          setLoading(true);
          const access = await subscriptionService.hasFeatureAccess(featureKey);
          setHasAccess(access);
          setError(null);
        } catch (err) {
          setError(err);
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      };

      checkAccess();
    }, [featureKey]);

    return { hasAccess, loading, error };
  },

  // Plan type helpers
  getPlanDisplayName: (planType, tier) => {
    const names = {
      home_pro: {
        basic: 'Home Pro Basic',
        premium: 'Home Pro Premium'
      },
      crew: {
        basic: 'Crew Member Basic', 
        premium: 'Crew Member Premium'
      },
      specialist: {
        basic: 'Specialist'
      }
    };
    return names[planType]?.[tier] || 'Unknown Plan';
  },

  // Feature descriptions for UI
  getFeatureDescription: (featureKey) => {
    const descriptions = {
      unlimited_project_leads: 'Access to unlimited project leads in your area',
      exclusive_leads_access: 'Access to exclusive, high-value leads',
      hire_crew_members: 'Ability to hire and manage crew members',
      rate_review_clients: 'Rate and review clients',
      premium_analytics_insights: 'Advanced analytics and insights',
      // Add more as needed
    };
    return descriptions[featureKey] || featureKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Check if user has access to feature based on subscription
  hasFeatureAccess: (subscription, feature) => {
    if (!subscription || !subscription.is_active) {
      return false;
    }

    const planType = subscription.plan.plan_type;
    const tier = subscription.plan.tier;

    // Feature access based on plan type and tier
    const accessRules = {
      // Home Pro features
      home_pro: {
        basic: [
          'view_leads', 'hire_crew', 'rate_clients', 'business_funding',
          'website_support', 'escrow_bidding', 'priority_support'
        ],
        premium: [
          'view_leads', 'hire_crew', 'rate_clients', 'business_funding',
          'website_support', 'escrow_bidding', 'priority_support',
          'exclusive_leads', 'premium_analytics'
        ]
      },
      // Crew features
      crew: {
        basic: [
          'view_jobs', 'crew_directory', 'client_reviews', 'training_resources',
          'portfolio_upload', 'job_alerts'
        ],
        premium: [
          'view_jobs', 'crew_directory', 'client_reviews', 'training_resources',
          'portfolio_upload', 'job_alerts', 'exclusive_jobs', 'priority_hire'
        ]
      },
      // Specialist features
      specialist: {
        basic: [
          'manage_jobs', 'direct_messaging', 'job_documentation', 'bidding_visibility',
          'walkthrough_upload', 'conflict_resolution'
        ]
      }
    };

    const planFeatures = accessRules[planType]?.[tier] || [];
    return planFeatures.includes(feature);
  },

  // Get plan recommendations based on user role
  getRecommendedPlans: (userRole) => {
    const recommendations = {
      'alistpro': 'home_pro',
      'crew': 'crew', 
      'specialist': 'specialist',
      'client': null // Clients don't need subscriptions
    };

    return recommendations[userRole];
  }
};

export default subscriptionService; 