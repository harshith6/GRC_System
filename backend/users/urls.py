from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CurrentUserView, HealthCheckView

#  Authentication & User URLs 
urlpatterns = [
    # GET /api/auth/health/ - Health check (no auth required)
    path('health/', HealthCheckView.as_view(), name='health-check'),
    
    # POST /api/auth/register/ - Register new user
    path('register/', RegisterView.as_view(), name='register'),
    
    # POST /api/auth/login/ - Login user
    path('login/', LoginView.as_view(), name='login'),
    
    # POST /api/auth/logout/ - Logout user
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # GET /api/auth/me/ - Get current logged-in user
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
