import { mount } from '@vue/test-utils'
import { defineComponent, h, computed, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import PostPreviewDialog from '../PostPreviewDialog.vue'
import en from '@/locales/en.json'

const createMdPreviewStub = () =>
  defineComponent({
    name: 'MdPreview',
    props: {
      modelValue: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const headings = computed(() => {
        return (props.modelValue || '')
          .split('\n')
          .map((line) => {
            const match = /^(#{1,6})\s*(.*)$/.exec(line.trim())
            if (!match) return null
            const [, hashes = '', title = ''] = match
            return { level: hashes.length, text: title }
          })
          .filter(Boolean) as Array<{ level: number; text: string }>
      })
      return () =>
        h(
          'div',
          { class: 'md-preview-stub' },
          headings.value.map((heading, idx) =>
            h(`h${heading.level}`, { id: `stub-${idx}` }, heading.text),
          ),
        )
    },
  })

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

const flushAsync = async () => {
  await Promise.resolve()
  await nextTick()
  await nextTick()
}

const waitForToc = async (wrapper: ReturnType<typeof mount>) => {
  for (let i = 0; i < 5; i += 1) {
    await flushAsync()
    if (wrapper.findAll('.toc-item').length > 0) {
      break
    }
  }
}

describe('PostPreviewDialog.vue', () => {
  const getPostDocument = vi.fn(async () => ({
    meta: {
      title: 'Hello World',
      date: '2024-01-01',
      tags: ['tag1'],
      categories: ['cat'],
    },
    content: '## Intro\n### Part A\n#### Skip',
  }))

  beforeEach(() => {
    window.site = {
      getPostDocument,
    } as unknown as ISite
    getPostDocument.mockClear()
  })

  it('builds a TOC with up to 3 levels and numbered top-level entries', async () => {
    const wrapper = mount(PostPreviewDialog, {
      props: {
        modelValue: true,
        sourcePath: '_posts/demo.md',
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-dialog': {
            template: '<div><slot /></div>',
          },
          'el-icon': true,
          'el-scrollbar': { template: '<div class="el-scrollbar"><slot /></div>' },
          MdPreview: createMdPreviewStub(),
        },
      },
    })

    await waitForToc(wrapper)

    const vm = wrapper.vm as unknown as {
      tocItems: Array<{ id: string; level: number; index?: number }>
    }

    expect(vm.tocItems).toHaveLength(2)
    expect(
      wrapper.find('.content-column').element.querySelectorAll('h1, h2, h3').length,
    ).toBeGreaterThan(0)
    const tocItems = wrapper.findAll('.toc-item')
    expect(tocItems.length).toBeGreaterThanOrEqual(2)
    expect(tocItems[0]!.text()).toContain('1.')
    expect(tocItems[0]!.classes()).toContain('toc-level-2')
    expect(tocItems[1]!.classes()).toContain('toc-level-3')
    expect(wrapper.findAll('.toc-level-3')).toHaveLength(1)
  })

  it('scrolls content area to heading when TOC item is clicked', async () => {
    const wrapper = mount(PostPreviewDialog, {
      props: {
        modelValue: true,
        sourcePath: '_posts/demo.md',
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-dialog': {
            template: '<div><slot /></div>',
          },
          'el-icon': true,
          'el-scrollbar': { template: '<div class="el-scrollbar"><slot /></div>' },
          MdPreview: createMdPreviewStub(),
        },
      },
    })

    await waitForToc(wrapper)

    const container = wrapper.find('.content-column').element as HTMLElement & {
      scrollTo?: (options: ScrollToOptions) => void
    }
    const scrollSpy = vi.fn()
    container.scrollTo = scrollSpy

    const firstHeading = container.querySelector('h2') as HTMLElement | null
    expect(firstHeading).not.toBeNull()
    if (!firstHeading) return
    Object.defineProperty(firstHeading, 'offsetTop', { value: 120 })
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ top: 0 }) as DOMRect,
    })
    Object.defineProperty(firstHeading, 'getBoundingClientRect', {
      value: () => ({ top: 120 }) as DOMRect,
    })

    await wrapper.find('.toc-item').trigger('click')

    expect(scrollSpy).toHaveBeenCalled()
  })

  it('resets preview scroll to top on open', async () => {
    const wrapper = mount(PostPreviewDialog, {
      props: {
        modelValue: true,
        sourcePath: '_posts/demo.md',
      },
      global: {
        plugins: [i18n],
        stubs: {
          'el-dialog': {
            template: '<div><slot /></div>',
          },
          'el-icon': true,
          'el-scrollbar': { template: '<div class="el-scrollbar"><slot /></div>' },
          MdPreview: createMdPreviewStub(),
        },
      },
    })

    const container = wrapper.find('.content-column').element as HTMLElement & {
      scrollTo?: (options: ScrollToOptions) => void
      scrollTop: number
    }
    const scrollSpy = vi.fn()
    container.scrollTop = 200
    container.scrollTo = scrollSpy

    await waitForToc(wrapper)
    await nextTick()

    if (scrollSpy.mock.calls.length === 0 && container.scrollTop === 0) {
      return
    }

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0 })
  })
})
