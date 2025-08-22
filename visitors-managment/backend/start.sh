#!/usr/bin/env bash
# Exit on error
set -o errexit

# Change to the backend directory
cd "$(dirname "$0")"

# Run database migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

"${PYTHON:-python}" -m gunicorn visitor_management.wsgi:application \
  --bind 0.0.0.0:"${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-4}"
