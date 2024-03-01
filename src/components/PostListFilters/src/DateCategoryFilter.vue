<script lang="ts" setup>
import moment from 'moment'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DateCategoryFilterValue } from './types'

const { t } = useI18n()

interface Props {
  modelValue: DateCategoryFilterValue
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return { date: 'all', category: 'all' }
  },
})

const emit = defineEmits<{
  'update:modelValue': [dateCategory: DateCategoryFilterValue]
  filter: []
}>()

const selectedMonth = computed({
  get: () => props.modelValue.date,
  set: (value: string) => {
    emit('update:modelValue', { date: value, category: props.modelValue.category })
  },
})

const selectedCat = computed({
  get: () => props.modelValue.category,
  set: (value: string) => {
    emit('update:modelValue', { date: props.modelValue.date, category: value })
  },
})
/**
 * Date filter data.
 */
const postMonths = ref<string[]>([])

async function fetchPostMonths() {
  postMonths.value = await window.site.getPostMonths()
}

watchEffect(() => {
  fetchPostMonths()
})

const updatedMonths = computed(() => {
  const months = postMonths.value.map((month) => {
    return {
      label: moment(month).format(t('date.month')),
      value: month,
    }
  })
  months.unshift({ label: t('posts.allMonths'), value: 'all' })
  return months
})

/**
 * Category filter data.
 */
// fetch all categories from backend
let categories = ref<Category[]>([])

async function fetchCategories() {
  categories.value = await window.site.getCategories()
}

watchEffect(() => {
  fetchCategories()
})

// put all category entries into a map
const nodeMap = computed(() => {
  const map: { [id: string]: NodeData } = {}
  for (const entry of categories.value) {
    map[entry.id] = {
      id: entry.id,
      value: entry.id,
      parent: entry.parent,
      label: entry.name,
      children: [],
      length: entry.length,
      permalink: entry.permalink,
    }
  }
  return map
})

// build a tree to display category hierarchy
const treeData = computed(() => {
  let tree: NodeData[] = []

  for (const node of Object.values(nodeMap.value)) {
    if (node.parent) {
      const parent = nodeMap.value[node.parent]
      if (parent) {
        parent.children?.push(node)
      }
    } else {
      tree.push(node)
    }
  }
  tree.unshift({
    value: 'all',
    label: t('posts.allCategories'),
  })
  return tree
})
</script>
<template>
  <el-space>
    <el-select
      v-model="selectedMonth"
      size="small"
      :placeholder="t('posts.monthFilter')"
      :filterable="true"
      :clearable="true"
      style="width: 180px">
      <el-option
        v-for="item in updatedMonths"
        :key="item.value"
        :label="item.label"
        :value="item.value" />
    </el-select>
    <el-tree-select
      v-model="selectedCat"
      :data="treeData"
      :render-after-expand="false"
      size="small"
      :placeholder="t('posts.categorySearch')"
      :clearable="true"
      check-strictly
      style="width: 180px"
      :fit-input-width="false" />
    <el-button type="primary" size="small" plain @click="emit('filter')">{{
      t('posts.filter')
    }}</el-button>
  </el-space>
</template>
<style scoped></style>
