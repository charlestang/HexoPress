import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EditorMain from '../EditorMain.vue'
import { useEditorStore } from '@/stores/editorStore'
import en from '@/locales/en.json'

const getPostDocumentMock = vi.hoisted(() => vi.fn())
const savePostDocumentMock = vi.hoisted(() => vi.fn())
const createFileMock = vi.hoisted(() => vi.fn())
const moveFileMock = vi.hoisted(() => vi.fn())
const deleteFileMock = vi.hoisted(() => vi.fn())
const computeImagePathMock = vi.hoisted(() => vi.fn(() => '/HexoPress/images/test.png'))
const resolveMarkdownImageUrlMock = vi.hoisted(() =>
  vi.fn(() => 'http://127.0.0.1:2357/images/test.png'),
)
const insertTextSpy = vi.hoisted(() => vi.fn())

vi.mock('@/bridge', () => ({
  site: {
    getPostDocument: getPostDocumentMock,
    savePostDocument: savePostDocumentMock,
    createFile: createFileMock,
    moveFile: moveFileMock,
    deleteFile: deleteFileMock,
    setDarkMode: vi.fn(),
    getHexoConfig: vi.fn(() => Promise.resolve(null)),
    getSiteInfo: vi.fn(() => Promise.resolve(null)),
  },
}))

const pushSpy = vi.hoisted(() => vi.fn())
const goSpy = vi.hoisted(() => vi.fn())
const routeQuery = vi.hoisted(() => ({ value: {} as Record<string, string> }))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => ({
      query: routeQuery.value,
    }),
    useRouter: () => ({
      push: pushSpy,
      go: goSpy,
    }),
  }
})

vi.mock('@/router', () => ({
  default: {
    go: goSpy,
    push: pushSpy,
  },
}))

vi.mock('@/utils/path', () => ({
  computeImagePath: computeImagePathMock,
}))

