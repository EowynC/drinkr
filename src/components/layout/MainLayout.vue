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

    .active-link {
        color: var(--accent);
    }
</style>
<template>
    <div class="app-layout">
        <header class="app-header">
            <h2>Bartendr</h2>
            <nav class="app-nav">
                <RouterLink class="nav-link" active-class="active-link" to="/bar">Bar</RouterLink>
                <RouterLink class="nav-link" active-class="active-link" to="/inventory">Inventory</RouterLink>
                <RouterLink class="nav-link" active-class="active-link" to="/sales">Sales</RouterLink>
            </nav>
            <a @click="exportIndexedDB">ExportDB</a>
        </header>

        <main class="app-content">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
import { exportDB } from 'dexie-export-import';
import { db } from '../../database/database';

async function exportIndexedDB() {
    try {
        const blob = await exportDB(db, { prettyJson: true });
        const url = URL.createObjectURL(blob);
        const file = document.createElement('a');
        file.href = url;
        file.download = 'bartendr-export.json';
        file.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export database', error);
    }
}
</script>