<template>
    <MainLayout>
        <div class="inventory-screen">
            <header class="inventory-header">
                <div><p class="eyebrow">Back of house</p><h2>Inventory</h2></div>
                <p class="inventory-note">Stock is deducted when a sale is confirmed.</p>
            </header>

            <section class="inventory-section product-section">
                <div class="section-heading">
                    <div><p class="eyebrow">What the customer can order</p><h3>Bar products</h3></div>
                    <form class="product-form" @submit.prevent="addProduct">
                        <input v-model.trim="productForm.name" type="text" aria-label="Product name" placeholder="Drink name" required>
                        <select v-model="productForm.categoryId" aria-label="Product category" required>
                            <option disabled value="">Choose category</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                        </select>
                        <input v-model.number="productForm.price" type="number" min="0" step="0.01" aria-label="Product price" placeholder="Price" required>
                        <button type="submit">Add product</button>
                    </form>
                </div>
                <p class="product-list">{{ products.length }} products currently available in the bar:</p>
                <p class="product-list">
                    <span v-for="value in products">{{ value.name }}, </span>
                </p>
            </section>

            <section class="inventory-section">
                <div class="section-heading">
                    <div><p class="eyebrow">Ingredients and packaged stock</p><h3>On hand</h3></div>
                    <form class="stock-form" @submit.prevent="addStock">
                        <select v-model="stockForm.itemId" aria-label="Ingredient to restock" required>
                            <option disabled value="">Choose stock item</option>
                            <option v-for="item in inventoryItems" :key="item.id" :value="item.id">{{ item.name }}</option>
                        </select>
                        <input v-model.number="stockForm.amount" type="number" min="0.01" step="any" aria-label="Amount to add" placeholder="Amount" required>
                        <button type="submit">Add stock</button>
                    </form>
                </div>
                <form class="new-item-form" @submit.prevent="addInventoryItem">
                    <input v-model.trim="newItemForm.name" type="text" aria-label="New stock item name" placeholder="New stock item" required>
                    <select v-model="newItemForm.unit" aria-label="New stock item unit">
                        <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                    <input v-model.number="newItemForm.quantity" type="number" min="0" step="any" aria-label="Opening stock quantity" placeholder="Opening quantity" required>
                    <button type="submit">Add item</button>
                </form>
                <div class="stock-grid">
                    <article v-for="item in inventoryItems" :key="item.id" class="stock-item">
                        <div class="stock-item-top">
                            <h4>{{ item.name }}</h4>
                            <select :value="item.unit" :aria-label="`Unit for ${item.name}`" @change="changeUnit(item, $event)">
                                <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                            </select>
                        </div>
                        <strong>{{ formatQuantity(item.quantity, item.unit) }}</strong>
                        <p>{{ item.unit === 'ml' ? `${(item.quantity / 1000).toFixed(2)} L total` : 'Available to use' }}</p>
                    </article>
                </div>
            </section>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import MainLayout from '../components/layout/MainLayout.vue'
import { db, type Category, type InventoryItem, type InventoryUnit, type Product } from '../database/database'

