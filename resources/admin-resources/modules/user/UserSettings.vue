<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "../../composables/useI18n";
import axios from "axios";
import { useNotificationStore } from "../../components/shared/notification/notificationStore";

const { t } = useI18n();
const notificationStore = useNotificationStore();

// Settings data
const settings = ref({
    language: 'en',
    timezone: 'UTC',
    date_format: 'Y-m-d',
    time_format: '24',
    currency_symbol: '$',
    notifications: {
        email_notifications: true,
        push_notifications: true,
        sale_notifications: true,
        purchase_notifications: true,
        low_stock_alerts: true
    },
    privacy: {
        profile_visibility: 'public',
        show_email: false,
        show_phone: false
    }
});

// Password change form
const passwordForm = ref({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
});

const isLoading = ref(false);
const isPasswordLoading = ref(false);
const validationErrors = ref({});
const passwordErrors = ref({});

// Available options
const languageOptions = ref([
    { value: 'en', label: 'English' },
    { value: 'prs', label: 'دری (Dari)' }
]);

const timezoneOptions = ref([
    { value: 'UTC', label: 'UTC' },
    { value: 'Asia/Kabul', label: 'Afghanistan Time (AFT)' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'Europe/London', label: 'Greenwich Mean Time' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time' }
]);

const dateFormatOptions = ref([
    { value: 'Y-m-d', label: '2024-12-25' },
    { value: 'd/m/Y', label: '25/12/2024' },
    { value: 'm/d/Y', label: '12/25/2024' },
    { value: 'd-m-Y', label: '25-12-2024' }
]);

const timeFormatOptions = ref([
    { value: '24', label: '24 Hour (14:30)' },
    { value: '12', label: '12 Hour (2:30 PM)' }
]);

// Fetch user settings
const fetchSettings = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get('/api/user/settings');
        settings.value = { ...settings.value, ...response.data.data };
    } catch (error) {
        console.error('Error fetching settings:', error);
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Update settings
const updateSettings = async () => {
    isLoading.value = true;
    validationErrors.value = {};
    
    try {
        const response = await axios.put('/api/user/settings', settings.value);
        settings.value = { ...settings.value, ...response.data.data };
        
        notificationStore.pushNotification({
            message: t('general.settings_updated_successfully'),
            type: 'success',
            time: 3000
        });
    } catch (error) {
        if (error.response?.status === 422) {
            validationErrors.value = error.response.data.errors;
        }
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Change password
const changePassword = async () => {
    isPasswordLoading.value = true;
    passwordErrors.value = {};
    
    try {
        await axios.put('/api/user/password', passwordForm.value);
        
        // Clear form
        passwordForm.value = {
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
        };
        
        notificationStore.pushNotification({
            message: t('general.password_changed_successfully'),
            type: 'success',
            time: 3000
        });
    } catch (error) {
        if (error.response?.status === 422) {
            passwordErrors.value = error.response.data.errors;
        }
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    } finally {
        isPasswordLoading.value = false;
    }
};

onMounted(() => {
    fetchSettings();
});
</script>

<template>
    <div class="user-settings-page">
        <div class="page-top-box d-flex flex-wrap align-items-center">
            <h3 class="h5">{{ t('general.account_settings') }}</h3>
        </div>

        <div class="settings-content">
            <!-- General Settings -->
            <div class="settings-section bg-white p-4 my-3 rounded-3 shadow">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>{{ t('general.general_settings') }}</h5>
                    <button 
                        @click="updateSettings" 
                        :disabled="isLoading"
                        class="btn btn-sm btn-primary"
                    >
                        <i class="fas fa-save me-1"></i>
                        {{ t('general.save') }}
                    </button>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">{{ t('general.language') }}</label>
                        <select 
                            v-model="settings.language" 
                            class="form-select"
                            :class="{ 'is-invalid': validationErrors.language }"
                        >
                            <option 
                                v-for="option in languageOptions" 
                                :key="option.value" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <div v-if="validationErrors.language" class="invalid-feedback">
                            {{ validationErrors.language[0] }}
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">{{ t('general.timezone') }}</label>
                        <select 
                            v-model="settings.timezone" 
                            class="form-select"
                            :class="{ 'is-invalid': validationErrors.timezone }"
                        >
                            <option 
                                v-for="option in timezoneOptions" 
                                :key="option.value" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <div v-if="validationErrors.timezone" class="invalid-feedback">
                            {{ validationErrors.timezone[0] }}
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">{{ t('general.date_format') }}</label>
                        <select 
                            v-model="settings.date_format" 
                            class="form-select"
                            :class="{ 'is-invalid': validationErrors.date_format }"
                        >
                            <option 
                                v-for="option in dateFormatOptions" 
                                :key="option.value" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <div v-if="validationErrors.date_format" class="invalid-feedback">
                            {{ validationErrors.date_format[0] }}
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">{{ t('general.time_format') }}</label>
                        <select 
                            v-model="settings.time_format" 
                            class="form-select"
                            :class="{ 'is-invalid': validationErrors.time_format }"
                        >
                            <option 
                                v-for="option in timeFormatOptions" 
                                :key="option.value" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <div v-if="validationErrors.time_format" class="invalid-feedback">
                            {{ validationErrors.time_format[0] }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notification Settings -->
            <div class="settings-section bg-white p-4 my-3 rounded-3 shadow">
                <h5 class="mb-3">{{ t('general.notification_settings') }}</h5>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-check mb-3">
                            <input 
                                v-model="settings.notifications.email_notifications" 
                                class="form-check-input" 
                                type="checkbox" 
                                id="emailNotifications"
                            >
                            <label class="form-check-label" for="emailNotifications">
                                {{ t('general.email_notifications') }}
                            </label>
                        </div>

                        <div class="form-check mb-3">
                            <input 
                                v-model="settings.notifications.push_notifications" 
                                class="form-check-input" 
                                type="checkbox" 
                                id="pushNotifications"
                            >
                            <label class="form-check-label" for="pushNotifications">
                                {{ t('general.push_notifications') }}
                            </label>
                        </div>

                        <div class="form-check mb-3">
                            <input 
                                v-model="settings.notifications.low_stock_alerts" 
                                class="form-check-input" 
                                type="checkbox" 
                                id="lowStockAlerts"
                            >
                            <label class="form-check-label" for="lowStockAlerts">
                                {{ t('general.low_stock_alerts') }}
                            </label>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="form-check mb-3">
                            <input 
                                v-model="settings.notifications.sale_notifications" 
                                class="form-check-input" 
                                type="checkbox" 
                                id="saleNotifications"
                            >
                            <label class="form-check-label" for="saleNotifications">
                                {{ t('general.sale_notifications') }}
                            </label>
                        </div>

                        <div class="form-check mb-3">
                            <input 
                                v-model="settings.notifications.purchase_notifications" 
                                class="form-check-input" 
                                type="checkbox" 
                                id="purchaseNotifications"
                            >
                            <label class="form-check-label" for="purchaseNotifications">
                                {{ t('general.purchase_notifications') }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Password Change -->
            <div class="settings-section bg-white p-4 my-3 rounded-3 shadow">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>{{ t('general.change_password') }}</h5>
                    <button 
                        @click="changePassword" 
                        :disabled="isPasswordLoading"
                        class="btn btn-sm btn-warning"
                    >
                        <i class="fas fa-key me-1"></i>
                        {{ t('general.change_password') }}
                    </button>
                </div>

                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">{{ t('general.current_password') }}</label>
                        <input 
                            v-model="passwordForm.current_password"
                            type="password" 
                            class="form-control"
                            :class="{ 'is-invalid': passwordErrors.current_password }"
                        >
                        <div v-if="passwordErrors.current_password" class="invalid-feedback">
                            {{ passwordErrors.current_password[0] }}
                        </div>
                    </div>

                    <div class="col-md-4 mb-3">
                        <label class="form-label">{{ t('general.new_password') }}</label>
                        <input 
                            v-model="passwordForm.new_password"
                            type="password" 
                            class="form-control"
                            :class="{ 'is-invalid': passwordErrors.new_password }"
                        >
                        <div v-if="passwordErrors.new_password" class="invalid-feedback">
                            {{ passwordErrors.new_password[0] }}
                        </div>
                    </div>

                    <div class="col-md-4 mb-3">
                        <label class="form-label">{{ t('general.confirm_password') }}</label>
                        <input 
                            v-model="passwordForm.new_password_confirmation"
                            type="password" 
                            class="form-control"
                            :class="{ 'is-invalid': passwordErrors.new_password_confirmation }"
                        >
                        <div v-if="passwordErrors.new_password_confirmation" class="invalid-feedback">
                            {{ passwordErrors.new_password_confirmation[0] }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-section {
    margin-bottom: 1.5rem;
}

.form-check {
    padding-left: 1.5rem;
}

.form-check-input {
    margin-left: -1.5rem;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>