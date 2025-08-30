<template>
  <div class="responsive-data-table">
    <!-- Desktop Table View -->
    <div class="desktop-table-view">
      <div class="table-responsive bg-white shadow-sm">
        <table class="table mb-0 table-hover">
          <thead class="thead-dark">
            <tr>
              <th v-if="hasSelection">
                <input
                  type="checkbox"
                  class="form-check-input"
                  @click="toggleSelectAll"
                  v-model="allSelected"
                />
              </th>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="column.headerClass || ''"
              >
                {{ column.label }}
              </th>
              <th v-if="hasActions" class="table-action-col">
                {{ actionsLabel }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data" :key="getRowKey(item, index)">
              <td v-if="hasSelection">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :value="getItemId(item)"
                  v-model="localSelectedItems"
                  @change="onSelectionChange"
                />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                :class="column.cellClass || ''"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :item="item"
                  :value="getNestedValue(item, column.key)"
                  :column="column"
                  :index="index"
                >
                  {{ formatCellValue(item, column) }}
                </slot>
              </td>
              <td v-if="hasActions" class="table-action-btns">
                <slot name="actions" :item="item" :index="index"></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="mobile-card-view">
      <div class="mobile-cards-container">
        <TouchCard
          v-for="(item, index) in data"
          :key="getRowKey(item, index)"
          :class="[
            'mobile-data-card',
            { 'card-selected': isItemSelected(item) }
          ]"
          variant="outlined"
          padding="normal"
        >
          <!-- Card Header with selection and actions -->
          <template #header>
            <div class="mobile-card-header">
              <!-- Top row: Checkbox + Primary Info + Actions -->
              <div class="card-header-top">
                <div class="card-selection" v-if="hasSelection">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="getItemId(item)"
                    v-model="localSelectedItems"
                    @change="onSelectionChange"
                  />
                </div>
                <div class="card-primary-info">
                  <div class="card-id">
                    {{ primaryColumn ? getNestedValue(item, primaryColumn.key) : getItemId(item) }}
                  </div>
                </div>
                <div class="card-actions" v-if="hasActions">
                  <slot name="actions" :item="item" :index="index"></slot>
                </div>
              </div>
              
              <!-- Title row: Full width title -->
              <div class="card-title-row">
                <slot name="card-header" :item="item" :index="index">
                  <div class="card-title" v-if="titleColumn">
                    {{ getNestedValue(item, titleColumn.key) }}
                  </div>
                </slot>
              </div>
            </div>
          </template>

          <!-- Card Body with data fields - now clickable -->
          <div 
            class="mobile-card-body clickable-card-body"
            @click="toggleItemExpansion(item)"
            :class="{ 'expanded': isItemExpanded(item) }"
          >
            <div class="card-fields">
              <div
                v-for="column in mobileVisibleColumns"
                :key="column.key"
                class="card-field"
                :class="column.mobileClass || ''"
              >
                <div class="field-label">{{ column.label }}</div>
                <div class="field-value">
                  <slot
                    :name="`cell-${column.key}`"
                    :item="item"
                    :value="getNestedValue(item, column.key)"
                    :column="column"
                    :index="index"
                  >
                    {{ formatCellValue(item, column) }}
                  </slot>
                </div>
              </div>
            </div>
            
            <!-- Expanded fields -->
            <div v-if="isItemExpanded(item) && hiddenColumns.length > 0" class="expanded-fields">
              <div
                v-for="column in hiddenColumns"
                :key="column.key"
                class="card-field"
                :class="column.mobileClass || ''"
              >
                <div class="field-label">{{ column.label }}</div>
                <div class="field-value">
                  <slot
                    :name="`cell-${column.key}`"
                    :item="item"
                    :value="getNestedValue(item, column.key)"
                    :column="column"
                    :index="index"
                  >
                    {{ formatCellValue(item, column) }}
                  </slot>
                </div>
              </div>
            </div>
          </div>
        </TouchCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import TouchCard from './TouchCard.vue';

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  selectedItems: {
    type: Array,
    default: () => []
  },
  hasSelection: {
    type: Boolean,
    default: true
  },
  hasActions: {
    type: Boolean,
    default: true
  },
  actionsLabel: {
    type: String,
    default: 'Actions'
  },
  idKey: {
    type: String,
    default: 'id'
  },
  primaryColumnKey: {
    type: String,
    default: null
  },
  titleColumnKey: {
    type: String,
    default: null
  },
  mobileVisibleFields: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['selection-change']);

const localSelectedItems = ref([...props.selectedItems]);
const expandedItems = ref(new Set());

// Computed properties
const allSelected = computed({
  get() {
    return props.data.length > 0 && localSelectedItems.value.length === props.data.length;
  },
  set(value) {
    if (value) {
      localSelectedItems.value = props.data.map(item => getItemId(item));
    } else {
      localSelectedItems.value = [];
    }
    onSelectionChange();
  }
});

