import Dexie, { type EntityTable } from 'dexie'

export interface Product {
    id: number
    name: string
    categoryId: number 
    price: number
}

export interface Category {
    id: number
    name: string
    isAlcoholic: boolean
}

export interface Sale {
    id?: number
    productId: number
    quantity: number
    timestamp: Date
}

export type InventoryUnit = 'ml' | 'bottle' | 'portion'

export interface InventoryItem {
    id: number
    name: string
    unit: InventoryUnit
    quantity: number
}

export interface RecipeLine {
    id?: number
    productId: number
    inventoryItemId: number
    quantity: number
}

const db = new Dexie('DrinkrDatabase') as Dexie & {
    products: EntityTable<Product, 'id'>
    categories: EntityTable<Category, 'id'>
    sales: EntityTable<Sale, 'id'>
    inventoryItems: EntityTable<InventoryItem, 'id'>
    recipeLines: EntityTable<RecipeLine, 'id'>
}

db.version(1).stores({
    products: 'id, name, categoryId, price',
    categories: 'id, name, isAlcoholic',
    sales: '++id, productId, quantity, timestamp'
})

db.version(2).stores({
    products: 'id, name, categoryId, price',
    categories: 'id, name, isAlcoholic',
    sales: '++id, productId, quantity, timestamp',
    inventoryItems: 'id, name, unit, quantity',
    recipeLines: '++id, productId, inventoryItemId'
})

export async function recordSales(items: Array<{ productId: number; quantity: number }>) {
    return db.transaction('rw', db.sales, db.inventoryItems, db.recipeLines, async () => {
        const changes = new Map<number, number>()

        for (const item of items) {
            const recipe = await db.recipeLines.where('productId').equals(item.productId).toArray()
            for (const line of recipe) {
                changes.set(line.inventoryItemId, (changes.get(line.inventoryItemId) ?? 0) + line.quantity * item.quantity)
            }
        }

        for (const [inventoryItemId, amount] of changes) {
            const item = await db.inventoryItems.get(inventoryItemId)
            if (!item || item.quantity < amount) {
                throw new Error(`Not enough ${item?.name ?? 'inventory'} in stock`)
            }
        }

        await db.sales.bulkAdd(items.map(item => ({ ...item, timestamp: new Date() })))

        for (const [inventoryItemId, amount] of changes) {
            await db.inventoryItems.update(inventoryItemId, { quantity: (await db.inventoryItems.get(inventoryItemId))!.quantity - amount })
        }
    })
}

export async function recordSale(productId: number, quantity: number) {
    return recordSales([{ productId, quantity }])
}

export { db }