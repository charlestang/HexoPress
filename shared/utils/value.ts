export function cloneValue<T>(value: T): T {
  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as unknown as T
  }
  if (value && typeof value === 'object') {
    return { ...(value as Record<string, unknown>) } as unknown as T
  }
  return value
}

export function toDate(value: unknown): Date | undefined {
  if (value === null || typeof value === 'undefined') {
    return undefined
  }
  if (value instanceof Date) {
    return new Date(value.getTime())
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }
  if (typeof value === 'object' && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const date = (value as { toDate: () => Date }).toDate()
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date
    }
  }
  return undefined
}

export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || typeof value === 'undefined') {
    return []
  }
  const normalized = Array.isArray(value) ? value : [value]
  return normalized.map((item) => cloneValue(item))
}

export interface ToStringArrayOptions {
  filterEmpty?: boolean
}

export function toStringArray(value: unknown, options: ToStringArrayOptions = {}): string[] {
  const { filterEmpty = true } = options
  const array = toArray(value).map((item) => String(item))
  return filterEmpty ? array.filter((item) => item.length > 0) : array
}
