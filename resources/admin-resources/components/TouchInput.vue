<template>
  <div :class="containerClasses">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="inputId"
      class="touch-input-label"
      :class="{ 'touch-input-label-error': hasError }"
    >
      {{ label }}
      <span v-if="required" class="touch-input-required">*</span>
    </label>

    <!-- Input Container -->
    <div class="touch-input-container">
      <!-- Prefix Icon -->
      <component 
        v-if="prefixIcon" 
        :is="prefixIcon" 
        class="touch-input-icon touch-input-icon-prefix"
      />

      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="inputType"
        :class="inputClasses"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :maxlength="maxlength"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        v-bind="$attrs"
      />

      <!-- Password Toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="touch-input-icon touch-input-password-toggle"
        @click="togglePasswordVisibility"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
      >
        <component :is="showPassword ? 'EyeOffIcon' : 'EyeIcon'" />
      </button>

      <!-- Suffix Icon -->
      <component 
        v-else-if="suffixIcon" 
        :is="suffixIcon" 
        class="touch-input-icon touch-input-icon-suffix"
      />

      <!-- Clear Button -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="touch-input-icon touch-input-clear"
        @click="clearInput"
        aria-label="Clear input"
      >
        <XIcon />
      </button>

      <!-- Loading Indicator -->
      <div v-if="loading" class="touch-input-icon touch-input-loading">
        <div class="touch-input-spinner"></div>
      </div>
    </div>

    <!-- Helper Text or Error -->
    <div v-if="helperText || errorMessage" class="touch-input-helper">
      <span v-if="hasError" class="touch-input-error">
        {{ errorMessage }}
      </span>
      <span v-else-if="helperText" class="touch-input-helper-text">
        {{ helperText }}
      </span>
    </div>

    <!-- Character Count -->
    <div v-if="showCount && maxlength" class="touch-input-count">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, defineAsyncComponent } from 'vue';

// Dynamic icon imports
const EyeIcon = defineAsyncComponent(() => import('../assets/icons/eye-svg-icon.vue'));
const EyeOffIcon = defineAsyncComponent(() => import('../assets/icons/eye-off-svg-icon.vue'));
const XIcon = defineAsyncComponent(() => import('../assets/icons/cross-svg-icon.vue'));

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url', 'search'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  prefixIcon: {
    type: [Object, String],
    default: null
  },
  suffixIcon: {
    type: [Object, String],
    default: null
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  inputmode: {
    type: String,
    default: null
  },
  pattern: {
    type: String,
    default: null
  },
  min: {
    type: [String, Number],
    default: null
  },
  max: {
    type: [String, Number],
    default: null
  },
  step: {
    type: [String, Number],
    default: null
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  showCount: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'filled', 'outlined'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'enter', 'clear']);

const inputRef = ref(null);
const isFocused = ref(false);
const showPassword = ref(false);

// Generate unique ID for accessibility
const inputId = computed(() => `touch-input-${Math.random().toString(36).substr(2, 9)}`);

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password';
  }
  return props.type;
});

const hasError = computed(() => !!props.errorMessage);

const characterCount = computed(() => {
  return props.modelValue ? props.modelValue.toString().length : 0;
});

const containerClasses = computed(() => [
  'touch-input',
  `touch-input-${props.size}`,
  `touch-input-${props.variant}`,
  {
    'touch-input-focused': isFocused.value,
    'touch-input-disabled': props.disabled,
    'touch-input-readonly': props.readonly,
    'touch-input-error': hasError.value,
    'touch-input-loading': props.loading
  }
]);

const inputClasses = computed(() => [
  'touch-input-field',
  {
    'touch-input-field-prefix': props.prefixIcon,
    'touch-input-field-suffix': props.suffixIcon || props.clearable || props.loading || props.type === 'password'
  }
]);

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    emit('enter', event);
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
  // Maintain focus after toggle
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const clearInput = () => {
  emit('update:modelValue', '');
  emit('clear');
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

// Expose focus method
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
};

const blur = () => {
  if (inputRef.value) {
    inputRef.value.blur();
  }
};

defineExpose({
  focus,
  blur,
  inputRef
});
</script>

<style scoped>
.touch-input {
  width: 100%;
  margin-bottom: 16px;
}

.touch-input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  line-height: 1.4;
}

.touch-input-label-error {
  color: #ef4444;
}

