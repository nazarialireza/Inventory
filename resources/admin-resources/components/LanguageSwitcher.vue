<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from '../composables/useI18n';

const { 
    currentLocale, 
    availableLocales, 
    switchLanguage, 
    t, 
    isRTL,
    translationsLoaded
} = useI18n();

const isDropdownOpen = ref(false);
const isChanging = ref(false);

// Get current locale display info
const currentLocaleInfo = computed(() => {
    return availableLocales.value[currentLocale.value] || {};
});

// Get available locales as array
const localeOptions = computed(() => {
    return Object.entries(availableLocales.value).map(([code, info]) => ({
        code,
        ...info
    }));
});

// Handle language change
async function handleLanguageChange(localeCode) {
    if (localeCode === currentLocale.value || isChanging.value) {
        return;
    }
    
    console.log(`LanguageSwitcher: Changing language to ${localeCode}`);
    
    isChanging.value = true;
    isDropdownOpen.value = false;
    
    try {
        const success = await switchLanguage(localeCode);
        if (success) {
            console.log(`LanguageSwitcher: Language changed successfully to ${localeCode}`);
        } else {
            console.error(`LanguageSwitcher: Failed to change language to ${localeCode}`);
        }
    } catch (error) {
        console.error('LanguageSwitcher: Failed to change language:', error);
    } finally {
        isChanging.value = false;
    }
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
    if (!event.target.closest('.language-switcher')) {
        isDropdownOpen.value = false;
    }
}

// Watch for locale changes to update UI
watch(currentLocale, (newLocale) => {
    console.log(`LanguageSwitcher: Locale changed to ${newLocale}`);
});

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    console.log('LanguageSwitcher: Component mounted');
});

// Clean up event listener
import { onUnmounted } from 'vue';
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="language-switcher" :class="{ 'rtl': isRTL }">
        <div class="language-dropdown">
            <button 
                class="language-toggle"
                @click="isDropdownOpen = !isDropdownOpen"
                :disabled="isChanging"
                :class="{ 'changing': isChanging }"
            >
                <div class="current-language">
                    <span class="language-icon">🌐</span>
                    <span class="language-name">{{ currentLocaleInfo.native || currentLocaleInfo.name }}</span>
                    <svg 
                        class="dropdown-arrow" 
                        :class="{ 'open': isDropdownOpen }"
                        width="12" 
                        height="12" 
                        viewBox="0 0 12 12"
                    >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <div v-if="isChanging" class="changing-indicator">
                    <div class="spinner"></div>
                </div>
            </button>
            
            <transition name="dropdown">
                <ul v-if="isDropdownOpen" class="language-options">
                    <li 
                        v-for="locale in localeOptions" 
                        :key="locale.code"
                        class="language-option"
                        :class="{ 
                            'active': locale.code === currentLocale,
                            'rtl': locale.dir === 'rtl'
                        }"
                        @click="handleLanguageChange(locale.code)"
                    >
                        <span class="language-flag">
                            {{ locale.code === 'en' ? '🇺🇸' : locale.code === 'prs' ? '🇦🇫' : '🌐' }}
                        </span>
                        <span class="language-native">{{ locale.native }}</span>
                        <span class="language-english">({{ locale.name }})</span>
                        <span v-if="locale.code === currentLocale" class="active-indicator">✓</span>
                    </li>
                </ul>
            </transition>
        </div>
    </div>
</template>

<style scoped>
.language-switcher {
    position: relative;
    display: inline-block;
}

.language-toggle {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
    position: relative;
}

.language-toggle:hover {
    border-color: #c7d2fe;
    background: #f8faff;
}

.language-toggle:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.language-toggle.changing {
    background: #f0f9ff;
}

.current-language {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
}

.language-icon {
    font-size: 16px;
}

.language-name {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.dropdown-arrow {
    transition: transform 0.2s ease;
    color: #6b7280;
}

.dropdown-arrow.open {
    transform: rotate(180deg);
}

.changing-indicator {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.language-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin: 4px 0 0 0;
    padding: 0;
    list-style: none;
    overflow: hidden;
}

.language-option {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    gap: 8px;
    border-bottom: 1px solid #f3f4f6;
}

.language-option:last-child {
    border-bottom: none;
}

.language-option:hover {
    background: #f8faff;
}

.language-option.active {
    background: #eff6ff;
    color: #1d4ed8;
}

.language-flag {
    font-size: 16px;
}

.language-native {
    font-weight: 500;
    color: #374151;
    flex: 1;
}

.language-english {
    font-size: 12px;
    color: #6b7280;
}

.active-indicator {
    color: #10b981;
    font-weight: bold;
}

/* RTL Support */
.language-switcher.rtl .current-language {
    flex-direction: row-reverse;
}

.language-switcher.rtl .language-options {
    left: auto;
    right: 0;
}

.language-option.rtl {
    flex-direction: row-reverse;
    text-align: right;
}

.language-option.rtl .language-native {
    text-align: right;
}

.language-option.rtl .language-english {
    text-align: right;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Responsive Design */
@media (max-width: 768px) {
    .language-toggle {
        min-width: 100px;
        padding: 6px 8px;
    }
    
    .language-name {
        font-size: 12px;
    }
    
    .language-options {
        min-width: 200px;
    }
}
</style>