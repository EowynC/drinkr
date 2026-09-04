<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

function closeMenu() {
    isMenuOpen.value = false
}
</script>

<template>
    <div class="app-layout">
        <header class="app-header">
            <h2>Bartendr</h2>
            <button
                class="menu-toggle"
                type="button"
                :aria-expanded="isMenuOpen"
                aria-controls="app-navigation"
                aria-label="Toggle navigation menu"
                @click="isMenuOpen = !isMenuOpen"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav id="app-navigation" class="app-nav" :class="{ 'menu-open': isMenuOpen }">
                <RouterLink class="nav-link" active-class="active-link" to="/bar" @click="closeMenu">Bar</RouterLink>
                <RouterLink class="nav-link" active-class="active-link" to="/inventory" @click="closeMenu">Inventory</RouterLink>
                <RouterLink class="nav-link" active-class="active-link" to="/recipe" @click="closeMenu">Recipes</RouterLink>
                <RouterLink class="nav-link" active-class="active-link" to="/sales" @click="closeMenu">Sales</RouterLink>
                <RouterLink class="nav-link" active-class="active-link" to="/settings" @click="closeMenu">Settings</RouterLink>
            </nav>
        </header>

        <main class="app-content">
            <slot />
        </main>
    </div>
</template>


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
        padding-right: 1rem;
        box-sizing: border-box;
        display: flex;
        flex-flow: row;
        align-items: center;
        gap: 1rem;
    }

    .app-header h2 {
        margin: 0;
    }

    .app-nav {
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
        align-items: center;
        gap: 2rem;
    }

    .nav-link {
        text-decoration: none;
        color: white;
        font-weight: 500;
    }
    .nav-link:hover {
        text-decoration: underline;
    }

    .active-link {
        color: var(--accent);
    }

    .menu-toggle {
        display: none;
        margin-left: auto;
        padding: 0.4rem;
        border: 0;
        background: transparent;
        cursor: pointer;
    }

    .menu-toggle span {
        display: block;
        width: 1.4rem;
        height: 2px;
        margin: 0.25rem 0;
        background-color: currentColor;
    }

    @media (max-width: 767px) {
        .app-header {
            position: relative;
            height: 3.5rem;
        }

        .menu-toggle {
            display: block;
            order: -1;
            margin-left: 0;
            color: var(--text-h);
        }

        .app-nav {
            position: absolute;
            top: 100%;
            right: 0;
            left: 0;
            z-index: 10;
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            padding: 0.5rem 1rem;
            background-color: var(--accent-bg);
            box-shadow: var(--shadow);
        }

        .app-nav.menu-open {
            display: flex;
        }

        .nav-link {
            padding: 0.65rem 0;
        }
    }
</style>