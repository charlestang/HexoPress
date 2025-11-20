export function computeRelativeImagePath(permalink: string, assetPath: string): string {
  const cleanAssetPath = assetPath.replace(/^\/+/, '')
  const cleanPermalink = permalink.replace(/^\/+|\/+$/g, '')
  const segments = cleanPermalink ? cleanPermalink.split('/').filter(Boolean) : []
  const prefix = segments.map(() => '..').join('/')
  if (!prefix) {
    return cleanAssetPath || 'images'
  }
  return `${prefix}/${cleanAssetPath}`
}
