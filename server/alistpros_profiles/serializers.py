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
        fields = ['id', 'street_address', 'city', 'state', 'zip_code', 'country', 'is_primary']


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
    service_address = AddressSerializer()
    service_category = ServiceCategorySerializer(read_only=True)
    service_category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    quotes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client', 'professional', 'title', 'description',
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
        
        # Create address
        address = Address.objects.create(user=self.context['request'].user, **address_data)
        
        # Create service request
        service_request = ServiceRequest.objects.create(
            client=self.context['request'].user,
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
    
    class Meta:
        model = AListHomeProProfile
        fields = '__all__'


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
    class Meta:
        model = AListHomeProPortfolio
        fields = '__all__'


class AListHomeProReviewSerializer(serializers.ModelSerializer):
    alistpro = AListHomeProProfileSerializer(read_only=True)
    client = UserSerializer(read_only=True)
    
    class Meta:
        model = AListHomeProReview
        fields = '__all__'