const toast = useToast({ position: 'top-right' })
const inventoryItems = ref<InventoryItem[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const stockForm = reactive<{ itemId: number | ''; amount: number | null }>({ itemId: '', amount: null })
const newItemForm = reactive<{ name: string; unit: InventoryUnit; quantity: number | null }>({ name: '', unit: 'ml', quantity: null })
const productForm = reactive<{ name: string; categoryId: number | ''; price: number | null }>({ name: '', categoryId: '', price: null })
const units: InventoryUnit[] = ['ml', 'bottle', 'portion']

onMounted(loadInventory)

async function loadInventory() {
    inventoryItems.value = await db.inventoryItems.toArray()
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
}

async function addStock() {
    if (stockForm.itemId === '' || !stockForm.amount || stockForm.amount <= 0) {
        toast.warning('Choose a stock item and a valid amount.')
        return
    }

    const item = inventoryItems.value.find(value => value.id === stockForm.itemId)
    if (!item) {
        toast.error('Could not find that stock item.')
        return
    }

    try {
        await db.inventoryItems.update(item.id, { quantity: item.quantity + stockForm.amount })
        stockForm.amount = null
        await loadInventory()
        toast.success(`${item.name} stock updated.`)
    } catch (error) {
        console.error('Unable to add stock', error)
        toast.error('Unable to update stock.')
    }
}

async function addInventoryItem() {
    if (!newItemForm.name || newItemForm.quantity === null || newItemForm.quantity < 0) {
        toast.warning('Enter a valid stock item name and quantity.')
        return
    }

    const itemName = newItemForm.name

    try {
        await db.inventoryItems.add({ id: Date.now(), name: itemName, unit: newItemForm.unit, quantity: newItemForm.quantity })
        newItemForm.name = ''
        newItemForm.quantity = null
        await loadInventory()
        toast.success(`${itemName} added to inventory.`)
    } catch (error) {
        console.error('Unable to add inventory item', error)
        toast.error('Unable to add stock item.')
    }
}

async function addProduct() {
    if (!productForm.name || productForm.categoryId === '' || productForm.price === null || productForm.price < 0) {
        toast.warning('Complete the product fields before saving.')
        return
    }

    const productName = productForm.name

    try {
        await db.products.add({ id: Date.now(), name: productName, categoryId: productForm.categoryId, price: productForm.price })
        productForm.name = ''
        productForm.categoryId = ''
        productForm.price = null
        await loadInventory()
        toast.success(`${productName} added to the bar.`)
    } catch (error) {
        console.error('Unable to add product', error)
        toast.error('Unable to add product.')
    }
}

async function changeUnit(item: InventoryItem, event: Event) {
    const unit = (event.target as HTMLSelectElement).value as InventoryUnit
    if (!units.includes(unit)) {
        toast.warning('That unit is not available.')
        return
    }

    try {
        await db.inventoryItems.update(item.id, { unit })
        item.unit = unit
        toast.success(`${item.name} unit updated.`)
    } catch (error) {
        console.error('Unable to update unit', error)
        toast.error('Unable to update stock unit.')
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
.inventory-note, .stock-item p {
     color: var(--text); 
     font-size: 0.85rem; 
}
.inventory-section { 
    margin-bottom: 3rem; 
}
.stock-form, .new-item-form, .product-form { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 0.5rem; 
    justify-content: flex-end; 
}
.new-item-form { 
    margin-top: 0.75rem; 
}
.product-list { 
    margin-top: 1rem; 
    color: var(--text); 
    font-size: 0.85rem; 
}
select, input, button { 
    min-height: 2.6rem; 
    box-sizing: border-box; 
    border: 1px solid var(--border); 
    border-radius: 5px; 
    padding: 0.45rem 0.65rem; 
    font: inherit; 
}
select, input { 
    color: var(--text-h); 
    background: var(--bg); 
}
button { 
    color: var(--text-button); 
    background: var(--accent); 
    border-color: var(--accent); 
    cursor: pointer; 
    font-weight: 600; 
}
.stock-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); 
    gap: 0.8rem; margin-top: 1rem; 
}
.stock-item { 
    border: 1px solid var(--border); 
    border-radius: 6px; padding: 1rem; 
    background: var(--code-bg); 
}
.stock-item-top { 
    justify-content: space-between; 
    gap: 0.5rem; 
}
.stock-item-top select { 
    min-height: auto; 
    color: var(--accent); 
    font-size: 0.8rem; 
    font-weight: 700; 
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
@media (max-width: 700px) { 
    .inventory-screen { 
        padding: 1rem; 
    } 
    .inventory-header, .section-heading { 
        align-items: flex-start; 
        flex-direction: column; 
    } 
    .stock-form, .new-item-form, .product-form { 
        width: 100%; 
        justify-content: stretch; 
    } 
    .stock-form > *, .new-item-form > *, .product-form > * { 
        flex: 1 1 130px; 
        min-width: 0; 
    } 
}
</style>