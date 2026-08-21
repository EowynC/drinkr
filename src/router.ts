import { createRouter, createWebHistory } from "vue-router";
import BarView from "./views/BarView.vue";
import InventoryView from "./views/InventoryView.vue";
import SalesView from "./views/SalesView.vue";

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
            path: '/sales',
            component: SalesView
        },
    ]
})

export default router