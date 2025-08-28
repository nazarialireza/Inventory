<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "../../composables/useI18n";
import axios from "axios";
import { useNotificationStore } from "../../components/shared/notification/notificationStore";

const { t } = useI18n();
const notificationStore = useNotificationStore();

// Notifications data
const notifications = ref([]);
const isLoading = ref(false);
const selectedFilter = ref('all');
const currentPage = ref(1);
const perPage = ref(10);
const totalNotifications = ref(0);

// Filter options
const filterOptions = ref([
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'sale', label: 'Sales' },
    { value: 'purchase', label: 'Purchases' },
    { value: 'stock', label: 'Stock Alerts' },
    { value: 'system', label: 'System' }
]);

// Computed properties
const filteredNotifications = computed(() => {
    if (selectedFilter.value === 'all') {
        return notifications.value;
    }
    return notifications.value.filter(notification => {
        if (selectedFilter.value === 'unread') return !notification.read_at;
        if (selectedFilter.value === 'read') return notification.read_at;
        return notification.type === selectedFilter.value;
    });
});

const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read_at).length;
});

// Fetch notifications
const fetchNotifications = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get('/api/user/notifications', {
            params: {
                page: currentPage.value,
                per_page: perPage.value,
                filter: selectedFilter.value
            }
        });
        
        notifications.value = response.data.data;
        totalNotifications.value = response.data.total || 0;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
    try {
        await axios.patch(`/api/user/notifications/${notificationId}/read`);
        
        // Update local state
        const notification = notifications.value.find(n => n.id === notificationId);
        if (notification) {
            notification.read_at = new Date().toISOString();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

// Mark all as read
const markAllAsRead = async () => {
    try {
        await axios.patch('/api/user/notifications/mark-all-read');
        
        // Update local state
        notifications.value.forEach(notification => {
            if (!notification.read_at) {
                notification.read_at = new Date().toISOString();
            }
        });
        
        notificationStore.pushNotification({
            message: t('general.all_notifications_marked_read'),
            type: 'success',
            time: 3000
        });
    } catch (error) {
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    }
};

// Delete notification
const deleteNotification = async (notificationId) => {
    if (!confirm(t('general.confirm_delete_notification'))) return;
    
    try {
        await axios.delete(`/api/user/notifications/${notificationId}`);
        
        // Remove from local state
        notifications.value = notifications.value.filter(n => n.id !== notificationId);
        
        notificationStore.pushNotification({
            message: t('general.notification_deleted'),
            type: 'success',
            time: 3000
        });
    } catch (error) {
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    }
};

// Clear all notifications
const clearAllNotifications = async () => {
    if (!confirm(t('general.confirm_clear_all_notifications'))) return;
    
    try {
        await axios.delete('/api/user/notifications/clear-all');
        notifications.value = [];
        totalNotifications.value = 0;
        
        notificationStore.pushNotification({
            message: t('general.all_notifications_cleared'),
            type: 'success',
            time: 3000
        });
    } catch (error) {
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    }
};

// Get notification icon based on type
const getNotificationIcon = (type) => {
    const icons = {
        sale: 'fas fa-shopping-cart',
        purchase: 'fas fa-shopping-bag',
        stock: 'fas fa-exclamation-triangle',
        system: 'fas fa-cog',
        default: 'fas fa-bell'
    };
    return icons[type] || icons.default;
};

// Get notification color based on type
const getNotificationColor = (type) => {
    const colors = {
        sale: 'text-success',
        purchase: 'text-primary',
        stock: 'text-warning',
        system: 'text-info',
        default: 'text-secondary'
    };
    return colors[type] || colors.default;
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
};

// Handle filter change
const handleFilterChange = () => {
    currentPage.value = 1;
    fetchNotifications();
};

onMounted(() => {
    fetchNotifications();
});
</script>

<template>
    <div class="user-notifications-page">
        <div class="page-top-box d-flex flex-wrap align-items-center justify-content-between">
            <div>
                <h3 class="h5">{{ t('general.user_notifications') }}</h3>
                <small class="text-muted" v-if="unreadCount > 0">
                    {{ unreadCount }} {{ t('general.unread_notifications') }}
                </small>
            </div>
            <div class="d-flex gap-2">
                <button 
                    @click="markAllAsRead" 
                    :disabled="unreadCount === 0"
                    class="btn btn-sm btn-outline-primary"
                >
                    <i class="fas fa-check-double me-1"></i>
                    {{ t('general.mark_all_read') }}
                </button>
                <button 
                    @click="clearAllNotifications" 
                    :disabled="notifications.length === 0"
                    class="btn btn-sm btn-outline-danger"
                >
                    <i class="fas fa-trash me-1"></i>
                    {{ t('general.clear_all') }}
                </button>
            </div>
        </div>

        <div class="notifications-content bg-white my-3 rounded-3 shadow">
            <!-- Filters -->
            <div class="notifications-header p-3 border-bottom">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <label class="form-label mb-0 me-2">{{ t('general.filter_by') }}:</label>
                        <select 
                            v-model="selectedFilter" 
                            @change="handleFilterChange"
                            class="form-select form-select-sm d-inline-block w-auto"
                        >
                            <option 
                                v-for="option in filterOptions" 
                                :key="option.value" 
                                :value="option.value"
                            >
                                {{ t(`general.${option.label.toLowerCase().replace(' ', '_')}`) }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-6 text-end">
                        <small class="text-muted">
                            {{ filteredNotifications.length }} {{ t('general.notifications') }}
                        </small>
                    </div>
                </div>
            </div>

            <!-- Notifications List -->
            <div class="notifications-list">
                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">{{ t('general.loading') }}</span>
                    </div>
                </div>

                <div v-else-if="filteredNotifications.length === 0" class="text-center py-5">
                    <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <p class="text-muted">{{ t('general.no_notifications') }}</p>
                </div>

                <div v-else>
                    <div 
                        v-for="notification in filteredNotifications" 
                        :key="notification.id"
                        class="notification-item p-3 border-bottom"
                        :class="{ 'unread': !notification.read_at }"
                        @click="markAsRead(notification.id)"
                    >
                        <div class="d-flex">
                            <div class="notification-icon me-3">
                                <i 
                                    :class="[getNotificationIcon(notification.type), getNotificationColor(notification.type)]"
                                ></i>
                            </div>
                            <div class="notification-content flex-grow-1">
                                <h6 class="notification-title mb-1">
                                    {{ notification.title }}
                                    <span v-if="!notification.read_at" class="badge bg-primary ms-2">
                                        {{ t('general.new') }}
                                    </span>
                                </h6>
                                <p class="notification-message mb-1 text-muted">
                                    {{ notification.message }}
                                </p>
                                <small class="notification-time text-muted">
                                    {{ formatDate(notification.created_at) }}
                                </small>
                            </div>
                            <div class="notification-actions">
                                <button 
                                    @click.stop="deleteNotification(notification.id)"
                                    class="btn btn-sm btn-outline-danger"
                                    :title="t('general.delete')"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalNotifications > perPage" class="notifications-pagination p-3 border-top">
                <nav>
                    <ul class="pagination pagination-sm justify-content-center mb-0">
                        <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                            <button 
                                @click="currentPage--; fetchNotifications()" 
                                class="page-link"
                                :disabled="currentPage <= 1"
                            >
                                {{ t('general.previous') }}
                            </button>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">
                                {{ currentPage }} / {{ Math.ceil(totalNotifications / perPage) }}
                            </span>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage >= Math.ceil(totalNotifications / perPage) }">
                            <button 
                                @click="currentPage++; fetchNotifications()" 
                                class="page-link"
                                :disabled="currentPage >= Math.ceil(totalNotifications / perPage)"
                            >
                                {{ t('general.next') }}
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notification-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.notification-item:hover {
    background-color: #f8f9fa;
}

.notification-item.unread {
    background-color: #f0f8ff;
    border-left: 4px solid #0d6efd;
}

.notification-icon {
    width: 40px;
    text-align: center;
    font-size: 1.2rem;
}

.notification-title {
    font-size: 0.9rem;
    font-weight: 600;
}

.notification-message {
    font-size: 0.85rem;
    line-height: 1.4;
}

.notification-time {
    font-size: 0.75rem;
}

.notification-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
    opacity: 1;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.badge {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
}
</style>