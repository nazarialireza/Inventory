<template>
  <div class="offline-status-indicator">
    <!-- Main Status Bar -->
    <div 
      v-if="!isOnline || pendingSyncCount > 0"
      :class="statusBarClasses"
      @click="toggleDetails"
    >
      <div class="status-content">
        <!-- Offline Indicator -->
        <div v-if="!isOnline" class="status-item">
          <WifiOffIcon class="status-icon" />
          <span class="status-text">{{ t('offline.status.offline') }}</span>
        </div>
        
        <!-- Sync Indicator -->
        <div v-else-if="syncInProgress" class="status-item">
          <div class="sync-spinner"></div>
          <span class="status-text">{{ t('offline.status.syncing') }}</span>
        </div>
        
        <!-- Pending Sync -->
        <div v-else-if="pendingSyncCount > 0" class="status-item">
          <SyncIcon class="status-icon status-icon-warning" />
          <span class="status-text">
            {{ t('offline.status.pending_sync', { count: pendingSyncCount }) }}
          </span>
        </div>
        
        <!-- Expand Icon -->
        <ChevronDownIcon 
          :class="['expand-icon', { 'expand-icon-rotated': showDetails }]"
        />
      </div>
    </div>

    <!-- Detailed Status Panel -->
    <Transition name="slide-down">
      <div v-if="showDetails" class="status-details">
        <div class="status-details-content">
          <!-- Connection Status -->
          <div class="status-section">
            <h4 class="status-section-title">{{ t('offline.connection_status') }}</h4>
            <div class="status-row">
              <component 
                :is="isOnline ? 'WifiIcon' : 'WifiOffIcon'"
                :class="['status-row-icon', isOnline ? 'status-icon-success' : 'status-icon-error']"
              />
              <span>{{ isOnline ? t('offline.online') : t('offline.offline') }}</span>
            </div>
          </div>

          <!-- Sync Information -->
          <div v-if="isOnline" class="status-section">
            <h4 class="status-section-title">{{ t('offline.sync_status') }}</h4>
            
            <!-- Last Sync Time -->
            <div v-if="lastSyncTime" class="status-row">
              <ClockIcon class="status-row-icon" />
              <span>{{ t('offline.last_sync') }}: {{ formatSyncTime(lastSyncTime) }}</span>
            </div>
            
            <!-- Pending Items -->
            <div v-if="pendingSyncCount > 0" class="status-row">
              <SyncIcon class="status-row-icon status-icon-warning" />
              <span>{{ t('offline.pending_items', { count: pendingSyncCount }) }}</span>
            </div>
            
            <!-- Sync Progress -->
            <div v-if="syncInProgress" class="status-row">
              <div class="sync-spinner small"></div>
              <span>{{ t('offline.syncing_progress') }}</span>
            </div>
          </div>

          <!-- Storage Information -->
          <div v-if="storageInfo" class="status-section">
            <h4 class="status-section-title">{{ t('offline.storage_info') }}</h4>
            <div class="storage-bar">
              <div 
                class="storage-used"
                :style="{ width: storagePercentage + '%' }"
              ></div>
            </div>
            <div class="storage-text">
              {{ formatBytes(storageInfo.usage) }} / {{ formatBytes(storageInfo.quota) }} 
              ({{ storagePercentage.toFixed(1) }}%)
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="status-actions">
            <TouchButton
              v-if="isOnline && pendingSyncCount > 0"
              variant="primary"
              size="sm"
              :loading="syncInProgress"
              @click="handleSync"
            >
              {{ t('offline.sync_now') }}
            </TouchButton>
            
            <TouchButton
              variant="secondary"
              size="sm"
              @click="handleRefresh"
            >
              {{ t('offline.refresh_cache') }}
            </TouchButton>
            
            <TouchButton
              variant="danger"
              size="sm"
              @click="handleClearCache"
            >
              {{ t('offline.clear_cache') }}
            </TouchButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useAPI } from '../composables/useAPI';
import { useOfflineCache } from '../composables/useOfflineCache';
import TouchButton from './TouchButton.vue';

