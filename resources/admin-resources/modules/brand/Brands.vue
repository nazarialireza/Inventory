<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useBrandStore } from "./brandStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddBrand from "./AddBrand.vue";
import EditBrand from "./EditBrand.vue";
import ViewBrand from "./ViewBrand.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddBrand = ref(false);
const showEditBrand = ref(false);
const showViewBrand = ref(false);

const brandStore = useBrandStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const brands = computed(() => brandStore.brands);
const { t } = useI18n();
const q_name = ref("");
const selected_brands = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'logo',
        label: t('brands.logo'),
        hiddenOnMobile: false,
        mobileClass: 'text-center'
    },
    {
        key: 'name',
        label: t('brands.brand_name'),
        hiddenOnMobile: false
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_brands.value = selectedIds;
    all_selectd.value = selectedIds.length === brands.value.length && brands.value.length > 0;
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.confirm_delete', { item: 'brand' }) })
        .then(async () => {
            if (confirmStore.do_action == true) {
                brandStore.deleteBrand(id).then(() => {
                    brandStore.fetchBrands(
                        brandStore.current_page,
                        brandStore.per_page,
                        brandStore.q_name
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_brands.value = [];
                    }
                });
            }
        });
}

function openEditBrandModal(id) {
    brandStore.edit_brand_id = id;
    showEditBrand.value = true;
}

function openViewBrandModal(id) {
    brandStore.view_brand_id = id;
    showViewBrand.value = true;
}

async function fetchData(
    page = brandStore.current_page,
    per_page = brandStore.per_page,
    q_name = brandStore.q_name
) {
    loading.value = true;

    all_selectd.value = false;
    selected_brands.value = [];

    try {
        brandStore.fetchBrands(page, per_page, q_name).then((response) => {
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
    <div v-if="authStore.userCan('view_brand')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('brands.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_brands.length > 0 &&
                        authStore.userCan('delete_brand')
                    "
                    @click="deleteData(selected_brands)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_brand')"
                    @click="showAddBrand = true"
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
                            :placeholder="t('brands.placeholder.name')"
                            v-model="q_name"
                            @keyup="fetchData(1, brandStore.per_page, q_name)"
                        />
                        <!-- <label class="input-group-text">sarch</label> -->
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="brands"
            :columns="tableColumns"
            :selected-items="selected_brands"
            :has-selection="authStore.userCan('delete_brand')"
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
            <template #cell-logo="{ item }">
                <div style="width: 50px; height: 50px">
                    <img
                        :src="
                            item.logo[0]
                                ? item.logo[0]['url']
                                : $demoIMG
                        "
                        :alt="item.name"
                        class="img-fluid"
                    />
                </div>
            </template>

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
                    @click="openViewBrandModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_brand')"
                    color="#739EF1"
                    @click="openEditBrandModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_brand')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        <Pagination
            v-if="loading == false && brands.length > 0"
            :total_pages="brandStore.total_pages"
            :current_page="brandStore.current_page"
            :per_page="brandStore.per_page"
            @pageChange="
                (currentPage) => fetchData(currentPage, brandStore.per_page)
            "
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddBrand
                v-if="showAddBrand"
                @close="showAddBrand = false"
                @refreshData="fetchData(1)"
            />
            <EditBrand
                v-if="showEditBrand"
                :brand_id="brandStore.edit_brand_id"
                @close="showEditBrand = false"
                @refreshData="fetchData(brandStore.current_page)"
            />
            <ViewBrand
                v-if="showViewBrand"
                :brand_id="brandStore.view_brand_id"
                @close="showViewBrand = false"
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

.table-image {
    border-radius: 6px;
    object-fit: cover;
}

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}
</style>