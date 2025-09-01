<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useTaxStore } from "./taxStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddTax from "./AddTax.vue";
import EditTax from "./EditTax.vue";
import ViewTax from "./ViewTax.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddTax = ref(false);
const showEditTax = ref(false);
const showViewTax = ref(false);

const { t } = useI18n();
const taxStore = useTaxStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const taxes = computed(() => taxStore.taxes);
const q_name = ref("");
const selected_taxes = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'name',
        label: t('taxes.tax_name'),
        hiddenOnMobile: false
    },
    {
        key: 'rate',
        label: t('taxes.tax_rate_percent'),
        hiddenOnMobile: false,
        formatter: (value) => `${value} %`
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_taxes.value = selectedIds;
    all_selectd.value = selectedIds.length === taxes.value.length && taxes.value.length > 0;
}

function select_all() {
    if (all_selectd.value == false) {
        selected_taxes.value = [];
        taxStore.taxes.forEach((element) => {
            selected_taxes.value.push(element.id);
        });
        all_selectd.value = true;
    } else {
        all_selectd.value = false;
        selected_taxes.value = [];
    }
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.delete_confirmation') })
        .then(async () => {
            if (confirmStore.do_action == true) {
                taxStore.deleteTax(id).then(() => {
                    taxStore.fetchTaxes(
                        taxStore.current_page,
                        taxStore.per_page,
                        taxStore.q_name
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_taxes.value = [];
                    }
                });
            }
        });
}

function openEditTaxModal(id) {
    taxStore.edit_tax_id = id;
    showEditTax.value = true;
}

function openViewTaxModal(id) {
    taxStore.view_tax_id = id;
    showViewTax.value = true;
}

async function fetchData(
    page = taxStore.current_page,
    per_page = taxStore.per_page,
    q_name = taxStore.q_name
) {
    loading.value = true;

    all_selectd.value = false;
    selected_taxes.value = [];

    try {
        taxStore.fetchTaxes(page, per_page, q_name).then((response) => {
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
    <div v-if="authStore.userCan('view_tax')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('taxes.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_taxes.length > 0 &&
                        authStore.userCan('delete_tax')
                    "
                    @click="deleteData(selected_taxes)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_tax')"
                    @click="showAddTax = true"
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
                            @keyup="fetchData(1, taxStore.per_page, q_name)"
                        />
                        <!-- <label class="input-group-text">sarch</label> -->
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="taxes"
            :columns="tableColumns"
            :selected-items="selected_taxes"
            :has-selection="authStore.userCan('delete_tax')"
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
                <div class="card-subtitle" v-if="item.rate">
                    {{ item.rate }} %
                </div>
            </template>

            <!-- Action buttons -->
            <template #actions="{ item }">
                <ViewSvgIcon
                    color="#00CFDD"
                    @click="openViewTaxModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_tax')"
                    color="#739EF1"
                    @click="openEditTaxModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_tax')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        <Pagination
            v-if="loading == false && taxes.length > 0"
            :total_pages="taxStore.total_pages"
            :current_page="taxStore.current_page"
            :per_page="taxStore.per_page"
            @pageChange="
                (currentPage) => fetchData(currentPage, taxStore.per_page)
            "
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddTax
                v-if="showAddTax"
                @close="showAddTax = false"
                @refreshData="fetchData(1)"
            />
            <EditTax
                v-if="showEditTax"
                :tax_id="taxStore.edit_tax_id"
                @close="showEditTax = false"
                @refreshData="fetchData(taxStore.current_page)"
            />
            <ViewTax
                v-if="showViewTax"
                :tax_id="taxStore.view_tax_id"
                @close="showViewTax = false"
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