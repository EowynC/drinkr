<style>
    .app-layout {
        width: 100%;
        display: flex;
        flex-flow: column;
    }

    .app-header {
        background-color: var(--accent-bg);
        width: 100%;
        height: 3rem;
        padding-left: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-flow: row;
        align-items: center;
        gap: 2rem;
    }

    .app-nav {
        width: 100%;
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
        align-items: center;
        gap: 3rem;
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