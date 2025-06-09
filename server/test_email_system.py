#!/usr/bin/env python
"""
Test script for email verification system
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alistpros.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from users.models import CustomUser, EmailVerification
from users.email_verification import send_verification_email

def test_email_settings():
    """Test email configuration"""
    print("🔧 Testing Email Configuration...")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    print()

def test_simple_email():
    """Test sending a simple email"""
    print("📧 Testing Simple Email Send...")
    try:
        send_mail(
            subject='Test Email from A-List Home Pros',
            message='This is a test email to verify Gmail configuration.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],  # Send to self
            fail_silently=False,
        )
        print("✅ Simple email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to send simple email: {e}")
        return False

def test_verification_email():
    """Test verification email system"""
    print("🔐 Testing Verification Email System...")
    
    # Create a test user
    test_email = "test@example.com"
    try:
        # Delete existing test user if exists
        CustomUser.objects.filter(email=test_email).delete()
        
        # Create new test user
        user = CustomUser.objects.create_user(
            email=test_email,
            name="Test User",
            phone_number="+201234567890",
            password="testpass123",
            role="client"
        )
        print(f"✅ Created test user: {user.email}")
        
        # Send verification email
        success = send_verification_email(user)
        if success:
            print("✅ Verification email sent successfully!")
            
            # Get verification token
            verification = EmailVerification.objects.filter(user=user).last()
            if verification:
                verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification.token}&user_id={user.id}"
                print(f"🔗 Verification URL: {verification_url}")
            
            return True
        else:
            print("❌ Failed to send verification email")
            return False
            
    except Exception as e:
        print(f"❌ Error in verification email test: {e}")
        return False
    finally:
        # Clean up test user
        try:
            CustomUser.objects.filter(email=test_email).delete()
            print("🧹 Cleaned up test user")
        except:
            pass

def test_all_user_roles():
    """Test registration for all user roles"""
    print("👥 Testing All User Roles...")
    
    roles = ['client', 'contractor', 'crew', 'specialist']
    
    for role in roles:
        test_email = f"test_{role}@example.com"
        try:
            # Delete existing test user if exists
            CustomUser.objects.filter(email=test_email).delete()
            
            # Create user with specific role
            user = CustomUser.objects.create_user(
                email=test_email,
                name=f"Test {role.title()}",
                phone_number=f"+20123456789{roles.index(role)}",
                password="testpass123",
                role=role
            )
            print(f"✅ Created {role} user: {user.email}")
            
            # Test verification email
            success = send_verification_email(user)
            if success:
                print(f"✅ Verification email sent for {role}")
            else:
                print(f"❌ Failed to send verification email for {role}")
                
        except Exception as e:
            print(f"❌ Error creating {role} user: {e}")
        finally:
            # Clean up
            try:
                CustomUser.objects.filter(email=test_email).delete()
            except:
                pass

def main():
    """Run all tests"""
    print("🚀 Starting A-List Home Pros Email System Tests\n")
    
    # Test 1: Email configuration
    test_email_settings()
    
    # Test 2: Simple email
    simple_success = test_simple_email()
    print()
    
    # Test 3: Verification email
    if simple_success:
        verification_success = test_verification_email()
        print()
        
        # Test 4: All user roles
        if verification_success:
            test_all_user_roles()
    
    print("\n🏁 Email system tests completed!")

if __name__ == "__main__":
    main() 