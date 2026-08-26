<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(8, 6, 13, 0.55);
}

.quantity-modal {
    width: min(100%, 360px);
    padding: 1.5rem;
    color: var(--text-h);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow);
    box-sizing: border-box;
}

.modal-kicker,
.quantity-label {
    margin: 0;
}

.modal-kicker {
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.quantity-modal h2 {
    margin: 0.25rem 0 1.5rem;
}

.quantity-label {
    text-align: center;
}

.quantity-stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 1rem 0 1.5rem;
}

.stepper-button,
.cancel-button,
.confirm-button {
    min-height: 52px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font: inherit;
    cursor: pointer;
}

.stepper-button {
    width: 64px;
    color: var(--text-h);
    background: var(--code-bg);
    font-size: 2rem;
    line-height: 1;
}

.stepper-button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.quantity-value {
    min-width: 3rem;
    color: var(--text-h);
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
}

.modal-actions {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 0.75rem;
}

.cancel-button {
    color: var(--text-h);
    background: transparent;
}

.confirm-button {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
}

.stepper-button:focus-visible,
.cancel-button:focus-visible,
.confirm-button:focus-visible {
    outline: 3px solid var(--accent-border);
    outline-offset: 2px;
}
</style>

<template>
    <div class="modal-backdrop" role="presentation" @click.self="emit('cancel')">
        <section
            class="quantity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quantity-title"
        >
            <p class="modal-kicker">Confirm sale</p>
            <h2 id="quantity-title">{{ productName }}</h2>
            <p class="quantity-label">How many?</p>

            <div class="quantity-stepper" aria-label="Sale quantity">
                <button
                    type="button"
                    class="stepper-button"
                    aria-label="Decrease quantity"
                    :disabled="quantity <= 1"
                    @click="decrease"
                >
                    -
                </button>
                <output class="quantity-value" aria-live="polite">{{ quantity }}</output>
                <button
                    type="button"
                    class="stepper-button"
                    aria-label="Increase quantity"
                    @click="increase"
                >
                    +
                </button>
            </div>

            <div class="modal-actions">
                <button type="button" class="cancel-button" @click="emit('cancel')">
                    Cancel
                </button>
                <button type="button" class="confirm-button" @click="emit('confirm', quantity)">
                    Confirm sale
                </button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
    productName: string
}>()

const emit = defineEmits<{
    cancel: []
    confirm: [quantity: number]
}>()

const quantity = ref(1)

function decrease() {
    if (quantity.value > 1) quantity.value--
}

function increase() {
    quantity.value++
}
</script>