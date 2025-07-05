from drf_yasg import openapi

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

# Swagger Info Configuration
swagger_info = openapi.Info(
    title="A-List Home Pros API",
    default_version='v1',
    description="""
    ## A-List Home Pros API Documentation
    
    Complete API for A-List Home Pros platform - connecting homeowners with qualified home professionals.
    
    ### Features:
    - **User Management**: Registration, authentication, profiles
    - **Subscription System**: Three-tier subscription plans with feature access control
    - **Professional Profiles**: A-List Home Pro profiles with portfolios and reviews
    - **Scheduling**: Appointment booking and availability management
    - **Payments**: Stripe integration for subscriptions and project payments
    - **Messaging**: Real-time communication between users
    - **Notifications**: Push notifications and email alerts
    
    ### Authentication:
    Most endpoints require JWT authentication. Include the token in the Authorization header:
    ```
    Authorization: Bearer <your_jwt_token>
    ```
    
    ### Subscription Plans:
    - **Home Pro**: $149.99/month (Basic), $275/month (Premium)
    - **Crew Member**: $89.99/month (Basic), $210/month (Premium)
    - **Specialist**: $59.99/month
    
    ### Support:
    For API support, contact: support@alisthomepros.com
    """,
    terms_of_service="https://www.alisthomepros.com/terms/",
    contact=openapi.Contact(
        name="A-List Home Pros API Support",
        email="support@alisthomepros.com",
        url="https://www.alisthomepros.com/support"
    ),
    license=openapi.License(name="Proprietary License"),
) 