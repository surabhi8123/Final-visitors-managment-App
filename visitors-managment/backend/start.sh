#!/usr/bin/env bash
# Exit on error
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

# Wait for database to be ready with retries
echo "Waiting for database to be ready..."
python -c "
import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()
from visitor_management.db_utils import wait_for_db
if not wait_for_db():
    sys.exit(1)
"

# Run database migrations with retry
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
"${PYTHON:-python}" -m gunicorn visitor_management.wsgi:application \
  --bind 0.0.0.0:"${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-4}" \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100
