<template>
    <MainLayout>
        <div class="sales-screen">
            <h2>Sales</h2>

            <p v-if="groupedSales.length === 0">No sales yet.</p>

            <template v-else>
                <Tabs>
                    <Tab v-for="day in groupedSales" :key="day.key" :title="day.label">
                        <div class="sales-day-summary">
                            <h3>Daily totals</h3>
                            <div class="sales-summary-grid">
                                <div>
                                    <span>Units sold</span>
                                    <strong>{{ day.totals.units }}</strong>
                                </div>
                                <div>
                                    <span>Products sold</span>
                                    <strong>{{ day.totals.products }}</strong>
                                </div>
                                <div>
                                    <span>Total revenue</span>
                                    <strong>{{ formatCurrency(day.totals.revenue) }}</strong>
                                </div>
                            </div>
                        </div>

                        <div v-for="category in day.categories" :key="category.name" class="sales-category">
                            <h3>{{ category.name }}</h3>
                            <table class="sales-table">
                                <thead>
                                    <tr>
                                        <th style="width: 25%;" scope="col">Product</th>
                                        <th style="width: 25%;" scope="col">Amount sold</th>
                                        <th style="width: 25%;" scope="col">Price per unit</th>
                                        <th style="width: 25%;" scope="col">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="product in category.products" :key="product.name">
                                        <td>{{ product.name }}</td>
                                        <td>{{ product.quantity }}</td>
                                        <td>{{ formatCurrency(product.price ?? 0) }}</td>
                                        <td>{{ formatCurrency((product.price ?? 0) * product.quantity) }}</td>
                                    </tr>
                                    <tr class="sales-total-row">
                                        <td>Total</td>
                                        <td>{{ category.totals.units }}</td>
                                        <td>—</td>
                                        <td>{{ formatCurrency(category.totals.revenue) }}</td>
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
            totals: { units: number; revenue: number }
        }>
        totals: { units: number; revenue: number; products: number }
    }>()

    for (const sale of sales.value) {
        const dayKey = getDayKey(sale.timestamp)
        let day = days.get(dayKey)

        if (!day) {
            day = {
                key: dayKey,
                label: formatDay(sale.timestamp),
                categories: new Map(),
                totals: { units: 0, revenue: 0, products: 0 }
            }
            days.set(dayKey, day)
        }

        const product = products.value.find(item => item.id === sale.productId)
        const category = categories.value.find(item => item.id === product?.categoryId)
        const categoryId = category?.id ?? Number.MAX_SAFE_INTEGER
        const categoryName = category?.name ?? 'Unknown category'
        let categorySales = day.categories.get(categoryName)

        if (!categorySales) {
            categorySales = {
                id: categoryId,
                name: categoryName,
                products: new Map(),
                totals: { units: 0, revenue: 0 }
            }
            day.categories.set(categoryName, categorySales)
        }

        const productName = product?.name ?? 'Unknown product'
        const productSales = categorySales.products.get(productName)
        const unitPrice = product?.price ?? 0
        const saleTotal = unitPrice * sale.quantity

        if (productSales) {
            productSales.quantity += sale.quantity
        } else {
            categorySales.products.set(productName, {
                name: productName,
                quantity: sale.quantity,
                price: product?.price
            })
        }

        categorySales.totals.units += sale.quantity
        categorySales.totals.revenue += saleTotal
        day.totals.units += sale.quantity
        day.totals.revenue += saleTotal
        day.totals.products += 1
    }

    return [...days.values()]
        .sort((first, second) => second.key.localeCompare(first.key))
        .map(day => ({
            ...day,
            categories: [...day.categories.values()]
                .sort((first, second) => first.id - second.id)
                .map(category => ({
                    ...category,
                    products: [...category.products.values()].map(product => ({
                        ...product,
                        total: (product.price ?? 0) * product.quantity
                    })),
                    totals: {
                        units: category.totals.units,
                        revenue: category.totals.revenue
                    }
                })),
            totals: {
                units: day.totals.units,
                revenue: day.totals.revenue,
                products: day.totals.products
            }
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

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'EUR'
    }).format(value)
}
</script>

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

    .sales-day-summary {
        margin-bottom: 1.5rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.02);
    }

    .sales-day-summary h3 {
        margin: 0 0 0.75rem;
        color: var(--text-h);
    }

    .sales-summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .sales-summary-grid > div {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .sales-summary-grid span {
        color: var(--text);
        opacity: 0.8;
        font-size: 0.8rem;
    }

    .sales-summary-grid strong {
        color: var(--text-h);
        font-size: 1.05rem;
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

    .sales-total-row td {
        font-weight: 700;
        color: var(--text-h);
        border-top: 2px solid var(--border);
    }

    .empty-value {
        color: var(--text);
        opacity: 0.7;
    }
</style>
