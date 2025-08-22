# ThorSignia Admin Login System

This document describes the custom admin login system for the ThorSignia Visitors Management System.

## Features

- Custom admin login with email and password authentication
- Secure session management
- Responsive and modern UI design
- Integration with existing Django project structure

## Default Admin Credentials

- **Email**: admin@thorsignia.com
- **Password**: admin123

## URLs

- **Admin Login**: `http://127.0.0.1:8000/admin-login/`
- **Admin Dashboard**: `http://127.0.0.1:8000/admin-dashboard/`
- **Admin Logout**: `http://127.0.0.1:8000/admin-logout/`

## Setup

1. The admin user is automatically created when you run `python create_custom_admin.py`
2. The system uses Django sessions for authentication
3. All admin templates are located in `templates/admin/`

## Security Notes

- In production, passwords should be hashed using Django's password hashing
- Consider implementing additional security measures like:
  - Password complexity requirements
  - Account lockout after failed attempts
  - Two-factor authentication
  - HTTPS enforcement

## Files Modified/Created

### New Files:
- `templates/admin/base.html` - Base template with styling
- `templates/admin/login.html` - Login form template
- `templates/admin/dashboard.html` - Dashboard template
- `create_custom_admin.py` - Script to create admin user
- `ADMIN_README.md` - This documentation

### Modified Files:
- `visitors/models.py` - Added CustomAdmin model
- `visitors/views.py` - Added admin views
- `visitor_management/urls.py` - Added admin URL patterns
- `visitor_management/settings.py` - Updated templates directory

## Integration

The admin system is designed to work alongside the existing Django admin interface and API endpoints without any conflicts. The custom admin provides a simplified interface for basic administrative tasks. 