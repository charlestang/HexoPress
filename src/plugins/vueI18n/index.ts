import { useAppStoreWithout } from '@/stores/app'
import { type App } from 'vue'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { useCache } from '@/hooks/useCache'
import { watch } from 'vue'

export const setupI18n = async (app: App) => {
  const { wsCache } = useCache('localStorage')
  const selectedLocale = wsCache.get('locale')
  const currentLocale = await window.site.getSystemLocale()
  console.log('read system locale from backend: ' + currentLocale)
  const appStore = useAppStoreWithout()
  appStore.setLocale(selectedLocale || currentLocale)
  const options = {
    legacy: false,
    locale: appStore.locale,
    fallbackLocale: 'en',
    messages,
    sync: true,
    silentFallbackWarn: true,
  }
  const i18n = createI18n(options)
  app.use(i18n)

  // Watch for changes in `appStore.locale` and update `i18n.locale` accordingly
  watch(
    () => appStore.locale,
    (newLocale) => {
      i18n.global.locale.value = newLocale
    },
  )
}
