<script setup>
import { onMounted, ref } from "vue";
import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import router from "../../router";
import axios from "axios";
import { useNotificationStore } from "../../components/shared/notification/notificationStore";
import formatValidationErrors from "../../utils/format-validation-errors";
import { useI18n } from "../../composables/useI18n";

const warehouses = ref([]);
const items = ref([]);
const selected_items = ref([]);
const customers = ref([]);
const accounts = ref([]);
const account_id = ref("");
const payment_method = ref("");
const selected_warehouse = ref("");
const selected_party = ref({});
const invoice_date = ref("");
const discount = ref(0);
const invoice_tax_rate = ref(0);
const total_invoice_tax = ref(0);
const shipping_cost = ref(0);
const invoice_grand_total = ref(0);
const paid_amount = ref(0);
const invoice_status = ref("ordered");
const payment_status = ref("unpaid");
const note = ref("");
const customer_q = ref("");
const product_q = ref("");
const validation_errors = ref([]);
const { t } = useI18n();

async function fetchCustomers(name = customer_q.value) {
    if (name.length < 1) {
        clearCustomers();
        return;
    }
    await axios
        .get(`/api/customers/search/${name}`)
        .then((response) => {
            customers.value = [];
            customers.value = response.data.data;
        })
        .catch((errors) => {
            console.log(errors);
        });
}

async function fetchProducts(name = product_q.value) {
    if (name.length < 1) {
        clearProducts();
        return;
    }
    await axios
        .get(`/api/warehouse-products/${selected_warehouse.value}/${name}`)
        .then((response) => {
            items.value = [];
            items.value = response.data;
        })
        .catch((errors) => {
            console.log(errors.response);
        });
}

