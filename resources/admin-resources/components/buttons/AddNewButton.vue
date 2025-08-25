<script setup>
import PlusSvg from "../../assets/icons/plus-svg-icon.vue";
import { useI18n } from "../../composables/useI18n";

const { t } = useI18n();
</script>
<template>
    <button class="btn btn-sm btn-primary m-1">
        <PlusSvg color="white" />
        <span class="ms-1 d-600-none">{{ t('general.add_new') }}</span>
    </button>
</template>
