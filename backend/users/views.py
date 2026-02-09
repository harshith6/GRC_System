"""
User views (API endpoints).

These views handle HTTP requests for user authentication.
Each view is responsible for one specific action (register, login, logout).
Views use the service layer for all business logic operations.
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .services import UserService, AuthenticationService


class RegisterView(generics.CreateAPIView):

    # Allow anyone to access this endpoint (no authentication required)
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        
        # Validate the data - raises ValidationError if invalid
        serializer.is_valid(raise_exception=True)
        
        try:
            # Create user through service layer
            service = UserService()
            user, token = service.register_user(serializer.validated_data)
            
            # Return success response with user data and token
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'token': token,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    
    # Allow anyone to access this endpoint
    permission_classes = [AllowAny]
    
    # Tell Swagger what fields this endpoint accepts
    serializer_class = LoginSerializer
    
    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        """
        Handle POST request to authenticate a user using service layer.
        
        Steps:
        1. Validate email and password via serializer
        2. Call authentication service to verify credentials
        3. Service handles all business logic (validation, activation check)
        4. Return user data and token
        """
        serializer = LoginSerializer(data=request.data)
        
        # Validate the data
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Extract credentials
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Authenticate through service layer
            service = AuthenticationService()
            user, token = service.authenticate_user(email, password)
            
            # Return success response
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'token': token,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            # Return authentication error with proper error message
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    
    # Require authentication to logout
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(request_body=None)
    def post(self, request):
    
        try:
            # Logout through service layer
            service = AuthenticationService()
            service.logout_user(request.user)
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(APIView):
    
    # Require authentication
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(request_body=None)
    def get(self, request):
    
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'user': serializer.data
        }, status=status.HTTP_200_OK)

class HealthCheckView(APIView):
    """
    Simple health check endpoint to verify API is running.
    Accessible without authentication.
    """
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(request_body=None)
    def get(self, request):
        return Response({
            'success': True,
            'message': 'API is running'
        }, status=status.HTTP_200_OK)