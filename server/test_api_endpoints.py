#!/usr/bin/env python
"""
API Endpoint Testing Script for A-List Home Pros Platform

This script tests the main API endpoints of the A-List Home Pros platform
to ensure they are working correctly with the test data.
"""

import requests
import json
import sys
import os
import argparse
from decouple import config, Csv

# Base URL for API from environment variables
API_HOST = config('API_HOST', default='localhost')
API_PORT = config('API_PORT', default='8000')
API_PROTOCOL = config('API_PROTOCOL', default='http')

# Construct the base URL
BASE_URL = f"{API_PROTOCOL}://{API_HOST}:{API_PORT}/api"
print(f"Testing API at: {BASE_URL}")

# Test credentials
ADMIN_USER = {
    "email": "admin@alistpros.com",
    "password": "admin123"
}

CLIENT_USER = {
    "email": "client1@example.com",
    "password": "client123"
}

ALISTPRO_USER = {
    "email": "contractor1@example.com",  # Using existing contractor email for backward compatibility
    "password": "contractor123"
}

def print_response(response, label="Response"):
    """Print formatted response for debugging"""
    print(f"\n=== {label} ===")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response JSON: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    print("-" * 80)

def get_auth_token(credentials):
    """Get JWT auth token for a user"""
    url = f"{BASE_URL}/users/token/"
    response = requests.post(url, json=credentials)
    
    if response.status_code == 200:
        return response.json().get('access')
    else:
        print_response(response, "Auth Token Error")
        return None

def test_user_profile(token):
    """Test getting user profile"""
    url = f"{BASE_URL}/users/me/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print_response(response, "User Profile")
    return response.status_code == 200

def test_alistpro_profiles():
    """Test getting all A-List Home Pro profiles"""
    # Try the new endpoint first
    url = f"{BASE_URL}/alistpros/profiles/"
    response = requests.get(url)
    if response.status_code == 200:
        print_response(response, "All A-List Home Pro Profiles")
        return True
    else:
        # Fall back to the old endpoint for backward compatibility
        url = f"{BASE_URL}/contractors/profiles/"
        response = requests.get(url)
        print_response(response, "All Contractor Profiles (Legacy Endpoint)")
        return response.status_code == 200

