<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "../../composables/useI18n";
import axios from "axios";
import { useNotificationStore } from "../../components/shared/notification/notificationStore";

const { t } = useI18n();
const notificationStore = useNotificationStore();

// User profile data
const user = ref({
    id: null,
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    avatar: null,
    created_at: '',
    updated_at: ''
});

const isLoading = ref(false);
const isEditing = ref(false);
const validationErrors = ref({});

// Fetch user profile data
const fetchUserProfile = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get('/api/user/profile');
        user.value = response.data.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        notificationStore.pushNotification({
            message: t('notifications.error_occurred'),
            type: 'error',
            time: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Update user profile
const updateProfile = async () => {
    isLoading.value = true;
    validationErrors.value = {};
    
    try {
        const response = await axios.put('/api/user/profile', user.value);
        user.value = response.data.data;
        isEditing.value = false;
        
        notificationStore.pushNotification({
            message: t('general.profile_updated_successfully'),
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

// Handle avatar upload
const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await axios.post('/api/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        user.value.avatar = response.data.data.avatar;
        
        notificationStore.pushNotification({
            message: t('general.avatar_updated_successfully'),
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

// Cancel editing
const cancelEdit = () => {
    isEditing.value = false;
    validationErrors.value = {};
    fetchUserProfile(); // Reset to original data
};

onMounted(() => {
    fetchUserProfile();
});
</script>

<template>
    <div class="user-profile-page">
        <div class="page-top-box d-flex flex-wrap align-items-center justify-content-between">
            <h3 class="h5">{{ t('general.user_profile') }}</h3>
            <div>
                <button 
                    v-if="!isEditing" 
                    @click="isEditing = true" 
                    class="btn btn-sm btn-primary"
                >
                    <i class="fas fa-edit me-1"></i>
                    {{ t('general.edit') }}
                </button>
                <div v-else>
                    <button 
                        @click="updateProfile" 
                        :disabled="isLoading"
                        class="btn btn-sm btn-success me-2"
                    >
                        <i class="fas fa-save me-1"></i>
                        {{ t('general.save') }}
                    </button>
                    <button 
                        @click="cancelEdit" 
                        class="btn btn-sm btn-secondary"
                    >
                        {{ t('general.cancel') }}
                    </button>
                </div>
            </div>
        </div>

        <div class="user-profile-content bg-white p-4 my-3 rounded-3 shadow">
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">{{ t('general.loading') }}</span>
                </div>
            </div>

            <div v-else class="row">
                <!-- Profile Picture Section -->
                <div class="col-md-4 text-center mb-4">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar mx-auto mb-3">
                            <img 
                                v-if="user.avatar" 
                                :src="user.avatar" 
                                :alt="user.name"
                                class="avatar-img"
                            >
                            <div v-else class="avatar-placeholder">
                                <i class="fas fa-user fa-3x"></i>
                            </div>
                        </div>
                        <div v-if="isEditing" class="avatar-upload">
                            <label for="avatar-upload" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-camera me-1"></i>
                                {{ t('general.change_avatar') }}
                            </label>
                            <input 
                                id="avatar-upload"
                                type="file" 
                                accept="image/*"
                                @change="handleAvatarUpload"
                                class="d-none"
                            >
                        </div>
                        <h4 class="mt-3">{{ user.name }}</h4>
                        <p class="text-muted">{{ user.email }}</p>
                        <small class="text-muted">
                            {{ t('general.member_since') }}: 
                            {{ new Date(user.created_at).toLocaleDateString() }}
                        </small>
                    </div>
                </div>

                <!-- Profile Information Section -->
                <div class="col-md-8">
                    <h5 class="mb-3">{{ t('general.profile_information') }}</h5>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ t('general.name') }}</label>
                            <input 
                                v-model="user.name"
                                :readonly="!isEditing"
                                type="text" 
                                class="form-control"
                                :class="{ 'is-invalid': validationErrors.name }"
                            >
                            <div v-if="validationErrors.name" class="invalid-feedback">
                                {{ validationErrors.name[0] }}
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ t('general.email') }}</label>
                            <input 
                                v-model="user.email"
                                :readonly="!isEditing"
                                type="email" 
                                class="form-control"
                                :class="{ 'is-invalid': validationErrors.email }"
                            >
                            <div v-if="validationErrors.email" class="invalid-feedback">
                                {{ validationErrors.email[0] }}
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ t('general.phone') }}</label>
                            <input 
                                v-model="user.phone"
                                :readonly="!isEditing"
                                type="tel" 
                                class="form-control"
                                :class="{ 'is-invalid': validationErrors.phone }"
                            >
                            <div v-if="validationErrors.phone" class="invalid-feedback">
                                {{ validationErrors.phone[0] }}
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ t('general.city') }}</label>
                            <input 
                                v-model="user.city"
                                :readonly="!isEditing"
                                type="text" 
                                class="form-control"
                                :class="{ 'is-invalid': validationErrors.city }"
                            >
                            <div v-if="validationErrors.city" class="invalid-feedback">
                                {{ validationErrors.city[0] }}
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">{{ t('general.country') }}</label>
                            <input 
                                v-model="user.country"
                                :readonly="!isEditing"
                                type="text" 
                                class="form-control"
                                :class="{ 'is-invalid': validationErrors.country }"
                            >
                            <div v-if="validationErrors.country" class="invalid-feedback">
                                {{ validationErrors.country[0] }}
                            </div>
                        </div>

                        <div class="col-12 mb-3">
                            <label class="form-label">{{ t('general.address') }}</label>
                            <textarea 
                                v-model="user.address"
                                :readonly="!isEditing"
                                class="form-control" 
                                rows="3"
                                :class="{ 'is-invalid': validationErrors.address }"
                            ></textarea>
                            <div v-if="validationErrors.address" class="invalid-feedback">
                                {{ validationErrors.address[0] }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-avatar {
    width: 120px;
    height: 120px;
    position: relative;
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #e9ecef;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    border: 4px solid #e9ecef;
}

.avatar-upload {
    margin-top: 10px;
}

.profile-avatar-section {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.form-control[readonly] {
    background-color: #f8f9fa;
    border-color: #e9ecef;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>