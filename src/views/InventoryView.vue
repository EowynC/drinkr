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
                <p class="product-list">{{ products.length }} products currently available in the bar.</p>
            </section>

            <section class="inventory-section">
                <div class="section-heading">
                    <div><p class="eyebrow">Ingredients and packaged stock</p><h3>On hand</h3></div>
                    <form class="stock-form" @submit.prevent="addStock">
                        <select v-model="stockForm.itemId" aria-label="Ingredient to restock" required>
                            <option disabled value="">Choose ingredient</option>
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

            <section class="inventory-section recipe-section">
                <div class="section-heading">
                    <div><p class="eyebrow">What a sale consumes</p><h3>Recipes</h3></div>
                    <form class="recipe-form" @submit.prevent="addRecipeLine">
                        <select v-model="recipeForm.productId" aria-label="Product recipe" required>
                            <option disabled value="">Choose product</option>
                            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
                        </select>
                        <select v-model="recipeForm.inventoryItemId" aria-label="Recipe ingredient" required>
                            <option disabled value="">Choose ingredient</option>
                            <option v-for="item in inventoryItems" :key="item.id" :value="item.id">{{ item.name }} ({{ item.unit }})</option>
                        </select>
                        <input v-model.number="recipeForm.quantity" type="number" min="0.01" step="any" aria-label="Recipe quantity" placeholder="Qty" required>
                        <button type="submit">Add ingredient</button>
                    </form>
                </div>
                <p v-if="recipes.length === 0" class="empty-state">No recipes yet. Add an ingredient above to connect stock to a sale.</p>
                <div v-else class="recipe-list">
                    <article v-for="recipe in recipes" :key="recipe.product.id" class="recipe-card">
                        <div><h4>{{ recipe.product.name }}</h4><p>&nbsp;{{ recipe.lines.length }} ingredient{{ recipe.lines.length === 1 ? '' : 's' }} per sale</p></div>
                        <ul>
                            <li v-for="line in recipe.lines" :key="line.id"><span>{{ line.item.name }}</span><strong>{{ formatQuantity(line.quantity, line.item.unit) }}</strong><button type="button" class="remove-button" @click="removeRecipeLine(line.id)">Remove</button></li>
                        </ul>
                    </article>
                </div>
            </section>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { db, type Category, type InventoryItem, type InventoryUnit, type Product, type RecipeLine } from '../database/database'

