<script lang="ts" setup>
import moment from 'moment'
import { computed, ref, onMounted} from 'vue'
import { useI18n } from 'vue-i18n'
import type { DateCategoryFilterValue } from './types'
import { useCategoryTree } from '@/composables/useCategoryTree'

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
const postMonths = ref<{ label: string; value: string }[]>([])

async function fetchPostMonths() {
  const months = await window.site.getPostMonths()
  postMonths.value = [
    { label: t('posts.allMonths'), value: 'all' },
    ...months.map((month: string) => ({
      label: moment(month).format(t('date.month')),
      value: month,
    })),
  ]
}

/**
 * Category filter data.
 */
// fetch all categories from backend
const categories = ref<Category[]>([])

async function fetchCategories() {
  categories.value = await window.site.getCategories()
}

onMounted(() => {
  fetchPostMonths()
  fetchCategories()
})

// Use useCategoryTree composition function
const { treeData } = useCategoryTree(categories)

// Create a new computed property to handle the 'all' option
const treeDataWithAllOption = computed(() => {
  const tree = [...treeData.value]
  tree.unshift({
    value: 'all',
    label: t('posts.allCategories'),
  })
  return tree
})

function onMonthClear() {
  selectedMonth.value = 'all'
  emit('filter')
}

function onCategoryClear() {
  selectedCat.value = 'all'
  emit('filter')
}
</script>
<template>
  <el-space>
    <el-select
      v-model="selectedMonth"
      size="small"
      :placeholder="t('posts.monthFilter')"
      :filterable="true"
      :clearable="true"
      style="width: 180px"
      @clear="onMonthClear">
      <el-option
        v-for="item in postMonths"
        :key="item.value"
        :label="item.label"
        :value="item.value" />
    </el-select>
    <el-tree-select
      v-model="selectedCat"
      :data="treeDataWithAllOption"
      :render-after-expand="false"
      size="small"
      :placeholder="t('posts.categorySearch')"
      :clearable="true"
      check-strictly
      style="width: 180px"
      :fit-input-width="false"
      @clear="onCategoryClear" />
    <el-button type="primary" size="small" plain @click="emit('filter')">{{
      t('posts.filter')
    }}</el-button>
  </el-space>
</template>
<style scoped></style>
