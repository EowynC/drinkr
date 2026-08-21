<template>
    <main>
        <h1>Drinkr</h1>

        <template v-for="item in products" :key="item.id">
            <BarProductButton
                :name="item.name"
                @sold="sell(item)"
            />
        </template>

        <h2>Sales</h2>

        <ul>
            <li v-for="sale in sales" :key="sale.id">
                {{ getProductName(sale.productId) }}
                × {{ sale.quantity }}
                — {{ sale.timestamp.toLocaleDateString() }} {{ sale.timestamp.toLocaleTimeString() }}
            </li>
        </ul>

        <p>
            Sold: {{ sales.length }}
        </p>
    </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BarProductButton from './components/BarProductButton.vue'
import { db, type Product, type Sale } from './database/database'

const products = ref<Product[]>([])
const sales = ref<Sale[]>([])

onMounted(async () => {
    products.value = await db.products.toArray()
    sales.value = await db.sales.toArray()
})

async function sell(sold: Product) {
    const newSale = {
        productId: sold.id!,
        quantity: 1,
        timestamp: new Date()
    }

    try {
        const id = await db.sales.add(newSale)

        console.log('Sale saved:', id)

        sales.value = await db.sales.toArray()
    } catch (error) {
        console.error('Failed to save sale:', error)
    }
}

function getProductName(productId: number) {
    return products.value.find(p => p.id === productId)?.name ?? 'Unknown product'
}
</script>