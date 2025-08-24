import { createApp } from "vue";
import { createPinia } from "pinia";
import "./plugins/axios-settings.js";
import router from "./router";
import "./assets/css/main.css";
import "./assets/css/rtl.css";
import { useI18n } from "./composables/useI18n";

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
