<style>
    .category-wrapper {
        display: flex;
        flex-flow: row;
        justify-content: space-evenly;
        margin-bottom: 3rem;
    }
</style>

<template>
    <MainLayout>
        <h2>Sales</h2>

        <p v-if="groupedSales.length === 0">No sales yet.</p>

        <section v-for="day in groupedSales" :key="day.key">
            <h3>{{ day.label }}</h3>
            <div class="category-wrapper">
                <div v-for="category in day.categories" :key="category.name">
                    <h4>{{ category.name }}</h4>
                    <p v-for="product in category.products" :key="product.name">
                        {{ product.name }}: {{ product.quantity }}
                    </p>
                </div>
            </div>
        </section>
    </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { db, type Category, type Product, type Sale } from '../database/database';

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
            products: Map<string, { name: string; quantity: number }>
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
                quantity: sale.quantity
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