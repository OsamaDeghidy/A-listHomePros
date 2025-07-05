# خطط الاشتراك الثابتة حسب متطلبات العميل
# Fixed Subscription Plans as per Client Requirements

from decimal import Decimal

# تعريف المميزات الثابتة لكل خطة
SUBSCRIPTION_PLANS = {
    # 🔨 Home Pro Plans
    'home_pro_basic': {
        'name': 'Home Pro Plan - Basic',
        'plan_type': 'home_pro',
        'tier': 'basic',
        'price': Decimal('149.99'),
        'description': 'Perfect for individual home professionals',
        'features': [
            'unlimited_project_leads',      # ✅ Unlimited access to project leads
            'hire_crew_members',           # ✅ Hire and manage crews
            'rate_review_clients',         # ✅ Rate and review clients
            'business_funding_access',     # ✅ Business funding options
            'website_marketing_support',   # ✅ Website & marketing support
            'escrow_project_bidding',      # ✅ Escrow-backed project bidding
            'priority_specialist_support', # ✅ Priority support from A-List Specialists
            'monthly_analytics_report',    # ✅ Monthly analytics report
            'ai_project_estimator',        # ✅ AI project estimator tools (future)
            'franchise_early_access'       # ✅ Early access to A-List Franchise opportunities
        ],
        'project_fee_rate': Decimal('10.00'),  # 10% platform fee per project
        'stripe_product_key': 'home_pro_basic'
    },
    
    'home_pro_premium': {
        'name': 'Home Pro Plan - Premium',
        'plan_type': 'home_pro', 
        'tier': 'premium',
        'price': Decimal('275.00'),
        'description': 'Exclusive access for top-tier professionals',
        'features': [
            # All Basic features plus:
            'unlimited_project_leads',
            'hire_crew_members',
            'rate_review_clients',
            'business_funding_access',
            'website_marketing_support',
            'escrow_project_bidding',
            'priority_specialist_support',
            'monthly_analytics_report',
            'ai_project_estimator',
            'franchise_early_access',
            # Premium exclusive features:
            'exclusive_leads_access',      # ✅ Exclusive Leads (Premium only)
            'premium_analytics_insights',  # ✅ Advanced analytics
            'marketing_assets_ready',      # ✅ Done-for-you marketing assets
            'priority_search_placement'    # ✅ Priority placement in search
        ],
        'project_fee_rate': Decimal('5.00'),   # Reduced fee for premium
        'stripe_product_key': 'home_pro_premium'
    },

    # 🧰 Crew Member Plans
    'crew_basic': {
        'name': 'Crew Member Plan - Basic',
        'plan_type': 'crew',
        'tier': 'basic',
        'price': Decimal('89.99'),
        'description': 'Great for skilled crew members',
        'features': [
            'access_all_local_jobs',       # ✅ Access to all local jobs
            'visible_to_pros_specialists', # ✅ Visible to all Pros and Specialists
            'on_demand_hire_requests',     # ✅ On-demand hire requests
            'training_tools_feedback',     # ✅ Training tools & project feedback
            'portfolio_upload',            # ✅ Add your portfolio
            'text_alerts_new_jobs',        # ✅ Text alerts for new job posts
            'upgrade_to_pro_option',       # ✅ Option to upgrade to Pro
            'client_reviews_access'        # ✅ Access to client reviews
        ],
        'project_fee_rate': Decimal('10.00'),
        'stripe_product_key': 'crew_basic'
    },
    
    'crew_premium': {
        'name': 'Crew Member Plan - Premium',
        'plan_type': 'crew',
        'tier': 'premium', 
        'price': Decimal('210.00'),
        'description': 'Premium access for top crew members',
        'features': [
            # All Basic features plus:
            'access_all_local_jobs',
            'visible_to_pros_specialists',
            'on_demand_hire_requests',
            'training_tools_feedback',
            'portfolio_upload',
            'text_alerts_new_jobs',
            'upgrade_to_pro_option',
            'client_reviews_access',
            # Premium exclusive features:
            'exclusive_job_opportunities', # ✅ Exclusive job opportunities
            'priority_hire_consideration', # ✅ Priority hire consideration
            'advanced_training_resources', # ✅ Advanced training resources
            'direct_communication_top_pros' # ✅ Direct communication with top Pros
        ],
        'project_fee_rate': Decimal('5.00'),
        'stripe_product_key': 'crew_premium'
    },

    # 👤 Specialist Plan
    'specialist_basic': {
        'name': 'Specialist Plan',
        'plan_type': 'specialist',
        'tier': 'basic',
        'price': Decimal('59.99'),
        'description': 'Manage and coordinate projects end-to-end',
        'features': [
            'manage_jobs_start_to_finish',  # ✅ Manage jobs from start to finish
            'access_pros_crew_clients',     # ✅ Access to Home Pros, Crew & Clients
            'upload_walkthroughs_reports',  # ✅ Upload walkthroughs, progress reports
            'organize_assign_jobs',         # ✅ Organize and assign jobs
            'view_bidding_activity',        # ✅ View bidding activity
            'direct_messaging_system',      # ✅ Direct messaging system
            'training_client_representation', # ✅ Training resources for client representation
            'conflict_resolution_tools',    # ✅ Conflict resolution tools
            'higher_system_visibility'      # ✅ Higher visibility due to client-facing role
        ],
        'project_fee_rate': Decimal('0.00'),  # Specialists get paid from project fees
        'stripe_product_key': 'specialist_basic'
    }
}

