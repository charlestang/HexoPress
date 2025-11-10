<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

type TagRecord = Tag | null
type TagChip = {
  id: string
  name: string
}

const props = defineProps<{
  modelValue: boolean
  tag: TagRecord
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'closed'): void
}>()

const { t } = useI18n()

const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const tagRemovalError = ref<string | null>(null)
let requestToken = 0
const pendingRemovalKeys = ref<Set<string>>(new Set())
const rowsPendingRemoval = ref<Set<string>>(new Set())
const removalTimers = new Map<string, number>()
const removalAnimationMs = 300

const dialogTitle = computed(() => {
  const name = props.tag?.name ?? t('tags.name')
  const count = loading.value ? '…' : String(posts.value.length)
  return t('tags.dialogTitle', { name, count })
})

function handleClose() {
  emit('update:modelValue', false)
  emit('closed')
}

function resetState() {
  requestToken += 1
  posts.value = []
  loading.value = false
  error.value = null
  tagRemovalError.value = null
  pendingRemovalKeys.value = new Set()
  rowsPendingRemoval.value = new Set()
  removalTimers.forEach((timer) => window.clearTimeout(timer))
  removalTimers.clear()
}

async function fetchPosts(tag: Tag) {
  requestToken += 1
  const currentToken = requestToken
  loading.value = true
  error.value = null
  tagRemovalError.value = null
  try {
    const result = await window.site.getPosts(true, true, -1, 0, '', '', '', tag.id, 'date', 'desc')
    if (currentToken !== requestToken) {
      return
    }
    posts.value = result.posts
  } catch (err) {
    if (currentToken !== requestToken) {
      return
    }
    error.value = err instanceof Error ? err.message : String(err)
    posts.value = []
  } finally {
    if (currentToken === requestToken) {
      loading.value = false
    }
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      resetState()
    }
  },
)

watch(
  () => [props.modelValue, props.tag?.id] as const,
  ([visible, tagId]) => {
    if (!visible || !tagId || !props.tag) {
      return
    }
    fetchPosts(props.tag)
  },
  { immediate: true },
)

function buildCategoryPathLabels(categories: CategoryList | undefined): string[] {
  if (!categories || categories.length === 0) {
    return []
  }
  const map = new Map<string, PostCategory>()
  const parentIds = new Set<string>()

  categories.forEach((cat) => {
    map.set(cat._id, cat)
    if (cat.parent) {
      parentIds.add(cat.parent)
    }
  })

  const labels: string[] = []
  categories.forEach((cat) => {
    if (parentIds.has(cat._id)) {
      return
    }
    const segments: string[] = []
    const seen = new Set<string>()
    let current: PostCategory | undefined = cat
    while (current && !seen.has(current._id)) {
      seen.add(current._id)
      segments.unshift(current.name)
      if (!current.parent) {
        break
      }
      current = map.get(current.parent)
    }
    if (segments.length > 0) {
      labels.push(segments.join(' > '))
    }
  })
  return labels
}

const categoryLabelCache = new WeakMap<Post, string[]>()

function categoryLabelsForPost(post: Post): string[] {
  const cached = categoryLabelCache.get(post)
  if (cached) {
    return cached
  }
  const labels = buildCategoryPathLabels(post.categories)
  categoryLabelCache.set(post, labels)
  return labels
}

function tagLabelsForPost(post: Post): TagChip[] {
  if (!post.tags) {
    return []
  }
  return Object.entries(post.tags).map(([id, name]) => ({
    id,
    name,
  }))
}

function onRetry() {
  if (props.tag) {
    fetchPosts(props.tag)
  }
}

function buildRemovalKey(post: Post, tagId: string): string {
  return `${post.source}::${tagId}`
}

function setPendingRemoval(key: string, shouldAdd: boolean) {
  const next = new Set(pendingRemovalKeys.value)
  if (shouldAdd) {
    next.add(key)
  } else {
    next.delete(key)
  }
  pendingRemovalKeys.value = next
}

function setRowRemoval(sourcePath: string, shouldAdd: boolean) {
  const next = new Set(rowsPendingRemoval.value)
  if (shouldAdd) {
    next.add(sourcePath)
  } else {
    next.delete(sourcePath)
  }
  rowsPendingRemoval.value = next
}

function scheduleRowRemoval(sourcePath: string) {
  if (rowsPendingRemoval.value.has(sourcePath)) {
    return
  }
  setRowRemoval(sourcePath, true)
  const timer = window.setTimeout(() => {
    setRowRemoval(sourcePath, false)
    posts.value = posts.value.filter((post) => post.source !== sourcePath)
    removalTimers.delete(sourcePath)
  }, removalAnimationMs)
  removalTimers.set(sourcePath, timer)
}

