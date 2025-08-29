<template>
  <div class="touch-components-demo">
    <h2>Mobile PWA Touch Components Demo</h2>
    
    <!-- Touch Buttons Demo -->
    <TouchCard 
      title="Touch Buttons" 
      :title-icon="ButtonIcon"
      class="demo-section"
    >
      <div class="demo-grid">
        <TouchButton variant="primary">
          Primary Button
        </TouchButton>
        
        <TouchButton variant="secondary" :icon="SaveIcon">
          Save Data
        </TouchButton>
        
        <TouchButton variant="success" size="sm">
          Small Success
        </TouchButton>
        
        <TouchButton variant="danger" size="lg">
          Large Danger
        </TouchButton>
        
        <TouchButton variant="info" :loading="loadingDemo">
          {{ loadingDemo ? 'Loading...' : 'Click to Load' }}
        </TouchButton>
        
        <TouchButton 
          variant="warning" 
          :icon="TrashIcon" 
          icon-position="only"
          @click="showAlert('Icon only button clicked!')"
        />
        
        <TouchButton variant="primary" full-width>
          Full Width Button
        </TouchButton>
      </div>
    </TouchCard>

    <!-- Touch Cards Demo -->
    <TouchCard 
      title="Touch Cards" 
      :title-icon="CardIcon"
      class="demo-section"
    >
      <div class="demo-grid">
        <TouchCard 
          variant="default" 
          title="Default Card"
          :clickable="true"
          @click="showAlert('Default card clicked!')"
        >
          <p>This is a clickable default card with hover effects.</p>
        </TouchCard>
        
        <TouchCard 
          variant="elevated" 
          title="Elevated Card"
          :clickable="true"
          @click="showAlert('Elevated card clicked!')"
        >
          <p>This card has elevated shadow styling.</p>
        </TouchCard>
        
        <TouchCard 
          variant="outlined" 
          title="Outlined Card"
        >
          <p>This card has outlined border styling.</p>
          <template #footer>
            <TouchButton variant="primary" size="sm">
              Card Action
            </TouchButton>
          </template>
        </TouchCard>
        
        <TouchCard 
          variant="filled" 
          :loading="cardLoading"
        >
          <p>This card shows loading state.</p>
          <TouchButton 
            variant="secondary" 
            @click="toggleCardLoading"
          >
            Toggle Loading
          </TouchButton>
        </TouchCard>
      </div>
    </TouchCard>

    <!-- Touch Inputs Demo -->
    <TouchCard 
      title="Touch Inputs" 
      :title-icon="InputIcon"
      class="demo-section"
    >
      <div class="demo-form">
        <TouchInput
          v-model="formData.name"
          label="Full Name"
          placeholder="Enter your full name"
          :prefix-icon="UserIcon"
          required
          helper-text="This field is required"
        />
        
        <TouchInput
          v-model="formData.email"
          type="email"
          label="Email Address"
          placeholder="user@example.com"
          :prefix-icon="EmailIcon"
          :clearable="true"
          helper-text="We'll never share your email"
        />
        
        <TouchInput
          v-model="formData.password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
          helper-text="Minimum 8 characters"
        />
        
        <TouchInput
          v-model="formData.phone"
          type="tel"
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          :prefix-icon="PhoneIcon"
          inputmode="tel"
        />
        
        <TouchInput
          v-model="formData.search"
          type="search"
          label="Search Products"
          placeholder="Search inventory..."
          :prefix-icon="SearchIcon"
          :loading="searchLoading"
          :clearable="true"
          @input="handleSearch"
        />
        
        <TouchInput
          v-model="formData.quantity"
          type="number"
          label="Quantity"
          placeholder="0"
          min="0"
          max="999"
          :show-count="true"
          maxlength="3"
          inputmode="numeric"
        />
        
        <div class="demo-form-actions">
          <TouchButton 
            variant="primary" 
            full-width
            :loading="submitLoading"
            @click="handleSubmit"
          >
            Submit Form
          </TouchButton>
        </div>
      </div>
    </TouchCard>

    <!-- Mobile Features Demo -->
    <TouchCard 
      title="Mobile Features" 
      :title-icon="MobileIcon"
      class="demo-section"
    >
      <div class="mobile-features">
        <div class="feature-item">
          <h4>Touch Feedback</h4>
          <p>All components provide haptic-like visual feedback on touch.</p>
        </div>
        
        <div class="feature-item">
          <h4>Accessibility</h4>
          <p>44px minimum touch targets, proper focus indicators, and screen reader support.</p>
        </div>
        
        <div class="feature-item">
          <h4>PWA Optimized</h4>
          <p>Designed for offline use with proper caching and performance.</p>
        </div>
        
        <div class="feature-item">
          <h4>Responsive Design</h4>
          <p>Adapts to different screen sizes and orientations.</p>
        </div>
      </div>
    </TouchCard>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
import TouchButton from './TouchButton.vue';
import TouchCard from './TouchCard.vue';
import TouchInput from './TouchInput.vue';

// Dynamic icon imports
const ButtonIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const CardIcon = defineAsyncComponent(() => import('../assets/icons/square-svg-icon.vue'));
const InputIcon = defineAsyncComponent(() => import('../assets/icons/setting-svg-icon.vue'));
const SaveIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const TrashIcon = defineAsyncComponent(() => import('../assets/icons/cross-svg-icon.vue'));
const UserIcon = defineAsyncComponent(() => import('../assets/icons/user-svg-icon.vue'));
const EmailIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const PhoneIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const SearchIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));
const MobileIcon = defineAsyncComponent(() => import('../assets/icons/dashboard-svg-icon.vue'));

// Demo state
const loadingDemo = ref(false);
const cardLoading = ref(false);
const searchLoading = ref(false);
const submitLoading = ref(false);

// Form data
const formData = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  search: '',
  quantity: ''
});

// Demo functions
const showAlert = (message) => {
  alert(message);
};

const toggleCardLoading = () => {
  cardLoading.value = !cardLoading.value;
};

const handleSearch = () => {
  searchLoading.value = true;
  setTimeout(() => {
    searchLoading.value = false;
  }, 1000);
};

const handleSubmit = () => {
  submitLoading.value = true;
  setTimeout(() => {
    submitLoading.value = false;
    showAlert('Form submitted successfully!');
  }, 2000);
};

// Auto-toggle loading demo
setTimeout(() => {
  setInterval(() => {
    loadingDemo.value = !loadingDemo.value;
  }, 3000);
}, 1000);
</script>

<style scoped>
.touch-components-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.touch-components-demo h2 {
  text-align: center;
  margin-bottom: 32px;
  color: #1f2937;
  font-size: 28px;
  font-weight: 600;
}

.demo-section {
  margin-bottom: 32px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: start;
}

.demo-form {
  max-width: 500px;
  margin: 0 auto;
}

.demo-form-actions {
  margin-top: 24px;
}

.mobile-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.feature-item h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

/* Mobile optimizations */
@media screen and (max-width: 768px) {
  .touch-components-demo {
    padding: 16px;
  }
  
  .touch-components-demo h2 {
    font-size: 24px;
    margin-bottom: 24px;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .mobile-features {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .demo-form {
    max-width: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .touch-components-demo h2 {
    color: #f9fafb;
  }
  
  .feature-item {
    background: #374151;
    border-color: #4b5563;
  }
  
  .feature-item h4 {
    color: #f9fafb;
  }
  
  .feature-item p {
    color: #d1d5db;
  }
}
</style>