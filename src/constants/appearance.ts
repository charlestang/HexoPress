export type AppThemePreference = 'system' | 'light' | 'dark'
export type EditorFontPresetId = 'clean-sans' | 'reading-serif' | 'mono'
export type CodeFontPresetId = 'system-mono' | 'jetbrains-mono' | 'fira-code'
export type AppearanceCodeTheme =
  | 'one-dark'
  | 'dracula'
  | 'monokai'
  | 'solarized-dark'
  | 'nord'
  | 'tokyo-night'
  | 'github-light'
  | 'solarized-light'
  | 'atom-one-light'

type Option<T extends string> = {
  value: T
  labelKey: string
}

type CodeThemeGroup = {
  id: 'dark' | 'light'
  labelKey: string
  themes: Array<Option<AppearanceCodeTheme>>
}

export const appThemeOptions: Array<Option<AppThemePreference>> = [
  { value: 'system', labelKey: 'settings.system' },
  { value: 'light', labelKey: 'settings.light' },
  { value: 'dark', labelKey: 'settings.dark' },
]

export const editorFontPresetOptions: Array<Option<EditorFontPresetId>> = [
  { value: 'clean-sans', labelKey: 'settings.fontPresets.cleanSans' },
  { value: 'reading-serif', labelKey: 'settings.fontPresets.readingSerif' },
  { value: 'mono', labelKey: 'settings.fontPresets.mono' },
]

export const codeFontPresetOptions: Array<Option<CodeFontPresetId>> = [
  { value: 'system-mono', labelKey: 'settings.fontPresets.systemMono' },
  { value: 'jetbrains-mono', labelKey: 'settings.fontPresets.jetbrainsMono' },
  { value: 'fira-code', labelKey: 'settings.fontPresets.firaCode' },
]

export const codeThemeGroups: CodeThemeGroup[] = [
  {
    id: 'dark',
    labelKey: 'settings.codeThemeGroups.dark',
    themes: [
      { value: 'one-dark', labelKey: 'settings.codeThemes.oneDark' },
      { value: 'dracula', labelKey: 'settings.codeThemes.dracula' },
      { value: 'monokai', labelKey: 'settings.codeThemes.monokai' },
      { value: 'solarized-dark', labelKey: 'settings.codeThemes.solarizedDark' },
      { value: 'nord', labelKey: 'settings.codeThemes.nord' },
      { value: 'tokyo-night', labelKey: 'settings.codeThemes.tokyoNight' },
    ],
  },
  {
    id: 'light',
    labelKey: 'settings.codeThemeGroups.light',
    themes: [
      { value: 'github-light', labelKey: 'settings.codeThemes.githubLight' },
      { value: 'solarized-light', labelKey: 'settings.codeThemes.solarizedLight' },
      { value: 'atom-one-light', labelKey: 'settings.codeThemes.atomOneLight' },
    ],
  },
]

export const editorFontStacks: Record<EditorFontPresetId, string> = {
  'clean-sans':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  'reading-serif':
    '"Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", STSong, Georgia, "Times New Roman", serif',
  mono: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}

export const codeFontStacks: Record<CodeFontPresetId, string> = {
  'system-mono':
    '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  'jetbrains-mono':
    '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  'fira-code':
    '"Fira Code", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}

export const appearanceDefaults = {
  darkMode: 'system' as AppThemePreference,
  editorLineWrap: true,
  editorFontSize: 16,
  editorFontFamily: 'clean-sans' as EditorFontPresetId,
  codeTheme: 'one-dark' as AppearanceCodeTheme,
  codeLineNumbers: false,
  codeFontFamily: 'system-mono' as CodeFontPresetId,
}

export const appThemeValues = appThemeOptions.map((option) => option.value)
export const editorFontPresetValues = editorFontPresetOptions.map((option) => option.value)
export const codeFontPresetValues = codeFontPresetOptions.map((option) => option.value)
export const codeThemeValues = codeThemeGroups.flatMap((group) =>
  group.themes.map((theme) => theme.value),
)

export function getEditorFontFamilyStack(preset: EditorFontPresetId): string {
  return editorFontStacks[preset]
}

export function getCodeFontFamilyStack(preset: CodeFontPresetId): string {
  return codeFontStacks[preset]
}

export function resolveAppTheme(
  preference: AppThemePreference,
  systemTheme: 'light' | 'dark',
): 'light' | 'dark' {
  return preference === 'system' ? systemTheme : preference
}
