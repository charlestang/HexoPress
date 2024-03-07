<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
export interface Props {
  modelValue: string | string[] | (string | string[])[]
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})
const emit = defineEmits(['update:modelValue'])

// fetch all categories from backend
const categories = ref<Category[]>([])
async function fetch() {
  categories.value = await window.site.getCategories()
}
fetch()

const selectedCategories = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const showAddNewCategoryPop = ref(false)
const newCategoryForm = ref({
  name: '',
  parent: '',
})

function _hashCode(s: string) {
  let hash = 0
  if (s.length == 0) {
    return hash
  }
  for (let i = 0; i < s.length; i++) {
    let char = s.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}
function onClickAddCategory() {
  console.log(
    'add new category, name: ',
    newCategoryForm.value.name,
    ' and parent id: ',
    newCategoryForm.value.parent,
  )
  console.log('categories length: ', categories.value.length)
  const newCategory: Category = {
    id: 'new-category-' + _hashCode(newCategoryForm.value.name),
    name: newCategoryForm.value.name,
    parent: newCategoryForm.value.parent,
    slug: '',
    path: '',
    permalink: '',
    length: 0,
  }
  categories.value.push(newCategory)
  console.log('after add, categories length: ', categories.value.length)
  showAddNewCategoryPop.value = false
  newCategoryForm.value = {
    name: '',
    parent: '',
  }
}
</script>
<template>
  <div class="container">
    <el-scrollbar>
      <categories-tree v-model="selectedCategories" :categories="categories" />
    </el-scrollbar>
    <el-popover
      :visible="showAddNewCategoryPop"
      :show-arrow="false"
      width="250"
      trigger="click"
      placement="bottom">
      <template #reference>
        <el-link type="warning" @click="showAddNewCategoryPop = true">{{
          t('editor.createNewCategory')
        }}</el-link>
      </template>
      <meta-entry-title @close="showAddNewCategoryPop = false">{{
        t('editor.createCategory')
      }}</meta-entry-title>
      <el-form :model="newCategoryForm" label-position="top">
        <el-form-item :label="t('editor.categoryName')">
          <el-input v-model="newCategoryForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="t('editor.parentCategory')">
          <el-select v-model="newCategoryForm.parent" placeholder="请选择">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="onClickAddCategory">{{ t('editor.add') }}</el-button>
      </el-form>
    </el-popover>
  </div>
</template>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 275px;
}

.el-scrollbar {
  flex: 1;
  overflow-y: auto;
}

.el-link {
  justify-content: flex-start;
}
</style>
