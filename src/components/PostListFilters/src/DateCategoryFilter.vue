<script lang="ts" setup>
import moment from 'moment'
import { computed, ref, onMounted } from 'vue'
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
    emit('filter')
  },
})

const selectedCat = computed({
  get: () => props.modelValue.category,
  set: (value: string) => {
    emit('update:modelValue', { date: props.modelValue.date, category: value })
    emit('filter')
  },
})

const isLoadingMonths = ref(false)
const isLoadingCategories = ref(false)
/**
 * Date filter data.
 */
const postMonths = ref<{ label: string; value: string }[]>([])

async function fetchPostMonths() {
  isLoadingMonths.value = true
  try {
    const months = await window.site.getPostMonths()
    postMonths.value = [
      { label: t('posts.allMonths'), value: 'all' },
      ...months.map((month: string) => ({
        label: moment(month).format(t('date.month')),
        value: month,
      })),
    ]
  } catch (error) {
    console.error('Failed to fetch post months:', error)
    // 可选：向用户显示错误提示，或者设置 postMonths 为包含错误信息的状态
    postMonths.value = [{ label: t('common.errorLoadingData'), value: 'all' }]
  } finally {
    isLoadingMonths.value = false
  }
}

/**
 * Category filter data.
 */
// fetch all categories from backend
const categories = ref<Category[]>([])

async function fetchCategories() {
  isLoadingCategories.value = true
  try {
    categories.value = await window.site.getCategories()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    // 可选：向用户显示错误提示
    categories.value = []
  } finally {
    isLoadingCategories.value = false
  }
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
      :loading="isLoadingMonths"
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
      :loading="isLoadingCategories"
      @clear="onCategoryClear" />
    <el-button type="primary" size="small" plain @click="emit('filter')">{{
      t('posts.filter')
    }}</el-button>
  </el-space>
</template>
<style scoped></style>
