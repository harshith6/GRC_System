"""
Django settings for compliance_api project.

This file contains all the configuration for our Django project.
It includes database settings, installed apps, middleware, and security settings.
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR points to the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
# In production, this should be loaded from environment variables
SECRET_KEY = 'django-insecure-dev-key-change-in-production-abc123xyz'

# SECURITY WARNING: don't run with debug turned on in production!
# Debug mode shows detailed error pages - useful for development
DEBUG = True

# List of hosts that can access this Django application
# In production, this should be set to your actual domain
ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# Application definition
# These are all the Django apps that make up our project
INSTALLED_APPS = [
    # Default Django apps for admin, auth, etc.
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',  # Django REST Framework for building APIs
    'rest_framework.authtoken',  # Token-based authentication
    'corsheaders',  # Handle Cross-Origin Resource Sharing (CORS)
    'django_filters',  # Filtering support for API endpoints
    'drf_yasg',  # Swagger/OpenAPI documentation generator
    
    # Our custom apps
    'users',  # User management and authentication
    'checklists',  # Checklist and item management
]

# Middleware - processing layers that handle requests/responses
# Order matters! Each request passes through these in order
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',  # Security enhancements
    'django.contrib.sessions.middleware.SessionMiddleware',  # Session management
    'corsheaders.middleware.CorsMiddleware',  # CORS handling (must be before CommonMiddleware)
    'django.middleware.common.CommonMiddleware',  # Common utilities
    'django.middleware.csrf.CsrfViewMiddleware',  # CSRF protection
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # User authentication
    'django.contrib.messages.middleware.MessageMiddleware',  # Message framework
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Clickjacking protection
]

# Root URL configuration - tells Django where to find our URL patterns
ROOT_URLCONF = 'compliance_api.urls'

# Template configuration - settings for HTML templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,  # Look for templates in each app's templates folder
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

# WSGI application - entry point for production servers
WSGI_APPLICATION = 'compliance_api.wsgi.application'


# Database configuration
# Using SQLite for simplicity - it's a file-based database
# In production, you'd want PostgreSQL or MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # Database file location
    }
}


# Password validation
# These validators ensure users create strong passwords
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


# REST Framework configuration
# Settings specific to Django REST Framework
REST_FRAMEWORK = {
    # Authentication classes - how users prove their identity
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Token-based auth
        'rest_framework.authentication.SessionAuthentication',  # Session-based auth for browsable API
    ],
    
    # Permission classes - who can access what
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require authentication by default
    ],
    
    # Pagination - how many items per page in list views
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # Show 20 items per page
    
    # Filter backend - allows filtering and searching
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    
    # Renderer classes - how data is formatted in responses
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',  # JSON format
        'rest_framework.renderers.BrowsableAPIRenderer',  # Nice web UI for testing
    ],
    
    # Custom exception handler for user-friendly error messages
    'EXCEPTION_HANDLER': 'checklists.exceptions.custom_exception_handler',
}


# CORS settings
# Allow our React frontend to make requests to the Django backend
# In development, React runs on port 3000, Django on port 8000
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
]

# Allow credentials (cookies, authorization headers) in CORS requests
CORS_ALLOW_CREDENTIALS = True


# Internationalization
# Settings for language, timezone, etc.
LANGUAGE_CODE = 'en-us'  # English (US)

TIME_ZONE = 'UTC'  # Use UTC for all timestamps (best practice)

USE_I18N = True  # Enable internationalization

USE_TZ = True  # Use timezone-aware datetimes


# Static files (CSS, JavaScript, Images)
# URL prefix for static files
STATIC_URL = 'static/'

# Default primary key field type
# Use BigAutoField for all models (can handle very large ID numbers)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'debug.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'checklists': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'users': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
