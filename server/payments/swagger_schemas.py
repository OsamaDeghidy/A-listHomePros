from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status

# Subscription Plan Schemas
subscription_plan_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Plan ID', example=1),
        'name': openapi.Schema(type=openapi.TYPE_STRING, description='Plan name', example='Home Pro Basic'),
        'plan_type': openapi.Schema(type=openapi.TYPE_STRING, description='Plan type (home_pro, crew, specialist)', example='home_pro'),
        'plan_type_display': openapi.Schema(type=openapi.TYPE_STRING, description='Human readable plan type', example='Home Pro'),
        'tier': openapi.Schema(type=openapi.TYPE_STRING, description='Plan tier (basic, premium)', example='basic'),
        'tier_display': openapi.Schema(type=openapi.TYPE_STRING, description='Human readable tier', example='Basic'),
        'price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Monthly price in USD', example=149.99),
        'description': openapi.Schema(type=openapi.TYPE_STRING, description='Plan description', example='Perfect for individual home professionals starting their business'),
        'features': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_STRING),
            description='List of features included in plan',
            example=['unlimited_project_leads', 'client_rating_system', 'basic_business_profile', 'email_support']
        ),
        'feature_count': openapi.Schema(type=openapi.TYPE_INTEGER, description='Number of features', example=4),
        'project_fee_rate': openapi.Schema(type=openapi.TYPE_NUMBER, description='Project fee percentage', example=0.05),
        'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Whether plan is active', example=True),
        'stripe_price_id': openapi.Schema(type=openapi.TYPE_STRING, description='Stripe price ID', example='price_1234567890'),
        'stripe_product_id': openapi.Schema(type=openapi.TYPE_STRING, description='Stripe product ID', example='prod_1234567890'),
        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', description='Creation date', example='2024-01-01T00:00:00Z'),
    }
)

# User Subscription Schemas
user_subscription_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Subscription ID'),
        'plan': subscription_plan_response_schema,
        'status': openapi.Schema(type=openapi.TYPE_STRING, description='Subscription status'),
        'status_display': openapi.Schema(type=openapi.TYPE_STRING, description='Human readable status'),
        'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Whether subscription is active'),
        'has_premium_access': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Whether user has premium access'),
        'current_period_start': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', description='Current period start'),
        'current_period_end': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', description='Current period end'),
        'days_remaining': openapi.Schema(type=openapi.TYPE_INTEGER, description='Days remaining in current period'),
        'project_fee_rate': openapi.Schema(type=openapi.TYPE_NUMBER, description='Project fee percentage for this plan'),
        'user_features': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_STRING),
            description='List of features available to user'
        ),
        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time', description='Subscription creation date'),
    }
)

# Feature Access Schemas
feature_check_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['feature_key'],
    properties={
        'feature_key': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='Feature key to check (e.g., unlimited_project_leads)',
            example='unlimited_project_leads'
        ),
    }
)

feature_check_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'feature_key': openapi.Schema(type=openapi.TYPE_STRING, description='Feature key that was checked'),
        'has_access': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Whether user has access to this feature'),
        'upgrade_suggestions': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'plan_key': openapi.Schema(type=openapi.TYPE_STRING, description='Plan identifier'),
                    'name': openapi.Schema(type=openapi.TYPE_STRING, description='Plan name'),
                    'price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Plan price'),
                    'plan_type': openapi.Schema(type=openapi.TYPE_STRING, description='Plan type'),
                    'tier': openapi.Schema(type=openapi.TYPE_STRING, description='Plan tier'),
                }
            ),
            description='Plans that include this feature (only if user doesn\'t have access)'
        ),
        'upgrade_url': openapi.Schema(type=openapi.TYPE_STRING, description='URL to upgrade subscription'),
    }
)

# Multiple Features Check Schema
multiple_features_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['features'],
    properties={
        'features': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_STRING),
            description='List of feature keys to check',
            example=['unlimited_project_leads', 'exclusive_leads_access', 'hire_crew_members']
        ),
    }
)

multiple_features_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'feature_access': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            description='Object with feature keys as properties and boolean access values',
            example={
                'unlimited_project_leads': True,
                'exclusive_leads_access': False,
                'hire_crew_members': True
            }
        ),
        'user_plan': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'has_subscription': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'plan_name': openapi.Schema(type=openapi.TYPE_STRING),
                'plan_type': openapi.Schema(type=openapi.TYPE_STRING),
                'tier': openapi.Schema(type=openapi.TYPE_STRING),
                'price': openapi.Schema(type=openapi.TYPE_NUMBER),
                'features': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                'project_fee_rate': openapi.Schema(type=openapi.TYPE_NUMBER),
            }
        ),
    }
)

