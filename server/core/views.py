from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Address
from .serializers import AddressSerializer, AddressCreateSerializer
import requests
from django.conf import settings


class AddressPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AddressViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Address management
    """
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AddressPagination
    
    def get_queryset(self):
        # Handle swagger schema generation with fake view
        if getattr(self, 'swagger_fake_view', False):
            return Address.objects.none()
            
        user = self.request.user
        
        # Handle anonymous users
        if not user.is_authenticated:
            return Address.objects.none()
            
        queryset = Address.objects.filter(user=user).order_by('-created_at')
        
        # Filter by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(street_address__icontains=search) |
                Q(city__icontains=search) |
                Q(state__icontains=search) |
                Q(zip_code__icontains=search)
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AddressCreateSerializer
        return AddressSerializer
    
    def perform_create(self, serializer):
        # If this is being set as primary, remove primary from other addresses
        if serializer.validated_data.get('is_primary', False):
            Address.objects.filter(user=self.request.user, is_primary=True).update(is_primary=False)
        
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # If this is being set as primary, remove primary from other addresses
        if serializer.validated_data.get('is_primary', False):
            Address.objects.filter(
                user=self.request.user, 
                is_primary=True
            ).exclude(id=self.get_object().id).update(is_primary=False)
        
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def primary(self, request):
        """Get user's primary address"""
        try:
            primary_address = Address.objects.get(user=request.user, is_primary=True)
            serializer = self.get_serializer(primary_address)
            return Response(serializer.data)
        except Address.DoesNotExist:
            return Response(
                {'detail': 'No primary address found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set an address as primary"""
        address = self.get_object()
        
        # Remove primary from all other addresses
        Address.objects.filter(user=request.user, is_primary=True).update(is_primary=False)
        
        # Set this address as primary
        address.is_primary = True
        address.save()
        
        serializer = self.get_serializer(address)
        return Response({
            'message': 'Address set as primary successfully',
            'address': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get addresses within a certain radius (for map functionality)"""
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # Default 10km
        
        if not lat or not lng:
            return Response(
                {'error': 'Latitude and longitude are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For now, return all addresses (you can implement geospatial queries later)
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def geocode(self, request):
        """Geocode an address to get coordinates"""
        address_string = request.data.get('address', '')
        
        if not address_string:
            return Response({'error': 'Address string is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use OpenStreetMap Nominatim for geocoding (free)
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
                    return Response({
                        'latitude': float(result['lat']),
                        'longitude': float(result['lon']),
                        'display_name': result['display_name'],
                        'address_details': result.get('address', {})
                    })
            
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
            
        except requests.RequestException as e:
            return Response({'error': f'Geocoding service error: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def reverse_geocode(self, request):
        """Reverse geocode coordinates to get address"""
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if not latitude or not longitude:
            return Response({'error': 'Both latitude and longitude are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            response = requests.get(
                f'https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&addressdetails=1',
                headers={'User-Agent': 'AListHomePros/1.0'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and 'address' in data:
                    return Response({
                        'display_name': data['display_name'],
                        'address_details': data['address']
                    })
            
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
            
        except requests.RequestException as e:
            return Response({'error': f'Reverse geocoding service error: {str(e)}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def create_with_geocoding(self, request):
        """Create an address with automatic geocoding"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # If no coordinates provided, try to geocode
            if not serializer.validated_data.get('latitude') or not serializer.validated_data.get('longitude'):
                address_parts = [
                    serializer.validated_data.get('street_address', ''),
                    serializer.validated_data.get('city', ''),
                    serializer.validated_data.get('state', ''),
                    serializer.validated_data.get('country', '')
                ]
                address_string = ', '.join(filter(None, address_parts))
                
                if address_string:
                    geocode_response = self.geocode(type('obj', (object,), {'data': {'address': address_string}})())
                    if geocode_response.status_code == 200:
                        geocode_data = geocode_response.data
                        serializer.validated_data['latitude'] = geocode_data['latitude']
                        serializer.validated_data['longitude'] = geocode_data['longitude']
            
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
