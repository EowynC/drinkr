<template>
    <div v-if="visible" class="modal-backdrop" role="presentation" @click.self="closeWizard">
        <section class="recipe-wizard" role="dialog" aria-modal="true" aria-labelledby="recipe-wizard-title">
            <div class="wizard-header">
                <div>
                    <p v-if="draft.mode === 'new'" class="modal-kicker">New recipe</p>
                    <h2 v-if="draft.mode === 'new'" id="recipe-wizard-title">Build a drink recipe</h2>
                    <p v-if="draft.mode === 'existing'" class="modal-kicker">Edit recipe</p>
                    <h2 v-if="draft.mode === 'existing'" id="recipe-wizard-title">Change a drink recipe</h2>
                </div>
                <button type="button" class="icon-button" @click="closeWizard" aria-label="Close recipe wizard">×</button>
            </div>

            <div v-if="draft.mode === 'existing'" class="field-group">
                <label class="field-label" for="selected-product">Menu item</label>
                <select id="selected-product" v-model="draft.productId" aria-label="Choose menu item" required @change="emit('product-change', draft.productId)">
                    <option disabled value="">Choose menu item</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
                </select>
            </div>

            <div v-else class="product-form-grid">
                <div class="field-group">
                    <label class="field-label" for="new-product-name">Menu item name</label>
                    <input id="new-product-name" v-model.trim="draft.productName" type="text" aria-label="Menu item name" placeholder="e.g. Espresso Martini" required>
                </div>
                <div class="field-group">
                    <label class="field-label" for="new-product-category">Category</label>
                    <select id="new-product-category" v-model="draft.categoryId" aria-label="Menu item category" required>
                        <option disabled value="">Choose category</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                    </select>
                </div>
                <div class="field-group">
                    <label class="field-label" for="new-product-price">Price</label>
                    <input id="new-product-price" v-model.number="draft.price" type="number" min="0" step="0.01" aria-label="Menu item price" placeholder="Price" required>
                </div>
            </div>

            <div class="ingredient-builder">
                <div class="ingredient-header">
                    <h3>Ingredients</h3>
                    <button type="button" class="secondary-button" @click="addIngredientRow">Add ingredient</button>
                </div>

                <div v-for="(row, index) in draft.ingredientRows" :key="`row-${index}`" class="ingredient-row">
                    <select v-model="row.inventoryItemId" aria-label="Recipe ingredient" required>
                        <option disabled value="">Choose ingredient</option>
                        <option v-for="item in inventoryItems" :key="item.id" :value="item.id">{{ item.name }} ({{ item.unit }})</option>
                    </select>
                    <input v-model.number="row.quantity" type="number" min="0.01" step="any" aria-label="Ingredient quantity" placeholder="Qty" required>
                    <button type="button" class="remove-row-button" @click="removeIngredientRow(index)" aria-label="Remove ingredient">Remove</button>
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="cancel-button" @click="closeWizard">Cancel</button>
                <button type="button" class="confirm-button" :disabled="!canSave" @click="saveWizard">Save recipe</button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Category, InventoryItem, Product } from '../database/database'

export type WizardMode = 'existing' | 'new'

export interface RecipeWizardState {
    mode: WizardMode
    productId: number | ''
    productName: string
    categoryId: number | ''
    price: number | null
    ingredientRows: Array<{ inventoryItemId: number | ''; quantity: number | null }>
}

const props = defineProps<{
    visible: boolean
    modelValue: RecipeWizardState
    products: Product[]
    categories: Category[]
    inventoryItems: InventoryItem[]
}>()

const emit = defineEmits<{
    (event: 'close'): void
    (event: 'save', payload: RecipeWizardState): void
    (event: 'product-change', productId: number | ''): void
}>()

const draft = reactive<RecipeWizardState>(cloneWizard(props.modelValue))

const canSave = computed(() => {
    const hasIngredients = draft.ingredientRows.some(row => row.inventoryItemId !== '' && row.quantity !== null && row.quantity > 0)
    if (!hasIngredients) return false

    if (draft.mode === 'existing') {
        return draft.productId !== ''
    }

    return !!draft.productName.trim() && draft.categoryId !== '' && draft.price !== null && draft.price >= 0
})

watch(
    () => props.modelValue,
    (value) => {
        Object.assign(draft, cloneWizard(value))
    },
    { deep: true }
)

function cloneWizard(value: RecipeWizardState): RecipeWizardState {
    return {
        mode: value.mode,
        productId: value.productId,
        productName: value.productName,
        categoryId: value.categoryId,
        price: value.price,
        ingredientRows: value.ingredientRows.map(row => ({
            inventoryItemId: row.inventoryItemId,
            quantity: row.quantity
        }))
    }
}

function closeWizard() {
    emit('close')
}

function addIngredientRow() {
    draft.ingredientRows.push({ inventoryItemId: '', quantity: null })
}

function removeIngredientRow(index: number) {
    if (draft.ingredientRows.length === 1) {
        draft.ingredientRows[0] = { inventoryItemId: '', quantity: null }
        return
    }

    draft.ingredientRows.splice(index, 1)
}

function saveWizard() {
    if (!canSave.value) return
    emit('save', cloneWizard(draft))
}
</script>

<style scoped>
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
.wizard-header, .ingredient-header, .modal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}
.wizard-header {
    margin-bottom: 0.5rem;
}
.recipe-wizard h2, .recipe-wizard h3 {
    margin: 0;
    color: var(--text-h);
}
.modal-kicker {
    margin: 0 0 0.2rem;
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
    color: var(--text-button);
    background: var(--accent);
    border: 1px solid var(--accent);
    font-weight: 600;
}
.confirm-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.icon-button {
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-h);
    font-size: 1.3rem;
    line-height: 1;
    border-radius: 5px;
    cursor: pointer;
}
.remove-row-button {
    min-height: auto;
    padding: 0.25rem 0.45rem;
    color: var(--negative-feedback);
    background: transparent;
    border: 1px solid transparent;
    font-size: 0.8rem;
    border-radius: 5px;
    cursor: pointer;
}
@media (max-width: 700px) {
    .wizard-header, .ingredient-header, .modal-actions {
        align-items: flex-start;
        flex-direction: column;
    }
    .product-form-grid, .wizard-toggle, .ingredient-row {
        grid-template-columns: 1fr;
    }
}
</style>
