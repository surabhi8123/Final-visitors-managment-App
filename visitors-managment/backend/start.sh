#!/usr/bin/env bash
# Exit on error
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

echo "=== Starting Visitor Management Backend ==="
echo "Timestamp: $(date)"

# Database connection retry with simple loop
echo "Checking database connectivity..."
max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Database connection attempt $attempt/$max_attempts..."
    
    if python -c "
import os
import django
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()
from django.db import connection
try:
    cursor = connection.cursor()
    cursor.execute('SELECT 1')
    cursor.close()
    print('✓ Database connection successful')
except Exception as e:
    print(f'✗ Database connection failed: {e}')
    sys.exit(1)
"; then
        echo "✓ Database is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "✗ Database connection failed after $max_attempts attempts"
        echo "Please check your database service status in Render dashboard"
        exit 1
    fi
    
    # Progressive backoff: 2s, 4s, 8s, 16s, then 30s
    if [ $attempt -le 4 ]; then
        sleep_time=$((2 ** $attempt))
    else
        sleep_time=30
    fi
    
    echo "Waiting ${sleep_time}s before next attempt..."
    sleep $sleep_time
    attempt=$((attempt + 1))
done

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
exec python -m gunicorn visitor_management.wsgi:application \
  --bind 0.0.0.0:"${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-4}" \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100
