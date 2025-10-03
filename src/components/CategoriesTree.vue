<script setup lang="ts">
import type { ElTree } from 'element-plus'
import type { TreeData, TreeKey } from 'element-plus/es/components/tree/src/tree.type'
import { computed, ref, watch } from 'vue'
import { normalizeList } from '@/utils/stringArray'
import { useCategoryTree } from '@/composables/useCategoryTree'

interface Props {
  modelValue?: string | string[] | (string | string[])[]
  categories?: Category[]
  disabledIds?: string[] | Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  categories: () => [],
  disabledIds: () => [],
})

const emit = defineEmits(['update:modelValue'])

console.log('categories is: ', props.categories)
// Create a computed property that responds to changes in props.categories
const categoriesRef = computed(() => props.categories)
const disabledIdsRef = computed(() => props.disabledIds)

// Use the computed property as a parameter for useCategoryTree
const { nodeMap, treeData } = useCategoryTree(categoriesRef, { disabledIds: disabledIdsRef })

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
        if (node.label == catName && node.id) {
          if (!checkedKeys.includes(node.id)) {
            checkedKeys.push(node.id)
          }
        }
      }
    }
  }
  return checkedKeys
}


const defaultProps = {
  children: 'children',
  label: 'label',
}

const treeRef = ref<InstanceType<typeof ElTree>>()

// monitor the changes of categories, update the tree's checked state
watch(
  [() => props.categories, () => props.modelValue, () => props.disabledIds],
  () => {
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(computeCheckedKeys(normalizedCats.value))
    }
  },
  { deep: true }
)

type TreeSelectedState = {
  checkedNodes: TreeData
  checkedKeys: TreeKey[]
  halfCheckedNodes: TreeData
  halfCheckedKeys: TreeKey[]
}

function onCheck(node: NodeData, selectedNodes: TreeSelectedState) {
  console.log('onCheck, node: ', node, '\n selectedNodes: ', selectedNodes)
  function catLink(n: NodeData) {
    // calculate the category link
    const l = [n.label]
    let p = n
    while (p.parent) {
      const parentNode = nodeMap.value[p.parent]
      if (!parentNode) {
        break
      }
      p = parentNode
      l.unshift(p.label)
    }
    return l
  }
  function startsWith(array: string[], prefix: string[]): boolean {
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
</script>
<template>
  <el-tree
    ref="treeRef"
    :data="treeData"
    :props="defaultProps"
    node-key="id"
    show-checkbox
    :check-strictly="true"
    @check="onCheck" />
</template>

<style scoped></style>
