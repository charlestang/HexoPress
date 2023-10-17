<template>
  <el-tree :data="data1" :props="defaultProps" @node-click="handleNodeClick" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { Category } from '@/local.d.ts'

let categories = ref<null | Category[]>(null)

async function fetch () {
  categories.value = await window.site.getCategories()
}

fetch()

interface Tree {
   id: string
   parent: string | undefined
  label: string
  children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
  console.log(data)
}

let data1 = ref<Tree[]>([])
watch(categories, (newVal) => {
  const nodeMap: {[id: string]: Tree} = {}

  for (const entry of newVal!) {
    console.log(entry.name)
    console.log(entry.id)
    console.log(entry.parent)
    nodeMap[entry.id] = {
      id: entry.id,
      parent: entry.parent,
      label: entry.name,
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

const defaultProps = {
  children: 'children',
  label: 'label'
}
</script>
