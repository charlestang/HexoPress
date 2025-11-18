import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TagPostsDialog from '../TagPostsDialog.vue'
import en from '@/locales/en.json'

const confirmSpy = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const pushSpy = vi.hoisted(() => vi.fn())

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')
  return {
    ...actual,
    ElMessageBox: {
      confirm: confirmSpy,
    },
  }
})

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushSpy,
  }),
}))

type MountOptions = {
  posts?: Post[]
  tag?: Tag | null
}

const createPost = (overrides: Partial<Post> = {}): Post => ({
  title: 'Sample',
  date: '2024-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z',
  source: '_posts/sample.md',
  status: 'published',
  layout: 'post',
  path: 'sample',
  permalink: '/sample',
  asset_dir: '',
  tags: {
    'tag-clean': 'Cleanup',
    'tag-keep': 'Keep',
  },
  categories: [],
  ...overrides,
})

const flushPromises = async () => {
  await Promise.resolve()
  await nextTick()
}

describe('TagPostsDialog.vue', () => {
  const defaultTag: Tag = {
    id: 'tag-clean',
    name: 'Cleanup',
    slug: 'cleanup',
    path: '/tags/cleanup',
    permalink: 'https://example.com/tags/cleanup',
    length: 1,
  }

  const createWrapper = async (options: MountOptions = {}): Promise<VueWrapper> => {
    const posts = options.posts ?? [createPost()]
    const tag = options.tag ?? defaultTag

    const getPosts = vi.fn(async () => ({
      total: posts.length,
      posts: posts.map((post) => ({
        ...post,
        tags: { ...post.tags },
        categories: [...post.categories],
      })),
    }))

    const removeTagFromPost = vi.fn().mockResolvedValue(undefined)

    window.site = {
      getPosts,
      removeTagFromPost,
    } as unknown as ISite

    const wrapper = mount(TagPostsDialog, {
      props: {
        modelValue: true,
        tag,
      },
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'en',
            messages: { en },
          }),
        ],
        stubs: {
          'el-dialog': {
            template: '<div><slot /><slot name="footer" /></div>',
          },
          'el-skeleton': true,
          'el-alert': { template: '<div><slot /></div>' },
          'el-button': { template: '<button><slot /></button>' },
          'el-empty': { template: '<div><slot /></div>' },
          'el-table': { template: '<div class="el-table"><slot /></div>' },
          'el-table-column': { template: '<div class="el-table-column"></div>' },
          'el-link': { template: '<a class="el-link" @click="$emit(\'click\')"><slot /></a>' },
          'el-tag': { template: '<span class="el-tag"><slot /></span>' },
          'el-tooltip': { template: '<span class="el-tooltip"><slot /></span>' },
          'el-text': { template: '<span><slot /></span>' },
          'el-icon': { template: '<i><slot /></i>' },
        },
      },
    })

    await flushPromises()
    return Object.assign(wrapper, {
      removeTagFromPost,
    })
  }

  beforeEach(() => {
    confirmSpy.mockClear()
    pushSpy.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('removes the active tag from a post and schedules row removal', async () => {
    const wrapper = (await createWrapper()) as VueWrapper & {
      removeTagFromPost: ReturnType<typeof vi.fn>
    }
    const vm = wrapper.vm as unknown as {
      posts: Post[]
      onRemoveTag: (post: Post, tag: { id: string; name: string }) => Promise<void>
      tagRemovalError: string | null
    }
    expect(vm.posts).toHaveLength(1)

    vi.useFakeTimers()
    await vm.onRemoveTag(vm.posts[0]!, { id: 'tag-clean', name: 'Cleanup' })

    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(wrapper.removeTagFromPost).toHaveBeenCalledWith('_posts/sample.md', 'tag-clean')
    expect(vm.posts[0]?.tags?.['tag-clean']).toBeUndefined()

    vi.runAllTimers()
    await flushPromises()

    expect(vm.posts).toHaveLength(0)
  })

  it('shows an error message when the removal request fails', async () => {
    const failingPost = createPost()
    const wrapper = (await createWrapper({ posts: [failingPost] })) as VueWrapper & {
      removeTagFromPost: ReturnType<typeof vi.fn>
    }
    const vm = wrapper.vm as unknown as {
      posts: Post[]
      onRemoveTag: (post: Post, tag: { id: string; name: string }) => Promise<void>
      tagRemovalError: string | null
    }
    wrapper.removeTagFromPost.mockRejectedValueOnce(new Error('disk full'))

    await vm.onRemoveTag(vm.posts[0]!, { id: 'tag-clean', name: 'Cleanup' })

    expect(vm.tagRemovalError).toBe('Failed to remove tag. disk full')
    expect(vm.posts).toHaveLength(1)
  })

  it('navigates to editor with tag context when clicking title', async () => {
    const wrapper = await createWrapper()

    const vm = wrapper.vm as unknown as { openPostEditor: (post: Post) => void; posts: Post[] }
    vm.openPostEditor(vm.posts[0]!)

    expect(pushSpy).toHaveBeenCalledWith({
      path: '/frame',
      query: { sourcePath: '_posts/sample.md', tagId: 'tag-clean', tagDialog: '1' },
    })
  })

  it('renders active tag with accent style and others as normal', async () => {
    const wrapper = await createWrapper()
    const vm = wrapper.vm as unknown as {
      isActiveTag: (tagId: string) => boolean
    }

    expect(vm.isActiveTag('tag-clean')).toBe(true)
    expect(vm.isActiveTag('tag-keep')).toBe(false)
  })
})
