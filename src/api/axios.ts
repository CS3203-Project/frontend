import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 0, // No timeout - unlimited time
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth tokens here if needed
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    // Use admin token if available (for admin routes)
    if (config.url?.includes('/admin') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (error.config?.url?.includes('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Redirect to admin login if needed
        window.location.href = '/admin-login';
      } else {
        localStorage.removeItem('token');
        // Redirect to regular login if needed
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
