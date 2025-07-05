from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from alistpros_profiles.models import AListHomeProProfile, ServiceCategory
from alistpros_profiles.serializers import ServiceCategorySerializer, AListHomeProProfileSerializer
from users.serializers import UserSerializer
from .models import AvailabilitySlot, UnavailableDate, Appointment, AppointmentNote

User = get_user_model()


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    """Serializer for A-List Home Pro availability slots"""
    day_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'alistpro', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_recurring']
        read_only_fields = ['id', 'alistpro']
    
    def get_day_name(self, obj):
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return day_names[obj.day_of_week]
    
    def create(self, validated_data):
        """Create availability slot with automatic profile creation"""
        request = self.context.get('request')
        if request and request.user:
            try:
                alistpro_profile = AListHomeProProfile.objects.get(user=request.user)
            except AListHomeProProfile.DoesNotExist:
                # Create basic profile
                alistpro_profile = AListHomeProProfile.objects.create(
                    user=request.user,
                    business_name=f"{request.user.first_name} {request.user.last_name} Professional Services" if request.user.first_name else f"{request.user.email} Professional Services",
                    business_description="Professional service provider",
                    years_of_experience=1,
                    service_radius=25,
                    is_onboarded=False
                )
            
            validated_data['alistpro'] = alistpro_profile
        
        return super().create(validated_data)


class UnavailableDateSerializer(serializers.ModelSerializer):
    """Serializer for A-List Home Pro unavailable dates"""
    class Meta:
        model = UnavailableDate
        fields = ['id', 'alistpro', 'start_date', 'end_date', 'reason']
        read_only_fields = ['id', 'alistpro']
    
    def create(self, validated_data):
        """Create unavailable date with automatic profile creation"""
        request = self.context.get('request')
        if request and request.user:
            try:
                alistpro_profile = AListHomeProProfile.objects.get(user=request.user)
            except AListHomeProProfile.DoesNotExist:
                # Create basic profile
                alistpro_profile = AListHomeProProfile.objects.create(
                    user=request.user,
                    business_name=f"{request.user.first_name} {request.user.last_name} Professional Services" if request.user.first_name else f"{request.user.email} Professional Services",
                    business_description="Professional service provider",
                    years_of_experience=1,
                    service_radius=25,
                    is_onboarded=False
                )
            
            validated_data['alistpro'] = alistpro_profile
        
        return super().create(validated_data)


