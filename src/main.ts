import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router.ts'
import { seedDatabase } from './database/seed.ts'

async function startApp() {
    await seedDatabase()

    const app = createApp(App)

    app.use(createPinia())
    app.use(router)
    app.mount('#app')   
}

startApp()
