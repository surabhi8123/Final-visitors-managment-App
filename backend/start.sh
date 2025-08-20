#!/usr/bin/env bash
# Exit on error
set -o errexit

# Start Gunicorn
python manage.py runserver 0.0.0.0:10000
