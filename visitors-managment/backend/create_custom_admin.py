#!/usr/bin/env python3
"""
Create Custom Admin User Script for ThorSignia
"""

import os
import django
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()

from visitors.models import CustomAdmin

def create_custom_admin():
    """Create custom admin user if it doesn't exist"""
    try:
        # Check if custom admin already exists
        if CustomAdmin.objects.filter(email='admin@thorsignia.com').exists():
            print("Custom admin user already exists!")
            return
        
        # Create custom admin user
        admin_user = CustomAdmin.objects.create(
            email='admin@thorsignia.com',
            password='admin123',
            is_active=True
        )
        
        print("Custom admin user created successfully!")
        print("Email: admin@thorsignia.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error creating custom admin user: {e}")

if __name__ == "__main__":
    create_custom_admin() 