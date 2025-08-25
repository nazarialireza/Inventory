<script setup>
import FilterSvg from "../../assets/icons/filter-svg-icon.vue";
import { useI18n } from "../../composables/useI18n";

const { t } = useI18n();
</script>
<template>
    <button class="btn btn-sm btn-outline-info m-1">
        <FilterSvg color="currentColor" />
        <span class="ms-1 d-600-none">{{ t('general.filter') }}</span>
    </button>
</template>
