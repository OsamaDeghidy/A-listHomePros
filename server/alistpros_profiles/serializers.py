from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ServiceCategory, ServiceRequest, ServiceQuote,
    JobAssignment, 
    # Main models
    AListHomeProProfile, AListHomeProPortfolio, AListHomeProReview
)
from core.models import Address
from users.serializers import UserSerializer

User = get_user_model()


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        ref_name = 'AListProAddressSerializer'
        fields = ['id', 'street_address', 'city', 'state', 'zip_code', 'country', 'latitude', 'longitude', 'is_primary']


class ServiceCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for service categories
    """
    class Meta:
        model = ServiceCategory
        fields = ('id', 'name', 'description', 'icon')
        ref_name = "AListHomeProServiceCategory"


# ProfessionalProfile serializers removed - use AListHomeProProfile serializers instead


class ServiceRequestSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    professional = UserSerializer(read_only=True)
    professional_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    service_address = AddressSerializer()
    service_category = ServiceCategorySerializer(read_only=True)
    service_category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    quotes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client', 'professional', 'professional_id', 'title', 'description',
            'service_category', 'service_category_id', 'urgency',
            'service_address', 'preferred_date', 'flexible_schedule',
            'budget_min', 'budget_max', 'status', 'is_public', 'images',
            'quotes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['client']
    
    def get_quotes_count(self, obj):
        return obj.quotes.count()
    
    def create(self, validated_data):
        address_data = validated_data.pop('service_address')
        service_category_id = validated_data.pop('service_category_id', None)
        professional_id = validated_data.pop('professional_id', None)
        
        # Create address
        address = Address.objects.create(user=self.context['request'].user, **address_data)
        
        # Get professional if provided
        professional = None
        if professional_id:
            try:
                User = get_user_model()
                professional = User.objects.get(id=professional_id)
            except User.DoesNotExist:
                pass
        
        # Create service request
        service_request = ServiceRequest.objects.create(
            client=self.context['request'].user,
            professional=professional,
            service_address=address,
            **validated_data
        )
        
        # Set service category
        if service_category_id:
            try:
                category = ServiceCategory.objects.get(id=service_category_id)
                service_request.service_category = category
                service_request.save()
            except ServiceCategory.DoesNotExist:
                pass
        
        return service_request


class ServiceQuoteSerializer(serializers.ModelSerializer):
    professional = UserSerializer(read_only=True)
    service_request = ServiceRequestSerializer(read_only=True)
    service_request_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ServiceQuote
        fields = [
            'id', 'service_request', 'service_request_id', 'professional',
            'title', 'description', 'total_price', 'estimated_duration',
            'start_date', 'completion_date', 'terms_and_conditions',
            'materials_included', 'warranty_period', 'status', 'expires_at',
            'client_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['professional', 'status']
    
    def create(self, validated_data):
        service_request_id = validated_data.pop('service_request_id')
        
        try:
            service_request = ServiceRequest.objects.get(id=service_request_id)
        except ServiceRequest.DoesNotExist:
            raise serializers.ValidationError("Service request not found")
        
        return ServiceQuote.objects.create(
            professional=self.context['request'].user,
            service_request=service_request,
            **validated_data
        )


class JobAssignmentSerializer(serializers.ModelSerializer):
    service_request = ServiceRequestSerializer(read_only=True)
    quote = ServiceQuoteSerializer(read_only=True)
    professional = UserSerializer(read_only=True)
    client = UserSerializer(read_only=True)
    
    class Meta:
        model = JobAssignment
        fields = [
            'id', 'service_request', 'quote', 'professional', 'client',
            'status', 'start_date', 'completion_date', 'actual_completion_date',
            'total_amount', 'payment_status', 'use_escrow',
            'progress_notes', 'completion_photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['service_request', 'quote', 'professional', 'client', 'total_amount']


# Availability, TimeOff, and Review serializers removed - use scheduling app models instead


# Legacy serializers for backward compatibility
class AListHomeProProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    service_categories = ServiceCategorySerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    full_address = serializers.SerializerMethodField()
    
    class Meta:
        model = AListHomeProProfile
        fields = '__all__'
    
    def get_full_address(self, obj):
        """Get formatted full address"""
        if obj.address:
            return f"{obj.address.street_address}, {obj.address.city}, {obj.address.state} {obj.address.zip_code}, {obj.address.country}"
        return None


class AListHomeProProfileCreateUpdateSerializer(serializers.ModelSerializer):
    """Create/Update serializer for AListHomeProProfile"""
    service_category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = AListHomeProProfile
        fields = [
            'business_name', 'business_description', 'years_of_experience',
            'license_number', 'insurance_info', 'service_radius',
            'profile_image', 'service_category_ids'
        ]
    
    def create(self, validated_data):
        service_category_ids = validated_data.pop('service_category_ids', [])
        
        # Create profile
        profile = AListHomeProProfile.objects.create(**validated_data)
        
        # Set service categories
        if service_category_ids:
            categories = ServiceCategory.objects.filter(id__in=service_category_ids)
            profile.service_categories.set(categories)
        
        return profile
    
    def update(self, instance, validated_data):
        service_category_ids = validated_data.pop('service_category_ids', None)
        
        # Update service categories
        if service_category_ids is not None:
            categories = ServiceCategory.objects.filter(id__in=service_category_ids)
            instance.service_categories.set(categories)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class AListHomeProPortfolioSerializer(serializers.ModelSerializer):
    alistpro = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = AListHomeProPortfolio
        fields = ['id', 'alistpro', 'title', 'description', 'image', 'completion_date', 'created_at', 'updated_at']
        read_only_fields = ['alistpro', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Validate title is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        return value.strip()
    
    def validate_image(self, value):
        """Validate image file"""
        if value:
            # Check file size (5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image file too large. Maximum size is 5MB.")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Unsupported image format. Use JPEG, PNG, GIF, or WebP.")
        
        return value


class AListHomeProReviewSerializer(serializers.ModelSerializer):
    alistpro = AListHomeProProfileSerializer(read_only=True)
    client = UserSerializer(read_only=True)
    
    class Meta:
        model = AListHomeProReview
        fields = '__all__'
