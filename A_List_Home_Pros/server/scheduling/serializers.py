from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from alistpros_profiles.models import AListHomeProProfile, ServiceCategory
from alistpros_profiles.serializers import ServiceCategorySerializer, AListHomeProProfileSerializer
from users.serializers import UserSerializer
from .models import AvailabilitySlot, UnavailableDate, Appointment, AppointmentNote

User = get_user_model()


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    """Serializer for A-List Pro availability slots"""
    day_name = serializers.SerializerMethodField()
    alistpro_info = serializers.SerializerMethodField()
    
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'alistpro', 'alistpro_info', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_recurring']
        read_only_fields = ['id', 'alistpro', 'alistpro_info', 'day_name']
    
    def get_day_name(self, obj):
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return day_names[obj.day_of_week]
    
    def get_alistpro_info(self, obj):
        """Return A-List Pro information"""
        if obj.alistpro:
            return {
                'id': obj.alistpro.id,
                'business_name': obj.alistpro.business_name,
                'user_email': obj.alistpro.user.email
            }
        return None
    
    def create(self, validated_data):
        """Create a new availability slot for the current A-List Pro"""
        user = self.context['request'].user
        print(f"🔍 Creating slot for user: {user.email}")
        print(f"🔍 Validated data: {validated_data}")
        
        try:
            alistpro_profile = AListHomeProProfile.objects.get(user=user)
            print(f"✅ Found A-List Pro profile: {alistpro_profile.business_name}")
        except AListHomeProProfile.DoesNotExist:
            print(f"❌ A-List Pro profile not found for user: {user.email}")
            print(f"🛠️ Creating basic A-List Pro profile...")
            
            # Create a basic profile automatically
            try:
                alistpro_profile = AListHomeProProfile.objects.create(
                    user=user,
                    business_name=f"{user.first_name} {user.last_name} Professional Services" if user.first_name else f"{user.email} Professional Services",
                    business_description="Professional service provider",
                    years_of_experience=1,
                    service_radius=25,
                    is_onboarded=False
                )
                print(f"✅ Created basic A-List Pro profile: {alistpro_profile.business_name}")
            except Exception as create_error:
                print(f"❌ Failed to create profile: {str(create_error)}")
                raise serializers.ValidationError({
                    "detail": f"Could not create professional profile: {str(create_error)}",
                    "user_email": user.email,
                    "suggestion": "Please complete your professional profile setup first"
                })
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            raise serializers.ValidationError({
                "detail": f"Error accessing profile: {str(e)}",
                "user_email": user.email
            })
        
        validated_data['alistpro'] = alistpro_profile
        return super().create(validated_data)


class UnavailableDateSerializer(serializers.ModelSerializer):
    """Serializer for A-List Pro unavailable dates"""
    
    class Meta:
        model = UnavailableDate
        fields = ['id', 'alistpro', 'start_date', 'end_date', 'reason']
        read_only_fields = ['id', 'alistpro']
    
    def create(self, validated_data):
        """Create a new unavailable date for the current A-List Pro"""
        user = self.context['request'].user
        print(f"🔍 Creating unavailable date for user: {user.email}")
        
        try:
            alistpro_profile = AListHomeProProfile.objects.get(user=user)
            print(f"✅ Found A-List Pro profile: {alistpro_profile.business_name}")
        except AListHomeProProfile.DoesNotExist:
            print(f"❌ A-List Pro profile not found for user: {user.email}")
            print(f"🛠️ Creating basic A-List Pro profile...")
            
            # Create a basic profile automatically
            try:
                alistpro_profile = AListHomeProProfile.objects.create(
                    user=user,
                    business_name=f"{user.first_name} {user.last_name} Professional Services" if user.first_name else f"{user.email} Professional Services",
                    business_description="Professional service provider",
                    years_of_experience=1,
                    service_radius=25,
                    is_onboarded=False
                )
                print(f"✅ Created basic A-List Pro profile: {alistpro_profile.business_name}")
            except Exception as create_error:
                print(f"❌ Failed to create profile: {str(create_error)}")
                raise serializers.ValidationError({
                    "detail": f"Could not create professional profile: {str(create_error)}",
                    "user_email": user.email,
                    "suggestion": "Please complete your professional profile setup first"
                })
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            raise serializers.ValidationError({
                "detail": f"Error accessing profile: {str(e)}",
                "user_email": user.email
            })
        
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
        Validate that the appointment time is available for the A-List Pro
        and that the pro offers the selected service
        """
        alistpro = data['alistpro']
        appointment_date = data['appointment_date']
        start_time = data['start_time']
        end_time = data['end_time']
        service_category = data.get('service_category')
        
        # Check if A-List Pro offers this service
        if service_category and not alistpro.service_categories.filter(id=service_category.id).exists():
            raise serializers.ValidationError(
                f"This professional does not offer {service_category.name} services"
            )
        
        # Check if the A-List Pro is available on this date
        if UnavailableDate.objects.filter(
            alistpro=alistpro, 
            start_date__lte=appointment_date, 
            end_date__gte=appointment_date
        ).exists():
            raise serializers.ValidationError("The professional is not available on this date")
        
        # Check if the time slot falls within the A-List Pro's availability
        day_of_week = appointment_date.weekday()
        available_slots = AvailabilitySlot.objects.filter(
            alistpro=alistpro,
            day_of_week=day_of_week,
            start_time__lte=start_time,
            end_time__gte=end_time
        )
        
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
            
            # Check if the A-List Pro is available on this date
            if UnavailableDate.objects.filter(
                alistpro=alistpro, 
                start_date__lte=appointment_date, 
                end_date__gte=appointment_date
            ).exists():
                raise serializers.ValidationError("The professional is not available on this date")
            
            # Check if the time slot falls within the A-List Pro's availability
            day_of_week = appointment_date.weekday()
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
