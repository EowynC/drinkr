<style>
    .app-layout {
        width: 100%;
        display: flex;
        flex-flow: column;
    }

    .app-header {
        width: 100%;
        display: flex;
        flex-flow: row;
        align-items: center;
        gap: 2rem;
        margin: 2rem;
    }

    .app-nav {
        width: 100%;
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
        align-items: center;
        gap: 1rem;
    }

    .nav-link {
        text-decoration: none;
        color: white;
        font-weight: 500;
    }
    .nav-link:hover {
        text-decoration: underline;
    }
</style>
<template>
    <div class="app-layout">
        <header class="app-header">
            <h2>Bartendr</h2>
            <nav class="app-nav">
                <RouterLink class="nav-link" to="/bar">
                    Bar
                </RouterLink>
                <RouterLink class="nav-link" to="/inventory">
                    Inventory
                </RouterLink>
                <RouterLink class="nav-link" to="/sales">
                    Sales
                </RouterLink>
            </nav>
        </header>

        <main class="app-content">
            <slot />
        </main>
    </div>
</template>