#!/usr/bin/env bash
# Exit on error
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

# Wait for database to be ready
echo "Waiting for database to become available..."
python manage.py wait_for_db --timeout=120

# Run database migrations
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
