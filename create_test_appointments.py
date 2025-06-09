#!/usr/bin/env python3
"""
Script to create test appointment data for A-List Home Pros
Run this script to populate the database with sample appointments for testing
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the server directory to Python path
sys.path.append('server')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alist_home_pros.settings')
django.setup()

from django.contrib.auth import get_user_model
from alistpros.models import AlistPro, ServiceCategory
from scheduling.models import Appointment

User = get_user_model()

def create_test_data():
    """Create test appointments and related data"""
    
    print("🔄 Creating test data for A-List Home Pros...")
    
    # Create test users
    print("👤 Creating test users...")
    
    # Create client user
    client_user, created = User.objects.get_or_create(
        email='client@test.com',
        defaults={
            'name': 'Ahmed Al-Rashid',
            'phone_number': '+966501234567',
            'is_active': True,
        }
    )
    if created:
        client_user.set_password('testpass123')
        client_user.save()
        print(f"✅ Created client user: {client_user.email}")
    else:
        print(f"ℹ️ Client user already exists: {client_user.email}")
    
    # Create professional user
    pro_user, created = User.objects.get_or_create(
        email='pro@test.com',
        defaults={
            'name': 'Mohammed Al-Fahed',
            'phone_number': '+966501112222',
            'is_active': True,
        }
    )
    if created:
        pro_user.set_password('testpass123')
        pro_user.save()
        print(f"✅ Created professional user: {pro_user.email}")
    else:
        print(f"ℹ️ Professional user already exists: {pro_user.email}")
    
    # Create service category
    print("🔧 Creating service categories...")
    category, created = ServiceCategory.objects.get_or_create(
        name='Plumbing Services',
        defaults={
            'description': 'Professional plumbing services for homes and businesses',
            'is_active': True,
        }
    )
    if created:
        print(f"✅ Created service category: {category.name}")
    else:
        print(f"ℹ️ Service category already exists: {category.name}")
    
    # Create AlistPro profile
    print("👨‍💼 Creating professional profile...")
    alistpro, created = AlistPro.objects.get_or_create(
        user=pro_user,
        defaults={
            'business_name': 'Al-Fahed Plumbing Services',
            'business_description': 'Professional plumbing services with over 10 years of experience',
            'profession': 'Master Plumber',
            'experience_years': 12,
            'hourly_rate': 75.00,
            'service_area': 'Riyadh and surrounding areas',
            'is_verified': True,
            'is_featured': True,
        }
    )
    if created:
        alistpro.service_categories.add(category)
        print(f"✅ Created AlistPro profile: {alistpro.business_name}")
    else:
        print(f"ℹ️ AlistPro profile already exists: {alistpro.business_name}")
    
    # Create test appointments
    print("📅 Creating test appointments...")
    
    appointments_data = [
        {
            'id': 1,
            'status': 'REQUESTED',
            'service_description': 'Fix kitchen sink leak and replace faucet',
            'appointment_date': datetime.now().date() + timedelta(days=7),
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'estimated_cost': 150.00,
            'location': '123 Main Street, Riyadh, Saudi Arabia',
            'notes': 'Please use the back entrance. Park in the driveway.',
        },
        {
            'id': 2,
            'status': 'CONFIRMED',
            'service_description': 'Install new ceiling fan in living room',
            'appointment_date': datetime.now().date() + timedelta(days=10),
            'start_time': '14:00:00',
            'end_time': '16:00:00',
            'estimated_cost': 200.00,
            'location': '456 Oak Avenue, Riyadh, Saudi Arabia',
            'notes': 'Bring a 52-inch ceiling fan.',
        },
        {
            'id': 3,
            'status': 'COMPLETED',
            'service_description': 'Repair bathroom pipes and fix water pressure',
            'appointment_date': datetime.now().date() - timedelta(days=2),
            'start_time': '09:00:00',
            'end_time': '11:00:00',
            'estimated_cost': 120.00,
            'location': '789 Pine Street, Riyadh, Saudi Arabia',
            'notes': 'Job completed successfully.',
        },
    ]
    
    for apt_data in appointments_data:
        appointment, created = Appointment.objects.get_or_create(
            id=apt_data['id'],
            defaults={
                'client': client_user,
                'alistpro': alistpro,
                'service_category': category,
                'status': apt_data['status'],
                'service_description': apt_data['service_description'],
                'appointment_date': apt_data['appointment_date'],
                'start_time': apt_data['start_time'],
                'end_time': apt_data['end_time'],
                'estimated_cost': apt_data['estimated_cost'],
                'location': apt_data['location'],
                'notes': apt_data['notes'],
            }
        )
        if created:
            print(f"✅ Created appointment #{appointment.id}: {appointment.service_description[:50]}...")
        else:
            print(f"ℹ️ Appointment #{appointment.id} already exists")
    
    print("\n🎉 Test data creation completed!")
    print("\n📋 Summary:")
    print(f"   👤 Users: {User.objects.count()}")
    print(f"   👨‍💼 Professionals: {AlistPro.objects.count()}")
    print(f"   🔧 Service Categories: {ServiceCategory.objects.count()}")
    print(f"   📅 Appointments: {Appointment.objects.count()}")
    
    print("\n🌐 You can now test the frontend with these URLs:")
    print("   http://localhost:3000/appointments/1")
    print("   http://localhost:3000/appointments/2")
    print("   http://localhost:3000/appointments/3")
    
    print("\n🔑 Test login credentials:")
    print("   Client: client@test.com / testpass123")
    print("   Professional: pro@test.com / testpass123")

if __name__ == '__main__':
    try:
        create_test_data()
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        sys.exit(1) 