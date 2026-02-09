"""
Main URL configuration for compliance_api project.

This file defines all the URL routes for our application.
When a request comes in, Django matches the URL against these patterns
and routes it to the appropriate view.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI schema configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Compliance Checklist API",
        default_version='v1',
        description="""API documentation for the Compliance Checklist application.
        
        This API provides endpoints for:
        - User authentication (register, login, logout)
        - Checklist management (create, read, update, delete)
        - Checklist item management (create, read, update, delete)
        - Dashboard statistics
        
        **Authentication**: Most endpoints require token-based authentication.
        
        **Steps to get started:**
        1. Use POST /api/auth/login/ with username and password to get your token
        2. Click "Authorize" button and enter: Token YOUR_TOKEN_HERE
        3. Try other endpoints with your token
        """,
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@compliance.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Swagger/OpenAPI documentation endpoints
    # Swagger UI: Interactive API documentation with "Try it out" functionality
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    # ReDoc: Alternative documentation UI with a cleaner, more readable layout
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Django admin interface - web-based interface for managing data
    # Access at: http://localhost:8000/admin/
    path('admin/', admin.site.urls),
    
    # User authentication endpoints (login, register, logout)
    # Prefix: /api/auth/
    path('api/auth/', include('users.urls')),
    
    # Checklist and item management endpoints
    # Prefix: /api/
    path('api/', include('checklists.urls')),
]
