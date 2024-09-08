<script setup lang="ts">
import { computed } from 'vue'
export interface TextPart {
  text: string
  isKeyword: boolean
}

const props = withDefaults(
  defineProps<{
    text: string
    keywords: string[]
  }>(),
  {
    keywords: () => [],
  },
)

const keywords = computed(() => props.keywords.filter((keyword) => keyword.length > 0))

const parts = computed((): TextPart[] => {
  if (keywords.value.length === 0) {
    return [{ text: props.text, isKeyword: false }]
  }
  const parts = []
  let start = 0
  let index
  for (const keyword of keywords.value) {
    while ((index = props.text.indexOf(keyword, start)) !== -1) {
      if (index > start) {
        parts.push({ text: props.text.substring(start, index), isKeyword: false })
      }
      parts.push({ text: keyword, isKeyword: true })
      start = index + keyword.length
    }
    if (start < props.text.length) {
      parts.push({ text: props.text.substring(start), isKeyword: false })
    }
  }

  return parts
})
</script>
<template>
  <template v-for="(part, index) in parts">
    <mark v-if="part.isKeyword" :key="index" class="title title-kw">
      {{ part.text }}
    </mark>
    <span v-else :key="-index" class="title">{{ part.text }}</span>
  </template>
</template>
<style>
.title-kw {
  background-color: #ff0;
  color: #000; /* 确保文本颜色与背景形成对比 */
}
.title {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  display: inline-block;
}
</style>
