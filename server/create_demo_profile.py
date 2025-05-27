#!/usr/bin/env python
"""
Create a single A-List Home Pro profile for API testing.
This script creates a basic profile for testing the API endpoints.
"""

import os
import sys
import traceback

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
import django
django.setup()

# Now import Django models
from django.contrib.auth import get_user_model
from django.db import transaction
from alistpros_profiles.models import AListHomeProProfile, ServiceCategory
from users.models import CustomUser, UserRole

User = get_user_model()

def create_demo_profile():
    """Create a demo AListHomeProProfile for API testing"""
    try:
        # Create or get a test user
        try:
            user = CustomUser.objects.get(email='testpro@example.com')
            print(f"Found existing user: {user.email}")
        except CustomUser.DoesNotExist:
            # Create a new user with CONTRACTOR role (not ALISTPRO)
            user = CustomUser.objects.create_user(
                email='testpro@example.com',
                name='Test Professional',
                phone_number='555-123-4567',
                password='testpassword123',
                role=UserRole.CONTRACTOR,  # Use CONTRACTOR role for A-List Home Pros
                is_verified=True,
                email_verified=True
            )
            print(f"Created new user: {user.email}")
        
        # Try to find existing profile or create a new one
        try:
            profile = AListHomeProProfile.objects.get(user=user)
            print(f"Found existing profile for {user.email}")
        except AListHomeProProfile.DoesNotExist:
            # Create a new profile
            profile = AListHomeProProfile.objects.create(
                user=user,
                business_name="Test Pro Services",
                business_description="A demo contractor profile for testing the A-List Home Pros API",
                years_of_experience=5,
                license_number="TEST-12345",
                service_radius=50,
                is_onboarded=True
            )
            print(f"Created new profile for {user.email}")
        
        # Add some service categories if they exist
        categories = ServiceCategory.objects.all()
        if categories.exists():
            # Add the first 3 categories
            for category in categories[:3]:
                profile.service_categories.set([category])
                print(f"Added service category: {category.name}")
        else:
            print("No service categories found. Run create_initial_data.py to create categories.")
        
        print("\nDemo profile created successfully:")
        print(f"Profile ID: {profile.id}")
        print(f"User Email: {user.email}")
        print(f"Business Name: {profile.business_name}")
        
        return profile
    except Exception as e:
        print(f"Error creating demo profile: {str(e)}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    profile = create_demo_profile()
    if profile:
        print("\nUse this profile ID in API tests: ", profile.id)
    else:
        print("\nFailed to create demo profile. Check the error logs above.") 