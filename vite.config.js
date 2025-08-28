import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command }) => {
    const config = {
        plugins: [
            vue(),
            laravel({
                input: [
                    // invextry backend admin assets
                    "resources/admin-resources/main.js",
                    // Only load LTR CSS by default - RTL will be loaded dynamically when needed
                    "resources/admin-resources/assets/css/main.css",
                    "resources/admin-resources/assets/css/main-rtl.css",
                ],
                refresh: true,
            }),
        ],
    };

    // Only apply build optimizations in production
    if (command === 'build') {
        config.build = {
            // Increase chunk size warning limit to 1000kb
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    // Manual chunking strategy for better code splitting
                    manualChunks: {
                        // Vendor libraries
                        vendor: ['vue', 'vue-router', 'pinia'],
                        // UI components
                        'ui-icons': [
                            './resources/admin-resources/assets/icons/menu-svg-icon.vue',
                            './resources/admin-resources/assets/icons/user-svg-icon.vue',
                            './resources/admin-resources/assets/icons/logout-svg-icon.vue',
                            './resources/admin-resources/assets/icons/setting-svg-icon.vue'
                        ],
                        // Chart libraries if using ApexCharts
                        charts: ['apexcharts'],
                        // Axios for API calls
                        api: ['axios']
                    }
                }
            }
        };
    }

    return config;
});
