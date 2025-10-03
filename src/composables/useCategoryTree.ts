import { computed, unref } from 'vue'
import type { Ref } from 'vue'

type MaybeIterable<T> = Iterable<T> | ArrayLike<T>

interface UseCategoryTreeOptions {
  disabledIds?: Ref<MaybeIterable<string>> | MaybeIterable<string>
}

export function useCategoryTree(categories: Ref<Category[]>, options: UseCategoryTreeOptions = {}) {
  const disabledSetRef = computed(() => {
    const raw = options.disabledIds ? unref(options.disabledIds) : undefined
    if (!raw) {
      return new Set<string>()
    }
    if (raw instanceof Set) {
      return raw
    }
    return new Set(Array.from(raw))
  })

  // Convert category data to mapping
  const nodeMap = computed(() => {
    const map: { [id: string]: NodeData } = {}
    const disabledSet = disabledSetRef.value
    for (const entry of categories.value) {
      map[entry.id] = {
        id: entry.id,
        value: entry.id,
        parent: entry.parent,
        label: entry.name,
        children: [],
        length: entry.length,
        permalink: entry.permalink,
        disabled: disabledSet.has(entry.id),
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
