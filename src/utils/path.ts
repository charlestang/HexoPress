import { normalizeHexoRoot } from './markdownImage'

export function computeImagePath(root: string | null | undefined, assetPath: string): string {
  const normalizedRoot = normalizeHexoRoot(root)
  const cleanAssetPath = assetPath.replace(/^\/+/, '') || 'images'

  if (normalizedRoot === '/') {
    return `/${cleanAssetPath}`
  }

  return `${normalizedRoot}${cleanAssetPath}`
}
