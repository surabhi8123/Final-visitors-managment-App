import os
import sys
from pathlib import Path

# Ensure backend/ is on the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR / "backend"))

# Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "visitor_management.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Adapt WSGI app to Vercel
from vercel_wsgi import handle

def handler(event, context):
    return handle(event, context, application)
