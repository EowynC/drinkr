import Dexie, { type EntityTable } from 'dexie'

export interface Product {
    id: number
    name: string
}

export interface Sale {
    id?: number
    productId: number
    quantity: number
    timestamp: Date
}

const db = new Dexie('DrinkrDatabase') as Dexie & {
    products: EntityTable<Product, 'id'>
    sales: EntityTable<Sale, 'id'>
}

db.version(1).stores({
    products: 'id, name',
    sales: '++id, productId, quantity, timestamp'
})

export { db }