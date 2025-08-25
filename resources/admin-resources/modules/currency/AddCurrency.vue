<script setup>
import { reactive, ref, computed, onMounted } from "vue";

import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import { useCurrencyStore } from "./currencyStore";
import { useI18n } from "../../composables/useI18n";

const emit = defineEmits(["close", "refreshData"]);
const { t } = useI18n();

const currencyStore = useCurrencyStore();
const currency_data = computed(() => currencyStore.current_currency_item);

async function submitData() {
    currencyStore
        .addCurrency(currencyStore.current_currency_item)
        .then(() => {
            emit("refreshData");
            emit("close");
        })
        .catch((error) => {
            console.log("error occurred");
        });
}

async function closeAddCurrencyModal() {
    currencyStore.resetCurrentCurrencyData();
    emit("close");
}

onMounted(() => {
    currencyStore.resetCurrentCurrencyData();
});
</script>

<template>
    <div class="modal fade show d-block" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-scrollable" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('currencies.add_currency') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeAddCurrencyModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <label class="my-2">{{ t('currencies.currency_name') }}</label>
                    <p
                        class="text-danger"
                        v-if="currencyStore.add_currency_errors.name"
                    >
                        {{ currencyStore.add_currency_errors.name }}
                    </p>
                    <input
                        type="text"
                        class="form-control"
                        v-model="currency_data.name"
                    />

                    <label class="my-2">{{ t('currencies.currency_code') }}</label>
                    <p
                        class="text-danger"
                        v-if="currencyStore.add_currency_errors.code"
                    >
                        {{ currencyStore.add_currency_errors.code }}
                    </p>
                    <input
                        type="text"
                        class="form-control"
                        v-model="currency_data.code"
                    />

                    <label class="my-2">{{ t('currencies.currency_symbol') }}</label>
                    <p
                        class="text-danger"
                        v-if="currencyStore.add_currency_errors.symbol"
                    >
                        {{ currencyStore.add_currency_errors.symbol }}
                    </p>
                    <input
                        type="text"
                        class="form-control"
                        v-model="currency_data.symbol"
                    />
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeAddCurrencyModal"
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
