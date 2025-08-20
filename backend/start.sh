#!/usr/bin/env bash
# Exit on error
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

# Install dependencies if needed
pip install -r requirements.txt

# Run database migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
exec python manage.py runserver 0.0.0.0:10000
