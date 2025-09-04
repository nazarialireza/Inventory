<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import Loader from "../../components/shared/loader/Loader.vue";
import axios from "axios";
import CartSvgIcon from "../../assets/icons/cart-svg-icon.vue";
import BegSvgIcon from "../../assets/icons/beg-svg-icon.vue";
import WalletSvgIcon from "../../assets/icons/wallet-svg-icon.vue";
import CoinSvgIcon from "../../assets/icons/coin-1-svg-icon.vue";
import twentyfourSVGICon from "../../assets/icons/twentyfour-svg-icon.vue";
import HandLoveSVGICon from "../../assets/icons/hand-love-svg-icon.vue";
import VueApexCharts from "vue3-apexcharts";
import { useI18n } from "../../composables/useI18n.js";

const loading = ref(false);
const data = ref({});
const { t, isCurrentLocaleRTL } = useI18n();

// Chart references
const weeklySalePurchaseChartRef = ref(null);
const weeklyPaymentChartRef = ref(null);
const topSellingProductChartRef = ref(null);

// Computed property to check if we're in RTL mode
const isRTL = computed(() => isCurrentLocaleRTL.value);
console.log('check if we are in RTL mode '+isRTL.value);

// Initialize chart configurations with proper RTL support
let weeklySalePurchaseChartData = ref({
    chartOptions: {
        title: {
            text: t("dashboard.weekly_sale_purchase"),
            align: "center",
            style: { color: "#475f7b" },
            offsetX: 0,
            offsetY: 0,
        },
        chart: { 
            id: "weeklySalePurchase",
            locales: [
                {
                    name: isRTL.value ? 'prs' : 'en',
                    options: {
                        toolbar: {
                            exportToSVG: isRTL.value ? 'دانلود SVG' : 'Download SVG',
                            exportToPNG: isRTL.value ? 'دانلود PNG' : 'Download PNG',
                            exportCSV: isRTL.value ? 'دانلود CSV' : 'Download CSV',
                            menu: isRTL.value ? 'منو' : 'Menu',
                        }
                    }
                }
            ],
            defaultLocale: isRTL.value ? 'prs' : 'en',
            fontFamily: 'Poppins, sans-serif',
        },
        xaxis: { 
            categories: [],
            labels: {
                style: {
                    cssClass: isRTL.value ? 'rtl-text' : '',
                    fontFamily: 'Poppins, sans-serif'
                }
            }
        },
        yaxis: {
            labels: {
                align: isRTL.value ? 'right' : 'left',
                offsetX: isRTL.value ? -10 : 0,
                style: {
                    cssClass: isRTL.value ? 'rtl-text' : '',
                    fontFamily: 'Poppins, sans-serif'
                }
            }
        },
        dataLabels: { enabled: false },
        colors: ["#41b1f9", "#3366CC"],
        legend: {
            show: false, 
            horizontalAlign: isRTL.value ? "right" : "left",
            position: isRTL.value ? "top" : "top",
        },
        tooltip: {
            style: {
                fontFamily: 'Poppins, sans-serif'
            }
        }
    },
    series: [
        { name: t("dashboard.sale"), data: [] },
        { name: t("dashboard.purchase"), data: [] },
    ],
});

let topSellingProductChartData = ref({
    chartOptions: {
        title: {
            text: t("dashboard.top_selling_products"),
            align: "center", // Use center alignment to fix positioning issues
            style: { color: "#475f7b" },
            offsetX: 0,
            offsetY: 0,
        },
        chart: { 
            id: "topSellingProduct",
            locales: [
                {
                    name: isRTL.value ? 'prs' : 'en',
                    options: {
                        toolbar: {
                            exportToSVG: isRTL.value ? 'دانلود SVG' : 'Download SVG',
                            exportToPNG: isRTL.value ? 'دانلود PNG' : 'Download PNG',
                            exportCSV: isRTL.value ? 'دانلود CSV' : 'Download CSV',
                            menu: isRTL.value ? 'منو' : 'Menu',
                        }
                    }
                }
            ],
            defaultLocale: isRTL.value ? 'prs' : 'en',
            fontFamily: 'Poppins, sans-serif',
        },
        labels: [],
        dataLabels: { 
            enabled: true,
            style: {
                fontFamily: 'Poppins, sans-serif'
            }
        },
        colors: ["#41b1f9", "#8390FA", "#3366CC"],
        legend: {
            show: false,
            position: "bottom",
            horizontalAlign: isRTL.value ? "right" : "left",
        },
        tooltip: {
            style: {
                fontFamily: 'Poppins, sans-serif'
            }
        }
    },
    series: [],
});

