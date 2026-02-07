
import React from 'react';

const ErrorAlert = ({ error, onClose }) => {
  // Don't render anything if no error
  if (!error) return null;
  
  // Extract error message
  let message = '';
  
  if (typeof error === 'string') {
    // Simple string error
    message = error;
  } else if (error.userMessage) {
    // Error with custom user message (from API interceptor)
    message = error.userMessage;
  } else if (error.message) {
    // Standard Error object
    message = error.message;
  } else if (error.response && error.response.data) {
    // Axios error with response data
    const data = error.response.data;
    
    if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    } else if (data.detail) {
      message = data.detail;
    } else {
      message = 'An error occurred. Please try again.';
    }
  } else {
    message = 'An unexpected error occurred.';
  }
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r">
      <div className="flex items-start">
        {/* Error icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Error message */}
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        
        {/* Close button (optional) */}
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SuccessAlert component.
 * 
 * Displays a success message in a styled alert box with an icon.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Success message to display
 * @param {Function} props.onClose - Optional callback when close button is clicked
 */
export const SuccessAlert = ({ message, onClose }) => {
  // Don't render anything if no message
  if (!message) return null;
  
  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r">
      <div className="flex items-start">
        {/* Success icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Success message */}
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-700">{message}</p>
        </div>
        
        {/* Close button (optional) */}
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * InfoAlert component.
 * 
 * Displays an informational message in a styled alert box with an icon.
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Info message to display
 * @param {Function} props.onClose - Optional callback when close button is clicked
 */
export const InfoAlert = ({ message, onClose }) => {
  // Don't render anything if no message
  if (!message) return null;
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
      <div className="flex items-start">
        {/* Info icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        {/* Info message */}
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
        
        {/* Close button (optional) */}
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
