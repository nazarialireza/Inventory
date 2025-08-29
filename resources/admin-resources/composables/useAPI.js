import axios from 'axios';
import { ref, computed } from 'vue';
import { useOfflineCache } from './useOfflineCache';

// API configuration
const API_BASE_URL = '/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Configure axios defaults
axios.defaults.timeout = REQUEST_TIMEOUT;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

class APIService {
  constructor() {
    this.loading = ref(false);
    this.error = ref(null);
    this.cache = useOfflineCache();
    
    // Setup axios interceptors
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        this.loading.value = true;
        this.error.value = null;
        
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        this.loading.value = false;
        this.error.value = error.message;
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        this.loading.value = false;
        return response;
      },
      async (error) => {
        this.loading.value = false;
        
        if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
          // Network error or offline - try to get cached data
          const cachedData = await this.getCachedResponse(error.config);
          if (cachedData) {
            return { data: cachedData, fromCache: true };
          }
        }
        
        this.error.value = this.getErrorMessage(error);
        return Promise.reject(error);
      }
    );
  }

  async getCachedResponse(config) {
    const url = this.buildFullUrl(config.url);
    return await this.cache.getCachedAPI(url);
  }

  buildFullUrl(url) {
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  }

  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // Generic API request method with caching
  async request(method, url, data = null, options = {}) {
    const {
      cache = true,
      cacheExpiry = this.cache.CACHE_EXPIRY.MEDIUM,
      forceRefresh = false
    } = options;

    const fullUrl = this.buildFullUrl(url);

    try {
      // Check cache first for GET requests
      if (method === 'GET' && cache && !forceRefresh) {
        const cachedData = await this.cache.getCachedAPI(fullUrl);
        if (cachedData) {
          return { data: cachedData, fromCache: true };
        }
      }

      // Make the API request
      const response = await axios({
        method,
        url: fullUrl,
        data,
        ...options
      });

      // Cache successful GET responses
      if (method === 'GET' && cache && response.data) {
        await this.cache.setCachedAPI(fullUrl, response.data, cacheExpiry);
      }

      return response;

    } catch (error) {
      // If offline, try to return cached data for GET requests
      if (method === 'GET' && cache && (!navigator.onLine || error.code === 'ERR_NETWORK')) {
        const cachedData = await this.cache.getCachedAPI(fullUrl);
        if (cachedData) {
          return { data: cachedData, fromCache: true, offline: true };
        }
      }

      throw error;
    }
  }

  // Convenience methods
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  async put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  async patch(url, data, options = {}) {
    return this.request('PATCH', url, data, options);
  }

  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  // Entity-specific API methods with offline support
  async getProducts(options = {}) {
    try {
      const response = await this.get('/products', {
        cacheExpiry: this.cache.CACHE_EXPIRY.LONG,
        ...options
      });
      
      // Also save to offline storage
      if (response.data && Array.isArray(response.data)) {
        for (const product of response.data) {
          await this.cache.saveProduct(product);
        }
      }
      
      return response;
    } catch (error) {
      // Return offline data if API fails
      const offlineProducts = await this.cache.getProducts();
      if (offlineProducts.length > 0) {
        return { data: offlineProducts, fromCache: true, offline: true };
      }
      throw error;
    }
  }

  async saveProduct(product) {
    try {
      const response = await this.post('/products', product);
      
      // Update offline storage
      await this.cache.saveProduct({ ...product, id: response.data.id });
      
      return response;
    } catch (error) {
      // Save to offline storage if API fails
      if (!navigator.onLine) {
        await this.cache.saveProduct(product);
        return { data: product, offline: true };
      }
      throw error;
    }
  }

  async getSales(options = {}) {
    try {
      const response = await this.get('/sales', {
        cacheExpiry: this.cache.CACHE_EXPIRY.MEDIUM,
        ...options
      });
      
      if (response.data && Array.isArray(response.data)) {
        for (const sale of response.data) {
          await this.cache.saveSale(sale);
        }
      }
      
      return response;
    } catch (error) {
      const offlineSales = await this.cache.getSales();
      if (offlineSales.length > 0) {
        return { data: offlineSales, fromCache: true, offline: true };
      }
      throw error;
    }
  }

  async saveSale(sale) {
    try {
      const response = await this.post('/sales', sale);
      await this.cache.saveSale({ ...sale, id: response.data.id });
      return response;
    } catch (error) {
      if (!navigator.onLine) {
        await this.cache.saveSale(sale);
        return { data: sale, offline: true };
      }
      throw error;
    }
  }

  async getPurchases(options = {}) {
    try {
      const response = await this.get('/purchases', {
        cacheExpiry: this.cache.CACHE_EXPIRY.MEDIUM,
        ...options
      });
      
      if (response.data && Array.isArray(response.data)) {
        for (const purchase of response.data) {
          await this.cache.savePurchase(purchase);
        }
      }
      
      return response;
    } catch (error) {
      const offlinePurchases = await this.cache.getPurchases();
      if (offlinePurchases.length > 0) {
        return { data: offlinePurchases, fromCache: true, offline: true };
      }
      throw error;
    }
  }

  async savePurchase(purchase) {
    try {
      const response = await this.post('/purchases', purchase);
      await this.cache.savePurchase({ ...purchase, id: response.data.id });
      return response;
    } catch (error) {
      if (!navigator.onLine) {
        await this.cache.savePurchase(purchase);
        return { data: purchase, offline: true };
      }
      throw error;
    }
  }

  async getCustomers(options = {}) {
    try {
      const response = await this.get('/customers', {
        cacheExpiry: this.cache.CACHE_EXPIRY.LONG,
        ...options
      });
      
      if (response.data && Array.isArray(response.data)) {
        for (const customer of response.data) {
          await this.cache.saveCustomer(customer);
        }
      }
      
      return response;
    } catch (error) {
      const offlineCustomers = await this.cache.getCustomers();
      if (offlineCustomers.length > 0) {
        return { data: offlineCustomers, fromCache: true, offline: true };
      }
      throw error;
    }
  }

  async saveCustomer(customer) {
    try {
      const response = await this.post('/customers', customer);
      await this.cache.saveCustomer({ ...customer, id: response.data.id });
      return response;
    } catch (error) {
      if (!navigator.onLine) {
        await this.cache.saveCustomer(customer);
        return { data: customer, offline: true };
      }
      throw error;
    }
  }

  // Dashboard and analytics with caching
  async getDashboardStats(options = {}) {
    return this.get('/dashboard/stats', {
      cacheExpiry: this.cache.CACHE_EXPIRY.SHORT,
      ...options
    });
  }

  async getInventoryStats(options = {}) {
    return this.get('/inventory/stats', {
      cacheExpiry: this.cache.CACHE_EXPIRY.MEDIUM,
      ...options
    });
  }

  // Settings and configuration
  async getSettings(options = {}) {
    return this.get('/settings', {
      cacheExpiry: this.cache.CACHE_EXPIRY.EXTENDED,
      ...options
    });
  }

  // Force refresh cached data
  async refreshCache() {
    await this.cache.clearExpiredCache();
  }

  // Get offline status and metrics
  getOfflineStatus() {
    return {
      isOnline: this.cache.isOnline.value,
      syncInProgress: this.cache.syncInProgress.value,
      pendingSyncCount: this.cache.pendingSyncCount.value,
      lastSyncTime: this.cache.lastSyncTime.value
    };
  }

  // Manually trigger sync
  async syncOfflineData() {
    return this.cache.syncPendingData();
  }
}

