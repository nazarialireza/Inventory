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

// Initialize app
async function initApp() {
    try {
        console.log('Initializing Invextry Admin...');
        
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
        
        // Initialize internationalization
        console.log('Loading i18n system...');
        await initializeI18n();
        console.log('i18n system loaded successfully');
        
        // Mount the app
        console.log('Mounting Vue app...');
        app.mount("#invextry-admin");
        console.log('Vue app mounted successfully');
        
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