.touch-input-required {
  color: #ef4444;
  margin-left: 2px;
}

.touch-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.touch-input-field {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  font-size: 16px; /* Prevents zoom on iOS */
  line-height: 1.4;
  color: #1f2937;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

.touch-input-field::placeholder {
  color: #9ca3af;
}

.touch-input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.touch-input-field:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.touch-input-field:readonly {
  background: #f9fafb;
  cursor: default;
}

/* Size variations */
.touch-input-sm .touch-input-field {
  min-height: 40px;
  padding: 10px 14px;
  font-size: 14px;
}

.touch-input-lg .touch-input-field {
  min-height: 52px;
  padding: 16px 20px;
  font-size: 18px;
}

/* Variant styles */
.touch-input-filled .touch-input-field {
  background: #f3f4f6;
  border: 1px solid transparent;
}

.touch-input-filled .touch-input-field:focus {
  background: white;
  border-color: #3b82f6;
}

.touch-input-outlined .touch-input-field {
  border: 2px solid #d1d5db;
}

.touch-input-outlined .touch-input-field:focus {
  border-color: #3b82f6;
  box-shadow: none;
}

/* Error state */
.touch-input-error .touch-input-field {
  border-color: #ef4444;
}

.touch-input-error .touch-input-field:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Field with icons */
.touch-input-field-prefix {
  padding-left: 48px;
}

.touch-input-field-suffix {
  padding-right: 48px;
}

.touch-input-sm .touch-input-field-prefix {
  padding-left: 44px;
}

.touch-input-sm .touch-input-field-suffix {
  padding-right: 44px;
}

.touch-input-lg .touch-input-field-prefix {
  padding-left: 56px;
}

.touch-input-lg .touch-input-field-suffix {
  padding-right: 56px;
}

/* Icons */
.touch-input-icon {
  position: absolute;
  width: 20px;
  height: 20px;
  color: #6b7280;
  pointer-events: none;
  z-index: 10;
}

.touch-input-icon-prefix {
  left: 14px;
}

.touch-input-icon-suffix,
.touch-input-password-toggle,
.touch-input-clear {
  right: 14px;
}

.touch-input-password-toggle,
.touch-input-clear {
  cursor: pointer;
  pointer-events: auto;
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.touch-input-password-toggle:hover,
.touch-input-clear:hover {
  background-color: rgba(107, 114, 128, 0.1);
}

.touch-input-password-toggle:focus,
.touch-input-clear:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.touch-input-loading {
  pointer-events: none;
}

.touch-input-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: touch-input-spin 1s linear infinite;
}

@keyframes touch-input-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Helper text and error */
.touch-input-helper {
  margin-top: 6px;
  min-height: 20px;
}

.touch-input-error {
  color: #ef4444;
  font-size: 14px;
  line-height: 1.4;
}

.touch-input-helper-text {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
}

/* Character count */
.touch-input-count {
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .touch-input-label {
    color: #f3f4f6;
  }
  
  .touch-input-field {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }
  
  .touch-input-field::placeholder {
    color: #6b7280;
  }
  
  .touch-input-field:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }
  
  .touch-input-field:disabled,
  .touch-input-field:readonly {
    background: #1f2937;
    color: #9ca3af;
  }
  
  .touch-input-filled .touch-input-field {
    background: #1f2937;
    border-color: transparent;
  }
  
  .touch-input-filled .touch-input-field:focus {
    background: #374151;
    border-color: #60a5fa;
  }
  
  .touch-input-icon {
    color: #9ca3af;
  }
  
  .touch-input-helper-text {
    color: #9ca3af;
  }
  
  .touch-input-count {
    color: #6b7280;
  }
}

/* RTL support */
.rtl .touch-input-icon-prefix {
  left: auto;
  right: 14px;
}

.rtl .touch-input-icon-suffix,
.rtl .touch-input-password-toggle,
.rtl .touch-input-clear {
  right: auto;
  left: 14px;
}

.rtl .touch-input-field-prefix {
  padding-left: 16px;
  padding-right: 48px;
}

.rtl .touch-input-field-suffix {
  padding-right: 16px;
  padding-left: 48px;
}

.rtl .touch-input-count {
  text-align: left;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .touch-input-field {
    border-width: 2px;
  }
  
  .touch-input-field:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .touch-input-field {
    transition: none;
  }
  
  .touch-input-spinner {
    animation: none;
  }
}
</style>