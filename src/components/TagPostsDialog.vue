<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type TagRecord = Tag | null

const props = defineProps<{
  modelValue: boolean
  tag: TagRecord
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()

const posts = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let requestToken = 0

const dialogTitle = computed(() => {
  const name = props.tag?.name ?? t('tags.name')
  const count = loading.value ? '…' : String(posts.value.length)
  return t('tags.dialogTitle', { name, count })
})

function handleClose() {
  emit('update:modelValue', false)
}

function resetState() {
  requestToken += 1
  posts.value = []
  loading.value = false
  error.value = null
}

async function fetchPosts(tag: Tag) {
  requestToken += 1
  const currentToken = requestToken
  loading.value = true
  error.value = null
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

function tagLabelsForPost(post: Post): string[] {
  if (!post.tags) {
    return []
  }
  return Object.values(post.tags)
}

function onRetry() {
  if (props.tag) {
    fetchPosts(props.tag)
  }
}
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
      <el-table
        v-else
        :data="posts"
        stripe
        class="posts-table"
        height="360"
        :border="false"
        :show-header="true">
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
                v-for="label in tagLabelsForPost(scope.row)"
                :key="label"
                size="small"
                class="tag-item">
                {{ label }}
              </el-tag>
            </template>
            <el-text v-else>--</el-text>
          </template>
        </el-table-column>
      </el-table>
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
.tag-item {
  margin: 0 4px 4px 0;
}
.post-title {
  word-break: break-word;
}
</style>
