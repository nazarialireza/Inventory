import { ref, computed, onMounted, nextTick } from 'vue';
import axios from 'axios';

// Global reactive state and set local to Dari
const currentLocale = ref('prs');
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
        // Fallback to Dari translations
        if (targetLocale !== 'prs') {
            console.warn(`Failed to load translations for ${targetLocale}, falling back to Dari`);
            await loadTranslations('prs');
        } else {
            console.error('Failed to load translations:', error);
        }
    }
}

// Load CSS based on language direction
function loadCSS(isRtl = false) {
    return new Promise(async (resolve) => {
        console.log(`Loading CSS for direction: ${isRtl ? 'RTL' : 'LTR'}`);
        
        // First, remove ALL existing CSS files more comprehensively
        const removeExistingCSS = () => {
            // Remove by ID (our dynamic CSS)
            const dynamicCSS = document.getElementById('dynamic-css');
            if (dynamicCSS) {
                dynamicCSS.remove();
                console.log('Removed dynamic CSS by ID');
            }
            
            // Remove all main CSS files by href pattern
            const allLinks = document.querySelectorAll('link[rel="stylesheet"]');
            allLinks.forEach(link => {
                const href = link.href;
                // Check for both original and hashed filenames
                if (href.includes('main.css') || 
                    href.includes('main-rtl') || 
                    href.includes('main-') || // catches hashed versions like main-593b0899.css
                    link.id === 'dynamic-css' ||
                    href.match(/main-[a-f0-9]+\.css/) || // regex for hashed main files
                    href.match(/main-rtl-[a-f0-9]+\.css/)) { // regex for hashed main-rtl files
                    
                    link.remove();
                    console.log(`Removed CSS: ${href}`);
                }
            });
            
            // Also remove any style elements that might contain our CSS
            const styleElements = document.querySelectorAll('style[data-css-type="main"]');
            styleElements.forEach(style => {
                style.remove();
                console.log('Removed style element');
            });
        };
        
        // Remove existing CSS first
        removeExistingCSS();
        
        // Wait a moment to ensure removal is complete
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Create new CSS link for the correct direction
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = 'dynamic-css';
        link.setAttribute('data-css-direction', isRtl ? 'rtl' : 'ltr');
        
        try {
            if (import.meta.env.DEV) {
                // In development, use Vite dev server
                const cssFile = isRtl ? 'main-rtl.css' : 'main.css';
                link.href = `http://localhost:5173/resources/admin-resources/assets/css/${cssFile}`;
                console.log(`Dev mode: ${link.href}`);
            } else {
                // In production, use Vite manifest to get hashed filenames
                console.log('Production mode: Loading manifest...');
                const manifestResponse = await fetch('/build/manifest.json');
                const manifest = await manifestResponse.json();
                
                const cssKey = isRtl 
                    ? 'resources/admin-resources/assets/css/main-rtl.css'
                    : 'resources/admin-resources/assets/css/main.css';
                
                console.log('Available manifest entries:', Object.keys(manifest).filter(key => key.includes('.css')));
                console.log(`Looking for CSS key: ${cssKey}`);
                
                if (manifest[cssKey] && manifest[cssKey].file) {
                    link.href = `/build/${manifest[cssKey].file}`;
                    console.log(`Production mode: ${link.href}`);
                } else {
                    console.error(`CSS file not found in manifest: ${cssKey}`);
                    console.error('Available CSS entries:', Object.keys(manifest).filter(key => key.includes('.css')));
                    resolve();
                    return;
                }
            }
            
            link.onload = () => {
                console.log(`✓ CSS loaded successfully: ${link.href}`);
                // Update body classes after CSS is loaded
                document.body.classList.remove('rtl', 'ltr');
                document.body.classList.add(isRtl ? 'rtl' : 'ltr');
                
                // Double-check that old CSS is really gone
                const remainingOldCSS = document.querySelectorAll('link[rel="stylesheet"]');
                remainingOldCSS.forEach(oldLink => {
                    if (oldLink !== link && (
                        oldLink.href.includes('main.css') || 
                        oldLink.href.includes('main-rtl') ||
                        oldLink.href.includes('main-'))) {
                        oldLink.remove();
                        console.log(`Cleanup: Removed remaining old CSS: ${oldLink.href}`);
                    }
                });
                
                resolve();
            };
            
            link.onerror = () => {
                console.warn(`✗ Failed to load CSS: ${link.href}`);
                // Still update body classes as fallback
                document.body.classList.remove('rtl', 'ltr');
                document.body.classList.add(isRtl ? 'rtl' : 'ltr');
                resolve();
            };
            
            // Add the new CSS link to the document head
            document.head.appendChild(link);
            console.log(`Added CSS link: ${link.href}`);
            
        } catch (error) {
            console.error('Error loading CSS:', error);
            // Fallback: just update body classes
            document.body.classList.remove('rtl', 'ltr');
            document.body.classList.add(isRtl ? 'rtl' : 'ltr');
            resolve();
        }
    });
}

