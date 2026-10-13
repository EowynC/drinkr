<template>
    <div v-if="visible" class="modal-backdrop" role="presentation" @click.self="emit('close')">
        <section class="item-modal" role="dialog" aria-modal="true" aria-labelledby="item-modal-title">
            <div class="modal-header">
                <div>
                    <p class="modal-kicker">{{ item ? 'Edit stock item' : 'New stock item' }}</p>
                    <h2 id="item-modal-title">{{ item ? 'Edit item' : 'Add item' }}</h2>
                </div>
                <button type="button" class="close-button" aria-label="Close" @click="emit('close')">×</button>
            </div>

            <form @submit.prevent="save">
                <div class="field-group">
                    <label for="inventory-item-name">Item name</label>
                    <input id="inventory-item-name" v-model.trim="draft.name" type="text" required maxlength="120">
                </div>
                <div class="field-group">
                    <label for="inventory-item-unit">Unit</label>
                    <select id="inventory-item-unit" v-model="draft.unit" required>
                        <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                    <p class="unit-warning">Changing the unit does not convert current stock or recipe quantities. Check affected recipes before saving.</p>
                </div>

                <section class="stock-entry" aria-labelledby="stock-entry-title">
                    <div>
                        <h3 id="stock-entry-title">Add new stock</h3>
                        <p v-if="item">Current on hand: {{ formatQuantity(item.quantity, item.unit) }}</p>
                        <p>{{ item ? 'This amount will be added to the current stock.' : 'Enter the opening stock, or leave it blank to start at zero.' }}</p>
                    </div>
                    <label for="inventory-stock-amount">{{ item ? 'Quantity to add' : 'Opening quantity' }} ({{ draft.unit }})</label>
                    <input
                        id="inventory-stock-amount"
                        v-model.number="draft.stockToAdd"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                    >
                </section>

                <div class="modal-actions">
                    <button type="button" class="cancel-button" @click="emit('close')">Cancel</button>
                    <button type="submit" class="save-button">{{ item ? 'Save item' : 'Add item' }}</button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { InventoryItem, InventoryUnit } from '../database/database'

export interface InventoryItemDraft {
    name: string
    unit: InventoryUnit
    stockToAdd: number | null | ''
}

const props = defineProps<{
    visible: boolean
    item: InventoryItem | null
}>()

const emit = defineEmits<{
    close: []
    save: [draft: InventoryItemDraft]
}>()

const units: InventoryUnit[] = ['ml', 'bottle', 'gr', 'portion']
const draft = reactive<InventoryItemDraft>({ name: '', unit: 'ml', stockToAdd: null })

watch(
    () => [props.visible, props.item] as const,
    ([visible, item]) => {
        if (!visible) return
        draft.name = item?.name ?? ''
        draft.unit = item?.unit ?? 'ml'
        draft.stockToAdd = null
    },
    { immediate: true }
)

function save() {
    emit('save', { name: draft.name.trim(), unit: draft.unit, stockToAdd: draft.stockToAdd })
}

function formatQuantity(quantity: number, unit: InventoryUnit) {
    return `${Number.isInteger(quantity) ? quantity : quantity.toFixed(2)} ${unit}`
}
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    overflow-y: auto;
    padding: 1rem;
    background: rgba(8, 6, 13, 0.55);
}

.item-modal {
    width: min(100%, 460px);
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    padding: 1.5rem;
    box-sizing: border-box;
    color: var(--text-h);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow);
}

.modal-header, .modal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.modal-header {
    margin-bottom: 1.25rem;
}

.modal-header h2, .stock-entry h3 {
    margin: 0.2rem 0 0;
}

.modal-kicker {
    margin: 0;
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.close-button, .cancel-button, .save-button {
    min-height: 2.6rem;
    padding: 0.45rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: 5px;
    font: inherit;
    cursor: pointer;
}

.close-button {
    min-width: 2.6rem;
    padding: 0;
    color: var(--text-h);
    background: transparent;
    font-size: 1.5rem;
}

.field-group {
    display: grid;
    gap: 0.4rem;
    margin-bottom: 1rem;
}

.field-group label, .stock-entry label {
    color: var(--text-h);
    font-size: 0.9rem;
    font-weight: 600;
}

.field-group input, .field-group select, .stock-entry input {
    width: 100%;
    min-height: 2.6rem;
    box-sizing: border-box;
    padding: 0.45rem 0.65rem;
    color: var(--text-h);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 5px;
    font: inherit;
}

.unit-warning, .stock-entry p {
    margin: 0.15rem 0 0;
    color: var(--text);
    font-size: 0.85rem;
    line-height: 1.45;
}

.stock-entry {
    display: grid;
    gap: 0.5rem;
    margin: 1.25rem 0;
    padding: 1rem;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
}

.stock-entry h3 {
    font-size: 1rem;
}

.stock-entry p + p {
    margin-top: 0.25rem;
}

.modal-actions {
    justify-content: flex-end;
}

.cancel-button {
    color: var(--text-h);
    background: transparent;
}

.save-button {
    color: var(--text-button);
    background: var(--accent);
    border-color: var(--accent);
    font-weight: 600;
}

.close-button:focus-visible, .cancel-button:focus-visible, .save-button:focus-visible {
    outline: 3px solid var(--accent-border);
    outline-offset: 2px;
}
</style>
