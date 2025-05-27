<script lang="ts" setup>
import { PostStatusFilterChoice } from '@/components/PostListFilters'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useFilterStore } from '@/stores/filter'
import { useStatsStore } from '@/stores/stats'
import { formatDate } from '@/utils/date'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTableHeight } from '@/composables/useTableHeight'
import PostPreviewDialog from '@/components/PostPreviewDialog.vue'

const appStore = useAppStore()
const filterStore = useFilterStore()
const { t } = useI18n()
const { updateStats } = useStatsStore()

// posts list
const { statusFilterVal, dateCategoryFilterVal } = storeToRefs(filterStore)
const posts = ref<Post[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keywords = ref('')

async function fetch(curPage: number) {
  const published = statusFilterVal.value !== PostStatusFilterChoice.Draft
  const draft = statusFilterVal.value !== PostStatusFilterChoice.Published
  const limit = pageSize.value
  const offset = (curPage - 1) * limit
  const selectedMonth =
    dateCategoryFilterVal.value.date === 'all' ? '' : dateCategoryFilterVal.value.date
  const selectedCat =
    dateCategoryFilterVal.value.category === 'all' ? '' : dateCategoryFilterVal.value.category

  const data = await window.site.getPosts(
    published,
    draft,
    limit,
    offset,
    selectedCat,
    selectedMonth,
    keywords.value,
  )
  posts.value = data.posts
  total.value = data.total
}
fetch(currentPage.value)
watch(statusFilterVal, (value, oldValue) => {
  if (value !== oldValue) {
    currentPage.value = 1
    fetch(currentPage.value)
  }
})

watch(pageSize, (value, oldValue) => {
  if (value !== oldValue) {
    currentPage.value = 1
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
    .then(async (a) => {
      console.log(a)
      await window.site.deleteFile(articlePath)
      ElMessage({
        type: 'success',
        message: t('posts.deleteSuccess'),
      })
      fetch(currentPage.value)
      await updateStats()
    })
    .catch((reason) => {
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

const showPreviewDialog = ref(false)
const currentPreviewSourcePath = ref('')
const currentPreviewPermalink = ref('')
function onClickPreview(sourcePath: string, permalink: string) {
  currentPreviewSourcePath.value = sourcePath
  currentPreviewPermalink.value = permalink
  showPreviewDialog.value = true
}

// sort the posts by date or updated
const sortedBy = ref('date')

function onSearchClick() {
  currentPage.value = 1
  fetch(currentPage.value)
}

const { tableHeight, wrapper } = useTableHeight()

</script>
<template>
  <h2>{{ t('posts.pageTitle') }}</h2>
  <el-row :gutter="5" class="filter-row">
    <el-col :span="19">
      <PostStatusFilter v-model="statusFilterVal" />
    </el-col>
    <el-col :span="5" class="flex-end">
      <el-space>
        <el-input
          v-model="keywords"
          :placeholder="t('posts.keywords')"
          size="small"
          :clearable="true"
          @clear="onSearchClick" />
        <el-button type="primary" size="small" @click="onSearchClick">{{
          t('posts.search')
        }}</el-button>
      </el-space>
    </el-col>
  </el-row>
  <el-row :gutter="5" class="filter-row">
    <el-col :span="12">
      <DateCategoryFilter v-model="dateCategoryFilterVal" @filter="refresh" />
    </el-col>
    <el-col :span="12" class="flex-end"></el-col>
  </el-row>
  <div ref="wrapper" class="wrapper">
    <el-table :data="posts" stripe :height="tableHeight" class="post-list">
      <el-table-column type="index" label="#" width="48" />
      <el-table-column :label="t('posts.title')" width="360">
        <template #default="scope">
          <el-row>
            <el-col :span="24">
              <KeywordSpan :keywords="keywords" :text="scope.row.title" />
              <span v-show="scope.row.status == 'draft'" class="draft-status">
                -- {{ t('posts.draft') }}</span
              >
            </el-col>
          </el-row>
          <el-row class="op">
            <el-col :span="24">
              <el-link type="primary" @click="onClickPreview(scope.row.source, scope.row.permalink)">{{
                t('posts.preview')
              }}</el-link
              ><el-divider direction="vertical" />
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
            class="tag-item">
            {{ val }}
          </el-tag>
          <el-text v-if="Object.keys(scope.row.categories).length == 0">--</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="tags" :label="t('posts.tags')">
        <template #default="scope">
          <el-tag
            v-for="(val, k) in scope.row.tags"
            :key="k"
            size="small"
            class="tag-item">
            {{ val }}
          </el-tag>
          <el-text v-if="Object.keys(scope.row.tags).length == 0">--</el-text>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('posts.publishedAt')"
        sortable
        :sort-by="sortedBy">
        <template #header>
          <el-select v-model="sortedBy" size="small" class="time-type-select">
            <el-option key="publishedAt" :label="t('posts.publishedAt')" value="date" />
            <el-option key="updatedAt" :label="t('posts.updatedAt')" value="updated" />
          </el-select>
        </template>
        <template #default="scope">
          <template v-if="sortedBy == 'date'">
            <el-row>
              <el-col :span="24">
                <span v-if="scope.row.status == 'published'">{{ t('posts.published') }}</span>
                <span v-else>{{ t('posts.edited') }}</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <span v-if="scope.row.status == 'published'">
                  {{ formatDate(scope.row.date, appStore.locale) }}
                </span>
                <span v-else>{{ formatDate(scope.row.updated, appStore.locale) }}</span>
              </el-col>
            </el-row>
          </template>
          <template v-else>
            <el-row>
              <el-col :span="24">
                <span>{{ t('posts.updated') }}</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <span v-if="scope.row.updated != ''">{{ formatDate(scope.row.updated, appStore.locale) }}</span>
              </el-col>
            </el-row>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    size="small"
    :disabled="false"
    :background="true"
    layout="prev, pager, next, jumper, ->, sizes, total"
    :total="total"
    @current-change="fetch" />
  <MetaDataDialog
    v-model="showMetaEditDialog"
    :source-path="currentEditingSourcePath"
    @success="refresh" />
  <PostPreviewDialog
    v-model="showPreviewDialog"
    :source-path="currentPreviewSourcePath"
    :permalink="currentPreviewPermalink" />
</template>
<style scoped>
.wrapper {
  flex-grow: 1;
  overflow-y: auto;
  margin-right: -20px;
}
.post-list {
  width: 100%;
  margin-bottom: 10px;
}
.el-table :deep(.el-table__cell) {
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
.filter-row {
  margin-bottom: 5px;
}
.flex-end {
  display: flex;
  justify-content: flex-end;
}
.tag-item {
  margin-right: 5px;
}
.time-type-select {
  width: 140px;
}
</style>
