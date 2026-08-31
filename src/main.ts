import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'
import './style.css'
import App from './App.vue'
import router from './router.ts'
import { seedDatabase } from './database/seed.ts'

async function startApp() {
    await seedDatabase()

    const app = createApp(App)

    app.use(createPinia())
    app.use(router)
    app.use(Toast, { position: 'top-right', duration: 2000 })
    app.mount('#app')
}

startApp()
