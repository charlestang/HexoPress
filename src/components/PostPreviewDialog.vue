<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { parseFrontMatter, type FrontMatter } from '@/components/FrontMatter'
import { Folder, PriceTag, Timer } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
  sourcePath: string
  permalink?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const content = ref('')
const loading = ref(false)

/**
 * Content sanitizer to help preview display images in content.
 * @param html The HTML content of the blog post.
 */
function filterImage(html: string): string {
  console.log('filterImage', props.permalink)
  let relativePermalink = props.permalink || ''
  // 移除 URL 中的 http(s)://<host>/ 部分
  if (relativePermalink) {
    relativePermalink = relativePermalink.replace(/^https?:\/\/[^\/]+\//, '')
  }
  console.log('relativePermalink', relativePermalink)
  return _addPrefixToImgSrc(html, 'http://127.0.0.1:2357/', relativePermalink)
}

function _addPrefixToImgSrc(html: string, prefix: string, currentPath: string): string {
  const regex = /(<img[^>]+src\s*=\s*["'])([^"']*)/gi
  return html.replace(regex, (match, p1, p2: string) => {
    console.log('p2', p2)
    if (p2.startsWith('http://') || p2.startsWith('https://')) {
      return match
    }
    const curPath = currentPath.split('/').filter((p) => p !== '')
    const imgPath = p2.split('/').filter((p) => p !== '')
    while (curPath.length > 0 && imgPath[0] == '..') {
      imgPath.shift()
      curPath.pop()
    }
    return p1 + prefix + curPath.concat(imgPath).join('/')
  })
}

const frontMatter = ref<FrontMatter>({
  title: '',
  date: new Date(),
  permalink: '',
  categories: [] as string[],
  tags: [] as string[],
})

async function fetchContent() {
  if (!props.sourcePath) return
  loading.value = true
  try {
    const result = await window.site.getContent(props.sourcePath)
    const parseDown = parseFrontMatter(result)
    frontMatter.value = parseDown.data as FrontMatter
    content.value = parseDown.content
  } catch (error) {
    console.error('Failed to fetch post content:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      fetchContent()
    }
  },
)

watch(
  () => props.sourcePath,
  () => {
    if (props.modelValue) {
      fetchContent()
    }
  },
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('posts.preview')"
    width="960px"
    :close-on-click-modal="false"
    @update:modelValue="(val) => emit('update:modelValue', val)">
    <div v-loading="loading" class="min-h-400px max-h-70vh overflow-y-auto p-5 flex flex-col gap-6">
      <div class="max-w-880px mx-auto w-full pb-5 border-b border-gray-200">
        <h1 class="text-28px font-600 m-0 mb-4 text-left leading-1.4">{{ frontMatter.title }}</h1>
        <div class="text-14px text-gray-600">
          <div class="flex gap-4 mb-2">
            <div v-if="frontMatter.categories.length" class="flex items-center gap-1">
              <el-icon class="text-16px text-gray-600"><Folder /></el-icon>
              <span class="text-gray-800">{{ Array.isArray(frontMatter.categories) ? frontMatter.categories.join(' / ') : frontMatter.categories }}</span>
            </div>
            <div v-if="frontMatter.tags.length" class="flex items-center gap-1">
              <el-icon class="text-16px text-gray-600"><PriceTag /></el-icon>
              <span class="text-gray-800">{{ frontMatter.tags.join('、') }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <el-icon class="text-16px text-gray-600"><Timer /></el-icon>
            <span class="text-gray-800">{{ frontMatter.date ? new Date(frontMatter.date).toLocaleString() : '' }}</span>
          </div>
        </div>
      </div>
      <div class="max-w-880px mx-auto leading-1.6 text-16px w-full">
        <MdPreview :modelValue="content" :sanitize="filterImage" />
      </div>
    </div>
  </el-dialog>
</template>
