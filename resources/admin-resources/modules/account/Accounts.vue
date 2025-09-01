<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/authStore";
import Loader from "../../components/shared/loader/Loader.vue";
import Pagination from "../../components/shared/pagination/Pagination.vue";
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";
import { useConfirmStore } from "../../components/shared/confirm-alert/confirmStore.js";
import { useAccountStore } from "./accountStore";
import BinSvgIcon from "../../assets/icons/bin-svg-icon.vue";
import EditSvgIcon from "../../assets/icons/edit-svg-icon.vue";
import ViewSvgIcon from "../../assets/icons/view-svg-icon.vue";
import AddNewButton from "../../components/buttons/AddNewButton.vue";
import FilterButton from "../../components/buttons/FilterButton.vue";
import BulkDeleteButton from "../../components/buttons/BulkDeleteButton.vue";
import AddAccount from "./AddAccount.vue";
import EditAccount from "./EditAccount.vue";
import ViewAccount from "./ViewAccount.vue";
import { useI18n } from "../../composables/useI18n";

const loading = ref(false);
const filterTab = ref(true);
const showAddAccount = ref(false);
const showEditAccount = ref(false);
const showViewAccount = ref(false);

const accountStore = useAccountStore();
const confirmStore = useConfirmStore();
const authStore = useAuthStore();
const accounts = computed(() => accountStore.accounts);
const { t } = useI18n();
const q_name = ref("");
const selected_accounts = ref([]);
const all_selectd = ref(false);

// Table columns configuration
const tableColumns = computed(() => [
    {
        key: 'name',
        label: t('general.name'),
        hiddenOnMobile: false
    },
    {
        key: 'account_number',
        label: t('accounts.number'),
        hiddenOnMobile: false
    },
    {
        key: 'balance',
        label: t('accounts.balance'),
        hiddenOnMobile: false
    },
    {
        key: 'status',
        label: t('general.status'),
        hiddenOnMobile: false
    }
]);

// Handle selection changes
function onSelectionChange(selectedIds) {
    selected_accounts.value = selectedIds;
    all_selectd.value = selectedIds.length === accounts.value.length && accounts.value.length > 0;
}

function select_all() {
    if (all_selectd.value == false) {
        selected_accounts.value = [];
        accountStore.accounts.forEach((element) => {
            selected_accounts.value.push(element.id);
        });
        all_selectd.value = true;
    } else {
        all_selectd.value = false;
        selected_accounts.value = [];
    }
}

async function fetchData(
    page = accountStore.current_page,
    per_page = accountStore.per_page,
    q_name = accountStore.q_name,
    q_status = accountStore.q_status
) {
    loading.value = true;

    all_selectd.value = false;
    selected_accounts.value = [];

    try {
        accountStore
            .fetchAccounts(page, per_page, q_name, q_status)
            .then((response) => {
                loading.value = false;
            });
    } catch (error) {
        loading.value = false;
    }
}

async function deleteData(id) {
    confirmStore
        .show_box({ message: t('general.confirm_delete', { item: 'account' }) })
        .then(async () => {
            if (confirmStore.do_action == true) {
                accountStore.deleteAccount(id).then(() => {
                    accountStore.fetchAccounts(
                        accountStore.current_page,
                        accountStore.per_page,
                        accountStore.q_name,
                        accountStore.q_status
                    );

                    if (Array.isArray(id)) {
                        all_selectd.value = false;
                        selected_accounts.value = [];
                    }
                });
            }
        });
}

function openEditAccountModal(id) {
    accountStore.edit_account_id = id;
    showEditAccount.value = true;
}

function openViewAccountModal(id) {
    accountStore.view_account_id = id;
    showViewAccount.value = true;
}

onMounted(() => {
    fetchData(1);
});
</script>

<template>
    <div v-if="authStore.userCan('view_account')">
        <div class="page-top-box mb-2 d-flex flex-wrap">
            <h3 class="h3">{{ t('accounts.title') }}</h3>
            <div class="page-heading-actions ms-auto">
                <BulkDeleteButton
                    v-if="
                        selected_accounts.length > 0 &&
                        authStore.userCan('delete_account')
                    "
                    @click="deleteData(selected_accounts)"
                />
                <AddNewButton
                    v-if="authStore.userCan('create_account')"
                    @click="showAddAccount = true"
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
                            :placeholder="t('accounts.placeholder.name')"
                            v-model="q_name"
                            @keyup="fetchData(1, accountStore.per_page, q_name)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <Loader v-if="loading" />
        <ResponsiveDataTable
            v-if="loading == false"
            :data="accounts"
            :columns="tableColumns"
            :selected-items="selected_accounts"
            :has-selection="authStore.userCan('delete_account')"
            :has-actions="true"
            :actions-label="t('general.action')"
            id-key="id"
            primary-column-key="id"
            title-column-key="name"
            :mobile-visible-fields="3"
            @selection-change="onSelectionChange"
        >
            <!-- Custom cell renderers -->
            <template #cell-status="{ item }">
                <span
                    class="badge-sqaure text-uppercase"
                    :class="[
                        item.status == 'active'
                            ? 'btn-outline-success'
                            : '',
                        item.status == 'disabled'
                            ? 'btn-outline-secondary'
                            : '',
                    ]"
                >
                    {{ item.status == 'active' ? t('general.active') : t('general.disabled') }}
                </span>
            </template>

            <!-- Mobile card header -->
            <template #card-header="{ item }">
                <div class="card-title-mobile">
                    {{ item.name }}
                </div>
                <div class="card-subtitle" v-if="item.account_number">
                    {{ item.account_number }}
                </div>
            </template>

            <!-- Action buttons -->
            <template #actions="{ item }">
                <ViewSvgIcon
                    color="#00CFDD"
                    @click="openViewAccountModal(item.id)"
                />
                <EditSvgIcon
                    v-if="authStore.userCan('update_account')"
                    color="#739EF1"
                    @click="openEditAccountModal(item.id)"
                />
                <BinSvgIcon
                    v-if="authStore.userCan('delete_account')"
                    color="#FF7474"
                    @click="deleteData(item.id)"
                />
            </template>
        </ResponsiveDataTable>
        
        <div class="pagination-container" v-if="loading == false && accounts.length > 0">
            <Pagination
                :total_pages="accountStore.total_pages"
                :current_page="accountStore.current_page"
                :per_page="accountStore.per_page"
                @pageChange="
                    (currentPage) => fetchData(currentPage, accountStore.per_page)
                "
                @perPageChange="(perpage) => fetchData(1, perpage)"
            />
        </div>
        
        <div class="modals-container">
            <AddAccount
                v-if="showAddAccount"
                @close="showAddAccount = false"
                @refreshData="fetchData(1)"
            />
            <EditAccount
                v-if="showEditAccount"
                :account_id="accountStore.edit_account_id"
                @close="showEditAccount = false"
                @refreshData="fetchData(accountStore.current_page)"
            />
            <ViewAccount
                v-if="showViewAccount"
                :account_id="accountStore.view_account_id"
                @close="showViewAccount = false"
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