# Plan Comparison Schema
plan_comparison_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'plans_by_type': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'home_pro': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=subscription_plan_response_schema,
                    description='Home Pro plans'
                ),
                'crew': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=subscription_plan_response_schema,
                    description='Crew Member plans'
                ),
                'specialist': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=subscription_plan_response_schema,
                    description='Specialist plans'
                ),
            }
        ),
        'all_features': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_STRING),
            description='All unique features across all plans'
        ),
        'feature_descriptions': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            description='Feature descriptions for UI display'
        ),
    }
)

# Checkout Session Schema
checkout_session_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['plan_id', 'success_url', 'cancel_url'],
    properties={
        'plan_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the plan to subscribe to'),
        'success_url': openapi.Schema(type=openapi.TYPE_STRING, description='URL to redirect after successful payment'),
        'cancel_url': openapi.Schema(type=openapi.TYPE_STRING, description='URL to redirect if payment is cancelled'),
    }
)

checkout_session_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'checkout_url': openapi.Schema(type=openapi.TYPE_STRING, description='Stripe checkout URL'),
        'session_id': openapi.Schema(type=openapi.TYPE_STRING, description='Stripe session ID'),
    }
)

# Error Response Schema
error_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'error': openapi.Schema(type=openapi.TYPE_STRING, description='Error message'),
        'feature_required': openapi.Schema(type=openapi.TYPE_STRING, description='Required feature (if applicable)'),
        'current_plan': openapi.Schema(type=openapi.TYPE_STRING, description='User\'s current plan (if applicable)'),
        'upgrade_url': openapi.Schema(type=openapi.TYPE_STRING, description='URL to upgrade subscription'),
    }
)

# Common Parameters
plan_type_parameter = openapi.Parameter(
    'plan_type',
    openapi.IN_QUERY,
    description='Filter plans by type (home_pro, crew, specialist)',
    type=openapi.TYPE_STRING,
    enum=['home_pro', 'crew', 'specialist']
)

# Swagger Decorators
def subscription_plan_list_swagger():
    return swagger_auto_schema(
        operation_description="Get list of available subscription plans",
        operation_summary="List Subscription Plans",
        manual_parameters=[plan_type_parameter],
        responses={
            200: openapi.Response(
                description="List of subscription plans",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'results': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=subscription_plan_response_schema
                        )
                    }
                )
            )
        },
        tags=['Subscription Plans']
    )

def current_subscription_swagger():
    return swagger_auto_schema(
        operation_description="Get current user's subscription details",
        operation_summary="Get Current Subscription",
        responses={
            200: openapi.Response(
                description="Current subscription details",
                schema=user_subscription_response_schema
            ),
            404: openapi.Response(
                description="No active subscription found",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, example='No active subscription')
                    }
                )
            )
        },
        tags=['User Subscription']
    )

def check_feature_swagger():
    return swagger_auto_schema(
        operation_description="Check if user has access to a specific feature",
        operation_summary="Check Feature Access",
        request_body=feature_check_request_schema,
        responses={
            200: openapi.Response(
                description="Feature access result",
                schema=feature_check_response_schema
            ),
            400: openapi.Response(
                description="Bad request - missing feature_key",
                schema=error_response_schema
            )
        },
        tags=['Feature Access']
    )

def multiple_features_swagger():
    return swagger_auto_schema(
        operation_description="Check access to multiple features at once",
        operation_summary="Check Multiple Features",
        request_body=multiple_features_request_schema,
        responses={
            200: openapi.Response(
                description="Multiple feature access results",
                schema=multiple_features_response_schema
            ),
            400: openapi.Response(
                description="Bad request - missing features list",
                schema=error_response_schema
            )
        },
        tags=['Feature Access']
    )

def plan_comparison_swagger():
    return swagger_auto_schema(
        operation_description="Get detailed comparison of all subscription plans",
        operation_summary="Plan Comparison",
        responses={
            200: openapi.Response(
                description="Plan comparison data",
                schema=plan_comparison_response_schema
            )
        },
        tags=['Subscription Plans']
    )

