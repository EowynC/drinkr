<style>
    .tabs-container {
        width: 100%;
    }

    .tabs-list {
        display: flex;
        gap: 0.35rem;
        overflow-x: auto;
        border-bottom: 1px solid var(--border);
        margin: 1.5rem 0 2rem;
    }

    .tab-button {
        flex: 0 0 auto;
        padding: 0.75rem 1.25rem;
        border: 0;
        border-bottom: 3px solid transparent;
        color: var(--text);
        background: transparent;
        font: inherit;
        cursor: pointer;
    }

    .tab-button:hover,
    .tab-button:focus-visible {
        color: var(--text-h);
        background: var(--accent-bg);
    }

    .tab-button.active {
        border-bottom-color: var(--accent);
        color: var(--text-h);
        font-weight: 600;
    }
</style>

<template>
    <div class="tabs-container">
        <div class="tabs-list" role="tablist">
            <button
                v-for="(tab, index) in tabs"
                :key="tab.id"
                class="tab-button"
                :class="{ active: activeIndex === index }"
                type="button"
                role="tab"
                :aria-selected="activeIndex === index"
                :aria-controls="tab.panelId"
                @click="activeIndex = index"
            >
                {{ tab.title }}
            </button>
        </div>

        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { tabsKey, type TabRegistration } from './tabsContext'

const activeIndex = ref(0)
const registeredTabs = ref<TabRegistration[]>([])
const tabs = computed(() => registeredTabs.value)

function registerTab(tab: TabRegistration) {
    registeredTabs.value.push(tab)
    return registeredTabs.value.length - 1
}

function unregisterTab(id: string) {
    const removedIndex = registeredTabs.value.findIndex(tab => tab.id === id)
    registeredTabs.value = registeredTabs.value.filter(tab => tab.id !== id)

    if (activeIndex.value >= registeredTabs.value.length) {
        activeIndex.value = Math.max(registeredTabs.value.length - 1, 0)
    } else if (removedIndex >= 0 && removedIndex < activeIndex.value) {
        activeIndex.value -= 1
    }
}

provide(tabsKey, { activeIndex, registerTab, unregisterTab })
</script>
