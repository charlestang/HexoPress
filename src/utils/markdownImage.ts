export function normalizePermalinkPath(permalink: string): string {
  if (!permalink) {
    return ''
  }
  const stripped = permalink.replace(/^https?:\/\/[^/]+\/?/i, '')
  return stripped.replace(/^\/+|\/+$/g, '')
}

export function normalizeHexoRoot(root: string | null | undefined): string {
  if (!root) {
    return '/'
  }

  const stripped = root
    .trim()
    .replace(/^https?:\/\/[^/]+\/?/i, '')
    .replace(/^\/+|\/+$/g, '')
  if (!stripped) {
    return '/'
  }

  return `/${stripped}/`
}

export function stripHexoRootPrefix(path: string, root: string | null | undefined): string {
  if (!path.startsWith('/')) {
    return path
  }

  const normalizedRoot = normalizeHexoRoot(root)
  if (normalizedRoot === '/') {
    return path
  }

  if (path === normalizedRoot.slice(0, -1)) {
    return '/'
  }

  if (path.startsWith(normalizedRoot)) {
    return `/${path.slice(normalizedRoot.length).replace(/^\/+/, '')}`
  }

  return path
}

export function joinPreviewUrl(base: string | undefined, path: string): string {
  const cleanBase = (base ?? '').replace(/\/+$/g, '')
  const cleanPath = path.replace(/^\/+/, '')
  if (!cleanBase) {
    return cleanPath
  }
  if (!cleanPath) {
    return cleanBase
  }
  return `${cleanBase}/${cleanPath}`
}

export function resolveMarkdownImageUrl(
  src: string,
  assetBaseUrl: string | undefined,
  permalink: string,
  root: string | null | undefined = '/',
): string {
  if (!src) {
    return src
  }

  if (/^(?:https?:)?\/\//i.test(src) || /^(?:data|blob):/i.test(src)) {
    return src
  }

  if (src.startsWith('/')) {
    return joinPreviewUrl(assetBaseUrl, stripHexoRootPrefix(src, root))
  }

  const currentPath = normalizePermalinkPath(permalink)
  const currentSegments = currentPath.split('/').filter(Boolean)
  const targetSegments = src.split('/').filter(Boolean)

  if (targetSegments[0] !== '.' && targetSegments[0] !== '..') {
    return joinPreviewUrl(assetBaseUrl, targetSegments.join('/'))
  }

  while (targetSegments[0] === '.') {
    targetSegments.shift()
  }

  while (currentSegments.length > 0 && targetSegments[0] === '..') {
    currentSegments.pop()
    targetSegments.shift()
  }

  return joinPreviewUrl(assetBaseUrl, [...currentSegments, ...targetSegments].join('/'))
}

export function buildImageNotFoundMessage(template: string, url: string): string {
  return template.replace('{url}', url)
}

/**
 * Encode image path for use in Markdown image syntax ![](path)
 * Handles special characters like Chinese characters, spaces, and parentheses
 * while preserving path structure (/, .., .)
 */
export function encodeMarkdownImagePath(path: string): string {
  if (!path) {
    return path
  }

  // Split path into segments
  const segments = path.split('/')

  // Encode each segment except for . and ..
  const encodedSegments = segments.map((segment) => {
    if (segment === '.' || segment === '..' || segment === '') {
      return segment
    }
    return encodeURIComponent(segment)
  })

  return encodedSegments.join('/')
}
