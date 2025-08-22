#!/usr/bin/env python3
"""
Test script for photo upload functionality.
Run this script to test the photo upload endpoint.
"""

import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings_sqlite')
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from visitors.models import Visitor, Visit, VisitorPhoto
from visitors.serializers import CheckInSerializer

def test_photo_upload():
    """Test photo upload functionality."""
    print("Testing photo upload functionality...")
    
    # Create a proper JPEG image file (minimal valid JPEG)
    # This is a 1x1 pixel JPEG image in base64
    jpeg_header = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
    
    test_image = SimpleUploadedFile(
        name='test_visitor.jpg',
        content=jpeg_header,
        content_type='image/jpeg'
    )
    
    # Use unique data to avoid database constraints
    import time
    timestamp = int(time.time())
    
    # Test data
    test_data = {
        'name': f'Test Visitor {timestamp}',
        'email': f'test{timestamp}@example.com',
        'phone': f'123456{timestamp}',
        'purpose': 'Testing photo upload',
        'host_name': 'Test Host',
        'photo': test_image
    }
    
    try:
        # Test serializer
        serializer = CheckInSerializer(data=test_data)
        if serializer.is_valid():
            print("✅ Serializer validation passed")
            
            # Test creating visitor and visit
            data = serializer.validated_data
            visitor = Visitor.objects.create(
                name=data['name'],
                email=data['email'],
                phone=data['phone']
            )
            print(f"✅ Created visitor: {visitor.name}")
            
            visit = Visit.objects.create(
                visitor=visitor,
                purpose=data['purpose'],
                host_name=data.get('host_name', '')
            )
            print(f"✅ Created visit: {visit.id}")
            
            # Test photo creation
            if 'photo' in data:
                photo = VisitorPhoto.objects.create(
                    visitor=visitor,
                    visit=visit,
                    image=data['photo']
                )
                print(f"✅ Created photo: {photo.image.name}")
                print(f"   Photo URL: {photo.image.url}")
                print(f"   Photo path: {photo.image.path}")
            
            print("\n🎉 All tests passed!")
            
        else:
            print("❌ Serializer validation failed:")
            print(serializer.errors)
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

def check_media_directory():
    """Check if media directory exists and is writable."""
    print("\nChecking media directory...")
    
    media_root = Path(__file__).resolve().parent / 'media'
    visitor_photos_dir = media_root / 'visitor_photos'
    
    print(f"Media root: {media_root}")
    print(f"Visitor photos dir: {visitor_photos_dir}")
    
    # Create directories if they don't exist
    visitor_photos_dir.mkdir(parents=True, exist_ok=True)
    
    if media_root.exists():
        print("✅ Media directory exists")
    else:
        print("❌ Media directory does not exist")
        
    if visitor_photos_dir.exists():
        print("✅ Visitor photos directory exists")
    else:
        print("❌ Visitor photos directory does not exist")
        
    # Test write permissions
    try:
        test_file = visitor_photos_dir / 'test_write.txt'
        test_file.write_text('test')
        test_file.unlink()  # Clean up
        print("✅ Write permissions OK")
    except Exception as e:
        print(f"❌ Write permission error: {e}")

if __name__ == '__main__':
    print("=" * 50)
    print("Photo Upload Test Script")
    print("=" * 50)
    
    check_media_directory()
    test_photo_upload()
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("=" * 50) 