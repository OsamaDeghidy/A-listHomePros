#!/usr/bin/env python3
import os
import sys
import django
import random
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from alistpros_profiles.models import AListHomeProProfile

print("🚀 Updating profiles with hourly rates...")

profiles = AListHomeProProfile.objects.all()
print(f"📋 Found {profiles.count()} profiles")

for profile in profiles:
    if not profile.hourly_rate or profile.hourly_rate == 0:
        # Generate random rate between $40-120
        rate = Decimal(str(random.randint(40, 120)))
        profile.hourly_rate = rate
        profile.save()
        print(f"✅ Updated {profile.business_name}: ${rate}/hr")
    else:
        print(f"⏭️ {profile.business_name} already has rate: ${profile.hourly_rate}/hr")

print("🎉 Done!") 