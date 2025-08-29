import { ref, computed } from 'vue';

// IndexedDB database configuration
const DB_NAME = 'InvextryOfflineDB';
const DB_VERSION = 1;
const STORES = {
  CACHE: 'apiCache',
  PRODUCTS: 'products',
  SALES: 'sales',
  PURCHASES: 'purchases',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  SETTINGS: 'settings',
  SYNC_QUEUE: 'syncQueue'
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  EXTENDED: 7 * 24 * 60 * 60 * 1000 // 7 days
};

class OfflineCache {
  constructor() {
    this.db = null;
    this.isOnline = ref(navigator.onLine);
    this.syncInProgress = ref(false);
    this.pendingSyncCount = ref(0);
    this.lastSyncTime = ref(null);
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    this.initDB();
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadSyncStatus();
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            
            // Add indexes based on store type
            switch (storeName) {
              case STORES.CACHE:
                store.createIndex('url', 'url', { unique: true });
                store.createIndex('timestamp', 'timestamp');
                break;
              case STORES.PRODUCTS:
                store.createIndex('name', 'name');
                store.createIndex('category', 'category');
                break;
              case STORES.SALES:
              case STORES.PURCHASES:
                store.createIndex('date', 'date');
                store.createIndex('status', 'status');
                break;
              case STORES.CUSTOMERS:
              case STORES.SUPPLIERS:
                store.createIndex('name', 'name');
                break;
              case STORES.SYNC_QUEUE:
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('type', 'type');
                break;
            }
          }
        });
      };
    });
  }

  // Generic method to get data from store
  async getFromStore(storeName, key = null) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = key ? store.get(key) : store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to save data to store
  async saveToStore(storeName, data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete from store
  async deleteFromStore(storeName, key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // API Cache methods
  async getCachedAPI(url) {
    try {
      const cached = await this.getFromStore(STORES.CACHE);
      const entry = cached.find(item => item.url === url);
      
      if (entry && this.isCacheValid(entry.timestamp, entry.expiry)) {
        return entry.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached API:', error);
      return null;
    }
  }

  async setCachedAPI(url, data, expiry = CACHE_EXPIRY.MEDIUM) {
    try {
      const cacheEntry = {
        url,
        data,
        timestamp: Date.now(),
        expiry
      };
      
      await this.saveToStore(STORES.CACHE, cacheEntry);
    } catch (error) {
      console.error('Error setting cached API:', error);
    }
  }

  // Check if cache is still valid
  isCacheValid(timestamp, expiry) {
    return (Date.now() - timestamp) < expiry;
  }

  // Clear expired cache entries
  async clearExpiredCache() {
    try {
      const cached = await this.getFromStore(STORES.CACHE);
      const now = Date.now();
      
      for (const entry of cached) {
        if (!this.isCacheValid(entry.timestamp, entry.expiry)) {
          await this.deleteFromStore(STORES.CACHE, entry.id);
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Entity-specific cache methods
  async getProducts() {
    return this.getFromStore(STORES.PRODUCTS);
  }

  async saveProduct(product) {
    await this.saveToStore(STORES.PRODUCTS, {
      ...product,
      lastModified: Date.now(),
      syncStatus: this.isOnline.value ? 'synced' : 'pending'
    });
    
    if (!this.isOnline.value) {
      await this.addToSyncQueue('product', 'save', product);
    }
  }

  async getSales() {
    return this.getFromStore(STORES.SALES);
  }

  async saveSale(sale) {
    await this.saveToStore(STORES.SALES, {
      ...sale,
      lastModified: Date.now(),
      syncStatus: this.isOnline.value ? 'synced' : 'pending'
    });
    
    if (!this.isOnline.value) {
      await this.addToSyncQueue('sale', 'save', sale);
    }
  }

  async getPurchases() {
    return this.getFromStore(STORES.PURCHASES);
  }

  async savePurchase(purchase) {
    await this.saveToStore(STORES.PURCHASES, {
      ...purchase,
      lastModified: Date.now(),
      syncStatus: this.isOnline.value ? 'synced' : 'pending'
    });
    
    if (!this.isOnline.value) {
      await this.addToSyncQueue('purchase', 'save', purchase);
    }
  }

  async getCustomers() {
    return this.getFromStore(STORES.CUSTOMERS);
  }

  async saveCustomer(customer) {
    await this.saveToStore(STORES.CUSTOMERS, {
      ...customer,
      lastModified: Date.now(),
      syncStatus: this.isOnline.value ? 'synced' : 'pending'
    });
    
    if (!this.isOnline.value) {
      await this.addToSyncQueue('customer', 'save', customer);
    }
  }

  // Sync queue management
  async addToSyncQueue(entityType, action, data) {
    await this.saveToStore(STORES.SYNC_QUEUE, {
      entityType,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    this.updateSyncStatus();
  }

  async getSyncQueue() {
    return this.getFromStore(STORES.SYNC_QUEUE);
  }

  async clearSyncQueue(id) {
    await this.deleteFromStore(STORES.SYNC_QUEUE, id);
    this.updateSyncStatus();
  }

  async updateSyncStatus() {
    const queue = await this.getSyncQueue();
    this.pendingSyncCount.value = queue.length;
  }

  async loadSyncStatus() {
    await this.updateSyncStatus();
    
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('invextry_last_sync');
    if (lastSync) {
      this.lastSyncTime.value = new Date(parseInt(lastSync));
    }
  }

  // Network event handlers
  handleOnline() {
    this.isOnline.value = true;
    console.log('Back online - starting sync...');
    this.syncPendingData();
  }

  handleOffline() {
    this.isOnline.value = false;
    console.log('Gone offline - caching data locally');
  }

  // Sync pending data when back online
  async syncPendingData() {
    if (this.syncInProgress.value || !this.isOnline.value) return;
    
    this.syncInProgress.value = true;
    
    try {
      const queue = await this.getSyncQueue();
      
      for (const item of queue) {
        try {
          // Attempt to sync the item
          await this.syncItem(item);
          await this.clearSyncQueue(item.id);
        } catch (error) {
          console.error('Sync failed for item:', item, error);
          
          // Increment retry count
          item.retryCount = (item.retryCount || 0) + 1;
          
          // Remove from queue if too many retries
          if (item.retryCount > 3) {
            await this.clearSyncQueue(item.id);
          } else {
            await this.saveToStore(STORES.SYNC_QUEUE, item);
          }
        }
      }
      
      this.lastSyncTime.value = new Date();
      localStorage.setItem('invextry_last_sync', Date.now().toString());
      
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress.value = false;
    }
  }

  // Sync individual item
  async syncItem(item) {
    // This would integrate with your actual API
    // For now, just simulate the sync
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  // Clear all offline data
  async clearOfflineData() {
    if (!this.db) return;
    
    const storeNames = Object.values(STORES);
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    storeNames.forEach(storeName => {
      transaction.objectStore(storeName).clear();
    });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get offline storage usage
  async getStorageUsage() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { quota: 0, usage: 0, available: 0 };
    }
    
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota || 0,
      usage: estimate.usage || 0,
      available: (estimate.quota || 0) - (estimate.usage || 0)
    };
  }
}

// Create singleton instance
const offlineCache = new OfflineCache();

// Composable function
export function useOfflineCache() {
  return {
    // State
    isOnline: computed(() => offlineCache.isOnline.value),
    syncInProgress: computed(() => offlineCache.syncInProgress.value),
    pendingSyncCount: computed(() => offlineCache.pendingSyncCount.value),
    lastSyncTime: computed(() => offlineCache.lastSyncTime.value),
    
    // API Cache methods
    getCachedAPI: offlineCache.getCachedAPI.bind(offlineCache),
    setCachedAPI: offlineCache.setCachedAPI.bind(offlineCache),
    clearExpiredCache: offlineCache.clearExpiredCache.bind(offlineCache),
    
    // Entity methods
    getProducts: offlineCache.getProducts.bind(offlineCache),
    saveProduct: offlineCache.saveProduct.bind(offlineCache),
    getSales: offlineCache.getSales.bind(offlineCache),
    saveSale: offlineCache.saveSale.bind(offlineCache),
    getPurchases: offlineCache.getPurchases.bind(offlineCache),
    savePurchase: offlineCache.savePurchase.bind(offlineCache),
    getCustomers: offlineCache.getCustomers.bind(offlineCache),
    saveCustomer: offlineCache.saveCustomer.bind(offlineCache),
    
    // Sync methods
    syncPendingData: offlineCache.syncPendingData.bind(offlineCache),
    clearOfflineData: offlineCache.clearOfflineData.bind(offlineCache),
    getStorageUsage: offlineCache.getStorageUsage.bind(offlineCache),
    
    // Cache expiry constants
    CACHE_EXPIRY
  };
}