// Dynamic icon imports
const WifiIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const WifiOffIcon = defineAsyncComponent(() => import('../assets/icons/cross-svg-icon.vue'));
const SyncIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const ClockIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const ChevronDownIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));

const { t } = useI18n();
const api = useAPI();
const cache = useOfflineCache();

// Component state
const showDetails = ref(false);
const storageInfo = ref(null);

// Computed properties
const isOnline = computed(() => cache.isOnline.value);
const syncInProgress = computed(() => cache.syncInProgress.value);
const pendingSyncCount = computed(() => cache.pendingSyncCount.value);
const lastSyncTime = computed(() => cache.lastSyncTime.value);

const statusBarClasses = computed(() => [
  'status-bar',
  {
    'status-bar-offline': !isOnline.value,
    'status-bar-syncing': syncInProgress.value,
    'status-bar-pending': pendingSyncCount.value > 0 && !syncInProgress.value
  }
]);

const storagePercentage = computed(() => {
  if (!storageInfo.value || !storageInfo.value.quota) return 0;
  return (storageInfo.value.usage / storageInfo.value.quota) * 100;
});

// Methods
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
  if (showDetails.value) {
    loadStorageInfo();
  }
};

const loadStorageInfo = async () => {
  try {
    storageInfo.value = await cache.getStorageUsage();
  } catch (error) {
    console.error('Failed to get storage info:', error);
  }
};

const formatSyncTime = (time) => {
  if (!time) return '';
  
  const now = new Date();
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return t('time.days_ago', { count: days });
  if (hours > 0) return t('time.hours_ago', { count: hours });
  if (minutes > 0) return t('time.minutes_ago', { count: minutes });
  return t('time.just_now');
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleSync = async () => {
  try {
    await api.syncOfflineData();
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

const handleRefresh = async () => {
  try {
    await api.refreshCache();
    loadStorageInfo();
  } catch (error) {
    console.error('Cache refresh failed:', error);
  }
};

const handleClearCache = async () => {
  if (confirm(t('offline.confirm_clear_cache'))) {
    try {
      await cache.clearOfflineData();
      storageInfo.value = await cache.getStorageUsage();
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  }
};

// Lifecycle
onMounted(() => {
  loadStorageInfo();
});
</script>

<style scoped>
.offline-status-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1060;
}

.status-bar {
  background: #1f2937;
  color: white;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-bar-offline {
  background: #dc2626;
}

.status-bar-syncing {
  background: #2563eb;
}

.status-bar-pending {
  background: #d97706;
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.status-icon-success {
  color: #10b981;
}

.status-icon-warning {
  color: #f59e0b;
}

.status-icon-error {
  color: #ef4444;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.expand-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.expand-icon-rotated {
  transform: rotate(180deg);
}

.sync-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.sync-spinner.small {
  width: 14px;
  height: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-details {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-details-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
}

.status-section {
  margin-bottom: 20px;
}

.status-section:last-child {
  margin-bottom: 0;
}

.status-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}

.status-row:last-child {
  margin-bottom: 0;
}

.status-row-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

.storage-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.storage-used {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 90%);
  transition: width 0.3s ease;
}

.storage-text {
  font-size: 12px;
  color: #6b7280;
}

.status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile optimizations */
@media screen and (max-width: 768px) {
  .status-bar {
    padding: 6px 12px;
  }
  
  .status-text {
    font-size: 13px;
  }
  
  .status-details-content {
    padding: 16px 12px;
  }
  
  .status-actions {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .status-details {
    background: #1f2937;
    border-bottom-color: #374151;
  }
  
  .status-section-title {
    color: #f9fafb;
  }
  
  .status-row {
    color: #d1d5db;
  }
  
  .storage-text {
    color: #9ca3af;
  }
  
  .storage-bar {
    background: #374151;
  }
}

/* RTL support */
.rtl .status-content {
  direction: rtl;
}

.rtl .status-item {
  flex-direction: row-reverse;
}

.rtl .status-row {
  flex-direction: row-reverse;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .status-bar,
  .expand-icon,
  .sync-spinner,
  .storage-used {
    transition: none;
    animation: none;
  }
}
</style>