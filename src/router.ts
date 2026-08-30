import { createRouter, createWebHistory } from "vue-router";
import BarView from "./views/BarView.vue";
import InventoryView from "./views/InventoryView.vue";
import SalesView from "./views/SalesView.vue";
import RecipeView from "./views/RecipeView.vue";

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
            path: '/inventory',
            component: InventoryView
        },
        {
            path: '/recipe',
            component: RecipeView
        },
        {
            path: '/sales',
            component: SalesView
        },
    ]
})

export default router