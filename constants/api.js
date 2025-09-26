import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const API_CONFIG = {
  // Production backend URL
  BASE_URL: 'http://52.87.203.39:3000',
  
  // Development backend URL (if needed)
  // BASE_URL: 'http://34.170.37.228:3000',
  
  // API Endpoints
  ENDPOINTS: {
    // User auth endpoints (regular users)
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh',

    // Provider auth endpoints (vendors)
    // NOTE: If backend routes are cleaned up, these should be '/provider-auth/login' and '/provider-auth/register'
    PROVIDER_LOGIN: '/provider-auth/auth/provider/login',
    PROVIDER_REGISTER: '/provider-auth/register/ptovider',
    
    // Vendor specific endpoints (aligned to backend)
    // Providers
    PROVIDERS: '/service-providers',
    // Services
    SERVICES: '/services',
    SERVICES_BY_VENDOR: '/services/vendor', // GET /services/vendor/:serviceProviderId
    PROVIDER_SERVICES: '/services/provider', // GET /services/provider/:serviceProviderId/services
    // Orders and bookings
    ORDERS: '/orders',
    BOOKINGS: '/bookings',
    
    // Service management (extend if backend adds categories/details endpoints)
    SERVICE_CATEGORIES: '/services/categories',
    SERVICE_DETAILS: '/services',
    
    // Chat and messaging
    CHAT_ROOMS: '/chat/rooms',
    MESSAGES: '/chat/messages',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // noop
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Vendor-specific API functions
export const vendorAPI = {
  // Provider profile via providers controller
  getProfile: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${providerId}`);
  },
  
  updateProfile: async (providerId, data) => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${providerId}`, data);
  },
  
  // Services
  getServicesByVendor: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.SERVICES_BY_VENDOR}/${providerId}`);
  },
  getProviderServices: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.PROVIDER_SERVICES}/${providerId}/services`);
  },
  createService: async (data) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.SERVICES, data);
  },
  updateService: async (serviceId, data) => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.SERVICES}/${serviceId}`, data);
  },
  deleteService: async (serviceId) => {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.SERVICES}/${serviceId}`);
  },
  
  // Orders & earnings (wire up when backend endpoints exist)
  getOrders: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.ORDERS}?providerId=${providerId}`);
  },
  getEarnings: async (providerId) => {
    return apiClient.get(`/earnings?providerId=${providerId}`);
  },
  
  getCategories: async () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES);
  },
};

export default { API_CONFIG, getApiUrl, apiClient, vendorAPI };
