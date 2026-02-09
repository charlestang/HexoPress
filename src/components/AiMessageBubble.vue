<script lang="ts" setup>
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps<{
  message: AiMessage
}>()

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

const renderedContent = computed(() => {
  if (props.message.role === 'assistant') {
    return md.render(props.message.content)
  }
  return ''
})

const isUser = computed(() => props.message.role === 'user')
</script>
<template>
  <div class="ai-bubble" :class="{ 'ai-bubble--user': isUser, 'ai-bubble--assistant': !isUser }">
    <div v-if="isUser" class="ai-bubble__content ai-bubble__content--user">
      <div v-if="message.presetLabel" class="ai-bubble__preset-label">
        {{ message.presetLabel }}
      </div>
      <div v-else class="ai-bubble__text">{{ message.content }}</div>
      <div v-if="message.contextLabel" class="ai-bubble__context">
        {{ message.contextLabel }}
      </div>
    </div>
    <div v-else class="ai-bubble__content ai-bubble__content--assistant">
      <div class="ai-bubble__markdown" v-html="renderedContent"></div>
    </div>
  </div>
</template>
<style scoped>
.ai-bubble {
  margin-bottom: 12px;
  display: flex;
}
.ai-bubble--user {
  justify-content: flex-end;
}
.ai-bubble--assistant {
  justify-content: flex-start;
}
.ai-bubble__content {
  max-width: 90%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}
.ai-bubble__content--user {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
}
.ai-bubble__content--assistant {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}
.ai-bubble__context {
  margin-top: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.ai-bubble__preset-label {
  font-weight: 500;
  font-size: 13px;
}
.ai-bubble__markdown :deep(p) {
  margin: 0 0 8px 0;
}
.ai-bubble__markdown :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-bubble__markdown :deep(pre) {
  background: var(--el-fill-color);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
.ai-bubble__markdown :deep(code) {
  font-size: 12px;
}
.ai-bubble__markdown :deep(ul),
.ai-bubble__markdown :deep(ol) {
  padding-left: 20px;
  margin: 4px 0;
}
</style>
