#!/bin/bash
set -e

echo "=== Starting Render Deployment ==="
cd backend

echo "=== Waiting for Railway Database ==="
python wait_for_railway.py

echo "=== Running Django Migrations ==="
python manage.py migrate --noinput

echo "=== Collecting Static Files ==="
python manage.py collectstatic --noinput

echo "=== Starting Gunicorn Server ==="
exec gunicorn visitor_management.wsgi:application --bind 0.0.0.0:$PORT --workers 4
