# نظام فحص المميزات المحسن
# Enhanced Feature Access System

from functools import wraps
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from .models import UserSubscription
from .subscription_plans import SUBSCRIPTION_PLANS, has_feature_access, get_feature_permissions

class FeatureAccessMixin:
    """Mixin for checking feature access in views"""
    
    def check_feature_access(self, feature_key):
        """Check if current user has access to feature"""
        if not self.request.user.is_authenticated:
            return False, "Authentication required"
        
        try:
            subscription = UserSubscription.objects.get(user=self.request.user)
            if not subscription.is_active:
                return False, "No active subscription"
            
            plan_key = f"{subscription.plan.plan_type}_{subscription.plan.tier}"
            
            if has_feature_access(plan_key, feature_key):
                return True, "Access granted"
            else:
                return False, f"Feature '{feature_key}' not available in your current plan"
                
        except UserSubscription.DoesNotExist:
            return False, "No subscription found"

def requires_feature(feature_key):
    """Decorator to require specific feature access"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({
                    'error': 'Authentication required',
                    'feature_required': feature_key
                }, status=401)
            
            try:
                subscription = UserSubscription.objects.get(user=request.user)
                if not subscription.is_active:
                    return JsonResponse({
                        'error': 'No active subscription',
                        'feature_required': feature_key,
                        'upgrade_url': '/subscription-plans'
                    }, status=403)
                
                plan_key = f"{subscription.plan.plan_type}_{subscription.plan.tier}"
                
                if has_feature_access(plan_key, feature_key):
                    return view_func(request, *args, **kwargs)
                else:
                    return JsonResponse({
                        'error': f'Feature "{feature_key}" not available in your current plan',
                        'current_plan': subscription.plan.name,
                        'feature_required': feature_key,
                        'upgrade_url': '/subscription-plans'
                    }, status=403)
                    
            except UserSubscription.DoesNotExist:
                return JsonResponse({
                    'error': 'No subscription found',
                    'feature_required': feature_key,
                    'upgrade_url': '/subscription-plans'
                }, status=403)
        
        return wrapper
    return decorator

def requires_plan_tier(plan_type, tier):
    """Decorator to require specific plan tier"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            
            try:
                subscription = UserSubscription.objects.get(user=request.user)
                if not subscription.is_active:
                    return JsonResponse({
                        'error': 'No active subscription',
                        'required_plan': f'{plan_type}_{tier}',
                        'upgrade_url': '/subscription-plans'
                    }, status=403)
                
                if (subscription.plan.plan_type == plan_type and 
                    subscription.plan.tier == tier):
                    return view_func(request, *args, **kwargs)
                else:
                    return JsonResponse({
                        'error': f'This feature requires {plan_type} {tier} plan',
                        'current_plan': subscription.plan.name,
                        'required_plan': f'{plan_type}_{tier}',
                        'upgrade_url': '/subscription-plans'
                    }, status=403)
                    
            except UserSubscription.DoesNotExist:
                return JsonResponse({
                    'error': 'No subscription found',
                    'required_plan': f'{plan_type}_{tier}',
                    'upgrade_url': '/subscription-plans'
                }, status=403)
        
        return wrapper
    return decorator

class FeatureAccessService:
    """Service for checking feature access"""
    
    @staticmethod
    def get_user_features(user):
        """Get all features available to user"""
        try:
            subscription = UserSubscription.objects.get(user=user)
            if not subscription.is_active:
                return []
            
            plan_key = f"{subscription.plan.plan_type}_{subscription.plan.tier}"
            plan_config = SUBSCRIPTION_PLANS.get(plan_key, {})
            return plan_config.get('features', [])
            
        except UserSubscription.DoesNotExist:
            return []
    
    @staticmethod
    def check_feature(user, feature_key):
        """Check if user has specific feature"""
        user_features = FeatureAccessService.get_user_features(user)
        return feature_key in user_features
    
    @staticmethod
    def get_missing_features(user, required_features):
        """Get features user doesn't have"""
        user_features = FeatureAccessService.get_user_features(user)
        return [f for f in required_features if f not in user_features]
    
    @staticmethod
    def get_upgrade_suggestions(user, required_feature):
        """Get plans that include required feature"""
        suggestions = []
        
        for plan_key, plan_config in SUBSCRIPTION_PLANS.items():
            if required_feature in plan_config['features']:
                suggestions.append({
                    'plan_key': plan_key,
                    'name': plan_config['name'],
                    'price': plan_config['price'],
                    'plan_type': plan_config['plan_type'],
                    'tier': plan_config['tier']
                })
        
        return suggestions

# Feature access helpers for templates and serializers
def user_has_feature(user, feature_key):
    """Template helper to check feature access"""
    return FeatureAccessService.check_feature(user, feature_key)

def get_user_plan_info(user):
    """Get user's current plan information"""
    try:
        subscription = UserSubscription.objects.get(user=user)
        if subscription.is_active:
            plan_key = f"{subscription.plan.plan_type}_{subscription.plan.tier}"
            plan_config = SUBSCRIPTION_PLANS.get(plan_key, {})
            
            return {
                'has_subscription': True,
                'is_active': True,
                'plan_name': subscription.plan.name,
                'plan_type': subscription.plan.plan_type,
                'tier': subscription.plan.tier,
                'price': subscription.plan.price,
                'features': plan_config.get('features', []),
                'project_fee_rate': plan_config.get('project_fee_rate', 0),
                'current_period_end': subscription.current_period_end
            }
    except UserSubscription.DoesNotExist:
        pass
    
    return {
        'has_subscription': False,
        'is_active': False,
        'plan_name': None,
        'plan_type': None,
        'tier': None,
        'price': None,
        'features': [],
        'project_fee_rate': 0,
        'current_period_end': None
    } 