def create_checkout_session_swagger():
    return swagger_auto_schema(
        operation_description="Create Stripe checkout session for subscription",
        operation_summary="Create Checkout Session",
        request_body=checkout_session_request_schema,
        responses={
            200: openapi.Response(
                description="Checkout session created",
                schema=checkout_session_response_schema
            ),
            400: openapi.Response(
                description="Invalid request data",
                schema=error_response_schema
            ),
            500: openapi.Response(
                description="Failed to create checkout session",
                schema=error_response_schema
            )
        },
        tags=['Subscription Management']
    )

# Swagger Tags Configuration
SWAGGER_TAGS = [
    {
        'name': 'Authentication',
        'description': 'User authentication and JWT token management'
    },
    {
        'name': 'Subscription Plans',
        'description': 'Available subscription plans and pricing information'
    },
    {
        'name': 'User Subscription',
        'description': 'User subscription management and billing'
    },
    {
        'name': 'Feature Access',
        'description': 'Feature access control and permission checking'
    },
    {
        'name': 'Subscription Management',
        'description': 'Subscription lifecycle management (create, update, cancel)'
    },
    {
        'name': 'Stripe Integration',
        'description': 'Stripe payment processing and webhooks'
    },
    {
        'name': 'Professional Profiles',
        'description': 'A-List Home Pro profiles and portfolios'
    },
    {
        'name': 'Scheduling',
        'description': 'Appointment booking and availability management'
    },
    {
        'name': 'Messaging',
        'description': 'Real-time messaging between users'
    },
    {
        'name': 'Notifications',
        'description': 'Push notifications and email alerts'
    },
    {
        'name': 'Analytics',
        'description': 'Platform analytics and reporting'
    }
]

# API Examples for better documentation
API_EXAMPLES = {
    'subscription_plan_example': {
        "id": 1,
        "name": "Home Pro Basic",
        "plan_type": "home_pro",
        "plan_type_display": "Home Pro",
        "tier": "basic",
        "tier_display": "Basic",
        "price": 149.99,
        "description": "Perfect for individual home professionals starting their business",
        "features": [
            "unlimited_project_leads",
            "client_rating_system",
            "basic_business_profile",
            "email_support"
        ],
        "feature_count": 4,
        "project_fee_rate": 0.05,
        "is_active": True,
        "stripe_price_id": "price_1234567890",
        "stripe_product_id": "prod_1234567890",
        "created_at": "2024-01-01T00:00:00Z"
    },
    'feature_check_example': {
        "feature_key": "unlimited_project_leads",
        "has_access": True,
        "upgrade_suggestions": [],
        "upgrade_url": "/subscription-plans"
    },
    'user_subscription_example': {
        "id": 1,
        "plan": {
            "id": 1,
            "name": "Home Pro Basic",
            "plan_type": "home_pro",
            "tier": "basic",
            "price": 149.99
        },
        "status": "active",
        "status_display": "Active",
        "is_active": True,
        "has_premium_access": False,
        "current_period_start": "2024-01-01T00:00:00Z",
        "current_period_end": "2024-02-01T00:00:00Z",
        "days_remaining": 15,
        "project_fee_rate": 0.05,
        "user_features": [
            "unlimited_project_leads",
            "client_rating_system",
            "basic_business_profile",
            "email_support"
        ],
        "created_at": "2024-01-01T00:00:00Z"
    }
}

# Common Error Responses
COMMON_ERROR_RESPONSES = {
    400: openapi.Response(
        description="Bad Request - Invalid input data",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING, example='Invalid request data'),
                'details': openapi.Schema(type=openapi.TYPE_OBJECT, example={'field': ['This field is required']})
            }
        )
    ),
    401: openapi.Response(
        description="Unauthorized - Authentication required",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'detail': openapi.Schema(type=openapi.TYPE_STRING, example='Authentication credentials were not provided.')
            }
        )
    ),
    403: openapi.Response(
        description="Forbidden - Insufficient permissions",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'detail': openapi.Schema(type=openapi.TYPE_STRING, example='You do not have permission to perform this action.'),
                'required_feature': openapi.Schema(type=openapi.TYPE_STRING, example='premium_access'),
                'upgrade_url': openapi.Schema(type=openapi.TYPE_STRING, example='/subscription-plans')
            }
        )
    ),
    404: openapi.Response(
        description="Not Found - Resource not found",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'detail': openapi.Schema(type=openapi.TYPE_STRING, example='Not found.')
            }
        )
    ),
    500: openapi.Response(
        description="Internal Server Error",
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING, example='Internal server error'),
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='An unexpected error occurred')
            }
        )
    )
} 