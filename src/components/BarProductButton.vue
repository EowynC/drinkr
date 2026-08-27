<style>
    .bar-item-button {
        min-width: 120px;
        min-height: 120px;
        width: 8rem;
        height: 8rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem;
        background-color: var(--accent-bg);
        border: var(--accent-border);
        color: var(--accent);
        font-weight: bold;
    }
</style>

<template>
    <button class="bar-item-button" @click="emit('sold')">
        {{ name }}
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        name:  string
    }>()

    const emit = defineEmits<{
        sold: []
    }>()
</script>