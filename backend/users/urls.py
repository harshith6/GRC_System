from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CurrentUserView

# No need for app_name since we're including with a prefix
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
