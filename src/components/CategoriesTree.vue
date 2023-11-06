<script setup lang="ts">
import type { Category } from '@/local.d.ts'
import { computed } from 'vue'

interface Tree {
  id: string
  parent: string | undefined
  label: string
  children?: Tree[]
  length: number
  permalink: string
}

export interface Props {
  modelValue?: string[] | string[][]
  categories?: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  categories: () => []
})

const emit = defineEmits(['update:modelValue'])

const treeData = computed(() => {
  const nodeMap: { [id: string]: Tree } = {}
  let tree: Tree[] = []

  for (const entry of props.categories) {
    nodeMap[entry.id] = {
      id: entry.id,
      parent: entry.parent,
      label: entry.name,
      children: [],
      length: entry.length,
      permalink: entry.permalink
    }
  }

  for (const node of Object.values(nodeMap)) {
    if (node.parent) {
      const parent = nodeMap[node.parent]
      if (parent) {
        parent.children?.push(node)
      }
    } else {
      tree.push(node)
    }
  }

  return tree
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

function onNodeClick(node: Tree, treeNodeProp: any, treeNode: any, event: PointerEvent) {
  console.log(
    'onNodeClick, node: ',
    node,
    '\n treeNodeProp: ',
    treeNodeProp,
    '\n treeNode: ',
    treeNode,
    '\n event: ',
    event
  )
}
function onCheckChange(node: Tree, selfChecked: boolean, childrenChecked: boolean) {
  console.log(
    'onCheckChange, node: ',
    node,
    '\n self-checked: ',
    selfChecked,
    '\n children-checked: ',
    childrenChecked
  )
}
function onCheck(node: Tree, selectedNodes: any) {
  console.log('onCheck, node: ', node, '\n selectedNodes: ', selectedNodes)
}
</script>
<template>
  <el-tree
    :data="treeData"
    :props="defaultProps"
    node-key="id"
    show-checkbox
    @nodeClick="onNodeClick"
    @checkChange="onCheckChange"
    @check="onCheck"
  />
</template>

<style scoped></style>
