<style>
    .bar-item-button {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem;
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