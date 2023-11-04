<script lang="ts" setup>
import { ref } from 'vue'

export interface Props {
  modelValue?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const emit = defineEmits(['update:modelValue'])

console.log('transimoprt arguments is: ', props.modelValue)
let tagsInputActive = ref('')
let tagInputing = ref('')
let tagsList = ref<string[]>([])
if (props.modelValue.length > 0) {
  tagsList.value = props.modelValue
  console.log('tagsList is: ', tagsList.value)
}

function onTagInputingChange(tagName: string): void {
  tagsList.value.push(tagName)
  tagInputing.value = ''
  emit('update:modelValue', tagsList.value)
}

function onTagClose(tag: string): void {
  tagsList.value = tagsList.value.filter((item) => item !== tag)
  emit('update:modelValue', tagsList.value)
}

function onTagInputingDel(event: KeyboardEvent) {
  if (event.type == 'keydown' && event.key == 'Backspace' && tagInputing.value === '') {
    tagsList.value.pop()
    emit('update:modelValue', tagsList.value)
  }
}

function onTagInputingChar(tag: string) {
  if (tag.endsWith(',')) {
    onTagInputingChange(tag.slice(0, -1))
  }
}
</script>
<template>
  <div class="tags-area" :class="tagsInputActive">
    <div class="tags-field">
      <el-tag v-for="tag in tagsList" :key="tag" closable @close="onTagClose(tag)">
        {{ tag }}
      </el-tag>
      <el-input
        v-model="tagInputing"
        type="text"
        autocomplete="off"
        class="tags-input"
        @focus="tagsInputActive = 'is-active'"
        @blur="tagsInputActive = ''"
        @change="onTagInputingChange"
        @input="onTagInputingChar"
        @keydown.delete="onTagInputingDel"
      />
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
