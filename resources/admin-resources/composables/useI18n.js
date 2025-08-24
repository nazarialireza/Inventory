import { ref, computed, onMounted, nextTick } from 'vue';
import axios from 'axios';

// Global reactive state
const currentLocale = ref('en');
const availableLocales = ref({});
const translations = ref({});
const isRTL = ref(false);
const translationsLoaded = ref(false);

// Translation helper function with reactivity
function trans(key, params = {}) {
    // Trigger reactivity by accessing translations.value
    const currentTranslations = translations.value;
    
    if (!currentTranslations || Object.keys(currentTranslations).length === 0) {
        return key;
    }
    
    const keys = key.split('.');
    let value = currentTranslations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to the key itself if translation not found
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }
    }
    
    // Replace parameters in the translation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
        for (const [param, replacement] of Object.entries(params)) {
            value = value.replace(`:${param}`, replacement);
        }
    }
    
    return value || key;
}

// Load translations for current locale
async function loadTranslations(locale = null) {
    const targetLocale = locale || currentLocale.value;
    
    try {
        console.log(`Loading translations for locale: ${targetLocale}`);
        const response = await axios.get(`/api/translations/${targetLocale}`);
        
        // Force reactivity by creating a new object
        translations.value = { ...response.data };
        translationsLoaded.value = true;
        
        console.log(`Translations loaded for ${targetLocale}:`, Object.keys(translations.value));
        
        // Force Vue to update components
        await nextTick();
        
    } catch (error) {
        console.error(`Failed to load translations for ${targetLocale}:`, error);
        // Fallback to English translations
        if (targetLocale !== 'en') {
            console.warn(`Failed to load translations for ${targetLocale}, falling back to English`);
            await loadTranslations('en');
        } else {
            console.error('Failed to load translations:', error);
            translationsLoaded.value = false;
        }
    }
}

// Switch language
async function switchLanguage(locale) {
    if (!availableLocales.value[locale]) {
        console.error(`Locale ${locale} is not available`);
        return false;
    }
    
    try {
        console.log(`Switching language to: ${locale}`);
        
        // Update backend locale
        await axios.post('/api/locale', { locale });
        
        // Update frontend state
        currentLocale.value = locale;
        isRTL.value = availableLocales.value[locale]?.dir === 'rtl';
        
        console.log(`Language switched to ${locale}, RTL: ${isRTL.value}`);
        
        // Load new translations
        await loadTranslations(locale);
        
        // Update document attributes
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr');
        
        // Update body class for styling
        document.body.classList.remove('rtl', 'ltr');
        document.body.classList.add(isRTL.value ? 'rtl' : 'ltr');
        
        console.log(`Document dir set to: ${isRTL.value ? 'rtl' : 'ltr'}`);
        
        // Force a DOM update
        await nextTick();
        
        return true;
    } catch (error) {
        console.error('Failed to switch language:', error);
        return false;
    }
}

// Initialize i18n
async function initializeI18n() {
    try {
        const response = await axios.get('/api/locale');
        
        currentLocale.value = response.data.current_locale;
        availableLocales.value = response.data.available_locales;
        isRTL.value = response.data.current_locale_info?.dir === 'rtl';
        
        // Set initial document attributes
        document.documentElement.setAttribute('lang', currentLocale.value);
        document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr');
        
        // Set initial body class
        document.body.classList.toggle('rtl', isRTL.value);
        document.body.classList.toggle('ltr', !isRTL.value);
        
        // Load initial translations
        await loadTranslations();
    } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // Set defaults
        currentLocale.value = 'en';
        availableLocales.value = {
            en: { name: 'English', dir: 'ltr' },
            prs: { name: 'دری', dir: 'rtl' }
        };
        isRTL.value = false;
    }
}

// Format number based on locale
function formatNumber(number, options = {}) {
    try {
        return new Intl.NumberFormat(currentLocale.value, options).format(number);
    } catch (error) {
        return number.toString();
    }
}

// Format currency based on locale
function formatCurrency(amount, currency = 'USD') {
    try {
        return new Intl.NumberFormat(currentLocale.value, {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (error) {
        return `${currency} ${amount}`;
    }
}

// Format date based on locale
function formatDate(date, options = {}) {
    try {
        return new Intl.DateTimeFormat(currentLocale.value, options).format(new Date(date));
    } catch (error) {
        return date.toString();
    }
}

// Composable function
export function useI18n() {
    return {
        // Reactive state
        currentLocale: computed(() => currentLocale.value),
        availableLocales: computed(() => availableLocales.value),
        isRTL: computed(() => isRTL.value),
        translationsLoaded: computed(() => translationsLoaded.value),
        
        // Functions
        trans,
        switchLanguage,
        loadTranslations,
        initializeI18n,
        formatNumber,
        formatCurrency,
        formatDate,
        
        // Shorthand for common translations
        t: trans,
        
        // Get current locale info
        getCurrentLocaleInfo: computed(() => availableLocales.value[currentLocale.value] || {}),
        
        // Check if locale is RTL
        isCurrentLocaleRTL: computed(() => isRTL.value),
        
        // Raw reactive references for debugging
        _translations: translations,
        _currentLocale: currentLocale,
        _isRTL: isRTL,
    };
}