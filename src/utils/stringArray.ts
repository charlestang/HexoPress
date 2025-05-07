/**
 * This function normalize a category list for a hexo post.
 *
 * If `list` is a single string, it means that the post has only one category.
 * If `list` is a string array, it means that the post is under a hierarchies category.
 * If a post belongs to multiple categories, `list` will be an array of string array.
 * @param list string | string[] | string[][]
 */
export function normalizeList(list: string | string[] | (string | string[])[]): string[][] {
  // handle empty string case
  if (typeof list === 'string') {
    return list === '' ? [] : [[list]]
  }

  // handle empty array or illegal input case
  if (!Array.isArray(list) || list.length === 0) {
    return []
  }

  // Handle string array case
  if (list.every((item): item is string => typeof item === 'string')) {
    const filtered = list.filter(Boolean) as string[]
    return filtered.length > 0 ? [filtered] : []
  }

  // Handle mixed array case
  return list.reduce<string[][]>((acc, item) => {
    if (Array.isArray(item) ) {
      const filtered = item.filter(Boolean) as string[]
      if (filtered.length > 0) {
        acc.push(filtered)
      }
    } else if (typeof item === 'string' && item !== '') {
      acc.push([item])
    }
    return acc
  }, [])
}
