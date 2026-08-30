<template>
    <MainLayout>
        <div class="bar-layout">
            <div class="product-screen">
                <section v-for="cat in categories" :key="cat.id" class="category">
                    <h2>{{ cat.name }}</h2>
                    <div class="product-grid">
                        <BarProductButton
                            v-for="item in products.filter(val => val.categoryId === cat.id)"
                            :key="item.id"
                            :name="item.name"
                            @sold="addToSession(item)"
                        />
                    </div>
                </section>
            </div>

            <aside class="sale-sidebar">
                <h3>Current sale</h3>
                <p v-if="sessionSales.length < 1">No sales yet</p>
                <ul class="sale-list">
                    <li v-for="item in sortedSessionSales" :key="item.id">
                        <div class="sale-item-row">
                            <button type="button" class="sale-control" aria-label="Decrease quantity" @click="subtractFromSession(item)">
                                -
                            </button>
                            <span class="sale-item-name">{{ item.name }}</span>
                            <span class="sale-quantity">x{{ item.quantity }}</span>
                            <button type="button" class="sale-control" aria-label="Increase quantity" @click="addToSession(item)">
                                +
                            </button>
                            <button type="button" class="sale-control sale-delete" aria-label="Delete item" @click="removeFromSession(item.id)">
                                ×
                            </button>
                        </div>
                    </li>
                </ul>

                <button type="button" class="confirm-sale-button" @click="confirmSessionSale">
                    Confirm sale
                </button>
            </aside>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import BarProductButton from '../components/BarProductButton.vue'
import { db, recordSales, type Product, type Sale, type Category } from '../database/database'

type SessionSaleItem = {
    id: number
    name: string
    categoryId: number
    quantity: number
}

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const sales = ref<Sale[]>([])
const sessionSales = ref<SessionSaleItem[]>([])

const sortedSessionSales = computed(() => {
    return [...sessionSales.value].sort((first, second) => {
        const firstProduct = products.value.find(item => item.id === first.id)
        const secondProduct = products.value.find(item => item.id === second.id)
        const firstCategoryId = firstProduct?.categoryId ?? first.categoryId
        const secondCategoryId = secondProduct?.categoryId ?? second.categoryId

        if (firstCategoryId !== secondCategoryId) {
            return firstCategoryId - secondCategoryId
        }

        return (firstProduct?.name ?? first.name).localeCompare(secondProduct?.name ?? second.name)
    })
})

onMounted(async () => {
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
    sales.value = await db.sales.toArray()
})

function addToSession(product: Product | SessionSaleItem) {
    const existing = sessionSales.value.find(item => item.id === product.id)

    if (existing) {
        existing.quantity += 1
        return
    }

    sessionSales.value.push({
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        quantity: 1
    })
}

function subtractFromSession(product: Product | SessionSaleItem) {
    const existing = sessionSales.value.find(item => item.id === product.id)

    if (!existing) return

    if (existing.quantity <= 1) {
        removeFromSession(existing.id)
        return
    }

    existing.quantity -= 1
}

function removeFromSession(productId: number) {
    sessionSales.value = sessionSales.value.filter(item => item.id !== productId)
}

async function confirmSessionSale() {
    if (sessionSales.value.length === 0) return

    try {
        await recordSales(sessionSales.value.map(item => ({ productId: item.id, quantity: item.quantity })))
    } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to record sale')
        return
    }

    sales.value = await db.sales.toArray()
    sessionSales.value = []
}
</script>

<style>
    .bar-layout {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-start;
        padding: 1rem;
        gap: 1rem;
        box-sizing: border-box;
    }

    .product-screen {
        flex: 1;
        display: flex;
        flex-flow: row wrap;
    }

    .category {
        border: 1px solid var(--accent-border);
        margin: 0.5rem;
        padding: 0.5rem;
    }

    .product-grid {
        width: 100%;
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-start;
    }

    .sale-sidebar {
        width: 320px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1rem;
        box-sizing: border-box;
        box-shadow: var(--shadow);
        position: sticky;
        top: 1rem;
    }

    .sale-sidebar h3 {
        margin: 0 0 1rem;
        color: var(--text-h);
    }

    .sale-list {
        list-style: none;
        padding: 0;
        margin: 0 0 1rem;
        display: flex;
        flex-flow: column;
        gap: 0.5rem;
    }

    .sale-item-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.6rem;
        border: 1px solid var(--border);
        background: var(--code-bg);
        border-radius: 6px;
    }

    .sale-item-name {
        flex: 1;
        color: var(--text-h);
        font-weight: 600;
    }

    .sale-quantity {
        min-width: 2rem;
        color: var(--accent);
        font-weight: 700;
        text-align: center;
    }

    .sale-control {
        width: 3rem;
        height: 3rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--bg);
        color: var(--text-h);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .sale-delete {
        padding: 0 0.5rem;
        color: var(--negative-feedback);
    }

    .confirm-sale-button {
        width: 100%;
        border: none;
        background: var(--accent);
        color: var(--text-button);
        border-radius: 6px;
        padding: 0.9rem 1rem;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
    }
</style>