<style>
    .sales-screen {
        width: 100%;
        text-align: left;
        padding: 1rem;
        box-sizing: border-box;
    }

    .sales-category {
        margin-bottom: 2rem;
    }

    .sales-category h3 {
        margin: 0 0 0.75rem;
        color: var(--text-h);
    }

    .sales-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .sales-table th,
    .sales-table td {
        padding: 0.7rem 0.75rem;
        border-bottom: 1px solid var(--border);
    }

    .sales-table th {
        color: var(--text);
        font-size: 0.85rem;
        font-weight: 600;
    }

    .sales-table th:not(:first-child),
    .sales-table td:not(:first-child) {
        text-align: right;
    }

    .empty-value {
        color: var(--text);
        opacity: 0.7;
    }
</style>

<template>
    <MainLayout>
        <div class="sales-screen">
            <h2>Sales</h2>

            <p v-if="groupedSales.length === 0">No sales yet.</p>

            <template v-else>
                <Tabs>
                    <Tab v-for="day in groupedSales" :key="day.key" :title="day.label">
                        <div v-for="category in day.categories" :key="category.name" class="sales-category">
                            <h3>{{ category.name }}</h3>
                            <table class="sales-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Product</th>
                                        <th scope="col">Amount sold</th>
                                        <th scope="col">Price per unit</th>
                                        <th scope="col">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="product in category.products" :key="product.name">
                                        <td>{{ product.name }}</td>
                                        <td>{{ product.quantity }}</td>
                                        <td>{{ product.price }}</td>
                                        <td>{{ (product.price ?? 1) * product.quantity }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Tab>
                </Tabs>
            </template>
        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import Tabs from '../components/Tabs.vue'
import Tab from '../components/Tab.vue'
import { db, type Category, type Product, type Sale } from '../database/database'

const sales = ref<Sale[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])

const groupedSales = computed(() => {
    const days = new Map<string, {
        key: string
        label: string
        categories: Map<string, {
            id: number
            name: string
            products: Map<string, { name: string; quantity: number; price?: number | undefined }>
        }>
    }>()

    for (const sale of sales.value) {
        const dayKey = getDayKey(sale.timestamp)
        let day = days.get(dayKey)

        if (!day) {
            day = {
                key: dayKey,
                label: formatDay(sale.timestamp),
                categories: new Map()
            }
            days.set(dayKey, day)
        }

        const product = products.value.find(item => item.id === sale.productId)
        const category = categories.value.find(item => item.id === product?.categoryId)
        const categoryId = category?.id ?? Number.MAX_SAFE_INTEGER
        const categoryName = category?.name ?? 'Unknown category'
        let categorySales = day.categories.get(categoryName)

        if (!categorySales) {
            categorySales = { id: categoryId, name: categoryName, products: new Map() }
            day.categories.set(categoryName, categorySales)
        }

        const productName = product?.name ?? 'Unknown product'
        const productSales = categorySales.products.get(productName)

        if (productSales) {
            productSales.quantity += sale.quantity
        } else {
            categorySales.products.set(productName, {
                name: productName,
                quantity: sale.quantity,
                price: product?.price
        })
    }
    }

    return [...days.values()]
        .sort((first, second) => second.key.localeCompare(first.key))
        .map(day => ({
            ...day,
            categories: [...day.categories.values()]
                .sort((first, second) => first.id - second.id)
                .map(category => ({
                    ...category,
                    products: [...category.products.values()]
                }))
        }))
})

onMounted(async () => {
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
    sales.value = await db.sales.toArray()
})

function getDayKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDay(date: Date) {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
</script>