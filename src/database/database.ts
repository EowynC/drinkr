import Dexie, { type EntityTable } from 'dexie'

export interface Product {
    id: number
    name: string
    categoryId: number 
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

const db = new Dexie('DrinkrDatabase') as Dexie & {
    products: EntityTable<Product, 'id'>
    categories: EntityTable<Category, 'id'>
    sales: EntityTable<Sale, 'id'>
}

db.version(1).stores({
    products: 'id, name, categoryId',
    categories: 'id, name, isAlcoholic',
    sales: '++id, productId, quantity, timestamp'
})

export { db }