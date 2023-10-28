import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

export const setupI18n = async (app: App) => {
  const messages = await import(`../../locales/zh-CN`)
  const options = {
    legacy: false,
    locale: 'zh-CN',
    fallbackLocale: 'en',
    messages: {
      'zh-CN': messages.default
    },
    sync: true,
    silentFallbackWarn: true
  }
  const i18n = createI18n(options)
  app.use(i18n)
}
