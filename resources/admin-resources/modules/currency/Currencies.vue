<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useCurrencyStore } from "./currencyStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddCurrency from "./AddCurrency.vue";
import EditCurrency from "./EditCurrency.vue";
import ViewCurrency from "./ViewCurrency.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddCurrency = ref(false);
const showEditCurrency = ref(false);
const showViewCurrency = ref(false);

const currencyStore = useCurrencyStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const currencies = computed(() => currencyStore.currencies);
const { t } = useI18n();
const q_name = ref("");
const selected_currencies = ref([]);
const all_selectd = ref(false);

function select_all() {
    if (all_selectd.value == false) {
        selected_currencies.value = [];
        currencyStore.currencies.forEach((element) => {
            selected_currencies.value.push(element.id);
        });
        all_selectd.value = true;
    } else {
        all_selectd.value = false;
        selected_currencies.value = [];
    }
}

async function deleteData(id) {
    await confirmStore
        .show_box({ message: t('general.confirm_delete', { item: 'currency' }) })
        .then(async () => {
            if (confirmStore.do_action == true) {
                await currencyStore.deleteCurrency(id);
                if (Array.isArray(id)) {
                    all_selectd.value = false;
                    selected_currencies.value = [];
                }
            }
        });
}

function openEditCurrencyModal(id) {
    currencyStore.edit_currency_id = id;
    showEditCurrency.value = true;
}

function openViewCurrencyModal(id) {
    currencyStore.view_currency_id = id;
    showViewCurrency.value = true;
}

async function fetchData(
    page = currencyStore.current_page,
    per_page = currencyStore.per_page,
    q_name = currencyStore.q_name
) {
    loading.value = true;

    all_selectd.value = false;
    selected_currencies.value = [];

    try {
        currencyStore
            .fetchCurrencies(page, per_page, q_name)
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
    <div v-if="authStore.userCan('view_currency')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('currencies.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_currencies.length > 0 &&
                        authStore.userCan('delete_currency')
                    "
                    @click="deleteData(selected_currencies)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_currency')"
                    @click="showAddCurrency = true"
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
                            :placeholder="t('currencies.placeholder.name')"
                            v-model="q_name"
                            @keyup="
                                fetchData(1, currencyStore.per_page, q_name)
                            "
                        />
                        <label class="input-group-text">{{ t('general.search') }}</label>
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <div
            class="table-responsive bg-white shadow-sm"
            v-if="loading == false"
        >
            <table class="table mb-0 table-hover">
                <thead class="thead-dark">
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                class="form-check-input"
                                @click="select_all"
                                v-model="all_selectd"
                            />
                        </th>
                        <th>{{ t('general.id') }}</th>
                        <th>{{ t('currencies.currency_name') }}</th>
                        <th>{{ t('currencies.currency_code') }}</th>
                        <th>{{ t('currencies.currency_symbol') }}</th>
                        <th class="table-action-col">{{ t('general.action') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="currency in currencies" :key="currency.id">
                        <td>
                            <input
                                type="checkbox"
                                class="form-check-input"
                                v-model="selected_currencies"
                                :value="currency.id"
                            />
                        </td>
                        <td>{{ currency.id }}</td>
                        <td>{{ currency.name }}</td>
                        <td>{{ currency.code }}</td>
                        <td>{{ currency.symbol }}</td>
                        <td class="table-action-btns">
                            <ViewSvgIcon
                                color="#00CFDD"
                                @click="openViewCurrencyModal(currency.id)"
                            />
                            <EditSvgIcon
                                v-if="authStore.userCan('update_currency')"
                                color="#739EF1"
                                @click="openEditCurrencyModal(currency.id)"
                            />
                            <BinSvgIcon
                                v-if="authStore.userCan('delete_currency')"
                                color="#FF7474"
                                @click="deleteData(currency.id)"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Pagination
            v-if="loading == false && currencies.length > 0"
            :total_pages="currencyStore.total_pages"
            :current_page="currencyStore.current_page"
            :per_page="currencyStore.per_page"
            @pageChange="
                (currentPage) => fetchData(currentPage, currencyStore.per_page)
            "
            @perPageChange="(perpage) => fetchData(1, perpage)"
        />
        <div class="modals-container">
            <AddCurrency
                v-if="showAddCurrency"
                @close="showAddCurrency = false"
                @refreshData="fetchData(1)"
            />
            <EditCurrency
                v-if="showEditCurrency"
                :currency_id="currencyStore.edit_currency_id"
                @close="showEditCurrency = false"
                @refreshData="fetchData(currencyStore.current_page)"
            />
            <ViewCurrency
                v-if="showViewCurrency"
                :currency_id="currencyStore.view_currency_id"
                @close="showViewCurrency = false"
            />
        </div>
    </div>
</template>
