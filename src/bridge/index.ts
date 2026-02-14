// This file is replaced by Vite alias at compile time.
// In Electron mode: @/bridge → ./electron.ts
// In Web mode: @/bridge → ./web.ts
// This default export is for IDE support only.
export { site } from './electron'
export type { SiteBridge } from './types'
