import { createApp } from "vue";
import { createPinia } from "pinia";
import "./plugins/axios-settings.js";
import router from "./router";
// CSS loading is now handled dynamically in useI18n composable
import { useI18n } from "./composables/useI18n";
import { registerSW } from 'virtual:pwa-register';

import App from "./views/App.vue";

const app = createApp(App);
const store = createPinia();

app.use(store);
app.use(router);

app.config.globalProperties.$demoIMG = '/img/placeholder.png';

// Initialize i18n system
const { initializeI18n } = useI18n();

// utils/loaderUtils.js
export function createLoaderHTML() {
  return `
        <div class="loader_container" style="width: 100%; min-width: 300px; display: flex; justify-content: center; align-items: center; padding: 100px 0px 50px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; box-sizing: border-box;">
            <div class="circular-loader" style="width: 80px; height: 80px; display: flex; justify-content: center; align-items: center;">
                <svg class="spinner" viewBox="25 25 50 50" style="animation: rotate 2s linear infinite; height: 80px; transform-origin: center center; width: 80px; position: relative;">
                    <circle cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10" style="stroke-dasharray: 1, 200; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite; stroke-linecap: round; stroke: #3485f0;"></circle>
                </svg>
            </div>
        </div>
        <style>
            @keyframes rotate {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            @keyframes dash {
                0% {
                    stroke-dasharray: 1, 200;
                    stroke-dashoffset: 0;
                }
                50% {
                    stroke-dasharray: 89, 200;
                    stroke-dashoffset: -35px;
                }
                100% {
                    stroke-dasharray: 89, 200;
                    stroke-dashoffset: -124px;
                }
            }
        </style>   
  `;
}

// Initialize app
async function initApp() {
    try {
        console.log('Initializing Invextry Admin...');
        
        // Create a loading indicator first
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'app-initializing';
        loadingDiv.innerHTML = createLoaderHTML();
        loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; z-index: 9999;';
        document.body.appendChild(loadingDiv);

        // Register PWA service worker
        console.log('Registering PWA service worker...');
        const updateSW = registerSW({
            onNeedRefresh() {
                // Show a prompt to user for updating the app
                const updateBanner = document.createElement('div');
                updateBanner.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #1f2937;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                `;
                updateBanner.innerHTML = `
                    <span>New version available!</span>
                    <button onclick="this.parentElement.updateApp()" style="
                        margin-left: 10px;
                        padding: 5px 15px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Update</button>
                    <button onclick="this.parentElement.remove()" style="
                        margin-left: 10px;
                        padding: 5px 15px;
                        background: transparent;
                        color: white;
                        border: 1px solid white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Later</button>
                `;
                updateBanner.updateApp = () => {
                    updateSW(true);
                };
                document.body.appendChild(updateBanner);
            },
            onOfflineReady() {
                console.log('App ready to work offline');
                // You can show a message to user that app is ready for offline use
            },
            onRegisterError(error) {
                console.log('SW registration error', error);
            },
        });
        console.log('PWA service worker registered successfully');
        
        // Initialize translations with a retry mechanism
        console.log('Loading i18n system...');
        let i18nInitialized = false;
        let retries = 0;
        
        while (!i18nInitialized && retries < 3) {
            try {
                await initializeI18n();
                i18nInitialized = true;
                console.log('i18n system loaded successfully');
            } catch (error) {
                retries++;
                console.warn(`i18n initialization failed, retry ${retries}/3`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
            }
        }
        
        // Pre-fetch critical data before mounting
        try {
            const authStore = useAuthStore();
            await authStore.getAuthUser();
            console.log('User authentication verified');
        } catch (error) {
            console.warn('Failed to pre-fetch auth data', error);
        }

        // Mount the app
        console.log('Mounting Vue app...');
        app.mount("#invextry-admin");
        console.log('Vue app mounted successfully');

        // Remove loading indicator
        loadingDiv.style.opacity = '0';
        loadingDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => loadingDiv.remove(), 500);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // Mount anyway with fallback settings
        console.log('Mounting app with fallback settings...');
        try {
            app.mount("#invextry-admin");
            console.log('App mounted with fallbacks');
        } catch (mountError) {
            console.error('Critical error: Failed to mount app:', mountError);
            
            // Show error message to user
            const container = document.getElementById("invextry-admin");
            if (container) {
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #dc3545;">
                        <h2>Application Error</h2>
                        <p>Failed to initialize the application. Please refresh the page or contact support.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </div>
                `;
            }
        }
    }
}

// Start the application
console.log('Starting Invextry application...');
initApp();
