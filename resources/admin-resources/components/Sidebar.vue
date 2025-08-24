<script setup>
import { useRoute } from "vue-router";
import SideNavLink from "../components/SideNavLink.vue";
import crossSvgIcon from "../assets/icons/cross-svg-icon.vue";
import { ref, watch, computed } from "vue";
import { useSidebar } from "../stores/sidebar";
import { useI18n } from "../composables/useI18n";

const sidebarStore = useSidebar();
const route = useRoute();
const { t, currentLocale } = useI18n();

// Make navigation links reactive to language changes
const navlinks = computed(() => [
    {
        label: t("navigation.dashboard"),
        link: "/admin",
        icon_name: "dashboard-svg-icon",
        permission: "view_user",
    },

    {
        label: t("navigation.products"),
        link: " ",
        icon_name: "square-svg-icon",
        sub_links: [
            {
                label: t("navigation.product_list"),
                link: "/admin/product",
                permission: "view_product",
            },
            {
                label: t("navigation.category"),
                link: "/admin/product-category",
                permission: "view_product_category",
            },
            {
                label: t("navigation.brand"),
                link: "/admin/brand",
                permission: "view_brand",
            },
            {
                label: t("navigation.unit"),
                link: "/admin/unit",
                permission: "view_unit",
            },
        ],
    },

    {
        label: t("navigation.sales"),
        link: " ",
        icon_name: "cart-svg-icon",
        sub_links: [
            {
                label: t("navigation.sale_list"),
                link: "/admin/sale",
                permission: "view_sale",
            },
            {
                label: t("navigation.new_sale"),
                link: "/admin/new-sale",
                permission: "create_sale",
            },
        ],
    },

    {
        label: t("navigation.purchases"),
        link: "/admin/purchase",
        icon_name: "beg-svg-icon",
        sub_links: [
            {
                label: t("navigation.purchase_list"),
                link: "/admin/purchase",
                permission: "view_purchase",
            },
            {
                label: t("navigation.new_purchase"),
                link: "/admin/new-purchase",
                permission: "create_purchase",
            },
        ],
    },

    {
        label: t("navigation.customers"),
        link: "/admin/customer",
        icon_name: "customer-svg-icon",
        permission: "view_customer",
    },

    {
        label: t("navigation.suppliers"),
        link: "/admin/supplier",
        icon_name: "supplier-svg-icon",
        permission: "view_supplier",
    },

    {
        label: t("navigation.accounting"),
        link: " ",
        icon_name: "booklet-svg-icon",
        sub_links: [
            {
                label: t("navigation.account"),
                link: "/admin/account",
                permission: "view_account",
            },
            {
                label: t("navigation.balance_adjustment"),
                link: "/admin/account-adjustment",
                permission: "view_account_adjustment",
            },
        ],
    },

    {
        label: t("navigation.settings"),
        link: " ",
        icon_name: "setting-svg-icon",
        sub_links: [
            {
                label: t("navigation.warehouse"),
                link: "/admin/warehouse",
                permission: "view_warehouse",
            },
            {
                label: t("navigation.currency"),
                link: "/admin/currency",
                permission: "view_currency",
            },
            {
                label: t("navigation.tax"),
                link: "/admin/tax",
                permission: "view_tax",
            },
        ],
    },
]);
</script>

<template>
    <div id="sidebar" :class="{ active: sidebarStore.open }">
        <div class="sidebar-wrapper active">
            <div class="sidebar-header d-flex">
                <div>
                    <img
                        src="../assets/img/invextry-logo.png"
                        class="cursor-pointer img-fluid"
                        @click="$router.push({ name: 'dashboard' })"
                    />
                </div>
                <div class="small-screen-menu-icon ms-3">
                    <crossSvgIcon
                        width="25px"
                        height="25px"
                        @click="sidebarStore.toggle()"
                    />
                </div>
            </div>
            <div class="sidebar-menu">
                <ul class="menu">
                    <SideNavLink
                        v-for="(link, index) in navlinks"
                        :key="`${currentLocale}-${index}`"
                        :link_details="link"
                    />
                </ul>
            </div>
        </div>
    </div>
</template>
