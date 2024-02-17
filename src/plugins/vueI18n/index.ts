import { useAppStoreWithout } from '@/stores/app'
import { type App } from 'vue'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

export const setupI18n = async (app: App) => {
  const currentLocale = await window.site.getSystemLocale()
  console.log('read system locale from backend: ' + currentLocale)
  const appStore = useAppStoreWithout()
  appStore.setLocale(currentLocale)
  const options = {
    legacy: false,
    locale: currentLocale,
    fallbackLocale: 'en',
    messages,
    sync: true,
    silentFallbackWarn: true,
  }
  const i18n = createI18n(options)
  app.use(i18n)
}
