<template>
    <MainLayout>
        <div class="inventory-screen">
            <header class="inventory-header">
                <div><p class="eyebrow">Back of house</p><h2>Recipes</h2></div>
                <button type="button" class="new-recipe-button" @click="openRecipeWizard">New recipe</button>
            </header>

            <section class="inventory-section recipe-section">
                <div class="section-heading">
                    <div><p class="eyebrow">What a sale consumes</p><h3>Recipe builder</h3></div>
                </div>
                <p v-if="recipes.length === 0" class="empty-state">No recipes yet. Create a recipe to connect stock to a sale.</p>
                <div v-else class="recipe-list">
                    <article v-for="recipe in recipes" :key="recipe.product.id" class="recipe-card">
                        <div class="recipe-title">
                            <div class="recipe-title-copy">
                                <h4>{{ recipe.product.name }}</h4>
                                <p>{{ recipe.lines.length }} ingredient{{ recipe.lines.length === 1 ? '' : 's' }} per sale</p>
                            </div>
                            <button type="button" class="edit-button" @click="openRecipeWizardForItem(recipe.product.id)">Edit</button>
                        </div>
                        <ul>
                            <li v-for="line in recipe.lines" :key="line.id">
                                <span>{{ line.item.name }}</span>
                                <strong>{{ formatQuantity(line.quantity, line.item.unit) }}</strong>
                            </li>
                        </ul>
                    </article>
                </div>
            </section>
        </div>

        <div v-if="showRecipeWizard" class="modal-backdrop" role="presentation" @click.self="closeRecipeWizard">
            <section class="recipe-wizard" role="dialog" aria-modal="true" aria-labelledby="recipe-wizard-title">
                <div class="wizard-header">
                    <div>
                        <p v-if="wizard.mode == 'new'" class="modal-kicker">New recipe</p>
                        <h2 v-if="wizard.mode == 'new'" id="recipe-wizard-title">Build a drink recipe</h2>
                        <p v-if="wizard.mode == 'existing'" class="modal-kicker">Edit recipe</p>
                        <h2 v-if="wizard.mode == 'existing'" id="recipe-wizard-title">Change a drink recipe</h2>
                    </div>
                    <button type="button" class="icon-button" @click="closeRecipeWizard" aria-label="Close recipe wizard">×</button>
                </div>

                <div v-if="wizard.mode === 'existing'" class="field-group">
                    <label class="field-label" for="selected-product">Menu item</label>
                    <select id="selected-product" v-model="wizard.productId" aria-label="Choose menu item" required @change="onMenuItemChange">
                        <option disabled value="">Choose menu item</option>
                        <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
                    </select>
                </div>

                <div v-else class="product-form-grid">
                    <div class="field-group">
                        <label class="field-label" for="new-product-name">Menu item name</label>
                        <input id="new-product-name" v-model.trim="wizard.productName" type="text" aria-label="Menu item name" placeholder="e.g. Espresso Martini" required>
                    </div>
                    <div class="field-group">
                        <label class="field-label" for="new-product-category">Category</label>
                        <select id="new-product-category" v-model="wizard.categoryId" aria-label="Menu item category" required>
                            <option disabled value="">Choose category</option>
                            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                        </select>
                    </div>
                    <div class="field-group">
                        <label class="field-label" for="new-product-price">Price</label>
                        <input id="new-product-price" v-model.number="wizard.price" type="number" min="0" step="0.01" aria-label="Menu item price" placeholder="Price" required>
                    </div>
                </div>

                <div class="ingredient-builder">
                    <div class="ingredient-header">
                        <h3>Ingredients</h3>
                        <button type="button" class="secondary-button" @click="addIngredientRow">Add ingredient</button>
                    </div>

                    <div v-for="(row, index) in wizard.ingredientRows" :key="`row-${index}`" class="ingredient-row">
                        <select v-model="row.inventoryItemId" aria-label="Recipe ingredient" required>
                            <option disabled value="">Choose ingredient</option>
                            <option v-for="item in inventoryItems" :key="item.id" :value="item.id">{{ item.name }} ({{ item.unit }})</option>
                        </select>
                        <input v-model.number="row.quantity" type="number" min="0.01" step="any" aria-label="Ingredient quantity" placeholder="Qty" required>
                        <button type="button" class="remove-row-button" @click="removeIngredientRow(index)" aria-label="Remove ingredient">Remove</button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="cancel-button" @click="closeRecipeWizard">Cancel</button>
                    <button type="button" class="confirm-button" :disabled="!canSaveRecipe" @click="saveRecipe">Save recipe</button>
                </div>
            </section>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { db, type Category, type InventoryItem, type Product, type RecipeLine } from '../database/database'

