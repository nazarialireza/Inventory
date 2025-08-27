<script setup>
import { ref, onMounted, reactive } from "vue";
import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import axios from "axios";
import { useNotificationStore } from "../../components/shared/notification/notificationStore";
import formatValidationErrors from "../../utils/format-validation-errors";
import { useI18n } from "../../composables/useI18n";

const emit = defineEmits(["close", "refreshData"]);
const props = defineProps(["invoice_id", "due_amount"]);

const { t } = useI18n();
const payment = reactive({
    invoice_id: "",
    account_id: "",
    payment_method: "",
    amount: 0,
    date: "",
    note: "",
    due_amount: 0,
});

const validation_errors = ref([]);
const accounts = ref([]);

async function submitData() {
    axios
        .post(`/api/payments`, payment)
        .then((response) => {
            emit("refreshData");
            emit("close");
        })
        .catch((error) => {
            const notifcationStore = useNotificationStore();
            notifcationStore.pushNotification({
                message: "Error Occurred",
                type: "error",
                time: 3000,
            });

            if (error.response.status == 422) {
                validation_errors.value = formatValidationErrors(
                    error.response.data.errors
                );
            }
            //console.log(error);
        });
}

async function fetchAccounts() {
    await axios
        .get(`/api/accounts/list`)
        .then((response) => {
            accounts.value = response.data.data;
        })
        .catch((errors) => {
            console.log(errors);
        });
}

async function closeAddPaymentModal() {
    emit("close");
}

onMounted(() => {
    fetchAccounts();
    payment.invoice_id = props.invoice_id;
    payment.due_amount = props.due_amount;
});
</script>

<template>
    <div class="modal fade show d-block" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-scrollable" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('payments.add_payment') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeAddPaymentModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <div class="p-2">
                        <label class="my-1">{{ t('accounts.select_account') }}</label>
                        <select
                            class="form-select form-select-sm"
                            v-model="payment.account_id"
                        >
                            <option value="">{{ t('general.none') }}</option>
                            <option
                                :value="account.id"
                                v-for="account in accounts"
                            >
                                {{ account.name }} -- {{ account.balance }}
                            </option>
                        </select>
                        <span
                            class="v-error"
                            v-if="validation_errors.account_id"
                        >
                            {{ validation_errors.account_id }}
                        </span>
                    </div>

                    <div class="p-2">
                        <label class="my-1">{{ t('general.date') }}</label>
                        <input
                            type="date"
                            class="form-control"
                            v-model="payment.date"
                        />
                        <span class="v-error" v-if="validation_errors.date">
                            {{ validation_errors.date }}
                        </span>
                    </div>

                    <div class="p-2">
                        <label class="my-1">{{ t('payments.due_amount') }}</label>
                        <input
                            type="number"
                            class="form-control"
                            v-model="payment.due_amount"
                            disabled
                        />
                    </div>

                    <div class="p-2">
                        <label class="my-1">{{ t('payments.paying_amount') }}</label>
                        <input
                            type="number"
                            class="form-control"
                            v-model="payment.amount"
                            :max="payment.due_amount"
                            @input="
                                payment.amount > payment.due_amount
                                    ? (payment.amount = payment.due_amount)
                                    : ''
                            "
                        />
                        <span class="v-error" v-if="validation_errors.amount">
                            {{ validation_errors.amount }}
                        </span>
                    </div>

                    <div class="p-2">
                        <label class="my-1">{{ t('payments.payment_method') }}</label>
                        <select
                            class="form-select form-select-sm"
                            v-model="payment.payment_method"
                        >
                            <option value="">{{ t('general.none') }}</option>
                            <option value="cash">{{ t('payments.methods.cash') }}</option>
                            <option value="payoneer">{{ t('payments.methods.payoneer') }}</option>
                            <option value="wise">{{ t('payments.methods.wise') }}</option>
                            <option value="bank">{{ t('payments.methods.bank') }}</option>
                            <option value="paypal">{{ t('payments.methods.paypal') }}</option>
                            <option value="card">{{ t('payments.methods.card') }}</option>
                        </select>
                        <span
                            class="v-error"
                            v-if="validation_errors.payment_method"
                        >
                            {{ validation_errors.payment_method }}
                        </span>
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeAddPaymentModal"
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
