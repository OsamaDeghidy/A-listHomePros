from django.urls import path
from .views import (
    StripeOnboardingView,
    StripeAccountStatusView,
    PaymentCreateView,
    PaymentSessionCreateView,
    PaymentListView,
    PaymentDetailView,
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
)

urlpatterns = [
    # Stripe Connect onboarding for A-List Home Pros
    path('onboard/', StripeOnboardingView.as_view(), name='stripe-onboarding'),
    path('status/', StripeAccountStatusView.as_view(), name='stripe-account-status'),
    path('dashboard-link/', stripe_dashboard_link, name='stripe-dashboard-link'),
    
    # Payments
    path('create/', PaymentCreateView.as_view(), name='payment-create'),
    path('create-session/', PaymentSessionCreateView.as_view(), name='payment-session-create'),
    path('', PaymentListView.as_view(), name='payment-list'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
    
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
    
    # Webhook
    path('webhook/', stripe_webhook, name='stripe-webhook'),
]
