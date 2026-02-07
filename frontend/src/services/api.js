import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('Network error:', error.message);
      error.userMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
      return Promise.reject(error);
    }
    
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      error.userMessage = 'Your session has expired. Please log in again.';
      return Promise.reject(error);
    }
    
    // Extract user-friendly error message from response
    if (error.response.data) {
      const data = error.response.data;
      
      // Check if backend sent a user-friendly message
      if (data.message) {
        error.userMessage = data.message;
      } else if (data.error) {
        error.userMessage = data.error;
      } else if (data.detail) {
        error.userMessage = data.detail;
      } else if (typeof data === 'string') {
        error.userMessage = data;
      } else {
        // If we have validation errors, format them nicely
        const errors = Object.entries(data).map(([field, messages]) => {
          const messageList = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${messageList.join(', ')}`;
        }).join('; ');
        
        error.userMessage = errors || 'An error occurred while processing your request.';
      }
    } else {
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  
  register: (userData) => api.post('/api/auth/register/', userData),
  
  
  login: (credentials) => api.post('/api/auth/login/', credentials),
  
 
  logout: () => api.post('/api/auth/logout/'),
  
  getCurrentUser: () => api.get('/api/auth/me/'),
};


export const checklistAPI = {
 
  getAll: (params = {}) => api.get('/api/checklists/', { params }),
  
 
  getById: (id) => api.get(`/api/checklists/${id}/`),
  
 
  create: (data) => api.post('/api/checklists/', data),
  
 
  update: (id, data) => api.put(`/api/checklists/${id}/`, data),

  patch: (id, data) => api.patch(`/api/checklists/${id}/`, data),
  
  delete: (id) => api.delete(`/api/checklists/${id}/`),

  getItems: (checklistId) => api.get(`/api/checklists/${checklistId}/items/`),
  

  addItem: (checklistId, data) => api.post(`/api/checklists/${checklistId}/add-item/`, data),
};


export const itemAPI = {
  
  getById: (id) => api.get(`/api/items/${id}/`),
  
  
  update: (id, data) => api.put(`/api/items/${id}/`, data),
  
 
  patch: (id, data) => api.patch(`/api/items/${id}/`, data),
  
  
  delete: (id) => api.delete(`/api/items/${id}/`),
  

  complete: (id, data = {}) => api.post(`/api/items/${id}/complete/`, data),
};


export const dashboardAPI = {

  getStats: () => api.get('/api/stats/'),
};

export default api;
