<script lang="ts" setup>
import { ref } from 'vue'

export interface Props {
  modelValue?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})

const emit = defineEmits(['update:modelValue'])

let tagsInputActive = ref('')
let tagInputting = ref('')

function onTagInputtingChange(tagName: string): void {
  tagInputting.value = ''
  emit('update:modelValue', props.modelValue.concat(tagName))
}

function onTagClose(tag: string): void {
  emit(
    'update:modelValue',
    props.modelValue.filter(item => item !== tag),
  )
}

function onTagInputtingDel(evt: KeyboardEvent | Event) {
  const event = evt as KeyboardEvent
  if (event.type == 'keydown' && event.key == 'Backspace' && tagInputting.value === '') {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  }
}

function onTagInputtingChar(tag: string) {
  if (tag.endsWith(',')) {
    onTagInputtingChange(tag.slice(0, -1))
  }
}
</script>
<template>
  <div class="tags-area" :class="tagsInputActive">
    <div class="tags-field">
      <el-tag v-for="tag in modelValue" :key="tag" closable @close="onTagClose(tag)">
        {{ tag }}
      </el-tag>
      <el-input
        v-model="tagInputting"
        type="text"
        autocomplete="off"
        class="tags-input"
        @focus="tagsInputActive = 'is-active'"
        @blur="tagsInputActive = ''"
        @change="onTagInputtingChange"
        @input="onTagInputtingChar"
        @keydown.delete="onTagInputtingDel" />
    </div>
  </div>
</template>
<style scoped>
.tags-area {
  border: 1px solid #dcdfe6;
  border-radius: 2px;
}
.tags-area.is-active {
  border: 2px solid #dd823b;
  outline: 2px solid transparent;
}
.tags-field {
  display: flex;
  -webkit-box-align: center;
  padding: 4px 7px;
  flex-flow: wrap;
  justify-content: flex-start;
  gap: 4px;
}
.tags-input {
  border: 0;
  box-shadow: none;
  color: #1e1e1e;
  flex: 1;
  font-size: 14px;
}
.tags-input:deep(.el-input__inner) {
  height: 24px;
  line-height: 24px;
}
.tags-input:deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 1px 4px;
}
.tags-input:focus {
  box-shadow: none;
  outline: none;
}
</style>