# Feature permissions mapping
FEATURE_PERMISSIONS = {
    # Home Pro Features
    'unlimited_project_leads': {
        'description': 'Access to unlimited project leads in service area',
        'ui_elements': ['leads_dashboard', 'lead_details', 'lead_contact'],
        'api_endpoints': ['/api/leads/', '/api/leads/contact/']
    },
    'hire_crew_members': {
        'description': 'Ability to hire vetted crew members',
        'ui_elements': ['crew_directory', 'hire_crew_button', 'crew_management'],
        'api_endpoints': ['/api/crew/', '/api/crew/hire/']
    },
    'rate_review_clients': {
        'description': 'Rate and review clients',
        'ui_elements': ['client_rating_form', 'review_history'],
        'api_endpoints': ['/api/clients/rate/', '/api/reviews/']
    },
    'exclusive_leads_access': {
        'description': 'Access to exclusive, verified leads (Premium only)',
        'ui_elements': ['exclusive_leads_section', 'premium_badge'],
        'api_endpoints': ['/api/leads/exclusive/']
    },
    
    # Crew Features
    'access_all_local_jobs': {
        'description': 'View all available jobs in local area',
        'ui_elements': ['jobs_dashboard', 'job_search', 'job_details'],
        'api_endpoints': ['/api/jobs/', '/api/jobs/local/']
    },
    'exclusive_job_opportunities': {
        'description': 'Access to exclusive job opportunities (Premium only)',
        'ui_elements': ['exclusive_jobs_section', 'premium_job_badge'],
        'api_endpoints': ['/api/jobs/exclusive/']
    },
    
    # Specialist Features
    'manage_jobs_start_to_finish': {
        'description': 'Full project management capabilities',
        'ui_elements': ['project_management_dashboard', 'job_assignment_tools'],
        'api_endpoints': ['/api/projects/manage/', '/api/projects/assign/']
    },
    'upload_walkthroughs_reports': {
        'description': 'Upload progress reports and walkthroughs',
        'ui_elements': ['upload_walkthrough', 'progress_reports'],
        'api_endpoints': ['/api/projects/upload/', '/api/reports/']
    }
}

# Helper functions
def get_plan_features(plan_key):
    """Get features for a specific plan"""
    return SUBSCRIPTION_PLANS.get(plan_key, {}).get('features', [])

def has_feature_access(user_plan_key, feature_key):
    """Check if user has access to a specific feature"""
    plan_features = get_plan_features(user_plan_key)
    return feature_key in plan_features

def get_plan_by_type_and_tier(plan_type, tier):
    """Get plan configuration by type and tier"""
    for plan_key, plan_config in SUBSCRIPTION_PLANS.items():
        if plan_config['plan_type'] == plan_type and plan_config['tier'] == tier:
            return plan_key, plan_config
    return None, None

def get_feature_permissions(feature_key):
    """Get UI elements and API endpoints for a feature"""
    return FEATURE_PERMISSIONS.get(feature_key, {})

# Plan validation
def validate_plan_access(user_subscription, required_feature):
    """Validate if user has access to required feature"""
    if not user_subscription or not user_subscription.is_active:
        return False, "No active subscription"
    
    plan_key = f"{user_subscription.plan.plan_type}_{user_subscription.plan.tier}"
    
    if has_feature_access(plan_key, required_feature):
        return True, "Access granted"
    else:
        return False, f"Feature '{required_feature}' not available in current plan" 