vi.mock('@/utils/markdownImage', () => ({
  encodeMarkdownImagePath: vi.fn((p: string) => p),
  resolveMarkdownImageUrl: resolveMarkdownImageUrlMock,
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

const sampleMeta: PostMeta = {
  title: 'Test Post',
  date: '2024-06-01T00:00:00Z',
  permalink: 'test-post',
  categories: ['dev'],
  tags: ['vue', 'test'],
}

const sampleContent = '# Hello\n\nThis is a test post.'

const globalStubs = {
  UnaEditor: defineComponent({
    name: 'UnaEditor',
    template: '<div class="una-editor"><slot /></div>',
    props: ['modelValue', 'livePreview', 'lineWrap', 'vimMode', 'renderHooks'],
    emits: ['update:modelValue', 'save', 'drop', 'focus', 'blur'],
    methods: {
      getSelection: () => 'selected text',
      getHeadings: () => [{ text: 'Hello', level: 1, line: 1 }],
      scrollToLine: vi.fn(),
      insertText: insertTextSpy,
    },
  }),
  FilenameDialog: { template: '<div />' },
  DateMetaEntry: { template: '<div />', props: ['modelValue'] },
  UrlMetaEntry: { template: '<div />', props: ['modelValue'] },
  CategoriesTreePanel: { template: '<div />', props: ['modelValue'] },
  UploadImageDialog: {
    template: '<div />',
    props: ['modelValue', 'filePath', 'imageFile'],
  },
  'el-container': { template: '<div><slot /></div>' },
  'el-header': { template: '<div><slot /></div>' },
  'el-main': { template: '<div><slot /></div>' },
  'el-aside': { template: '<div><slot /></div>' },
  'el-row': { template: '<div><slot /></div>' },
  'el-col': { template: '<div><slot /></div>' },
  'el-form': { template: '<div><slot /></div>' },
  'el-form-item': { template: '<div><slot /></div>' },
  'el-input': { template: '<div />', props: ['modelValue'] },
  'el-collapse': { template: '<div><slot /></div>', props: ['modelValue'] },
  'el-collapse-item': { template: '<div><slot /></div>', props: ['title', 'name'] },
  'el-button': { template: '<button><slot /></button>' },
  'el-link': { template: '<a><slot /></a>' },
  'el-icon': { template: '<span />' },
  'el-text': { template: '<span><slot /></span>' },
  'el-input-tag': { template: '<div />', props: ['modelValue'] },
}

const flushAsync = async () => {
  await Promise.resolve()
  await nextTick()
  await nextTick()
}

function createWrapper(queryOverrides: Record<string, string> = {}) {
  routeQuery.value = queryOverrides
  return mount(EditorMain, {
    global: {
      plugins: [i18n],
      stubs: globalStubs,
    },
  })
}

describe('EditorMain.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    Object.assign(import.meta.env, {
      VITE_ASSET_BASE_URL: 'http://127.0.0.1:2357/',
    })
    getPostDocumentMock.mockReset()
    savePostDocumentMock.mockReset()
    createFileMock.mockReset()
    moveFileMock.mockReset()
    deleteFileMock.mockReset()
    computeImagePathMock.mockClear()
    resolveMarkdownImageUrlMock.mockClear()
    insertTextSpy.mockClear()
    pushSpy.mockReset()
    goSpy.mockReset()

    getPostDocumentMock.mockResolvedValue({
      meta: { ...sampleMeta },
      content: sampleContent,
    })
    savePostDocumentMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // --- editorStore sync contract ---

  describe('editorStore sync on load', () => {
    it('syncs text and frontMatter to editorStore after loading an existing post', async () => {
      createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const store = useEditorStore()
      expect(store.text).toBe(sampleContent)
      expect(store.frontMatter.title).toBe('Test Post')
      expect(store.frontMatter.tags).toEqual(['vue', 'test'])
    })

    it('does not call getPostDocument for a new post', async () => {
      createWrapper({ type: 'new' })
      await flushAsync()

      expect(getPostDocumentMock).not.toHaveBeenCalled()
    })

    it('does not mark dirty after initial load', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { isDirty: boolean }
      expect(vm.isDirty).toBe(false)
    })
  })

  // --- dirty tracking ---

  describe('dirty tracking', () => {
    it('marks dirty when text changes after initialization', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { text: string; isDirty: boolean }
      vm.text = 'changed content'
      await nextTick()

      expect(vm.isDirty).toBe(true)
    })

    it('syncs changed text to editorStore', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { text: string }
      vm.text = 'new content'
      await nextTick()

      const store = useEditorStore()
      expect(store.text).toBe('new content')
    })
  })

  // --- save contract ---

  describe('save contract', () => {
    it('calls savePostDocument for a published post on save', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as {
        text: string
        isDirty: boolean
        onSave: () => Promise<void>
      }
      vm.text = 'updated body'
      await nextTick()
      expect(vm.isDirty).toBe(true)

      await vm.onSave()
      await flushAsync()

      expect(savePostDocumentMock).toHaveBeenCalledWith(
        '_posts/hello.md',
        expect.objectContaining({
          content: 'updated body',
          meta: expect.objectContaining({ title: 'Test Post' }),
        }),
      )
    })

    it('calls savePostDocument for an existing draft on save', async () => {
      const wrapper = createWrapper({ sourcePath: '_drafts/draft.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as {
        text: string
        onSave: () => Promise<void>
      }
      vm.text = 'draft update'
      await nextTick()
      await vm.onSave()
      await flushAsync()

      expect(savePostDocumentMock).toHaveBeenCalledWith(
        '_drafts/draft.md',
        expect.objectContaining({ content: 'draft update' }),
      )
    })

    it('creates a new draft file when saving a new post', async () => {
      createFileMock.mockResolvedValue('_drafts/new-post.md')
      const wrapper = createWrapper({ type: 'new' })
      await flushAsync()

      const vm = wrapper.vm as unknown as {
        text: string
        frontMatter: PostMeta
        isDirty: boolean
        onSave: () => Promise<void>
      }
      vm.frontMatter.title = 'New Post'
      vm.text = 'new content'
      await nextTick()

      await vm.onSave()
      await flushAsync()

      expect(createFileMock).toHaveBeenCalledWith('_drafts', 'New Post', expect.any(String), '')
      expect(savePostDocumentMock).toHaveBeenCalled()
    })

    it('does not save when nothing changed', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { onSave: () => Promise<void> }
      await vm.onSave()
      await flushAsync()

      expect(savePostDocumentMock).not.toHaveBeenCalled()
    })
  })

  // --- auto-save ---

  describe('auto-save', () => {
    it('triggers save after 30s interval when autoSave is on and dirty', async () => {
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()
      appStore.autoSave = 'autoSaveOn'

      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { text: string; isDirty: boolean }
      vm.text = 'auto-saved content'
      await nextTick()
      expect(vm.isDirty).toBe(true)

      vi.advanceTimersByTime(30_000)
      await flushAsync()

      expect(savePostDocumentMock).toHaveBeenCalled()
    })

    it('does not auto-save when autoSave is off', async () => {
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()
      appStore.autoSave = 'autoSaveOff'

      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { text: string }
      vm.text = 'should not auto-save'
      await nextTick()

      vi.advanceTimersByTime(60_000)
      await flushAsync()

      expect(savePostDocumentMock).not.toHaveBeenCalled()
    })
  })

  // --- selection sync ---

  describe('selection sync', () => {
    it('polls selection and syncs to editorStore', async () => {
      createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      vi.advanceTimersByTime(300)
      await nextTick()

      const store = useEditorStore()
      expect(store.selectedText).toBe('selected text')
    })
  })

  // --- heading sync ---

  describe('heading sync', () => {
    it('polls headings from editor and syncs to editorStore', async () => {
      createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      vi.advanceTimersByTime(1000)
      await nextTick()

      const store = useEditorStore()
      expect(store.currentHeadings.length).toBeGreaterThan(0)
      expect(store.currentHeadings[0]!.text).toBe('Hello')
    })
  })

  // --- drop image ---

  describe('drop image upload', () => {
    it('prepares upload dialog state when files are dropped', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as {
        onDropImage: (files: File[]) => void
        showUploadDialog: boolean
      }

      const file = new File(['img'], 'photo.png', { type: 'image/png' })
      vm.onDropImage([file])

      expect(vm.showUploadDialog).toBe(true)
    })

    it('does nothing when empty file list is dropped', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as {
        onDropImage: (files: File[]) => void
        showUploadDialog: boolean
      }

      vm.onDropImage([])
      expect(vm.showUploadDialog).toBe(false)
    })

    it('inserts a deployed absolute image path after upload succeeds', async () => {
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()
      appStore.hexoConfig = {
        title: '',
        subtitle: '',
        description: '',
        keywords: [],
        author: '',
        language: 'en',
        timezone: 'UTC',
        url: '',
        permalink: '',
        date_format: '',
        time_format: '',
        theme: '',
        source_dir: 'source',
        root: '/HexoPress/',
      }

      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as {
        onDropImage: (files: File[]) => void
        uploaded: () => void
      }

      vm.onDropImage([new File(['img'], 'photo.png', { type: 'image/png' })])
      await nextTick()
      vm.uploaded()
      await nextTick()

      expect(computeImagePathMock).toHaveBeenCalledWith('/HexoPress/', 'images/2024/06/photo.png')
      expect(insertTextSpy).toHaveBeenCalledWith('![](/HexoPress/images/test.png)\n\n')
      expect(wrapper.emitted('media-uploaded')).toHaveLength(1)
    })
  })

  describe('render hooks', () => {
    it('passes a root-aware image render hook to UnaEditor', async () => {
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()
      appStore.hexoConfig = {
        title: '',
        subtitle: '',
        description: '',
        keywords: [],
        author: '',
        language: 'en',
        timezone: 'UTC',
        url: '',
        permalink: '',
        date_format: '',
        time_format: '',
        theme: '',
        source_dir: 'source',
        root: '/HexoPress/',
      }

      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const editor = wrapper.findComponent({ name: 'UnaEditor' })
      const renderHooks = editor.props('renderHooks') as {
        image: (context: Record<string, unknown>) => { src: string }
      }

      const result = renderHooks.image({
        src: '/HexoPress/images/test.png',
        alt: '',
        raw: '![](/HexoPress/images/test.png)',
        position: { from: 0, to: 27 },
      })

      expect(resolveMarkdownImageUrlMock).toHaveBeenCalledWith(
        '/HexoPress/images/test.png',
        'http://127.0.0.1:2357/',
        'test-post',
        '/HexoPress/',
      )
      expect(result).toEqual({ src: 'http://127.0.0.1:2357/images/test.png' })
    })
  })

  // --- permalink-change emit ---

  describe('permalink-change emit', () => {
    it('emits permalink-change when frontMatter.permalink changes', async () => {
      const wrapper = createWrapper({ sourcePath: '_posts/hello.md' })
      await flushAsync()

      const vm = wrapper.vm as unknown as { frontMatter: PostMeta }
      vm.frontMatter.permalink = 'new-slug'
      await nextTick()

      const emitted = wrapper.emitted('permalink-change')
      expect(emitted).toBeTruthy()
      expect(emitted!.some((args) => args[0] === 'new-slug')).toBe(true)
    })
  })
})
