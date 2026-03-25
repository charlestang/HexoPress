import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import MdRenderer from '../MdRenderer.vue'
import en from '@/locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

describe('MdRenderer.vue', () => {
  it('rewrites relative image url by permalink and asset base url', async () => {
    Object.assign(import.meta.env, {
      VITE_ASSET_BASE_URL: 'https://assets.example.com',
    })

    const wrapper = mount(MdRenderer, {
      props: {
        modelValue: '![](../images/2026/01/demo.png)',
        permalink: '/posts/hello-world/',
      },
      global: {
        plugins: [i18n],
      },
    })

    await nextTick()
    const image = wrapper.find('img')

    expect(image.exists()).toBe(true)
    expect(image.attributes('src')).toBe('https://assets.example.com/posts/images/2026/01/demo.png')
  })

  it('shows a fallback placeholder when image loading fails', async () => {
    Object.assign(import.meta.env, {
      VITE_ASSET_BASE_URL: 'https://assets.example.com',
    })

    const wrapper = mount(MdRenderer, {
      props: {
        modelValue: '![](https://missing.example.com/image.png)',
      },
      global: {
        plugins: [i18n],
      },
    })

    await nextTick()

    const image = wrapper.find('img')
    expect(image.exists()).toBe(true)

    image.element.dispatchEvent(new Event('error'))
    await nextTick()

    expect(wrapper.text()).toContain('Image not found: https://missing.example.com/image.png')
  })

  it('renders fenced code block with highlight wrapper', async () => {
    const wrapper = mount(MdRenderer, {
      props: {
        modelValue: '```js\nconst value = 1\n```',
      },
      global: {
        plugins: [i18n],
      },
    })

    await nextTick()
    expect(wrapper.find('pre.hljs').exists()).toBe(true)
    expect(wrapper.find('code').text()).toContain('const value = 1')
  })

  it('renders <!--more--> as a visual divider in preview', async () => {
    const wrapper = mount(MdRenderer, {
      props: {
        modelValue: 'before\n\n<!--more-->\n\nafter',
      },
      global: {
        plugins: [i18n],
      },
    })

    await nextTick()

    const divider = wrapper.find('.mdr-more-divider')
    expect(divider.exists()).toBe(true)
    expect(divider.text().toLowerCase()).toContain('more')
    expect(wrapper.html()).not.toContain('&lt;!--more--&gt;')
  })
})
