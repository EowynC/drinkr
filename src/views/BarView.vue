<style>
    .product-grid {
        width: 100%;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-around;

    }
</style>

<template>
    <MainLayout>
        <div class="bar-screen">

            <section class="product-grid">
                <BarProductButton
                    v-for="item in products"
                    :key="item.id"
                    :name="item.name"
                    @sold="sell(item)"
                />
            </section>

            <section class="bar-status">
                Sold: {{ sales.length }}
            </section>

        </div>
    </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../components/layout/MainLayout.vue'
import BarProductButton from '../components/BarProductButton.vue'
import { db, type Product, type Sale } from '../database/database'
import { onMounted, ref } from 'vue'

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

    await db.sales.add(newSale)

    sales.value = await db.sales.toArray()
}
</script>