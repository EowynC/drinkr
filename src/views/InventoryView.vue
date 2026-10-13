<template>
    <MainLayout>
        <div class="inventory-screen">
            <header class="inventory-header">
                <div><p class="eyebrow">Back of house</p><h2>Inventory</h2></div>
                <p class="inventory-note">Stock is deducted when a sale is confirmed.</p>
            </header>
            <section class="inventory-section">
                <div class="section-heading">
                    <div><p class="eyebrow">Ingredients and packaged stock</p><h3>On hand</h3></div>
                    <button type="button" class="add-item-button" @click="openNewItem">Add item</button>
                </div>
                <div class="stock-grid">
                    <article v-for="item in inventoryItems" :key="item.id" class="stock-item">
                        <div class="stock-item-top">
                            <h4>{{ item.name }}</h4>
                            <button type="button" class="edit-button" :aria-label="`Edit ${item.name}`" @click="openEditItem(item)">Edit</button>
                        </div>
                        <strong>{{ formatQuantity(item.quantity, item.unit) }}</strong>
                        <p>{{ item.unit === 'ml' ? `${(item.quantity / 1000).toFixed(2)} L total` : 'Available to use' }}</p>
                    </article>
                </div>
                <p v-if="inventoryItems.length === 0" class="empty-state">No stock items yet. Add an item to get started.</p>
            </section>
        </div>
        <InventoryItemModal
            :visible="showItemModal"
            :item="selectedItem"
            @close="closeItemModal"
            @save="saveInventoryItem"
        />
    </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import MainLayout from '../components/layout/MainLayout.vue'
import InventoryItemModal, { type InventoryItemDraft } from '../components/InventoryItemModal.vue'
import { db, type InventoryItem } from '../database/database'

const toast = useToast({ position: 'top-right' })
const inventoryItems = ref<InventoryItem[]>([])
const selectedItem = ref<InventoryItem | null>(null)
const showItemModal = ref(false)

onMounted(loadInventory)

async function loadInventory() {
    inventoryItems.value = await db.inventoryItems.toArray()
}

function openNewItem() {
    selectedItem.value = null
    showItemModal.value = true
}

function openEditItem(item: InventoryItem) {
    selectedItem.value = item
    showItemModal.value = true
}

function closeItemModal() {
    showItemModal.value = false
    selectedItem.value = null
}

async function saveInventoryItem(draft: InventoryItemDraft) {
    const name = draft.name.trim()
    const stockToAdd = draft.stockToAdd === null || draft.stockToAdd === '' ? 0 : draft.stockToAdd
    if (!name || !Number.isFinite(stockToAdd) || stockToAdd < 0) {
        toast.warning('Enter a valid item name and stock quantity.')
        return
    }

    try {
        if (selectedItem.value) {
            const item = selectedItem.value
            await db.transaction('rw', db.inventoryItems, async () => {
                const currentItem = await db.inventoryItems.get(item.id)
                if (!currentItem) throw new Error(`Inventory item ${item.id} no longer exists`)
                await db.inventoryItems.update(item.id, {
                    name,
                    unit: draft.unit,
                    quantity: currentItem.quantity + stockToAdd
                })
            })
            toast.success(`${name} updated.`)
        } else {
            await db.inventoryItems.add({
                id: Date.now(),
                name,
                unit: draft.unit,
                quantity: stockToAdd
            })
            toast.success(`${name} added to inventory.`)
        }
        await loadInventory()
        closeItemModal()
    } catch (error) {
        console.error('Unable to save inventory item', error)
        toast.error(selectedItem.value ? 'Unable to save stock item.' : 'Unable to add stock item.')
    }
}

function formatQuantity(quantity: number, unit: InventoryItem['unit']) {
    return `${Number.isInteger(quantity) ? quantity : quantity.toFixed(2)} ${unit}`
}
</script>

<style>
.inventory-screen {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    box-sizing: border-box;
    text-align: left;
}
.inventory-header, .section-heading, .stock-item-top {
    display: flex;
    align-items: center;
}
.inventory-header, .section-heading {
    justify-content: space-between;
    gap: 1rem;
}
.inventory-header {
    margin-bottom: 2.5rem;
}
.inventory-header h2, .section-heading h3, .stock-item h4 {
    margin: 0;
    color: var(--text-h);
}
.section-heading h3 {
    font-size: 1.5rem;
}
.eyebrow {
    margin: 0 0 0.2rem;
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.inventory-note, .stock-item p, .empty-state {
    color: var(--text);
    font-size: 0.85rem;
}
.inventory-section {
    margin-bottom: 3rem;
}
.add-item-button, .edit-button {
    min-height: 2.6rem;
    box-sizing: border-box;
    padding: 0.45rem 0.8rem;
    color: var(--text-button);
    background: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 5px;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
}
.stock-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 0.8rem;
    margin-top: 1rem;
}
.stock-item {
    min-width: 0;
    padding: 1rem;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
}
.stock-item-top {
    justify-content: space-between;
    gap: 0.5rem;
}
.stock-item-top h4 {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.edit-button {
    min-height: 2rem;
    flex: 0 0 auto;
    padding: 0.25rem 0.6rem;
    color: var(--accent);
    background: transparent;
}
.stock-item strong {
    display: block;
    margin-top: 1.2rem;
    color: var(--text-h);
    font-size: 1.5rem;
}
.stock-item p {
    margin: 0.2rem 0 0;
}
.empty-state {
    margin-top: 1.5rem;
}
.add-item-button:focus-visible, .edit-button:focus-visible {
    outline: 3px solid var(--accent-border);
    outline-offset: 2px;
}
@media (max-width: 700px) {
    .inventory-screen {
        padding: 1rem;
    }
    .inventory-header, .section-heading {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>