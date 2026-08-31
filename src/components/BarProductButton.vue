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
        gap: 0.2rem;
    }

    .bar-item-cost {
        font-size: 0.8rem;
    }

    .bar-item-snips {
        font-size: 0.72rem;
        opacity: 0.85;
    }
</style>

<template>
    <button class="bar-item-button" @click="emit('sold')">
        <span>{{ name }}</span>
        <span class="bar-item-cost">{{ formatCurrency(cost) }}</span>
        <span v-if="showSnipPricing" class="bar-item-snips">{{ snipLabel }}</span>
    </button>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { calculateSnipCount, DEFAULT_SETTINGS } from '../settings'

    const props = defineProps<{
        name:  string
        cost?: number
        showSnipPricing?: boolean
        snipBasePrice?: number
    }>()

    const snipBasePrice = computed(() => props.snipBasePrice ?? DEFAULT_SETTINGS.pricing.snipBasePrice)

    const snipLabel = computed(() => {
        const snipCount = calculateSnipCount(props.cost ?? 0, snipBasePrice.value)
        return `${snipCount} ${snipCount === 1 ? 'snip' : 'snips'}`
    })

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