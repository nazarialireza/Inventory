<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useSupplierStore } from "./supplierStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddSupplier from "./AddSupplier.vue";
import EditSupplier from "./EditSupplier.vue";
import ViewSupplier from "./ViewSupplier.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddSupplier = ref(false);
const showEditSupplier = ref(false);
const showViewSupplier = ref(false);

const { t } = useI18n();
const supplierStore = useSupplierStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const suppliers = computed(() => supplierStore.suppliers);
const q_name = ref("");
const selected_suppliers = ref([]);
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
        hiddenOnMobile: false
    },
    {
        key: 'purchase_due',
        label: t('suppliers.purchase_due'),
        hiddenOnMobile: true,
        cellClass: 'currency-value'
    },
    {
        key: 'purchase_return_due',
        label: t('suppliers.purchase_return_due'),
        hiddenOnMobile: true,
        cellClass: 'currency-value'
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_suppliers.value = selectedIds;
    all_selectd.value = selectedIds.length === suppliers.value.length && suppliers.value.length > 0;
}

async function fetchData(
    page = supplierStore.current_page,
    per_page = supplierStore.per_page,
    q_name = supplierStore.q_name,
    q_status = supplierStore.q_status
) {
    loading.value = true;

    all_selectd.value = false;
    selected_suppliers.value = [];

    try {
        supplierStore
            .fetchSuppliers(page, per_page, q_name, q_status)
            .then((response) => {
                loading.value = false;
            });
    } catch (error) {
        loading.value = false;
    }
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.delete_confirmation') })
        .then(async () => {
            if (confirmStore.do_action == true) {
                supplierStore.deleteSupplier(id).then(() => {
                    supplierStore.fetchSuppliers(
                        supplierStore.current_page,
                        supplierStore.per_page,
                        supplierStore.q_name,
                        supplierStore.q_status
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_suppliers.value = [];
                    }
                });
            }
        });
}

function openEditSupplierModal(id) {
    supplierStore.edit_supplier_id = id;
    showEditSupplier.value = true;
}

function openViewSupplierModal(id) {
    supplierStore.view_supplier_id = id;
    showViewSupplier.value = true;
}

onMounted(() => {
    fetchData(1);
});
</script>

<template>
    <div v-if="authStore.userCan('view_supplier')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('suppliers.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_suppliers.length > 0 &&
                        authStore.userCan('delete_supplier')
                    "
                    @click="deleteData(selected_suppliers)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_supplier')"
                    @click="showAddSupplier = true"
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
                            :placeholder="t('general.search_placeholder')"
                            v-model="q_name"
                            @keyup="
                                fetchData(1, supplierStore.per_page, q_name)
                            "
                        />
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="suppliers"
            :columns="tableColumns"
            :selected-items="selected_suppliers"
            :has-selection="authStore.userCan('delete_supplier')"
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
            <!-- Mobile card header -->
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
                    @click="openViewSupplierModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_supplier')"
                    color="#739EF1"
                    @click="openEditSupplierModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_supplier')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        <Pagination
            v-if="loading == false && suppliers.length > 0"
            :total_pages="supplierStore.total_pages"
            :current_page="supplierStore.current_page"
            :per_page="supplierStore.per_page"
            @pageChange="
                (currentPage) => fetchData(currentPage, supplierStore.per_page)
            "
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddSupplier
                v-if="showAddSupplier"
                @close="showAddSupplier = false"
                @refreshData="fetchData(1)"
            />
            <EditSupplier
                v-if="showEditSupplier"
                :supplier_id="supplierStore.edit_supplier_id"
                @close="showEditSupplier = false"
                @refreshData="fetchData(supplierStore.current_page)"
            />
            <ViewSupplier
                v-if="showViewSupplier"
                :supplier_id="supplierStore.view_supplier_id"
                @close="showViewSupplier = false"
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

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}

.rtl .card-subtitle {
    text-align: right;
}
</style>