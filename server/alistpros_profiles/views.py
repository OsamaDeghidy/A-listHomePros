from rest_framework import generics, viewsets, permissions, status, filters, serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ServiceCategory, ServiceRequest, ServiceQuote,
    JobAssignment,
    # Legacy models
    AListHomeProProfile, AListHomeProPortfolio, AListHomeProReview
)
from .serializers import (
    ServiceCategorySerializer,
    ServiceRequestSerializer, ServiceQuoteSerializer, JobAssignmentSerializer,
    # Legacy serializers
    AListHomeProProfileSerializer, AListHomeProProfileCreateUpdateSerializer,
    AListHomeProPortfolioSerializer, AListHomeProReviewSerializer
)
from .filters import AListHomeProFilter
from users.permissions import IsAListHomePro, IsClient, IsAdmin, IsOwnerOrAdmin
from users.models import UserRole
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Q, Avg, Count
from datetime import timedelta
from rest_framework.views import APIView
import requests

User = get_user_model()


class ServiceCategoryListView(generics.ListAPIView):
    """
    List all service categories
    """
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class AListHomeProProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for A-List Home Pro profiles with advanced filtering"""
    queryset = AListHomeProProfile.objects.all()
    serializer_class = AListHomeProProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user__role', 'years_of_experience', 'is_onboarded']
    search_fields = ['business_name', 'business_description', 'user__name']
    ordering_fields = ['business_name', 'years_of_experience', 'created_at', 'average_rating']
    ordering = ['business_name']

    def get_queryset(self):
        # Handle swagger fake view
        if getattr(self, 'swagger_fake_view', False):
            return AListHomeProProfile.objects.none()
        
        # For list/retrieve operations, return all profiles (readable by everyone)
        if self.action in ['list', 'retrieve']:
            return AListHomeProProfile.objects.select_related('user').prefetch_related('service_categories')
        
        # For update/create/delete operations, filter by current user
        if not self.request.user.is_authenticated:
            return AListHomeProProfile.objects.none()
        
        return AListHomeProProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if profile already exists for this user
        existing_profile = AListHomeProProfile.objects.filter(user=self.request.user).first()
        if existing_profile:
            # Update existing profile instead of creating new one
            for key, value in serializer.validated_data.items():
                setattr(existing_profile, key, value)
            existing_profile.save()
            serializer.instance = existing_profile
        else:
            # Create new profile
            serializer.save(user=self.request.user)

    def get_object(self):
        """Get or create profile for the current user in update operations"""
        if self.action in ['update_address']:
            try:
                profile = AListHomeProProfile.objects.get(user=self.request.user)
                return profile
            except AListHomeProProfile.DoesNotExist:
                # Create new profile if doesn't exist
                return AListHomeProProfile.objects.create(user=self.request.user)
        else:
            # For other operations, use default behavior
            return super().get_object()

    @action(detail=False, methods=['post'])
    def update_address(self, request):
        """Update professional address with automatic geocoding"""
        try:
            profile = self.get_object()
            address_data = request.data.get('address', {})
            
            # Get or create address for this professional
            from core.models import Address
            address, created = Address.objects.get_or_create(
                user=request.user,
                is_primary=True,
                defaults={
                    'street_address': address_data.get('street_address', ''),
                    'city': address_data.get('city', ''),
                    'state': address_data.get('state', ''),
                    'zip_code': address_data.get('zip_code', ''),
                    'country': address_data.get('country', 'Egypt'),
                    'latitude': address_data.get('latitude'),
                    'longitude': address_data.get('longitude')
                }
            )
            
            if not created:
                # Update existing address
                address.street_address = address_data.get('street_address', address.street_address)
                address.city = address_data.get('city', address.city)
                address.state = address_data.get('state', address.state)
                address.zip_code = address_data.get('zip_code', address.zip_code)
                address.country = address_data.get('country', address.country)
                address.latitude = address_data.get('latitude')
                address.longitude = address_data.get('longitude')
            
            # If no coordinates provided, try to geocode
            if not address.latitude or not address.longitude:
                address_parts = [
                    address.street_address,
                    address.city,
                    address.state,
                    address.country
                ]
                address_string = ', '.join(filter(None, address_parts))
                
                if address_string:
                    try:
                        encoded_address = requests.utils.quote(address_string)
                        response = requests.get(
                            f'https://nominatim.openstreetmap.org/search?format=json&q={encoded_address}&limit=1&addressdetails=1',
                            headers={'User-Agent': 'AListHomePros/1.0'},
                            timeout=10
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data:
                                result = data[0]
                                address.latitude = float(result['lat'])
                                address.longitude = float(result['lon'])
                    except Exception as geocode_error:
                        print(f"Geocoding error: {geocode_error}")
            
            address.save()
            
            # Update profile with direct coordinates if needed
            if address.latitude and address.longitude:
                profile.latitude = address.latitude
                profile.longitude = address.longitude
                profile.save()
            
            # Serialize the updated profile
            serializer = self.get_serializer(profile)
            return Response({
                'message': 'Address updated successfully',
                'profile': serializer.data,
                'geocoded': bool(address.latitude and address.longitude)
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to update address: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        try:
            profile = AListHomeProProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except AListHomeProProfile.DoesNotExist:
            return Response({
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AListHomeProProfileDetailView(generics.RetrieveAPIView):
    """
    Retrieve an A-List Home Pro profile
    """
    queryset = AListHomeProProfile.objects.all()
    serializer_class = AListHomeProProfileSerializer
    permission_classes = [permissions.AllowAny]


class AListHomeProProfileCreateView(generics.CreateAPIView):
    """
    Create an A-List Home Pro profile (A-List Home Pros only)
    """
    serializer_class = AListHomeProProfileCreateUpdateSerializer
    permission_classes = [IsAListHomePro]
    
    def perform_create(self, serializer):
        # Ensure the profile is linked to the current user
        serializer.save(user=self.request.user)


class AListHomeProProfileUpdateView(generics.UpdateAPIView):
    """
    Update an A-List Home Pro profile (owner only)
    """
    serializer_class = AListHomeProProfileCreateUpdateSerializer
    permission_classes = [IsAListHomePro]
    
    def get_object(self):
        return get_object_or_404(AListHomeProProfile, user=self.request.user)


class AListHomeProPortfolioListCreateView(generics.ListCreateAPIView):
    """
    List and create portfolio items for an A-List Home Pro
    """
    serializer_class = AListHomeProPortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == UserRole.ADMIN:
            return AListHomeProPortfolio.objects.all()
        
        try:
            alistpro_profile = AListHomeProProfile.objects.get(user=self.request.user)
            return AListHomeProPortfolio.objects.filter(alistpro=alistpro_profile)
        except AListHomeProProfile.DoesNotExist:
            return AListHomeProPortfolio.objects.none()
    
    def perform_create(self, serializer):
        try:
            alistpro_profile = AListHomeProProfile.objects.get(user=self.request.user)
        except AListHomeProProfile.DoesNotExist:
            # Create a basic profile if it doesn't exist
            alistpro_profile = AListHomeProProfile.objects.create(
                user=self.request.user,
                business_name=self.request.user.name or f"{self.request.user.email}'s Business",
                business_description="Professional service provider",
                years_of_experience=0,
                service_radius=50,
                is_onboarded=True
            )
        
        # Debug logging
        print(f"Creating portfolio for user: {self.request.user.id}, profile: {alistpro_profile.id}")
        print(f"Request data: {self.request.data}")
        
        serializer.save(alistpro=alistpro_profile)


class AListHomeProPortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a portfolio item
    """
    serializer_class = AListHomeProPortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return AListHomeProPortfolio.objects.none()
            
        if hasattr(self.request.user, 'role') and self.request.user.role == UserRole.ADMIN:
            return AListHomeProPortfolio.objects.all()
        
        try:
            alistpro_profile = AListHomeProProfile.objects.get(user=self.request.user)
            return AListHomeProPortfolio.objects.filter(alistpro=alistpro_profile)
        except AListHomeProProfile.DoesNotExist:
            return AListHomeProPortfolio.objects.none()
    
    def check_object_permissions(self, request, obj):
        if request.user.role != UserRole.ADMIN and obj.alistpro.user != request.user:
            self.permission_denied(request, message="You do not have permission to modify this portfolio item.")
        return super().check_object_permissions(request, obj)


