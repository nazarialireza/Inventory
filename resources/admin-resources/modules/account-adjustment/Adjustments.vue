<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useAdjustmentStore } from "./adjustmentStore";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import AddAdjustment from "./AddAdjustment.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddAdjustment = ref(false);

const adjustmentStore = useAdjustmentStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const adjustments = computed(() => adjustmentStore.adjustments);
const { t } = useI18n();
const search = ref("");
const selected_adjustments = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'account.bank_name',
        label: t('accounts.bank_name'),
        hiddenOnMobile: false
    },
    {
        key: 'account.branch_name',
        label: t('accounts.branch_name'),
        hiddenOnMobile: true
    },
    {
        key: 'account.account_number',
        label: t('adjustments.adjustment_number'),
        hiddenOnMobile: false
    },
    {
        key: 'type',
        label: t('adjustments.type'),
        hiddenOnMobile: false
    },
    {
        key: 'amount',
        label: t('adjustments.amount'),
        hiddenOnMobile: false
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_adjustments.value = selectedIds;
    all_selectd.value = selectedIds.length === adjustments.value.length && adjustments.value.length > 0;
}

async function fetchData(
    page = adjustmentStore.current_page,
    per_page = adjustmentStore.per_page,
    search = adjustmentStore.search
) {
    loading.value = true;

    all_selectd.value = false;
    selected_adjustments.value = [];

    try {
        adjustmentStore
            .fetchAdjustments(page, per_page, search)
            .then((response) => {
                loading.value = false;
            });
    } catch (error) {
        loading.value = false;
    }
}

onMounted(() => {
    fetchData(1);
});
</script>

<template>
    <div v-if="authStore.userCan('view_account_adjustment')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('adjustments.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <AddNewButton
                    v-if="authStore.userCan('create_account_adjustment')"
                    @click="showAddAdjustment = true"
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
                            :placeholder="t('adjustments.placeholder.search')"
                            v-model="search"
                            @keyup="
                                fetchData(1, adjustmentStore.per_page, search)
                            "
                        />
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="adjustments"
            :columns="tableColumns"
            :selected-items="selected_adjustments"
            :has-selection="false"
            :has-actions="false"
            id-key="id"
            primary-column-key="id"
            title-column-key="account.account_number"
            :mobile-visible-fields="3"
            @selection-change="onSelectionChange"
        >
            <!-- Custom cell renderers -->
            <template #cell-type="{ item }">
                <span
                    class="badge-sqaure text-uppercase"
                    :class="[
                        item.type == 'add'
                            ? 'btn-outline-success'
                            : '',
                        item.type == 'subtract'
                            ? 'btn-outline-danger'
                            : '',
                    ]"
                >
                    {{ item.type }}
                </span>
            </template>

            <!-- Mobile card header -->
            <template #card-header="{ item }">
                <div class="card-title-mobile">
                    {{ item.account.bank_name }}
                </div>
                <div class="card-subtitle" v-if="item.account.account_number">
                    {{ item.account.account_number }}
                </div>
            </template>
        </ResponsiveDataTable>
        <Pagination
            v-if="loading == false && adjustments.length > 0"
            :total_pages="adjustmentStore.total_pages"
            :current_page="adjustmentStore.current_page"
            :per_page="adjustmentStore.per_page"
            @pageChange="
                (currentPage) =>
                    fetchData(currentPage, adjustmentStore.per_page)
            "
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddAdjustment
                v-if="showAddAdjustment"
                @close="showAddAdjustment = false"
                @refreshData="fetchData(1)"
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