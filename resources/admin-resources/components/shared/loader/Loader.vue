<script setup></script>

<template>
    <div class="loader_container">
        <div class="circular-loader">
            <svg class="spinner" viewBox="25 25 50 50">
                <circle cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"></circle>
            </svg>
        </div>
    </div>
</template>

<style scoped>
.loader_container {
    width: 100%;
    min-width: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px 0px 50px;
    /* Ensure the loader is centered even when used in different contexts */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    /* Override any parent padding/margin that might affect centering */
    box-sizing: border-box;
}

.circular-loader {
    width: 80px;
    height: 80px;
    /* Ensure the loader itself is centered within the container */
    display: flex;
    justify-content: center;
    align-items: center;
}

.spinner {
    animation: rotate 2s linear infinite;
    height: 80px;
    transform-origin: center center;
    width: 80px;
    position: relative;
}

.spinner circle {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
    stroke-linecap: round;
    stroke: #3485f0;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}
</style>