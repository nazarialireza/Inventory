<script setup>
import BinSvg from "../../assets/icons/bin-svg-icon.vue";
import { useI18n } from "../../composables/useI18n";

const { t } = useI18n();
</script>
<template>
    <button class="btn btn-sm btn-danger m-1 shadow">
        <BinSvg color="currentColor" />
        <span class="ms-1 d-600-none">{{ t('general.bulk_delete') }}</span>
    </button>
</template>
