<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useUnitStore } from "./unitStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddUnit from "./AddUnit.vue";
import EditUnit from "./EditUnit.vue";
import ViewUnit from "./ViewUnit.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddUnit = ref(false);
const showEditUnit = ref(false);
const showViewUnit = ref(false);

const unitStore = useUnitStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const units = computed(() => unitStore.units);
const { t } = useI18n();
const q_name = ref("");
const selected_units = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'name',
        label: t('general.name'),
        hiddenOnMobile: false
    },
    {
        key: 'short_name',
        label: t('units.short_name'),
        hiddenOnMobile: false
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_units.value = selectedIds;
    all_selectd.value = selectedIds.length === units.value.length && units.value.length > 0;
}

async function deleteData(id) {
    await confirmStore
        .show_box({ message: t('general.confirm_delete', { item: 'unit' }) })
        .then(async () => {
            if (confirmStore.do_action == true) {
                await unitStore.deleteUnit(id);
                if (Array.isArray(id)) {
                    all_selectd.value = false;
                    selected_units.value = [];
                }
            }
        });
}

function openEditUnitModal(id) {
    unitStore.edit_unit_id = id;
    showEditUnit.value = true;
}

function openViewUnitModal(id) {
    unitStore.view_unit_id = id;
    showViewUnit.value = true;
}

async function fetchData(
    page = unitStore.current_page,
    per_page = unitStore.per_page,
    q_name = unitStore.q_name
) {
    loading.value = true;

    all_selectd.value = false;
    selected_units.value = [];

    try {
        unitStore
            .fetchUnits(page, per_page, q_name)
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
    <div v-if="authStore.userCan('view_unit')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('units.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_units.length > 0 &&
                        authStore.userCan('delete_unit')
                    "
                    @click="deleteData(selected_units)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_unit')"
                    @click="showAddUnit = true"
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
                            :placeholder="t('units.placeholder.name')"
                            v-model="q_name"
                            @keyup="
                                fetchData(1, unitStore.per_page, q_name)
                            "
                        />
                        <label class="input-group-text">{{ t('general.search') }}</label>
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="units"
            :columns="tableColumns"
            :selected-items="selected_units"
            :has-selection="authStore.userCan('delete_unit')"
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
            </template>

            <!-- Action buttons -->
            <template #actions="{ item }">
                <ViewSvgIcon
                    color="#00CFDD"
                    @click="openViewUnitModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_unit')"
                    color="#739EF1"
                    @click="openEditUnitModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_unit')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        
        <div class="pagination-container" v-if="loading == false && units.length > 0">
            <Pagination
                :total_pages="unitStore.total_pages"
                :current_page="unitStore.current_page"
                :per_page="unitStore.per_page"
                @pageChange="
                    (currentPage) => fetchData(currentPage, unitStore.per_page)
                "
                @perPageChange="(perpage) => fetchData(1, perpage)"
            />
        </div>
        
        <div class="modals-container">
            <AddUnit
                v-if="showAddUnit"
                @close="showAddUnit = false"
                @refreshData="fetchData(1)"
            />
            <EditUnit
                v-if="showEditUnit"
                :unit_id="unitStore.edit_unit_id"
                @close="showEditUnit = false"
                @refreshData="fetchData(unitStore.current_page)"
            />
            <ViewUnit
                v-if="showViewUnit"
                :unit_id="unitStore.view_unit_id"
                @close="showViewUnit = false"
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

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}
</style>