/**
 * This function normalize a category list for a hexo post.
 *
 * If `list` is a single string, it means that the post has only one category.
 * If `list` is a string array, it means that the post is under a hierarchies category.
 * If a post belongs to multiple categories, `list` will be an array of string array.
 * @param list string | string[] | string[][]
 */
export function normalizeList(list: string | string[] | (string | string[])[]): string[][] {
  if (typeof list === 'string') {
    return list === '' ? [] : [[list]]
  } else {
    if (list.length === 0) {
      return []
    }
    // list is array
    if (list.every(item => typeof item === 'string')) {
      // list is a string array
      const filtered = list.filter(item => item !== '')
      return filtered.length > 0 ? [filtered as string[]] : []
    } else {
      // list is a mixed array or a string array array
      const result = <string[][]>[]
      for (const ele of list) {
        if (Array.isArray(ele) && ele.length > 0) {
          result.push(ele)
        } else if (typeof ele === 'string' && ele !== '') {
          result.push([ele])
        }
      }
      return result
    }
  }
}
type CatEntry = string | string[]
export function simplifyList(list: string[][]): string | string[] | (string | string[])[] {
  if (list.length === 1) {
    if (list[0].length === 1) {
      // If the list contains only one string, return the string
      return list[0][0]
    } else {
      // If the list contains one string array, return the array
      return list[0]
    }
  } else {
    const result = <CatEntry[]>[]
    for (const ele of list) {
      if (ele.length === 1) {
        result.push(ele[0])
      } else {
        result.push(ele)
      }
    }
    return result
  }
}
