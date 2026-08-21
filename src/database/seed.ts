import { db } from './database'

export async function seedDatabase() {
    const productCount = await db.products.count()

    if (productCount > 0) {
        return
    }

    await db.products.bulkPut([
        {
            id: 1,
            name: 'Coke'
        },
        {
            id: 2,
            name: 'Sprite'
        },
        {
            id: 3,
            name: 'Gin'
        },
        {
            id: 4,
            name: 'Tonic'
        },
        {
            id: 5,
            name: 'Gin & Tonic'
        },
    ])
}