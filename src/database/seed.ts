import { db } from './database'

export async function seedDatabase() {
    const recipeCount = await db.recipes.count()
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
        {
            id: 6,
            name: 'Mixers',
            isAlcoholic: true
        },
    ])

    if (recipeCount === 0) await db.recipes.bulkPut([
        {
            id: 1,
            name: 'Coke',
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
            categoryId: 6,
            price: 6.00
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
            id: 9,
            name: 'Negroni',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 10,
            name: 'Boulevardier',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 11,
            name: 'Bapu Bapu',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 12,
            name: 'Cosmopolitan',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 13,
            name: 'Yiff on the Beach',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 14,
            name: 'Moscow Mule',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 15,
            name: 'Dark n Stormy',
            categoryId: 3,
            price: 12.00
        },
        {
            id: 16,
            name: 'Vodka Orange',
            categoryId: 6,
            price: 6.00
        },
        {
            id: 17,
            name: 'Rum Cola',
            categoryId: 6,
            price: 6.00
        },
        {
            id: 18,
            name: 'Whiskey Cola',
            categoryId: 6,
            price: 6.00
        },
        {
            id: 19,
            name: 'Vodka Red Bull',
            categoryId: 6,
            price: 6.00
        },
    ])

    if (inventoryCount === 0) {
        await db.inventoryItems.bulkPut([
            { id: 1, name: 'Coke', unit: 'ml', quantity: 5000 },
            { id: 2, name: 'Gin', unit: 'ml', quantity: 2000 },
            { id: 3, name: 'Tonic', unit: 'bottle', quantity: 500 },
            { id: 4, name: 'Lime juice', unit: 'bottle', quantity: 10 },
            { id: 5, name: 'Red vermouth', unit: 'ml', quantity: 1000 },
            { id: 6, name: 'Campari', unit: 'ml', quantity: 1000 },
            { id: 7, name: 'Whisky', unit: 'ml', quantity: 1000 },
            { id: 8, name: 'White rum', unit: 'ml', quantity: 1000 },
            { id: 9, name: 'Dark rum', unit: 'ml', quantity: 1000 },
            { id: 10, name: 'Passionfruit syrup', unit: 'ml', quantity: 1000 },
            { id: 11, name: 'Vanilla syrup', unit: 'ml', quantity: 1000 },
            { id: 12, name: 'Orange juice', unit: 'ml', quantity: 5000 },
            { id: 13, name: 'Vodka', unit: 'ml', quantity: 2000 },
            { id: 14, name: 'Triple sec', unit: 'ml', quantity: 1000 },
            { id: 15, name: 'Cranberry juice', unit: 'ml', quantity: 5000 },
            { id: 16, name: 'Peach schnapps', unit: 'ml', quantity: 1000 },
            { id: 17, name: 'Pineapple juice', unit: 'ml', quantity: 5000 },
            { id: 18, name: 'Grenadine', unit: 'ml', quantity: 1000 },
            { id: 19, name: 'Sugar syrup', unit: 'ml', quantity: 1000 },
            { id: 20, name: 'Ginger beer', unit: 'bottle', quantity: 500 },
            { id: 21, name: 'Red Bull', unit: 'bottle', quantity: 500 },
            { id: 22, name: 'Lime juice (ml)', unit: 'ml', quantity: 5000 },
            { id: 23, name: 'Jupiler', unit: 'bottle', quantity: 500 },
            { id: 24, name: 'La Chouffe', unit: 'bottle', quantity: 500 }
        ])

        await db.recipeIngredients.bulkPut([
            { id: 1, recipeId: 1, inventoryItemId: 1, quantity: 250 },
            { id: 2, recipeId: 5, inventoryItemId: 2, quantity: 60 },
            { id: 3, recipeId: 5, inventoryItemId: 3, quantity: 150 },
            { id: 4, recipeId: 3, inventoryItemId: 2, quantity: 60 },
            { id: 5, recipeId: 4, inventoryItemId: 3, quantity: 1 },
            { id: 6, recipeId: 6, inventoryItemId: 23, quantity: 1 },
            { id: 7, recipeId: 7, inventoryItemId: 24, quantity: 1 },
            { id: 8, recipeId: 9, inventoryItemId: 5, quantity: 30 },
            { id: 9, recipeId: 9, inventoryItemId: 2, quantity: 30 },
            { id: 10, recipeId: 9, inventoryItemId: 6, quantity: 30 },
            { id: 11, recipeId: 10, inventoryItemId: 5, quantity: 30 },
            { id: 12, recipeId: 10, inventoryItemId: 7, quantity: 30 },
            { id: 13, recipeId: 10, inventoryItemId: 6, quantity: 30 },
            { id: 14, recipeId: 11, inventoryItemId: 8, quantity: 30 },
            { id: 15, recipeId: 11, inventoryItemId: 9, quantity: 30 },
            { id: 16, recipeId: 11, inventoryItemId: 10, quantity: 20 },
            { id: 17, recipeId: 11, inventoryItemId: 11, quantity: 20 },
            { id: 18, recipeId: 11, inventoryItemId: 22, quantity: 30 },
            { id: 19, recipeId: 11, inventoryItemId: 12, quantity: 60 },
            { id: 20, recipeId: 12, inventoryItemId: 13, quantity: 40 },
            { id: 21, recipeId: 12, inventoryItemId: 14, quantity: 20 },
            { id: 22, recipeId: 12, inventoryItemId: 15, quantity: 30 },
            { id: 23, recipeId: 12, inventoryItemId: 22, quantity: 15 },
            { id: 24, recipeId: 13, inventoryItemId: 13, quantity: 45 },
            { id: 25, recipeId: 13, inventoryItemId: 16, quantity: 15 },
            { id: 26, recipeId: 13, inventoryItemId: 15, quantity: 30 },
            { id: 27, recipeId: 13, inventoryItemId: 17, quantity: 30 },
            { id: 28, recipeId: 13, inventoryItemId: 12, quantity: 30 },
            { id: 29, recipeId: 13, inventoryItemId: 18, quantity: 15 },
            { id: 30, recipeId: 14, inventoryItemId: 13, quantity: 60 },
            { id: 31, recipeId: 14, inventoryItemId: 22, quantity: 15 },
            { id: 32, recipeId: 14, inventoryItemId: 19, quantity: 10 },
            { id: 33, recipeId: 14, inventoryItemId: 20, quantity: 150 },
            { id: 34, recipeId: 15, inventoryItemId: 9, quantity: 60 },
            { id: 35, recipeId: 15, inventoryItemId: 22, quantity: 15 },
            { id: 36, recipeId: 15, inventoryItemId: 19, quantity: 10 },
            { id: 37, recipeId: 15, inventoryItemId: 20, quantity: 150 },
            { id: 38, recipeId: 16, inventoryItemId: 13, quantity: 60 },
            { id: 39, recipeId: 16, inventoryItemId: 12, quantity: 150 },
            { id: 40, recipeId: 17, inventoryItemId: 9, quantity: 60 },
            { id: 41, recipeId: 17, inventoryItemId: 22, quantity: 15 },
            { id: 42, recipeId: 17, inventoryItemId: 1, quantity: 150 },
            { id: 43, recipeId: 18, inventoryItemId: 7, quantity: 60 },
            { id: 44, recipeId: 18, inventoryItemId: 1, quantity: 150 },
            { id: 45, recipeId: 19, inventoryItemId: 13, quantity: 60 },
            { id: 46, recipeId: 19, inventoryItemId: 21, quantity: 150 }
        ])
    }
}