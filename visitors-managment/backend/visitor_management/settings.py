"""
Django settings for visitor_management project.
"""

import os
from pathlib import Path
from decouple import config, Csv
import dj_database_url
from urllib.parse import urlparse

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables with defaults
SECRET_KEY = config('SECRET_KEY', default='django-insecure-7c42b91109e6bf35d04fcf5be4b9607080e0bd4e722ad32aa1e805162816d548')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.vercel.app,.onrender.com', cast=Csv())

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'visitors',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'visitor_management.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'visitor_management.wsgi.application'

# Database Configuration
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# Default to SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Use PostgreSQL when DATABASE_URL is available (Render/Railway/Production)
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    import dj_database_url
    
    # Parse database configuration from $DATABASE_URL
    DATABASES['default'] = dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=0,  # Disable connection pooling to avoid stale connections
        conn_health_checks=True,
        ssl_require=False  # Let dj_database_url handle SSL automatically
    )
    
    # Ensure PostgreSQL is used
    DATABASES['default']['ENGINE'] = 'django.db.backends.postgresql'
    
    # Optimized connection settings for cloud databases
    DATABASES['default']['OPTIONS'] = {
        'connect_timeout': 30,     # Extended timeout
        'keepalives': 1,           # Enable TCP keep-alive
        'keepalives_idle': 30,     # Shorter idle time
        'keepalives_interval': 10, # More frequent keepalives
        'keepalives_count': 3,     # Close after 3 failed keepalives
        'sslmode': 'prefer',       # Prefer SSL but don't require it
    }
    
    # Force connection max age to 0 for stability
    DATABASES['default']['CONN_MAX_AGE'] = 0

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise static files storage for better performance on Render
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Only include directories that exist
STATICFILES_DIRS = []
static_dir = os.path.join(BASE_DIR, 'static')
if os.path.exists(static_dir):
    STATICFILES_DIRS.append(static_dir)

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings
# For now, allow all origins to simplify cross-origin requests during integration.
# You can lock this down later to specific domains.
CORS_ALLOW_ALL_ORIGINS = True

# Explicit list still useful in case we turn off the global flag later
CORS_ALLOWED_ORIGINS = [
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.0.2.2:8000",  # Android emulator special alias for localhost
    "http://192.168.1.19:19006",
    "http://192.168.1.19:8081",
    "http://192.168.1.19:3000",
    "http://192.168.1.29:8000",
    "http://192.168.1.29:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8000",
    "http://0.0.0.0:8000",
    "https://final-visitors-managment-app.vercel.app",
]
CORS_ALLOWED_ORIGIN_REGEXES = [r"^http://localhost:\d+$", r"^http://127\.0\.0\.1:\d+$"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Allow all headers for development
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Security headers for production
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
SECURE_REFERRER_POLICY = 'same-origin'

# CSRF trusted origins (will be extended dynamically for platforms)
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://10.0.2.2:8000',
    'http://192.168.1.29:8000',
    'https://final-visitors-managment-app.vercel.app',
]

# Respect proxy SSL (Render) and set cookie security based on DEBUG
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = False if DEBUG else False  # Keep False; Render handles TLS at edge

# Vercel-specific host/origin handling
vercel_host = os.environ.get('VERCEL_URL')
if vercel_host:
    # Ensure lists are present
    try:
        ALLOWED_HOSTS
    except NameError:
        ALLOWED_HOSTS = []

    try:
        CSRF_TRUSTED_ORIGINS
    except NameError:
        CSRF_TRUSTED_ORIGINS = []

    try:
        CORS_ALLOWED_ORIGINS
    except NameError:
        CORS_ALLOWED_ORIGINS = []

    # Normalize and append
    if vercel_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS += [vercel_host, '.vercel.app']

    vercel_https = f"https://{vercel_host}"
    if vercel_https not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(vercel_https)
    if vercel_https not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(vercel_https)

if 'VERCEL_URL' in os.environ:
    CSRF_TRUSTED_ORIGINS.append(os.environ['VERCEL_URL'])
    CORS_ALLOWED_ORIGINS.append(os.environ['VERCEL_URL'])

# Render-specific host/origin handling
render_external_url = os.environ.get('RENDER_EXTERNAL_URL')
if render_external_url:
    # Normalize to hostname and https origin
    hostname = render_external_url.replace('https://', '').replace('http://', '')
    if hostname not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(hostname)
    https_origin = f"https://{hostname}"
    if https_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(https_origin)
    if https_origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(https_origin)