<style>
    .bar-item-button {
        width: 150px;
        height: 150px;
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