<script setup>
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { useSidebar } from "../stores/sidebar";
import { useI18n } from "../composables/useI18n";
import { ref, defineAsyncComponent } from "vue";

const sidebarStore = useSidebar();
const userDropDown = ref(false);
const { t } = useI18n();

// Dynamic imports for better code splitting
const MenuSvgIcon = defineAsyncComponent(() => import("../assets/icons/menu-svg-icon.vue"));
const UserSvgIcon = defineAsyncComponent(() => import("../assets/icons/user-svg-icon.vue"));
const LogoutSvgIcon = defineAsyncComponent(() => import("../assets/icons/logout-svg-icon.vue"));
const SettingSvgIcon = defineAsyncComponent(() => import("../assets/icons/setting-svg-icon.vue"));
</script>

<template>
    <nav class="navbar navbar-header navbar-expand navbar-light">
        <MenuSvgIcon @click="sidebarStore.toggle()" />
        <ul class="navbar-nav d-flex align-items-center navbar-light ms-auto">
            <!-- Language Switcher -->
            <li class="nav-item me-3">
                <LanguageSwitcher />
            </li>
            <div class="top-nav-item position-relative">
                <span @click="userDropDown = !userDropDown">
                    <UserSvgIcon width="25px" height="25px" />
                </span>
                <div v-if="userDropDown" class="top-nav-dropdown">
                    <a class="top-nav-dropdown-item" href="/logout">
                        <LogoutSvgIcon
                            width="16px"
                            height="16px"
                            color="currentColor"
                        />
                        <span class="ms-2">{{ t('general.logout') }}</span>
                    </a>
                    <!-- <a class="top-nav-dropdown-item" href="/logout">
                        <SettingSvgIcon
                            width="16px"
                            height="16px"
                            color="currentColor"
                        />
                        <span class="ms-2">{{ t('general.profile_setting') }}</span>
                    </a> -->
                </div>
            </div>
        </ul>
    </nav>
</template>

<style scoped>
.top-nav-dropdown {
    position: absolute;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 1px 1px 76px rgba(214, 208, 208, 0.479);
    top: 120%;
    right: 0px;
    z-index: 4;
    width: max-content;
}
.top-nav-dropdown-item {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    background-color: white;
    color: #757779;
    width: 100%;
}
.top-nav-dropdown-item:hover {
    background-color: #2ba8f3;
    color: white;
}
</style>
