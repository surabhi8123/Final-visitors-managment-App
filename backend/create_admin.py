#!/usr/bin/env python3
"""
Create Admin Superuser Script
"""

import os
import django
from django.contrib.auth.models import User

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()

def create_admin_user():
    """Create admin superuser if it doesn't exist"""
    try:
        # Check if admin user already exists
        if User.objects.filter(username='admin').exists():
            print("Admin user already exists!")
            return
        
        # Create admin superuser
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        
        print("Admin superuser created successfully!")
        print("Username: admin")
        print("Password: admin123")
        print("Email: admin@example.com")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")

if __name__ == "__main__":
    create_admin_user() 