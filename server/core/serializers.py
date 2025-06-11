from rest_framework import serializers
from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for Address model - read operations
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    full_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Address
        ref_name = 'CoreAddressSerializer'
        fields = [
            'id', 'street_address', 'city', 'state', 'zip_code', 
            'country', 'latitude', 'longitude', 'is_primary', 
            'user_name', 'user_email', 'full_address', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_full_address(self, obj):
        """Return formatted full address"""
        return f"{obj.street_address}, {obj.city}, {obj.state} {obj.zip_code}, {obj.country}"


class AddressCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for Address model - create/update operations
    """
    class Meta:
        model = Address
        ref_name = 'CoreAddressCreateSerializer'
        fields = [
            'street_address', 'city', 'state', 'zip_code', 
            'country', 'latitude', 'longitude', 'is_primary'
        ]
    
    def validate(self, data):
        """
        Custom validation for address creation
        """
        # Ensure required fields are provided
        required_fields = ['street_address', 'city', 'state']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} is required."
                })
        
        return data
    
    def validate_zip_code(self, value):
        """
        Validate zip code format
        """
        if value and len(value) < 3:
            raise serializers.ValidationError("Zip code must be at least 3 characters long.")
        return value


class AddressLocationSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for location-based queries (for maps)
    """
    full_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Address
        ref_name = 'CoreAddressLocationSerializer'
        fields = ['id', 'city', 'state', 'country', 'latitude', 'longitude', 'full_address', 'is_primary']
    
    def get_full_address(self, obj):
        return f"{obj.city}, {obj.state}, {obj.country}" 