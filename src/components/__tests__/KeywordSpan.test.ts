import { mount } from '@vue/test-utils'
import KeywordSpan from '../KeywordSpan.vue'
import { describe, it, expect } from 'vitest'

describe('KeywordSpan.vue', () => {
  it('renders keyword with background color', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: 'world',
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
        keywords: 'Hello',
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')

    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('Hello')
    expect(spans).toHaveLength(0)
  })

  it('handles special characters in keyword', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Price: $100.50',
        keywords: '$100.50',
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
        keywords: '你好',
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('你好')
    expect(spans).toHaveLength(1)
    expect(spans[0].text()).toBe('世界 Hello')
  })

  it('applies correct UnoCSS classes', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: 'world',
      },
    })

    const mark = wrapper.find('mark')
    const span = wrapper.find('span')

    // Check keyword styling
    expect(mark.classes()).toContain('bg-yellow-400')
    expect(mark.classes()).toContain('text-black')

    // Check non-keyword styling
    expect(span.classes()).toContain('inline')
    expect(span.classes()).toContain('align-baseline')
  })

  it('handles empty keyword', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: '',
      },
    })

    const spans = wrapper.findAll('span')
    const marks = wrapper.findAll('mark')

    expect(spans).toHaveLength(1)
    expect(marks).toHaveLength(0)
    expect(spans[0].text()).toBe('Hello world')
  })

  it('handles whitespace in keyword', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'Hello world',
        keywords: '  world  ',
      },
    })

    const marks = wrapper.findAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('world')
  })

  it('maintains correct order of text parts', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'A B C D E',
        keywords: 'B',
      },
    })

    const allElements = wrapper.findAll('span, mark')
    expect(allElements).toHaveLength(3)

    // Check order: A, B, C D E
    expect(allElements[0].text()).toBe('A')
    expect(allElements[1].text()).toBe('B')
    expect(allElements[2].text()).toBe('C D E')
  })

  it('computes parts correctly with complex text', () => {
    const wrapper = mount(KeywordSpan, {
      props: {
        text: 'The quick brown fox jumps over the lazy dog',
        keywords: 'fox',
      },
    })

    const marks = wrapper.findAll('mark')
    const spans = wrapper.findAll('span')

    expect(marks).toHaveLength(1)
    expect(spans).toHaveLength(2)

    // Verify keyword is highlighted
    expect(marks[0].text()).toBe('fox')

    // Verify non-keyword parts
    expect(spans[0].text()).toBe('The quick brown')
    expect(spans[1].text()).toBe('jumps over the lazy dog')
  })
})
