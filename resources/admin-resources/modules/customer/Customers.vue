<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useCustomerStore } from "./customerStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddCustomer from "./AddCustomer.vue";
import EditCustomer from "./EditCustomer.vue";
import ViewCustomer from "./ViewCustomer.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddCustomer = ref(false);
const showEditCustomer = ref(false);
const showViewCustomer = ref(false);

const customerStore = useCustomerStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const customers = computed(() => customerStore.customers);
const { t } = useI18n();
const q_name = ref("");
const selected_customers = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'name',
        label: t('general.name'),
        hiddenOnMobile: false
    },
    {
        key: 'phone',
        label: t('general.phone'),
        hiddenOnMobile: false
    },
    {
        key: 'email',
        label: t('general.email'),
        hiddenOnMobile: true
    },
    {
        key: 'sale_due',
        label: t('customers.sale_due'),
        hiddenOnMobile: false,
        cellClass: 'currency-value',
        formatter: (value) => value ? `$${value}` : '$0.00'
    },
    {
        key: 'sale_return_due',
        label: t('customers.sale_return_due'),
        hiddenOnMobile: true,
        cellClass: 'currency-value',
        formatter: (value) => value ? `$${value}` : '$0.00'
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_customers.value = selectedIds;
    all_selectd.value = selectedIds.length === customers.value.length && customers.value.length > 0;
}

async function fetchData(
    page = customerStore.current_page,
    per_page = customerStore.per_page,
    q_name = customerStore.q_name,
    q_status = customerStore.q_status
) {
    loading.value = true;

    all_selectd.value = false;
    selected_customers.value = [];

    try {
        customerStore
            .fetchCustomers(page, per_page, q_name, q_status)
            .then((response) => {
                loading.value = false;
            });
    } catch (error) {
        loading.value = false;
    }
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.confirm_delete', { item: 'customer' }) })
        .then(async () => {
            if (confirmStore.do_action == true) {
                customerStore.deleteCustomer(id).then(() => {
                    customerStore.fetchCustomers(
                        customerStore.current_page,
                        customerStore.per_page,
                        customerStore.q_name,
                        customerStore.q_status
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_customers.value = [];
                    }
                });
            }
        });
}

function openEditCustomerModal(id) {
    customerStore.edit_customer_id = id;
    showEditCustomer.value = true;
}

function openViewCustomerModal(id) {
    customerStore.view_customer_id = id;
    showViewCustomer.value = true;
}

onMounted(() => {
    fetchData(1);
});
</script>

<template>
    <div v-if="authStore.userCan('view_customer')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('customers.customer_list') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_customers.length > 0 &&
                        authStore.userCan('delete_customer')
                    "
                    @click="deleteData(selected_customers)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_customer')"
                    @click="showAddCustomer = true"
                />
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
                            :placeholder="t('customers.placeholder.name')"
                            v-model="q_name"
                            @keyup="
                                fetchData(1, customerStore.per_page, q_name)
                            "
                        />
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        
        <ResponsiveDataTable
            v-if="loading == false"
            :data="customers"
            :columns="tableColumns"
            :selected-items="selected_customers"
            :has-selection="authStore.userCan('delete_customer')"
            :has-actions="true"
            :actions-label="t('general.action')"
            id-key="id"
            primary-column-key="id"
            title-column-key="name"
            :mobile-visible-fields="3"
            :view-more-text="t('general.view') + ' ' + t('general.details')"
            :view-less-text="t('general.close')"
            @selection-change="onSelectionChange"
        >
            <!-- Custom cell renderers -->
            <template #cell-phone="{ item }">
                <a :href="`tel:${item.phone}`" class="phone-link">
                    {{ item.phone || '--' }}
                </a>
            </template>

            <template #cell-email="{ item }">
                <a :href="`mailto:${item.email}`" class="email-link">
                    {{ item.email || '--' }}
                </a>
            </template>

            <!-- Mobile card header customization -->
            <template #card-header="{ item }">
                <div class="card-title-mobile">
                    {{ item.name }}
                </div>
                <div class="card-subtitle" v-if="item.phone">
                    {{ item.phone }}
                </div>
            </template>

            <!-- Action buttons -->
            <template #actions="{ item }">
                <ViewSvgIcon 
                    color="#00CFDD" 
                    @click="openViewCustomerModal(item.id)" 
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_customer')"
                    color="#739EF1"
                    @click="openEditCustomerModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_customer')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        
        <div class="pagination-container" v-if="loading == false && customers.length > 0">
            <Pagination
                :total_pages="customerStore.total_pages"
                :current_page="customerStore.current_page"
                :per_page="customerStore.per_page"
                @pageChange="
                    (currentPage) => fetchData(currentPage, customerStore.per_page)
                "
                @perPageChange="(perpage) => fetchData(1, perpage)"
            />
        </div>
        
        <div class="modals-container">
            <AddCustomer
                v-if="showAddCustomer"
                @close="showAddCustomer = false"
                @refreshData="fetchData(1)"
            />
            <EditCustomer
                v-if="showEditCustomer"
                :customer_id="customerStore.edit_customer_id"
                @close="showEditCustomer = false"
                @refreshData="fetchData(customerStore.current_page)"
            />
            <ViewCustomer
                v-if="showViewCustomer"
                :customer_id="customerStore.view_customer_id"
                @close="showViewCustomer = false"
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

.phone-link {
    color: #059669;
    text-decoration: none;
    font-weight: 500;
}

.phone-link:hover {
    color: #047857;
    text-decoration: underline;
}

.email-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
}

.email-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.currency-value {
    font-weight: 500;
    color: #059669;
}

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}

.rtl .card-subtitle {
    text-align: right;
}
</style>
