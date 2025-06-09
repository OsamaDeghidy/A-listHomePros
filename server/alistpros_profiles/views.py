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
    filterset_class = AListHomeProFilter
    search_fields = ['business_name', 'business_description', 'user__name', 'service_categories__name']
    ordering_fields = ['business_name', 'years_of_experience', 'created_at']
    ordering = ['business_name']


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
        alistpro_profile = get_object_or_404(AListHomeProProfile, user=self.request.user)
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
