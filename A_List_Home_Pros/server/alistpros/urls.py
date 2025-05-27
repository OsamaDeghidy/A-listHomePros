"""alistpros URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

# Import viewsets
from users.views import RegisterView, CustomTokenObtainPairView, UserProfileView
from alistpros_profiles.views import AListHomeProProfileViewSet, ServiceCategoryListView
from scheduling.views import AppointmentViewSet
from messaging.views import ConversationViewSet, MessageViewSet, NotificationViewSet as MessagingNotificationViewSet
from notifications.views import NotificationViewSet, NotificationSettingViewSet

# Initialize router
router = routers.DefaultRouter()

# Register routes
# router.register(r'users', UserViewSet)  # UserViewSet is not defined in users.views
router.register(r'alistpros/profiles', AListHomeProProfileViewSet)
# ServiceCategoryListView is a ListAPIView, not a ModelViewSet, so it can't be registered with router
# router.register(r'alistpros/categories', ServiceCategoryViewSet)
# We don't have a ReviewViewSet, we have AListHomeProReviewCreateView which is a CreateAPIView
# router.register(r'alistpros/reviews', ReviewViewSet)
router.register(r'scheduling/appointments', AppointmentViewSet, basename='appointment')
# TimeSlotViewSet doesn't exist in scheduling.views
# router.register(r'scheduling/timeslots', TimeSlotViewSet, basename='timeslot')
# These payment viewsets don't exist
# router.register(r'payments/payment-intents', PaymentIntentViewSet, basename='payment-intent')
# router.register(r'payments/payment-methods', PaymentMethodViewSet, basename='payment-method')
# router.register(r'payments/transactions', TransactionViewSet, basename='transaction')
router.register(r'messaging/conversations', ConversationViewSet, basename='conversation')
router.register(r'messaging/messages', MessageViewSet, basename='message')
router.register(r'messaging/notifications', MessagingNotificationViewSet, basename='messaging-notification')
router.register(r'notifications/notifications', NotificationViewSet, basename='notification')
router.register(r'notifications/settings', NotificationSettingViewSet, basename='notification-settings')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API root
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/users/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/users/register/', RegisterView.as_view(), name='register'),
    path('api/users/profile/', UserProfileView.as_view(), name='profile'),
    
    # Add ServiceCategoryListView directly to urlpatterns
    path('api/alistpros/categories/', ServiceCategoryListView.as_view(), name='service-categories'),
    
    # Include app URLs
    path('api/users/', include('users.urls')),
    path('api/alistpros/', include('alistpros_profiles.urls')),
    path('api/scheduling/', include('scheduling.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
