<script lang="ts" setup>
import { PostStatusFilterChoice } from './types'
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
export interface Props {
  modelValue: PostStatusFilterChoice
  active: boolean
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => PostStatusFilterChoice.All,
  active: () => true,
})
const filterItems = {
  [PostStatusFilterChoice.All]: t('posts.all'),
  [PostStatusFilterChoice.Published]: t('posts.published'),
  [PostStatusFilterChoice.Draft]: t('posts.draft'),
}
const emit = defineEmits(['update:modelValue'])

const allCount = ref<null | number>(null)
const postCount = ref<null | number>(null)
const draftCount = ref<null | number>(null)
async function fetchStats() {
  let data = await window.site.getStats()
  allCount.value = data.postCount + data.postDraftCount
  postCount.value = data.postCount
  draftCount.value = data.postDraftCount
}
fetchStats()
</script>
<template>
  <ul>
    <li
      v-for="(label, value) in filterItems"
      :key="label"
      :class="{ active: value === props.modelValue && props.active }"
      @click="emit('update:modelValue', label)">
      {{ label }}
    </li>
  </ul>
</template>
<style scoped></style>
