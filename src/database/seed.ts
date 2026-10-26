import { db } from './database'

export async function seedDatabase() {
    const recipeCount = await db.recipes.count()
    const categoryCount = await db.categories.count()
    const inventoryCount = await db.inventoryItems.count()
    const recipeIngredientCount = await db.recipeIngredients.count()

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
        { id: 1, name: 'Cola', categoryId: 1, price: 1.50 },
        { id: 2, name: 'Cola Zero', categoryId: 1, price: 1.50 },
        { id: 3, name: 'Fanta', categoryId: 1, price: 1.50 },
        { id: 4, name: 'Sprite', categoryId: 1, price: 1.50 },
        { id: 5, name: 'Lipton Ice Tea', categoryId: 1, price: 1.50 },
        { id: 6, name: 'Red Bull', categoryId: 1, price: 3.00 },
        { id: 7, name: 'Tonic', categoryId: 1, price: 1.50 },
        { id: 8, name: 'Blue Aquarius', categoryId: 1, price: 3.00 },
        { id: 9, name: 'Stella', categoryId: 2, price: 3.00 },
        { id: 10, name: 'Kriek', categoryId: 2, price: 3.00 },
        { id: 11, name: 'Duvel', categoryId: 2, price: 4.50 },
        { id: 12, name: 'Leffe Blond', categoryId: 2, price: 4.50 },
        { id: 13, name: 'Leffe Brown', categoryId: 2, price: 4.50 },
        { id: 14, name: 'Rochefort 10', categoryId: 2, price: 4.50 },
        { id: 15, name: 'Chimay Blue', categoryId: 2, price: 4.50 },
        { id: 16, name: 'Smoutpot', categoryId: 2, price: 4.50 },
        { id: 17, name: 'Cava', categoryId: 2, price: 4.50 },
        { id: 18, name: 'Negroni', categoryId: 3, price: 9.00 },
        { id: 19, name: 'Boulevardier', categoryId: 3, price: 9.00 },
        { id: 20, name: 'Bapu Bapu', categoryId: 3, price: 9.00 },
        { id: 21, name: 'Cosmopolitan', categoryId: 3, price: 7.50 },
        { id: 22, name: 'Yiff on the Beach', categoryId: 3, price: 7.50 },
        { id: 23, name: 'Moscow Mule', categoryId: 6, price: 9.00 },
        { id: 24, name: 'Dark n Stormy', categoryId: 6, price: 9.00 },
        { id: 25, name: 'Gin & Tonic', categoryId: 6, price: 7.50 },
        { id: 26, name: 'Vodka Orange', categoryId: 6, price: 7.50 },
        { id: 27, name: 'Rum Cola', categoryId: 6, price: 7.50 },
        { id: 28, name: 'Whiskey Cola', categoryId: 6, price: 7.50 },
        { id: 29, name: 'Vodka Red Bull', categoryId: 6, price: 9.00 },
        { id: 30, name: 'Virgin Pisang Orange', categoryId: 4, price: 4.50 }
    ])

    if (inventoryCount === 0) {
        await db.inventoryItems.bulkPut([
            { id: 1, name: 'Dark rum', unit: 'ml', quantity: 29400 },
            { id: 2, name: 'White rum', unit: 'ml', quantity: 25200 },
            { id: 3, name: 'Vodka', unit: 'ml', quantity: 33600 },
            { id: 4, name: 'Peach schnapps', unit: 'ml', quantity: 18200 },
            { id: 5, name: 'Triple sec', unit: 'ml', quantity: 6300 },
            { id: 6, name: 'Gin', unit: 'ml', quantity: 8400 },
            { id: 7, name: 'Campari', unit: 'ml', quantity: 8400 },
            { id: 8, name: 'Red vermouth', unit: 'ml', quantity: 8400 },
            { id: 9, name: 'Whisky', unit: 'ml', quantity: 8400 },
            { id: 10, name: 'Cava', unit: 'ml', quantity: 8400 },
            { id: 11, name: 'Pisang', unit: 'ml', quantity: 6300 },
            { id: 12, name: 'Lemon juice', unit: 'ml', quantity: 24000 },
            { id: 13, name: 'Cranberry juice', unit: 'ml', quantity: 24000 },
            { id: 14, name: 'Pineapple juice', unit: 'ml', quantity: 12000 },
            { id: 15, name: 'Orange juice', unit: 'ml', quantity: 48000 },
            { id: 16, name: 'Lime juice', unit: 'ml', quantity: 18000 },
            { id: 17, name: 'Grapefruit juice', unit: 'ml', quantity: 12000 },
            { id: 18, name: 'Tonic', unit: 'ml', quantity: 12000 },
            { id: 19, name: 'Cola', unit: 'ml', quantity: 60000 },
            { id: 20, name: 'Cola Zero', unit: 'ml', quantity: 42000 },
            { id: 21, name: 'Sprite', unit: 'ml', quantity: 36000 },
            { id: 22, name: 'Fanta', unit: 'ml', quantity: 24000 },
            { id: 23, name: 'Lipton Ice Tea', unit: 'ml', quantity: 12000 },
            { id: 24, name: 'Blue Aquarius', unit: 'bottle', quantity: 24 },
            { id: 25, name: 'Ginger beer', unit: 'ml', quantity: 120000 },
            { id: 26, name: 'Red Bull', unit: 'bottle', quantity: 72 },
            { id: 27, name: 'Vanilla syrup', unit: 'ml', quantity: 12000 },
            { id: 28, name: 'Sugar syrup', unit: 'ml', quantity: 12000 },
            { id: 29, name: 'Passion fruit syrup', unit: 'ml', quantity: 18000 },
            { id: 30, name: 'Grenadine', unit: 'ml', quantity: 12000 },
            { id: 31, name: 'Duvel', unit: 'bottle', quantity: 192 },
            { id: 32, name: 'Leffe Blond', unit: 'bottle', quantity: 72 },
            { id: 33, name: 'Leffe Brown', unit: 'bottle', quantity: 48 },
            { id: 34, name: 'Lindemans Kriek', unit: 'bottle', quantity: 192 },
            { id: 35, name: 'Rochefort 10', unit: 'bottle', quantity: 24 },
            { id: 36, name: 'Chimay Blue', unit: 'bottle', quantity: 24 },
            { id: 37, name: 'Stella', unit: 'bottle', quantity: 360 }
        ])

    }

    if (recipeCount === 0 && recipeIngredientCount === 0) await db.recipeIngredients.bulkPut([
        { recipeId: 1, inventoryItemId: 19, quantity: 300 },
        { recipeId: 2, inventoryItemId: 20, quantity: 300 },
        { recipeId: 3, inventoryItemId: 22, quantity: 300 },
        { recipeId: 4, inventoryItemId: 21, quantity: 300 },
        { recipeId: 5, inventoryItemId: 23, quantity: 300 },
        { recipeId: 6, inventoryItemId: 26, quantity: 1 },
        { recipeId: 7, inventoryItemId: 18, quantity: 300 },
        { recipeId: 8, inventoryItemId: 24, quantity: 1 },
        { recipeId: 9, inventoryItemId: 37, quantity: 1 },
        { recipeId: 10, inventoryItemId: 34, quantity: 1 },
        { recipeId: 11, inventoryItemId: 31, quantity: 1 },
        { recipeId: 12, inventoryItemId: 32, quantity: 1 },
        { recipeId: 13, inventoryItemId: 33, quantity: 1 },
        { recipeId: 14, inventoryItemId: 35, quantity: 1 },
        { recipeId: 15, inventoryItemId: 36, quantity: 1 },
        { recipeId: 16, inventoryItemId: 17, quantity: 80 },
        { recipeId: 16, inventoryItemId: 31, quantity: 1 },
        { recipeId: 17, inventoryItemId: 10, quantity: 125 },
        { recipeId: 18, inventoryItemId: 8, quantity: 30 },
        { recipeId: 18, inventoryItemId: 6, quantity: 30 },
        { recipeId: 18, inventoryItemId: 7, quantity: 30 },
        { recipeId: 19, inventoryItemId: 8, quantity: 30 },
        { recipeId: 19, inventoryItemId: 9, quantity: 30 },
        { recipeId: 19, inventoryItemId: 7, quantity: 30 },
        { recipeId: 20, inventoryItemId: 2, quantity: 30 },
        { recipeId: 20, inventoryItemId: 1, quantity: 30 },
        { recipeId: 20, inventoryItemId: 29, quantity: 20 },
        { recipeId: 20, inventoryItemId: 27, quantity: 20 },
        { recipeId: 20, inventoryItemId: 16, quantity: 30 },
        { recipeId: 20, inventoryItemId: 15, quantity: 60 },
        { recipeId: 21, inventoryItemId: 3, quantity: 40 },
        { recipeId: 21, inventoryItemId: 5, quantity: 20 },
        { recipeId: 21, inventoryItemId: 13, quantity: 30 },
        { recipeId: 21, inventoryItemId: 16, quantity: 15 },
        { recipeId: 22, inventoryItemId: 3, quantity: 45 },
        { recipeId: 22, inventoryItemId: 4, quantity: 15 },
        { recipeId: 22, inventoryItemId: 13, quantity: 30 },
        { recipeId: 22, inventoryItemId: 14, quantity: 30 },
        { recipeId: 22, inventoryItemId: 15, quantity: 30 },
        { recipeId: 22, inventoryItemId: 30, quantity: 15 },
        { recipeId: 23, inventoryItemId: 3, quantity: 60 },
        { recipeId: 23, inventoryItemId: 16, quantity: 15 },
        { recipeId: 23, inventoryItemId: 28, quantity: 10 },
        { recipeId: 23, inventoryItemId: 25, quantity: 150 },
        { recipeId: 24, inventoryItemId: 1, quantity: 60 },
        { recipeId: 24, inventoryItemId: 16, quantity: 15 },
        { recipeId: 24, inventoryItemId: 28, quantity: 10 },
        { recipeId: 24, inventoryItemId: 25, quantity: 150 },
        { recipeId: 25, inventoryItemId: 6, quantity: 60 },
        { recipeId: 25, inventoryItemId: 18, quantity: 150 },
        { recipeId: 26, inventoryItemId: 3, quantity: 60 },
        { recipeId: 26, inventoryItemId: 15, quantity: 150 },
        { recipeId: 27, inventoryItemId: 1, quantity: 60 },
        { recipeId: 27, inventoryItemId: 16, quantity: 15 },
        { recipeId: 27, inventoryItemId: 19, quantity: 150 },
        { recipeId: 28, inventoryItemId: 9, quantity: 60 },
        { recipeId: 28, inventoryItemId: 19, quantity: 150 },
        { recipeId: 29, inventoryItemId: 3, quantity: 60 },
        { recipeId: 29, inventoryItemId: 26, quantity: 1 },
        { recipeId: 30, inventoryItemId: 11, quantity: 60 },
        { recipeId: 30, inventoryItemId: 15, quantity: 170 }
    ])
}