class AppointmentNoteSerializer(serializers.ModelSerializer):
    """Serializer for appointment notes"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AppointmentNote
        fields = ['id', 'appointment', 'user', 'note', 'is_private', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
    
    def create(self, validated_data):
        """Create a new appointment note with the current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for appointments"""
    client = UserSerializer(read_only=True)
    alistpro = AListHomeProProfileSerializer(read_only=True)
    service_category = ServiceCategorySerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    notes = AppointmentNoteSerializer(source='appointment_notes', many=True, read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'alistpro', 'service_category', 'appointment_date', 
            'start_time', 'end_time', 'status', 'status_display', 'notes', 
            'location', 'estimated_cost', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments"""
    class Meta:
        model = Appointment
        fields = [
            'alistpro', 'service_category', 'appointment_date', 
            'start_time', 'end_time', 'notes', 'location', 'estimated_cost'
        ]
    
    def validate(self, data):
        """
        Validate that the appointment time is available for the A-List Home Pro
        and that the A-List Home Pro offers the selected service
        """
        alistpro = data['alistpro']
        appointment_date = data['appointment_date']
        start_time = data['start_time']
        end_time = data['end_time']
        service_category = data.get('service_category')
        
        print(f"🔍 Validating appointment for alistpro: {alistpro} ({alistpro.id})")
        print(f"🔍 Appointment date: {appointment_date}")
        print(f"🔍 Start time: {start_time}, End time: {end_time}")
        
        # Check if alistpro offers this service
        if service_category and not alistpro.service_categories.filter(id=service_category.id).exists():
            raise serializers.ValidationError(
                f"This professional does not offer {service_category.name} services"
            )
        
        # Check if the alistpro is available on this date
        if UnavailableDate.objects.filter(
            alistpro=alistpro, 
            start_date__lte=appointment_date,
            end_date__gte=appointment_date
        ).exists() or UnavailableDate.objects.filter(
            alistpro=alistpro, 
            start_date=appointment_date,
            end_date__isnull=True
        ).exists():
            raise serializers.ValidationError("The professional is not available on this date")
        
        # Check if the time slot falls within the alistpro's availability
        # Convert Python weekday (0=Monday) to our model format (0=Sunday)
        python_day_of_week = appointment_date.weekday()  # 0=Monday, 1=Tuesday..., 6=Sunday
        day_of_week = (python_day_of_week + 1) % 7  # Convert to 0=Sunday, 1=Monday..., 6=Saturday
        
        print(f"🔍 Python day_of_week: {python_day_of_week}, Converted day_of_week: {day_of_week}")
        
        available_slots = AvailabilitySlot.objects.filter(
            alistpro=alistpro,
            day_of_week=day_of_week,
            start_time__lte=start_time,
            end_time__gte=end_time
        )
        
        print(f"🔍 Available slots found: {available_slots.count()}")
        for slot in available_slots:
            print(f"   - Slot: day {slot.day_of_week}, {slot.start_time}-{slot.end_time}")
        
        if not available_slots.exists():
            raise serializers.ValidationError("The professional is not available during this time slot")
        
        # Check for overlapping appointments
        overlapping_appointments = Appointment.objects.filter(
            alistpro=alistpro,
            appointment_date=appointment_date,
            status__in=['REQUESTED', 'CONFIRMED'],
        ).filter(
            # Check for time overlap
            models.Q(start_time__lt=end_time, end_time__gt=start_time)
        )
        
        if overlapping_appointments.exists():
            raise serializers.ValidationError("The professional already has an appointment during this time")
        
        return data
    
    def create(self, validated_data):
        """Create a new appointment with the current user as client"""
        validated_data['client'] = self.context['request'].user
        validated_data['status'] = 'REQUESTED'
        return super().create(validated_data)


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointments"""
    class Meta:
        model = Appointment
        fields = ['status', 'appointment_date', 'start_time', 'end_time', 'notes', 'location', 'estimated_cost']
    
    def validate(self, data):
        """Validate the updated appointment data"""
        instance = self.instance
        appointment_date = data.get('appointment_date', instance.appointment_date)
        start_time = data.get('start_time', instance.start_time)
        end_time = data.get('end_time', instance.end_time)
        
        # If rescheduling, check availability
        if 'appointment_date' in data or 'start_time' in data or 'end_time' in data:
            alistpro = instance.alistpro
            
            # Check if the alistpro is available on this date
            if UnavailableDate.objects.filter(
                alistpro=alistpro, 
                start_date__lte=appointment_date,
                end_date__gte=appointment_date
            ).exists() or UnavailableDate.objects.filter(
                alistpro=alistpro, 
                start_date=appointment_date,
                end_date__isnull=True
            ).exists():
                raise serializers.ValidationError("The professional is not available on this date")
            
            # Check if the time slot falls within the alistpro's availability
            # Convert Python weekday (0=Monday) to our model format (0=Sunday)
            python_day_of_week = appointment_date.weekday()  # 0=Monday, 1=Tuesday..., 6=Sunday
            day_of_week = (python_day_of_week + 1) % 7  # Convert to 0=Sunday, 1=Monday..., 6=Saturday
            available_slots = AvailabilitySlot.objects.filter(
                alistpro=alistpro,
                day_of_week=day_of_week,
                start_time__lte=start_time,
                end_time__gte=end_time
            )
            
            if not available_slots.exists():
                raise serializers.ValidationError("The professional is not available during this time slot")
            
            # Check for overlapping appointments (excluding this one)
            overlapping_appointments = Appointment.objects.filter(
                alistpro=alistpro,
                appointment_date=appointment_date,
                status__in=['REQUESTED', 'CONFIRMED'],
            ).exclude(id=instance.id).filter(
                # Check for time overlap
                models.Q(start_time__lt=end_time, end_time__gt=start_time)
            )
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError("The professional already has an appointment during this time")
        
        return data
