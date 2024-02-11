<script lang="ts" setup>
import { PostStatusFilterChoice } from '@/components/PostListFilters'
import type { Post } from '@/local.d.ts'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useFilterStore } from '@/stores/filter'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useAppStore()
const filterStore = useFilterStore()
const { t } = useI18n()

// posts list
const { statusFilterVal, dateCategoryFilterVal } = storeToRefs(filterStore)
const posts = ref<undefined | Post[]>(undefined)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
async function fetch(curPage: number) {
  let data
  let published = statusFilterVal.value !== PostStatusFilterChoice.Draft
  let draft = statusFilterVal.value !== PostStatusFilterChoice.Published
  let limit = pageSize.value
  let offset = (curPage - 1) * limit
  let selectedMonth = dateCategoryFilterVal.value.date
  if (selectedMonth === 'all') {
    selectedMonth = ''
  }
  let selectedCat = dateCategoryFilterVal.value.category
  if (selectedCat === 'all') {
    selectedCat = ''
  }

  data = await window.site.getPosts(published, draft, limit, offset, selectedCat, selectedMonth)
  posts.value = data.posts
  total.value = data.total
}
fetch(currentPage.value)
watch(statusFilterVal, (value, oldValue) => {
  if (value !== oldValue) {
    fetch(currentPage.value)
  }
})

function refresh() {
  fetch(currentPage.value)
}
// open editor
function onClick(sourcePath: string) {
  router.push({ path: '/frame', query: { sourcePath: sourcePath } })
}
function onDelete(articleName: string, articlePath: string) {
  ElMessageBox.confirm(
    t('posts.doubleConfirmDeleteContent') + articleName + t('posts.questionMark'),
    t('posts.warning'),
    {
      confirmButtonText: t('posts.confirm'),
      cancelButtonText: t('posts.cancel'),
      type: 'warning',
    },
  )
    .then(async a => {
      console.log(a)
      await window.site.deleteFile(articlePath)
      ElMessage({
        type: 'success',
        message: t('posts.deleteSuccess'),
      })
      fetch(currentPage.value)
    })
    .catch(reason => {
      if (reason === 'cancel') {
        ElMessage({
          type: 'info',
          message: t('posts.deleteCanceled'),
        })
      } else {
        if (typeof reason === 'object' && reason.name === 'Error') {
          ElMessage({
            type: 'error',
            message: reason.message,
          })
        } else {
          ElMessage({
            type: 'error',
            message: t('posts.unknownError'),
          })
        }
      }
    })
}

const showMetaEditDialog = ref(false)
const currentEditingSourcePath = ref('')
function onClickEditMeta(sourcePath: string) {
  currentEditingSourcePath.value = sourcePath
  showMetaEditDialog.value = true
}
</script>
<template>
  <h2>{{ t('posts.pageTitle') }}</h2>
  <el-row :gutter="5" style="margin-bottom: 5px">
    <el-col :span="19">
      <post-status-filter v-model="statusFilterVal" />
    </el-col>
    <el-col :span="5" style="display: flex; justify-content: flex-end">
      <el-space>
        <el-input placeholder="Search" size="small" />
        <el-button type="primary" size="small" plain>{{ t('posts.search') }}</el-button>
      </el-space>
    </el-col>
  </el-row>
  <el-row :gutter="5">
    <el-col :span="12">
      <date-category-filter v-model="dateCategoryFilterVal" @filter="refresh" />
    </el-col>
    <el-col :span="12" style="display: flex; justify-content: flex-end">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :small="true"
        :disabled="false"
        :background="false"
        layout="sizes, prev, pager, next, jumper"
        :total="total"
        :pager-count="5"
        @current-change="fetch" />
    </el-col>
  </el-row>
  <el-table :data="posts" stripe style="width: 100%; margin-bottom: 10px">
    <el-table-column type="index" label="#" width="45" />
    <el-table-column :label="t('posts.title')" width="360">
      <template #default="scope">
        <el-row>
          <el-col :span="24">
            {{ scope.row.title }}
            <span v-if="scope.row.status == 'draft'" class="draft-status">
              -- {{ t('posts.draft') }}</span
            >
          </el-col>
        </el-row>
        <el-row class="op">
          <el-col :span="24">
            <el-link type="primary" @click="onClick(scope.row.source)"
              >{{ t('posts.edit') }} </el-link
            ><el-divider direction="vertical" />
            <el-link type="primary" @click="onClickEditMeta(scope.row.source)">{{
              t('posts.editMeta')
            }}</el-link
            ><el-divider direction="vertical" />
            <el-link type="danger" @click="onDelete(scope.row.title, scope.row.source)">{{
              t('posts.delete')
            }}</el-link>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column prop="categories" :label="t('posts.categories')">
      <template #default="scope">
        <el-tag
          v-for="(val, k) in scope.row.categories"
          :key="k"
          size="small"
          style="margin-right: 5px">
          {{ val }}
        </el-tag>
        <el-text v-if="Object.keys(scope.row.categories).length == 0">--</el-text>
      </template>
    </el-table-column>
    <el-table-column prop="tags" :label="t('posts.tags')">
      <template #default="scope">
        <el-tag v-for="(val, k) in scope.row.tags" :key="k" size="small" style="margin-right: 5px">
          {{ val }}
        </el-tag>
        <el-text v-if="Object.keys(scope.row.tags).length == 0">--</el-text>
      </template>
    </el-table-column>
    <el-table-column :label="t('posts.publishedAt')">
      <template #default="scope">
        <el-row>
          <el-col :span="24">
            <span v-if="scope.row.status == 'published'">{{ t('posts.published') }}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <span v-if="scope.row.status == 'published'">{{
              Intl.DateTimeFormat(appStore.locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(scope.row.date))
            }}</span>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column :label="t('posts.updatedAt')">
      <template #default="scope">
        <el-row>
          <el-col :span="24">
            <span v-if="scope.row.updated != ''">{{
              Intl.DateTimeFormat(appStore.locale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(scope.row.updated))
            }}</span>
          </el-col>
        </el-row>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :small="false"
    :disabled="false"
    :background="true"
    layout="prev, pager, next, jumper"
    :total="total"
    @current-change="fetch" />
  <meta-data-dialog
    v-model="showMetaEditDialog"
    :source-path="currentEditingSourcePath"
    @success="refresh" />
</template>
<style>
.el-table .el-table__cell {
  vertical-align: top;
}
.draft-status {
  font-weight: bold;
}
.el-table__cell .op {
  display: none;
  line-height: 1.5;
}
.el-table__cell:hover .op {
  display: block;
}
</style>