let weeklyPaymentChartData = ref({
    chartOptions: {
        title: {
            text: t("dashboard.payment_send_received_week"),
            align: "center", // Use center alignment to fix positioning issues
            style: { color: "#475f7b" },
            offsetX: 0,
            offsetY: 0,
        },
        chart: {
            id: "weeklyPayment",
            zoom: { enabled: false },
            selection: { enabled: false },
            locales: [
                {
                    name: isRTL.value ? 'prs' : 'en',
                    options: {
                        toolbar: {
                            exportToSVG: isRTL.value ? 'دانلود SVG' : 'Download SVG',
                            exportToPNG: isRTL.value ? 'دانلود PNG' : 'Download PNG',
                            exportCSV: isRTL.value ? 'دانلود CSV' : 'Download CSV',
                            menu: isRTL.value ? 'منو' : 'Menu',
                        }
                    }
                }
            ],
            defaultLocale: isRTL.value ? 'prs' : 'en',
            fontFamily: 'Poppins, sans-serif',
        },
        xaxis: { 
            categories: [],
            labels: {
                style: {
                    cssClass: isRTL.value ? 'rtl-text' : '',
                    fontFamily: 'Poppins, sans-serif'
                }
            }
        },
        yaxis: {
            labels: {
                align: isRTL.value ? 'right' : 'left',
                offsetX: isRTL.value ? -10 : 0,
                style: {
                    cssClass: isRTL.value ? 'rtl-text' : '',
                    fontFamily: 'Poppins, sans-serif'
                }
            }
        },
        dataLabels: { enabled: false },
        colors: ["#41b1f9", "#3366CC"],
        stroke: {
            curve: "smooth",
        },
        markers: {
            size: 6,
        },
        legend: {
            show: false,
            horizontalAlign: isRTL.value ? "right" : "left",
            position: isRTL.value ? "top" : "top",
        },
        tooltip: {
            style: {
                fontFamily: 'Poppins, sans-serif'
            }
        }
    },
    series: [
        { name: t("dashboard.payment_send"), data: [] },
        { name: t("dashboard.payment_received"), data: [] },
    ],
});

// Watch for RTL changes and update chart options
function updateChartOptionsForRTL() {
    // Update weekly sale/purchase chart
    if (weeklySalePurchaseChartRef.value) {
        weeklySalePurchaseChartRef.value.updateOptions({
            title: {
                text: t("dashboard.weekly_sale_purchase"),
                align: "center",
            },
            chart: {
                locales: [
                    {
                        name: isRTL.value ? 'prs' : 'en',
                        options: {
                            toolbar: {
                                exportToSVG: isRTL.value ? 'دانلود SVG' : 'Download SVG',
                                exportToPNG: isRTL.value ? 'دانلود PNG' : 'Download PNG',
                                exportCSV: isRTL.value ? 'دانلود CSV' : 'Download CSV',
                                menu: isRTL.value ? 'منو' : 'Menu',
                            }
                        }
                    }
                ],
                defaultLocale: isRTL.value ? 'prs' : 'en'
            },
            yaxis: {
                labels: {
                    align: isRTL.value ? 'right' : 'left',
                    offsetX: isRTL.value ? -10 : 0
                }
            }
        });
    }
    
    // Update weekly payment chart
    if (weeklyPaymentChartRef.value) {
        weeklyPaymentChartRef.value.updateOptions({
            title: {
                text: t("dashboard.payment_send_received_week"),
                align: "center" // Keep center alignment
            },
            chart: {
                locales: [
                    {
                        name: isRTL.value ? 'prs' : 'en',
                        options: {
                            toolbar: {
                                exportToSVG: isRTL.value ? 'دانلود SVG' : 'Download SVG',
                                exportToPNG: isRTL.value ? 'دانلود PNG' : 'Download PNG',
                                exportCSV: isRTL.value ? 'دانلود CSV' : 'Download CSV',
                                menu: isRTL.value ? 'منو' : 'Menu',
                            }
                        }
                    }
                ],
                defaultLocale: isRTL.value ? 'prs' : 'en'
            },
            legend: {
                horizontalAlign: isRTL.value ? "right" : "left"
            },
            yaxis: {
                labels: {
                    align: isRTL.value ? 'right' : 'left',
                    offsetX: isRTL.value ? -10 : 0
                }
            }
        });
    }
    
    // Update top selling products chart
    if (topSellingProductChartRef.value) {
        topSellingProductChartRef.value.updateOptions({
            title: {
                text: t("dashboard.top_selling_products"),
                align: "center" // Keep center alignment
            },
            chart: {
                locales: [
                    {
                        name: isRTL.value ? 'prs' : 'en',
                        options: {
                            toolbar: {
                                exportToSVG: isRTL.value ? 'دانلود SVG' : 'Download SVG',
                                exportToPNG: isRTL.value ? 'دانلود PNG' : 'Download PNG',
                                exportCSV: isRTL.value ? 'دانلود CSV' : 'Download CSV',
                                menu: isRTL.value ? 'منو' : 'Menu',
                            }
                        }
                    }
                ],
                defaultLocale: isRTL.value ? 'prs' : 'en'
            },
        });
    }
}

