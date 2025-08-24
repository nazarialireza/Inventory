<template>
    <div class="i18n-test" :class="{ 'rtl': isRTL }">
        <div class="debug-info">
            <h2>🌐 Multilingual Debug Panel</h2>
            
            <div class="status-grid">
                <div class="status-item">
                    <strong>Current Locale:</strong> 
                    <span :class="currentLocale">{{ currentLocale }}</span>
                </div>
                
                <div class="status-item">
                    <strong>Is RTL:</strong> 
                    <span :class="{ 'rtl-active': isRTL }">{{ isRTL ? 'YES' : 'NO' }}</span>
                </div>
                
                <div class="status-item">
                    <strong>Translations Loaded:</strong> 
                    <span :class="{ 'loaded': translationsLoaded }">{{ translationsLoaded ? 'YES' : 'NO' }}</span>
                </div>
                
                <div class="status-item">
                    <strong>Available Locales:</strong> 
                    <span>{{ Object.keys(availableLocales).join(', ') }}</span>
                </div>
            </div>
        </div>
        
        <div class="test-buttons">
            <button @click="switchToEnglish" :disabled="isChanging" class="btn-english">
                🇺🇸 Switch to English
            </button>
            <button @click="switchToDari" :disabled="isChanging" class="btn-dari">
                🇦🇫 Switch to Dari (دری)
            </button>
            <button @click="debugTranslations" class="btn-debug">
                🔍 Debug Translations
            </button>
        </div>
        
        <div v-if="isChanging" class="loading">
            <div class="spinner"></div>
            <span>Changing language...</span>
        </div>
        
        <div class="test-translations">
            <h3>{{ t('dashboard.title') || 'Translation test' }}</h3>
            
            <div class="translation-grid">
                <div class="translation-item">
                    <strong>General Loading:</strong> {{ t('general.loading') }}
                </div>
                <div class="translation-item">
                    <strong>General Save:</strong> {{ t('general.save') }}
                </div>
                <div class="translation-item">
                    <strong>General Cancel:</strong> {{ t('general.cancel') }}
                </div>
                <div class="translation-item">
                    <strong>Navigation Dashboard:</strong> {{ t('navigation.dashboard') }}
                </div>
                <div class="translation-item">
                    <strong>Navigation Products:</strong> {{ t('navigation.products') }}
                </div>
                <div class="translation-item">
                    <strong>Warehouses Title:</strong> {{ t('warehouses.title') }}
                </div>
            </div>
        </div>
        
        <div class="raw-debug" v-if="showDebug">
            <h4>Raw Debug Info:</h4>
            <pre>{{ debugInfo }}</pre>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from '../composables/useI18n.js';

const { 
    t, 
    currentLocale, 
    availableLocales,
    isRTL, 
    switchLanguage,
    translationsLoaded,
    _translations,
    _currentLocale,
    _isRTL
} = useI18n();

const isChanging = ref(false);
const showDebug = ref(false);

const debugInfo = computed(() => {
    return {
        currentLocale: currentLocale.value,
        isRTL: isRTL.value,
        translationsLoaded: translationsLoaded.value,
        availableLocales: availableLocales.value,
        translationsKeys: Object.keys(_translations.value || {}),
        bodyClasses: document.body.className,
        docDir: document.documentElement.getAttribute('dir'),
        docLang: document.documentElement.getAttribute('lang')
    };
});

async function switchToEnglish() {
    isChanging.value = true;
    console.log('TestI18n: Switching to English');
    try {
        await switchLanguage('en');
        console.log('TestI18n: Switched to English successfully');
    } catch (error) {
        console.error('TestI18n: Error switching to English:', error);
    } finally {
        isChanging.value = false;
    }
}

async function switchToDari() {
    isChanging.value = true;
    console.log('TestI18n: Switching to Dari');
    try {
        await switchLanguage('prs');
        console.log('TestI18n: Switched to Dari successfully');
    } catch (error) {
        console.error('TestI18n: Error switching to Dari:', error);
    } finally {
        isChanging.value = false;
    }
}

function debugTranslations() {
    showDebug.value = !showDebug.value;
    console.log('Current translations:', _translations.value);
    console.log('Current locale:', _currentLocale.value);
    console.log('Is RTL:', _isRTL.value);
    console.log('Document direction:', document.documentElement.getAttribute('dir'));
    console.log('Body classes:', document.body.className);
}
</script>

<style scoped>
.i18n-test {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.i18n-test.rtl {
    direction: rtl;
    text-align: right;
}

.debug-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #dee2e6;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.status-item {
    padding: 8px;
    background: white;
    border-radius: 4px;
    border: 1px solid #e9ecef;
}

.status-item span.rtl-active {
    color: #dc3545;
    font-weight: bold;
}

.status-item span.loaded {
    color: #28a745;
    font-weight: bold;
}

.test-buttons {
    display: flex;
    gap: 10px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.test-buttons button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.test-buttons button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-english {
    background: #007bff;
    color: white;
}

.btn-english:hover:not(:disabled) {
    background: #0056b3;
}

.btn-dari {
    background: #28a745;
    color: white;
}

.btn-dari:hover:not(:disabled) {
    background: #1e7e34;
}

.btn-debug {
    background: #6c757d;
    color: white;
}

.btn-debug:hover {
    background: #545b62;
}

.loading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
    padding: 10px;
    background: #fff3cd;
    border-radius: 4px;
    border: 1px solid #ffeaa7;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.translation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
    margin-top: 15px;
}

.translation-item {
    padding: 10px;
    background: #e9ecef;
    border-radius: 4px;
    border-left: 4px solid #007bff;
}

.rtl .translation-item {
    border-left: none;
    border-right: 4px solid #007bff;
}

.raw-debug {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.raw-debug pre {
    background: #ffffff;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #e9ecef;
    overflow-x: auto;
    font-size: 12px;
}

.rtl h2, .rtl h3, .rtl h4 {
    text-align: right;
}

.rtl .test-buttons {
    flex-direction: row-reverse;
}

.rtl .loading {
    flex-direction: row-reverse;
}
</style>