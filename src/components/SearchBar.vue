<script lang="ts" setup>
import { ArrowDown, ArrowUp, Search } from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    total: number
    currentIndex: number
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'navigate', direction: 'prev' | 'next'): void
}>()

const displayIndex = computed(() => {
  if (!props.total || props.currentIndex < 1) {
    return '0 / 0'
  }
  return `${props.currentIndex} / ${props.total}`
})

function handleInput(value: string) {
  emit('update:modelValue', value)
}

function handleNavigate(direction: 'prev' | 'next') {
  if (props.total === 0 || props.disabled) {
    return
  }
  emit('navigate', direction)
}
</script>

<template>
  <div class="search-bar">
    <el-input
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      size="small"
      clearable
      class="search-bar__input"
      @update:model-value="handleInput">
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <span class="search-bar__stats">{{ displayIndex }}</span>
    <div class="search-bar__actions">
      <el-button
        text
        :disabled="disabled || total === 0"
        class="search-bar__nav"
        @click="handleNavigate('prev')">
        <el-icon><ArrowUp /></el-icon>
      </el-button>
      <el-button
        text
        :disabled="disabled || total === 0"
        class="search-bar__nav"
        @click="handleNavigate('next')">
        <el-icon><ArrowDown /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 4px;
}
.search-bar__input {
  flex: 1;
}
.search-bar__stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 56px;
  text-align: right;
}
.search-bar__actions {
  display: flex;
  gap: 2px;
}
.search-bar__nav {
  padding: 0 4px;
}
</style>
