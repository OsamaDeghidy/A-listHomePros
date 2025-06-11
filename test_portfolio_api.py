#!/usr/bin/env python3
"""
Test script for portfolio API debugging
"""
import requests
import json
import os
from io import BytesIO
from PIL import Image

# API Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

# Test credentials (replace with actual test user)
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "testpass123"

def get_auth_token():
    """Get authentication token"""
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(f"{API_BASE}/users/token/", json=login_data)
    if response.status_code == 200:
        return response.json()["access"]
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def create_test_image():
    """Create a test image file"""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_portfolio_creation(token):
    """Test portfolio item creation"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Create test image
    test_image = create_test_image()
    
    # Prepare form data
    files = {
        'image': ('test_image.jpg', test_image, 'image/jpeg')
    }
    
    data = {
        'title': 'Test Portfolio Item',
        'description': 'This is a test portfolio item',
        'completion_date': '2024-01-15'
    }
    
    print("Testing portfolio creation...")
    response = requests.post(
        f"{API_BASE}/alistpros/portfolio/",
        headers=headers,
        files=files,
        data=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        portfolio_item = response.json()
        print(f"✅ Portfolio item created successfully: ID {portfolio_item['id']}")
        return portfolio_item
    else:
        print(f"❌ Portfolio creation failed")
        return None

def test_portfolio_update(token, item_id):
    """Test portfolio item update"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    data = {
        'title': 'Updated Test Portfolio Item',
        'description': 'This is an updated test portfolio item',
        'completion_date': '2024-02-15'
    }
    
    print(f"Testing portfolio update for item {item_id}...")
    response = requests.put(
        f"{API_BASE}/alistpros/portfolio/{item_id}/",
        headers=headers,
        json=data
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print(f"✅ Portfolio item updated successfully")
        return True
    else:
        print(f"❌ Portfolio update failed")
        return False

def test_portfolio_list(token):
    """Test portfolio listing"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print("Testing portfolio listing...")
    response = requests.get(
        f"{API_BASE}/alistpros/portfolio/",
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        items = response.json()
        print(f"✅ Portfolio listing successful: {len(items)} items")
        return items
    else:
        print(f"❌ Portfolio listing failed")
        return None

def test_profile_creation(token):
    """Test profile creation if needed"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # Check if profile exists
    response = requests.get(f"{API_BASE}/alistpros/profiles/me/", headers=headers)
    
    if response.status_code == 404:
        print("Creating professional profile...")
        profile_data = {
            "business_name": "Test Business",
            "business_description": "Test business description",
            "years_of_experience": 5,
            "license_number": "TEST123",
            "insurance_info": "Test Insurance",
            "service_radius": 50
        }
        
        response = requests.post(
            f"{API_BASE}/alistpros/profiles/",
            headers=headers,
            json=profile_data
        )
        
        print(f"Profile creation status: {response.status_code}")
        print(f"Profile creation response: {response.text}")
        
        return response.status_code == 201
    else:
        print("Profile already exists")
        return True

def main():
    """Main test function"""
    print("🧪 Starting Portfolio API Tests")
    print("=" * 50)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token")
        return
    
    print(f"✅ Authentication successful")
    
    # Test profile creation/existence
    if not test_profile_creation(token):
        print("❌ Profile creation failed")
        return
    
    # Test portfolio listing
    portfolio_items = test_portfolio_list(token)
    
    # Test portfolio creation
    new_item = test_portfolio_creation(token)
    
    # Test portfolio update if creation was successful
    if new_item:
        test_portfolio_update(token, new_item['id'])
    
    print("\n" + "=" * 50)
    print("🏁 Tests completed")

if __name__ == "__main__":
    main() 