import { mount } from '@vue/test-utils'
import KeywordSpan from '../KeywordSpan.vue'
import { describe, it, expect } from 'vitest'

describe('KeywordSpan.vue', () => {
  it('renders keyword with background color', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: ['world'],
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')

    expect(marks).toHaveLength(1)
    expect(marks[0].element.textContent).toBe('world')
    expect(spans[0].element.textContent).toBe('Hello ')
  })

  it('handles keyword that matches entire text', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello',
        keywords: ['Hello'],
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')

    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('Hello')
    expect(spans).toHaveLength(0)
  })

  it('handles special characters in keywords', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Price: $100.50',
        keywords: ['$100.50'],
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('$100.50')
    expect(spans).toHaveLength(1)
    expect(spans[0].element.textContent).toBe('Price: ')
  })

  it('handles unicode characters', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: '你好世界 Hello',
        keywords: ['你好', 'Hello'],
      },
    })

    const marks = wrapper.findAll('mark')
    expect(marks).toHaveLength(2)
    expect(marks[0].text()).toBe('你好')
    expect(marks[1].text()).toBe('Hello')
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: ['world'],
      },
    })

    const mark = wrapper.find('mark')
    const span = wrapper.find('span')

    // Check keyword styling
    expect(mark.classes()).toContain('title')
    expect(mark.classes()).toContain('title-kw')

    // Check non-keyword styling
    expect(span.classes()).toContain('title')
    expect(span.classes()).not.toContain('title-kw')
  })

  it('uses default empty array for keywords prop', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: [], // 显式传递空数组来测试默认行为
      },
    })

    const spans = wrapper.findAll('span')
    const marks = wrapper.findAll('mark')

    expect(spans).toHaveLength(1)
    expect(marks).toHaveLength(0)
    expect(spans[0].text()).toBe('Hello world')
  })

  it('handles adjacent keywords', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'HelloWorld',
        keywords: ['Hello', 'World'],
      },
    })

    const marks = wrapper.findAll('mark')
    expect(marks).toHaveLength(2)
    expect(marks[0].text()).toBe('Hello')
    expect(marks[1].text()).toBe('World')
  })

  it('maintains correct order of text parts', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'A B C D E',
        keywords: ['B', 'D'],
      },
    })

    const allElements = wrapper.findAll('span, mark')
    expect(allElements).toHaveLength(5)

    // Check order: A, B, C, D, E
    expect(allElements[0].text()).toBe('A ')
    expect(allElements[1].text()).toBe('B')
    expect(allElements[2].text()).toBe(' C ')
    expect(allElements[3].text()).toBe('D')
  })

  it('computes parts correctly with complex text', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'The quick brown fox jumps over the lazy dog',
        keywords: ['quick', 'fox', 'lazy'],
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')

    expect(marks).toHaveLength(3)
    expect(spans).toHaveLength(3)

    // Verify keywords are highlighted
    expect(marks[0].text()).toBe('quick')
    expect(marks[1].text()).toBe('fox')
    expect(marks[2].text()).toBe('lazy')

    // Verify non-keyword parts
    expect(spans[0].text()).toBe('The ')
    expect(spans[1].text()).toBe(' brown ')
    expect(spans[2].text()).toBe(' jumps over the ')
  })
})
