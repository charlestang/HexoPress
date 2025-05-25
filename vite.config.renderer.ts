import type { ConfigEnv, UserConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import { pluginExposeRenderer } from './vite.config.base'

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      pluginExposeRenderer(name),
      Vue(),
      UnoCSS(),
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
        /* options */
        // locale messages resource pre-compile option
        include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    clearScreen: false,
    server: {
      watch: {
        ignored: ['**/blog/**'],
      },
    },
  } as UserConfig
})
