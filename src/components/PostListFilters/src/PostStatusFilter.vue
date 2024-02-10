<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PostStatusFilterChoice } from './types'
import { parse } from 'path'

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
const emit = defineEmits<{
  'update:modelValue': [status: PostStatusFilterChoice]
}>()

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
function isActive(value: PostStatusFilterChoice): boolean {
  return value === props.modelValue && props.active
}
</script>
<template>
  <ul class="status-filter">
    <li
      class="status-filter-item"
      v-for="(v, k) in filterItems"
      :key="k"
      @click="emit('update:modelValue', k)">
      <a :class="{ active: isActive(k) }">{{ v }}</a>
      <el-text v-if="k == PostStatusFilterChoice.All" type="info"> ( {{ allCount }} ) </el-text>
      <el-text v-if="k == PostStatusFilterChoice.Published" type="info">
        ( {{ postCount }} )
      </el-text>
      <el-text v-if="k == PostStatusFilterChoice.Draft" type="info"> ( {{ draftCount }} ) </el-text>
      <span v-if="k != PostStatusFilterChoice.Draft"> |</span>
    </li>
  </ul>
</template>
<style scoped>
ul.status-filter {
  list-style-type: none;
  padding: 0;
  display: flex;
  color: #646970;
}
li.status-filter-item {
  margin: 0;
  padding: 0;
  margin-right: 8px;
  display: inline-block;
}
li.status-filter-item a {
  line-height: 2;
  padding: 0.2em;
  text-decoration: none;
  color: var(--el-color-primary);
}
li.status-filter-item a.active {
  color: black;
  font-weight: 600;
}
</style>