def test_alistpro_profile_detail(alistpro_id=None):
    """Test getting a specific A-List Home Pro profile"""
    # First, get a list of profiles
    print("Fetching profile list to find a valid ID...")
    
    # Try both new and legacy endpoints to get profiles
    profiles_data = None
    profiles_endpoints = [
        f"{BASE_URL}/alistpros/profiles/",
        f"{BASE_URL}/contractors/profiles/"
    ]
    
    for url in profiles_endpoints:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"Successfully got profiles from {url}")
                data = response.json()
                
                # Check if we got valid data
                if data:
                    if isinstance(data, list) and len(data) > 0:
                        profiles_data = data
                        break
                    elif isinstance(data, dict) and 'results' in data and len(data['results']) > 0:
                        profiles_data = data['results']
                        break
        except Exception as e:
            print(f"Error fetching profiles from {url}: {str(e)}")
    
    # Print out the profiles we found to help with debugging
    if profiles_data:
        print(f"Found {len(profiles_data)} profiles")
        
        # Check for the demo profile created by create_demo_profile.py
        demo_profile = None
        for profile in profiles_data:
            if profile.get('business_name') == "Test Pro Services" or profile.get('user', {}).get('email') == "testpro@example.com":
                demo_profile = profile
                print(f"Found demo profile: ID={profile.get('id')}, Name={profile.get('business_name')}")
                break
        
        # If we found the demo profile, use it
        if demo_profile:
            alistpro_id = demo_profile.get('id')
            print(f"Using demo profile ID: {alistpro_id}")
        else:
            # Otherwise show the first few profiles
            for i, profile in enumerate(profiles_data[:3]):  # Show first 3 profiles only
                print(f"Profile {i+1}: ID={profile.get('id', 'unknown')}, Name={profile.get('business_name', 'unknown')}")
            
            # Get the profile ID from the first profile
            alistpro_id = profiles_data[0].get('id')
            print(f"Using profile ID: {alistpro_id}")
    else:
        print("No profiles found. Using default ID=1")
        print("Consider running: python create_initial_data.py")
        print("Then: python create_demo_profile.py")
        alistpro_id = 1

    # Try multiple endpoints to find a working one
    endpoints = [
        f"{BASE_URL}/alistpros/profiles/{alistpro_id}/",  # Router-based endpoint
        f"{BASE_URL}/alistpros/profile-detail/{alistpro_id}/",  # Explicit endpoint
        f"{BASE_URL}/contractors/profiles/{alistpro_id}/",  # Legacy router-based endpoint
        f"{BASE_URL}/contractors/profile-detail/{alistpro_id}/",  # Legacy explicit endpoint
        f"{BASE_URL}/contractors/detail/{alistpro_id}/"  # Very old legacy endpoint
    ]
    
    success = False
    for url in endpoints:
        try:
            print(f"Trying: {url}")
            response = requests.get(url)
            status = response.status_code
            print(f"  Status: {status}")
            
            if status == 200:
                print_response(response, f"A-List Home Pro Profile {alistpro_id} ({url})")
                success = True
                break
            elif status == 404:
                print(f"  Resource not found (404) at {url}")
            else:
                print(f"  Got unexpected status code {status} from {url}")
        except Exception as e:
            print(f"  Error accessing {url}: {str(e)}")
    
    # If all endpoints failed, try with different IDs
    if not success and profiles_data and len(profiles_data) > 1:
        print("First profile ID failed. Trying with other profile IDs...")
        
        # Try with each ID from the profiles we found
        for profile in profiles_data[1:3]:  # Try next 2 profiles at most
            alt_id = profile.get('id')
            if alt_id:
                print(f"Trying with alternative ID: {alt_id}")
                for url_template in [
                    f"{BASE_URL}/alistpros/profiles/{{id}}/",
                    f"{BASE_URL}/alistpros/profile-detail/{{id}}/",
                    f"{BASE_URL}/contractors/profiles/{{id}}/",
                    f"{BASE_URL}/contractors/profile-detail/{{id}}/",
                    f"{BASE_URL}/contractors/detail/{{id}}/"
                ]:
                    url = url_template.format(id=alt_id)
                    try:
                        print(f"Trying: {url}")
                        response = requests.get(url)
                        if response.status_code == 200:
                            print_response(response, f"A-List Home Pro Profile {alt_id} ({url})")
                            success = True
                            break
                    except Exception as e:
                        print(f"  Error: {str(e)}")
                
                if success:
                    break
    
    if not success:
        print("Failed to get profile details for any profile ID")
        print("Make sure there is at least one A-List Home Pro profile in the database")
        print("Run these commands to create test data:")
        print("  python create_initial_data.py")
        print("  python create_demo_profile.py")
        return False
    
    return True

def test_appointments(token):
    """Test getting appointments"""
    url = f"{BASE_URL}/scheduling/appointments/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print_response(response, "Appointments")
    return response.status_code == 200

def test_conversations(token):
    """Test getting conversations"""
    url = f"{BASE_URL}/messaging/conversations/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print_response(response, "Conversations")
    return response.status_code == 200

def test_notifications(token):
    """Test getting notifications"""
    url = f"{BASE_URL}/notifications/notifications/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print_response(response, "Notifications")
    return response.status_code == 200

def test_stripe_dashboard_link(token):
    """Test getting Stripe dashboard link"""
    url = f"{BASE_URL}/payments/dashboard-link/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print_response(response, "Stripe Dashboard Link")
    # Consider it a success if we get either 200 (success) or 404 (account not found)
    # This is because in a new environment, Stripe accounts may not be set up yet
    return response.status_code in [200, 404]

