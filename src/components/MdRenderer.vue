<script lang="ts" setup>
import { resolveMarkdownImageUrl } from '@/utils/markdownImage'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: string
  permalink?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  permalink: '',
})

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isMoreComment(value: string): boolean {
  return /^<!--\s*more\s*-->$/i.test(value.trim())
}

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(code: string, language: string): string {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${hljs.highlight(code, { language }).value}</code></pre>`
    }
    return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`
  },
})

const renderHtmlToken = (tokens: Array<{ content?: string }>, idx: number): string => {
  const content = tokens[idx]?.content ?? ''
  if (isMoreComment(content)) {
    const label = escapeHtml(t('editor.moreDividerLabel'))
    return `<div class="mdr-more-divider" role="separator" aria-label="${label}"><span class="mdr-more-divider__label">${label}</span></div>`
  }
  return escapeHtml(content)
}

markdown.renderer.rules.html_block = renderHtmlToken
markdown.renderer.rules.html_inline = renderHtmlToken

const defaultImageRenderer = markdown.renderer.rules.image

markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const source = token?.attrGet('src') ?? ''
  const resolved = resolveMarkdownImageUrl(
    source,
    import.meta.env.VITE_ASSET_BASE_URL,
    props.permalink ?? '',
  )

  token?.attrSet('src', resolved)
  token?.attrSet('data-original-src', source)
  token?.attrSet('loading', 'lazy')

  const rendered = defaultImageRenderer
    ? defaultImageRenderer(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options)

  return `<div class="mdr-image-block" data-source="${encodeURIComponent(source)}">${rendered}</div>`
}

const renderedHtml = computed(() => {
  return markdown.render(props.modelValue ?? '')
})

function markImageBroken(block: HTMLElement, imageUrl: string) {
  const message = t('editor.imageNotFound', { url: imageUrl })
  block.classList.add('is-broken')
  block.innerHTML = `<div class="mdr-image-error">${escapeHtml(message)}</div>`
}

function bindImageFallback() {
  const container = containerRef.value
  if (!container) {
    return
  }

  const images = container.querySelectorAll<HTMLImageElement>('.mdr-image-block img')
  images.forEach((img) => {
    if (img.dataset.errorBound === '1') {
      return
    }

    img.dataset.errorBound = '1'
    const block = img.closest('.mdr-image-block') as HTMLElement | null
    if (!block) {
      return
    }

    img.addEventListener(
      'error',
      () => {
        const encodedSource = block.getAttribute('data-source')
        const sourceFromBlock = encodedSource ? decodeURIComponent(encodedSource) : ''
        const original =
          sourceFromBlock ||
          img.getAttribute('data-original-src') ||
          img.getAttribute('src') ||
          img.currentSrc ||
          ''
        markImageBroken(block, original)
      },
      { once: true },
    )
  })
}

watch(
  renderedHtml,
  () => {
    nextTick(() => bindImageFallback())
  },
  { immediate: true },
)

onMounted(() => {
  bindImageFallback()
})
</script>

<template>
  <div ref="containerRef" class="md-renderer" v-html="renderedHtml"></div>
</template>

<style scoped>
.md-renderer {
  color: #111827;
  line-height: 1.7;
}

.md-renderer :deep(pre) {
  border-radius: 8px;
  padding: 12px;
  overflow: auto;
  background: #0f172a;
  color: #e2e8f0;
}

.md-renderer :deep(code) {
  font-family: Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.md-renderer :deep(p) {
  margin: 0.8em 0;
}

.md-renderer :deep(blockquote) {
  margin: 1em 0;
  border-left: 3px solid #94a3b8;
  padding-left: 12px;
  color: #475569;
}

.md-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.md-renderer :deep(th),
.md-renderer :deep(td) {
  border: 1px solid #d1d5db;
  padding: 6px 8px;
}

.md-renderer :deep(hr) {
  border: none;
  border-top: 1px solid #d1d5db;
  margin: 1em 0;
}

.md-renderer :deep(.mdr-more-divider) {
  margin: 1.2em 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
}

.md-renderer :deep(.mdr-more-divider::before),
.md-renderer :deep(.mdr-more-divider::after) {
  content: '';
  flex: 1 1 auto;
  border-top: 1px dashed #9ca3af;
}

.md-renderer :deep(.mdr-more-divider__label) {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.md-renderer :deep(.mdr-image-block) {
  display: block;
  margin: 12px 0;
}

.md-renderer :deep(.mdr-image-block img) {
  display: block;
  max-width: 100%;
  border-radius: 6px;
}

.md-renderer :deep(.mdr-image-block.is-broken) {
  border: 1px dashed #f59e0b;
  border-radius: 8px;
  background: #fffbeb;
  padding: 10px 12px;
}

.md-renderer :deep(.mdr-image-error) {
  color: #92400e;
  font-size: 13px;
}
</style>
