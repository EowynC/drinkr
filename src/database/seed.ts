import { db } from './database'

export async function seedDatabase() {
    const productCount = await db.products.count()
    const categoryCount = await db.categories.count()
    const inventoryCount = await db.inventoryItems.count()

    if (categoryCount === 0) await db.categories.bulkPut([
        {
            id: 1,
            name: 'Softdrinks',
            isAlcoholic: false
        },
        {
            id: 2,
            name: 'Beers',
            isAlcoholic: true
        },
        {
            id: 3,
            name: 'Cocktails',
            isAlcoholic: true
        },
        {
            id: 4,
            name: 'Mocktails',
            isAlcoholic: false
        },
        {
            id: 5,
            name: 'Liquors',
            isAlcoholic: true
        },
    ])

    if (productCount === 0) await db.products.bulkPut([
        {
            id: 1,
            name: 'Coke',
            categoryId: 1,
            price: 3.00
        },
        {
            id: 2,
            name: 'Sprite',
            categoryId: 1,
            price: 3.00
        },
        {
            id: 3,
            name: 'Gin',
            categoryId: 5,
            price: 6.00
        },
        {
            id: 4,
            name: 'Tonic',
            categoryId: 1,
            price: 3.00
        },
        {
            id: 5,
            name: 'Gin & Tonic',
            categoryId: 3,
            price: 9.00
        },
        {
            id: 6,
            name: 'Jupiler',
            categoryId: 2,
            price: 3.00
        },
        {
            id: 7,
            name: 'La Chouffe',
            categoryId: 2,
            price: 6.00
        },
        {
            id: 8,
            name: 'Virgin Mojito',
            categoryId: 4,
            price: 6.00
        },
    ])

    if (inventoryCount === 0) {
        await db.inventoryItems.bulkPut([
            { id: 1, name: 'Coke', unit: 'ml', quantity: 5000 },
            { id: 2, name: 'Gin', unit: 'ml', quantity: 2000 },
            { id: 3, name: 'Tonic', unit: 'ml', quantity: 5000 },
            { id: 4, name: 'Lime juice', unit: 'bottle', quantity: 10 }
        ])

        await db.recipeLines.bulkPut([
            { id: 1, productId: 1, inventoryItemId: 1, quantity: 250 },
            { id: 2, productId: 5, inventoryItemId: 2, quantity: 50 },
            { id: 3, productId: 5, inventoryItemId: 3, quantity: 150 },
            { id: 4, productId: 8, inventoryItemId: 4, quantity: 1 }
        ])
    }
}