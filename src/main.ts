import './assets/main.css'
import './local.d.ts'

import { setupI18n } from '@/plugins/vueI18n'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const setupAll = async () => {
  const app = createApp(App)

  await setupI18n(app)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

setupAll()
