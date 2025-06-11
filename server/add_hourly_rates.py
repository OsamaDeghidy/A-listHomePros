#!/usr/bin/env python3
"""
Script to add hourly rates to existing AListHomeProProfile records
"""
import os
import sys
import django
import random
from decimal import Decimal

# Add the server directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from alistpros_profiles.models import AListHomeProProfile, ServiceCategory

def add_hourly_rates():
    """Add hourly rates to existing profiles"""
    print("🚀 Adding hourly rates to AListHomeProProfile records...")
    
    profiles = AListHomeProProfile.objects.all()
    
    if not profiles.exists():
        print("❌ No AListHomeProProfile records found!")
        return
        
    print(f"📋 Found {profiles.count()} profiles to update")
    
    # Hourly rate ranges by profession/category
    rate_ranges = {
        'plumber': (50, 90),
        'electrician': (60, 100),
        'carpenter': (45, 85),
        'painter': (40, 70),
        'cleaning': (25, 45),
        'handyman': (35, 65),
        'hvac': (70, 120),
        'landscaping': (30, 60),
        'roofing': (80, 150),
        'flooring': (50, 95),
    }
    
    updated_count = 0
    
    for profile in profiles:
        # Skip if already has hourly rate
        if profile.hourly_rate and profile.hourly_rate > 0:
            print(f"⏭️ Skipping {profile.business_name} - already has hourly rate: ${profile.hourly_rate}")
            continue
            
        # Determine rate based on categories or profession
        rate_range = (50, 80)  # Default range
        
        # Check service categories
        categories = profile.service_categories.all()
        if categories:
            category_name = categories[0].name.lower()
            for keyword, range_val in rate_ranges.items():
                if keyword in category_name:
                    rate_range = range_val
                    break
        else:
            # Check profession field
            profession = profile.profession.lower() if profile.profession else ''
            for keyword, range_val in rate_ranges.items():
                if keyword in profession:
                    rate_range = range_val
                    break
        
        # Generate random rate within range
        min_rate, max_rate = rate_range
        hourly_rate = Decimal(str(random.randint(min_rate, max_rate)))
        
        # Update profile
        profile.hourly_rate = hourly_rate
        profile.save()
        
        categories_str = ', '.join([cat.name for cat in categories]) if categories else 'No categories'
        print(f"✅ Updated {profile.business_name}: ${hourly_rate}/hr (Categories: {categories_str})")
        updated_count += 1
    
    print(f"\n🎉 Successfully updated {updated_count} profiles with hourly rates!")

def add_service_categories():
    """Add some service categories if they don't exist"""
    print("\n📂 Creating service categories...")
    
    categories_data = [
        {'name': 'Plumbing', 'description': 'Plumbing repair and installation services'},
        {'name': 'Electrical', 'description': 'Electrical installation and repair services'},
        {'name': 'Carpentry', 'description': 'Custom carpentry and woodworking services'},
        {'name': 'Painting', 'description': 'Interior and exterior painting services'},
        {'name': 'Cleaning', 'description': 'Professional cleaning services'},
        {'name': 'HVAC', 'description': 'Heating, ventilation, and air conditioning services'},
        {'name': 'Landscaping', 'description': 'Landscaping and garden maintenance services'},
        {'name': 'Handyman', 'description': 'General maintenance and repair services'},
        {'name': 'Roofing', 'description': 'Roof installation, repair, and maintenance'},
        {'name': 'Flooring', 'description': 'Flooring installation and refinishing services'},
    ]
    
    created_count = 0
    for cat_data in categories_data:
        category, created = ServiceCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"✅ Created category: {category.name}")
            created_count += 1
        else:
            print(f"ℹ️ Category already exists: {category.name}")
    
    print(f"\n📂 Created {created_count} new service categories")

def assign_categories_to_profiles():
    """Assign service categories to profiles that don't have any"""
    print("\n🏷️ Assigning categories to profiles...")
    
    profiles_without_categories = AListHomeProProfile.objects.filter(service_categories__isnull=True)
    categories = list(ServiceCategory.objects.all())
    
    if not categories:
        print("❌ No service categories found!")
        return
        
    assigned_count = 0
    for profile in profiles_without_categories:
        # Assign 1-3 random categories
        num_categories = random.randint(1, min(3, len(categories)))
        selected_categories = random.sample(categories, num_categories)
        
        profile.service_categories.set(selected_categories)
        
        category_names = ', '.join([cat.name for cat in selected_categories])
        print(f"✅ Assigned to {profile.business_name}: {category_names}")
        assigned_count += 1
    
    print(f"\n🏷️ Assigned categories to {assigned_count} profiles")

if __name__ == '__main__':
    try:
        add_service_categories()
        assign_categories_to_profiles()
        add_hourly_rates()
        print("\n🎊 All done! Hourly rates and categories have been added successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1) 