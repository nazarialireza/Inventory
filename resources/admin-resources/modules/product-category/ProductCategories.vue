<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useProductCategoryStore } from "./productCategoryStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddProductCategory from "./AddProductCategory.vue";
import EditProductCategory from "./EditProductCategory.vue";
import ViewProductCategory from "./ViewProductCategory.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddProductCategory = ref(false);
const showEditProductCategory = ref(false);
const showViewProductCategory = ref(false);

const { t } = useI18n();
const productCategoryStore = useProductCategoryStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const product_categories = computed(() => productCategoryStore.product_categories);
const q_name = ref("");
const selected_product_categories = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'thumbnail',
        label: t('categories.thumbnail'),
        hiddenOnMobile: false,
        mobileClass: 'text-center'
    },
    {
        key: 'name',
        label: t('categories.category_name'),
        hiddenOnMobile: false
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_product_categories.value = selectedIds;
    all_selectd.value = selectedIds.length === product_categories.value.length && product_categories.value.length > 0;
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.delete_confirmation') })
        .then(async () => {
            if (confirmStore.do_action == true) {
                productCategoryStore.deleteProductCategory(id).then(() => {
                    productCategoryStore.fetchProductCategories(
                        productCategoryStore.current_page,
                        productCategoryStore.per_page,
                        productCategoryStore.q_name
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_product_categories.value = [];
                    }
                });
            }
        });
}

function openEditProductCategoryModal(id) {
    productCategoryStore.edit_product_category_id = id;
    showEditProductCategory.value = true;
}

function openViewProductCategoryModal(id) {
    productCategoryStore.view_product_category_id = id;
    showViewProductCategory.value = true;
}

async function fetchData(
    page = productCategoryStore.current_page,
    per_page = productCategoryStore.per_page,
    q_name = productCategoryStore.q_name,
    liveSearch=false
) {
    liveSearch==false?loading.value = true:'';

    all_selectd.value = false;
    selected_product_categories.value = [];

    try {
        productCategoryStore.fetchProductCategories(page, per_page, q_name).then((response) => {
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
    <div v-if="authStore.userCan('view_product_category')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('categories.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_product_categories.length > 0 &&
                        authStore.userCan('delete_product_category')
                    "
                    @click="deleteData(selected_product_categories)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_product_category')"
                    @click="showAddProductCategory = true"
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
                            @keyup="fetchData(1, productCategoryStore.per_page, q_name,true)"
                        />
                        <!-- <label class="input-group-text">sarch</label> -->
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="product_categories"
            :columns="tableColumns"
            :selected-items="selected_product_categories"
            :has-selection="authStore.userCan('delete_product_category')"
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
            <template #cell-thumbnail="{ item }">
                <div style="width: 50px; height: 50px">
                    <img
                        :src="item.thumbnail[0]?item.thumbnail[0]['url']:$demoIMG"
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
                    @click="openViewProductCategoryModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_product_category')"
                    color="#739EF1"
                    @click="openEditProductCategoryModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_product_category')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        <Pagination
            v-if="loading == false && product_categories.length > 0"
            :total_pages="productCategoryStore.total_pages"
            :current_page="productCategoryStore.current_page"
            :per_page="productCategoryStore.per_page"
            @pageChange="
                (currentPage) => fetchData(currentPage, productCategoryStore.per_page)
            "
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddProductCategory
                v-if="showAddProductCategory"
                @close="showAddProductCategory = false"
                @refreshData="fetchData(1)"
            />
            <EditProductCategory
                v-if="showEditProductCategory"
                :product_category_id="productCategoryStore.edit_product_category_id"
                @close="showEditProductCategory = false"
                @refreshData="fetchData(productCategoryStore.current_page)"
            />
            <ViewProductCategory
                v-if="showViewProductCategory"
                :product_category_id="productCategoryStore.view_product_category_id"
                @close="showViewProductCategory = false"
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