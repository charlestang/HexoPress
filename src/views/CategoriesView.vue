<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const categories = ref<null | Category[]>(null)
const catCount = ref(0)

async function fetch() {
  categories.value = await window.site.getCategories()
  catCount.value = categories.value.length
  console.log('Categories fetched from API, length: ', catCount.value)
}

fetch()

interface TreeEntry {
  id: string
  parent: string | undefined
  label: string
  length: number
  path: string
  permalink: string
  children?: TreeEntry[]
}

const data1 = ref<TreeEntry[]>([])
watch(categories, (newVal) => {
  const nodeMap: { [id: string]: TreeEntry } = {}

  for (const entry of newVal!) {
    nodeMap[entry.id] = {
      id: entry.id,
      parent: entry.parent,
      label: entry.name,
      length: entry.length,
      path: entry.path,
      permalink: entry.permalink,
      children: [],
    }
  }

  for (const node of Object.values(nodeMap)) {
    if (node.parent) {
      const parent = nodeMap[node.parent]
      if (parent) {
        parent.children?.push(node)
      }
    } else {
      data1.value.push(node)
    }
  }
})

function onClickLink(url: string) {
  window.site.openUrl(url)
}
</script>

<template>
  <h2>{{ t('common.categories') }} {{ t('cats.stats', { count: catCount }) }}</h2>
  <el-table
    :data="data1"
    style="width: 100%; margin-bottom: 20px"
    row-key="id"
    :border="false"
    :stripe="true"
    default-expand-all>
    <el-table-column prop="label" :label="t('cats.name')" sortable />
    <el-table-column prop="length" :label="t('cats.total')" sortable />
    <el-table-column :label="t('cats.actions')">
      <template #default="scope">
        <el-link type="primary" link @click="onClickLink(scope.row.permalink)">{{
          t('cats.view')
        }}</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>
