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
            console.log(`Starting CSS load: ${isRtl ? 'RTL' : 'LTR'}`);
            
            // Check if we're in development or production
            const isDev = import.meta.env.DEV;
            console.log(`Environment: ${isDev ? 'Development' : 'Production'}`);
            
            // Remove existing dynamic CSS link to ensure only one CSS file is active
            const existingLink = document.getElementById('dynamic-theme-css');
            if (existingLink) {
                existingLink.remove();
                console.log('Removed existing dynamic CSS link');
            }
            
            // Also remove any existing main CSS links from Vite to prevent conflicts
            const allLinks = document.querySelectorAll('link[rel="stylesheet"]');
            allLinks.forEach(link => {
                if (link.href.includes('main') && (link.href.includes('.css') || link.href.includes('main-rtl') || link.href.includes('main-ltr'))) {
                    // Don't remove the link we're about to add
                    if (link.id !== 'dynamic-theme-css') {
                        console.log(`Removing conflicting CSS link: ${link.href}`);
                        link.remove();
                    }
                }
            });
            
            if (isDev) {
                // In development mode, use Vite dev server
                const currentHost = window.location.hostname;
                const currentPort = window.location.port;
                const vitePort = (['5173', '5174', '3000', '8080'].includes(currentPort)) ? currentPort : '5174';
                
                console.log(`Using dev server: ${currentHost}:${vitePort}`);
                
                // Create new link element
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.id = 'dynamic-theme-css';
                
                // Use Vite dev server URL format
                const cssPath = isRtl 
                    ? `http://${currentHost}:${vitePort}/resources/admin-resources/assets/css/main-rtl.css`
                    : `http://${currentHost}:${vitePort}/resources/admin-resources/assets/css/main.css`;
                
                link.href = cssPath;
                
                link.onload = () => {
                    console.log(`✓ CSS loaded successfully: ${cssPath}`);
                    currentCSSLink.value = link;
                    resolve();
                };
                
                link.onerror = () => {
                    console.warn(`✗ Failed to load CSS: ${cssPath}`);
                    // Don't reload the page, just resolve and continue
                    // The application should still work with the previously loaded CSS
                    console.log('Continuing without CSS reload to prevent page refresh...');
                    resolve();
                };
                
                document.head.appendChild(link);
                console.log(`Added CSS link to head: ${cssPath}`);
                
            } else {
                // In production, use the built CSS files from the manifest
                console.log('Loading CSS from production manifest...');
                
                fetch('/build/manifest.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(manifest => {
                        const cssKey = isRtl 
                            ? 'resources/admin-resources/assets/css/main-rtl.css'
                            : 'resources/admin-resources/assets/css/main.css';
                        
                        console.log('Available CSS entries:', Object.keys(manifest).filter(key => key.includes('.css')));
                        console.log(`Looking for CSS key: ${cssKey}`);
                        
                        if (manifest[cssKey] && manifest[cssKey].file) {
                            // Create new link element
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.type = 'text/css';
                            link.id = 'dynamic-theme-css';
                            link.href = `/build/${manifest[cssKey].file}`;
                            
                            link.onload = () => {
                                console.log(`✓ CSS loaded successfully: ${link.href}`);
                                currentCSSLink.value = link;
                                resolve();
                            };
                            
                            link.onerror = () => {
                                console.warn(`✗ Failed to load CSS: ${link.href}`);
                                // Don't reload, just continue
                                resolve();
                            };
                            
                            document.head.appendChild(link);
                            console.log(`Added production CSS link: ${link.href}`);
                        } else {
                            console.error(`Could not find CSS file in manifest: ${cssKey}`);
                            console.error('Available CSS entries:', Object.keys(manifest).filter(key => key.includes('.css')));
                            resolve();
                        }
                    })
                    .catch(error => {
                        console.error('Failed to load Vite manifest:', error);
                        resolve();
                    });
            }
            
        } catch (error) {
            console.error('Error in loadCSS function:', error);
            resolve(); // Don't reject, just resolve to not break the app
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
        
        // Load appropriate CSS for the language direction if direction changed
        if (oldIsRTL !== isRTL.value) {
            console.log(`Direction changed, loading ${isRTL.value ? 'RTL' : 'LTR'} CSS...`);
            await loadCSS(isRTL.value);
            console.log('CSS loaded successfully');
        } else {
            console.log('Direction unchanged, no CSS reload needed');
        }
        
        // Update document attributes
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr');
        
        // Update body class for styling
        document.body.classList.remove('rtl', 'ltr');
        document.body.classList.add(isRTL.value ? 'rtl' : 'ltr');
        
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
        
        // Set initial body class
        document.body.classList.toggle('rtl', isRTL.value);
        document.body.classList.toggle('ltr', !isRTL.value);
        
        // Check if server-rendered CSS matches current locale direction
        const serverRenderedRTL = document.body.classList.contains('rtl');
        const clientExpectedRTL = isRTL.value;
        
        console.log('CSS direction check:', {
            serverRendered: serverRenderedRTL ? 'RTL' : 'LTR',
            clientExpected: clientExpectedRTL ? 'RTL' : 'LTR',
            needsSwitch: serverRenderedRTL !== clientExpectedRTL
        });
        
        // Only load CSS if there's a mismatch and we're in development mode
        // In production, trust the server-rendered CSS
        const isDev = import.meta.env.DEV;
        if (isDev && serverRenderedRTL !== clientExpectedRTL) {
            console.log('Direction mismatch in dev mode, loading correct CSS...');
            await loadCSS(clientExpectedRTL);
        } else {
            console.log('CSS direction matches or in production mode, no switch needed');
        }
        
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
        
        // Try to load English translations as fallback
        try {
            await loadTranslations('en');
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