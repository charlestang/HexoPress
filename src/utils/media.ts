export interface ImageAssetGroup {
  key: string
  displayName: string
  representative: Asset
  assets: Asset[]
}

function hasExtension(asset: Asset, extensions: string[]) {
  const lowerPath = asset.path.toLowerCase()
  return extensions.some((ext) => lowerPath.endsWith(ext))
}

function assetName(asset: Asset) {
  const segments = asset.path.split('/')
  return segments[segments.length - 1] || asset.path
}

function getAssetNameParts(asset: Asset) {
  const name = assetName(asset)
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex === -1) {
    return {
      base: name,
      extension: '',
    }
  }
  return {
    base: name.slice(0, dotIndex),
    extension: name.slice(dotIndex + 1),
  }
}

function assetDirectory(asset: Asset) {
  const segments = asset.path.split('/')
  return segments.slice(0, -1).join('/')
}

function normalizeBaseName(baseName: string) {
  return baseName.replace(/-\d+x\d+$/i, '')
}

export function buildImageGroups(
  assets: Asset[],
  previewableExtensions: string[],
): ImageAssetGroup[] {
  const previewableAssets = assets.filter((asset) => hasExtension(asset, previewableExtensions))
  const groups = new Map<
    string,
    {
      displayName: string
      normalizedBase: string
      assets: Array<{ asset: Asset; base: string }>
    }
  >()

  previewableAssets.forEach((asset) => {
    const directory = assetDirectory(asset)
    const { base, extension } = getAssetNameParts(asset)
    const normalizedBase = normalizeBaseName(base)
    const normalizedExtension = extension.toLowerCase()
    const keyBase = normalizedExtension ? `${normalizedBase}.${normalizedExtension}` : normalizedBase
    const key = directory ? `${directory}/${keyBase}` : keyBase

    if (!groups.has(key)) {
      groups.set(key, {
        displayName: keyBase,
        normalizedBase,
        assets: [],
      })
    }

    groups.get(key)!.assets.push({ asset, base })
  })

  const result = Array.from(groups.entries())
    .map(([key, group]) => {
      if (!group.assets.length) {
        return null
      }

      group.assets.sort((a, b) => a.asset.path.localeCompare(b.asset.path))
      const representativeEntry =
        group.assets.find((entry) => entry.base === group.normalizedBase) ?? group.assets[0]

      if (!representativeEntry) {
        return null
      }

      return {
        key,
        displayName: group.displayName,
        representative: representativeEntry.asset,
        assets: group.assets.map((entry) => entry.asset),
      }
    })
    .filter((group): group is ImageAssetGroup => Boolean(group))

  return result.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
