import { describe, expect, it } from 'vitest'
import {
  appearanceDefaults,
  codeThemeGroups,
  getCodeFontFamilyStack,
  getEditorFontFamilyStack,
  resolveAppTheme,
} from '../appearance'

describe('appearance constants', () => {
  it('defines all code themes without auto', () => {
    const values = codeThemeGroups.flatMap((group) => group.themes.map((theme) => theme.value))

    expect(values).toEqual([
      'one-dark',
      'dracula',
      'monokai',
      'solarized-dark',
      'nord',
      'tokyo-night',
      'github-light',
      'solarized-light',
      'atom-one-light',
    ])
    expect(values).not.toContain('auto')
  })

  it('resolves theme preference with system fallback', () => {
    expect(resolveAppTheme('light', 'dark')).toBe('light')
    expect(resolveAppTheme('dark', 'light')).toBe('dark')
    expect(resolveAppTheme('system', 'dark')).toBe('dark')
    expect(resolveAppTheme('system', 'light')).toBe('light')
  })

  it('maps font presets to concrete font stacks', () => {
    expect(getEditorFontFamilyStack('clean-sans')).toContain('sans-serif')
    expect(getEditorFontFamilyStack('reading-serif')).toContain('serif')
    expect(getCodeFontFamilyStack('jetbrains-mono')).toContain('JetBrains Mono')
    expect(getCodeFontFamilyStack('fira-code')).toContain('Fira Code')
    expect(appearanceDefaults.codeTheme).toBe('one-dark')
  })
})
