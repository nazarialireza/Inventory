// Mobile Table Update Template for remaining modules
// This file contains the template structure for updating all remaining table modules

// 1. Import ResponsiveDataTable
import ResponsiveDataTable from "../../components/ResponsiveDataTable.vue";

// 2. Add table columns configuration
const tableColumns = computed(() => [
    // Define columns based on module type
    // Example for brands:
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

// 3. Replace select_all function with onSelectionChange
function onSelectionChange(selectedIds) {
    selected_items.value = selectedIds;
    all_selectd.value = selectedIds.length === items.value.length && items.value.length > 0;
}

// 4. Replace table template with ResponsiveDataTable
/*
<ResponsiveDataTable
    v-if="loading == false"
    :data="items"
    :columns="tableColumns"
    :selected-items="selected_items"
    :has-selection="authStore.userCan('delete_item')"
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
                :src="item.logo[0] ? item.logo[0]['url'] : $demoIMG"
                :alt="item.name"
                class="img-fluid table-image"
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
        <ViewSvgIcon color="#00CFDD" @click="openViewModal(item.id)" />
        <EditSvgIcon v-if="authStore.userCan('update_item')" color="#739EF1" @click="openEditModal(item.id)" />
        <BinSvgIcon v-if="authStore.userCan('delete_item')" color="#FF7474" @click="deleteData(item.id)" />
    </template>
</ResponsiveDataTable>
*/

// 5. Add styles
/*
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

.currency-value {
    font-weight: 500;
    color: #059669;
}

.number-value {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-weight: 500;
}

/* RTL support */
.rtl .card-title-mobile {
    text-align: right;
}
</style>
*/