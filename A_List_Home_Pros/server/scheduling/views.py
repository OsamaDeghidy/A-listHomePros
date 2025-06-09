from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import AvailabilitySlot, UnavailableDate, Appointment, AppointmentNote
from .serializers import (
    AvailabilitySlotSerializer,
    UnavailableDateSerializer,
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    AppointmentNoteSerializer
)
from users.permissions import IsOwnerOrAdmin
from alistpros_profiles.models import AListHomeProProfile


class IsAListProOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an A-List Pro profile or admins to edit it
    """
    def has_permission(self, request, view):
        """Check basic permission"""
        print(f"🔐 Checking permission for user: {request.user.email}")
        print(f"🔐 User is authenticated: {request.user.is_authenticated}")
        print(f"🔐 Request method: {request.method}")
        
        # User must be authenticated
        if not request.user.is_authenticated:
            print("❌ User not authenticated")
            return False
            
        # For SAFE_METHODS (GET, HEAD, OPTIONS), allow access
        if request.method in permissions.SAFE_METHODS:
            print("✅ Safe method allowed")
            return True
            
        # For write methods, user needs to be authenticated
        print("✅ Write method allowed for authenticated user")
        return True
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permission"""
        print(f"🔐 Checking object permission for: {obj}")
        
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            print("✅ Safe method - object permission granted")
            return True
            
        # Check if user is admin
        if hasattr(request.user, 'is_admin') and request.user.is_admin:
            print("✅ Admin user - object permission granted")
            return True
            
        # Check if user is the A-List Pro owner
        if hasattr(obj, 'alistpro'):
            is_owner = obj.alistpro.user == request.user
            print(f"🔐 Is owner check: {is_owner}")
            return is_owner
        elif isinstance(obj, AListHomeProProfile):
            is_owner = obj.user == request.user
            print(f"🔐 Is profile owner: {is_owner}")
            return is_owner
            
        print("❌ No ownership found")
        return False


