from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StripeOnboardingView,
    StripeAccountStatusView,
    stripe_webhook,
    stripe_dashboard_link,
    # Escrow views
    EscrowAccountCreateView,
    EscrowAccountListView,
    EscrowAccountDetailView,
    EscrowFundView,
    EscrowConfirmFundingView,
    EscrowWorkOrderCreateView,
    CrewJobInvitationsView,
    CrewJobResponseView,
    EscrowApprovalView,
    SpecialistEscrowManagementView,
    pay_milestone,
    confirm_milestone_payment,
    mark_milestone_completed,
    approve_milestone,
    get_escrow_milestones,
    get_payment_summary,
    # Subscription views
    SubscriptionPlanViewSet,
    UserSubscriptionViewSet,
    StripeWebhookView,
    # New enhanced views
    FeatureAccessAPIView,
    PlanComparisonAPIView,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plans')
router.register(r'user-subscriptions', UserSubscriptionViewSet, basename='user-subscriptions')

app_name = 'payments'

urlpatterns = [
    # ViewSet URLs (includes all CRUD operations and custom actions)
    path('api/', include(router.urls)),
    
    # Additional API endpoints
    path('api/feature-access/', FeatureAccessAPIView.as_view(), name='feature-access'),
    path('api/plan-comparison/', PlanComparisonAPIView.as_view(), name='plan-comparison'),
    
    # Stripe webhook endpoint
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
    
    # Stripe Connect onboarding for A-List Home Pros
    path('onboard/', StripeOnboardingView.as_view(), name='stripe-onboarding'),
    path('status/', StripeAccountStatusView.as_view(), name='stripe-account-status'),
    path('dashboard-link/', stripe_dashboard_link, name='stripe-dashboard-link'),
    
    # Escrow System (Upwork-style)
    path('escrow/create/', EscrowAccountCreateView.as_view(), name='escrow-create'),
    path('escrow/', EscrowAccountListView.as_view(), name='escrow-list'),
    path('escrow/<int:pk>/', EscrowAccountDetailView.as_view(), name='escrow-detail'),
    path('escrow/<int:escrow_id>/fund/', EscrowFundView.as_view(), name='escrow-fund'),
    path('escrow/<int:escrow_id>/confirm-funding/', EscrowConfirmFundingView.as_view(), name='escrow-confirm-funding'),
    path('escrow/<int:escrow_id>/approve/', EscrowApprovalView.as_view(), name='escrow-approval'),
    
    # Work Orders & Job Dispatch
    path('escrow/<int:escrow_id>/work-orders/create/', EscrowWorkOrderCreateView.as_view(), name='escrow-work-order-create'),
    path('crew/job-invitations/', CrewJobInvitationsView.as_view(), name='crew-job-invitations'),
    path('crew/job-response/<int:work_order_id>/', CrewJobResponseView.as_view(), name='crew-job-response'),
    
    # Specialist Management
    path('specialist/escrow-management/', SpecialistEscrowManagementView.as_view(), name='specialist-escrow-management'),
    
    # Milestone Payment APIs
    path('milestones/<int:milestone_id>/pay/', pay_milestone, name='pay-milestone'),
    path('milestones/<int:milestone_id>/confirm-payment/', confirm_milestone_payment, name='confirm-milestone-payment'),
    path('milestones/<int:milestone_id>/mark-completed/', mark_milestone_completed, name='mark-milestone-completed'),
    path('milestones/<int:milestone_id>/approve/', approve_milestone, name='approve-milestone'),
    
    # Milestone and Payment Summary APIs
    path('escrow/<int:escrow_id>/milestones/', get_escrow_milestones, name='get-escrow-milestones'),
    path('quotes/<int:quote_id>/payment-summary/', get_payment_summary, name='get-payment-summary'),
    
    # Webhooks
    path('stripe/subscription-webhook/', StripeWebhookView.as_view(), name='stripe-subscription-webhook'),
]

# Available API endpoints:
# 
# Subscription Plans:
# - GET /api/subscription-plans/ - List all active plans (with optional plan_type filter)
# - GET /api/subscription-plans/{id}/ - Get specific plan details
#
# User Subscriptions:
# - GET /api/user-subscriptions/ - List user's subscriptions
# - GET /api/user-subscriptions/{id}/ - Get specific subscription
# - POST /api/user-subscriptions/ - Create new subscription
# - PUT/PATCH /api/user-subscriptions/{id}/ - Update subscription
# - DELETE /api/user-subscriptions/{id}/ - Cancel subscription
#
# Custom Actions:
# - GET /api/user-subscriptions/current/ - Get current user's subscription
# - GET /api/user-subscriptions/plan_info/ - Get detailed plan info
# - POST /api/user-subscriptions/check_feature/ - Check feature access
# - GET /api/user-subscriptions/available_features/ - Get available features
# - POST /api/user-subscriptions/create_checkout_session/ - Create Stripe checkout
#
# Feature Access:
# - POST /api/feature-access/ - Check multiple features at once
#
# Plan Comparison:
# - GET /api/plan-comparison/ - Get plan comparison data
#
# Webhooks:
# - POST /webhook/stripe/ - Stripe webhook endpoint
