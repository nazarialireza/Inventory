<script setup>
import { computed, onMounted } from "vue";
import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import { useCustomerStore } from "./customerStore";
import { useI18n } from "../../composables/useI18n";

const emit = defineEmits(["close", "refreshData"]);
const { t } = useI18n();

const customerStore = useCustomerStore();
const customer_data = computed(() => customerStore.current_customer_item);

async function submitData() {
    customerStore
        .addCustomer(
            JSON.parse(JSON.stringify(customerStore.current_customer_item))
        )
        .then(() => {
            emit("refreshData");
            emit("close");
        })
        .catch((error) => {
            console.log("error occurred");
        });
}

async function closeAddCustomerModal() {
    customerStore.resetCurrentCustomerData();
    emit("close");
}

onMounted(() => {
    customerStore.resetCurrentCustomerData();
});
</script>

<template>
    <div class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('customers.add_new_customer') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeAddCustomerModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <form action="">
                        <div class="form-item mt-4">
                            <label class="my-2">{{ t('general.status') }}</label>
                            <p
                                class="text-danger"
                                v-if="customerStore.add_customer_errors.status"
                            >
                                {{ customerStore.add_customer_errors.status }}
                            </p>
                            <div class="d-flex">
                                <span class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="radio"
                                        v-model="customer_data.status"
                                        id="active"
                                        value="active"
                                    />
                                    <label
                                        class="form-check-label"
                                        for="active"
                                    >
                                        {{ t('general.active') }}
                                    </label>
                                </span>
                                <span class="form-check ms-2">
                                    <input
                                        class="form-check-input"
                                        type="radio"
                                        v-model="customer_data.status"
                                        id="disabled"
                                        value="disabled"
                                    />
                                    <label
                                        class="form-check-label"
                                        for="disabled"
                                    >
                                        {{ t('general.disabled') }}
                                    </label>
                                </span>
                            </div>
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('general.name') }}</label>
                            <p
                                class="text-danger"
                                v-if="customerStore.add_customer_errors.name"
                            >
                                {{ customerStore.add_customer_errors.name }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="customer_data.name"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('general.email') }}</label>
                            <p
                                class="text-danger"
                                v-if="customerStore.add_customer_errors.email"
                            >
                                {{ customerStore.add_customer_errors.email }}
                            </p>
                            <input
                                type="email"
                                class="form-control"
                                v-model="customer_data.email"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('general.phone') }}</label>
                            <p
                                class="text-danger"
                                v-if="customerStore.add_customer_errors.phone"
                            >
                                {{ customerStore.add_customer_errors.phone }}
                            </p>
                            <input
                                type="tel"
                                class="form-control"
                                v-model="customer_data.phone"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('customers.tax_number') }}</label>
                            <p
                                class="text-danger"
                                v-if="
                                    customerStore.add_customer_errors.tax_number
                                "
                            >
                                {{
                                    customerStore.add_customer_errors.tax_number
                                }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="customer_data.tax_number"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('customers.country') }}</label>
                            <p
                                class="text-danger"
                                v-if="customerStore.add_customer_errors.country"
                            >
                                {{ customerStore.add_customer_errors.country }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="customer_data.country"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('customers.city') }}</label>
                            <p
                                class="text-danger"
                                v-if="customerStore.add_customer_errors.city"
                            >
                                {{ customerStore.add_customer_errors.city }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="customer_data.city"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('customers.postal_code') }}</label>
                            <p
                                class="text-danger"
                                v-if="
                                    customerStore.add_customer_errors
                                        .postal_code
                                "
                            >
                                {{
                                    customerStore.add_customer_errors
                                        .postal_code
                                }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="customer_data.postal_code"
                            />
                        </div>
                        <div class="form-item mt-4">
                            <label class="my-2">{{ t('general.address') }}</label>
                            <textarea
                                v-model="customer_data.address"
                                class="form-control"
                                rows="3"
                            ></textarea>
                        </div>
                        <div class="form-item mt-4">
                            <label class="my-2">Billing Address</label>
                            <textarea
                                v-model="customer_data.billing_address"
                                class="form-control"
                                rows="3"
                            ></textarea>
                        </div>
                        <div class="form-item mt-4">
                            <label class="my-2">Shipping Address</label>
                            <textarea
                                v-model="customer_data.shipping_address"
                                class="form-control"
                                rows="3"
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeAddCustomerModal"
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
