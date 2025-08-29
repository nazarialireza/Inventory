import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from 'vite-plugin-pwa';

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
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.svg', 'apple-touch-icon.svg', 'maskable-icon-512x512.svg'],
                manifest: {
                    name: 'Invextry - Professional Inventory Management System',
                    short_name: 'Invextry',
                    description: 'Modern inventory management system for businesses with offline support',
                    theme_color: '#3b82f6',
                    background_color: '#ffffff',
                    display: 'standalone',
                    orientation: 'portrait',
                    scope: '/',
                    start_url: '/',
                    icons: [
                        {
                            src: 'pwa-64x64.svg',
                            sizes: '64x64',
                            type: 'image/svg+xml'
                        },
                        {
                            src: 'pwa-192x192.svg',
                            sizes: '192x192',
                            type: 'image/svg+xml'
                        },
                        {
                            src: 'pwa-512x512.svg',
                            sizes: '512x512',
                            type: 'image/svg+xml',
                            purpose: 'any'
                        },
                        {
                            src: 'maskable-icon-512x512.svg',
                            sizes: '512x512',
                            type: 'image/svg+xml',
                            purpose: 'maskable'
                        },
                        {
                            src: 'apple-touch-icon.svg',
                            sizes: '180x180',
                            type: 'image/svg+xml'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                    navigateFallback: null
                },
                devOptions: {
                    enabled: true
                }
            })
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
