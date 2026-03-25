export function normalizePermalinkPath(permalink: string): string {
  if (!permalink) {
    return ''
  }
  const stripped = permalink.replace(/^https?:\/\/[^/]+\/?/i, '')
  return stripped.replace(/^\/+|\/+$/g, '')
}

function joinUrl(base: string | undefined, path: string): string {
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
): string {
  if (!src) {
    return src
  }

  if (/^(?:https?:)?\/\//i.test(src) || /^(?:data|blob):/i.test(src)) {
    return src
  }

  if (src.startsWith('/')) {
    return joinUrl(assetBaseUrl, src)
  }

  const currentPath = normalizePermalinkPath(permalink)
  const currentSegments = currentPath.split('/').filter(Boolean)
  const targetSegments = src.split('/').filter(Boolean)

  if (targetSegments[0] !== '.' && targetSegments[0] !== '..') {
    return joinUrl(assetBaseUrl, targetSegments.join('/'))
  }

  while (targetSegments[0] === '.') {
    targetSegments.shift()
  }

  while (currentSegments.length > 0 && targetSegments[0] === '..') {
    currentSegments.pop()
    targetSegments.shift()
  }

  return joinUrl(assetBaseUrl, [...currentSegments, ...targetSegments].join('/'))
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
