<script setup lang="ts">
import { normalizeList } from '@/components/CategoryList'
import type { Category } from '@/local.d.ts'
import { ref, computed } from 'vue'
import { ElTree } from 'element-plus'

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

// put all category entries into a map
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

// build a tree to display category hierarchy
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

// normalize selected categories
const normalizedCats = computed(() => {
  return normalizeList(props.modelValue)
})

function computeCheckedKeys(catsArr: string[][]) {
  const checkedKeys: string[] = []
  if (catsArr.length == 0) {
    return []
  }
  for (const cat of catsArr) {
    for (const catName of cat) {
      for (const node of Object.values(nodeMap.value)) {
        if (node.label == catName) {
          if (checkedKeys.includes(node.id)) {
            continue
          }
          checkedKeys.push(node.id)
        }
      }
    }
  }
  return checkedKeys
}

const defaultChecked = computed(() => computeCheckedKeys(normalizedCats.value))

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
  function catLink(n: TreeNode) {
    // calculate the category link
    const l = [n.label]
    let p = n
    while (p.parent) {
      p = nodeMap.value[p.parent]
      l.unshift(p.label)
    }
    return l
  }
  function startsWith(array: any[], prefix: any[]): boolean {
    if (prefix.length > array.length) {
      return false
    }
    for (let i = 0; i < prefix.length; i++) {
      if (array[i] !== prefix[i]) {
        return false
      }
    }
    return true
  }
  if (selectedNodes.checkedNodes.includes(node)) {
    // check new node of category tree
    const newCat = catLink(node)
    emit('update:modelValue', [...normalizedCats.value, newCat])
  } else {
    const uncheckedCat = catLink(node)
    const newCheckedCats = normalizedCats.value.filter((arr) => !startsWith(arr, uncheckedCat))
    treeRef.value!.setCheckedKeys(computeCheckedKeys(newCheckedCats))
    emit('update:modelValue', newCheckedCats)
  }
}
const treeRef = ref<InstanceType<typeof ElTree>>()
</script>
<template>
  <el-tree
    ref="treeRef"
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
</template>

<style scoped></style>
