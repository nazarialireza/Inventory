import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [
        vue(),
        laravel({
            input: [
                // invextry backend admin assets
                "resources/admin-resources/main.js",
                // CSS files for LTR and RTL
                "resources/admin-resources/assets/css/main.css",
                "resources/admin-resources/assets/css/main-rtl.css",
            ],
            refresh: true,
        }),
    ],
});
