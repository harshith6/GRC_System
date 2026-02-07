from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db.utils import OperationalError, DatabaseError, IntegrityError
from django.core.exceptions import ValidationError as DjangoValidationError
import logging

# Set up logging to track errors
logger = logging.getLogger(__name__)


class ValidationError(Exception):

    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field
        super().__init__(self.message)


class NotFoundException(Exception):
    """
    Exception raised when a requested resource is not found.
    """
    def __init__(self, resource: str, identifier):
        self.message = f"{resource} with id {identifier} not found"
        super().__init__(self.message)


class PermissionDeniedException(Exception):
    """
    Exception raised when user doesn't have permission for an operation.
    """
    def __init__(self, message: str = "You don't have permission to perform this action"):
        self.message = message
        super().__init__(self.message)


def custom_exception_handler(exc, context):

    # Call REST framework's default exception handler first to get the standard error response
    response = exception_handler(exc, context)
    
    # If DRF already handled the exception, just return its response
    if response is not None:
        return response
    
    # Log the exception for debugging purposes
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Handle custom validation errors from service layer
    if isinstance(exc, ValidationError):
        return Response(
            {
                'error': 'Validation Error',
                'message': exc.message,
                'field': exc.field
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Handle not found exceptions
    if isinstance(exc, NotFoundException):
        return Response(
            {
                'error': 'Not Found',
                'message': exc.message
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Handle permission denied exceptions
    if isinstance(exc, PermissionDeniedException):
        return Response(
            {
                'error': 'Permission Denied',
                'message': exc.message
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Handle database-related errors
    if isinstance(exc, OperationalError):
        # This usually means tables don't exist or database is locked
        error_message = str(exc).lower()
        
        if 'no such table' in error_message:
            # Database tables haven't been created yet
            return Response(
                {
                    'error': 'Database Setup Required',
                    'message': 'The database tables have not been created yet. Please run migrations.',
                    'technical_details': str(exc) if logger.level <= logging.DEBUG else None
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        elif 'locked' in error_message:
            # Database is locked (another process is using it)
            return Response(
                {
                    'error': 'Database Busy',
                    'message': 'The database is currently busy. Please try again in a moment.',
                    'technical_details': str(exc) if logger.level <= logging.DEBUG else None
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        else:
            # Other database operational errors
            return Response(
                {
                    'error': 'Database Error',
                    'message': 'A database error occurred. Please contact support if this persists.',
                    'technical_details': str(exc) if logger.level <= logging.DEBUG else None
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    
    # Handle generic database errors
    if isinstance(exc, DatabaseError):
        return Response(
            {
                'error': 'Database Error',
                'message': 'There was a problem accessing the database. Please try again later.',
                'technical_details': str(exc) if logger.level <= logging.DEBUG else None
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # Handle database integrity errors (NOT NULL, UNIQUE, FK constraints)
    if isinstance(exc, IntegrityError):
        error_msg = str(exc).lower()
        
        if 'not null constraint failed' in error_msg or 'null' in error_msg:
            # Extract field name if possible
            if 'created_by' in error_msg:
                return Response(
                    {
                        'error': 'Missing Required Field',
                        'message': 'You must be logged in to create a checklist.',
                        'details': 'created_by field is required'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {
                    'error': 'Missing Required Data',
                    'message': 'One or more required fields are missing.',
                    'technical_details': str(exc) if logger.level <= logging.DEBUG else None
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        elif 'unique constraint' in error_msg:
            return Response(
                {
                    'error': 'Duplicate Entry',
                    'message': 'This record already exists. Please use different values.',
                    'technical_details': str(exc) if logger.level <= logging.DEBUG else None
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            return Response(
                {
                    'error': 'Database Constraint Error',
                    'message': 'The data violates database constraints.',
                    'technical_details': str(exc) if logger.level <= logging.DEBUG else None
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        return Response(
            {
                'error': 'Validation Error',
                'message': 'The provided data is invalid.',
                'details': exc.messages if hasattr(exc, 'messages') else str(exc)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Handle any other unexpected exceptions
    return Response(
        {
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred. Our team has been notified.',
            'technical_details': str(exc) if logger.level <= logging.DEBUG else None
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
