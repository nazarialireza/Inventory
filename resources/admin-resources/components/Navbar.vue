<script setup>
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { useSidebar } from "../stores/sidebar";
import { useI18n } from "../composables/useI18n";
import { ref, defineAsyncComponent, onMounted, onUnmounted } from "vue";

const sidebarStore = useSidebar();
const userDropDown = ref(false);
const { t } = useI18n();

// Function to close dropdown when clicking outside
const closeDropdown = (event) => {
    const dropdown = event.target.closest('.top-nav-item');
    if (!dropdown) {
        userDropDown.value = false;
    }
};

// Toggle dropdown function
const toggleUserDropdown = () => {
    userDropDown.value = !userDropDown.value;
};

// Add event listener on mount
onMounted(() => {
    document.addEventListener('click', closeDropdown);
});

// Remove event listener on unmount
onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});

// Dynamic imports for better code splitting
const MenuSvgIcon = defineAsyncComponent(() => import("../assets/icons/menu-svg-icon.vue"));
const UserSvgIcon = defineAsyncComponent(() => import("../assets/icons/user-svg-icon.vue"));
const LogoutSvgIcon = defineAsyncComponent(() => import("../assets/icons/logout-svg-icon.vue"));
const SettingSvgIcon = defineAsyncComponent(() => import("../assets/icons/setting-svg-icon.vue"));
const NotificationSvgIcon = defineAsyncComponent(() => import("../assets/icons/notification-svg-icon.vue"));
const ViewSvgIcon = defineAsyncComponent(() => import("../assets/icons/view-svg-icon.vue"));
</script>

<template>
    <nav class="navbar navbar-header navbar-expand navbar-light">
        <MenuSvgIcon @click="sidebarStore.toggle()" />
        <ul class="navbar-nav d-flex align-items-center navbar-light ms-auto">
            <!-- Language Switcher -->
            <li class="nav-item me-3">
                <LanguageSwitcher />
            </li>
            <div class="top-nav-item position-relative">
                <span @click="toggleUserDropdown" class="user-avatar">
                    <UserSvgIcon width="25px" height="25px" />
                </span>
                <div v-if="userDropDown" class="top-nav-dropdown">
                    <!-- User Profile Header -->
                    <div class="user-dropdown-header">
                        <div class="user-avatar-large">
                            <UserSvgIcon width="32px" height="32px" />
                        </div>
                        <div class="user-info">
                            <div class="user-name">{{ t('general.demo') }}</div>
                            <div class="user-email">demo@invextry.com</div>
                        </div>
                    </div>
                    
                    <!-- Menu Separator -->
                    <div class="dropdown-separator"></div>
                    
                    <!-- User Profile -->
                    <a class="top-nav-dropdown-item" href="#/profile">
                        <ViewSvgIcon
                            width="16px"
                            height="16px"
                            color="currentColor"
                        />
                        <span class="ms-2">{{ t('general.view_profile') }}</span>
                    </a>
                    
                    <!-- Account Settings -->
                    <a class="top-nav-dropdown-item" href="#/settings">
                        <SettingSvgIcon
                            width="16px"
                            height="16px"
                            color="currentColor"
                        />
                        <span class="ms-2">{{ t('general.account_settings') }}</span>
                    </a>
                    
                    <!-- Notifications -->
                    <a class="top-nav-dropdown-item" href="#/notifications">
                        <NotificationSvgIcon
                            width="16px"
                            height="16px"
                            color="currentColor"
                        />
                        <span class="ms-2">{{ t('general.user_notifications') }}</span>
                    </a>
                    
                    <!-- Menu Separator -->
                    <div class="dropdown-separator"></div>
                    
                    <!-- Logout -->
                    <a class="top-nav-dropdown-item logout-item" href="/logout">
                        <LogoutSvgIcon
                            width="16px"
                            height="16px"
                            color="currentColor"
                        />
                        <span class="ms-2">{{ t('general.logout') }}</span>
                    </a>
                </div>
            </div>
        </ul>
    </nav>
</template>

<style scoped>
.user-avatar {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.user-avatar:hover {
    background-color: rgba(43, 168, 243, 0.1);
}

.top-nav-dropdown {
    position: absolute;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    top: 120%;
    right: 0px;
    z-index: 1000;
    width: 280px;
    background-color: white;
    border: 1px solid #e0e0e0;
}
.rtl .top-nav-dropdown { 
    right: unset;
    left: 0px;
}

.user-dropdown-header {
    padding: 16px;
    background: linear-gradient(135deg, #2ba8f3 0%, #1e88e5 100%);
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar-large {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-info {
    flex: 1;
}

.user-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
}

.user-email {
    font-size: 12px;
    opacity: 0.9;
}

.dropdown-separator {
    height: 1px;
    background-color: #e0e0e0;
    margin: 0;
}

.top-nav-dropdown-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: white;
    color: #374151;
    width: 100%;
    text-decoration: none;
    transition: all 0.2s ease;
    font-size: 14px;
    border: none;
}

.top-nav-dropdown-item:hover {
    background-color: #f8fafc;
    color: #2ba8f3;
    text-decoration: none;
}

.logout-item {
    border-top: 1px solid #e0e0e0;
    color: #ef4444;
}

.logout-item:hover {
    background-color: #fef2f2;
    color: #dc2626;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .top-nav-dropdown {
        background-color: #1f2937;
        border-color: #374151;
    }
    
    .dropdown-separator {
        background-color: #374151;
    }
    
    .top-nav-dropdown-item {
        background-color: #1f2937;
        color: #d1d5db;
    }
    
    .top-nav-dropdown-item:hover {
        background-color: #374151;
        color: #60a5fa;
    }
    
    .logout-item {
        border-color: #374151;
    }
    
    .logout-item:hover {
        background-color: #7f1d1d;
    }
}
</style>
