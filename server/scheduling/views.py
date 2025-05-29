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


class IsAListHomeProOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an A-List Home Pro profile or admins to edit it
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user is admin
        if request.user.is_admin:
            return True
            
        # Check if user is the A-List Home Pro owner
        if hasattr(obj, 'alistpro'):
            return obj.alistpro.user == request.user
        elif isinstance(obj, AListHomeProProfile):
            return obj.user == request.user
            
        return False


class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    """ViewSet for managing A-List Home Pro availability slots"""
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsAListHomeProOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alistpro', 'day_of_week', 'is_recurring']
    ordering_fields = ['day_of_week', 'start_time']
    ordering = ['day_of_week', 'start_time']
    
    def get_queryset(self):
        """Return availability slots for A-List Home Pros or all if admin"""
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return AvailabilitySlot.objects.none()
            
        if hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            return AvailabilitySlot.objects.all()
            
        # If user is an A-List Home Pro, return their slots
        if hasattr(self.request.user, 'alistpro_profile'):
            return AvailabilitySlot.objects.filter(alistpro=self.request.user.alistpro_profile)
            
        # For clients, return slots for all A-List Home Pros
        return AvailabilitySlot.objects.all()
        
    @action(detail=False, methods=['get'])
    def for_professional(self, request):
        """Get availability slots for a specific professional"""
        pro_id = request.query_params.get('alistpro')
        
        if not pro_id:
            return Response(
                {'detail': 'Professional ID (alistpro) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Get the professional profile
            pro_profile = AListHomeProProfile.objects.get(id=pro_id)
            
            # Get availability slots for this professional
            slots = AvailabilitySlot.objects.filter(alistpro=pro_profile)
            serializer = self.get_serializer(slots, many=True)
            
            # Add day_name to each slot for easier frontend processing
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            results = []
            
            for slot_data in serializer.data:
                # Add day_name field based on day_of_week
                day_of_week = slot_data.get('day_of_week')
                if 0 <= day_of_week < len(day_names):
                    slot_data['day_name'] = day_names[day_of_week]
                results.append(slot_data)
            
            return Response({
                'results': results,
                'count': slots.count()
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


class UnavailableDateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing A-List Home Pro unavailable dates"""
    serializer_class = UnavailableDateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAListHomeProOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alistpro', 'date']
    ordering_fields = ['date']
    ordering = ['date']
    
    def get_queryset(self):
        """Return unavailable dates for A-List Home Pros or all if admin"""
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return UnavailableDate.objects.none()
            
        if hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            return UnavailableDate.objects.all()
            
        # If user is an A-List Home Pro, return their unavailable dates
        if hasattr(self.request.user, 'alistpro_profile'):
            return UnavailableDate.objects.filter(alistpro=self.request.user.alistpro_profile)
            
        # For clients, return unavailable dates for all A-List Home Pros
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
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return Appointment.objects.none()
            
        if hasattr(self.request.user, 'role') and self.request.user.role == 'admin':
            return Appointment.objects.all()
            
        # If user is an A-List Home Pro, return their appointments
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
        """Confirm an appointment (A-List Home Pro only)"""
        appointment = self.get_object()
        
        # Only A-List Home Pros can confirm appointments
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
        """Mark an appointment as completed (contractor only)"""
        appointment = self.get_object()
        
        # Only A-List Home Pros can mark appointments as completed
        if not hasattr(request.user, 'alistpro_profile') or request.user.alistpro_profile != appointment.alistpro:
            return Response(
                {'detail': 'Only the A-List Home Pro can mark appointments as completed'},
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
            # For A-List Home Pros, get their upcoming appointments
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
        # للحماية من أخطاء Swagger
        if getattr(self, 'swagger_fake_view', False):
            return AppointmentNote.objects.none()
            
        appointment_id = self.kwargs.get('appointment_pk')
        
        # Filter by appointment if provided
        if appointment_id:
            queryset = AppointmentNote.objects.filter(appointment_id=appointment_id)
        else:
            queryset = AppointmentNote.objects.all()
        
        # For non-admin users, filter out private notes from other users
        if hasattr(self.request.user, 'is_admin') and not self.request.user.is_admin:
            queryset = queryset.filter(
                Q(is_private=False) | Q(user=self.request.user)
            )
        
        return queryset.order_by('-created_at')
