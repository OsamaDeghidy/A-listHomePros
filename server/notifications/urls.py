from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationTemplateViewSet, 
    NotificationSettingViewSet, 
    NotificationViewSet, 
    SMSVerificationViewSet,
    create_test_notification,
    trigger_registration_notification,
    trigger_alistpro_onboarding_notification,
    trigger_profile_update_notification,
    trigger_alistpro_verification_notification
)

router = DefaultRouter()
router.register(r'templates', NotificationTemplateViewSet, basename='notification-template')
router.register(r'settings', NotificationSettingViewSet, basename='notification-setting')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'sms', SMSVerificationViewSet, basename='sms-verification')

urlpatterns = [
    path('', include(router.urls)),
    
    # Test and trigger endpoints
    path('test/', create_test_notification, name='test-notification'),
    path('trigger/registration/', trigger_registration_notification, name='trigger-registration-notification'),
    path('trigger/alistpro-onboarding/', trigger_alistpro_onboarding_notification, name='trigger-alistpro-onboarding-notification'),
    path('trigger/profile-update/', trigger_profile_update_notification, name='trigger-profile-update-notification'),
    path('trigger/alistpro-verification/', trigger_alistpro_verification_notification, name='trigger-alistpro-verification-notification'),
]
