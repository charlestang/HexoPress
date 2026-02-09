import { describe, it, expect } from 'vitest'
import { parseSSELines, extractDelta, buildMessages } from '../aiService'

describe('parseSSELines', () => {
  it('should split complete lines', () => {
    const buffer = { partial: '' }
    const lines = parseSSELines('data: {"a":1}\ndata: {"b":2}\n', buffer)
    expect(lines).toEqual(['data: {"a":1}', 'data: {"b":2}'])
    expect(buffer.partial).toBe('')
  })

  it('should handle partial lines across chunks', () => {
    const buffer = { partial: '' }
    const lines1 = parseSSELines('data: {"a":', buffer)
    expect(lines1).toEqual([])
    expect(buffer.partial).toBe('data: {"a":')

    const lines2 = parseSSELines('1}\n', buffer)
    expect(lines2).toEqual(['data: {"a":1}'])
    expect(buffer.partial).toBe('')
  })

  it('should handle empty input', () => {
    const buffer = { partial: '' }
    const lines = parseSSELines('', buffer)
    expect(lines).toEqual([])
  })
})

describe('extractDelta', () => {
  it('should extract content from valid SSE data line', () => {
    const line = 'data: {"choices":[{"delta":{"content":"Hello"}}]}'
    expect(extractDelta(line)).toBe('Hello')
  })

  it('should return empty string for [DONE]', () => {
    expect(extractDelta('data: [DONE]')).toBe('')
  })

  it('should return empty string for non-data lines', () => {
    expect(extractDelta('')).toBe('')
    expect(extractDelta('event: message')).toBe('')
  })

  it('should return empty string for invalid JSON', () => {
    expect(extractDelta('data: {invalid}')).toBe('')
  })

  it('should return empty string when no content in delta', () => {
    const line = 'data: {"choices":[{"delta":{}}]}'
    expect(extractDelta(line)).toBe('')
  })
})

describe('buildMessages', () => {
  const baseMeta: PostMeta = {
    title: 'Test Article',
    tags: ['vue', 'typescript'],
    categories: ['frontend'],
  }

  it('should build messages with full context', () => {
    const messages = buildMessages({
      userMessage: 'Check for typos',
      systemPrompt: 'You are a proofreader.',
      contextMode: 'full',
      fullText: 'Hello world',
      selectedText: '',
      frontMatter: baseMeta,
    })

    expect(messages).toHaveLength(2)
    expect(messages[0]!.role).toBe('system')
    expect(messages[0]!.content).toContain('You are a proofreader.')
    expect(messages[0]!.content).toContain('Hello world')
    expect(messages[0]!.content).toContain('Test Article')
    expect(messages[1]!.role).toBe('user')
    expect(messages[1]!.content).toBe('Check for typos')
  })

  it('should build messages with selection context', () => {
    const messages = buildMessages({
      userMessage: 'Polish this',
      contextMode: 'selection',
      fullText: 'Full article text here',
      selectedText: 'selected part',
      frontMatter: baseMeta,
    })

    expect(messages).toHaveLength(2)
    expect(messages[0]!.content).toContain('selected part')
    expect(messages[0]!.content).not.toContain('Full article text here')
  })

  it('should build messages with no context', () => {
    const messages = buildMessages({
      userMessage: 'What is Vue?',
      contextMode: 'none',
      fullText: 'Some text',
      selectedText: '',
      frontMatter: baseMeta,
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]!.role).toBe('user')
    expect(messages[0]!.content).toBe('What is Vue?')
  })

  it('should always include front-matter when context is not none', () => {
    const messages = buildMessages({
      userMessage: 'Help',
      contextMode: 'full',
      fullText: '',
      selectedText: '',
      frontMatter: baseMeta,
    })

    expect(messages[0]!.content).toContain('Test Article')
    expect(messages[0]!.content).toContain('vue, typescript')
  })
})
