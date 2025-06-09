from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    PasswordChangeSerializer,
    UserUpdateSerializer,
    AdminUserUpdateSerializer
)
from .permissions import IsAdmin, IsOwnerOrAdmin
from .email_verification import send_verification_email, verify_email_token
from .models import EmailVerification

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification email
        send_verification_email(user)

        # إنشاء AListHomeProProfile للمحترفين تلقائياً
        if user.role in ['contractor', 'specialist', 'crew']:
            try:
                from alistpros_profiles.models import AListHomeProProfile
                
                # استخراج البيانات المهنية من الطلب
                profession = request.data.get('profession', '')
                years_experience = request.data.get('years_experience', 0)
                services_provided = request.data.get('services_provided', '')
                about = request.data.get('about', '')
                business_name = request.data.get('business_name', '')
                
                # تحويل years_experience إلى رقم صحيح
                try:
                    years_experience = int(years_experience) if years_experience else 0
                except (ValueError, TypeError):
                    years_experience = 0
                
                # إنشاء الملف المهني (غير محقق افتراضياً)
                professional_profile = AListHomeProProfile.objects.create(
                    user=user,
                    business_name=business_name,
                    profession=profession,
                    bio=about,
                    business_description=about,
                    years_of_experience=years_experience,
                    is_onboarded=False,  # سيحتاج لإكمال البيانات لاحقاً
                    is_verified=False,   # يحتاج تحقق من المشرف قبل أن يصبح نشطاً
                    is_available=False   # غير متاح للعمل حتى يتم التحقق منه
                )
                
                print(f"✅ تم إنشاء AListHomeProProfile للمستخدم {user.email}")
                
            except Exception as e:
                print(f"❌ خطأ في إنشاء AListHomeProProfile: {e}")
                # لا نوقف عملية التسجيل إذا فشل إنشاء الملف المهني

        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        return Response({
            'user': serializer.data,
            'tokens': tokens,
            'message': 'User registered successfully. Please check your email to verify your account.',
            'professional_profile_created': user.role in ['contractor', 'specialist', 'crew']
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    def get(self, request, *args, **kwargs):
        token = request.GET.get('token')
        user_id = request.GET.get('user_id')

        if not token or not user_id:
            return Response({'message': 'Token and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = verify_email_token(token)
        if user and str(user.id) == str(user_id):
            return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserSerializer


class PasswordChangeView(generics.GenericAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserUpdateSerializer
    permission_classes = [IsAdmin]


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Add user info to response
            user = User.objects.get(email=request.data['email'])
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
            
        return response


class ResendVerificationEmailView(APIView):
    """API to resend email verification with rate limiting"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            if user.email_verified:
                return Response(
                    {'message': 'Email is already verified'}, 
                    status=status.HTTP_200_OK
                )
            
            # Check rate limiting (max 3 requests per hour)
            from .models import EmailVerification
            from django.utils import timezone
            from datetime import timedelta
            
            recent_verifications = EmailVerification.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(hours=1)
            ).count()
            
            if recent_verifications >= 3:
                return Response(
                    {'error': 'Too many verification requests. Please wait an hour.'}, 
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Send new verification email
            try:
                send_verification_email(user)
                message = f'Verification email sent to {email}'
            except Exception as e:
                print(f"Error sending verification email: {e}")
                # For development - show the verification link in response
                from .models import EmailVerification
                verification = EmailVerification.objects.filter(user=user).last()
                if verification:
                    verification_url = f"http://localhost:3000/verify-email?token={verification.token}&user_id={user.id}"
                    message = f'Email sending failed, but verification link: {verification_url}'
                else:
                    message = 'Email sending failed. Please try again later.'
            
            return Response(
                {'message': message}, 
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class UserNotificationsView(generics.ListAPIView):
    """Get user notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from notifications.models import Notification
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        
        data = []
        for notification in notifications:
            data.append({
                'id': notification.id,
                'type': notification.notification_type,
                'title': notification.title,
                'message': notification.message,
                'read': notification.read,
                'created_at': notification.created_at,
                'read_at': notification.read_at
            })
        
        unread_count = notifications.filter(read=False).count()
        
        return Response({
            'notifications': data,
            'unread_count': unread_count
        })


class MarkNotificationReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        try:
            from notifications.models import Notification
            notification = Notification.objects.get(
                id=notification_id, 
                user=request.user
            )
            notification.mark_as_read()
            
            return Response({'message': 'Notification marked as read'})
            
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
