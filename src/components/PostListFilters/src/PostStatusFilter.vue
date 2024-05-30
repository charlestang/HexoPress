<script lang="ts" setup>
import { useStatsStore } from '@/stores/stats'
import { storeToRefs } from 'pinia'
import { onMounted, onUpdated } from 'vue'
import { useI18n } from 'vue-i18n'
import { PostStatusFilterChoice } from './types'

const { t } = useI18n()
export interface Props {
  modelValue: PostStatusFilterChoice
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => PostStatusFilterChoice.All,
})
const filterItems = {
  [PostStatusFilterChoice.All]: t('posts.all'),
  [PostStatusFilterChoice.Published]: t('posts.published'),
  [PostStatusFilterChoice.Draft]: t('posts.draft'),
}
const emit = defineEmits<{
  'update:modelValue': [status: PostStatusFilterChoice]
}>()

const store = useStatsStore()
const { postTotal, draftTotal, publishedTotal } = storeToRefs(store)
const { updateStats } = store

onMounted(() => {
  updateStats()
})
onUpdated(() => {
  updateStats()
})

function isActive(value: PostStatusFilterChoice): boolean {
  return value === props.modelValue
}
</script>
<template>
  <ul class="status-filter">
    <li
      v-for="(v, k) in filterItems"
      :key="k"
      class="status-filter-item"
      @click="emit('update:modelValue', k)">
      <a :class="{ active: isActive(k) }">{{ v }}</a>
      <el-text v-if="k == PostStatusFilterChoice.All" type="info"> ( {{ postTotal }} ) </el-text>
      <el-text v-if="k == PostStatusFilterChoice.Published" type="info">
        ( {{ publishedTotal }} )
      </el-text>
      <el-text v-if="k == PostStatusFilterChoice.Draft" type="info"> ( {{ draftTotal }} ) </el-text>
      <span v-if="k != PostStatusFilterChoice.Draft" style="color:#ccc"> | </span>
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
