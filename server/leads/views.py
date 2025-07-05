from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import generics, permissions
from .models import Lead
from .serializers import LeadSerializer
from payments.feature_access import requires_feature, FeatureAccessMixin
from payments.services import FeatureAccessService

# Create your views here.

class LeadListView(FeatureAccessMixin, generics.ListAPIView):
    """List leads with feature access control"""
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check feature access
        has_access, message = self.check_feature_access('unlimited_project_leads')
        if not has_access:
            return Lead.objects.none()
        
        # Check for exclusive leads access
        has_exclusive, _ = self.check_feature_access('exclusive_leads_access')
        
        queryset = Lead.objects.filter(
            location__icontains=self.request.user.profile.location
        )
        
        if has_exclusive:
            # Premium users get all leads including exclusive ones
            return queryset
        else:
            # Basic users get only non-exclusive leads
            return queryset.filter(is_exclusive=False)

@requires_feature('unlimited_project_leads')
def get_lead_details(request, lead_id):
    """Get lead details - requires unlimited_project_leads feature"""
    lead = get_object_or_404(Lead, id=lead_id)
    
    # Additional check for exclusive leads
    if lead.is_exclusive:
        has_exclusive = FeatureAccessService.check_feature(request.user, 'exclusive_leads_access')
        if not has_exclusive:
            return JsonResponse({
                'error': 'This is an exclusive lead. Upgrade to Premium to access.',
                'upgrade_url': '/subscription-plans'
            }, status=403)
    
    return JsonResponse({
        'id': lead.id,
        'title': lead.title,
        'description': lead.description,
        'budget': lead.budget,
        'is_exclusive': lead.is_exclusive
    })

@requires_feature('hire_crew_members')
def hire_crew_member(request):
    """Hire crew member - requires hire_crew_members feature"""
    crew_id = request.POST.get('crew_id')
    project_id = request.POST.get('project_id')
    
    # Hiring logic here
    return JsonResponse({'message': 'Crew member hired successfully'})
