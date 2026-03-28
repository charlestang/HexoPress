import { useCache } from '@/hooks/useCache'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../app'

const cacheState = vi.hoisted(() => new Map<string, unknown>())
const setDarkModeMock = vi.hoisted(() => vi.fn())
const wsCacheMock = vi.hoisted(() => ({
  get: vi.fn((key: string) => (cacheState.has(key) ? cacheState.get(key) : null)),
  set: vi.fn((key: string, value: unknown) => {
    cacheState.set(key, value)
    return value
  }),
  delete: vi.fn((key: string) => {
    cacheState.delete(key)
  }),
  clear: vi.fn(() => {
    cacheState.clear()
  }),
}))

vi.mock('@/hooks/useCache', () => ({
  useCache: vi.fn(() => ({
    wsCache: wsCacheMock,
  })),
}))

vi.mock('@/bridge', () => ({
  site: {
    setDarkMode: setDarkModeMock,
    getHexoConfig: vi.fn(() => Promise.resolve(null)),
    getSiteInfo: vi.fn(() => Promise.resolve(null)),
  },
}))

describe('app store appearance settings', () => {
  beforeEach(() => {
    useCache('localStorage').wsCache.clear()
    wsCacheMock.get.mockClear()
    wsCacheMock.set.mockClear()
    wsCacheMock.delete.mockClear()
    wsCacheMock.clear.mockClear()
    setActivePinia(createPinia())
    setDarkModeMock.mockReset()
  })

  it('uses stable defaults when storage is empty', () => {
    const store = useAppStore()

    expect(store.darkMode).toBe('system')
    expect(store.editorLineWrap).toBe(true)
    expect(store.editorFontSize).toBe(16)
    expect(store.editorFontFamily).toBe('clean-sans')
    expect(store.codeTheme).toBe('one-dark')
    expect(store.codeLineNumbers).toBe(false)
    expect(store.codeFontFamily).toBe('system-mono')
    expect(setDarkModeMock).toHaveBeenCalledWith('system')
  })

  it('restores valid appearance settings from localStorage', () => {
    const { wsCache } = useCache('localStorage')
    wsCache.set('darkMode', 'dark')
    wsCache.set('editorLineWrap', false)
    wsCache.set('editorFontSize', 22)
    wsCache.set('editorFontFamily', 'mono')
    wsCache.set('codeTheme', 'github-light')
    wsCache.set('codeLineNumbers', true)
    wsCache.set('codeFontFamily', 'fira-code')

    const store = useAppStore()

    expect(store.darkMode).toBe('dark')
    expect(store.editorLineWrap).toBe(false)
    expect(store.editorFontSize).toBe(22)
    expect(store.editorFontFamily).toBe('mono')
    expect(store.codeTheme).toBe('github-light')
    expect(store.codeLineNumbers).toBe(true)
    expect(store.codeFontFamily).toBe('fira-code')
  })

  it('falls back to defaults for invalid stored appearance settings', () => {
    const { wsCache } = useCache('localStorage')
    wsCache.set('darkMode', 'blue')
    wsCache.set('editorLineWrap', 'maybe')
    wsCache.set('editorFontSize', 100)
    wsCache.set('editorFontFamily', 'comic-sans')
    wsCache.set('codeTheme', 'auto')
    wsCache.set('codeLineNumbers', 'sometimes')
    wsCache.set('codeFontFamily', 'fantasy')

    const store = useAppStore()

    expect(store.darkMode).toBe('system')
    expect(store.editorLineWrap).toBe(true)
    expect(store.editorFontSize).toBe(16)
    expect(store.editorFontFamily).toBe('clean-sans')
    expect(store.codeTheme).toBe('one-dark')
    expect(store.codeLineNumbers).toBe(false)
    expect(store.codeFontFamily).toBe('system-mono')
  })

  it('persists appearance settings through setters', () => {
    const store = useAppStore()
    const { wsCache } = useCache('localStorage')

    store.setDarkMode('dark')
    store.setEditorLineWrap(false)
    store.setEditorFontSize(20)
    store.setEditorFontFamily('reading-serif')
    store.setCodeTheme('nord')
    store.setCodeLineNumbers(true)
    store.setCodeFontFamily('jetbrains-mono')

    expect(wsCache.get('darkMode')).toBe('dark')
    expect(wsCache.get('editorLineWrap')).toBe(false)
    expect(wsCache.get('editorFontSize')).toBe(20)
    expect(wsCache.get('editorFontFamily')).toBe('reading-serif')
    expect(wsCache.get('codeTheme')).toBe('nord')
    expect(wsCache.get('codeLineNumbers')).toBe(true)
    expect(wsCache.get('codeFontFamily')).toBe('jetbrains-mono')
    expect(setDarkModeMock).toHaveBeenLastCalledWith('dark')
  })
})