// Watch for language changes
watch(() => isCurrentLocaleRTL.value, () => {
    nextTick(() => {
        updateChartOptionsForRTL();
    });
});

// Watch for translation changes
watch(t, () => {
    nextTick(() => {
        updateChartOptionsForRTL();
    });
}, { deep: true });

async function fetchData() {
    loading.value = true;
    await axios
        .get(`/api/dashboard-report`)
        .then((response) => {
            data.value = response.data;

            // weekly sale and purchase data
            weeklySalePurchaseChartData.value.chartOptions.xaxis.categories = [
                ...new Set(
                    response.data.current_week_sales
                        .map((sale) => sale.date)
                        .concat(
                            response.data.current_week_purchases.map(
                                (purchase) => purchase.date
                            )
                        )
                ),
            ];
            weeklySalePurchaseChartData.value.series[0].data =
                response.data.current_week_sales.map((sale) =>
                    sale.amount.toFixed(0)
                );
            weeklySalePurchaseChartData.value.series[1].data =
                response.data.current_week_purchases.map((purchase) =>
                    purchase.amount.toFixed(0)
                );

            // top selling products data
            topSellingProductChartData.value.series =
                response.data.top_selling_products.map(
                    (product) => product.total_quantity_sold
                );
            topSellingProductChartData.value.chartOptions.labels =
                response.data.top_selling_products.map((product) =>
                    product.name.substring(0, 12)
                );

            // payments current week
            weeklyPaymentChartData.value.chartOptions.xaxis.categories = [
                ...new Set(
                    response.data.payment_send_current_week
                        .map((payment) => payment.date)
                        .concat(
                            response.data.payment_received_current_week.map(
                                (payment) => payment.date
                            )
                        )
                ),
            ];
            weeklyPaymentChartData.value.series[0].data =
                response.data.payment_send_current_week.map((payment) =>
                    payment.amount.toFixed(0)
                );
            weeklyPaymentChartData.value.series[1].data =
                response.data.payment_received_current_week.map((payment) =>
                    payment.amount.toFixed(0)
                );

            loading.value = false;
            
            // Update chart options for RTL after data is loaded
            nextTick(() => {
                updateChartOptionsForRTL();
            });
        })
        .catch((errors) => {
            console.log("fetch chart data is not possible errors: " + errors);
            loading.value = false;
        });
}

onMounted(() => {
    // Initialize charts with correct language settings
    nextTick(() => {
        updateChartOptionsForRTL();
        fetchData();
    });
});
</script>

