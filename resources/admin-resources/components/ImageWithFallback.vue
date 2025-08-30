<template>
  <div class="img-with-fallback" :style="containerStyle">
    <img 
      v-if="!showFallback" 
      :src="src" 
      :alt="alt" 
      :class="imageClass"
      @error="handleImageError"
      ref="imageRef"
    />
    <div 
      v-if="showFallback" 
      class="image-placeholder" 
      :style="placeholderStyle"
    >
      {{ placeholderText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Image'
  },
  width: {
    type: [Number, String],
    default: 23
  },
  height: {
    type: [Number, String],
    default: 23
  },
  placeholderText: {
    type: String,
    default: ''
  },
  imageClass: {
    type: String,
    default: 'img-fluid'
  }
});

const showFallback = ref(false);
const imageRef = ref(null);

const containerStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  };
});

const placeholderStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
  };
});

const handleImageError = () => {
  showFallback.value = true;
};

onMounted(() => {
  // Check if image is already loaded or has error
  if (imageRef.value) {
    if (!imageRef.value.complete || imageRef.value.naturalWidth === 0) {
      showFallback.value = true;
    }
  }
  
  // Check if src is empty or invalid
  if (!props.src || props.src === '' || props.src === 'null' || props.src === 'undefined') {
    showFallback.value = true;
  }
});
</script>

<style scoped>
.img-with-fallback {
  position: relative;
  overflow: hidden;
}

.img-with-fallback img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #e5e7eb, #d1d5db);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 12px;
}

@media (prefers-color-scheme: dark) {
  .image-placeholder {
    background: linear-gradient(45deg, #374151, #1f2937);
    color: #9ca3af;
  }
}
</style>