const inventoryItems = ref<InventoryItem[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const recipeLines = ref<RecipeLine[]>([])
const stockForm = reactive<{ itemId: number | ''; amount: number | null }>({ itemId: '', amount: null })
const recipeForm = reactive<{ productId: number | ''; inventoryItemId: number | ''; quantity: number | null }>({ productId: '', inventoryItemId: '', quantity: null })
const newItemForm = reactive<{ name: string; unit: InventoryUnit; quantity: number | null }>({ name: '', unit: 'ml', quantity: null })
const productForm = reactive<{ name: string; categoryId: number | ''; price: number | null }>({ name: '', categoryId: '', price: null })
const units: InventoryUnit[] = ['ml', 'bottle', 'portion']

const recipes = computed(() => products.value.map(product => ({
    product,
    lines: recipeLines.value.filter(line => line.productId === product.id).map(line => ({ ...line, item: inventoryItems.value.find(item => item.id === line.inventoryItemId)! })).filter(line => line.item)
})).filter(recipe => recipe.lines.length > 0))

onMounted(loadInventory)

async function loadInventory() {
    inventoryItems.value = await db.inventoryItems.toArray()
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
    recipeLines.value = await db.recipeLines.toArray()
}

async function addStock() {
    if (stockForm.itemId === '' || !stockForm.amount || stockForm.amount <= 0) return
    const item = inventoryItems.value.find(value => value.id === stockForm.itemId)
    if (!item) return
    await db.inventoryItems.update(item.id, { quantity: item.quantity + stockForm.amount })
    stockForm.amount = null
    await loadInventory()
}

async function addInventoryItem() {
    if (!newItemForm.name || newItemForm.quantity === null || newItemForm.quantity < 0) return
    await db.inventoryItems.add({ id: Date.now(), name: newItemForm.name, unit: newItemForm.unit, quantity: newItemForm.quantity })
    newItemForm.name = ''
    newItemForm.quantity = null
    await loadInventory()
}

async function addProduct() {
    if (!productForm.name || productForm.categoryId === '' || productForm.price === null || productForm.price < 0) return
    await db.products.add({ id: Date.now(), name: productForm.name, categoryId: productForm.categoryId, price: productForm.price })
    productForm.name = ''
    productForm.categoryId = ''
    productForm.price = null
    await loadInventory()
}

async function changeUnit(item: InventoryItem, event: Event) {
    const unit = (event.target as HTMLSelectElement).value as InventoryUnit
    if (!units.includes(unit)) return
    await db.inventoryItems.update(item.id, { unit })
    item.unit = unit
}

async function addRecipeLine() {
    if (recipeForm.productId === '' || recipeForm.inventoryItemId === '' || !recipeForm.quantity || recipeForm.quantity <= 0) return
    await db.recipeLines.add({ productId: recipeForm.productId, inventoryItemId: recipeForm.inventoryItemId, quantity: recipeForm.quantity })
    recipeForm.quantity = null
    await loadInventory()
}

async function removeRecipeLine(lineId: number | undefined) {
    if (lineId === undefined) return
    await db.recipeLines.delete(lineId)
    await loadInventory()
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
.inventory-header, .section-heading, .stock-item-top, .recipe-card > div, .recipe-card li { 
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
.inventory-header h2, .section-heading h3, .stock-item h4, .recipe-card h4 { 
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
.inventory-note, .stock-item p, .recipe-card p {
     color: var(--text); 
     font-size: 0.85rem; 
}
.inventory-section { 
    margin-bottom: 3rem; 
}
.stock-form, .new-item-form, .product-form, .recipe-form { 
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
    color: #fff; 
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
.stock-item, .recipe-card { 
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
.stock-item p, .recipe-card p { 
    margin: 0.2rem 0 0; 
}
.recipe-list { 
    display: grid; 
    gap: 0.8rem; 
    margin-top: 1rem;
}
.recipe-card { 
    display: grid; 
    grid-template-columns: minmax(160px, 0.7fr) 1fr; 
    gap: 1rem; 
}
.recipe-card ul { 
    padding: 0; 
    margin: 0; 
    list-style: none; 
}
.recipe-card li { 
    justify-content: flex-end; 
    gap: 0.8rem; 
    padding: 0.35rem 0; 
    border-bottom: 1px solid var(--border); 
}
.recipe-card li span { 
    flex: 1; 
}
.recipe-card li strong { 
    color: var(--text-h); 
}
.remove-button { 
    min-height: auto; 
    padding: 0.25rem 0.45rem; 
    color: var(--negative-feedback); 
    background: transparent; 
    border-color: transparent; 
    font-size: 0.8rem; 
}
.empty-state { 
    margin-top: 1rem; 
    padding: 1rem; 
    border: 1px dashed var(--border); 
}
@media (max-width: 700px) { 
    .inventory-screen { 
        padding: 1rem; 
    } 
    .inventory-header, .section-heading { 
        align-items: flex-start; 
        flex-direction: column; 
    } 
    .stock-form, .new-item-form, .product-form, .recipe-form { 
        width: 100%; 
        justify-content: stretch; 
    } 
    .stock-form > *, .new-item-form > *, .product-form > *, .recipe-form > * { 
        flex: 1 1 130px; 
        min-width: 0; 
    } 
    .recipe-card { 
        grid-template-columns: 1fr; 
    } 
}
</style>