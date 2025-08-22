#!/usr/bin/env python3
"""
Setup script for the Visitor Management System backend.
This script initializes the database and creates a superuser.
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model

def setup_database():
    """Initialize the database with migrations."""
    print("Running database migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    print("Database migrations completed successfully!")

def create_superuser():
    """Create a superuser account."""
    User = get_user_model()
    
    # Check if superuser already exists
    if User.objects.filter(is_superuser=True).exists():
        print("Superuser already exists. Skipping superuser creation.")
        return
    
    print("Creating superuser account...")
    try:
        superuser = User.objects.create_superuser(
            username='admin',
            email='admin@visitormanagement.com',
            password='admin123'
        )
        print(f"Superuser created successfully!")
        print(f"Username: {superuser.username}")
        print(f"Email: {superuser.email}")
        print(f"Password: admin123")
        print("Please change the password after first login.")
    except Exception as e:
        print(f"Error creating superuser: {e}")

def main():
    """Main setup function."""
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
    django.setup()
    
    print("Setting up Visitor Management System Backend...")
    print("=" * 50)
    
    # Setup database
    setup_database()
    
    # Create superuser
    create_superuser()
    
    print("=" * 50)
    print("Backend setup completed successfully!")
    print("You can now run the development server with:")
    print("python manage.py runserver")

if __name__ == '__main__':
    main() 