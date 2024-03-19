import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { FuseV1Options, FuseVersion } from '@electron/fuses'

const config: ForgeConfig = {
  // Options sent to `electron-packager`. The options
  // are documented at
  // https://electron.github.io/packager/main/interfaces/Options.html
  // NOTICE: You can not override the `dir`, `arch`,
  // `platform`, `out` or `electronVersion` options
  // as they are set by Electron Forge internally.
  packagerConfig: {
    asar: true,
    name: 'HexoPress',
    icon: './src/assets/icon',
  },
  // The options sent to `electron-rebuild` during both
  // the package and start step. The options are documented at
  // https://github.com/electron/rebuild#how-can-i-integrate-this-into-grunt--gulp--whatever
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: './src/assets/icon.ico',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerDeb({
      options: {
        icon: './src/assets/icon.png',
      },
    }),
    new MakerRpm({
      options: {
        homepage: 'https://github.com/charlestang/HexoPress',
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'main/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'main/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
