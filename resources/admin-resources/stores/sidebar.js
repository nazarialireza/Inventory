import { defineStore } from "pinia";

export const useSidebar = defineStore("sidebar", {
    state: () => ({
        open: window.innerWidth > 768 ? false : false, // Default to closed on desktop, closed on mobile
    }),

    getters: {
        getSidebarStatus: (state) => state.open,
    },

    actions: {
        toggle() {
            this.open = !this.open;
        },
        
        // New action to open sidebar
        openSidebar() {
            this.open = true;
        },
        
        // New action to close sidebar
        closeSidebar() {
            this.open = false;
        },
        
        // New action to set sidebar state based on screen size
        setSidebarForScreenSize() {
            // On mobile, keep sidebar closed by default
            // On desktop, keep sidebar closed by default (user can open it)
            this.open = false;
        }
    },
});