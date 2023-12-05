<script lang="ts" setup>
import type { Category } from '@/local.d.ts';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

let categories = ref<null | Category[]>(null)

async function fetch() {
  categories.value = await window.site.getCategories()
  console.log(categories.value)
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

let data1 = ref<TreeEntry[]>([])
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
      children: []
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
</script>

<template>
  <h2>{{ t('common.categories') }}</h2>
  <el-table
    :data="data1"
    style="width: 100%; margin-bottom: 20px"
    row-key="id"
    :border="false"
    :stripe="true"
    default-expand-all
  >
    <el-table-column prop="label" label="Name" sortable />
    <el-table-column prop="length" label="Total" sortable />
    <el-table-column label="Operation">
      <template #default="scope">
        <el-link type="primary" link :href="scope.row.permalink">{{ 'View' }}</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>
