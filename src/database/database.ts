import Dexie, { type EntityTable } from 'dexie'

export interface Recipe {
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
    recipeId: number
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

export interface RecipeIngredient {
    id?: number
    recipeId: number
    inventoryItemId: number
    quantity: number
}

const db = new Dexie('BartendrDatabase') as Dexie & {
    recipes: EntityTable<Recipe, 'id'>
    categories: EntityTable<Category, 'id'>
    sales: EntityTable<Sale, 'id'>
    inventoryItems: EntityTable<InventoryItem, 'id'>
    recipeIngredients: EntityTable<RecipeIngredient, 'id'>
}

db.version(1).stores({
    recipes: 'id, name, categoryId, price',
    categories: 'id, name, isAlcoholic',
    sales: '++id, recipeId, quantity, timestamp',
    inventoryItems: 'id, name, unit, quantity',
    recipeIngredients: '++id, recipeId, inventoryItemId'
})

export async function recordSales(items: Array<{ recipeId: number; quantity: number }>) {
    return db.transaction('rw', db.sales, db.inventoryItems, db.recipeIngredients, async () => {
        const changes = new Map<number, number>()

        for (const item of items) {
            const recipe = await db.recipeIngredients.where('recipeId').equals(item.recipeId).toArray()
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

export async function recordSale(recipeId: number, quantity: number) {
    return recordSales([{ recipeId, quantity }])
}

export { db }