export interface AiChatRequest {
  provider: AiProvider
  messages: Array<{ role: string; content: string }>
  stream?: boolean
}

export type ContextMode = 'full' | 'selection' | 'none'

interface BuildMessagesOptions {
  userMessage: string
  systemPrompt?: string
  contextMode: ContextMode
  fullText: string
  selectedText: string
  frontMatter: PostMeta
}

function formatFrontMatter(meta: PostMeta): string {
  const parts: string[] = []
  if (meta.title) parts.push(`Title: ${meta.title}`)
  if (meta.tags && meta.tags.length > 0) parts.push(`Tags: ${meta.tags.join(', ')}`)
  if (meta.categories) {
    const cats = Array.isArray(meta.categories)
      ? meta.categories.flat().join(', ')
      : meta.categories
    if (cats) parts.push(`Categories: ${cats}`)
  }
  return parts.join('\n')
}

/**
 * Build the messages array for an AI chat request.
 */
export function buildMessages(
  options: BuildMessagesOptions,
): Array<{ role: string; content: string }> {
  const { userMessage, systemPrompt, contextMode, fullText, selectedText, frontMatter } = options
  const messages: Array<{ role: string; content: string }> = []

  const metaStr = formatFrontMatter(frontMatter)
  let contextStr = ''

  if (contextMode === 'full') {
    contextStr = fullText
  } else if (contextMode === 'selection') {
    contextStr = selectedText
  }

  let system = systemPrompt ?? ''
  if (contextMode !== 'none' && (metaStr || contextStr)) {
    const contextParts: string[] = []
    if (metaStr) contextParts.push(`[Article Metadata]\n${metaStr}`)
    if (contextStr) contextParts.push(`[Article Content]\n${contextStr}`)
    system = system ? `${system}\n\n${contextParts.join('\n\n')}` : contextParts.join('\n\n')
  }

  if (system) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: userMessage })

  return messages
}

/**
 * Parse SSE lines from a chunk of text.
 * Handles partial lines across chunks via the buffer parameter.
 */
export function parseSSELines(chunk: string, buffer: { partial: string }): string[] {
  const text = buffer.partial + chunk
  const lines = text.split('\n')
  // Last element may be incomplete
  buffer.partial = lines.pop() ?? ''
  return lines
}

/**
 * Extract content delta from an SSE data line.
 * Supports OpenAI-compatible format.
 */
export function extractDelta(dataLine: string): string {
  if (!dataLine.startsWith('data: ')) return ''
  const jsonStr = dataLine.slice(6).trim()
  if (jsonStr === '[DONE]') return ''
  try {
    const parsed = JSON.parse(jsonStr)
    return parsed.choices?.[0]?.delta?.content ?? ''
  } catch {
    return ''
  }
}

/**
 * Stream chat completion from an OpenAI-compatible API endpoint.
 * Yields content deltas as they arrive.
 */
export async function* streamChat(request: AiChatRequest): AsyncGenerator<string, void, undefined> {
  const { provider, messages } = request
  const baseUrl = provider.baseUrl.replace(/\/+$/, '')

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.modelId,
      messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${response.status}: ${errorText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()
  const buffer = { partial: '' }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = parseSSELines(chunk, buffer)

      for (const line of lines) {
        const delta = extractDelta(line)
        if (delta) {
          yield delta
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
