<style>
    .bar-item-button {
        min-width: 120px;
        min-height: 120px;
        width: 8rem;
        height: 8rem;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        margin: 1rem;
        background-color: var(--accent-bg);
        border: var(--accent-border);
        color: var(--accent);
        font-weight: bold;
    }

    .bar-item-cost {
        font-size: 0.8rem;
    }
</style>

<template>
    <button class="bar-item-button" @click="emit('sold')">
        <span>{{ name }}</span>
        <span class="bar-item-cost">{{ formatCurrency(cost) }}</span>
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        name:  string
        cost?: number
    }>()

    const emit = defineEmits<{
        sold: []
    }>()

    function formatCurrency(value: number | undefined) {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'EUR'
        }).format(value ?? 0)
}
</script>