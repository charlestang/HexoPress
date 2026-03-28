import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PreferencesView from '../PreferencesView.vue'
import { useCache } from '@/hooks/useCache'
import { useAppStore } from '@/stores/app'
import en from '@/locales/en.json'

const cacheState = vi.hoisted(() => new Map<string, unknown>())
const pushSpy = vi.hoisted(() => vi.fn())
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

vi.mock('@/router', () => ({
  default: {
    push: pushSpy,
  },
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

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

const stubs = {
  'el-tabs': defineComponent({
    name: 'ElTabs',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="el-tabs"><slot /></div>',
  }),
  'el-tab-pane': defineComponent({
    name: 'ElTabPane',
    props: ['label', 'name'],
    template:
      '<section class="el-tab-pane" :data-name="name"><div class="tab-pane-label">{{ label }}</div><slot /></section>',
  }),
  'el-form': { template: '<div class="el-form"><slot /></div>' },
  'el-form-item': defineComponent({
    name: 'ElFormItem',
    props: ['label'],
    template: '<div class="el-form-item" :data-label="label"><slot /></div>',
  }),
  'el-input': defineComponent({
    name: 'ElInput',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="el-input" :data-value="modelValue"><slot /></div>',
  }),
  'el-select': defineComponent({
    name: 'ElSelect',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="el-select" :data-value="modelValue"><slot /></div>',
  }),
  'el-option': defineComponent({
    name: 'ElOption',
    props: ['label', 'value'],
    template: '<div class="el-option" :data-value="value">{{ label }}</div>',
  }),
  'el-option-group': defineComponent({
    name: 'ElOptionGroup',
    props: ['label'],
    template:
      '<div class="el-option-group" :data-label="label"><div class="el-option-group__label">{{ label }}</div><slot /></div>',
  }),
  'el-input-number': defineComponent({
    name: 'ElInputNumber',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="el-input-number" :data-value="modelValue"></div>',
  }),
  'el-switch': defineComponent({
    name: 'ElSwitch',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div class="el-switch" :data-value="modelValue"></div>',
  }),
  'el-radio-group': { template: '<div class="el-radio-group"><slot /></div>' },
  'el-radio': defineComponent({
    name: 'ElRadio',
    props: ['value'],
    template: '<label class="el-radio"><slot /></label>',
  }),
  'el-button': defineComponent({
    name: 'ElButton',
    props: ['icon'],
    emits: ['click'],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  }),
}

function createWrapper() {
  return mount(PreferencesView, {
    global: {
      plugins: [i18n],
      stubs,
    },
  })
}

describe('PreferencesView.vue', () => {
  beforeEach(() => {
    useCache('localStorage').wsCache.clear()
    wsCacheMock.get.mockClear()
    wsCacheMock.set.mockClear()
    wsCacheMock.delete.mockClear()
    wsCacheMock.clear.mockClear()
    pushSpy.mockReset()
    setDarkModeMock.mockReset()
    setActivePinia(createPinia())
  })

  it('renders the Appearance tab and grouped code theme options', () => {
    const wrapper = createWrapper()
    const optionTexts = wrapper.findAll('.el-option').map((node) => node.text())

    expect(wrapper.text()).toContain('General')
    expect(wrapper.text()).toContain('Appearance')
    expect(wrapper.text()).toContain('AI')
    expect(wrapper.text()).toContain('Theme')
    expect(wrapper.text()).toContain('Editor')
    expect(wrapper.text()).toContain('Code Block')
    expect(wrapper.text()).toContain('Changes apply immediately.')
    expect(wrapper.findAll('.el-option-group')).toHaveLength(2)
    expect(wrapper.text()).toContain('Dark Themes')
    expect(wrapper.text()).toContain('Light Themes')
    expect(optionTexts.filter((text) => text === 'System')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Save')
  })

  it('persists appearance setting changes immediately', async () => {
    const wrapper = createWrapper()
    const store = useAppStore()
    const { wsCache } = useCache('localStorage')

    wrapper
      .find('[data-label="Theme"]')
      .findComponent({ name: 'ElSelect' })
      .vm.$emit('update:modelValue', 'dark')
    wrapper
      .find('[data-label="Line Wrap"]')
      .findComponent({ name: 'ElSwitch' })
      .vm.$emit('update:modelValue', false)
    wrapper
      .find('[data-label="Editor Font Family"]')
      .findComponent({ name: 'ElSelect' })
      .vm.$emit('update:modelValue', 'mono')
    wrapper
      .find('[data-label="Code Block Theme"]')
      .findComponent({ name: 'ElSelect' })
      .vm.$emit('update:modelValue', 'github-light')
    wrapper
      .find('[data-label="Show Line Numbers"]')
      .findComponent({ name: 'ElSwitch' })
      .vm.$emit('update:modelValue', true)
    wrapper
      .find('[data-label="Code Font Family"]')
      .findComponent({ name: 'ElSelect' })
      .vm.$emit('update:modelValue', 'fira-code')
    wrapper
      .find('[data-label="Editor Font Size"]')
      .findComponent({ name: 'ElInputNumber' })
      .vm.$emit('update:modelValue', 20)

    await nextTick()

    expect(store.darkMode).toBe('dark')
    expect(store.editorLineWrap).toBe(false)
    expect(store.editorFontFamily).toBe('mono')
    expect(store.codeTheme).toBe('github-light')
    expect(store.codeLineNumbers).toBe(true)
    expect(store.codeFontFamily).toBe('fira-code')
    expect(store.editorFontSize).toBe(20)
    expect(wsCache.get('darkMode')).toBe('dark')
    expect(wsCache.get('editorLineWrap')).toBe(false)
    expect(wsCache.get('editorFontFamily')).toBe('mono')
    expect(wsCache.get('codeTheme')).toBe('github-light')
    expect(wsCache.get('codeLineNumbers')).toBe(true)
    expect(wsCache.get('codeFontFamily')).toBe('fira-code')
    expect(wsCache.get('editorFontSize')).toBe(20)
  })
})