type WizardMode = 'existing' | 'new'

const inventoryItems = ref<InventoryItem[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const recipeLines = ref<RecipeLine[]>([])
const showRecipeWizard = ref(false)

const wizard = reactive({
    mode: 'existing' as WizardMode,
    productId: '' as number | '',
    productName: '',
    categoryId: '' as number | '',
    price: null as number | null,
    ingredientRows: [{ inventoryItemId: '' as number | '', quantity: null as number | null }]
})

const recipes = computed(() => products.value.map(product => ({
    product,
    lines: recipeLines.value.filter(line => line.productId === product.id).map(line => ({ ...line, item: inventoryItems.value.find(item => item.id === line.inventoryItemId)! })).filter(line => line.item)
})).filter(recipe => recipe.lines.length > 0))

const canSaveRecipe = computed(() => {
    const hasIngredients = wizard.ingredientRows.some(row => row.inventoryItemId !== '' && row.quantity !== null && row.quantity > 0)
    if (!hasIngredients) return false

    if (wizard.mode === 'existing') {
        return wizard.productId !== ''
    }

    return !!wizard.productName.trim() && wizard.categoryId !== '' && wizard.price !== null && wizard.price >= 0
})

onMounted(loadInventory)

async function loadInventory() {
    inventoryItems.value = await db.inventoryItems.toArray()
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
    recipeLines.value = await db.recipeLines.toArray()
}

function openRecipeWizard() {
    showRecipeWizard.value = true
    wizard.mode = 'new'
    wizard.productId = ''
    wizard.productName = ''
    wizard.categoryId = ''
    wizard.price = null
    wizard.ingredientRows = [{ inventoryItemId: '', quantity: null }]
}

function openRecipeWizardForItem(productId: number) {
    showRecipeWizard.value = true
    wizard.mode = 'existing'
    wizard.productId = productId
    wizard.productName = ''
    wizard.categoryId = ''
    wizard.price = null
    onMenuItemChange()
}

function onMenuItemChange() {
    if (wizard.mode !== 'existing' || wizard.productId === '') {
        return
    }

    const selected = products.value.find(product => product.id === Number(wizard.productId))
    const rows = recipeLines.value
        .filter(line => line.productId === Number(wizard.productId))
        .map(line => ({
            inventoryItemId: line.inventoryItemId,
            quantity: line.quantity
        }))

    wizard.ingredientRows = rows.length > 0 ? rows : [{ inventoryItemId: '', quantity: null }]
    if (selected) {
        wizard.productName = selected.name
    }
}

function closeRecipeWizard() {
    showRecipeWizard.value = false
    wizard.productId = ''
    wizard.productName = ''
    wizard.categoryId = ''
    wizard.price = null
    wizard.ingredientRows = [{ inventoryItemId: '', quantity: null }]
}

function addIngredientRow() {
    wizard.ingredientRows.push({ inventoryItemId: '', quantity: null })
}

function removeIngredientRow(index: number) {
    if (wizard.ingredientRows.length === 1) {
        wizard.ingredientRows[0] = { inventoryItemId: '', quantity: null }
        return
    }

    wizard.ingredientRows.splice(index, 1)
}

async function saveRecipe() {
    if (!canSaveRecipe.value) return

    const validIngredients = wizard.ingredientRows.filter(row => row.inventoryItemId !== '' && row.quantity !== null && row.quantity > 0)
    if (validIngredients.length === 0) return

    try {
        if (wizard.mode === 'existing' && wizard.productId !== '') {
            const productId = Number(wizard.productId)
            await db.transaction('rw', db.recipeLines, async () => {
                await db.recipeLines.where('productId').equals(productId).delete()
                for (const row of validIngredients) {
                    await db.recipeLines.add({ productId, inventoryItemId: Number(row.inventoryItemId), quantity: Number(row.quantity) })
                }
            })
        } else {
            const productId = Date.now()
            await db.transaction('rw', db.products, db.recipeLines, async () => {
                await db.products.add({
                    id: productId,
                    name: wizard.productName.trim(),
                    categoryId: Number(wizard.categoryId),
                    price: Number(wizard.price)
                })

                for (const row of validIngredients) {
                    await db.recipeLines.add({ productId, inventoryItemId: Number(row.inventoryItemId), quantity: Number(row.quantity) })
                }
            })
        }

        closeRecipeWizard()
        await loadInventory()
    } catch (error) {
        console.error('Unable to save recipe', error)
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
.inventory-header, .section-heading, .recipe-card > div, .recipe-card li, .ingredient-header, .ingredient-row, .wizard-header, .modal-actions {
    display: flex;
    align-items: center;
}
.inventory-header, .section-heading, .wizard-header, .ingredient-header, .modal-actions {
    justify-content: space-between;
    gap: 1rem;
}
.inventory-header {
    margin-bottom: 2.5rem;
}
.inventory-header h2, .section-heading h3, .recipe-card h4, .recipe-wizard h2, .recipe-wizard h3 {
    margin: 0;
    color: var(--text-h);
}
.section-heading h3 {
    font-size: 1.5rem;
}
.eyebrow, .modal-kicker {
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
.new-recipe-button, .primary-button, .secondary-button, .confirm-button, .cancel-button, .remove-button, .remove-row-button, .icon-button {
    border-radius: 5px;
    font: inherit;
    cursor: pointer;
}
.new-recipe-button, .primary-button, .confirm-button {
    color: #fff;
    background: var(--accent);
    border: 1px solid var(--accent);
    font-weight: 600;
}
.new-recipe-button {
    min-height: 2.6rem;
    padding: 0.45rem 0.9rem;
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
.recipe-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.75rem;
}
.recipe-title-copy {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
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
.edit-button, .remove-row-button {
    min-height: auto;
    padding: 0.25rem 0.45rem;
    color: var(--negative-feedback);
    background: transparent;
    border: 1px solid transparent;
    font-size: 0.8rem;
}
.edit-button {
    color: var(--accent);
}
.icon-button {
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-h);
    font-size: 1.3rem;
    line-height: 1;
}
.empty-state {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px dashed var(--border);
}
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(8, 6, 13, 0.55);
}
.recipe-wizard {
    width: min(100%, 680px);
    max-height: min(90vh, 760px);
    overflow: auto;
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    box-shadow: var(--shadow);
    box-sizing: border-box;
}
.wizard-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 1rem 0 1.25rem;
}
.wizard-toggle label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-h);
    background: var(--code-bg);
}
.product-form-grid, .field-group, .ingredient-builder {
    display: grid;
    gap: 0.9rem;
}
.product-form-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 1.2rem;
}
.field-group {
    width: 100%;
}
.field-label {
    color: var(--text-h);
    font-size: 0.8rem;
    font-weight: 600;
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
.secondary-button, .cancel-button {
    color: var(--text-h);
    background: transparent;
    border: 1px solid var(--border);
    font-weight: 600;
}
.secondary-button, .cancel-button, .confirm-button {
    min-height: 2.6rem;
    padding: 0.45rem 0.8rem;
}
.ingredient-builder {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}
.ingredient-row {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(120px, 0.9fr) auto;
    gap: 0.75rem;
    align-items: center;
    margin-top: 0.75rem;
}
.modal-actions {
    margin-top: 1.5rem;
}
.cancel-button {
    flex: 1;
}
.confirm-button {
    flex: 1.5;
}
.confirm-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
@media (max-width: 700px) {
    .inventory-screen {
        padding: 1rem;
    }
    .inventory-header, .section-heading, .wizard-header, .ingredient-header, .modal-actions {
        align-items: flex-start;
        flex-direction: column;
    }
    .product-form-grid, .wizard-toggle, .ingredient-row {
        grid-template-columns: 1fr;
    }
    .recipe-card {
        grid-template-columns: 1fr;
    }
}
</style>
