#!/usr/bin/env python3
"""
Setup script for PostgreSQL database configuration.
This script helps set up the database and create necessary tables.
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_postgresql():
    """Check if PostgreSQL is installed and running."""
    print("🔍 Checking PostgreSQL installation...")
    
    # Check if psql is available
    try:
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ PostgreSQL found: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ PostgreSQL not found. Please install PostgreSQL first.")
    print("\n📋 Installation options:")
    print("1. Download from: https://www.postgresql.org/download/windows/")
    print("2. Use Chocolatey: choco install postgresql")
    print("3. Use winget: winget install PostgreSQL.PostgreSQL")
    return False

def setup_database():
    """Set up the database and run migrations."""
    print("\n🚀 Setting up database...")
    
    # Check if .env file exists
    env_file = Path('.env')
    if not env_file.exists():
        print("📝 Creating .env file...")
        env_content = """# Database Configuration
DB_NAME=visitor_management
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=7c42b91109e6bf35d04fcf5be4b9607080e0bd4e722ad32aa1e805162816d548
DEBUG=True
CORS_ALLOW_ALL_ORIGINS=True
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created")
    
    # Run migrations
    if not run_command('python manage.py makemigrations', 'Creating migrations'):
        return False
    
    if not run_command('python manage.py migrate', 'Running migrations'):
        return False
    
    # Create superuser
    print("\n👤 Creating superuser...")
    print("You can skip this by pressing Ctrl+C if you don't want to create a superuser now.")
    try:
        run_command('python manage.py createsuperuser', 'Creating superuser')
    except KeyboardInterrupt:
        print("⏭️  Skipping superuser creation")
    
    return True

def main():
    """Main setup function."""
    print("🔧 PostgreSQL Django Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path('manage.py').exists():
        print("❌ Error: manage.py not found. Please run this script from the Django project root.")
        sys.exit(1)
    
    # Check PostgreSQL
    if not check_postgresql():
        sys.exit(1)
    
    # Setup database
    if not setup_database():
        print("❌ Database setup failed. Please check the errors above.")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the Django server: python manage.py runserver 0.0.0.0:8000")
    print("2. Test the API: http://localhost:8000/api/visitors/active/")
    print("3. Access admin panel: http://localhost:8000/admin/")

if __name__ == '__main__':
    main() 