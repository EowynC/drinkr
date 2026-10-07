import { createRouter, createWebHistory } from "vue-router";
import BarView from "./views/BarView.vue";
import InventoryView from "./views/InventoryView.vue";
import SalesView from "./views/SalesView.vue";
import RecipeView from "./views/RecipeView.vue";
import SettingsView from "./views/SettingsView.vue";
import AdminView from "./views/AdminView.vue";
import { isAdminUnlocked } from "./auth";

const router = createRouter({
    history: createWebHistory(),

    routes: [
        {
            path: '/',
            redirect: '/bar'
        },
        {
            path: '/bar',
            component: BarView
        },
        {
            path: '/admin',
            component: AdminView
        },
        {
            path: '/inventory',
            component: InventoryView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/recipe',
            component: RecipeView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/sales',
            component: SalesView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/settings',
            component: SettingsView,
            meta: { requiresAdmin: true }
        },
    ]
})

router.beforeEach(to => {
    if (to.meta.requiresAdmin && !isAdminUnlocked.value) {
        return { path: '/admin', query: { redirect: to.fullPath } }
    }
})

export default router