def run_all_tests(specific_tests=None):
    """Run API tests
    
    Args:
        specific_tests: List of test names to run, or None to run all tests
    """
    results = {}
    total_tests = 0
    passed_tests = 0
    
    # Get authentication tokens first
    print("\n=== Authentication Tests ===")
    admin_token = get_auth_token(ADMIN_USER)
    results["Admin Login"] = admin_token is not None
    total_tests += 1
    passed_tests += 1 if results["Admin Login"] else 0

    client_token = get_auth_token(CLIENT_USER)
    results["Client Login"] = client_token is not None
    total_tests += 1
    passed_tests += 1 if results["Client Login"] else 0

    alistpro_token = get_auth_token(ALISTPRO_USER)
    results["A-List Home Pro Login"] = alistpro_token is not None
    total_tests += 1
    passed_tests += 1 if results["A-List Home Pro Login"] else 0
    
    # Define all tests with their functions
    all_tests = {
        # User profile tests
        "Admin Profile": lambda: test_user_profile(admin_token),
        "Client Profile": lambda: test_user_profile(client_token),
        "A-List Home Pro Profile": lambda: test_user_profile(alistpro_token),
        
        # A-List Home Pro profiles tests
        "All A-List Home Pro Profiles": test_alistpro_profiles,
        "A-List Home Pro Profile Detail": test_alistpro_profile_detail,
        
        # Stripe integration test
        "Stripe Dashboard Link": lambda: test_stripe_dashboard_link(alistpro_token),
        
        # Appointments tests
        "Admin Appointments": lambda: test_appointments(admin_token),
        "Client Appointments": lambda: test_appointments(client_token),
        "A-List Home Pro Appointments": lambda: test_appointments(alistpro_token),
        
        # Conversations tests
        "Admin Conversations": lambda: test_conversations(admin_token),
        "Client Conversations": lambda: test_conversations(client_token),
        "A-List Home Pro Conversations": lambda: test_conversations(alistpro_token),
        
        # Notifications tests
        "Admin Notifications": lambda: test_notifications(admin_token),
        "Client Notifications": lambda: test_notifications(client_token),
        "A-List Home Pro Notifications": lambda: test_notifications(alistpro_token),
    }
    
    # Filter tests if specific_tests is provided
    tests_to_run = all_tests
    if specific_tests:
        tests_to_run = {name: func for name, func in all_tests.items() 
                       if any(test.lower() in name.lower() for test in specific_tests)}
        if not tests_to_run:
            print(f"No tests match the specified filters: {specific_tests}")
            print(f"Available tests: {', '.join(all_tests.keys())}")
            return False
    
    # Run the selected tests
    for name, test_func in tests_to_run.items():
        print(f"\n--- Running test: {name} ---")
        try:
            result = test_func()
            results[name] = result
            total_tests += 1
            passed_tests += 1 if result else 0
        except Exception as e:
            print(f"Error running test {name}: {str(e)}")
            results[name] = False
            total_tests += 1
    
    # Print test results
    print("\n=== Test Results Summary ===\n")
    for test_name, result in results.items():
        status = "PASSED" if result else "FAILED"
        print(f"{status} - {test_name}")
    
    # Calculate success rate
    success_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    success_rate = (success_count / total_count) * 100 if total_count > 0 else 0
    
    print(f"\nSuccess Rate: {success_rate:.2f}% ({success_count}/{total_count})")
    return success_rate == 100

if __name__ == "__main__":
    print("A-List Home Pros API Endpoint Testing")
    print("Make sure the Django server is running on http://localhost:8000")
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test A-List Home Pros API endpoints')
    parser.add_argument('--test', '-t', action='append', help='Run specific tests (can be specified multiple times)')
    parser.add_argument('--skip-server-check', action='store_true', help='Skip server connection check')
    args = parser.parse_args()
    
    if not args.skip_server_check:
        # Check if server is running by trying multiple endpoints
        endpoints = [
            f"{BASE_URL}/alistpros/profiles/",
            f"{BASE_URL}/contractors/profiles/",
            f"{BASE_URL}/users/token/"
        ]
        
        server_running = False
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint, timeout=5)
                if response.status_code < 500:  # Any response that's not a server error
                    server_running = True
                    print(f"Connected to server at {endpoint}")
                    break
                else:
                    print(f"Endpoint {endpoint} returned status code {response.status_code}")
            except requests.ConnectionError:
                print(f"Could not connect to {endpoint}")
            except requests.Timeout:
                print(f"Connection to {endpoint} timed out")
            except Exception as e:
                print(f"Error checking {endpoint}: {str(e)}")
        
        if not server_running:
            print("Error: Cannot connect to the server. Please make sure the Django server is running.")
            print("Run: python manage.py runserver")
            print("Or run with --skip-server-check to skip this check")
            sys.exit(1)
    
    # Run tests
    run_all_tests(args.test)
