<style>
    .categories {
        width: 100%;
        display: flex;
        flex-flow: column;
    }

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

            <section v-for="cat in categories" class="category">
                {{ cat.name }}
                <div class="product-grid">
                    <BarProductButton
                        v-for="item in products.filter(val => val.categoryId == cat.id)"
                        :key="item.id"
                        :name="item.name"
                        @sold="sell(item)"
                    />
                </div>
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
import { db, type Product, type Sale, type Category } from '../database/database'
import { onMounted, ref } from 'vue'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const sales = ref<Sale[]>([])

onMounted(async () => {
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
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