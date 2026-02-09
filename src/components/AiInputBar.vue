<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Promotion } from '@element-plus/icons-vue'

const { t } = useI18n()
const appStore = useAppStore()

const emit = defineEmits<{
  (event: 'send', payload: { message: string; provider: AiProvider }): void
}>()

const inputText = ref('')

const providers = computed(() => appStore.aiProviders)
const hasProviders = computed(() => providers.value.length > 0)

const selectedProviderId = computed({
  get: () => {
    const stored = appStore.defaultAiProviderId
    if (providers.value.find((p) => p.id === stored)) return stored
    return providers.value.length > 0 ? providers.value[0]!.id : ''
  },
  set: (val: string) => {
    appStore.setDefaultAiProviderId(val)
  },
})

const currentProvider = computed(() => {
  return providers.value.find((p) => p.id === selectedProviderId.value) ?? null
})

const currentModelId = computed(() => currentProvider.value?.modelId ?? '')

function handleSend() {
  const msg = inputText.value.trim()
  if (!msg || !currentProvider.value) return
  emit('send', {
    message: msg,
    provider: currentProvider.value,
  })
  inputText.value = ''
}

function handleKeydown(e: Event | KeyboardEvent) {
  if ('key' in e && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function setInput(text: string) {
  inputText.value = text
}

defineExpose({ currentProvider, setInput })
</script>
<template>
  <div class="ai-input-bar">
    <el-input
      v-model="inputText"
      type="textarea"
      :rows="2"
      :placeholder="hasProviders ? t('ai.inputPlaceholder') : t('ai.noProvider')"
      :disabled="!hasProviders"
      resize="none"
      @keydown="handleKeydown" />
    <div class="ai-input-bar__toolbar">
      <el-select
        v-model="selectedProviderId"
        :placeholder="t('ai.selectModel')"
        size="small"
        class="ai-input-bar__provider-select"
        :disabled="!hasProviders">
        <el-option v-for="p in providers" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
      <el-tag v-if="currentModelId" size="small" type="info" class="ai-input-bar__model-tag">
        {{ currentModelId }}
      </el-tag>
      <el-button
        type="primary"
        size="small"
        :icon="Promotion"
        :disabled="!hasProviders || !inputText.trim()"
        @click="handleSend">
        {{ t('ai.send') }}
      </el-button>
    </div>
  </div>
</template>
<style scoped>
.ai-input-bar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.ai-input-bar :deep(.el-textarea) {
  flex: 1;
}
.ai-input-bar :deep(.el-textarea__inner) {
  height: 100% !important;
  resize: none;
}
.ai-input-bar__toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.ai-input-bar__provider-select {
  width: 110px;
}
.ai-input-bar__model-tag {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
