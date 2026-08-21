<template>
    <div class="app-layout">
        <header class="app-header">
            <h1>Drinkr</h1>
            <nav>
                <RouterLink to="/bar">
                    Bar
                </RouterLink>
                <RouterLink to="/inventory">
                    Inventory
                </RouterLink>
                <RouterLink to="/sales">
                    Sales
                </RouterLink>
            </nav>
        </header>

        <main class="app-content">
            <slot />
        </main>
    </div>
</template>