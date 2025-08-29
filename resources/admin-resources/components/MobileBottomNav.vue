<template>
  <div class="mobile-bottom-nav" v-if="showBottomNav">
    <nav class="bottom-nav-container">
      <router-link 
        v-for="item in navItems" 
        :key="item.route"
        :to="item.route"
        class="bottom-nav-item"
        :class="{ active: $route.path === item.route }"
      >
        <component :is="item.icon" class="bottom-nav-icon" />
        <span class="bottom-nav-label">{{ t(item.label) }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '../composables/useI18n';

const route = useRoute();
const { t } = useI18n();

// Dynamic imports for icons
const DashboardIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const ProductIcon = defineAsyncComponent(() => import('../assets/icons/square-svg-icon.vue'));
const SalesIcon = defineAsyncComponent(() => import('../assets/icons/cart-svg-icon.vue'));
const CustomersIcon = defineAsyncComponent(() => import('../assets/icons/customer-svg-icon.vue'));
const SettingsIcon = defineAsyncComponent(() => import('../assets/icons/setting-svg-icon.vue'));

// Show bottom nav only on mobile
const showBottomNav = ref(false);

// Navigation items for mobile bottom bar
const navItems = [
  {
    route: '/admin',
    label: 'navigation.dashboard',
    icon: DashboardIcon
  },
  {
    route: '/admin/product',
    label: 'navigation.products',
    icon: ProductIcon
  },
  {
    route: '/admin/sale',
    label: 'navigation.sales',
    icon: SalesIcon
  },
  {
    route: '/admin/customer',
    label: 'navigation.customers',
    icon: CustomersIcon
  },
  {
    route: '/admin/warehouse',
    label: 'navigation.settings',
    icon: SettingsIcon
  }
];

// Check if device is mobile
const checkMobile = () => {
  showBottomNav.value = window.innerWidth <= 768;
};

// Handle resize
const handleResize = () => {
  checkMobile();
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.bottom-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  max-width: 100%;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  min-width: 64px;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.2s ease;
  border-radius: 8px;
  flex: 1;
  max-width: 80px;
}

.bottom-nav-item:hover,
.bottom-nav-item:focus {
  color: #3b82f6;
  text-decoration: none;
  background-color: rgba(59, 130, 246, 0.1);
}

.bottom-nav-item.active {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  fill: currentColor;
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Add bottom padding to main content when bottom nav is visible */
@media screen and (max-width: 768px) {
  .mobile-bottom-nav ~ #main .main-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px));
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mobile-bottom-nav {
    background: #1f2937;
    border-top-color: #374151;
  }
  
  .bottom-nav-item {
    color: #9ca3af;
  }
  
  .bottom-nav-item:hover,
  .bottom-nav-item:focus,
  .bottom-nav-item.active {
    color: #60a5fa;
    background-color: rgba(96, 165, 250, 0.1);
  }
}

/* RTL support */
.rtl .bottom-nav-container {
  direction: rtl;
}
</style>