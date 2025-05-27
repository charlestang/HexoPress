<script setup lang="ts">
import { useEditorStore } from '@/stores/editorStore'
import { computed, ref, watch, nextTick } from 'vue'
import type { ElTree } from 'element-plus'

interface TreeNode {
  id: string
  text: string
  level: number
  line: number
  children?: TreeNode[]
}

interface Props {
  headings: Heading[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'scrollToHeading', heading: Heading): void
}>()

const editorStore = useEditorStore()
const activeHeading = computed(() => editorStore.activeHeading)
const treeRef = ref<InstanceType<typeof ElTree>>()

const defaultProps = {
  children: 'children',
  label: 'text',
}

const treeData = computed(() => {
  const headings = props.headings
  if (!headings || headings.length === 0) {
    return []
  }

  const result: TreeNode[] = []
  let currentH1: TreeNode | null = null
  let currentH2: TreeNode | null = null

  for (const heading of headings) {
    const treeNode: TreeNode = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      line: heading.line,
      children: [],
    }

    if (heading.level === 1) {
      currentH1 = treeNode
      result.push(currentH1)
      currentH2 = null
    } else if (heading.level === 2) {
      if (currentH1) {
        currentH2 = treeNode
        currentH1.children!.push(currentH2)
      } else {
        currentH2 = treeNode
        result.push(currentH2)
        currentH1 = null
      }
    } else if (heading.level === 3) {
      if (currentH2) {
        currentH2.children!.push(treeNode)
      } else if (currentH1) {
        currentH1.children!.push(treeNode)
      } else {
        result.push(treeNode)
      }
    }
  }
  return result
})

const handleNodeClick = (data: TreeNode) => {
  const heading: Heading = {
    id: data.id,
    text: data.text,
    level: data.level,
    line: data.line,
  }
  editorStore.setActiveHeading(heading)
  emit('scrollToHeading', heading)
}

// 监听 activeHeading 变化，更新树的当前选中节点
watch(
  () => activeHeading.value,
  (newActiveHeading) => {
    if (newActiveHeading && treeRef.value) {
      nextTick(() => {
        treeRef.value?.setCurrentKey(newActiveHeading.id)
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="toc-wrapper">
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      :highlight-current="true"
      :current-node-key="activeHeading?.id"
      :expand-on-click-node="false"
      default-expand-all
      @node-click="handleNodeClick"
      class="toc-tree">
      <template #default="{ data }">
        <span v-if="data" :class="['toc-node-label', `toc-level-${data.level}`]" :title="data.text">
          {{ data.text }}
        </span>
      </template>
    </el-tree>
  </div>
</template>

<style scoped>
.toc-wrapper {
  padding: 8px;
  height: 100%;
  box-sizing: border-box;
}

.toc-tree {
  height: 100%;
  overflow-y: auto;
}

/* 不同级别标题的样式 */
.toc-node-label {
  display: block;
  width: 100%;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}

.toc-level-1 {
  font-weight: 600;
}

.toc-level-2 {
  font-weight: 500;
}

.toc-level-3 {
  font-weight: 400;
}

/* 移除默认的展开/折叠图标，因为我们不需要手动折叠 */
.toc-tree :deep(.el-tree-node__expand-icon) {
  display: none;
}

/* 调整缩进 */
.toc-tree :deep(.el-tree-node__children) {
  padding-left: 18px;
}
</style>
