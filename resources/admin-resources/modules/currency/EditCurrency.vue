<script setup>
import { reactive, ref, computed, onMounted } from "vue";

import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import Loader from "../../components/shared/loader/Loader.vue";
import { useCurrencyStore } from "./currencyStore";
import { useI18n } from "../../composables/useI18n";

const props = defineProps(["currency_id"]);
const emit = defineEmits(["close", "refreshData"]);
const { t } = useI18n();

const loading = ref(false);
const currencyStore = useCurrencyStore();
const currency_data = computed(() => currencyStore.current_currency_item);

async function submitData() {
    currencyStore
        .editCurrency(currencyStore.current_currency_item)
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
    await currencyStore.fetchCurrency(id);
    loading.value = false;
}

async function closeEditCurrencyModal() {
    currencyStore.resetCurrentCurrencyData();
    emit("close");
}

onMounted(() => {
    fetchData(props.currency_id);
});
</script>

<template>
    <div class="modal fade show d-block" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-scrollable" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('currencies.edit_currency') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeEditCurrencyModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <Loader v-if="loading" />
                    <div class="form-items" v-if="loading == false">
                        <label class="my-2">{{ t('currencies.currency_name') }}</label>
                        <p
                            class="text-danger"
                            v-if="currencyStore.edit_currency_errors.name"
                        >
                            {{ currencyStore.edit_currency_errors.name }}
                        </p>
                        <input
                            type="text"
                            class="form-control"
                            v-model="currency_data.name"
                        />

                        <label class="my-2">{{ t('currencies.currency_code') }}</label>
                        <p
                            class="text-danger"
                            v-if="currencyStore.edit_currency_errors.code"
                        >
                            {{ currencyStore.edit_currency_errors.code }}
                        </p>
                        <input
                            type="text"
                            class="form-control"
                            v-model="currency_data.code"
                        />

                        <label class="my-2">{{ t('currencies.currency_symbol') }}</label>
                        <p
                            class="text-danger"
                            v-if="currencyStore.edit_currency_errors.symbol"
                        >
                            {{ currencyStore.edit_currency_errors.symbol }}
                        </p>
                        <input
                            type="text"
                            class="form-control"
                            v-model="currency_data.symbol"
                        />
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeEditCurrencyModal"
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
