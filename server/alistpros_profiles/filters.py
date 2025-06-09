import django_filters
from django.db import models
from .models import AListHomeProProfile, ServiceRequest, ServiceQuote, JobAssignment


class AListHomeProFilter(django_filters.FilterSet):
    """
    Filter for A-List Home Pro profiles
    """
    business_name = django_filters.CharFilter(lookup_expr='icontains')
    min_years_experience = django_filters.NumberFilter(field_name='years_of_experience', lookup_expr='gte')
    service_category = django_filters.NumberFilter(field_name='service_categories', lookup_expr='exact')
    service_radius = django_filters.NumberFilter(field_name='service_radius', lookup_expr='gte')
    is_onboarded = django_filters.BooleanFilter()
    
    class Meta:
        model = AListHomeProProfile
        fields = [
            'business_name', 
            'min_years_experience', 
            'service_category',
            'service_radius',
            'is_onboarded'
        ]


# ProfessionalProfileFilter and ReviewFilter removed - use AListHomeProFilter instead


class ServiceRequestFilter(django_filters.FilterSet):
    """Filters for service requests"""
    
    # Status filters
    status = django_filters.ChoiceFilter(choices=ServiceRequest.STATUS_CHOICES)
    urgency = django_filters.ChoiceFilter(choices=ServiceRequest.URGENCY_CHOICES)
    
    # Category filter
    category = django_filters.NumberFilter(field_name='service_category__id')
    
    # Budget range
    min_budget = django_filters.NumberFilter(field_name='budget_min', lookup_expr='gte')
    max_budget = django_filters.NumberFilter(field_name='budget_max', lookup_expr='lte')
    
    # Date filters
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    preferred_date_after = django_filters.DateTimeFilter(field_name='preferred_date', lookup_expr='gte')
    preferred_date_before = django_filters.DateTimeFilter(field_name='preferred_date', lookup_expr='lte')
    
    # Location filters
    city = django_filters.CharFilter(field_name='service_address__city', lookup_expr='icontains')
    state = django_filters.CharFilter(field_name='service_address__state', lookup_expr='icontains')
    zip_code = django_filters.CharFilter(field_name='service_address__zip_code')
    
    # Public requests only
    is_public = django_filters.BooleanFilter(field_name='is_public')
    flexible_schedule = django_filters.BooleanFilter(field_name='flexible_schedule')
    
    class Meta:
        model = ServiceRequest
        fields = {
            'title': ['icontains'],
            'description': ['icontains'],
        }


class ServiceQuoteFilter(django_filters.FilterSet):
    """Filters for service quotes"""
    
    # Status filter
    status = django_filters.ChoiceFilter(choices=ServiceQuote.STATUS_CHOICES)
    
    # Price range
    min_price = django_filters.NumberFilter(field_name='total_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='total_price', lookup_expr='lte')
    
    # Date filters
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    start_date_after = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='gte')
    start_date_before = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='lte')
    
    # Service request info
    service_category = django_filters.NumberFilter(field_name='service_request__service_category__id')
    service_urgency = django_filters.ChoiceFilter(field_name='service_request__urgency', choices=ServiceRequest.URGENCY_CHOICES)
    
    # Materials and warranty
    materials_included = django_filters.BooleanFilter(field_name='materials_included')
    has_warranty = django_filters.BooleanFilter(method='filter_has_warranty')
    
    def filter_has_warranty(self, queryset, name, value):
        if value:
            return queryset.exclude(warranty_period='')
        else:
            return queryset.filter(warranty_period='')
    
    class Meta:
        model = ServiceQuote
        fields = {
            'title': ['icontains'],
            'description': ['icontains'],
            'estimated_duration': ['icontains'],
        }


class JobAssignmentFilter(django_filters.FilterSet):
    """Filters for job assignments"""
    
    # Status filter
    status = django_filters.ChoiceFilter(choices=JobAssignment.STATUS_CHOICES)
    payment_status = django_filters.CharFilter(field_name='payment_status')
    
    # Amount range
    min_amount = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    # Date filters
    start_date_after = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='gte')
    start_date_before = django_filters.DateTimeFilter(field_name='start_date', lookup_expr='lte')
    completion_date_after = django_filters.DateTimeFilter(field_name='completion_date', lookup_expr='gte')
    completion_date_before = django_filters.DateTimeFilter(field_name='completion_date', lookup_expr='lte')
    
    # Service info
    service_category = django_filters.NumberFilter(field_name='service_request__service_category__id')
    service_urgency = django_filters.ChoiceFilter(field_name='service_request__urgency', choices=ServiceRequest.URGENCY_CHOICES)
    
    # Escrow
    use_escrow = django_filters.BooleanFilter(field_name='use_escrow')
    
    class Meta:
        model = JobAssignment
        fields = {
            'progress_notes': ['icontains'],
        }
