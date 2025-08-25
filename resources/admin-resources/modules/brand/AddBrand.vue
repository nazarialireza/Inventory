<script setup>
import { computed, onMounted } from "vue";
import deleteUploadedFile from "../../utils/file";
import CrossSvgIcon from "../../assets/icons/cross-svg-icon.vue";
import { useBrandStore } from "./brandStore";
import UploadContainer from "../../components/fileUploader/UploadContainer.vue";
import { useI18n } from "../../composables/useI18n";

const emit = defineEmits(["close", "refreshData"]);
const { t } = useI18n();

const brandStore = useBrandStore();
const brand_data = computed(() => brandStore.current_brand_item);

async function submitData() {
    brandStore
        .addBrand(JSON.parse(JSON.stringify(brandStore.current_brand_item)))
        .then(() => {
            emit("refreshData");
            emit("close");
        })
        .catch((error) => {
            console.log("error occurred");
        });
}

async function closeAddBrandModal() {
    if (brand_data.value.logo.length > 0) {
        let fileIDsToDelete = brand_data.value.logo.map(
            (jsonObj) => jsonObj["id"]
        );
        deleteUploadedFile(fileIDsToDelete);
    }

    brandStore.resetCurrentBrandData();
    emit("close");
}

onMounted(() => {
    brandStore.resetCurrentBrandData();
});
</script>

<template>
    <div class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ t('brands.add_brand') }}</h5>
                    <button type="button" class="close">
                        <CrossSvgIcon @click="closeAddBrandModal" />
                    </button>
                </div>

                <div class="modal-body">
                    <form action="">
                        <div class="form-item">
                            <label class="my-2">{{ t('brands.brand_name') }}</label>
                            <p
                                class="text-danger"
                                v-if="brandStore.add_brand_errors.name"
                            >
                                {{ brandStore.add_brand_errors.name }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="brand_data.name"
                            />
                        </div>
                        <div class="form-item">
                            <label class="my-2">{{ t('brands.brand_slug') }}</label>
                            <p
                                class="text-danger"
                                v-if="brandStore.add_brand_errors.slug"
                            >
                                {{ brandStore.add_brand_errors.slug }}
                            </p>
                            <input
                                type="text"
                                class="form-control"
                                v-model="brand_data.slug"
                            />
                        </div>
                        <div class="form-item">
                            <UploadContainer
                                @filesUploaded="
                                    (uploadedFiles) =>
                                        (brand_data.logo = uploadedFiles)
                                "
                                :uploads="brand_data.logo"
                            />
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn btn-danger btn-sm"
                        @click="closeAddBrandModal"
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
