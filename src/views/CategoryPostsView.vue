<script lang="ts" setup>
import { site } from '@/bridge'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ElTable } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@shared/utils/date'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryTree } from '@/composables/useCategoryTree'
import { normalizeList } from '@shared/utils/stringArray'
import CategoriesTreePanel from '@/components/CategoriesTreePanel.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

const categoryId = ref<string>(route.params.categoryId as string)
const showOnlyDirect = ref(false)

watch(
  () => route.params.categoryId,
  (next) => {
    categoryId.value = String(next)
    showOnlyDirect.value = false
    loadData()
  },
)

const categories = ref<Category[]>([])
const rawPosts = ref<Post[]>([])
const loading = ref(false)
const errorMessage = ref('')
const tableRef = ref<InstanceType<typeof ElTable>>()
const selectedPosts = ref<Post[]>([])

const categoriesRef = computed(() => categories.value)
const { nodeMap } = useCategoryTree(categoriesRef)

const categoryNode = computed(() => {
  return nodeMap.value ? nodeMap.value[categoryId.value] : undefined
})

const hasCategory = computed(() => !!categoryNode.value)

const isLeafCategory = computed(() => {
  const id = categoryId.value
  if (!hasCategory.value || !id) {
    return true
  }
  return !categories.value.some((entry) => entry.parent === id)
})

const categoryPath = computed(() => {
  const node = categoryNode.value
  if (!node) {
    return [] as string[]
  }
  const segments: string[] = []
  let current: NodeData | undefined = node
  while (current) {
    segments.unshift(current.label)
    if (!current.parent) {
      break
    }
    const parentId: string | undefined = current.parent
    if (!parentId) break
    current = nodeMap.value[parentId]
  }
  return segments
})

const categoryDisplayName = computed(() => {
  return categoryPath.value.join(' · ')
})

const pageTitle = computed(() => {
  const path = categoryPath.value.join(' > ') || t('categoryDetail.messages.unknown')
  return t('categoryDetail.pageTitle', { path })
})

function isDescendantOfTarget(category: PostCategory | undefined, targetId: string): boolean {
  if (!category || category._id === targetId) {
    return false
  }
  const node = nodeMap.value?.[category._id]
  let currentParent = category.parent ?? node?.parent
  while (currentParent) {
    if (currentParent === targetId) {
      return true
    }
    const parentNode = nodeMap.value?.[currentParent]
    if (!parentNode) {
      break
    }
    currentParent = parentNode.parent
  }
  return false
}

const filteredResult = computed(() => {
  const targetId = categoryId.value
  if (!targetId) {
    return {
      direct: [] as Post[],
      descendants: [] as Post[],
      all: [] as Post[],
      descendantCount: 0,
    }
  }
  const direct: Post[] = []
  const descendants: Post[] = []
  const all: Post[] = []
  rawPosts.value.forEach((post) => {
    const categoriesForPost = post.categories ?? []
    const hasDirect = categoriesForPost.some((cat) => cat._id === targetId)
    const hasDescendant = categoriesForPost.some((cat) => isDescendantOfTarget(cat, targetId))
    if (hasDescendant) {
      descendants.push(post)
      all.push(post)
      return
    }
    if (hasDirect) {
      direct.push(post)
      all.push(post)
    }
  })
  return {
    direct,
    descendants,
    all,
    descendantCount: descendants.length,
  }
})

const showDirectOnlyMessage = computed(
  () => hasCategory.value && !isLeafCategory.value && filteredResult.value.descendantCount > 0,
)

const postsForTable = computed(() => {
  if (showDirectOnlyMessage.value && showOnlyDirect.value) {
    return filteredResult.value.direct
  }
  if (showDirectOnlyMessage.value) {
    return filteredResult.value.all
  }
  return filteredResult.value.direct
})
const filteredOutCount = computed(() =>
  showDirectOnlyMessage.value && showOnlyDirect.value ? filteredResult.value.descendantCount : 0,
)
const totalPostsInCategory = computed(() => postsForTable.value.length)
const postCountLabel = computed(() => {
  const count = totalPostsInCategory.value
  return t('categoryDetail.postCount', { count, plural: count })
})
const selectedSources = computed(() => selectedPosts.value.map((post) => post.source))
const selectedCount = computed(() => selectedPosts.value.length)

