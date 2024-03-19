<script lang="ts" setup>
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useStatsStore } from '@/stores/stats'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const posts = ref<Post[]>([])
async function fetch() {
  const postData = await window.site.getPosts(true, false, 5)
  posts.value = postData.posts
}
fetch()

const appStore = useAppStore()
const statsStore = useStatsStore()
const { siteInfo, hexoConfig } = storeToRefs(appStore)
const { publishedTotal, draftTotal, pageTotal } = storeToRefs(statsStore)
statsStore.updateStats()

function onClick(sourcePath: string) {
  router.push({ name: 'frame', query: { sourcePath: sourcePath } })
}
</script>
<template>
  <h2>{{ t('common.dashboard') }}</h2>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <h3>{{ t('common.activities') }}</h3>
        </template>
        <ul class="latest-posts">
          <li v-for="post in posts" :key="post.permalink">
            <el-link link type="primary" :underline="false" @click="onClick(post.source)">{{
              post.title
            }}</el-link>
            <span>{{ new Date(post.date).toLocaleString() }}</span>
          </li>
        </ul>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <h3>{{ t('common.overview') }}</h3>
        </template>
        <el-row class="stats">
          <el-col :span="8">
            <el-statistic :title="t('common.published')" :value="publishedTotal" :precision="0" />
          </el-col>
          <el-col :span="8">
            <el-statistic :title="t('common.draft')" :value="draftTotal" :precision="0" />
          </el-col>
          <el-col :span="8">
            <el-statistic :title="t('common.page')" :value="pageTotal" :precision="0" />
          </el-col>
        </el-row>
        <el-divider border-style="dotted">
          <span>{{ t('common.system') }}</span>
        </el-divider>
        <el-row class="stats">
          <el-col :span="8">
            <el-text> {{ t('common.packageName') }} {{ siteInfo?.name }} </el-text>
          </el-col>
          <el-col :span="8">
            <el-text> {{ t('common.packageVersion') }} {{ siteInfo?.version }} </el-text>
          </el-col>
          <el-col :span="8">
            <el-text> {{ t('common.hexoVersion') }} {{ siteInfo?.hexoVersion }} </el-text>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <h3>{{ t('common.site') }}</h3>
        </template>
        <ul class="meta-info">
          <li>
            <span class="meta-title">{{ t('dashboard.metaTitle') }}:</span>
            <span class="meta-val">{{ hexoConfig?.title }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaSubtitle') }}:</span>
            <span class="meta-val">{{ hexoConfig?.subtitle }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaDescription') }}:</span>
            <span class="meta-val">{{ hexoConfig?.description }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaKeywords') }}:</span>
            <span class="meta-val">{{ hexoConfig?.keywords }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaAuthor') }}:</span>
            <span class="meta-val">{{ hexoConfig?.author }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaLanguage') }}:</span>
            <span class="meta-val">{{ hexoConfig?.language }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaTimezone') }}:</span>
            <span class="meta-val">{{ hexoConfig?.timezone }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaUrl') }}:</span>
            <span class="meta-val">{{ hexoConfig?.url }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaPermalink') }}:</span>
            <span class="meta-val">{{ hexoConfig?.permalink }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaDateFormat') }}:</span>
            <span class="meta-val">{{ hexoConfig?.date_format }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaTimeFormat') }}:</span>
            <span class="meta-val">{{ hexoConfig?.time_format }}</span>
          </li>
          <li>
            <span class="meta-title">{{ t('dashboard.metaTheme') }}:</span>
            <span class="meta-val">{{ hexoConfig?.theme }}</span>
          </li>
        </ul>
      </el-card>
    </el-col>
  </el-row>
</template>
<style scoped>
.el-card {
  --el-card-padding: 10px;
  margin-bottom: 20px;
}
.stats .el-col {
  text-align: center;
}
.latest-posts {
  list-style: none;
  margin: 0;
  padding-inline-start: 0;
  font-size: 13px;
}
.latest-posts li {
  display: grid;
  grid-template-columns: auto clamp(160px, 165px, 200px);
  column-gap: 10px;
  padding: 6px 0;
  color: #646970;
  padding-left: 10px;
}
.latest-posts .el-link {
  justify-content: left;
}
ul.meta-info {
  list-style-type: none; /* 移除列表前面的黑点 */
  padding-inline-start: 0;
}
.meta-title {
  text-align: right; /* 让 meta-title 右对齐 */
  display: inline-block; /* 使得 text-align 生效 */
  width: calc(30% - 1ch); /* 分配宽度以便于对齐，减去 1 字符的宽度以留出间隔 */
  vertical-align: top; /* 与 meta-val 垂直方向顶部对齐 */
  padding-right: 1ch;
}
.meta-val {
  text-align: left; /* 让 meta-val 左对齐 */
  display: inline-block; /* 使得 text-align 生效 */
  width: calc(70% - 1ch); /* 分配宽度以便于对齐，减去 1 字符的宽度以留出间隔 */
  word-wrap: break-word; /* 如果 meta-val 太长，就换行 */
  padding-left: 1ch;
}
</style>
