<script setup lang="ts">
import { computed } from 'vue'
export interface TextPart {
  text: string
  isKeyword: boolean
}

const props = withDefaults(
  defineProps<{
    text: string
    keywords: string
  }>(),
  {
    keywords: () => '',
  },
)

const keywords = computed(() => {
  const kw = props.keywords.trim()
  if (kw.length > 0) {
    return [kw]
  }
  return []
})

const parts = computed((): TextPart[] => {
  if (keywords.value.length === 0) {
    return [{ text: props.text, isKeyword: false }]
  }

  const keywordToHighlight = keywords.value[0] ?? ''
  const textToSearch = props.text
  const resultingParts: TextPart[] = []
  let currentIndex = 0
  let matchIndex

  if (keywordToHighlight.length === 0) {
      return [{ text: textToSearch, isKeyword: false }];
  }

  while ((matchIndex = textToSearch.indexOf(keywordToHighlight, currentIndex)) !== -1) {
    if (matchIndex > currentIndex) {
      resultingParts.push({ text: textToSearch.substring(currentIndex, matchIndex), isKeyword: false })
    }
    resultingParts.push({ text: keywordToHighlight, isKeyword: true })
    currentIndex = matchIndex + keywordToHighlight.length
  }

  if (currentIndex < textToSearch.length) {
    resultingParts.push({ text: textToSearch.substring(currentIndex), isKeyword: false })
  }

  return resultingParts.length > 0 ? resultingParts : [{ text: textToSearch, isKeyword: false }]
})
</script>
<template>
  <template v-for="(part, index) in parts">
    <mark
      v-if="part.isKeyword"
      :key="index"
      class="inline align-baseline text-ellipsis whitespace-nowrap overflow-hidden max-w-full bg-yellow-400 text-black"
    >
      {{ part.text }}
    </mark>
    <span
      v-else
      :key="-index"
      class="inline align-baseline text-ellipsis whitespace-nowrap overflow-hidden max-w-full"
      >{{ part.text }}</span
    >
  </template>
</template>