const primaryColumn = computed(() => {
  if (props.primaryColumnKey) {
    return props.columns.find(col => col.key === props.primaryColumnKey);
  }
  return props.columns[0];
});

const titleColumn = computed(() => {
  if (props.titleColumnKey) {
    return props.columns.find(col => col.key === props.titleColumnKey);
  }
  return props.columns[1] || props.columns[0];
});

const mobileVisibleColumns = computed(() => {
  return props.columns
    .filter(col => !col.hiddenOnMobile)
    .slice(0, props.mobileVisibleFields);
});

const hiddenColumns = computed(() => {
  const visibleKeys = mobileVisibleColumns.value.map(col => col.key);
  return props.columns.filter(col => 
    !visibleKeys.includes(col.key) && !col.hiddenOnMobile
  );
});

// Methods
const getItemId = (item) => {
  return getNestedValue(item, props.idKey);
};

const getRowKey = (item, index) => {
  return getItemId(item) || index;
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((value, key) => value?.[key], obj);
};

const formatCellValue = (item, column) => {
  const value = getNestedValue(item, column.key);
  
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value, item);
  }
  
  if (value === null || value === undefined) {
    return column.defaultValue || '--';
  }
  
  return value;
};

const isItemSelected = (item) => {
  return localSelectedItems.value.includes(getItemId(item));
};

const isItemExpanded = (item) => {
  return expandedItems.value.has(getItemId(item));
};

const toggleSelectAll = () => {
  allSelected.value = !allSelected.value;
};

const toggleItemExpansion = (item) => {
  const id = getItemId(item);
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id);
  } else {
    expandedItems.value.add(id);
  }
};

const onSelectionChange = () => {
  emit('selection-change', localSelectedItems.value);
};

// Watch for prop changes
watch(() => props.selectedItems, (newVal) => {
  localSelectedItems.value = [...newVal];
});
</script>

<style scoped>
.responsive-data-table {
  width: 100%;
}

/* Desktop View */
.desktop-table-view {
  display: block;
}

.mobile-card-view {
  display: none;
}

/* Mobile Card Styles */
.mobile-cards-container {
  display: grid;
  gap: 12px;
  padding: 4px;
}

.mobile-data-card {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.mobile-data-card.card-selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.mobile-card-header {
  margin-bottom: 0;
  width: 100%;
}

/* Card header top row: checkbox + ID + actions */
.card-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-selection {
  flex-shrink: 0;
}

.card-primary-info {
  flex: 1;
  margin: 0 12px;
}

.card-id {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.card-actions {
  display: flex;
  gap: 18px;
  flex-shrink: 0;
  align-items: center;
}

/* Card title row: full width */
.card-title-row {
  width: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: normal;
}

/* Clickable card body */
.clickable-card-body {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 8px;
}

.clickable-card-body:hover {
  background-color: #f8fafc;
}

.clickable-card-body.expanded {
  background-color: #f1f5f9;
}

.card-fields {
  display: grid;
  gap: 8px;
}

.card-field {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}

.card-field:last-child {
  border-bottom: none;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  flex-shrink: 0;
  min-width: 80px;
}

.field-value {
  font-size: 14px;
  color: #374151;
  text-align: right;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  flex: 1;
}

/* Image placeholder fallback */
.image-placeholder {
  width: 46px;
  height: 46px;
  background: linear-gradient(45deg, #e5e7eb, #d1d5db);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 12px;
}

.img-with-fallback {
  position: relative;
}

.img-with-fallback img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .image-placeholder {
    width: 40px;
    height: 40px;
    font-size: 10px;
  }
}

.expanded-fields {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .desktop-table-view {
    display: none;
  }
  
  .mobile-card-view {
    display: block;
  }
  
  .mobile-cards-container {
    grid-template-columns: 1fr;
  }
}

/* Small mobile screens - show 3 records */
@media (max-width: 480px) {
  .mobile-cards-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .mobile-data-card {
    font-size: 14px;
  }
  
  .card-id {
    font-size: 13px;
  }
  
  .card-title {
    font-size: 15px;
  }
  
  .field-label {
    font-size: 12px;
  }
  
  .field-value {
    font-size: 13px;
  }
}

/* Larger mobile screens - show 4 records */
@media (min-width: 481px) and (max-width: 768px) {
  .mobile-cards-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* RTL Support */
.rtl .mobile-card-header {
  direction: rtl;
}

.rtl .card-header-top {
  direction: rtl;
}

.rtl .card-field {
  direction: rtl;
}

.rtl .field-value {
  text-align: left;
}

.rtl .card-primary-info {
  margin: 0 12px 0 0;
}

/* Dark mode support for image placeholder */
@media (prefers-color-scheme: dark) {
  .image-placeholder {
    background: linear-gradient(45deg, #374151, #1f2937);
    color: #9ca3af;
  }
}
</style>