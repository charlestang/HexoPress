<script lang="ts" setup>
import { site } from '@/bridge'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import TagPostsDialog from '@/components/TagPostsDialog.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tags = ref<Tag[]>([])
const tagsCount = ref(0)
const showDialog = ref(false)
const activeTag = ref<Tag | null>(null)
const routeTagId = computed(() => (typeof route.query.tagId === 'string' ? route.query.tagId : ''))
const shouldRestoreDialog = computed(
  () => route.query.tagDialog === '1' && routeTagId.value.length > 0,
)

async function fetch() {
  tags.value = await site.getTags()
  tagsCount.value = tags.value.length
  restoreDialogIfNeeded()
}
fetch()

const sortedTags = computed(() => {
  if (tags.value == null) {
    return []
  }
  return tags.value?.slice().sort((a, b) => {
    return b.length - a.length
  })
})
const midIndex = computed(() => {
  return Math.ceil(sortedTags.value.length / 2)
})
const firstHalf = computed(() => {
  if (tags.value == null) {
    return []
  }
  return sortedTags.value?.slice(0, midIndex.value)
})
const secondHalf = computed(() => {
  if (tags.value == null) {
    return []
  }
  return sortedTags.value?.slice(midIndex.value)
})

function onViewTag(tag: Tag) {
  activeTag.value = tag
  showDialog.value = true
  updateDialogQuery(tag)
}

function onDialogClosed() {
  clearDialogQuery()
  fetch()
}

function updateDialogQuery(tag: Tag | null) {
  const nextQuery = { ...route.query }
  if (tag) {
    nextQuery.tagId = tag.id
    nextQuery.tagDialog = '1'
  } else {
    delete nextQuery.tagId
    delete nextQuery.tagDialog
  }
  router.replace({ query: nextQuery })
}

function clearDialogQuery() {
  updateDialogQuery(null)
}

function restoreDialogIfNeeded() {
  if (!shouldRestoreDialog.value || showDialog.value) {
    return
  }
  const target = tags.value.find((tag) => tag.id === routeTagId.value)
  if (!target) {
    return
  }
  activeTag.value = target
  showDialog.value = true
}

watch(showDialog, (visible) => {
  if (!visible) {
    activeTag.value = null
  }
})

watch(
  () => [shouldRestoreDialog.value, routeTagId.value] as const,
  () => restoreDialogIfNeeded(),
)
</script>

<template>
  <h2>{{ t('common.tags') }} {{ t('tags.stats', { count: tagsCount }) }}</h2>
  <div class="wrapper">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-table
          :data="firstHalf"
          style="width: 100%; margin-bottom: 20px"
          row-key="id"
          :border="false"
          :stripe="true"
          default-expand-all>
          <el-table-column prop="name" :label="t('tags.name')" sortable>
            <template #default="scope">
              <el-tag>{{ scope.row.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="length" :label="t('tags.total')" sortable />
          <el-table-column :label="t('tags.actions')">
            <template #default="scope">
              <el-link type="primary" link @click="onViewTag(scope.row)">{{
                t('tags.view')
              }}</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">
        <el-table
          :data="secondHalf"
          style="width: 100%; margin-bottom: 20px"
          row-key="id"
          :border="false"
          :stripe="true"
          default-expand-all>
          <el-table-column prop="name" :label="t('tags.name')" sortable>
            <template #default="scope">
              <el-tag>{{ scope.row.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="length" :label="t('tags.total')" sortable />
          <el-table-column :label="t('tags.actions')">
            <template #default="scope">
              <el-link type="primary" link @click="onViewTag(scope.row)">{{
                t('tags.view')
              }}</el-link>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
  <TagPostsDialog v-model="showDialog" :tag="activeTag" @closed="onDialogClosed" />
</template>
<style scoped>
.wrapper {
  flex-grow: 1;
  overflow-y: auto;
  margin-right: -20px;
}
</style>