// Switch language
async function switchLanguage(locale) {
    if (!availableLocales.value[locale]) {
        console.error(`Locale ${locale} is not available. Available locales:`, Object.keys(availableLocales.value));
        return false;
    }
    
    try {
        console.log(`Switching language to: ${locale}`);
        
        const oldLocale = currentLocale.value;
        const oldIsRTL = isRTL.value;
        
        // Update backend locale first
        console.log('Updating backend locale...');
        await axios.post('/api/locale', { locale });
        console.log('Backend locale updated successfully');
        
        // Update frontend state
        currentLocale.value = locale;
        isRTL.value = availableLocales.value[locale]?.dir === 'rtl';
        
        console.log(`Language switched: ${oldLocale} -> ${locale}`);
        console.log(`Direction changed: ${oldIsRTL ? 'RTL' : 'LTR'} -> ${isRTL.value ? 'RTL' : 'LTR'}`);
        
        // Load new translations
        console.log('Loading translations for new locale...');
        await loadTranslations(locale);
        console.log('Translations loaded successfully');
        
        // Update CSS direction (always call to ensure classes are correct)
        console.log(`Setting direction to ${isRTL.value ? 'RTL' : 'LTR'}...`);
        await loadCSS(isRTL.value);
        console.log('Direction classes updated successfully');
        
        // Update document attributes
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr');
        
        console.log(`Document attributes updated:`);
        console.log(`- lang: ${document.documentElement.getAttribute('lang')}`);
        console.log(`- dir: ${document.documentElement.getAttribute('dir')}`);
        console.log(`- body classes: ${document.body.className}`);
        
        // Force a DOM update
        await nextTick();
        
        console.log(`Language switch completed successfully!`);
        return true;
    } catch (error) {
        console.error('Failed to switch language:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
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
        
        console.log('I18n initialized:', {
            currentLocale: currentLocale.value,
            isRTL: isRTL.value,
            availableLocales: Object.keys(availableLocales.value)
        });
        
        // Set initial document attributes
        document.documentElement.setAttribute('lang', currentLocale.value);
        document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr');
        
        // Load the correct CSS file for the current direction
        console.log(`Loading initial CSS for direction: ${isRTL.value ? 'RTL' : 'LTR'}`);
        await loadCSS(isRTL.value);
        
        console.log(`Initial direction class set to: ${isRTL.value ? 'rtl' : 'ltr'}`);
        
        // Load initial translations
        await loadTranslations();
        
        console.log('I18n initialization completed successfully');
    } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // Set defaults
        currentLocale.value = 'en';
        availableLocales.value = {
            en: { name: 'English', dir: 'ltr' },
            prs: { name: 'دری', dir: 'rtl' }
        };
        isRTL.value = false;
        
        // Ensure body classes are set even on error
        document.body.classList.remove('rtl', 'ltr');
        document.body.classList.add('ltr');
        
        // Try to load Dari translations as fallback
        try {
            await loadTranslations('prs');
        } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError);
        }
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