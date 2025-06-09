#!/usr/bin/env python
"""
Script to test and fix Swagger configuration for A-List Home Pros API
"""

import os
import sys
import subprocess
import webbrowser
from pathlib import Path

def check_virtual_env():
    """Check if virtual environment is activated"""
    return hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)

def check_django_installation():
    """Check if Django is installed and can be imported"""
    try:
        import django
        print(f"✅ Django {django.get_version()} is installed")
        return True
    except ImportError:
        print("❌ Django is not installed")
        return False

def check_required_packages():
    """Check if all required packages for Swagger are installed"""
    required_packages = [
        'django',
        'djangorestframework',
        'drf-yasg',
        'rest_framework_simplejwt',
        'django-cors-headers'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'djangorestframework':
                import rest_framework
                print(f"✅ {package} is installed")
            elif package == 'drf-yasg':
                import drf_yasg
                print(f"✅ {package} is installed")
            elif package == 'rest_framework_simplejwt':
                import rest_framework_simplejwt
                print(f"✅ {package} is installed")
            elif package == 'django-cors-headers':
                import corsheaders
                print(f"✅ {package} is installed")
            elif package == 'django':
                import django
                print(f"✅ {package} {django.get_version()} is installed")
        except ImportError:
            print(f"❌ {package} is not installed")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Install missing packages:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def run_django_checks():
    """Run Django system checks"""
    print("\n🔍 Running Django system checks...")
    try:
        result = subprocess.run(['python', 'manage.py', 'check'], 
                              capture_output=True, text=True, cwd='.')
        if result.returncode == 0:
            print("✅ Django checks passed")
            return True
        else:
            print("❌ Django checks failed:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error running Django checks: {e}")
        return False

def test_swagger_endpoints():
    """Test if Swagger endpoints are accessible"""
    import requests
    
    base_url = "http://127.0.0.1:8000"
    endpoints = [
        "/swagger/",
        "/swagger/?format=openapi",
        "/redoc/",
        "/api/"
    ]
    
    print(f"\n🌐 Testing Swagger endpoints on {base_url}...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint} - Working")
            else:
                print(f"⚠️ {endpoint} - Status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} - Connection failed: {e}")

def add_swagger_settings():
    """Add missing Swagger settings to Django settings"""
    settings_file = Path('alistpros/settings.py')
    
    if not settings_file.exists():
        print("❌ Settings file not found")
        return False
    
    swagger_settings = '''
# Swagger/OpenAPI settings for drf-yasg
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'SUPPORTED_SUBMIT_METHODS': [
        'get',
        'post',
        'put',
        'delete',
        'patch'
    ],
    'OPERATIONS_SORTER': 'alpha',
    'TAGS_SORTER': 'alpha',
    'DOC_EXPANSION': 'none',
    'DEEP_LINKING': True,
    'SHOW_EXTENSIONS': True,
    'DEFAULT_MODEL_RENDERING': 'model',
}

REDOC_SETTINGS = {
    'LAZY_RENDERING': False,
    'HIDE_HOSTNAME': False,
    'EXPAND_RESPONSES': 'all',
    'PATH_IN_MIDDLE': True,
}
'''
    
    with open(settings_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'SWAGGER_SETTINGS' not in content:
        # Add before Stripe settings
        if 'STRIPE_SECRET_KEY' in content:
            content = content.replace('# Stripe settings', swagger_settings + '\n# Stripe settings')
        else:
            content += swagger_settings
        
        with open(settings_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Added Swagger settings to Django settings")
        return True
    else:
        print("✅ Swagger settings already exist")
        return True

def main():
    """Main function"""
    print("🚀 A-List Home Pros Swagger Configuration Checker")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path('manage.py').exists():
        print("❌ Please run this script from the Django project root (where manage.py is located)")
        return False
    
    # Check virtual environment
    if not check_virtual_env():
        print("⚠️ Virtual environment is not activated")
        print("Please activate it first: venv\\Scripts\\activate (Windows)")
    
    # Check Django installation
    if not check_django_installation():
        return False
    
    # Check required packages
    if not check_required_packages():
        return False
    
    # Add Swagger settings if missing
    add_swagger_settings()
    
    # Run Django checks
    if not run_django_checks():
        return False
    
    print("\n🎉 All checks passed!")
    print("\n📋 Next steps:")
    print("1. Run: python manage.py runserver 127.0.0.1:8000")
    print("2. Open: http://127.0.0.1:8000/swagger/")
    print("3. Open: http://127.0.0.1:8000/redoc/")
    
    # Try to open browser
    try:
        user_input = input("\n🌐 Would you like to start the server now? (y/n): ")
        if user_input.lower() in ['y', 'yes']:
            print("\n🚀 Starting Django development server...")
            subprocess.run(['python', 'manage.py', 'runserver', '127.0.0.1:8000'])
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    
    return True

if __name__ == '__main__':
    main() 