<template>
    <div class="dashboard-page">
        <Loader v-if="loading" />
        <div class="dashboard-page-contents mx-2" v-if="loading == false">
            <div class="dashboard-top-stats row flex-wrap">
                <div class="col-md-3 col-sm-6 my-1 p-1 min150">
                    <div
                        class="bg-white shadow d-flex flex-wrap rounded-3 p-3 align-items-start"
                    >
                        <div class="bg-info p-3 rounded-3 me-4 shadow">
                            <CartSvgIcon color="white" width="28" height="28" />
                        </div>
                        <div class="my-2">
                            <span class="top-stats-value">{{
                                data.total_sale_amount
                                    ? data.total_sale_amount.toFixed(0)
                                    : 0
                            }}</span
                            ><br /><span>{{ t('dashboard.total_sale') }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 my-1 p-1 min150">
                    <div
                        class="bg-white shadow d-flex flex-wrap rounded-3 p-3 align-items-start shadow"
                    >
                        <div class="bg-info p-3 rounded-3 me-4">
                            <BegSvgIcon color="white" width="28" height="28" />
                        </div>
                        <div class="my-2">
                            <span class="top-stats-value">{{
                                data.total_purchase_amount
                                    ? data.total_purchase_amount.toFixed(0)
                                    : 0
                            }}</span
                            ><br /><span>{{ t('dashboard.total_purchase') }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 my-1 p-1 min150">
                    <div
                        class="bg-white shadow d-flex flex-wrap rounded-3 p-3 align-items-start shadow"
                    >
                        <div class="bg-info p-3 rounded-3 me-4">
                            <WalletSvgIcon
                                color="white"
                                width="28"
                                height="28"
                            />
                        </div>
                        <div class="my-2">
                            <span class="top-stats-value">{{
                                data.total_sale_due
                                    ? data.total_sale_due.toFixed(0)
                                    : 0
                            }}</span
                            ><br /><span>{{ t('dashboard.total_sale_due') }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 my-1 p-1 min150">
                    <div
                        class="bg-white shadow d-flex flex-wrap rounded-3 p-3 align-items-start shadow"
                    >
                        <div class="bg-info p-3 rounded-3 me-4">
                            <CoinSvgIcon color="white" width="28" height="28" />
                        </div>
                        <div class="my-2">
                            <span class="top-stats-value">{{
                                data.total_purchase_due
                                    ? data.total_purchase_due.toFixed(0)
                                    : 0
                            }}</span
                            ><br /><span>{{ t('dashboard.total_purchase_due') }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard-charts my-3 row">
                <div class="col-md-8 p-1">
                    <VueApexCharts
                        ref="weeklySalePurchaseChartRef"
                        class="bg-white shadow px-1 py-3 rounded-2"
                        width="100%"
                        height="350"
                        type="bar"
                        :options="weeklySalePurchaseChartData.chartOptions"
                        :series="weeklySalePurchaseChartData.series"
                    />
                </div>
                <div class="col-md-4 p-1">
                    <VueApexCharts
                        ref="topSellingProductChartRef"
                        class="bg-white shadow px-1 py-3 rounded-5"
                        style="height: 100%"
                        width="100%"
                        type="donut"
                        height="350"
                        :options="topSellingProductChartData.chartOptions"
                        :series="topSellingProductChartData.series"
                    />
                </div>
            </div>
            <div class="dashboard-charts my-3 row">
                <div class="col-md-12 p-1">
                    <VueApexCharts
                        ref="weeklyPaymentChartRef"
                        class="bg-white shadow px-1 py-3 rounded-2"
                        width="100%"
                        height="350"
                        type="line"
                        :options="weeklyPaymentChartData.chartOptions"
                        :series="weeklyPaymentChartData.series"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.dashboard-top-stats > *>*{
    height: 100%;
}
.top-stats-value{
    font-size: 20px;
    font-weight: 600;
    color:#475f7b;
}

/* RTL support for chart text */
.rtl-text {
    direction: rtl;
    text-align: right;
    font-family: 'Poppins', sans-serif;
}

/* Fix for chart legend alignment in RTL */
.rtl .apexcharts-legend {
    direction: rtl;
    text-align: right;
}

/* Fix for chart tooltip in RTL */
.rtl .apexcharts-tooltip {
    direction: rtl;
    text-align: right;
}

/* Fix for chart data labels in RTL */
.rtl .apexcharts-datalabels {
    direction: rtl;
}

/* Fix for chart axis labels in RTL */
.rtl .apexcharts-xaxis-label,
.rtl .apexcharts-yaxis-label {
    direction: rtl;
    text-align: right;
}

/* Ensure proper text rendering in charts */
.apexcharts-text {
    font-family: 'Poppins', sans-serif !important;
}
</style>
