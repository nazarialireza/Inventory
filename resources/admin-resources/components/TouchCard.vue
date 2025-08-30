<template>
  <div
    :class="cardClasses"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    :tabindex="clickable ? 0 : undefined"
    :role="clickable ? 'button' : undefined"
  >
    <!-- Card Header -->
    <div v-if="$slots.header || title" class="touch-card-header">
      <div v-if="title" class="touch-card-title">
        <component 
          v-if="titleIcon" 
          :is="titleIcon" 
          class="touch-card-title-icon"
        />
        {{ title }}
      </div>
      <slot name="header" />
      <div v-if="$slots.action" class="touch-card-header-action">
        <slot name="action" />
      </div>
    </div>

    <!-- Card Body -->
    <div class="touch-card-body">
      <slot />
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="touch-card-footer">
      <slot name="footer" />
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="touch-card-loading">
      <div class="touch-card-spinner"></div>
    </div>

    <!-- Ripple container -->
    <div v-if="clickable && ripple" class="touch-card-ripple-container"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  titleIcon: {
    type: [Object, String],
    default: null
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'elevated', 'outlined', 'filled'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ripple: {
    type: Boolean,
    default: true
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['none', 'sm', 'normal', 'lg'].includes(value)
  }
});

const emit = defineEmits(['click']);

const isPressed = ref(false);

const cardClasses = computed(() => [
  'touch-card',
  `touch-card-${props.variant}`,
  `touch-card-padding-${props.padding}`,
  {
    'touch-card-clickable': props.clickable,
    'touch-card-disabled': props.disabled,
    'touch-card-loading': props.loading,
    'touch-card-pressed': isPressed.value
  }
]);

const handleClick = (event) => {
  if (props.clickable && !props.disabled && !props.loading) {
    if (props.ripple) {
      createRipple(event);
    }
    emit('click', event);
  }
};

const handleTouchStart = () => {
  if (props.clickable && !props.disabled && !props.loading) {
    isPressed.value = true;
  }
};

const handleTouchEnd = () => {
  if (props.clickable) {
    setTimeout(() => {
      isPressed.value = false;
    }, 150);
  }
};

const createRipple = (event) => {
  const card = event.currentTarget;
  const rippleContainer = card.querySelector('.touch-card-ripple-container');
  if (!rippleContainer) return;

  const ripple = document.createElement('span');
  const rect = card.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('touch-card-ripple');
  
  rippleContainer.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};
</script>

<style scoped>
.touch-card {
  position: relative;
  background: white;
  border-radius: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.touch-card-clickable {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.touch-card-clickable:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.touch-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.touch-card-loading {
  pointer-events: none;
}

/* Variant styles */
.touch-card-default {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.touch-card-elevated {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.touch-card-outlined {
  border: 2px solid #e5e7eb;
  box-shadow: none;
}

.touch-card-filled {
  border: none;
  background: #f9fafb;
  box-shadow: none;
}

/* Hover and active states for clickable cards */
.touch-card-clickable.touch-card-default:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.touch-card-clickable.touch-card-elevated:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.touch-card-clickable.touch-card-outlined:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.touch-card-clickable.touch-card-filled:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Pressed state */
.touch-card-pressed {
  transform: scale(0.98);
}

.touch-card-clickable.touch-card-elevated.touch-card-pressed {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Header styles */
.touch-card-header {
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.touch-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.touch-card-title-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.touch-card-header-action {
  flex-shrink: 0;
}

/* Body styles */
.touch-card-body {
  flex: 1;
}

/* Footer styles */
.touch-card-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 16px;
}

/* Loading overlay */
.touch-card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.touch-card-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: touch-card-spin 1s linear infinite;
}

@keyframes touch-card-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ripple effect */
.touch-card-ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.touch-card-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.3);
  transform: scale(0);
  animation: touch-card-ripple-animation 0.6s linear;
}

@keyframes touch-card-ripple-animation {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

/* Mobile optimizations */
@media screen and (max-width: 768px) {
  .touch-card {
    border-radius: 8px;
  }
  
  .touch-card-title {
    font-size: 16px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .touch-card {
    background: #1f2937;
  }
  
  .touch-card-default {
    border-color: #374151;
  }
  
  .touch-card-outlined {
    border-color: #374151;
  }
  
  .touch-card-filled {
    background: #374151;
  }
  
  .touch-card-header {
    border-bottom-color: #374151;
  }
  
  .touch-card-footer {
    border-top-color: #374151;
  }
  
  .touch-card-title {
    color: #f9fafb;
  }
  
  .touch-card-loading {
    background: rgba(31, 41, 55, 0.8);
  }
  
  .touch-card-spinner {
    border-color: #4b5563;
    border-top-color: #60a5fa;
  }
}

/* RTL support */
.rtl .touch-card-header {
  direction: rtl;
}

.rtl .touch-card-title {
  flex-direction: row-reverse;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .touch-card-default,
  .touch-card-outlined {
    border-width: 2px;
  }
  
  .touch-card-clickable:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .touch-card {
    transition: none;
  }
  
  .touch-card-spinner {
    animation: none;
  }
  
  .touch-card-ripple {
    animation: none;
  }
  
  .touch-card-clickable:hover {
    transform: none;
  }
  
  .touch-card-pressed {
    transform: none;
  }
}
</style>