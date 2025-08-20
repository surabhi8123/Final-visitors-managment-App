#!/bin/bash

# Change to the backend directory
cd /opt/render/project/src/backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Gunicorn
exec gunicorn visitor_management.wsgi:application --bind 0.0.0.0:$PORT
