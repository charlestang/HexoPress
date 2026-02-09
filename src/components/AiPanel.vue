<script lang="ts" setup>
import { useEditorStore } from '@/stores/editorStore'
import { buildMessages, streamChat, type ContextMode } from '@/services/aiService'
import { computed, nextTick, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import AiInputBar from './AiInputBar.vue'
import AiMessageBubble from './AiMessageBubble.vue'

const { t } = useI18n()
const editorStore = useEditorStore()

const messages = reactive<AiMessage[]>([])
const isStreaming = ref(false)
const contextDismissed = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const inputBarRef = ref<InstanceType<typeof AiInputBar> | null>(null)
const activePreset = ref<AiPreset | null>(null)

// Input area resize
const inputAreaHeight = ref(120)
let resizeStartY = 0
let resizeStartHeight = 0

function onResizeMove(e: MouseEvent) {
  const delta = resizeStartY - e.clientY
  inputAreaHeight.value = Math.max(80, Math.min(400, resizeStartHeight + delta))
}

function onResizeEnd() {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

function startResize(e: MouseEvent) {
  resizeStartY = e.clientY
  resizeStartHeight = inputAreaHeight.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})

const hasSelection = computed(() => !!editorStore.selectedText)

const contextMode = computed<ContextMode>(() => {
  if (contextDismissed.value) return 'none'
  if (hasSelection.value) return 'selection'
  return 'full'
})

const contextLabel = computed(() => {
  if (contextMode.value === 'none') return t('ai.contextNone')
  if (contextMode.value === 'selection' && editorStore.selectionRange) {
    const { from, to } = editorStore.selectionRange
    const len = editorStore.selectedText.length
    return `@selection(${from}-${to}) ${len}${t('ai.chars')}`
  }
  const len = editorStore.text.length
  return `@full (${len}${t('ai.chars')})`
})

function dismissContext() {
  contextDismissed.value = true
}

function resetContext() {
  contextDismissed.value = false
}

const presets: AiPreset[] = [
  {
    id: 'typo-check',
    name: 'ai.presetTypoCheck',
    icon: '📝',
    systemPrompt:
      '你是一位精通写作的文学家，同时也是一位吹毛求疵的语文老师。请根据用户的要求，对提供的文章进行严格审阅。',
    userPrompt: `## 任务
请像批改作文一样仔细审阅文章，找出所有的：
- 错别字和拼写错误
- 语法错误和语病
- 标点符号使用不当
- 表达不清晰或逻辑混乱的地方

## 输出格式
请以列表形式逐条输出，每一项包含：
- **问题类型**：错别字 / 语病 / 标点 / 表达
- **原文引用**：标注问题出现的上下文
- **问题说明**：解释为什么这里有问题
- **修改建议**：给出具体的修改方案

请使用与文章相同的语言回复。如果没有发现任何问题，请明确说明。`,
    contextMode: 'full',
  },
  {
    id: 'writing-suggestion',
    name: 'ai.presetWritingSuggestion',
    icon: '✨',
    systemPrompt:
      '你是一位资深的写作教练和内容策略师。请根据用户的要求，从多个维度分析文章并给出改进建议。',
    userPrompt: `## 任务
请从以下维度分析文章，并给出具体、可操作的改进建议：
- **结构**：文章的组织是否合理，段落之间的过渡是否自然
- **逻辑**：论述是否连贯，论据是否充分
- **表达**：用词是否准确，句式是否多样
- **可读性**：是否易于理解，是否有冗余内容

## 输出格式
请按维度分类列出建议，每条建议需要：
- 指出具体的问题位置或段落
- 解释为什么需要改进
- 给出具体的改进方向或示例

请使用与文章相同的语言回复。`,
    contextMode: 'full',
  },
  {
    id: 'polish',
    name: 'ai.presetPolish',
    icon: '🔄',
    systemPrompt:
      '你是一位文笔优美的编辑，擅长在保持原意的前提下提升文字的表达质量。请根据用户的要求润色提供的文本。',
    userPrompt: `## 任务
请润色选中的文本，要求：
- 保持原文的核心含义和语气不变
- 提升文字的流畅度和表达力
- 修正任何语法或用词问题
- 使表达更加精炼、专业

## 输出格式
请直接输出润色后的文本。如果做了重大修改，请在润色文本之后简要说明修改理由。

请使用与原文相同的语言回复。`,
    contextMode: 'selection',
  },
  {
    id: 'summary',
    name: 'ai.presetSummary',
    icon: '📋',
    systemPrompt: '你是一位善于提炼要点的内容编辑。请根据用户的要求为文章生成摘要。',
    userPrompt: `## 任务
请为文章生成一段简洁的摘要，适合用作：
- 文章的 description / excerpt
- SEO meta description
- 社交媒体分享时的预览文本

## 要求
- 长度控制在 2-3 句话（80-160 字）
- 准确概括文章的核心内容和价值
- 语言简洁有力，能吸引读者点击阅读

## 输出格式
请直接输出摘要文本，不需要额外标注或解释。

请使用与文章相同的语言回复。`,
    contextMode: 'full',
  },
]

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function sendToAi(
  userMessage: string,
  provider: AiProvider,
  systemPrompt?: string,
  ctxMode?: ContextMode,
  presetLabel?: string,
) {
  const effectiveCtxMode = ctxMode ?? contextMode.value
  const label =
    effectiveCtxMode === 'full'
      ? `@full`
      : effectiveCtxMode === 'selection' && editorStore.selectionRange
        ? `@selection(${editorStore.selectionRange.from}-${editorStore.selectionRange.to})`
        : undefined

  messages.push({ role: 'user', content: userMessage, contextLabel: label, presetLabel })
  scrollToBottom()

  const aiMsg: AiMessage = reactive({ role: 'assistant', content: '' })
  messages.push(aiMsg)
  isStreaming.value = true

  try {
    const builtMessages = buildMessages({
      userMessage,
      systemPrompt,
      contextMode: effectiveCtxMode,
      fullText: editorStore.text,
      selectedText: editorStore.selectedText,
      frontMatter: editorStore.frontMatter,
    })

    const stream = streamChat({
      provider,
      messages: builtMessages,
    })

    for await (const delta of stream) {
      aiMsg.content += delta
      scrollToBottom()
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    aiMsg.content = t('ai.requestFailed', { message: errMsg })
  } finally {
    isStreaming.value = false
    scrollToBottom()
  }
}

function handleSend(payload: { message: string; provider: AiProvider }) {
  const preset = activePreset.value
  if (preset) {
    const ctxMode = preset.contextMode as ContextMode
    const label = `${preset.icon} ${t(preset.name)}`
    sendToAi(payload.message, payload.provider, preset.systemPrompt, ctxMode, label)
    activePreset.value = null
  } else {
    sendToAi(payload.message, payload.provider)
  }
}

function handlePreset(preset: AiPreset) {
  if (preset.contextMode === 'selection' && !editorStore.selectedText) {
    ElMessage.warning(t('ai.selectTextFirst'))
    return
  }
  activePreset.value = preset
  inputBarRef.value?.setInput(preset.userPrompt)
}

// Expose reset for parent to call on article switch
function resetChat() {
  messages.splice(0, messages.length)
  resetContext()
  activePreset.value = null
}

defineExpose({ resetChat })

// Watch for article changes via source text reset
watch(
  () => editorStore.text,
  (_newVal, oldVal) => {
    if (oldVal === '' && _newVal !== '') {
      // Initial load, don't reset
      return
    }
  },
)
</script>
<template>
  <div class="ai-panel">
    <div class="ai-panel__presets">
      <el-button
        v-for="preset in presets"
        :key="preset.id"
        size="small"
        :disabled="isStreaming"
        @click="handlePreset(preset)">
        {{ preset.icon }} {{ t(preset.name) }}
      </el-button>
    </div>

    <div ref="messagesContainer" class="ai-panel__messages">
      <div v-if="messages.length === 0" class="ai-panel__empty">
        {{ t('ai.panelTitle') }}
      </div>
      <AiMessageBubble v-for="(msg, idx) in messages" :key="idx" :message="msg" />
      <div v-if="isStreaming" class="ai-panel__streaming">
        {{ t('ai.streaming') }}
      </div>
    </div>

    <div class="ai-panel__context-bar">
      <span class="ai-panel__context-label">{{ contextLabel }}</span>
      <el-icon
        v-if="contextMode !== 'none'"
        class="ai-panel__context-dismiss"
        size="14"
        @click="dismissContext">
        <CircleCloseFilled />
      </el-icon>
      <el-link
        v-if="contextMode === 'none'"
        type="primary"
        :underline="false"
        size="small"
        @click="resetContext">
        {{ t('ai.contextFull') }}
      </el-link>
    </div>

    <div class="ai-panel__resize-handle" @mousedown="startResize"></div>

    <div class="ai-panel__input-area" :style="{ height: inputAreaHeight + 'px' }">
      <AiInputBar ref="inputBarRef" :disabled="isStreaming" @send="handleSend" />
    </div>
  </div>
</template>
<style scoped>
.ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.ai-panel__presets {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ai-panel__presets .el-button {
  font-size: 12px;
}
.ai-panel__messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.ai-panel__empty {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  padding-top: 40px;
}
.ai-panel__streaming {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  padding: 4px 0;
}
.ai-panel__context-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-lighter);
}
.ai-panel__context-dismiss {
  cursor: pointer;
  color: var(--el-text-color-secondary);
}
.ai-panel__context-dismiss:hover {
  color: var(--el-text-color-primary);
}
.ai-panel__resize-handle {
  height: 4px;
  cursor: ns-resize;
  background: transparent;
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-lighter);
}
.ai-panel__resize-handle:hover {
  background: var(--el-color-primary-light-7);
}
.ai-panel__input-area {
  flex-shrink: 0;
  overflow: hidden;
}
</style>
