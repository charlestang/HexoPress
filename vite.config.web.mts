import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// Vite config for HexoPress Web mode (no Electron dependencies)
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
  },
  define: {
    'import.meta.env.VITE_APP_MODE': '"web"',
    'import.meta.env.VITE_ASSET_BASE_URL': '"/assets/"',
  },
  plugins: [
    Vue(),
    UnoCSS(),
    // Strip Electron-specific CSP meta tag for web mode
    {
      name: 'strip-electron-csp',
      transformIndexHtml(html) {
        return html.replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/s, '')
      },
    },
    AutoImport({
      eslintrc: {
        enabled: true,
        filepath: 'types/.eslintrc-auto-import.json',
      },
      resolvers: [ElementPlusResolver()],
      dts: 'types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'types/components.d.ts',
    }),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@/bridge': fileURLToPath(new URL('./src/bridge/web.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  clearScreen: false,
  server: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/blog/**'],
    },
  },
})