function applyTagRemoval(sourcePath: string, tagId: string): void {
  let removedFilterTag = false
  posts.value = posts.value.map((post) => {
    if (post.source !== sourcePath || !post.tags || !(tagId in post.tags)) {
      return post
    }
    const nextTags = { ...post.tags }
    delete nextTags[tagId]
    if (props.tag?.id && !nextTags[props.tag.id]) {
      removedFilterTag = true
    }
    return {
      ...post,
      tags: nextTags,
    }
  })

  if (removedFilterTag) {
    scheduleRowRemoval(sourcePath)
  }
}

function rowClassName({ row }: { row: Post }): string {
  return rowsPendingRemoval.value.has(row.source) ? 'is-removing-row' : ''
}

function isRemovingChip(post: Post, tagId: string): boolean {
  const key = buildRemovalKey(post, tagId)
  return pendingRemovalKeys.value.has(key)
}

async function onRemoveTag(post: Post, tag: TagChip) {
  if (!post.source || !tag.id) {
    return
  }

  const removalKey = buildRemovalKey(post, tag.id)
  if (pendingRemovalKeys.value.has(removalKey)) {
    return
  }

  try {
    await ElMessageBox.confirm(
      t('tags.removeConfirmMessage', { tag: tag.name, post: post.title }),
      t('tags.removeConfirmTitle'),
      {
        type: 'warning',
        confirmButtonText: t('tags.removeConfirm'),
        cancelButtonText: t('posts.cancel'),
      },
    )
  } catch {
    return
  }

  tagRemovalError.value = null
  setPendingRemoval(removalKey, true)
  try {
    await window.site.removeTagFromPost(post.source, tag.id)
    applyTagRemoval(post.source, tag.id)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    tagRemovalError.value = t('tags.removeError', { message })
  } finally {
    setPendingRemoval(removalKey, false)
  }
}

onBeforeUnmount(() => {
  removalTimers.forEach((timer) => window.clearTimeout(timer))
  removalTimers.clear()
})

defineExpose({
  posts,
  tagRemovalError,
  onRemoveTag,
})
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="75%"
    destroy-on-close
    @close="handleClose">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="4" animated />
    </div>
    <template v-else>
      <div v-if="error" class="error-state">
        <el-alert :title="t('tags.loadError')" type="error" show-icon />
        <el-button type="primary" size="small" @click="onRetry">{{ t('tags.retry') }}</el-button>
      </div>
      <el-empty v-else-if="posts.length === 0" :description="t('tags.emptyPosts')" />
      <template v-else>
        <div v-if="tagRemovalError" class="removal-error">
          <el-alert
            :title="tagRemovalError"
            type="error"
            show-icon
            closable
            @close="tagRemovalError = null"
          />
        </div>
        <el-table
          :data="posts"
          stripe
          class="posts-table"
          height="360"
          :border="false"
          :show-header="true"
          row-key="source"
          :row-class-name="rowClassName">
        <el-table-column type="index" width="64" />
        <el-table-column :label="t('posts.title')" prop="title">
          <template #default="scope">
            <span class="post-title">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('posts.categories')" prop="categories">
          <template #default="scope">
            <template v-if="categoryLabelsForPost(scope.row).length > 0">
              <el-tag
                v-for="label in categoryLabelsForPost(scope.row)"
                :key="label"
                size="small"
                class="tag-item">
                {{ label }}
              </el-tag>
            </template>
            <el-text v-else>--</el-text>
          </template>
        </el-table-column>
        <el-table-column :label="t('posts.tags')" prop="tags">
          <template #default="scope">
            <template v-if="tagLabelsForPost(scope.row).length > 0">
              <el-tag
                v-for="tag in tagLabelsForPost(scope.row)"
                :key="`${scope.row.source}-${tag.id}`"
                size="small"
                class="tag-chip"
                effect="light"
                :closable="!isRemovingChip(scope.row, tag.id)"
                :disable-transitions="true"
                @close="() => onRemoveTag(scope.row, tag)">
                <span class="tag-chip__label">{{ tag.name }}</span>
                <el-icon v-if="isRemovingChip(scope.row, tag.id)" class="tag-chip__spinner" :size="12">
                  <Loading />
                </el-icon>
              </el-tag>
            </template>
            <el-text v-else>--</el-text>
          </template>
        </el-table-column>
      </el-table>
      </template>
    </template>
    <template #footer>
      <el-button @click="handleClose">{{ t('posts.cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.loading {
  padding: 16px 0;
}
.error-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}
.posts-table {
  width: 100%;
}
.posts-table :deep(.el-table__body tr) {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.posts-table :deep(.el-table__body tr.is-removing-row) {
  opacity: 0;
  transform: translateX(8px);
}
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 4px 4px 0;
}
.tag-chip__label {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag-chip__spinner {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.post-title {
  word-break: break-word;
}
.removal-error {
  margin-bottom: 12px;
}
</style>
