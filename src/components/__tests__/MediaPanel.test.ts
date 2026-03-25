import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import MediaPanel from '../MediaPanel.vue'
import en from '@/locales/en.json'

const getAssetsMock = vi.hoisted(() => vi.fn())
const getFileInfoMock = vi.hoisted(() => vi.fn())

vi.mock('@/bridge', () => ({
  site: {
    getAssets: getAssetsMock,
    getFileInfo: getFileInfoMock,
  },
}))

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

const waitForMediaItem = async (wrapper: ReturnType<typeof mount>) => {
  for (let i = 0; i < 5; i += 1) {
    await flushAsync()
    if (wrapper.find('.media-item').exists()) {
      break
    }
  }
}

describe('MediaPanel.vue', () => {
  beforeEach(() => {
    getAssetsMock.mockReset()
    getFileInfoMock.mockReset()
    Object.assign(import.meta.env, {
      VITE_ASSET_BASE_URL: 'http://127.0.0.1:2357/',
    })

    getAssetsMock.mockResolvedValue([
      {
        id: 'asset-1',
        path: 'images/2024/01/demo.png',
        modified: false,
        renderable: true,
        source: 'images/2024/01/demo.png',
      },
    ])
    getFileInfoMock.mockResolvedValue(null)
  })

  it('inserts a root-prefixed absolute path from the media library', async () => {
    const wrapper = mount(MediaPanel, {
      props: {
        active: true,
        root: '/HexoPress/',
      },
      global: {
        plugins: [i18n],
        stubs: {
          SearchBar: { template: '<div />' },
          'el-alert': { template: '<div />' },
          'el-skeleton': { template: '<div />' },
          'el-scrollbar': { template: '<div><slot /></div>' },
          'el-empty': { template: '<div />' },
          'el-dialog': { template: '<div><slot /><slot name="footer" /></div>' },
          'el-button': { template: '<button><slot /></button>' },
        },
      },
    })

    await waitForMediaItem(wrapper)

    const item = wrapper.find('.media-item')
    expect(item.exists()).toBe(true)

    await item.trigger('dblclick')

    const emitted = wrapper.emitted('request-insert')
    expect(emitted).toBeTruthy()
    expect(emitted?.[0]?.[0]).toBe('![](/HexoPress/images/2024/01/demo.png)\n\n')
  })
})
