from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
import random
import string
from datetime import timedelta
from django.shortcuts import get_object_or_404

from .models import NotificationTemplate, NotificationSetting, Notification, SMSVerification
from .serializers import (
    NotificationTemplateSerializer,
    NotificationSettingSerializer,
    NotificationSerializer,
    SMSVerificationSerializer,
    VerifyPhoneNumberSerializer,
    NotificationBulkMarkReadSerializer
)
from .utils import (
    create_notification,
    create_registration_notification,
    create_alistpro_onboarding_notification,
    create_profile_update_notification,
    create_alistpro_verification_notification,
    create_new_review_notification
)
from users.permissions import IsAdmin, IsAListHomePro, IsClient


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for notification templates (admin only)"""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAdmin]


class NotificationSettingViewSet(viewsets.ModelViewSet):
    """ViewSet for user notification settings"""
    serializer_class = NotificationSettingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return notification settings for current user only"""
        if getattr(self, 'swagger_fake_view', False):
            return NotificationSetting.objects.none()
            
        return NotificationSetting.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get or create notification settings for current user"""
        settings, created = NotificationSetting.objects.get_or_create(user=self.request.user)
        return settings
    
    @action(detail=False, methods=['get'])
    def my_settings(self, request):
        """Get current user's notification settings"""
        settings = self.get_object()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_settings(self, request):
        """Update current user's notification settings"""
        settings = self.get_object()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for managing user notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return notifications for the current user.
        """
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()
            
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['put'])
    def read(self, request, pk=None):
        """
        Mark a notification as read.
        """
        notification = self.get_object()
        
        # Ensure user can only mark their own notifications
        if notification.user != request.user:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notification.read = True
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def read_all(self, request):
        """
        Mark all notifications as read.
        """
        notifications = Notification.objects.filter(
            user=request.user,
            read=False
        )
        
        updated_count = notifications.count()
        notifications.update(read=True)
        
        return Response({
            "detail": f"Marked {updated_count} notifications as read.",
            "count": updated_count
        })

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Get all unread notifications for the current user.
        """
        notifications = Notification.objects.filter(
            user=request.user,
            read=False
        ).order_by('-created_at')
        
        page = self.paginate_queryset(notifications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)


class SMSVerificationViewSet(viewsets.GenericViewSet):
    """ViewSet for SMS verification"""
    serializer_class = SMSVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def send_verification(self, request):
        """Send SMS verification code"""
        phone_number = request.data.get('phone_number')
        
        if not phone_number:
            return Response(
                {'detail': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate random verification code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Set expiration time (15 minutes)
        expires_at = timezone.now() + timedelta(minutes=15)
        
        # Create or update verification record
        verification, created = SMSVerification.objects.update_or_create(
            user=request.user,
            phone_number=phone_number,
            defaults={
                'verification_code': verification_code,
                'is_verified': False,
                'expires_at': expires_at
            }
        )
        
        # In a real implementation, we would send the SMS here
        # For now, we'll just return the code in the response (for development only)
        # In production, this should be removed and replaced with actual SMS sending
        
        return Response({
            'status': 'verification code sent',
            'phone_number': phone_number,
            'expires_at': expires_at,
            'verification_code': verification_code  # Remove this in production!
        })
    
    @action(detail=False, methods=['post'])
    def verify_phone(self, request):
        """Verify phone number with code"""
        serializer = VerifyPhoneNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        verification_code = serializer.validated_data['verification_code']
        
        # Get the latest verification for this phone number
        try:
            verification = SMSVerification.objects.filter(
                user=request.user,
                phone_number=phone_number,
                is_verified=False
            ).latest('created_at')
        except SMSVerification.DoesNotExist:
            return Response(
                {'detail': 'No verification found for this phone number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if code is expired
        if verification.is_expired():
            return Response(
                {'detail': 'Verification code has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if code matches
        if verification.verification_code != verification_code:
            return Response(
                {'detail': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        verification.is_verified = True
        verification.save(update_fields=['is_verified'])
        
        # Update user's phone number if needed
        user = request.user
        if not user.phone_number or user.phone_number != phone_number:
            user.phone_number = phone_number
            user.phone_verified = True
            user.save(update_fields=['phone_number', 'phone_verified'])
        
        return Response({
            'status': 'success',
            'message': 'Phone number verified successfully'
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_test_notification(request):
    """Create a test notification for the current user"""
    notification = create_notification(
        user=request.user,
        notification_type='SYSTEM',
        title='Test Notification',
        message='This is a test notification created at ' + timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    )
    return Response({
        'status': 'success',
        'notification_id': notification.id
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def trigger_registration_notification(request):
    """Trigger a registration notification for the current user"""
    notification = create_registration_notification(request.user)
    return Response({
        'status': 'success',
        'notification_id': notification.id
    })


@api_view(['POST'])
@permission_classes([IsAListHomePro])
def trigger_alistpro_onboarding_notification(request):
    """Trigger an A-List Home Pro onboarding notification for the current user"""
    notification = create_alistpro_onboarding_notification(request.user)
    return Response({
        'status': 'success',
        'notification_id': notification.id
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def trigger_profile_update_notification(request):
    """Trigger a profile update notification for the current user"""
    notification = create_profile_update_notification(request.user)
    return Response({
        'status': 'success',
        'notification_id': notification.id
    })


@api_view(['POST'])
@permission_classes([IsAdmin])
def trigger_alistpro_verification_notification(request):
    """Trigger an A-List Home Pro verification notification"""
    alistpro_id = request.data.get('alistpro_id')
    is_verified = request.data.get('is_verified', False)
    
    if not alistpro_id:
        return Response(
            {'detail': 'A-List Home Pro ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Check if A-List Home Pro exists
        from alistpros_profiles.models import AListHomeProProfile
        alistpro = get_object_or_404(AListHomeProProfile, id=alistpro_id)
        
        # Create verification notification
        notification = create_alistpro_verification_notification(
            alistpro.user,
            alistpro,
            is_verified
        )
        
        if not notification:
            return Response(
                {'detail': 'Error creating notification'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
