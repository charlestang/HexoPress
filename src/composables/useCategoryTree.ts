import { computed } from 'vue'
import type { Ref } from 'vue'

export function useCategoryTree(categories: Ref<Category[]>) {
  // Convert category data to mapping
  const nodeMap = computed(() => {
    const map: { [id: string]: NodeData } = {}
    for (const entry of categories.value) {
      map[entry.id] = {
        id: entry.id,
        value: entry.id,
        parent: entry.parent,
        label: entry.name,
        children: [],
        length: entry.length,
        permalink: entry.permalink,
      }
    }
    return map
  })

  // Build tree structure
  const treeData = computed(() => {
    const tree: NodeData[] = []

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

  return {
    nodeMap,
    treeData
  }
}