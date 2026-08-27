<template>
    <section
        v-show="isActive"
        :id="panelId"
        role="tabpanel"
        :aria-hidden="!isActive"
    >
        <slot />
    </section>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { tabsKey } from './tabsContext'

const props = defineProps<{
    title: string
}>()

const context = inject(tabsKey)
if (!context) {
    throw new Error('Tab must be used inside Tabs')
}

const instanceId = getCurrentInstance()?.uid ?? Math.random()
const tabId = `tab-${instanceId}`
const panelId = `panel-${instanceId}`
const tabIndex = ref(-1)

const isActive = computed(() => context.activeIndex.value === tabIndex.value)

onMounted(() => {
    tabIndex.value = context.registerTab({
        id: tabId,
        title: props.title,
        panelId
    })
})

onBeforeUnmount(() => {
    context.unregisterTab(tabId)
})
</script>
