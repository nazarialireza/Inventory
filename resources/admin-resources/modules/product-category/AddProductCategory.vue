<script setup>
import { computed, onMounted } from "vue";
import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import { useProductCategoryStore } from "./productCategoryStore";
import UploadContainer from "../../components/fileUploader/UploadContainer.vue";
import deleteUploadedFile from "../../utils/file";
import { useI18n } from "../../composables/useI18n";

const emit = defineEmits(["close", "refreshData"]);

const { t } = useI18n();
const productCategoryStore = useProductCategoryStore();
const product_category_data = computed(
    () => productCategoryStore.current_product_category_item
);

async function submitData() {
    productCategoryStore
        .addProductCategory(
            JSON.parse(
                JSON.stringify(
                    productCategoryStore.current_product_category_item
                )
            )
        )
        .then(() => {
            emit("refreshData");
            emit("close");
        })
        .catch((error) => {
            console.log("error occurred");
        });
}

async function closeAddProductCategoryModal() {

    if (product_category_data.value.thumbnail.length > 0) {
        let fileIDsToDelete = product_category_data.value.thumbnail.map(
            (jsonObj) => jsonObj["id"]
        );
        deleteUploadedFile(fileIDsToDelete);
    }

    productCategoryStore.resetCurrentProductCategoryData();
    emit("close");
}

onMounted(() => {
    productCategoryStore.resetCurrentProductCategoryData();
});
</script>

<template>
    <div class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('categories.add_category') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeAddProductCategoryModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <form action="">
                        <div class="form-item">
                            <label class="my-2">{{ t('categories.category_name') }}</label>
                            <p
                                class="text-danger"
                                v-if="
                                    productCategoryStore
                                        .add_product_category_errors.name
                                "
                            >
                                {{
                                    productCategoryStore
                                        .add_product_category_errors.name
                                }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="product_category_data.name"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('categories.category_slug') }}</label>
                            <p
                                class="text-danger"
                                v-if="
                                    productCategoryStore
                                        .add_product_category_errors.slug
                                "
                            >
                                {{
                                    productCategoryStore
                                        .add_product_category_errors.slug
                                }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="product_category_data.slug"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('categories.category_thumbnail') }}</label>
                            <UploadContainer
                                @filesUploaded="
                                    (uploadedFiles) =>
                                        (product_category_data.thumbnail =
                                            uploadedFiles)
                                "
                            />
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeAddProductCategoryModal"
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
