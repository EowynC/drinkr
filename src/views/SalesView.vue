<template>
    <MainLayout>
        <h2>Sales</h2>

        <ul>
            <li v-for="sale in sales" :key="sale.id">
                {{ getProductName(sale.productId) }}
                × {{ sale.quantity }}
                — {{ sale.timestamp.toLocaleDateString() }} {{ sale.timestamp.toLocaleTimeString() }}
            </li>
        </ul>
    </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MainLayout from '../components/layout/MainLayout.vue';
import { db, type Product, type Sale } from '../database/database';

const sales = ref<Sale[]>([])
const products = ref<Product[]>([])

onMounted(async () => {
    products.value = await db.products.toArray()
    sales.value = await db.sales.toArray()
})

function getProductName(productId: number) {
    return products.value.find(p => p.id === productId)?.name ?? 'Unknown product'
}
</script>