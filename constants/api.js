import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const API_CONFIG = {
  // Production backend URL
  BASE_URL: 'http://173.212.214.118:3000',
  
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
    PROVIDER_LOGIN: '/provider-auth/auth/provider/login',
    PROVIDER_REGISTER: '/provider-auth/register',
    PROVIDER_CHANGE_PASSWORD: '/provider-auth/change-password-provider',
    
    // Password Reset (for regular users)
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    
    // Provider Password Reset
    PROVIDER_FORGOT_PASSWORD: '/provider-auth/forgot-password',
    PROVIDER_RESET_PASSWORD: '/provider-auth/reset-password',
    
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
    
    // Chat and messaging (lightweight in-house messaging)
    MESSAGES: '/messages',
    MESSAGES_CONVERSATION: '/messages/conversation',
    PROVIDER_CONVERSATIONS: '/messages/provider',
    
    // Calls
    CALLS: '/calls',
    CALLS_TOKEN: '/calls/token',
    CALLS_ACTIVE: '/calls/active',
    // Notifications
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_UNREAD: '/notifications/unread-count',
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
    // Don't log 404 errors as they're expected for empty results
    if (error?.response?.status !== 404) {
      console.error('API Error:', error);
    }
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

  updatePushToken: async (providerId, pushToken) => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${providerId}/push-token`, {
      pushToken,
    });
  },
  
  updateLocation: async (providerId, latitude, longitude) => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.PROVIDERS}/${providerId}/location`, {
      latitude,
      longitude,
    });
  },

  uploadLogo: async (providerId, formData) => {
    return apiClient.put(
      `${API_CONFIG.ENDPOINTS.PROVIDERS}/${providerId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
        timeout: 120000, // 120 seconds (2 minutes) for file uploads on slower connections
      },
    );
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
  updateServiceWithImages: async (serviceId, formData) => {
    return apiClient.put(
      `${API_CONFIG.ENDPOINTS.SERVICES}/${serviceId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
        timeout: 120000, // 120 seconds (2 minutes) for file uploads on slower connections
      },
    );
  },
  deleteService: async (serviceId) => {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.SERVICES}/${serviceId}`);
  },
  // Multipart create with images
  createServiceWithImages: async (formData) => {
    return apiClient.post(
      `${API_CONFIG.ENDPOINTS.SERVICES}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
        timeout: 120000, // 120 seconds (2 minutes) for file uploads on slower connections
      },
    );
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

  getPendingRequests: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.BOOKINGS}/unconfirmed/${providerId}`);
  },

  updateBookingStatus: async (bookingId, data) => {
    return apiClient.patch(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}/status`, data);
  },

  getProviderBookings: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${providerId}/id`);
  },

  // Messaging
  getConversation: async (userId, providerId) => {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.MESSAGES_CONVERSATION}?userId=${encodeURIComponent(
        userId,
      )}&providerId=${encodeURIComponent(providerId)}`,
    );
  },
  getProviderConversations: async (providerId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.PROVIDER_CONVERSATIONS}/${providerId}`);
  },
  sendMessage: async ({ userId, providerId, senderType, content }) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES, {
      userId,
      providerId,
      senderType,
      content,
    });
  },

  // Calls
  createCall: async ({ userId, providerId }) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.CALLS, {
      userId,
      providerId,
    });
  },

  getCall: async (callId) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.CALLS}/${callId}`);
  },

  generateToken: async ({ channelName, uid }) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.CALLS_TOKEN, {
      channelName,
      uid,
    });
  },

  getActiveCall: async (userId, providerId) => {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.CALLS_ACTIVE}?userId=${encodeURIComponent(userId)}&providerId=${encodeURIComponent(providerId)}`,
    );
  },

  // Notifications
  getNotifications: async ({ providerId, limit = 50 }) => {
    return apiClient.get(
      `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}?providerId=${encodeURIComponent(providerId)}&limit=${limit}`,
    );
  },

  getUnreadNotificationsCount: async (providerId) => {
    try {
      return await apiClient.get(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS_UNREAD}?providerId=${encodeURIComponent(providerId)}`,
      );
    } catch (error) {
      if (error?.response?.status === 404) {
        return { data: { count: 0 } };
      }
      throw error;
    }
  },

  markNotificationsRead: async ({ providerId, ids }) => {
    return apiClient.patch(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/read`, {
      providerId,
      ids,
    });
  },

  // Password Reset
  requestPasswordReset: async (usernameOrEmail) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.PROVIDER_FORGOT_PASSWORD, {
      usernameOrEmail,
    });
  },

  resetPassword: async ({ token, newPassword }) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.PROVIDER_RESET_PASSWORD, {
      token,
      newPassword,
    });
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    return apiClient.patch(API_CONFIG.ENDPOINTS.PROVIDER_CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
    });
  },
};

export default { API_CONFIG, getApiUrl, apiClient, vendorAPI };
