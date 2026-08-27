import type { InjectionKey, Ref } from 'vue'

export interface TabRegistration {
    id: string
    title: string
    panelId: string
}

export interface TabsContext {
    activeIndex: Ref<number>
    registerTab: (tab: TabRegistration) => number
    unregisterTab: (id: string) => void
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('tabs')
