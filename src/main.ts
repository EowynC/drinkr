import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { seedDatabase } from './database/seed.ts'

async function startApp() {
    await seedDatabase()

    const app = createApp(App)

    app.use(createPinia())
    app.mount('#app')
}

startApp()
