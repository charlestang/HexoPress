import { mount } from '@vue/test-utils'
import KeywordSpan from '../KeywordSpan.vue'
import { describe, it, expect } from 'vitest'

describe('KeywordSpan.vue', () => {
  it('renders keyword with background color', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: ['world']
      }
    })

    const keywordSpan = wrapper.find('span.title-kw')
    expect(keywordSpan.text()).toBe('world')
  })

  it('renders non-keyword without background color', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: ['world']
      }
    })

    const nonKeywordSpan = wrapper.find('span:not([style])')
    expect(nonKeywordSpan.text()).toBe('Hello')
  })
})