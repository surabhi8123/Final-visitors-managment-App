#!/usr/bin/env python
"""
Script to start Django server with proper network configuration for mobile development.
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

def main():
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings_sqlite')
    django.setup()
    
    # Start server with proper network configuration
    sys.argv = [
        'manage.py',
        'runserver',
        '0.0.0.0:8000',  # Listen on all interfaces
        '--settings=visitor_management.settings_sqlite'
    ]
    
    print("🚀 Starting Django server for mobile development...")
    print("📍 Server will be accessible at:")
    print("   - Local: http://127.0.0.1:8000")
    print("   - Network: http://192.168.1.19:8000")
    print("   - Any device on your network: http://[YOUR_IP]:8000")
    print("")
    print("📱 Make sure your mobile device is on the same WiFi network!")
    print("")
    
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main() 