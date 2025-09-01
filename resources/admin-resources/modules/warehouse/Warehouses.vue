<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useWarehouseStore } from "./warehouseStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddWarehouse from "./AddWarehouse.vue";
import EditWarehouse from "./EditWarehouse.vue";
import ViewWarehouse from "./ViewWarehouse.vue";
import { useI18n } from "../../composables/useI18n.js";

const loading = ref(false);
const filterTab = ref(true);
const showAddWarehouse = ref(false);
const showEditWarehouse = ref(false);
const showViewWarehouse = ref(false);

const warehouseStore = useWarehouseStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const warehouses = computed(() => warehouseStore.warehouses);
const { t } = useI18n();
const q_name = ref("");
const selected_warehouses = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'name',
        label: t('general.name'),
        hiddenOnMobile: false
    },
    {
        key: 'email',
        label: t('general.email'),
        hiddenOnMobile: true
    },
    {
        key: 'phone',
        label: t('general.phone'),
        hiddenOnMobile: false
    },
    {
        key: 'address',
        label: t('general.address'),
        hiddenOnMobile: true
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_warehouses.value = selectedIds;
    all_selectd.value = selectedIds.length === warehouses.value.length && warehouses.value.length > 0;
}

function select_all() {
    if (all_selectd.value == false) {
        selected_warehouses.value = [];
        warehouseStore.warehouses.forEach((element) => {
            selected_warehouses.value.push(element.id);
        });
        all_selectd.value = true;
    } else {
        all_selectd.value = false;
        selected_warehouses.value = [];
    }
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.confirm_delete', { item: 'warehouse' }) })
        .then(async () => {
            if (confirmStore.do_action == true) {
                warehouseStore.deleteWarehouse(id).then(() => {
                    warehouseStore.fetchWarehouses(
                        warehouseStore.current_page,
                        warehouseStore.per_page,
                        warehouseStore.q_name
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_warehouses.value = [];
                    }
                });
            }
        });
}

function openEditWarehouseModal(id) {
    warehouseStore.edit_warehouse_id = id;
    showEditWarehouse.value = true;
}

function openViewWarehouseModal(id) {
    warehouseStore.view_warehouse_id = id;
    showViewWarehouse.value = true;
}

async function fetchData(
    page = warehouseStore.current_page,
    per_page = warehouseStore.per_page,
    q_name = warehouseStore.q_name
) {
    loading.value = true;

    all_selectd.value = false;
    selected_warehouses.value = [];

    try {
        warehouseStore
            .fetchWarehouses(page, per_page, q_name)
            .then((response) => {
                loading.value = false;
            });
    } catch (error) {
        // console.log(error);
        loading.value = false;
    }
}

onMounted(() => {
    fetchData(1);
});
</script>

<template>
    <div v-if="authStore.userCan('view_warehouse')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('warehouses.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_warehouses.length > 0 &&
                        authStore.userCan('delete_warehouse')
                    "
                    @click="deleteData(selected_warehouses)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_warehouse')"
                    @click="showAddWarehouse = true"
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
                            :placeholder="t('warehouses.placeholder.name')"
                            v-model="q_name"
                            @keyup="
                                fetchData(1, warehouseStore.per_page, q_name)
                            "
                        />
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="warehouses"
            :columns="tableColumns"
            :selected-items="selected_warehouses"
            :has-selection="authStore.userCan('delete_warehouse')"
            :has-actions="true"
            :actions-label="t('general.action')"
            id-key="id"
            primary-column-key="id"
            title-column-key="name"
            :mobile-visible-fields="3"
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
                    @click="openViewWarehouseModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_warehouse')"
                    color="#739EF1"
                    @click="openEditWarehouseModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_warehouse')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        
        <div class="pagination-container" v-if="loading == false && warehouses.length > 0">
            <Pagination
                :total_pages="warehouseStore.total_pages"
                :current_page="warehouseStore.current_page"
                :per_page="warehouseStore.per_page"
                @pageChange="
                    (currentPage) => fetchData(currentPage, warehouseStore.per_page)
                "
                @perPageChange="(perpage) => fetchData(1, perpage)"
            />
        </div>
        
        <div class="modals-container">
            <AddWarehouse
                v-if="showAddWarehouse"
                @close="showAddWarehouse = false"
                @refreshData="fetchData(1)"
            />
            <EditWarehouse
                v-if="showEditWarehouse"
                :warehouse_id="warehouseStore.edit_warehouse_id"
                @close="showEditWarehouse = false"
                @refreshData="fetchData(warehouseStore.current_page)"
            />
            <ViewWarehouse
                v-if="showViewWarehouse"
                :warehouse_id="warehouseStore.view_warehouse_id"
                @close="showViewWarehouse = false"
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

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}

.rtl .card-subtitle {
    text-align: right;
}
</style>