// Create singleton instance
const apiService = new APIService();

// Composable function
export function useAPI() {
  return {
    // State
    loading: computed(() => apiService.loading.value),
    error: computed(() => apiService.error.value),
    
    // Generic methods
    request: apiService.request.bind(apiService),
    get: apiService.get.bind(apiService),
    post: apiService.post.bind(apiService),
    put: apiService.put.bind(apiService),
    patch: apiService.patch.bind(apiService),
    delete: apiService.delete.bind(apiService),
    
    // Entity-specific methods
    getProducts: apiService.getProducts.bind(apiService),
    saveProduct: apiService.saveProduct.bind(apiService),
    getSales: apiService.getSales.bind(apiService),
    saveSale: apiService.saveSale.bind(apiService),
    getPurchases: apiService.getPurchases.bind(apiService),
    savePurchase: apiService.savePurchase.bind(apiService),
    getCustomers: apiService.getCustomers.bind(apiService),
    saveCustomer: apiService.saveCustomer.bind(apiService),
    
    // Dashboard methods
    getDashboardStats: apiService.getDashboardStats.bind(apiService),
    getInventoryStats: apiService.getInventoryStats.bind(apiService),
    getSettings: apiService.getSettings.bind(apiService),
    
    // Cache and offline methods
    refreshCache: apiService.refreshCache.bind(apiService),
    getOfflineStatus: apiService.getOfflineStatus.bind(apiService),
    syncOfflineData: apiService.syncOfflineData.bind(apiService),
    
    // Clear errors
    clearError: () => { apiService.error.value = null; }
  };
}