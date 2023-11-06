<script setup lang="ts">
import { normalizeList } from '@/components/CategoryList'
import type { Category } from '@/local.d.ts'
import { computed } from 'vue'

interface TreeNode {
  id: string
  parent: string | undefined
  label: string
  children?: TreeNode[]
  length: number
  permalink: string
}

export interface Props {
  modelValue?: string | string[] | (string | string[])[]
  categories?: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  categories: () => []
})

const emit = defineEmits(['update:modelValue'])

const nodeMap = computed(() => {
  const map: { [id: string]: TreeNode } = {}
  for (const entry of props.categories) {
    map[entry.id] = {
      id: entry.id,
      parent: entry.parent,
      label: entry.name,
      children: [],
      length: entry.length,
      permalink: entry.permalink
    }
  }
  return map
})

const treeData = computed(() => {
  let tree: TreeNode[] = []

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

  return tree
})

const normalizedCats = computed(() => {
  return normalizeList(props.modelValue)
})

const defaultChecked = computed(() => {
  const defaultCheckedKeys: string[] = []
  if (normalizedCats.value.length == 0) {
    return []
  }

  for (const cat of normalizedCats.value) {
    for (const catName of cat) {
      for (const node of Object.values(nodeMap.value)) {
        if (node.label == catName) {
          defaultCheckedKeys.push(node.id)
        }
      }
    }
  }

  return defaultCheckedKeys
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

function onNodeClick(node: TreeNode, treeNodeProp: any, treeNode: any, event: PointerEvent) {
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
function onCheckChange(node: TreeNode, selfChecked: boolean, childrenChecked: boolean) {
  console.log(
    'onCheckChange, node: ',
    node,
    '\n self-checked: ',
    selfChecked,
    '\n children-checked: ',
    childrenChecked
  )
}
function onCheck(node: TreeNode, selectedNodes: any) {
  console.log('onCheck, node: ', node, '\n selectedNodes: ', selectedNodes)
}
</script>
<template>
  <el-tree
    :data="treeData"
    :props="defaultProps"
    node-key="id"
    show-checkbox
    :checkStrictly="true"
    :defaultCheckedKeys="defaultChecked"
    @nodeClick="onNodeClick"
    @checkChange="onCheckChange"
    @check="onCheck"
  />
  {{ props.modelValue }}
</template>

<style scoped></style>
