<script setup>
import { ref, computed, onMounted } from "vue";
import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import ImagesBox from "../../components/img/ImagesBox.vue";
import Loader from "../../components/shared/loader/Loader.vue";
import { useProductStore } from "./productStore";
import { useI18n } from "../../composables/useI18n";

const props = defineProps(["product_id"]);
const emit = defineEmits(["close"]);

const { t } = useI18n();
const loading = ref(false);
const productStore = useProductStore();
const product_data = computed(() => productStore.current_product_item);

async function fetchData(id) {
    loading.value = true;
    await productStore.fetchProduct(id);
    loading.value = false;
}

async function closeViewProductModal() {
    productStore.resetCurrentProductData();
    emit("close");
}

onMounted(() => {
    fetchData(props.product_id);
});
</script>

<template>
    <div class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('products.product_details') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeViewProductModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <Loader v-if="loading" />
                    <div class="form-items" v-if="loading == false">
                        <form action="">
                            <div class="form-item">
                                <label class="my-2">{{ t('products.product_name') }}</label>
                                <input
                                    disabled
                                    type="text"
                                    class="form-control"
                                    :value="product_data.name"
                                />
                            </div>
                            <div class="form-item">
                                <label class="my-2">{{ t('products.product_slug') }}</label>
                                <input
                                    disabled
                                    type="text"
                                    class="form-control"
                                    :value="product_data.slug"
                                />
                            </div>
                            <div class="row">
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('products.code') }}</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.code"
                                    />
                                </div>
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('products.barcode_symbology') }}</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.barcode_symbology"
                                    />
                                </div>
                            </div>
                            <div class="row">
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('categories.category') }}</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.category.name"
                                    />
                                </div>
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('brands.brand') }}</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.brand.name"
                                    />
                                </div>
                            </div>
                            <div class="row">
                                <!-- stock alert quantity -->
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('products.stock_alert_quantity') }}</label>
                                    <input
                                        disabled
                                        type="number"
                                        class="form-control"
                                        :value="
                                            product_data.stock_alert_quantity
                                        "
                                    />
                                </div>
                                <!-- product unit -->
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('products.product_unit') }}</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.unit.name"
                                    /> 
                                </div>
                                <!-- product Sale unit -->
                                <!-- <div class="form-item col-sm-6">
                                    <label class="my-2">Purchase Unit</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.purchase_unit.name"
                                    />
                                </div> -->
                                <!-- product Sale unit -->
                                <!-- <div class="form-item col-sm-6">
                                    <label class="my-2">Sale Unit</label>
                                    <input
                                        disabled
                                        type="text"
                                        class="form-control"
                                        :value="product_data.sale_unit.name"
                                    />
                                </div> -->

                                <!-- purchase price -->
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('products.purchase_price') }}</label>
                                    <input
                                        disabled
                                        class="form-control"
                                        type="number"
                                        :value="product_data.purchase_price"
                                    />
                                </div>
                                <!-- sale price -->
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('products.sale_price') }}</label>
                                    <input
                                        disabled
                                        class="form-control"
                                        type="number"
                                        :value="product_data.sale_price"
                                    />
                                </div>
                                <!-- tax -->
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('taxes.tax') }}</label>
                                    <input
                                        disabled
                                        class="form-control"
                                        type="text"
                                        :value="product_data.tax?product_data.tax.name:''"
                                    />
                                </div>
                                <!-- tax type-->
                                <div class="form-item col-sm-6">
                                    <label class="my-2">{{ t('taxes.tax_type') }}</label>
                                    <input
                                        disabled
                                        class="form-control"
                                        type="text"
                                        :value="product_data.tax_type"
                                    />
                                </div>
                            </div>

                            <div class="form-item mt-4">
                                <label class="my-2">{{ t('products.product_images') }}</label>
                                <ImagesBox :images="product_data.gallery" />
                            </div>

                            <div class="form-item mt-4">
                                <label class="my-2">{{ t('products.description') }}</label>
                                <textarea
                                    disabled
                                    :value="product_data.description"
                                    class="form-control"
                                    rows="5"
                                ></textarea>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
