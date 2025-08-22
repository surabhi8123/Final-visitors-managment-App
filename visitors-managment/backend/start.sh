#!/bin/bash
# Railway-optimized startup script
set -e

echo "=== Starting Visitor Management Backend ==="
echo "Timestamp: $(date)"

# Install requirements (in case of cache issues)
pip install -r requirements.txt

# Wait for Railway database to be ready
echo "Waiting for Railway database..."
sleep 15

# Database connection test with Railway-specific retry logic
echo "Testing Railway PostgreSQL connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Railway DB connection attempt $attempt/$max_attempts..."
    
    if python -c "
import os
import django
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()
from django.db import connection
try:
    cursor = connection.cursor()
    cursor.execute('SELECT version()')
    db_version = cursor.fetchone()[0]
    cursor.close()
    print(f'✓ Railway PostgreSQL connected: {db_version[:50]}...')
except Exception as e:
    print(f'✗ Railway connection failed: {e}')
    sys.exit(1)
"; then
        echo "✓ Railway database is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "✗ Railway database connection failed after $max_attempts attempts"
        echo "Check Railway dashboard - database may be paused or credentials changed"
        exit 1
    fi
    
    # Railway-specific backoff: shorter intervals
    if [ $attempt -le 3 ]; then
        sleep_time=5
    elif [ $attempt -le 10 ]; then
        sleep_time=10
    else
        sleep_time=20
    fi
    
    echo "Retrying in ${sleep_time}s..."
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
exec gunicorn visitor_management.wsgi:application \
  --bind 0.0.0.0:$PORT \
  --workers ${WEB_CONCURRENCY:-4} \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100
