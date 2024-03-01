import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'

// internationalization
import { setupI18n } from '@/plugins/vueI18n'

// state management
import { setupStore } from '@/stores'

// router
import { setupRouter } from '@/router'

import '@/styles/index.css'

import { createApp } from 'vue'

import App from './App.vue'

const setupAll = async () => {
  const app = createApp(App)

  await setupI18n(app)

  setupRouter(app)

  setupStore(app)

  app.mount('#app')
}

setupAll()
