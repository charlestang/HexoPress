<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useCategoryTree } from '@/composables/useCategoryTree'

const { t } = useI18n()
const router = useRouter()

const categories = ref<Category[]>([])
const catCount = ref(0)

async function fetch() {
  categories.value = await window.site.getCategories()
  catCount.value = categories.value.length
  console.log('Categories fetched from API, length: ', catCount.value)
}

fetch()

// Use useCategoryTree composition function
const { treeData } = useCategoryTree(categories)


function onClickCategory(categoryId: string) {
  router.push({
    name: 'category-detail',
    params: {
      categoryId
    }
  })
}
</script>

<template>
  <h2>{{ t('common.categories') }} {{ t('cats.stats', { count: catCount }) }}</h2>
  <el-table
    :data="treeData"
    style="width: 100%; margin-bottom: 20px"
    row-key="id"
    :border="false"
    :stripe="true"
    default-expand-all>
    <el-table-column prop="label" :label="t('cats.name')" sortable />
    <el-table-column prop="length" :label="t('cats.total')" sortable />
    <el-table-column :label="t('cats.actions')">
      <template #default="scope">
        <el-link type="primary" link @click="onClickCategory(scope.row.id)">{{ t('cats.view') }}</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>
