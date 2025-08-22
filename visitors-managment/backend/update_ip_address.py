#!/usr/bin/env python3
"""
Automatic IP Address Update Script
This script detects the current local IP address and updates all configuration files
to use the correct IP address for the visitor management system.
"""

import socket
import re
import os
import glob
from pathlib import Path

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

def find_files_with_ip():
    """Find all files that contain IP addresses to update"""
    project_root = Path(__file__).parent.parent
    patterns = [
        "**/*.md",
        "**/*.py", 
        "**/*.ts",
        "**/*.tsx",
        "**/*.js",
        "**/*.json",
        "**/*.plist"
    ]
    
    files_to_update = []
    for pattern in patterns:
        files_to_update.extend(project_root.glob(pattern))
    
    return files_to_update

def update_ip_in_file(file_path, old_ip, new_ip):
    """Update IP address in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count occurrences
        old_count = content.count(old_ip)
        if old_count == 0:
            return 0
        
        # Replace IP addresses
        new_content = content.replace(old_ip, new_ip)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return old_count
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return 0

def main():
    print("🔍 Automatic IP Address Update")
    print("=" * 40)
    
    # Get current IP
    current_ip = get_local_ip()
    print(f"📍 Current local IP: {current_ip}")
    
    # Find old IP addresses in files
    old_ips = ["192.168.1.38", "192.168.1.19"]  # Common IPs to replace
    
    project_root = Path(__file__).parent.parent
    files_to_update = find_files_with_ip()
    
    total_updates = 0
    updated_files = []
    
    for file_path in files_to_update:
        if file_path.is_file() and not file_path.name.startswith('.'):
            file_updates = 0
            for old_ip in old_ips:
                if old_ip != current_ip:
                    updates = update_ip_in_file(file_path, old_ip, current_ip)
                    file_updates += updates
            
            if file_updates > 0:
                updated_files.append((file_path, file_updates))
                total_updates += file_updates
    
    # Report results
    print(f"\n✅ Updated {len(updated_files)} files with {total_updates} IP address changes:")
    for file_path, count in updated_files:
        print(f"   📄 {file_path.relative_to(project_root)} ({count} changes)")
    
    print(f"\n🎯 All configuration files now use IP: {current_ip}")
    print(f"🌐 Test your API with: curl http://{current_ip}:8000/api/visitors/active/")

if __name__ == "__main__":
    main() 