<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

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

async function fetchContent() {
  if (!props.sourcePath) return
  loading.value = true
  try {
    const result = await window.site.getContent(props.sourcePath)
    content.value = result
  } catch (error) {
    console.error('Failed to fetch post content:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchContent()
  }
})

watch(() => props.sourcePath, () => {
  if (props.modelValue) {
    fetchContent()
  }
})
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('posts.preview')"
    width="960px"
    :close-on-click-modal="false"
    @update:modelValue="(val) => emit('update:modelValue', val)">
    <div v-loading="loading" class="preview-content">
      <div class="preview-inner">
        <MdPreview :modelValue="content" :sanitize="filterImage" />
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.preview-content {
  min-height: 400px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.preview-inner {
  max-width: 880px;
  margin: 0 auto;
  line-height: 1.6;
  font-size: 16px;
}
</style>