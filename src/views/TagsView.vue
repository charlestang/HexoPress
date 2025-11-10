<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TagPostsDialog from '@/components/TagPostsDialog.vue'

const { t } = useI18n()

const tags = ref<Tag[]>([])
const tagsCount = ref(0)
const showDialog = ref(false)
const activeTag = ref<Tag | null>(null)

async function fetch() {
  tags.value = await window.site.getTags()
  tagsCount.value = tags.value.length
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
}

function onDialogClosed() {
  fetch()
}

watch(showDialog, (visible) => {
  if (!visible) {
    activeTag.value = null
  }
})
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
              <el-link type="primary" link @click="onViewTag(scope.row)">{{ t('tags.view') }}</el-link>
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
              <el-link type="primary" link @click="onViewTag(scope.row)">{{ t('tags.view') }}</el-link>
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
