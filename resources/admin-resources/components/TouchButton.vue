<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <component 
      v-if="icon && !loading" 
      :is="icon" 
      :class="iconClasses"
    />
    
    <div v-if="loading" class="touch-btn-spinner"></div>
    
    <span v-if="$slots.default" :class="labelClasses">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: [Object, String],
    default: null
  },
  iconPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right', 'only'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  ripple: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['click']);

const isPressed = ref(false);

const buttonClasses = computed(() => [
  'touch-btn',
  `touch-btn-${props.variant}`,
  `touch-btn-${props.size}`,
  {
    'touch-btn-full': props.fullWidth,
    'touch-btn-loading': props.loading,
    'touch-btn-pressed': isPressed.value,
    'touch-btn-icon-only': props.iconPosition === 'only'
  }
]);

const iconClasses = computed(() => [
  'touch-btn-icon',
  {
    'touch-btn-icon-right': props.iconPosition === 'right',
    'touch-btn-icon-only': props.iconPosition === 'only'
  }
]);

const labelClasses = computed(() => [
  'touch-btn-label',
  {
    'touch-btn-label-hidden': props.iconPosition === 'only'
  }
]);

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    if (props.ripple) {
      createRipple(event);
    }
    emit('click', event);
  }
};

const handleTouchStart = () => {
  isPressed.value = true;
};

const handleTouchEnd = () => {
  setTimeout(() => {
    isPressed.value = false;
  }, 150);
};

const createRipple = (event) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('touch-btn-ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};
</script>

<style scoped>
.touch-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  min-height: 44px;
  min-width: 44px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

.touch-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.touch-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Size variations */
.touch-btn-sm {
  padding: 8px 16px;
  min-height: 40px;
  font-size: 12px;
}

.touch-btn-lg {
  padding: 16px 28px;
  min-height: 52px;
  font-size: 16px;
}

/* Color variations */
.touch-btn-primary {
  background-color: #3b82f6;
  color: white;
}

.touch-btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.touch-btn-primary:active:not(:disabled),
.touch-btn-primary.touch-btn-pressed {
  background-color: #1d4ed8;
  transform: scale(0.98);
}

.touch-btn-secondary {
  background-color: #6b7280;
  color: white;
}

.touch-btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.touch-btn-secondary:active:not(:disabled),
.touch-btn-secondary.touch-btn-pressed {
  background-color: #374151;
  transform: scale(0.98);
}

.touch-btn-success {
  background-color: #10b981;
  color: white;
}

.touch-btn-success:hover:not(:disabled) {
  background-color: #059669;
}

.touch-btn-success:active:not(:disabled),
.touch-btn-success.touch-btn-pressed {
  background-color: #047857;
  transform: scale(0.98);
}

.touch-btn-danger {
  background-color: #ef4444;
  color: white;
}

.touch-btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.touch-btn-danger:active:not(:disabled),
.touch-btn-danger.touch-btn-pressed {
  background-color: #b91c1c;
  transform: scale(0.98);
}

.touch-btn-warning {
  background-color: #f59e0b;
  color: white;
}

.touch-btn-warning:hover:not(:disabled) {
  background-color: #d97706;
}

.touch-btn-warning:active:not(:disabled),
.touch-btn-warning.touch-btn-pressed {
  background-color: #b45309;
  transform: scale(0.98);
}

.touch-btn-info {
  background-color: #06b6d4;
  color: white;
}

.touch-btn-info:hover:not(:disabled) {
  background-color: #0891b2;
}

.touch-btn-info:active:not(:disabled),
.touch-btn-info.touch-btn-pressed {
  background-color: #0e7490;
  transform: scale(0.98);
}

.touch-btn-light {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.touch-btn-light:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.touch-btn-light:active:not(:disabled),
.touch-btn-light.touch-btn-pressed {
  background-color: #d1d5db;
  transform: scale(0.98);
}

.touch-btn-dark {
  background-color: #1f2937;
  color: white;
}

.touch-btn-dark:hover:not(:disabled) {
  background-color: #111827;
}

.touch-btn-dark:active:not(:disabled),
.touch-btn-dark.touch-btn-pressed {
  background-color: #0f172a;
  transform: scale(0.98);
}

/* Full width */
.touch-btn-full {
  width: 100%;
}

/* Icon styles */
.touch-btn-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.touch-btn-sm .touch-btn-icon {
  width: 16px;
  height: 16px;
}

.touch-btn-lg .touch-btn-icon {
  width: 20px;
  height: 20px;
}

.touch-btn-icon-only .touch-btn-icon {
  width: 20px;
  height: 20px;
}

.touch-btn-icon-right {
  order: 1;
}

.touch-btn-icon-only {
  padding: 12px;
  border-radius: 50%;
  min-width: 44px;
  max-width: 44px;
}

.touch-btn-label-hidden {
  display: none;
}

/* Loading state */
.touch-btn-loading {
  pointer-events: none;
}

.touch-btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: touch-btn-spin 1s linear infinite;
}

@keyframes touch-btn-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ripple effect */
.touch-btn-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: touch-btn-ripple-animation 0.6s linear;
}

@keyframes touch-btn-ripple-animation {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .touch-btn-light {
    background-color: #374151;
    color: #f3f4f6;
    border-color: #4b5563;
  }
  
  .touch-btn-light:hover:not(:disabled) {
    background-color: #4b5563;
  }
  
  .touch-btn-light:active:not(:disabled),
  .touch-btn-light.touch-btn-pressed {
    background-color: #6b7280;
  }
}

/* RTL support */
.rtl .touch-btn-icon-right {
  order: -1;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .touch-btn {
    border: 2px solid currentColor;
  }
  
  .touch-btn:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .touch-btn {
    transition: none;
  }
  
  .touch-btn-spinner {
    animation: none;
  }
  
  .touch-btn-ripple {
    animation: none;
  }
}
</style>