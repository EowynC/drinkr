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
    saleGroupId?: string
}

export type InventoryUnit = 'ml' | 'bottle' | 'gr' | 'portion'

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

export interface AdminCredential {
    id: 'admin'
    salt: string
    verifier: string
    iterations: number
}

const db = new Dexie('BartendrDatabase') as Dexie & {
    recipes: EntityTable<Recipe, 'id'>
    categories: EntityTable<Category, 'id'>
    sales: EntityTable<Sale, 'id'>
    inventoryItems: EntityTable<InventoryItem, 'id'>
    recipeIngredients: EntityTable<RecipeIngredient, 'id'>
    adminCredentials: EntityTable<AdminCredential, 'id'>
}

db.version(1).stores({
    recipes: 'id, name, categoryId, price',
    categories: 'id, name, isAlcoholic',
    sales: '++id, recipeId, quantity, timestamp',
    inventoryItems: 'id, name, unit, quantity',
    recipeIngredients: '++id, recipeId, inventoryItemId'
})

db.version(2).stores({
    sales: '++id, recipeId, quantity, timestamp, saleGroupId'
})

db.version(3).stores({
    adminCredentials: 'id'
})

export async function recordSales(items: Array<{ recipeId: number; quantity: number }>) {
    return db.transaction('rw', db.sales, db.inventoryItems, db.recipeIngredients, async () => {
        const changes = new Map<number, number>()
        const saleGroupId = crypto.randomUUID()

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

        await db.sales.bulkAdd(items.map(item => ({ ...item, saleGroupId, timestamp: new Date() })))

        for (const [inventoryItemId, amount] of changes) {
            await db.inventoryItems.update(inventoryItemId, { quantity: (await db.inventoryItems.get(inventoryItemId))!.quantity - amount })
        }
    })
}

export async function undoLastSale() {
    return db.transaction('rw', db.sales, db.inventoryItems, db.recipeIngredients, async () => {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        const startOfTomorrow = new Date(startOfToday)
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
        const lastSale = await db.sales
            .where('timestamp')
            .between(startOfToday, startOfTomorrow, true, false)
            .last()
        if (!lastSale?.id) return false

        const saleGroup = lastSale.saleGroupId
            ? await db.sales.where('saleGroupId').equals(lastSale.saleGroupId).toArray()
            : [lastSale]
        const changes = new Map<number, number>()

        for (const sale of saleGroup) {
            const ingredients = await db.recipeIngredients.where('recipeId').equals(sale.recipeId).toArray()
            for (const ingredient of ingredients) {
                changes.set(
                    ingredient.inventoryItemId,
                    (changes.get(ingredient.inventoryItemId) ?? 0) + ingredient.quantity * sale.quantity
                )
            }
        }

        for (const [inventoryItemId, amount] of changes) {
            const item = await db.inventoryItems.get(inventoryItemId)
            if (item) {
                await db.inventoryItems.update(inventoryItemId, { quantity: item.quantity + amount })
            }
        }

        await db.sales.bulkDelete(saleGroup.map(sale => sale.id!))
        return true
    })
}

export async function recordSale(recipeId: number, quantity: number) {
    return recordSales([{ recipeId, quantity }])
}

export { db }