class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    """ViewSet for managing A-List Pro availability slots"""
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsAListProOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alistpro', 'day_of_week', 'is_recurring']
    ordering_fields = ['day_of_week', 'start_time']
    ordering = ['day_of_week', 'start_time']
    
    def create(self, request, *args, **kwargs):
        """Create a new availability slot with enhanced logging"""
        print(f"🚀 Creating availability slot - User: {request.user.email}")
        print(f"🚀 Request data: {request.data}")
        
        try:
            response = super().create(request, *args, **kwargs)
            print(f"✅ Slot created successfully: {response.data}")
            return response
        except Exception as e:
            print(f"❌ Error creating slot: {str(e)}")
            print(f"❌ Error type: {type(e)}")
            raise
    
    def get_queryset(self):
        """Return availability slots for A-List Pros or all if admin"""
        user = self.request.user
        print(f"🔍 Getting queryset for user: {user.email}")
        
        if hasattr(user, 'is_admin') and user.is_admin:
            print("✅ Admin user - returning all slots")
            return AvailabilitySlot.objects.all()
            
        # If user is an A-List Pro, return their slots
        if hasattr(user, 'alistpro_profile'):
            print(f"✅ A-List Pro user - returning their slots")
            return AvailabilitySlot.objects.filter(alistpro=user.alistpro_profile)
            
        # For clients, return slots for all A-List Pros
        print("✅ Client user - returning all slots")
        return AvailabilitySlot.objects.all()
    
    @action(detail=False, methods=['get'])
    def for_professional(self, request):
        """Get availability slots for a specific professional"""
        alistpro_id = request.query_params.get('alistpro')
        
        if alistpro_id:
            # Get slots for specific professional
            queryset = AvailabilitySlot.objects.filter(alistpro_id=alistpro_id)
        else:
            # Get slots for current user if they are a professional
            if hasattr(request.user, 'alistpro_profile'):
                queryset = AvailabilitySlot.objects.filter(alistpro=request.user.alistpro_profile)
            else:
                queryset = AvailabilitySlot.objects.none()
        
        queryset = queryset.order_by('day_of_week', 'start_time')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_slot(self, request):
        """Custom endpoint to create availability slot with better error handling"""
        print(f"🚀 Custom create_slot - User: {request.user.email}")
        print(f"🚀 Request data: {request.data}")
        
        try:
            # Get or create A-List Pro profile
            try:
                alistpro_profile = AListHomeProProfile.objects.get(user=request.user)
                print(f"✅ Found A-List Pro profile: {alistpro_profile.business_name}")
            except AListHomeProProfile.DoesNotExist:
                print(f"🛠️ Creating basic A-List Pro profile for: {request.user.email}")
                alistpro_profile = AListHomeProProfile.objects.create(
                    user=request.user,
                    business_name=f"{request.user.first_name} {request.user.last_name} Professional Services" if request.user.first_name else f"{request.user.email} Professional Services",
                    business_description="Professional service provider",
                    years_of_experience=1,
                    service_radius=25,
                    is_onboarded=False
                )
                print(f"✅ Created A-List Pro profile: {alistpro_profile.business_name}")
            
            # Create availability slot
            slot_data = {
                'alistpro': alistpro_profile,
                'day_of_week': request.data.get('day_of_week'),
                'start_time': request.data.get('start_time'),
                'end_time': request.data.get('end_time'),
                'is_recurring': request.data.get('is_recurring', True)
            }
            
            slot = AvailabilitySlot.objects.create(**slot_data)
            print(f"✅ Created slot: {slot}")
            
            # Serialize response
            serializer = self.get_serializer(slot)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"❌ Error in create_slot: {str(e)}")
            print(f"❌ Error type: {type(e)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            
            return Response({
                'error': str(e),
                'detail': 'Error creating availability slot'
            }, status=status.HTTP_400_BAD_REQUEST)


class UnavailableDateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing A-List Pro unavailable dates"""
    serializer_class = UnavailableDateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAListProOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alistpro', 'start_date', 'end_date']
    ordering_fields = ['start_date']
    ordering = ['start_date']
    
    def get_queryset(self):
        """Return unavailable dates for A-List Pros or all if admin"""
        if self.request.user.is_admin:
            return UnavailableDate.objects.all()
            
        # If user is an A-List Pro, return their unavailable dates
        if hasattr(self.request.user, 'alistpro_profile'):
            return UnavailableDate.objects.filter(alistpro=self.request.user.alistpro_profile)
            
        # For clients, return unavailable dates for all A-List Pros
        return UnavailableDate.objects.all()


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing appointments"""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['alistpro', 'client', 'appointment_date', 'status']
    ordering_fields = ['appointment_date', 'start_time', 'created_at']
    ordering = ['appointment_date', 'start_time']
    search_fields = ['notes', 'location']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        """Return appointments based on user role"""
        if self.request.user.role == 'admin':
            return Appointment.objects.all()
            
        # If user is an A-List Pro, return their appointments
        if hasattr(self.request.user, 'alistpro_profile'):
            return Appointment.objects.filter(alistpro=self.request.user.alistpro_profile)
            
        # For clients, return their appointments
        return Appointment.objects.filter(client=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        
        # Only allow cancellation of requested or confirmed appointments
        if appointment.status not in ['REQUESTED', 'CONFIRMED']:
            return Response(
                {'detail': 'Cannot cancel an appointment that is not requested or confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'CANCELLED'
        appointment.save()
        
        # Create a note about the cancellation
        AppointmentNote.objects.create(
            appointment=appointment,
            user=request.user,
            note=f"Appointment cancelled by {request.user.name}"
        )
        
        return Response({'status': 'appointment cancelled'})
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment (A-List Pro only)"""
        appointment = self.get_object()
        
        # Only A-List Pros can confirm appointments
        if not hasattr(request.user, 'alistpro_profile') or request.user.alistpro_profile != appointment.alistpro:
            return Response(
                {'detail': 'Only the professional can confirm appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow confirmation of requested appointments
        if appointment.status != 'REQUESTED':
            return Response(
                {'detail': 'Cannot confirm an appointment that is not in requested status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'CONFIRMED'
        appointment.save()
        
        # Create a note about the confirmation
        AppointmentNote.objects.create(
            appointment=appointment,
            user=request.user,
            note=f"Appointment confirmed by {request.user.name}"
        )
        
        return Response({'status': 'appointment confirmed'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark an appointment as completed (A-List Pro only)"""
        appointment = self.get_object()
        
        # Only A-List Pros can mark appointments as completed
        if not hasattr(request.user, 'alistpro_profile') or request.user.alistpro_profile != appointment.alistpro:
            return Response(
                {'detail': 'Only the professional can mark appointments as completed'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow completion of confirmed appointments
        if appointment.status != 'CONFIRMED':
            return Response(
                {'detail': 'Cannot complete an appointment that is not confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'COMPLETED'
        appointment.save()
        
        # Create a note about the completion
        AppointmentNote.objects.create(
            appointment=appointment,
            user=request.user,
            note=f"Appointment marked as completed by {request.user.name}"
        )
        
        return Response({'status': 'appointment completed'})
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments for the current user"""
        today = timezone.now().date()
        
        if hasattr(request.user, 'alistpro_profile'):
            # For A-List Pros, get their upcoming appointments
            appointments = Appointment.objects.filter(
                alistpro=request.user.alistpro_profile,
                appointment_date__gte=today,
                status__in=['REQUESTED', 'CONFIRMED']
            ).order_by('appointment_date', 'start_time')
        else:
            # For clients, get their upcoming appointments
            appointments = Appointment.objects.filter(
                client=request.user,
                appointment_date__gte=today,
                status__in=['REQUESTED', 'CONFIRMED']
            ).order_by('appointment_date', 'start_time')
        
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)


class AppointmentNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing appointment notes"""
    serializer_class = AppointmentNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return notes for an appointment"""
        appointment_id = self.kwargs.get('appointment_pk')
        
        # Filter by appointment if provided
        if appointment_id:
            queryset = AppointmentNote.objects.filter(appointment_id=appointment_id)
        else:
            queryset = AppointmentNote.objects.all()
        
        # For non-admin users, filter out private notes from other users
        if not self.request.user.is_admin:
            queryset = queryset.filter(
                Q(is_private=False) | Q(user=self.request.user)
            )
        
        return queryset.order_by('-created_at')
