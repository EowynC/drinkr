<template>
    <MainLayout>
        <div class="inventory-screen">
            <header class="inventory-header">
                <div><p class="eyebrow">Back of house</p><h2>Recipes</h2></div>
                <p class="inventory-note">Each sale consumes the ingredients below for that drink.</p>
            </header>

            <section class="inventory-section recipe-section">
                <div class="section-heading">
                    <div><p class="eyebrow">What a sale consumes</p><h3>Recipe builder</h3></div>
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
import { db, type InventoryItem, type Product, type RecipeLine } from '../database/database'

const inventoryItems = ref<InventoryItem[]>([])
const products = ref<Product[]>([])
const recipeLines = ref<RecipeLine[]>([])
const recipeForm = reactive<{ productId: number | ''; inventoryItemId: number | ''; quantity: number | null }>({ productId: '', inventoryItemId: '', quantity: null })

const recipes = computed(() => products.value.map(product => ({
    product,
    lines: recipeLines.value.filter(line => line.productId === product.id).map(line => ({ ...line, item: inventoryItems.value.find(item => item.id === line.inventoryItemId)! })).filter(line => line.item)
})).filter(recipe => recipe.lines.length > 0))

onMounted(loadInventory)

async function loadInventory() {
    inventoryItems.value = await db.inventoryItems.toArray()
    products.value = await db.products.toArray()
    recipeLines.value = await db.recipeLines.toArray()
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
.inventory-header, .section-heading, .recipe-card > div, .recipe-card li {
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
.inventory-header h2, .section-heading h3, .recipe-card h4 {
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
.inventory-note, .recipe-card p {
    color: var(--text);
    font-size: 0.85rem;
}
.inventory-section {
    margin-bottom: 3rem;
}
.recipe-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
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
.recipe-list {
    display: grid;
    gap: 0.8rem;
    margin-top: 1rem;
}
.recipe-card {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1rem;
    background: var(--code-bg);
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
    .recipe-form {
        width: 100%;
        justify-content: stretch;
    }
    .recipe-form > * {
        flex: 1 1 130px;
        min-width: 0;
    }
    .recipe-card {
        grid-template-columns: 1fr;
    }
}
</style>