async function fetchWarehouses() {
    await axios
        .get(`/api/warehouses`)
        .then((response) => {
            warehouses.value = response.data.data;
        })
        .catch((errors) => {
            console.log(errors);
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

function clearCustomers() {
    customers.value = [];
}
function clearProducts() {
    items.value = [];
}
function clearSelectedProducts() {
    selected_items.value = [];
    calculateGrandTotal();
}

function onSelectCustomer(customer) {
    selected_party.value = customer;
    customer_q.value = customer.name;
    clearCustomers();
}

function onSelectWarehouse() {
    // clearProducts();
    // clearSelectedProducts();
}

function onSelectProduct(product) {
    const existingProduct = selected_items.value.find(
        (item) => item.id === product.id
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        product.quantity = 1;
        selected_items.value.push(product);
    }
    clearProducts();
    product_q.value = "";
    calculateGrandTotal();
}

function removeSelected(id) {
    selected_items.value = selected_items.value.filter((product) => {
        return id != product.id;
    });
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let totalProductsCostWithTax = 0;
    let totalProductsCostWithoutTax = 0;
    total_invoice_tax.value = 0;
    invoice_grand_total.value = 0;

    selected_items.value.forEach((p) => {
        p.quantity > p.stock_quantity ? (p.quantity = p.stock_quantity) : "";

        if (p.tax_type == "exclusive") {
            let item_total_with_tax =
                p.quantity * (p.sale_price * (p.tax_rate / 100) + p.sale_price);
            let item_total_without_tax = p.quantity * p.sale_price;
            totalProductsCostWithTax += item_total_with_tax;
            totalProductsCostWithoutTax += item_total_without_tax;
        } else {
            let item_total_with_tax = p.quantity * p.sale_price;
            let item_total_without_tax =
                p.quantity * ((1 / (100 - p.tax_rate)) * p.sale_price);
            totalProductsCostWithTax += item_total_with_tax;
            totalProductsCostWithoutTax += item_total_without_tax;
        }
    });

    total_invoice_tax.value =
        totalProductsCostWithoutTax * (invoice_tax_rate.value / 100);

    invoice_grand_total.value =
        shipping_cost.value +
        totalProductsCostWithTax -
        discount.value +
        total_invoice_tax.value;

    // determining payment status
    if (paid_amount.value === 0) {
        payment_status.value = "unpaid";
    } else if (paid_amount.value === invoice_grand_total.value) {
        payment_status.value = "paid";
    } else if (paid_amount.value < invoice_grand_total.value) {
        payment_status.value = "partial";
    } else if (paid_amount.value > invoice_grand_total.value) {
        paid_amount.value = invoice_grand_total.value;
        payment_status.value = "paid";
        const notifcationStore = useNotificationStore();
        notifcationStore.pushNotification({
            message: t('notifications.paid_amount_error'),
            type: "warning",
            time: 5000,
        });
    }
}

function saveSale() {
    let invoice = {
        items: selected_items.value,
        warehouse_id: selected_warehouse.value,
        party_id: selected_party.value.id,
        invoice_date: invoice_date.value,
        invoice_status: invoice_status.value,
        payment_status: payment_status.value,
        paid_amount: paid_amount.value,
        payment_method: payment_method.value,
        account_id: account_id.value,
        note: note.value,
        invoice_tax_rate: invoice_tax_rate.value,
        shipping_cost: shipping_cost.value,
        discount: discount.value,
    };
    axios
        .post(`/api/sales`, invoice)
        .then((response) => {
            router.push({ name: "sale" });
        })
        .catch((error) => {
            const notifcationStore = useNotificationStore();
            notifcationStore.pushNotification({
                message: t('notifications.error_occurred'),
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

onMounted(async () => {
    await fetchWarehouses();
    await fetchAccounts();
});
</script>

<template>
    <div class="add-invoice-page">
        <div class="page-top-box align-items-center">
            <h3 class="h5">{{ t('sales.add_new_sale') }}</h3>
        </div>
        <div class="add-invoice-contents bg-white p-3 my-3 rounded-3 shadow">
            <!-- Product, warehouse, customer selection -->
            <div class="row p-2">
                <div class="col-12 col-md-3 p-1">
                    <label class="my-1">{{ t('sales.date') }}</label>
                    <input
                        type="date"
                        class="form-control form-control-sm"
                        v-model="invoice_date"
                    />
                    <span class="v-error" v-if="validation_errors.invoice_date">
                        {{ validation_errors.invoice_date }}
                    </span>
                </div>
                <div class="col-12 col-md-3 p-1 dropdown-search-select-box ">
                    <label class="my-1">{{ t('sales.customer') }}</label>
                    <input
                        type="text"
                        class="form-control form-control-sm sqaure"
                        :placeholder="t('sales.search_customer')"
                        v-model="customer_q"
                        @keyup="fetchCustomers(customer_q)"
                    />
                    <ul
                        class="list-group dropdown-search-list"
                        v-if="customers.length > 0"
                    >
                        <li
                            @click="onSelectCustomer(c)"
                            :key="c.id"
                            class="list-group-item cursor-pointer"
                            v-for="c in customers"
                        >
                            {{ c.name }}
                        </li>
                    </ul>
                    <span class="v-error" v-if="validation_errors.party_id">
                        {{ validation_errors.party_id }}
                    </span>
                </div>
                <div class="col-12 col-md-3 p-1 ">
                    <label class="my-1">{{ t('sales.warehouse') }}</label>
                    <select
                        class="form-select form-select-sm"
                        v-model="selected_warehouse"
                        @input="onSelectWarehouse()"
                        :disabled="selected_items.length > 0 || items.length>0"
                    >
                        <option value="">{{ t('general.none') }}</option>
                        <option :value="w.id" v-for="w in warehouses">
                            {{ w.name }}
                        </option>
                    </select>
                    <span class="v-error" v-if="validation_errors.warehouse_id">
                        {{ validation_errors.warehouse_id }}
                    </span>
                </div>
                <div class="col-12 col-md-9 p-1 dropdown-search-select-box">
                    <label class="my-1">{{ t('sales.search_product') }}</label>
                    <input
                        :disabled="!selected_warehouse"
                        type="text"
                        class="form-control form-control-sm"
                        :placeholder="t('sales.search_items')"
                        v-model="product_q"
                        @keyup="fetchProducts(product_q)"
                    />
                    <ul
                        class="list-group dropdown-search-list"
                        v-if="items.length > 0"
                    >
                        <li
                            @click="onSelectProduct(p)"
                            :key="p.id"
                            class="list-group-item cursor-pointer"
                            v-for="p in items"
                        >
                            {{ p.name }}
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Mobile Card View -->
            <div class="d-block d-md-none">
                <div 
                    v-for="p in selected_items" 
                    :key="p.id"
                    class="card mb-3 border"
                >
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title mb-0">{{ p.name }}</h6>
                            <CrossSvgIcon
                                @click="removeSelected(p.id)"
                                color="red"
                                class="cursor-pointer"
                            />
                        </div>
                        
                        <div class="row g-2">
                            <div class="col-6">
                                <small class="text-muted d-block pb-1">{{ t('sales.unit_price') }}</small>
                                <div class="fw-bold">{{ p.sale_price }}</div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block  pb-1">{{ t('sales.stock') }}</small>
                                <div>
                                    <input
                                        type="number"
                                        class="form-control form-control-sm"
                                        :value="p.stock_quantity"
                                        disabled
                                    />
                                </div>
                            </div>
                            
                            <div class="col-6">
                                <small class="text-muted d-block pb-1">{{ t('sales.tax') }}</small>
                                <div>
                                    {{
                                        p.tax_type == "exclusive"
                                            ? (
                                                  p.quantity *
                                                  (p.sale_price *
                                                      (p.tax_rate / 100))
                                              ).toFixed(2)
                                            : (
                                                  p.quantity *
                                                  ((((100 - p.tax_rate) *
                                                      p.sale_price) /
                                                      100) *
                                                      (p.tax_rate / 100))
                                              ).toFixed(2)
                                    }}
                                    $
                                </div>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block pb-1">{{ t('sales.quantity') }}</small>
                                <div>
                                    <input
                                        type="number"
                                        class="form-control form-control-sm"
                                        min="1"
                                        v-model="p.quantity"
                                        @input="calculateGrandTotal()"
                                    />
                                </div>
                            </div>
                            <div class="col-12 mt-2">
                                <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                                    <small class="text-muted mb-0">{{ t('sales.subtotal') }}</small>
                                    <div class="fw-bold h6 mb-0">
                                        {{
                                            p.tax_type == "exclusive"
                                                ? p.quantity *
                                                  (p.sale_price * (p.tax_rate / 100) +
                                                      p.sale_price)
                                                : p.quantity * p.sale_price
                                        }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Message when no items selected -->
                <div v-if="selected_items.length === 0" class="text-center py-5">
                    <div class="py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-cart-x text-muted mb-3" viewBox="0 0 16 16">
                          <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793 7.354 5.646z"/>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                        <p class="text-muted mb-0">{{ t('sales.no_items_selected') }}</p>
                        <p class="text-muted small">{{ t('sales.add_products_to_get_started') }}</p>
                    </div>
                </div>
            </div>
            
            <!-- Desktop Table View -->
            <div class="d-none d-md-block">
                <div class="table-responsive">
                    <table
                        class="table bg-white table-bordered my-3 p-1"
                    >
                        <thead>
                            <tr class="bg-ass text-secondary">
                                <th class="min150">{{ t('sales.product') }}</th>
                                <th class="min100">{{ t('sales.unit_price') }}</th>
                                <th class="">{{ t('sales.stock') }}</th>
                                <th class="min100">{{ t('sales.quantity') }}</th>
                                <th class="min100">{{ t('sales.tax') }}</th>
                                <th class="min100">{{ t('sales.subtotal') }}</th>
                                <th class="min100">{{ t('sales.action') }}</th>
                            </tr>
                        </thead>
                        <tbody v-if="selected_items.length > 0">
                            <tr v-for="p in selected_items" :key="p.id">
                                <td>{{ p.name }}</td>
                                <td>{{ p.sale_price }}</td>
                                <td>
                                    <input
                                        type="number"
                                        class="max100 form-control form-control-sm"
                                        :value="p.stock_quantity"
                                        disabled
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        class="max100 form-control form-control-sm"
                                        min="1"
                                        v-model="p.quantity"
                                        @input="calculateGrandTotal()"
                                    />
                                </td>
                                <td>
                                    {{
                                        p.tax_type == "exclusive"
                                            ? (
                                                  p.quantity *
                                                  (p.sale_price *
                                                      (p.tax_rate / 100))
                                              ).toFixed(2)
                                            : (
                                                  p.quantity *
                                                  ((((100 - p.tax_rate) *
                                                      p.sale_price) /
                                                      100) *
                                                      (p.tax_rate / 100))
                                              ).toFixed(2)
                                    }}
                                    $
                                </td>
                                <td>
                                    {{
                                        p.tax_type == "exclusive"
                                            ? p.quantity *
                                              (p.sale_price * (p.tax_rate / 100) +
                                                  p.sale_price)
                                            : p.quantity * p.sale_price
                                    }}
                                </td>
                                <td>
                                    <CrossSvgIcon
                                        @click="removeSelected(p.id)"
                                        color="red"
                                        class="cursor-pointer"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Message when no items selected -->
                <div v-if="selected_items.length === 0" class="text-center py-4">
                    <p class="text-muted">{{ t('sales.no_items_selected') }}</p>
                </div>
            </div>
            
            <span class="v-error" v-if="validation_errors.items">
                {{ validation_errors.items }}
            </span>
            <!-- Order Summary -->
            <div class="row mt-1 4-3">
                <div class="col-12 col-md-5 invoice_summary mb-3 ms-auto">
                    <li class=" list-group-item bg-ass text-secondary">
                        {{ t('sales.order_summary') }}
                    </li>
                    <li class=" list-group-item">
                        <span class="text-primary">{{ t('sales.order_tax_label') }}</span>
                        {{ total_invoice_tax.toFixed(2) }}
                    </li>
                    <li class=" list-group-item">
                        <span class="text-primary">{{ t('sales.discount_label') }}</span>
                        {{ discount.toFixed(2) }}
                    </li>
                    <li class=" list-group-item">
                        <span class="text-primary">{{ t('sales.shipping_label') }}</span>
                        {{ shipping_cost.toFixed(2) }}
                    </li>
                    <li class=" list-group-item">
                        <span class="text-primary">{{ t('sales.paid_label') }}</span>
                        {{ paid_amount.toFixed(2) }}
                    </li>
                    <li class=" list-group-item">
                        <span class="text-primary">{{ t('sales.due_label') }}</span>
                        {{ (invoice_grand_total - paid_amount).toFixed(2) }}
                    </li>
                    <li class=" list-group-item bg-ass text-secondary">
                        <span class="bold h6">{{ t('sales.grand_total_label') }}</span>
                        {{ invoice_grand_total.toFixed(2) }}
                    </li>
                </div>
            </div>

            <!-- invoice tax, discount, shipping-->
            <div class="row">
                <div class="col-12 col-md-5">
                    <div class="input-group input-group-sm my-1 ">
                        <span class="input-group-text bg-ass text-secondary"
                            >{{ t('sales.order_tax') }}</span
                        >
                        <input
                            type="number"
                            class="form-control"
                            min="0"
                            v-model="invoice_tax_rate"
                            @input="calculateGrandTotal()"
                        />
                        <span class="input-group-text bg-ass text-secondary"
                            >%</span
                        >
                    </div>
                    <div class="input-group input-group-sm my-1 ">
                        <span class="input-group-text bg-ass text-secondary"
                            >{{ t('sales.discount') }}</span
                        >
                        <input
                            type="number"
                            class="form-control"
                            min="0"
                            v-model="discount"
                            @input="calculateGrandTotal()"
                        />
                        <span class="input-group-text bg-ass text-secondary"
                            >$</span
                        >
                    </div>
                    <div class="input-group input-group-sm my-1 ">
                        <span class="input-group-text bg-ass text-secondary"
                            >{{ t('sales.shipping') }}</span
                        >
                        <input
                            type="number"
                            class="form-control"
                            min="0"
                            v-model="shipping_cost"
                            @input="calculateGrandTotal()"
                        />
                        <span class="input-group-text bg-ass text-secondary"
                            >$</span
                        >
                    </div>
                </div>
            </div>

            <!-- Sale status and Payment Status -->
            <div class="row my-3">
                <div class="col-12 col-md-3 p-2">
                    <label class="my-1">{{ t('sales.sale_status') }}</label>
                    <select
                        class="form-select form-select-sm"
                        v-model="invoice_status"
                    >
                        <option value="received">{{ t('sales.status.received') }}</option>
                        <option value="pending">{{ t('sales.status.pending') }}</option>
                        <option value="ordered">{{ t('sales.status.ordered') }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-3 p-2">
                    <label class="my-1">{{ t('sales.payment_status') }}</label>
                    <select
                        class="form-select form-select-sm"
                        v-model="payment_status"
                    >
                        <option value="unpaid">{{ t('sales.status.unpaid') }}</option>
                        <option value="partial">{{ t('sales.status.partial') }}</option>
                        <option value="paid">{{ t('sales.status.paid') }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-3 p-2">
                    <label class="my-1">{{ t('sales.paid_amount') }}</label>
                    <input
                        type="number"
                        class="form-control form-control-sm"
                        min="0"
                        v-model="paid_amount"
                        @input="calculateGrandTotal()"
                    />
                </div>
                <div class="col-12 col-md-3 p-2 ">
                    <label class="my-1">{{ t('sales.select_account') }}</label>
                    <select
                        class="form-select form-select-sm"
                        v-model="account_id"
                    >
                        <option value="">{{ t('general.none') }}</option>
                        <option :value="account.id" v-for="account in accounts">
                            {{ account.name }} -- {{ account.balance }}
                        </option>
                    </select>
                    <span class="v-error" v-if="validation_errors.account_id">
                        {{ validation_errors.account_id }}
                    </span>
                </div>
                <div class="col-12 col-md-3 p-2">
                    <label class="my-1">{{ t('sales.payment_method') }}</label>
                    <select
                        class="form-select form-select-sm"
                        v-model="payment_method"
                    >
                        <option value="">{{ t('payments.methods.none') }}</option>
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
            <!-- Sale Note -->
            <div class="row my-1">
                <div class="col-12">
                    <label class="my-2">{{ t('sales.sale_note') }}</label>
                    <textarea
                        v-model="note"
                        class="form-control"
                        rows="3"
                    ></textarea>
                </div>
            </div>
            <div class="purchase_save my-4 text-center">
                <button
                    class="btn btn-sm btn-primary px-4 py-2"
                    @click="saveSale()"
                >
                    {{ t('sales.save_sale') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed */
</style>