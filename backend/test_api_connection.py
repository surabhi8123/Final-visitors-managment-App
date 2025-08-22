#!/usr/bin/env python3
"""
Quick API Connection Test Script
Run this to diagnose connection issues with the visitor management API
"""

import requests
import socket
import subprocess
import sys
import os
from urllib.parse import urljoin

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def check_port_open(host, port):
    """Check if a port is open on the given host"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False

def test_api_endpoint(base_url, endpoint=""):
    """Test an API endpoint"""
    url = urljoin(base_url, endpoint)
    try:
        response = requests.get(url, timeout=10)
        print(f"✅ {url} - Status: {response.status_code}")
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   Response: {data}")
            except:
                print(f"   Response: {response.text[:100]}...")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ {url} - Connection refused (server not running?)")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {url} - Timeout")
        return False
    except Exception as e:
        print(f"❌ {url} - Error: {e}")
        return False

def main():
    print("🔍 Visitor Management API Connection Test")
    print("=" * 50)
    
    # Get local IP
    local_ip = get_local_ip()
    print(f"Local IP: {local_ip}")
    
    # Test different URLs
    test_urls = [
        f"http://localhost:8000",
        f"http://127.0.0.1:8000", 
        f"http://{local_ip}:8000",
        "http://192.168.1.38:8000"  # Original IP from docs
    ]
    
    print("\n📡 Testing server connectivity:")
    for url in test_urls:
        host = url.split("://")[1].split(":")[0]
        port = 8000
        if check_port_open(host, port):
            print(f"✅ Port 8000 is open on {host}")
        else:
            print(f"❌ Port 8000 is closed on {host}")
    
    print("\n🌐 Testing API endpoints:")
    for base_url in test_urls:
        print(f"\nTesting base URL: {base_url}")
        test_api_endpoint(base_url, "/")
        test_api_endpoint(base_url, "/api/")
        test_api_endpoint(base_url, "/api/visitors/")
        test_api_endpoint(base_url, "/api/visitors/active/")
    
    print("\n💡 Quick Fix Suggestions:")
    print("1. Make sure Django server is running: python start_server.py")
    print("2. Check if port 8000 is not in use by another process")
    print("3. Verify firewall settings allow port 8000")
    print("4. Try using the local IP address instead of 192.168.1.38")
    print("5. Check if Django is running on 0.0.0.0:8000 (not just localhost)")

if __name__ == "__main__":
    main() 