export function normalizeList(list: string | string[] | (string | string[])[]): string[][] {
  if (typeof list === 'string') {
    return list === '' ? [] : [[list]]
  }

  if (!Array.isArray(list) || list.length === 0) {
    return []
  }

  if (list.every((item): item is string => typeof item === 'string')) {
    const filtered = list.filter((item) => typeof item === 'string' && item !== '') as string[]
    return filtered.length > 0 ? [filtered] : []
  }

  return list.reduce<string[][]>((acc, item) => {
    if (Array.isArray(item)) {
      const filtered = item.filter((segment): segment is string => typeof segment === 'string' && segment !== '')
      if (filtered.length > 0) {
        acc.push(filtered)
      }
    } else if (typeof item === 'string' && item !== '') {
      acc.push([item])
    }
    return acc
  }, [])
}
