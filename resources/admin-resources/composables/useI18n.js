import { ref, computed, onMounted, nextTick } from 'vue';
import axios from 'axios';

// Global reactive state
const currentLocale = ref('en');
const availableLocales = ref({});
const translations = ref({});
const isRTL = ref(false);
const translationsLoaded = ref(false);
const currentCSSLink = ref(null);

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
        }
    }
}

// Load CSS based on language direction
function loadCSS(isRtl = false) {
    return new Promise((resolve) => {
        try {
            // Find and remove existing main CSS links
            const allLinks = document.querySelectorAll('link[rel="stylesheet"]');
            allLinks.forEach(link => {
                // Remove CSS files that are main-related (both LTR and RTL)
                if (link.href.includes('main') && link.href.includes('.css')) {
                    link.remove();
                }
            });
            
            // Create new link element
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.id = 'dynamic-theme-css';
            
            // Check if we're in development or production
            const isDev = import.meta.env.DEV;
            
            if (isDev) {
                // In development, use Vite's dev server paths
                const cssFileName = isRtl ? 'main-rtl.css' : 'main.css';
                link.href = `/resources/admin-resources/assets/css/${cssFileName}`;
                
                link.onload = () => {
                    console.log(`CSS loaded successfully: ${link.href}`);
                    currentCSSLink.value = link;
                    resolve();
                };
                
                link.onerror = () => {
                    console.warn(`Failed to load CSS: ${link.href}`);
                    resolve(); // Don't break the app
                };
                
                document.head.appendChild(link);
            } else {
                // In production, use the built CSS files
                // Try to get the CSS URL from the Vite manifest
                fetch('/build/manifest.json')
                    .then(response => response.json())
                    .then(manifest => {
                        const cssKey = isRtl 
                            ? 'resources/admin-resources/assets/css/main-rtl.css'
                            : 'resources/admin-resources/assets/css/main.css';
                        
                        if (manifest[cssKey] && manifest[cssKey].file) {
                            link.href = `/build/${manifest[cssKey].file}`;
                            
                            link.onload = () => {
                                console.log(`CSS loaded successfully: ${link.href}`);
                                currentCSSLink.value = link;
                                resolve();
                            };
                            
                            link.onerror = () => {
                                console.warn(`Failed to load CSS: ${link.href}`);
                                resolve();
                            };
                            
                            document.head.appendChild(link);
                        } else {
                            console.error(`Could not find CSS file in manifest: ${cssKey}`);
                            resolve();
                        }
                    })
                    .catch(error => {
                        console.error('Failed to load Vite manifest:', error);
                        resolve();
                    });
            }
            
            console.log(`Loading ${isRtl ? 'RTL' : 'LTR'} CSS`);
            
        } catch (error) {
            console.error('Error loading CSS:', error);
            resolve(); // Don't reject, just resolve to not break the app
        }
    });
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
        
        // Load appropriate CSS for the language direction
        await loadCSS(isRTL.value);
        
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
        
        // Check if we need to load different CSS than what was server-rendered
        // The blade template loads CSS based on server-side locale
        const bodyHasRTL = document.body.classList.contains('rtl');
        if (bodyHasRTL !== isRTL.value) {
            // Server and client language direction don't match, load correct CSS
            await loadCSS(isRTL.value);
        }
        
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
        loadCSS,
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