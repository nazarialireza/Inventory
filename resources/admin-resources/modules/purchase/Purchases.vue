<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import WalletSvgIcon from "../../assets/icons/wallet-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddPayment from "../payment/AddPayment.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);

const { t } = useI18n();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const purchases = ref([]);
const search = ref("");
const per_page = ref(10);
const total_pages = ref(1);
const current_page = ref(1);
const selected_purchases = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'invoice_date',
        label: t('purchases.date'),
        hiddenOnMobile: false
    },
    {
        key: 'invoice_ref',
        label: t('purchases.reference'),
        hiddenOnMobile: false
    },
    {
        key: 'supplier',
        label: t('purchases.supplier'),
        hiddenOnMobile: false
    },
    {
        key: 'warehouse',
        label: t('purchases.warehouse'),
        hiddenOnMobile: true
    },
    {
        key: 'total_amount',
        label: t('purchases.total'),
        hiddenOnMobile: false,
        cellClass: 'currency-value'
    },
    {
        key: 'paid_amount',
        label: t('purchases.paid'),
        hiddenOnMobile: true,
        cellClass: 'currency-value'
    },
    {
        key: 'due_amount',
        label: t('purchases.due'),
        hiddenOnMobile: false,
        cellClass: 'currency-value'
    },
    {
        key: 'invoice_status',
        label: t('purchases.purchase_status'),
        hiddenOnMobile: true
    },
    {
        key: 'payment_status',
        label: t('purchases.payment_status'),
        hiddenOnMobile: false
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_purchases.value = selectedIds;
    // Note: Purchases component doesn't currently support bulk selection in the original code
}

async function fetchData(
    page = current_page.value,
    perPage = per_page.value,
    search_string = search.value
) {
    loading.value = true;
    await axios
        .get(
            `/api/purchases?search=${search_string}&per_page=${perPage}&page=${page}`
        )
        .then((response) => {
            purchases.value = response.data.data;
            loading.value = false;
            total_pages.value = response.data.meta.last_page;
            per_page.value = perPage;
            current_page.value = page;
            //search.value = search_string;
        })
        .catch((errors) => {
            loading.value = false;
            console.log(errors);
        });
    all_selectd.value = false;
    selected_purchases.value = [];
}

let showPaymentModal = ref(false)

let paymentInfo = reactive({
    invoice_id : '',
    due_amount: ''
})

function openPaymentModal(invoice_id,due_amount) {
    showPaymentModal.value = true;
    paymentInfo.invoice_id = invoice_id;
    paymentInfo.due_amount = due_amount;
}

// Format status badges for mobile view
function formatInvoiceStatus(status) {
    return t(`purchases.${status}`);
}

function formatPaymentStatus(status) {
    return t(`payments.${status}`);
}

onMounted(() => {
    fetchData(1);
});
</script>

<template>
    <div v-if="authStore.userCan('view_purchase')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('purchases.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_purchases.length > 0 &&
                        authStore.userCan('delete_purchase')
                    "
                    @click="deleteData(selected_purchases)"
                />
                <AddNewButton @click="$router.push({ name: 'new_purchase' })" />
                <FilterButton @click="filterTab = !filterTab" />
            </div>
        </div>
        <div class="p-1 my-2" v-if="filterTab">
            <div class="row">
                <div class="col-md-3 col-sm-6 my-1">
                    <div class="input-group">
                        <input
                            type="text"
                            class="form-control"
                            :placeholder="t('purchases.search_reference')"
                            v-model="search"
                            @keyup="fetchData(1, per_page, search)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="purchases"
            :columns="tableColumns"
            :selected-items="selected_purchases"
            :has-selection="false"
            :has-actions="true"
            :actions-label="t('general.action')"
            id-key="id"
            primary-column-key="invoice_ref"
            title-column-key="supplier"
            :mobile-visible-fields="4"
            :view-more-text="t('general.view') + ' ' + t('general.details')"
            :view-less-text="t('general.close')"
            @selection-change="onSelectionChange"
        >
            <!-- Custom cell renderers -->
            <template #cell-invoice_status="{ item }">
                <span
                    class="badge-sqaure text-capitalize"
                    :class="[
                        item.invoice_status == 'received'
                            ? 'btn-outline-success'
                            : '',
                        item.invoice_status == 'ordered'
                            ? 'btn-outline-primary'
                            : '',
                        item.invoice_status == 'pending'
                            ? 'btn-outline-danger'
                            : '',
                    ]"
                >
                    {{ t(`purchases.${item.invoice_status}`) }}
                </span>
            </template>

            <template #cell-payment_status="{ item }">
                <span
                    class="badge py-1 px-2 text-capitalize"
                    :class="[
                        item.payment_status == 'paid'
                            ? 'bg-success'
                            : '',
                        item.payment_status == 'unpaid'
                            ? 'bg-danger'
                            : '',
                        item.payment_status == 'partial'
                            ? 'bg-primary'
                            : '',
                    ]"
                >
                    {{ t(`payments.${item.payment_status}`) }}
                </span>
            </template>

            <!-- Mobile card header -->
            <template #card-header="{ item }">
                <div class="card-title-mobile">
                    {{ item.supplier }}
                </div>
                <div class="card-subtitle">
                    {{ item.invoice_ref }} - {{ item.invoice_date }}
                </div>
            </template>

            <!-- Action buttons -->
            <template #actions="{ item }">
                <WalletSvgIcon
                    v-if="authStore.userCan('create_payment')"
                    @click="openPaymentModal(item.id,item.due_amount)"
                />
            </template>
        </ResponsiveDataTable>
        <Pagination
            v-if="loading == false && purchases.length > 0"
            :total_pages="total_pages"
            :current_page="current_page"
            :per_page="per_page"
            @pageChange="(currentPage) => fetchData(currentPage, per_page)"
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddPayment
                v-if="showPaymentModal"
                :invoice_id="paymentInfo.invoice_id"
                :due_amount="paymentInfo.due_amount"
                @close="showPaymentModal = false"
                @refreshData="fetchData(current_page, per_page)"
            />
        </div>
    </div>
</template>

<style scoped>
.card-title-mobile {
    font-weight: 600;
    font-size: 16px;
    color: #111827;
    margin-bottom: 4px;
}

.card-subtitle {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.currency-value {
    font-weight: 500;
    color: #059669;
}

.number-value {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-weight: 500;
}

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}

.rtl .card-subtitle {
    text-align: right;
}
</style>