class AListHomeProReviewCreateView(generics.CreateAPIView):
    """
    Create a review for an A-List Home Pro (clients only)
    """
    serializer_class = AListHomeProReviewSerializer
    permission_classes = [IsClient]
    
    def perform_create(self, serializer):
        alistpro_id = self.kwargs.get('alistpro_id')
        alistpro_profile = get_object_or_404(AListHomeProProfile, id=alistpro_id)
        
        # Check if the client has already reviewed this A-List Home Pro
        existing_review = AListHomeProReview.objects.filter(
            alistpro=alistpro_profile,
            client=self.request.user
        ).first()
        
        if existing_review:
            raise serializers.ValidationError("You have already reviewed this A-List Home Pro.")
        
        serializer.save(alistpro=alistpro_profile, client=self.request.user)


class AdminPendingAListHomeProsView(generics.ListAPIView):
    """
    List A-List Home Pros that are not yet verified (admin only)
    """
    serializer_class = AListHomeProProfileSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        return AListHomeProProfile.objects.filter(is_onboarded=False)


class AListHomeProReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing A-List Home Pro reviews with filtering
    """
    queryset = AListHomeProReview.objects.all()
    serializer_class = AListHomeProReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alistpro', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return reviews based on filters"""
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return AListHomeProReview.objects.none()
            
        return AListHomeProReview.objects.all()
    
    def perform_create(self, serializer):
        """Create a new review"""
        alistpro_id = self.request.data.get('alistpro')
        if not alistpro_id:
            raise serializers.ValidationError({"alistpro": "This field is required."})
            
        alistpro_profile = get_object_or_404(AListHomeProProfile, id=alistpro_id)
        
        # Check if the client has already reviewed this A-List Home Pro
        existing_review = AListHomeProReview.objects.filter(
            alistpro=alistpro_profile,
            client=self.request.user
        ).first()
        
        if existing_review:
            raise serializers.ValidationError({"detail": "You have already reviewed this professional."})
        
        serializer.save(alistpro=alistpro_profile, client=self.request.user)
    
    @action(detail=False, methods=['get'])
    def for_professional(self, request):
        """Get reviews for a specific professional"""
        pro_id = request.query_params.get('alistpro')
        
        if not pro_id:
            return Response(
                {'detail': 'Professional ID (alistpro) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get the professional profile
            pro_profile = AListHomeProProfile.objects.get(id=pro_id)
            
            # Get reviews for this professional
            reviews = AListHomeProReview.objects.filter(alistpro=pro_profile).order_by('-created_at')
            serializer = self.get_serializer(reviews, many=True)
            
            return Response({
                'results': serializer.data,
                'count': reviews.count()
            })
        except AListHomeProProfile.DoesNotExist:
            return Response(
                {'detail': 'Professional not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reply_to_review(self, request, pk=None):
        """Allow professionals to reply to reviews"""
        review = self.get_object()
        response_text = request.data.get('response', '').strip()
        
        if not response_text:
            return Response(
                {'detail': 'Response text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the user is the professional who received this review
        try:
            professional_profile = AListHomeProProfile.objects.get(user=request.user)
            if review.alistpro != professional_profile:
                return Response(
                    {'detail': 'You can only reply to reviews for your own profile'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except AListHomeProProfile.DoesNotExist:
            return Response(
                {'detail': 'Professional profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already responded
        if review.professional_response:
            return Response(
                {'detail': 'You have already responded to this review'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add the response
        review.professional_response = response_text
        review.response_date = timezone.now()
        review.save()
        
        # Return updated review
        serializer = self.get_serializer(review)
        return Response({
            'message': 'Response added successfully',
            'review': serializer.data
        }, status=status.HTTP_200_OK)


class ServiceRequestListCreateView(generics.ListCreateAPIView):
    """List and create service requests"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'preferred_date', 'urgency']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ServiceRequest.objects.none()
        
        if user.role == 'client':
            # Clients see their own requests
            return ServiceRequest.objects.filter(client=user)
        else:
            # Professionals see public requests and requests assigned to them
            return ServiceRequest.objects.filter(
                Q(is_public=True, status__in=['pending', 'quoted']) | Q(professional=user)
            ).exclude(client=user)
    
    def perform_create(self, serializer):
        if self.request.user.role != 'client':
            raise permissions.PermissionDenied("Only clients can create service requests")
        serializer.save()


class ServiceRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get/update/delete service request"""
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ServiceRequest.objects.none()
        
        if user.role == 'client':
            return ServiceRequest.objects.filter(client=user)
        else:
            return ServiceRequest.objects.filter(
                Q(is_public=True) | Q(professional=user) | Q(client=user)
            )


class ServiceQuoteListCreateView(generics.ListCreateAPIView):
    """List and create service quotes"""
    serializer_class = ServiceQuoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'client':
            # Clients see quotes for their requests
            return ServiceQuote.objects.filter(service_request__client=user)
        else:
            # Professionals see their own quotes
            return ServiceQuote.objects.filter(professional=user)
    
    def perform_create(self, serializer):
        if self.request.user.role == 'client':
            raise permissions.PermissionDenied("Only professionals can create quotes")
        serializer.save()


class ServiceQuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get/update/delete service quote"""
    serializer_class = ServiceQuoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return ServiceQuote.objects.none()
        
        return ServiceQuote.objects.filter(
            Q(professional=user) | Q(service_request__client=user)
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_quote(request, quote_id):
    """Accept a service quote and create job assignment"""
    try:
        quote = ServiceQuote.objects.get(
            id=quote_id,
            service_request__client=request.user,
            status='pending'
        )
    except ServiceQuote.DoesNotExist:
        return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if service request is still available
    if quote.service_request.status not in ['pending', 'quoted']:
        return Response({'error': 'Service request is no longer available'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update quote status
    quote.status = 'accepted'
    quote.save()
    
    # Update service request status
    quote.service_request.status = 'accepted'
    quote.service_request.professional = quote.professional
    quote.service_request.save()
    
    # Create job assignment
    assignment = JobAssignment.objects.create(
        service_request=quote.service_request,
        quote=quote,
        professional=quote.professional,
        client=request.user,
        start_date=quote.start_date,
        completion_date=quote.completion_date,
        total_amount=quote.total_price,
        use_escrow=request.data.get('use_escrow', False)
    )
    
    # Reject other quotes for this request
    ServiceQuote.objects.filter(
        service_request=quote.service_request
    ).exclude(id=quote.id).update(status='rejected')
    
    serializer = JobAssignmentSerializer(assignment)
    return Response({
        'message': 'Quote accepted successfully',
        'assignment_id': assignment.id
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_quote(request, quote_id):
    """Reject a service quote"""
    try:
        quote = ServiceQuote.objects.get(
            id=quote_id,
            service_request__client=request.user,
            status='pending'
        )
    except ServiceQuote.DoesNotExist:
        return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update quote status
    quote.status = 'rejected'
    quote.rejection_reason = request.data.get('reason', '')
    quote.save()
    
    return Response({
        'message': 'Quote rejected successfully'
    }, status=status.HTTP_200_OK)


class JobAssignmentListView(generics.ListAPIView):
    """List job assignments"""
    serializer_class = JobAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return JobAssignment.objects.filter(client=user)
        else:
            return JobAssignment.objects.filter(professional=user)


class JobAssignmentDetailView(generics.RetrieveUpdateAPIView):
    """Get/update job assignment"""
    serializer_class = JobAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return JobAssignment.objects.none()
        
        return JobAssignment.objects.filter(
            Q(professional=user) | Q(client=user)
        )


class ClientDashboardView(APIView):
    """Dashboard data for clients"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'client':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Dashboard statistics
        now = timezone.now()
        
        # Active requests
        active_requests = ServiceRequest.objects.filter(
            client=request.user,
            status__in=['pending', 'quoted', 'accepted']
        ).count()
        
        # Active jobs
        active_jobs = JobAssignment.objects.filter(
            client=request.user,
            status__in=['assigned', 'in_progress']
        ).count()
        
        # Pending quotes
        pending_quotes = ServiceQuote.objects.filter(
            service_request__client=request.user,
            status='pending'
        ).count()
        
        # Completed jobs (to review)
        jobs_to_review = JobAssignment.objects.filter(
            client=request.user,
            status='completed',
            review__isnull=True
        ).count()
        
        return Response({
            'stats': {
                'active_requests': active_requests,
                'active_jobs': active_jobs,
                'pending_quotes': pending_quotes,
                'jobs_to_review': jobs_to_review
            }
        })


# Legacy views for backward compatibility
class AListHomeProProfileListView(generics.ListAPIView):
    """DEPRECATED: Use ProfessionalProfileListView instead"""
    queryset = AListHomeProProfile.objects.filter(is_onboarded=True)
    serializer_class = AListHomeProProfileSerializer
    permission_classes = [permissions.AllowAny]


class AListHomeProProfileDetailView(generics.RetrieveAPIView):
    """DEPRECATED: Use ProfessionalProfileDetailView instead"""
    queryset = AListHomeProProfile.objects.all()
    serializer_class = AListHomeProProfileSerializer
    permission_classes = [permissions.AllowAny]


# ========== NEW APIs FOR UPDATED WORKFLOW ==========

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_service_request_with_conversation(request):
    """
    إنشاء طلب خدمة مع محادثة فورية
    Create service request with immediate conversation
    """
    data = request.data.copy()
    data['client'] = request.user.id
    
    try:
        # التحقق من وجود professional_id
        professional_id = data.get('professional_id')
        if not professional_id:
            return Response({
                'error': 'professional_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # التحقق من وجود المحترف
        try:
            professional_user = User.objects.get(id=professional_id)
        except User.DoesNotExist:
            return Response({
                'error': 'Professional not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # إضافة المحترف لبيانات الطلب
        data['professional'] = professional_id
        
        # إنشاء طلب الخدمة
        serializer = ServiceRequestSerializer(data=data)
        if serializer.is_valid():
            service_request = serializer.save()
            
            # إنشاء محادثة فورية
            from messaging.models import Conversation
            conversation = Conversation.objects.create(
                title=f"Service Request: {service_request.title}",
                is_service_related=True
            )
            conversation.participants.add(request.user, professional_user)
            
            # ربط المحادثة بطلب الخدمة
            service_request.conversation = conversation
            service_request.save()
            
            # إرسال رسالة ترحيبية تلقائية
            from messaging.models import Message
            welcome_message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=f"مرحباً! لقد قمت بطلب خدمة: {service_request.title}\n\nالوصف: {service_request.description}\n\nأتطلع للتواصل معك لتحديد التفاصيل والموعد المناسب."
            )
            
            # إرسال إشعار للمحترف
            from notifications.models import Notification
            Notification.objects.create(
                user=professional_user,
                title="New Service Request",
                message=f"You have received a new service request: {service_request.title}",
                notification_type='service_request'
            )
            
            return Response({
                'service_request': serializer.data,
                'conversation_id': conversation.id,
                'conversation_title': conversation.title,
                'professional_name': professional_user.name,
                'message': 'Service request created successfully with conversation'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create service request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def schedule_appointment_from_conversation(request):
    """
    جدولة موعد من داخل محادثة
    Schedule appointment from within a conversation
    """
    conversation_id = request.data.get('conversation_id')
    
    if not conversation_id:
        return Response({
            'error': 'conversation_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from messaging.models import Conversation
        conversation = Conversation.objects.get(id=conversation_id)
        
        # التأكد من أن المستخدم مشارك في المحادثة
        if request.user not in conversation.participants.all():
            return Response({
                'error': 'You are not authorized to schedule appointments in this conversation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # الحصول على طلب الخدمة المرتبط
        service_request = getattr(conversation, 'service_request', None)
        if not service_request:
            return Response({
                'error': 'No service request associated with this conversation'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # استخراج بيانات الموعد المطلوبة
        appointment_date = request.data.get('appointment_date')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        
        if not all([appointment_date, start_time]):
            return Response({
                'error': 'appointment_date and start_time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # الحصول على ملف المحترف
        try:
            professional_profile = service_request.professional.alistpro_profile
        except:
            return Response({
                'error': 'Professional profile not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # التحقق من availability المحترف
        from scheduling.models import AvailabilitySlot, Appointment
        from datetime import datetime, time
        
        try:
            appointment_datetime = datetime.strptime(f"{appointment_date} {start_time}", "%Y-%m-%d %H:%M")
            appointment_time = time.fromisoformat(start_time)
            
            # التحقق من وجود availability slot متاح في هذا الوقت
            available_slots = AvailabilitySlot.objects.filter(
                professional=service_request.professional,
                date=appointment_date,
                start_time__lte=appointment_time,
                end_time__gte=appointment_time,
                is_available=True
            )
            
            if not available_slots.exists():
                return Response({
                    'error': f'المحترف غير متاح في {appointment_date} الساعة {start_time}. يرجى اختيار وقت آخر.',
                    'error_en': f'Professional is not available on {appointment_date} at {start_time}. Please choose another time.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # التحقق من عدم وجود موعد آخر في نفس الوقت
            conflicting_appointments = Appointment.objects.filter(
                alistpro=professional_profile,
                appointment_date=appointment_date,
                start_time=appointment_time,
                status__in=['scheduled', 'confirmed']
            )
            
            if conflicting_appointments.exists():
                return Response({
                    'error': f'المحترف لديه موعد آخر في {appointment_date} الساعة {start_time}. يرجى اختيار وقت آخر.',
                    'error_en': f'Professional has another appointment on {appointment_date} at {start_time}. Please choose another time.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError as e:
            return Response({
                'error': f'Invalid date/time format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # إنشاء بيانات الموعد
        appointment_data = request.data.copy()
        appointment_data['client'] = service_request.client.id
        appointment_data['alistpro'] = professional_profile.id
        
        # إضافة معلومات إضافية
        appointment_data['service_category'] = service_request.service_category.id if service_request.service_category else None
        appointment_data['notes'] = appointment_data.get('notes', f'Appointment for: {service_request.title}')
        appointment_data['location'] = appointment_data.get('location', 'To be confirmed')
        
        # إنشاء الموعد
        from scheduling.serializers import AppointmentSerializer
        serializer = AppointmentSerializer(data=appointment_data)
        
        if serializer.is_valid():
            appointment = serializer.save()
            
            # تحديث availability slot ليصبح غير متاح
            available_slot = available_slots.first()
            if available_slot:
                # إما تحديث الـ slot ليصبح غير متاح أو إنشاء appointment مرتبط به
                available_slot.is_available = False
                available_slot.appointment = appointment  # ربط الموعد بالـ slot إذا كان هناك foreign key
                available_slot.save()
            
            # تحديث حالة طلب الخدمة
            service_request.is_appointment_scheduled = True
            service_request.appointment_scheduled_at = timezone.now()
            service_request.status = 'in_progress'
            service_request.save()
            
            # إرسال رسالة في المحادثة
            from messaging.models import Message
            appointment_message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=f"✅ تم جدولة الموعد!\n\nالتاريخ: {appointment.appointment_date}\nالوقت: {appointment.start_time}\nالموقع: {appointment.location}\n\nيمكنك الآن إنشاء عرض سعر للخدمة.",
                message_type='appointment'
            )
            
            # إرسال إشعارات
            other_participants = conversation.participants.exclude(id=request.user.id)
            for participant in other_participants:
                from notifications.models import Notification
                Notification.objects.create(
                    user=participant,
                    title="Appointment Scheduled",
                    message=f"An appointment has been scheduled for {service_request.title} on {appointment.appointment_date} at {appointment.start_time}",
                    notification_type='appointment'
                )
            
            return Response({
                'appointment': serializer.data,
                'service_request_updated': True,
                'message': 'Appointment scheduled successfully'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Conversation.DoesNotExist:
        return Response({
            'error': 'Conversation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to schedule appointment: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_quote_with_installments(request):
    """
    إنشاء عرض سعر مع دعم الدفع المقسط
    Create quote with installment payment support
    """
    data = request.data.copy()
    data['professional'] = request.user.id
    
    # التأكد من أن المستخدم محترف
    if request.user.role not in ['contractor', 'specialist', 'crew']:
        return Response({
            'error': 'Only professionals can create quotes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # إنشاء عرض السعر
        serializer = ServiceQuoteSerializer(data=data)
        
        if serializer.is_valid():
            quote = serializer.save()
            
            # إنشاء Escrow Account للدفع المقسط إذا كان مدعوماً
            if quote.supports_installments:
                # الحصول على ملف المحترف
                try:
                    professional_profile = request.user.alistpro_profile
                except:
                    return Response({
                        'error': 'Professional profile not found'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # إنشاء EscrowAccount مع دفعتين (50%/50%)
                from payments.models import EscrowAccount
                escrow = EscrowAccount.create_installment_service(
                    client=quote.service_request.client,
                    professional=professional_profile,
                    title=quote.service_request.title,
                    description=quote.description,
                    total_amount=quote.total_price,
                    quote=quote
                )
            
            # إرسال إشعار للعميل
            from notifications.models import Notification
            Notification.objects.create(
                user=quote.service_request.client,
                title="New Quote Received",
                message=f"You have received a new quote for '{quote.service_request.title}' - Total: ${quote.total_price}",
                notification_type='quote'
            )
            
            # إرسال رسالة في المحادثة إذا كانت موجودة
            if hasattr(quote.service_request, 'conversation') and quote.service_request.conversation:
                from messaging.models import Message
                
                installment_info = ""
                if quote.supports_installments:
                    installment_info = f"\n\n💰 الدفع المقسط:\n• الدفعة الأولى: ${quote.first_payment_amount}\n• الدفعة الثانية: ${quote.second_payment_amount}"
                
                quote_message = Message.objects.create(
                    conversation=quote.service_request.conversation,
                    sender=request.user,
                    content=f"📋 عرض سعر جديد!\n\nالخدمة: {quote.title}\nالسعر الإجمالي: ${quote.total_price}\nمدة التنفيذ: {quote.estimated_duration}{installment_info}\n\nيمكنك الآن المراجعة والموافقة على العرض.",
                    message_type='quote'
                )
            
            response_data = {
                'quote': serializer.data,
                'installments_created': quote.supports_installments,
                'message': 'Quote created successfully'
            }
            
            # إضافة معلومات الـ escrow إذا تم إنشاؤه
            if quote.supports_installments:
                response_data.update({
                    'escrow_id': escrow.id,
                    'escrow_type': escrow.project_type,
                    'total_amount': str(escrow.total_amount),
                    'platform_fee': str(escrow.platform_fee),
                    'milestones_count': escrow.milestones.count(),
                    'first_milestone_amount': str(escrow.milestones.first().amount),
                    'second_milestone_amount': str(escrow.milestones.last().amount),
                    'message': 'Quote created successfully with escrow account'
                })
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create quote: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def book_service_directly(request, professional_id):
    """
    حجز خدمة مباشرة مع فتح محادثة فوراً
    Book service directly and create conversation immediately
    """
    try:
        # التحقق من وجود المحترف
        try:
            professional_profile = AListHomeProProfile.objects.get(id=professional_id)
            professional_user = professional_profile.user
        except AListHomeProProfile.DoesNotExist:
            return Response({
                'error': 'Professional not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من أن المستخدم عميل
        if request.user.role != 'client':
            return Response({
                'error': 'Only clients can book services'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # إنشاء عنوان افتراضي للخدمة
        from core.models import Address
        service_address = Address.objects.create(
            user=request.user,
            street_address=request.data.get('location', 'Client Address'),
            city='Unknown',
            state='Unknown',
            zip_code='00000',
            country='USA',
            is_primary=False
        )
        
        # الحصول على service category إن وجدت
        service_category = None
        if request.data.get('service_category'):
            try:
                service_category = ServiceCategory.objects.get(id=request.data.get('service_category'))
            except (ServiceCategory.DoesNotExist, ValueError):
                pass
        
        # إنشاء طلب خدمة
        service_data = {
            'title': request.data.get('title', 'Direct Service Booking'),
            'description': request.data.get('description', 'Service requested directly from search'),
            'service_address': service_address,
            'service_category': service_category,
            'urgency': request.data.get('urgency', 'medium'),
            'preferred_date': request.data.get('preferred_date'),
            'budget_min': 0,
            'budget_max': 1000,
            'status': 'accepted',  # مقبول مباشرة
            'is_public': False,
            'client': request.user,
            'professional': professional_user
        }
        
        # إنشاء طلب الخدمة مباشرة
        service_request = ServiceRequest.objects.create(**service_data)
        
        # إنشاء محادثة فوراً
        from messaging.models import Conversation, ConversationMember
        
        conversation = Conversation.objects.create(
            title=f"Service: {service_request.title}",
            related_object_type='servicerequest',
            related_object_id=service_request.id
        )
        
        # إضافة المشاركين
        conversation.participants.add(request.user)
        conversation.participants.add(professional_user)
        
        # إنشاء عضوية مفصلة
        ConversationMember.objects.create(
            conversation=conversation,
            user=request.user
        )
        
        ConversationMember.objects.create(
            conversation=conversation,
            user=professional_user
        )
        
        # إرسال رسالة ترحيب
        from messaging.models import Message
        welcome_message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=f"مرحباً! لقد قمت بحجز خدمة: {service_request.title}\n\nيمكننا الآن مناقشة التفاصيل وتحديد موعد للخدمة.",
            message_type='SYSTEM'
        )
        
        # ربط المحادثة بطلب الخدمة
        service_request.conversation = conversation
        service_request.save()
        
        # إرسال إشعار للمحترف
        from notifications.models import Notification
        Notification.objects.create(
            user=professional_user,
            title="New Direct Service Booking",
            message=f"You have received a direct booking for: {service_request.title}",
            notification_type='booking'
        )
        
        return Response({
            'service_request_id': service_request.id,
            'conversation_id': conversation.id,
            'message': 'Service booked successfully and conversation created',
            'next_step': 'Go to messages to discuss details and schedule appointment'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to book service: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_escrow_from_quote(request, quote_id):
    """
    إنشاء Escrow Account من عرض سعر مقبول
    Create Escrow Account from accepted quote
    """
    try:
        # الحصول على الكوت
        try:
            quote = ServiceQuote.objects.get(id=quote_id)
        except ServiceQuote.DoesNotExist:
            return Response({
                'error': 'Quote not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # التحقق من الصلاحيات
        if request.user != quote.service_request.client:
            return Response({
                'error': 'Only the client can create escrow for this quote'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # التحقق من حالة الكوت
        if quote.status != 'accepted':
            return Response({
                'error': 'Quote must be accepted before creating escrow'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # التحقق من عدم وجود escrow مسبقاً
        from payments.models import EscrowAccount
        existing_escrow = EscrowAccount.objects.filter(service_quote=quote).first()
        if existing_escrow:
            return Response({
                'error': 'Escrow already exists for this quote',
                'escrow_id': existing_escrow.id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # الحصول على ملف المحترف
        try:
            professional_profile = quote.professional.alistpro_profile
        except:
            return Response({
                'error': 'Professional profile not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # إنشاء EscrowAccount حسب نوع الدفع
        if quote.supports_installments:
            # دفع مقسط (50%/50%)
            escrow = EscrowAccount.create_installment_service(
                client=request.user,
                professional=professional_profile,
                title=quote.service_request.title,
                description=quote.description,
                total_amount=quote.total_price,
                quote=quote
            )
        else:
            # دفع واحد
            escrow = EscrowAccount.create_simple_service(
                client=request.user,
                professional=professional_profile,
                title=quote.service_request.title,
                description=quote.description,
                amount=quote.total_price
            )
            escrow.service_quote = quote
            escrow.save()
        
        # إرسال رسالة في المحادثة
        if hasattr(quote.service_request, 'conversation') and quote.service_request.conversation:
            from messaging.models import Message
            
            payment_info = ""
            if quote.supports_installments:
                first_milestone = escrow.milestones.first()
                second_milestone = escrow.milestones.last()
                payment_info = f"\n\n💰 نظام الدفع المقسط:\n• الدفعة الأولى: ${first_milestone.amount}\n• الدفعة الثانية: ${second_milestone.amount}"
            
            escrow_message = Message.objects.create(
                conversation=quote.service_request.conversation,
                sender=request.user,
                content=f"🔒 تم إنشاء حساب الضمان!\n\nالمبلغ الإجمالي: ${escrow.total_amount}\nعمولة المنصة: ${escrow.platform_fee}\nالمبلغ الصافي: ${escrow.net_amount}{payment_info}\n\nيمكنك الآن دفع الدفعة الأولى لبدء العمل.",
                message_type='escrow'
            )
        
        # إرسال إشعار للمحترف
        from notifications.models import Notification
        Notification.objects.create(
            user=quote.professional,
            title="Escrow Account Created",
            message=f"An escrow account has been created for: {quote.service_request.title}",
            notification_type='escrow'
        )
        
        return Response({
            'escrow_id': escrow.id,
            'escrow_type': escrow.project_type,
            'total_amount': str(escrow.total_amount),
            'platform_fee': str(escrow.platform_fee),
            'net_amount': str(escrow.net_amount),
            'milestones_count': escrow.milestones.count(),
            'next_milestone': {
                'id': escrow.get_next_pending_milestone().id if escrow.get_next_pending_milestone() else None,
                'amount': str(escrow.get_next_pending_milestone().amount) if escrow.get_next_pending_milestone() else None
            },
            'message': 'Escrow account created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create escrow: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
