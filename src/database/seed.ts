import { db } from './database'

export async function seedDatabase() {
    const productCount = await db.products.count()
    const categoryCount = await db.categories.count()

    if (categoryCount > 0) {
        return
    }

    await db.categories.bulkPut([
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

    if (productCount > 0) {
        return
    }
    
    await db.products.bulkPut([
        {
            id: 1,
            name: 'Coke',
            categoryId: 1
        },
        {
            id: 2,
            name: 'Sprite',
            categoryId: 1
        },
        {
            id: 3,
            name: 'Gin',
            categoryId: 5
        },
        {
            id: 4,
            name: 'Tonic',
            categoryId: 1
        },
        {
            id: 5,
            name: 'Gin & Tonic',
            categoryId: 3
        },
        {
            id: 6,
            name: 'Jupiler',
            categoryId: 2
        },
        {
            id: 7,
            name: 'La Chouffe',
            categoryId: 2
        },
        {
            id: 8,
            name: 'Virgin Mojito',
            categoryId: 4
        },
    ])
}