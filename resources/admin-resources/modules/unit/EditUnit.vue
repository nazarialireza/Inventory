<script setup>
import { ref, computed, onMounted } from "vue";

import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import Loader from "../../components/shared/loader/Loader.vue";

import { useUnitStore } from "./unitStore";
import { useI18n } from "../../composables/useI18n";

const props = defineProps(["unit_id"]);
const emit = defineEmits(["close", "refreshData"]);
const { t } = useI18n();

const loading = ref(false);
const unitStore = useUnitStore();
const unit_data = computed(() => unitStore.current_unit_item);

async function submitData() {
    unitStore
        .editUnit(unitStore.current_unit_item)
        .then(() => {
            emit("refreshData");
            emit("close");
        })
        .catch((error) => {
            console.log("error occurred");
        });
}

async function fetchData(id) {
    loading.value = true;
    await unitStore.fetchUnit(id);
    loading.value = false;
}

async function closeEditUnitModal() {
    unitStore.resetCurrentUnitData();
    emit("close");
}

onMounted(() => {
    fetchData(props.unit_id);
    unitStore.fetchBaseUnits();
});
</script>

<template>
    <div class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('units.edit_unit') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeEditUnitModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <Loader v-if="loading" />
                    <div class="form-items" v-if="loading == false">
                        <label class="my-2">{{ t('units.unit_name') }}</label>
                        <p
                            class="text-danger"
                            v-if="unitStore.edit_unit_errors.name"
                        >
                            {{ unitStore.edit_unit_errors.name }}
                        </p>
                        <input
                            type="text"
                            class="form-control"
                            v-model="unit_data.name"
                        />

                        <label class="my-2">{{ t('units.short_name') }}</label>
                        <p
                            class="text-danger"
                            v-if="unitStore.edit_unit_errors.short_name"
                        >
                            {{ unitStore.edit_unit_errors.short_name }}
                        </p>
                        <input
                            type="text"
                            class="form-control"
                            v-model="unit_data.short_name"
                        />


                        
                        <div class="form-item">
                            <label class="my-2">{{ t('units.base_unit') }}</label>
                            <p
                                class="text-danger"
                                v-if="unitStore.edit_unit_errors.base_unit_id"
                            >
                                {{ unitStore.edit_unit_errors.base_unit_id }}
                            </p>
                            <select
                                class="form-select form-select-sm text-capitalize"
                                v-model="unit_data.base_unit_id"
                            >
                                <option value="" >{{ t('units.none') }}</option>
                                <option
                                    :value="base_unit.id"
                                    v-for="base_unit in unitStore.base_units"
                                >
                                    {{ base_unit.name }}
                                </option>
                            </select>
                        </div>

                        <div class="form-item" v-if="unit_data.base_unit_id">
                            <label class="my-2">{{ t('units.operator') }}</label>
                            <p
                                class="text-danger"
                                v-if="unitStore.edit_unit_errors.operator"
                            >
                                {{ unitStore.edit_unit_errors.operator }}
                            </p>
                            <select
                                class="form-select form-select-sm text-capitalize"
                                v-model="unit_data.operator"
                            >
                                <option value="divide">{{ t('general.divide') }}</option>
                                <option value="multiply">{{ t('general.multiply') }}</option>
                            </select>
                        </div>

                        <div class="form-item" v-if="unit_data.base_unit_id">
                            <label class="my-2">{{ t('units.operation_value') }}</label>
                            <p
                                class="text-danger"
                                v-if="unitStore.edit_unit_errors.operation_value"
                            >
                                {{ unitStore.edit_unit_errors.operation_value }}
                            </p>
                            <input
                                type="number"
                                class="form-control"
                                v-model="unit_data.operation_value"
                            />
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeEditUnitModal"
                    >
                        {{ t('general.cancel') }}
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary ml-1 btn-sm"
                        @click="submitData"
                    >
                        {{ t('general.save') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