function buildCategoryPathLabels(categoriesForPost: CategoryList | undefined): string[] {
  if (!categoriesForPost || categoriesForPost.length === 0) {
    return []
  }

  const map = new Map<string, PostCategory>()
  const parentIds = new Set<string>()

  categoriesForPost.forEach((cat) => {
    map.set(cat._id, cat)
    if (cat.parent) {
      parentIds.add(cat.parent)
    }
  })

  const labels: string[] = []
  categoriesForPost.forEach((cat) => {
    if (parentIds.has(cat._id)) {
      return
    }
    const segments: string[] = []
    const seen = new Set<string>()
    let currentId: string | undefined = cat._id
    while (currentId && !seen.has(currentId)) {
      seen.add(currentId)
      const local = map.get(currentId)
      if (local) {
        segments.unshift(local.name)
        currentId = local.parent
        continue
      }
      const node = nodeMap.value?.[currentId]
      if (!node) {
        break
      }
      segments.unshift(node.label)
      currentId = node.parent
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

const bulkState = reactive({
  running: false,
  action: '' as 'update' | 'delete' | '',
  summary: '' as string | '',
})
const bulkDialogVisible = ref(false)
const bulkForm = reactive({
  categories: [] as (string | string[])[],
})
const bulkSubmitting = ref(false)
const bulkDialogDisabledIds = computed(() => (categoryId.value ? [categoryId.value] : []))

function isSameAsCurrentCategory(path: string[]): boolean {
  const current = categoryPath.value
  if (current.length !== path.length) {
    return false
  }
  return path.every((segment, index) => segment === current[index])
}

function formatCategoryPathsForDisplay(paths: string[][]): string {
  if (paths.length === 0) {
    return ''
  }
  const listSeparator = /^zh/i.test(appStore.locale) ? '、' : ', '
  const pathSeparator = ' / '
  return paths.map((segments) => segments.join(pathSeparator)).join(listSeparator)
}

async function fetchCategories() {
  categories.value = await site.getCategories()
}

async function fetchPosts() {
  if (!categoryId.value) {
    rawPosts.value = []
    return
  }
  const result = await site.getPosts(true, true, -1, 0, categoryId.value)
  rawPosts.value = result.posts ?? []
  await nextTick()
  resetSelection()
}

async function loadData() {
  if (!categoryId.value) {
    return
  }
  loading.value = true
  errorMessage.value = ''
  bulkState.summary = ''
  try {
    await fetchCategories()
    await fetchPosts()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

async function refreshAfterMutation() {
  await fetchCategories()
  await fetchPosts()
}

function resetSelection() {
  selectedPosts.value = []
  tableRef.value?.clearSelection?.()
}

function handleSelectionChange(selection: Post[]) {
  selectedPosts.value = selection
}

function enableDirectOnlyView() {
  showOnlyDirect.value = true
}

function showAllPostsForCategory() {
  showOnlyDirect.value = false
}

watch(showOnlyDirect, () => {
  resetSelection()
})

async function submitBulkUpdate() {
  if (selectedSources.value.length === 0) {
    ElMessage.warning(t('categoryDetail.messages.postsSelectionRequired'))
    return
  }
  const normalizedCategories = normalizeList(bulkForm.categories)
  if (normalizedCategories.length === 0) {
    ElMessage.warning(t('categoryDetail.messages.categorySelectionRequired'))
    return
  }
  const replacements = normalizedCategories.filter(
    (path) => path.length > 0 && !isSameAsCurrentCategory(path),
  )
  if (replacements.length === 0) {
    ElMessage.warning(t('categoryDetail.messages.categorySelectionMustDiffer'))
    return
  }
  const categoryLabel = categoryDisplayName.value || t('categoryDetail.messages.unknown')
  const replacementsLabel = formatCategoryPathsForDisplay(replacements)
  try {
    await ElMessageBox.confirm(
      t('categoryDetail.dialogs.updateConfirmDetail', {
        count: selectedSources.value.length,
        category: categoryLabel,
        replacements: replacementsLabel,
      }),
      t('categoryDetail.dialogs.updateConfirmTitle'),
      {
        type: 'warning',
        confirmButtonText: t('categoryDetail.actions.confirmUpdate'),
        cancelButtonText: t('categoryDetail.actions.cancel'),
      },
    )
  } catch {
    return
  }
  bulkSubmitting.value = true
  bulkState.running = true
  bulkState.action = 'update'
  bulkState.summary = ''
  try {
    const result = await site.replaceCategoryForPosts(
      categoryId.value,
      selectedSources.value,
      replacements,
    )
    const success = result.success ?? 0
    const failure = result.failure ?? 0
    bulkState.summary = t('categoryDetail.messages.updateSummary', { success, failure })
    ElMessage.success(bulkState.summary)
    bulkDialogVisible.value = false
    bulkForm.categories = []
    await refreshAfterMutation()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    ElMessage.error(t('categoryDetail.messages.operationFailure', { message }))
  } finally {
    bulkSubmitting.value = false
    bulkState.running = false
  }
}

async function handleBulkDelete() {
  if (selectedSources.value.length === 0) {
    ElMessage.warning(t('categoryDetail.messages.postsSelectionRequired'))
    return
  }
  const categoryLabel = categoryDisplayName.value || t('categoryDetail.messages.unknown')
  const uncategorizedCount = selectedPosts.value.reduce((count, post) => {
    const categoriesForPost = post.categories ?? []
    if (!categoryId.value || categoriesForPost.length === 0) {
      return count
    }
    let hasTarget = false
    const remaining = new Set<string>()
    categoriesForPost.forEach((cat) => {
      const id = cat && cat._id
      if (!id) {
        return
      }
      if (id === categoryId.value) {
        hasTarget = true
        return
      }
      remaining.add(id)
    })
    if (hasTarget && remaining.size === 0) {
      return count + 1
    }
    return count
  }, 0)
  const warningSuffix =
    uncategorizedCount > 0
      ? t('categoryDetail.dialogs.bulkDeleteConfirmWarning', { count: uncategorizedCount })
      : ''
  try {
    await ElMessageBox.confirm(
      t('categoryDetail.dialogs.bulkDeleteConfirm', {
        count: selectedSources.value.length,
        category: categoryLabel,
        warning: warningSuffix,
      }),
      t('categoryDetail.actions.delete'),
      {
        type: 'warning',
        confirmButtonText: t('categoryDetail.actions.confirmDelete'),
        cancelButtonText: t('categoryDetail.actions.cancel'),
      },
    )
  } catch {
    return
  }

  bulkState.running = true
  bulkState.action = 'delete'
  bulkState.summary = ''
  try {
    const result = await site.removeCategoryFromPosts(categoryId.value, selectedSources.value)
    const success = result.success ?? 0
    const failure = result.failure ?? 0
    bulkState.summary = t('categoryDetail.messages.deleteSummary', { success, failure })
    ElMessage.success(bulkState.summary)
    await refreshAfterMutation()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    ElMessage.error(t('categoryDetail.messages.operationFailure', { message }))
  } finally {
    bulkState.running = false
  }
}

function openPostEditor(post: Post) {
  router.push({ path: '/frame', query: { sourcePath: post.source } })
}

function openBulkDialog() {
  const sanitized = normalizeList(bulkForm.categories).filter(
    (path) => !isSameAsCurrentCategory(path),
  )
  bulkForm.categories = sanitized.map((segments) => segments.slice()) as (string | string[])[]
  bulkDialogVisible.value = true
}

function goBackToCategories() {
  router.push({ name: 'categories' })
}
</script>

<template>
  <div class="category-detail">
    <div class="category-detail__header">
      <div class="category-detail__header-left">
        <h2 class="category-detail__title">
          {{ pageTitle }}
          <span class="category-detail__count">
            {{ postCountLabel }}
          </span>
        </h2>
      </div>
      <div class="category-detail__header-right">
        <el-button size="small" @click="goBackToCategories">
          {{ t('categoryDetail.returnToList') }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="showDirectOnlyMessage && !showOnlyDirect"
      type="info"
      :closable="false"
      class="mb-3">
      <template #title>
        <div class="category-detail__toggle-message">
          <span>{{ t('categoryDetail.toggle.showingAll') }}</span>
          <el-link type="primary" link @click="enableDirectOnlyView">
            {{ t('categoryDetail.toggle.showDirectLink') }}
          </el-link>
        </div>
      </template>
    </el-alert>

    <el-alert
      v-if="showDirectOnlyMessage && showOnlyDirect"
      type="info"
      :closable="false"
      class="mb-3">
      <template #title>
        <div class="category-detail__toggle-message">
          <span>{{ t('categoryDetail.filteredOut', { count: filteredOutCount }) }}</span>
          <el-link type="primary" link @click="showAllPostsForCategory">
            {{ t('categoryDetail.toggle.showAllLink') }}
          </el-link>
        </div>
      </template>
    </el-alert>

    <el-alert
      v-if="bulkState.running"
      type="warning"
      :closable="false"
      class="mb-3"
      :title="
        t('categoryDetail.progress', {
          action:
            bulkState.action === 'update'
              ? t('categoryDetail.actions.update')
              : t('categoryDetail.actions.delete'),
        })
      " />

    <el-alert
      v-if="!bulkState.running && bulkState.summary"
      type="success"
      :closable="false"
      class="mb-3"
      :title="bulkState.summary" />

    <el-empty v-if="errorMessage" :description="errorMessage" />

    <el-empty
      v-else-if="!loading && !hasCategory"
      :description="t('categoryDetail.messages.categoryNotFound')" />

    <el-empty
      v-else-if="!loading && postsForTable.length === 0"
      :description="t('categoryDetail.empty')" />

    <template v-else>
      <div class="category-detail__toolbar">
        <div class="category-detail__toolbar-left">
          <el-button
            type="primary"
            size="small"
            :disabled="loading || bulkState.running || selectedCount === 0"
            @click="openBulkDialog">
            {{ t('categoryDetail.actions.update') }}
          </el-button>
          <el-button
            type="danger"
            plain
            size="small"
            :disabled="loading || bulkState.running || selectedCount === 0"
            @click="handleBulkDelete">
            {{ t('categoryDetail.actions.delete') }}
          </el-button>
        </div>
      </div>

      <el-table
        :data="postsForTable"
        stripe
        style="width: 100%"
        v-loading="loading"
        ref="tableRef"
        :row-key="(row: Post) => row.source"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column :label="t('categoryDetail.table.title')" min-width="220">
          <template #default="scope">
            <el-link type="primary" @click="openPostEditor(scope.row)">
              {{ scope.row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('categoryDetail.table.status')" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'published' ? 'success' : 'info'"
              disable-transitions>
              {{
                scope.row.status === 'published'
                  ? t('categoryDetail.status.published')
                  : t('categoryDetail.status.draft')
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated" :label="t('categoryDetail.table.updated')" width="220">
          <template #default="scope">
            {{ scope.row.updated ? formatDate(scope.row.updated, appStore.locale) : '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('categoryDetail.table.categories')" min-width="260">
          <template #default="scope">
            <el-tag
              v-for="label in categoryLabelsForPost(scope.row)"
              :key="label"
              size="small"
              class="category-detail__tag">
              {{ label }}
            </el-tag>
            <el-text v-if="categoryLabelsForPost(scope.row).length === 0">--</el-text>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <el-dialog v-model="bulkDialogVisible" :title="t('categoryDetail.dialogs.updateTitle')">
      <el-alert
        type="info"
        :closable="false"
        :title="
          t('categoryDetail.dialogs.updateSummary', {
            count: selectedCount,
            category: categoryDisplayName || t('categoryDetail.messages.unknown'),
          })
        "
        class="mb-3" />
      <CategoriesTreePanel v-model="bulkForm.categories" :disabled-ids="bulkDialogDisabledIds" />
      <template #footer>
        <el-button @click="bulkDialogVisible = false" :disabled="bulkSubmitting">
          {{ t('categoryDetail.actions.cancel') }}
        </el-button>
        <el-button type="primary" :loading="bulkSubmitting" @click="submitBulkUpdate">
          {{ t('categoryDetail.dialogs.updateConfirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.category-detail__header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.category-detail__header-right {
  display: flex;
  align-items: center;
}

.category-detail__title {
  margin: 0;
}

.category-detail__count {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 400;
  color: var(--el-color-info);
}

.category-detail__toggle-message {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.category-detail__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.category-detail__toolbar-left {
  display: flex;
  gap: 12px;
}

.category-detail__tag {
  margin-right: 6px;
}
</style>
