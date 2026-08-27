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
        justify-content: start;

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
        </div>

        <SaleQuantityModal
            v-if="selectedProduct"
            :product-name="selectedProduct.name"
            @cancel="selectedProduct = null"
            @confirm="confirmSale"
        />
    </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../components/layout/MainLayout.vue'
import BarProductButton from '../components/BarProductButton.vue'
import SaleQuantityModal from '../components/SaleQuantityModal.vue'
import { db, type Product, type Sale, type Category } from '../database/database'
import { onMounted, ref } from 'vue'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const sales = ref<Sale[]>([])
const selectedProduct = ref<Product | null>(null)

onMounted(async () => {
    products.value = await db.products.toArray()
    categories.value = await db.categories.toArray()
    sales.value = await db.sales.toArray()
})

function sell(product: Product) {
    selectedProduct.value = product
}

async function confirmSale(quantity: number) {
    if (!selectedProduct.value) return

    const newSale = {
        productId: selectedProduct.value.id,
        quantity,
        timestamp: new Date()
    }

    await db.sales.add(newSale)

    sales.value = await db.sales.toArray()
    selectedProduct.value = null
}
</script>