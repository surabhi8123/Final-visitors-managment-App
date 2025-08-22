#!/usr/bin/env bash
# Exit on error
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

# Wait for database with fallback retry logic
echo "Waiting for database to become available..."
if python manage.py wait_for_db --timeout=120 2>/dev/null; then
    echo "Database ready via wait_for_db command"
else
    echo "wait_for_db command not found, using fallback retry logic..."
    
    # Fallback: Simple retry loop for database connection
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Database connection attempt $attempt/$max_attempts..."
        
        if python -c "
import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visitor_management.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    print('Database connection successful')
    sys.exit(0)
except Exception as e:
    print(f'Database connection failed: {e}')
    sys.exit(1)
" 2>/dev/null; then
            echo "Database is ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo "Failed to connect to database after $max_attempts attempts"
            exit 1
        fi
        
        if [ $attempt -le 5 ]; then
            sleep_time=$((2 ** (attempt - 1)))
        else
            sleep_time=32
        fi
        echo "Waiting ${sleep_time}s before retry..."
        sleep $sleep_time
        attempt=$((attempt + 1))
    done
fi

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
