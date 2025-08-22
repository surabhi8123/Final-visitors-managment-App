#!/usr/bin/env python3
"""
Railway database connection wait script
"""
import os
import sys
import time
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()

from django.db import connection

def wait_for_railway_db():
    """Wait for Railway database to become available"""
    print("=== Railway Database Connection Wait ===")
    max_attempts = 30
    attempt = 1
    
    while attempt <= max_attempts:
        print(f"Railway DB connection attempt {attempt}/{max_attempts}...")
        
        try:
            cursor = connection.cursor()
            cursor.execute('SELECT version()')
            db_version = cursor.fetchone()[0]
            cursor.close()
            print(f"✓ Railway PostgreSQL connected: {db_version[:50]}...")
            print("✓ Railway database is ready!")
            return True
            
        except Exception as e:
            print(f"✗ Railway connection failed: {e}")
            
            if attempt == max_attempts:
                print("✗ Railway database connection failed after all attempts")
                print("Check Railway dashboard - database may be paused or credentials changed")
                return False
            
            # Railway-specific backoff
            if attempt <= 3:
                sleep_time = 5
            elif attempt <= 10:
                sleep_time = 10
            else:
                sleep_time = 20
            
            print(f"Retrying in {sleep_time}s...")
            time.sleep(sleep_time)
            attempt += 1
    
    return False

if __name__ == "__main__":
    if not wait_for_railway_db():
        sys.exit(1)
