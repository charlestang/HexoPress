import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import KeywordSpan from '../KeywordSpan.vue'

type KeywordSpanProps = {
  text: string
  keywords: string
}

const mountKeywordSpan = (props?: Partial<KeywordSpanProps>) =>
  mount(KeywordSpan, {
    props: {
      text: 'Hello world',
      keywords: 'world',
      ...props,
    },
  })

const getTexts = (wrapper: VueWrapper, selector: string) =>
  wrapper.findAll(selector).map((node) => node.text())

describe('KeywordSpan.vue', () => {
  it('高亮匹配到的关键词，同时保留前后文本', () => {
    const wrapper = mountKeywordSpan()

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['world'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['Hello'])
  })

  it('当关键词与文本完全一致时，仅渲染标记元素', () => {
    const wrapper = mountKeywordSpan({ text: 'Hello', keywords: 'Hello' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['Hello'])
    expect(wrapper.findAll('span')).toHaveLength(0)
  })

  it('支持包含特殊字符的关键词', () => {
    const wrapper = mountKeywordSpan({ text: 'Price: $100.50', keywords: '$100.50' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['$100.50'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['Price:'])
  })

  it('正确处理 Unicode 文本', () => {
    const wrapper = mountKeywordSpan({ text: '你好世界 Hello', keywords: '你好' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['你好'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['世界 Hello'])
  })

  it('为不同部分应用正确的 UnoCSS 类名', () => {
    const wrapper = mountKeywordSpan()
    const mark = wrapper.find('mark')
    const span = wrapper.find('span')

    expect(mark.classes()).toEqual(
      expect.arrayContaining(['bg-yellow-400', 'text-black', 'inline', 'align-baseline']),
    )

    expect(span.classes()).toEqual(
      expect.arrayContaining(['inline', 'align-baseline', 'text-ellipsis', 'max-w-full']),
    )
  })

  it('关键词为空时返回原始文本且不渲染 mark', () => {
    const wrapper = mountKeywordSpan({ keywords: '' })

    expect(wrapper.findAll('mark')).toHaveLength(0)
    expect(getTexts(wrapper, 'span')).toStrictEqual(['Hello world'])
  })

  it('自动去除关键词首尾空白后再匹配', () => {
    const wrapper = mountKeywordSpan({ keywords: '  world  ' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['world'])
  })

  it('保持文本片段的渲染顺序', () => {
    const wrapper = mountKeywordSpan({ text: 'A B C D E', keywords: 'B' })
    const fragmentTexts = getTexts(wrapper, 'span, mark')

    expect(fragmentTexts).toStrictEqual(['A', 'B', 'C D E'])
  })

  it('在复杂文本中仅拆分一次关键词并保留前后片段', () => {
    const wrapper = mountKeywordSpan({
      text: 'The quick brown fox jumps over the lazy dog',
      keywords: 'fox',
    })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['fox'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['The quick brown', 'jumps over the lazy dog'])
  })

  it('关键词不存在时仅渲染原始文本', () => {
    const wrapper = mountKeywordSpan({ text: 'Sample text', keywords: 'missing' })

    expect(wrapper.findAll('mark')).toHaveLength(0)
    expect(getTexts(wrapper, 'span')).toStrictEqual(['Sample text'])
  })

  it('高亮同一关键词的多次出现', () => {
    const wrapper = mountKeywordSpan({ text: 'foo bar foo', keywords: 'foo' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['foo', 'foo'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['bar'])
  })

  it('在 props 更新时重新计算关键词片段', async () => {
    const wrapper = mountKeywordSpan({ text: 'foo bar', keywords: 'foo' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['foo'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['bar'])

    await wrapper.setProps({ keywords: 'bar' })

    expect(getTexts(wrapper, 'mark')).toStrictEqual(['bar'])
    expect(getTexts(wrapper, 'span')).toStrictEqual(['foo'])
  })
})
